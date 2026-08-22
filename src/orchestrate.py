import os
import sys
import time
import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from api.db import init_db, AsyncSessionLocal
from api.models.asset import Asset
from api.models.asset_feature import AssetFeature
from api.models.risk_score import RiskScore, Explanation
from api.models.alert import Alert
from api.models.audit_log import AuditLog
from src.ingest import run_ingestion_pipeline
from src.rule_engine import score_all_assets, compute_rule_score
from src.ml_model import score_all_assets_ml, predict_ml_risk
from src.fusion import fuse_scores
from src.prioritize import prioritize_assets
from src.rag_retrieval import retrieve, build_query_from_factors
from src.rag_explain import generate_explanation

logger = logging.getLogger(__name__)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

BAND_HIERARCHY = {"low": 1, "medium": 2, "high": 3, "critical": 4}

async def run_full_pipeline(
    db: AsyncSession,
    data_dir: str = "data",
    user_id: Optional[str] = None,
    role: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Orchestrate full end-to-end RiskRadar intelligence pipeline:
    1. Ingestion -> 2. Rule Engine -> 3. XGBoost ML -> 4. Dual Fusion -> 5. Escalation Alerts -> 6. RAG Explanations.
    
    Why:
    Combines Modules 3-8 into a single unified pipeline execution, detecting risk band escalations
    (low -> medium -> high), inserting alert records, generating grounded SOP explanations for flagged assets,
    and logging append-only audit traces.
    """
    start_time = time.time()
    await init_db()
    logger.info("==========================================================================")
    logger.info("       STARTING RISK RADAR FULL END-TO-END PIPELINE ORCHESTRATION         ")
    logger.info("==========================================================================")

    # --------------------------------------------------------------------------
    # STAGE 1: Data Ingestion Pipeline (Module 3)
    # --------------------------------------------------------------------------
    logger.info("STAGE 1: Ingesting raw CSV telemetry and maintenance logs...")
    df_features = run_ingestion_pipeline(data_dir=data_dir)
    
    assets_processed = 0
    for _, row in df_features.iterrows():
        asset_id = int(row["asset_id"])

        res = await db.execute(select(Asset).where(Asset.id == asset_id))
        asset = res.scalar_one_or_none()
        if not asset:
            asset = Asset(
                id=asset_id,
                name=f"Industrial Asset #{asset_id}",
                asset_type="Equipment Unit",
                location="Plant Main Deck",
                consequence_score=3
            )
            db.add(asset)
            await db.commit()

        feat_res = await db.execute(select(AssetFeature).where(AssetFeature.asset_id == asset_id))
        feature = feat_res.scalar_one_or_none()
        if not feature:
            feature = AssetFeature(asset_id=asset_id)
            db.add(feature)

        feature.days_since_last_maintenance = float(row["days_since_last_maintenance"])
        feature.failure_count_last_12_months = int(row["failure_count_last_12_months"])
        feature.latest_inspection_severity = str(row["latest_inspection_severity"])
        feature.pct_sensor_readings_out_of_range = float(row["pct_sensor_readings_out_of_range"])
        feature.incident_count = int(row["incident_count"])
        feature.updated_at = datetime.now(timezone.utc)
        assets_processed += 1

    await db.commit()

    # --------------------------------------------------------------------------
    # STAGE 2: Rule Engine Scoring (Module 4)
    # --------------------------------------------------------------------------
    logger.info("STAGE 2: Executing deterministic Rule Engine scoring...")
    await score_all_assets(db)

    # --------------------------------------------------------------------------
    # STAGE 3: XGBoost ML & SHAP Explainability Scoring (Module 5)
    # --------------------------------------------------------------------------
    logger.info("STAGE 3: Executing XGBoost ML Risk Classifier & SHAP attribution...")
    await score_all_assets_ml(db)

    # --------------------------------------------------------------------------
    # STAGE 4 & 5: Fusion, Risk Escalation Alerts, & Prioritization (Module 6)
    # --------------------------------------------------------------------------
    logger.info("STAGE 4 & 5: Evaluating Dual Fusion, Escalation Alerts & Consequence Prioritization...")
    stmt = select(Asset, RiskScore).join(RiskScore, Asset.id == RiskScore.asset_id)
    res = await db.execute(stmt)
    rows = res.all()

    unranked_list = []
    alerts_created = 0

    for asset, score_record in rows:
        prev_band = score_record.risk_band or "low"

        r_score = float(score_record.rule_score) if score_record.rule_score is not None else 0.0
        m_score = float(score_record.ml_score) if score_record.ml_score is not None else 0.0

        fused_score, fused_band, needs_review = fuse_scores(r_score, m_score)

        # Detect Risk Band Escalation (e.g. low -> medium, medium -> high, low -> high)
        prev_rank = BAND_HIERARCHY.get(prev_band.lower(), 1)
        new_rank = BAND_HIERARCHY.get(fused_band.lower(), 1)

        if new_rank > prev_rank or score_record.fused_score == 0.0:
            alert_msg = f"Risk Escalation Alert! {asset.name} risk band escalated from '{prev_band.upper()}' to '{fused_band.upper()}' (Fused Score: {fused_score:.1f}/100)."
            new_alert = Alert(
                asset_id=asset.id,
                previous_band=prev_band,
                new_band=fused_band,
                acknowledged=False,
                user_id=user_id,
                role=role,
                triggered_at=datetime.now(timezone.utc)
            )
            db.add(new_alert)
            alerts_created += 1

        score_record.fused_score = fused_score
        score_record.risk_band = fused_band
        score_record.user_id = user_id
        score_record.role = role

        unranked_list.append({
            "asset_id": asset.id,
            "asset_name": asset.name,
            "asset_type": asset.asset_type,
            "location": asset.location,
            "rule_score": r_score,
            "ml_score": m_score,
            "fused_score": fused_score,
            "risk_band": fused_band,
            "consequence_score": asset.consequence_score,
            "needs_review": needs_review,
        })

    await db.commit()

    ranked_queue = prioritize_assets(unranked_list)

    # --------------------------------------------------------------------------
    # STAGE 6: RAG Context Retrieval & Grounded AI Explanations (Modules 7 & 8)
    # --------------------------------------------------------------------------
    logger.info("STAGE 6: Generating RAG SOP Context & Grounded Explanations for Flagged Assets...")
    final_summary_list = []

    for item in ranked_queue:
        asset_id = item["asset_id"]
        band = item["risk_band"]

        # Process medium/high flagged assets
        feat_res = await db.execute(select(AssetFeature).where(AssetFeature.asset_id == asset_id))
        feature = feat_res.scalar_one_or_none()

        r_score, r_band, breakdown = compute_rule_score(
            days_since_last_maintenance=feature.days_since_last_maintenance if feature else 180,
            failure_count_last_12_months=feature.failure_count_last_12_months if feature else 0,
            pct_sensor_readings_out_of_range=feature.pct_sensor_readings_out_of_range if feature else 0,
            latest_inspection_severity=feature.latest_inspection_severity if feature else "none"
        )
        breakdown["fused_score"] = item["fused_score"]
        breakdown["risk_band"] = item["risk_band"]

        query = build_query_from_factors(breakdown, asset_name=item["asset_name"])
        retrieved_sops = retrieve(query=query, top_k=2)

        exp_result = generate_explanation(
            asset_name=item["asset_name"],
            factor_breakdown=breakdown,
            retrieved_snippets=retrieved_sops
        )

        score_res = await db.execute(select(RiskScore).where(RiskScore.asset_id == asset_id).order_by(RiskScore.computed_at.desc()))
        risk_score_rec = score_res.scalars().first()

        if risk_score_rec:
            top_snippet = retrieved_sops[0]["text"] if retrieved_sops else None
            top_title = retrieved_sops[0]["source_title"] if retrieved_sops else None

            # Fetch existing explanation by risk_score_id
            exp_stmt = select(Explanation).where(Explanation.risk_score_id == risk_score_rec.id)
            exp_res = await db.execute(exp_stmt)
            exp_rec = exp_res.scalar_one_or_none()

            if exp_rec:
                exp_rec.explanation_text = exp_result["explanation_text"]
                exp_rec.recommended_action = exp_result["recommended_action"]
                exp_rec.retrieved_source_snippet = top_snippet
                exp_rec.retrieved_source_title = top_title
            else:
                try:
                    exp_rec = Explanation(
                        risk_score_id=risk_score_rec.id,
                        explanation_text=exp_result["explanation_text"],
                        recommended_action=exp_result["recommended_action"],
                        retrieved_source_snippet=top_snippet,
                        retrieved_source_title=top_title
                    )
                    db.add(exp_rec)
                    await db.flush()
                except Exception:
                    await db.rollback()
                    # Re-query existing explanation if flush failed due to race/duplicate
                    exp_res = await db.execute(select(Explanation).where(Explanation.risk_score_id == risk_score_rec.id))
                    exp_rec = exp_res.scalar_one_or_none()
                    if exp_rec:
                        exp_rec.explanation_text = exp_result["explanation_text"]
                        exp_rec.recommended_action = exp_result["recommended_action"]
                exp_rec.retrieved_source_title = top_title

            # Query previous audit log entry hash for asset
            prev_stmt = select(AuditLog.hash).where(AuditLog.asset_id == asset_id).order_by(AuditLog.created_at.desc(), AuditLog.id.desc()).limit(1)
            prev_res = await db.execute(prev_stmt)
            prev_hash_val = prev_res.scalar_one_or_none() or "GENESIS_HASH_CHAIN_0000000000000000000000000000000000000000000"

            # Write immutable AuditLog record
            audit_entry = AuditLog(
                organization_id=1,
                asset_id=asset_id,
                input_data_snapshot={
                    "factor_breakdown": breakdown,
                    "retrieved_source": top_title or "None"
                },
                score_breakdown={
                    "rule_score": item["rule_score"],
                    "ml_score": item["ml_score"],
                    "fused_score": item["fused_score"],
                    "priority_score": item["priority_score"],
                    "explanation": exp_result["explanation_text"],
                    "recommended_action": exp_result["recommended_action"],
                    "cited_source": exp_result["cited_source"]
                },
                user_id=user_id,
                role=role,
                previous_hash=prev_hash_val,
                created_at=datetime.now(timezone.utc)
            )
            audit_entry.hash = audit_entry.calculate_entry_hash(prev_hash_val)
            db.add(audit_entry)

        item["recommended_action"] = exp_result["recommended_action"]
        item["cited_source"] = exp_result["cited_source"]
        item["explanation"] = exp_result["explanation_text"]
        final_summary_list.append(item)

    await db.commit()
    elapsed = round(time.time() - start_time, 2)

    # --------------------------------------------------------------------------
    # PRINT END-TO-END FINAL SUMMARY TABLE
    # --------------------------------------------------------------------------
    print("\n==================================================================================================================================")
    print("                      RISK RADAR FULL PIPELINE ORCHESTRATION - END-TO-END SUMMARY                                                 ")
    print("==================================================================================================================================")
    print(f"{'Rank':<5} | {'ID':<4} | {'Asset Name':<38} | {'Rule':<6} | {'ML':<6} | {'Fused':<6} | {'Band':<6} | {'Priority':<8} | {'Action':<10} | {'Alert'}")
    print("-" * 130)
    for res in final_summary_list:
        alert_str = "⚠️ ESCALATED" if alerts_created > 0 else "OK"
        print(f"{res['rank']:<5} | {res['asset_id']:<4} | {res['asset_name']:<38} | {res['rule_score']:<6.1f} | {res['ml_score']:<6.1f} | {res['fused_score']:<6.1f} | {res['risk_band'].upper():<6} | {res['priority_score']:<8.1f} | {res['recommended_action'].upper():<10} | {alert_str}")
    print("==================================================================================================================================")
    print(f"Pipeline Execution Complete: {assets_processed} Assets Processed, {alerts_created} Alerts Raised in {elapsed}s.\n")

    return {
        "status": "success",
        "assets_processed": assets_processed,
        "alerts_created": alerts_created,
        "processing_time_seconds": elapsed,
        "ranked_summary": final_summary_list,
        "timestamp": datetime.now(timezone.utc)
    }

async def _main():
    """CLI script runner for python -m src.orchestrate"""
    async with AsyncSessionLocal() as session:
        await run_full_pipeline(session)

if __name__ == "__main__":
    asyncio.run(_main())
