import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from pydantic import BaseModel
from api.db import get_db
from api.auth import verify_token, require_role, AuthenticatedUser, log_auth_event, apply_tenant_filter
from api.models.risk_score import RiskScore, Explanation
from api.models.asset import Asset
from api.models.asset_feature import AssetFeature
from api.models.alert import Alert
from api.models.audit_log import AuditLog
from api.models.auth_event import AuthEvent
from api.schemas.risk import RiskScoreResponse, RiskEvaluationRequest
from api.schemas.asset_feature import AssetFeatureResponse, IngestionRefreshResponse
from src.ingest import run_ingestion_pipeline
from src.rule_engine import score_all_assets, compute_rule_score
from src.ml_model import score_all_assets_ml, predict_ml_risk
from src.fusion import fuse_scores
from src.report_generator import generate_asset_report, generate_facility_report
from src.prioritize import prioritize_assets
from src.rag_retrieval import retrieve, build_query_from_factors
from src.rag_explain import generate_explanation
from src.orchestrate import run_full_pipeline

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["Risk Intelligence Pipeline"])

@router.post("/pipeline/run", status_code=status.HTTP_200_OK)
async def run_pipeline_endpoint(
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("operator", "safety_manager", "admin"))
):
    """
    Execute full RiskRadar pipeline orchestration.
    Ingestion -> Rules -> XGBoost ML -> Dual Fusion -> Alerts -> RAG Explanations -> Audit Log.
    """
    try:
        summary = await run_full_pipeline(db, user_id=user.user_id, role=user.role)
        return summary
    except Exception as e:
        await db.rollback()
        logger.error(f"Error running pipeline orchestration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pipeline execution failed: {str(e)}"
        )

@router.post("/risk/refresh-features", response_model=IngestionRefreshResponse, status_code=status.HTTP_200_OK)
async def refresh_asset_features(
    data_dir: str = "data",
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("operator", "safety_manager", "admin"))
):
    """Execute data ingestion pipeline across CSV logs & SCADA telemetry"""
    try:
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
        return IngestionRefreshResponse(
            status="success",
            assets_processed=assets_processed,
            message=f"Ingestion pipeline refreshed features for {assets_processed} assets successfully.",
            timestamp=datetime.now(timezone.utc)
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/risk/features", response_model=List[AssetFeatureResponse])
async def get_asset_features(
    db: AsyncSession = Depends(get_db)
):
    """Retrieve computed per-asset features"""
    result = await db.execute(select(AssetFeature).order_by(AssetFeature.asset_id.asc()))
    return result.scalars().all()

@router.post("/risk/score/rules", status_code=status.HTTP_200_OK)
async def score_rules_endpoint(
    db: AsyncSession = Depends(get_db)
):
    """Execute deterministic Rule Engine across all stored asset features"""
    ranked_results = await score_all_assets(db)
    return {"status": "success", "count": len(ranked_results), "results": ranked_results, "timestamp": datetime.now(timezone.utc)}

@router.post("/risk/score/ml", status_code=status.HTTP_200_OK)
async def score_ml_endpoint(
    db: AsyncSession = Depends(get_db)
):
    """Execute XGBoost ML risk classifier & SHAP feature attribution"""
    ranked_results = await score_all_assets_ml(db)
    return {"status": "success", "count": len(ranked_results), "results": ranked_results, "timestamp": datetime.now(timezone.utc)}

@router.get("/risk/ranked", status_code=status.HTTP_200_OK)
async def get_ranked_assets_endpoint(
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("inspector", "safety_manager", "admin", "auditor"))
):
    """Primary endpoint for Dashboard (Module 10). Returns ranked inspection queue."""
    stmt = select(Asset, RiskScore).join(RiskScore, Asset.id == RiskScore.asset_id)
    stmt = apply_tenant_filter(stmt, user, Asset)
    res = await db.execute(stmt)
    rows = res.all()

    if not rows:
        await score_all_assets(db)
        await score_all_assets_ml(db)
        res = await db.execute(stmt)
        rows = res.all()

    unranked_list = []
    for asset, score_record in rows:
        r_score = float(score_record.rule_score) if score_record.rule_score is not None else 0.0
        m_score = float(score_record.ml_score) if score_record.ml_score is not None else 0.0

        fused_score, fused_band, needs_review = fuse_scores(r_score, m_score)
        score_record.fused_score = fused_score
        score_record.risk_band = fused_band

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
    return {"status": "success", "count": len(ranked_queue), "results": ranked_queue, "timestamp": datetime.now(timezone.utc)}

@router.get("/risk/{asset_id}/retrieve-context", status_code=status.HTTP_200_OK)
async def retrieve_asset_sop_context(
    asset_id: int,
    top_k: int = 2,
    db: AsyncSession = Depends(get_db)
):
    """RAG Knowledge Base Context Retrieval Endpoint"""
    asset_res = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = asset_res.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Asset #{asset_id} not found.")

    feat_res = await db.execute(select(AssetFeature).where(AssetFeature.asset_id == asset_id))
    feature = feat_res.scalar_one_or_none()

    r_score, r_band, breakdown = compute_rule_score(
        days_since_last_maintenance=feature.days_since_last_maintenance if feature else 180,
        failure_count_last_12_months=feature.failure_count_last_12_months if feature else 0,
        pct_sensor_readings_out_of_range=feature.pct_sensor_readings_out_of_range if feature else 0,
        latest_inspection_severity=feature.latest_inspection_severity if feature else "none"
    )

    query = build_query_from_factors(breakdown, asset_name=asset.name)
    retrieved_sops = retrieve(query=query, top_k=top_k)

    return {
        "status": "success",
        "asset_id": asset.id,
        "asset_name": asset.name,
        "generated_query": query,
        "retrieved_sops": retrieved_sops,
        "timestamp": datetime.now(timezone.utc)
    }

@router.post("/risk/{asset_id}/explain", status_code=status.HTTP_200_OK)
async def generate_asset_explanation_endpoint(
    asset_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Grounded Explanation & Recommendation Agent Endpoint"""
    asset_res = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = asset_res.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Asset #{asset_id} not found.")

    feat_res = await db.execute(select(AssetFeature).where(AssetFeature.asset_id == asset_id))
    feature = feat_res.scalar_one_or_none()

    r_score, r_band, breakdown = compute_rule_score(
        days_since_last_maintenance=feature.days_since_last_maintenance if feature else 180,
        failure_count_last_12_months=feature.failure_count_last_12_months if feature else 0,
        pct_sensor_readings_out_of_range=feature.pct_sensor_readings_out_of_range if feature else 0,
        latest_inspection_severity=feature.latest_inspection_severity if feature else "none"
    )

    score_res = await db.execute(select(RiskScore).where(RiskScore.asset_id == asset_id).order_by(RiskScore.computed_at.desc()))
    risk_score_rec = score_res.scalars().first()

    rule_val = risk_score_rec.rule_score if risk_score_rec else r_score
    ml_val = risk_score_rec.ml_score if risk_score_rec else 0.0
    fused_val, fused_band, needs_rev = fuse_scores(rule_val, ml_val)

    breakdown["fused_score"] = fused_val
    breakdown["risk_band"] = fused_band

    query = build_query_from_factors(breakdown, asset_name=asset.name)
    retrieved_sops = retrieve(query=query, top_k=2)

    explanation_result = generate_explanation(
        asset_name=asset.name,
        factor_breakdown=breakdown,
        retrieved_snippets=retrieved_sops
    )

    if risk_score_rec:
        exp_res = await db.execute(select(Explanation).where(Explanation.risk_score_id == risk_score_rec.id))
        exp_rec = exp_res.scalar_one_or_none()

        top_snippet = retrieved_sops[0]["text"] if retrieved_sops else None
        top_title = retrieved_sops[0]["source_title"] if retrieved_sops else None

        if not exp_rec:
            exp_rec = Explanation(
                risk_score_id=risk_score_rec.id,
                explanation_text=explanation_result["explanation_text"],
                recommended_action=explanation_result["recommended_action"],
                retrieved_source_snippet=top_snippet,
                retrieved_source_title=top_title
            )
            db.add(exp_rec)
        else:
            exp_rec.explanation_text = explanation_result["explanation_text"]
            exp_rec.recommended_action = explanation_result["recommended_action"]
            exp_rec.retrieved_source_snippet = top_snippet
            exp_rec.retrieved_source_title = top_title

    await db.commit()

    return {
        "status": "success",
        "asset_id": asset.id,
        "asset_name": asset.name,
        "fused_score": fused_val,
        "risk_band": fused_band,
        "explanation": explanation_result["explanation_text"],
        "recommended_action": explanation_result["recommended_action"],
        "cited_source": explanation_result["cited_source"],
        "timestamp": datetime.now(timezone.utc)
    }

# ------------------------------------------------------------------------------
# MODULE 9 NEW ENDPOINTS: ALERTS & AUDIT TRAIL EXPORT
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# MODULE 12 RBAC & SAFETY OVERRIDE ENDPOINTS
# ------------------------------------------------------------------------------

class RiskOverrideRequest(BaseModel):
    new_band: str  # low, medium, high, critical
    justification: str

@router.post("/risk/{asset_id}/override", status_code=status.HTTP_200_OK)
async def override_risk_score_endpoint(
    asset_id: int,
    request_data: RiskOverrideRequest,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("safety_manager"))
):
    """
    Override an asset's risk band (Safety Manager ONLY).
    Requires a mandatory non-empty justification field.
    Writes an 'override' event to audit_log and auth_events.
    """
    if not request_data.justification or not request_data.justification.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Override justification text is mandatory for safety auditing."
        )

    asset_res = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = asset_res.scalar_one_or_none()
    if not asset:
        asset = Asset(
            id=asset_id,
            organization_id=user.organization_id,
            name=f"Industrial Asset #{asset_id}",
            asset_type="Equipment",
            location="Unit 1",
            consequence_score=3
        )
        db.add(asset)
        await db.commit()

    score_res = await db.execute(select(RiskScore).where(RiskScore.asset_id == asset_id))
    score_rec = score_res.scalar_one_or_none()
    if not score_rec:
        score_rec = RiskScore(asset_id=asset_id)
        db.add(score_rec)

    prev_band = score_rec.risk_band or "low"
    score_rec.risk_band = request_data.new_band.lower()
    score_rec.user_id = user.user_id
    score_rec.role = user.role

    # Query previous audit log entry hash for asset
    prev_stmt = select(AuditLog.hash).where(AuditLog.asset_id == asset_id).order_by(AuditLog.created_at.desc(), AuditLog.id.desc()).limit(1)
    prev_res = await db.execute(prev_stmt)
    prev_hash_val = prev_res.scalar_one_or_none() or "GENESIS_HASH_CHAIN_0000000000000000000000000000000000000000000"

    # Append override audit log entry
    audit_entry = AuditLog(
        organization_id=user.organization_id,
        asset_id=asset_id,
        input_data_snapshot={
            "override_event": True,
            "justification": request_data.justification,
            "previous_band": prev_band,
            "new_band": request_data.new_band.lower(),
        },
        score_breakdown={
            "override_by": user.user_id,
            "role": user.role,
            "previous_band": prev_band,
            "new_band": request_data.new_band.lower(),
            "justification": request_data.justification,
        },
        user_id=user.user_id,
        role=user.role,
        previous_hash=prev_hash_val,
        created_at=datetime.now(timezone.utc)
    )
    audit_entry.hash = audit_entry.calculate_entry_hash(prev_hash_val)
    db.add(audit_entry)

    # Log auth/security override event
    await log_auth_event(
        db=db,
        event_type="override",
        user_id=user.user_id,
        email=user.email,
    )

    await db.commit()

    return {
        "status": "success",
        "asset_id": asset.id,
        "previous_band": prev_band,
        "new_band": request_data.new_band.lower(),
        "justification": request_data.justification,
        "override_by": user.user_id,
        "role": user.role,
        "timestamp": datetime.now(timezone.utc)
    }

@router.get("/alerts", status_code=status.HTTP_200_OK)
async def get_alerts_endpoint(
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("inspector", "safety_manager", "admin", "auditor"))
):
    """Retrieve all plant safety alerts, most recent first, with acknowledged status"""
    stmt = select(Alert, Asset).join(Asset, Alert.asset_id == Asset.id).order_by(Alert.triggered_at.desc()).limit(limit)
    res = await db.execute(stmt)
    rows = res.all()

    alert_list = []
    for alert, asset in rows:
        alert_list.append({
            "alert_id": alert.id,
            "asset_id": asset.id,
            "asset_name": asset.name,
            "previous_band": alert.previous_band,
            "new_band": alert.new_band,
            "message": f"Risk Escalation Alert! {asset.name} risk band escalated from '{alert.previous_band.upper()}' to '{alert.new_band.upper()}'.",
            "acknowledged": alert.acknowledged,
            "user_id": alert.user_id,
            "role": alert.role,
            "triggered_at": alert.triggered_at
        })

    return {
        "status": "success",
        "count": len(alert_list),
        "alerts": alert_list,
        "timestamp": datetime.now(timezone.utc)
    }

@router.post("/alerts/{alert_id}/acknowledge", status_code=status.HTTP_200_OK)
async def acknowledge_alert_endpoint(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("inspector", "safety_manager"))
):
    """
    Mark a plant safety alert as acknowledged by safety operator (Inspector or Safety Manager ONLY).
    Enforces separation of duties: Admin role CANNOT acknowledge alerts.
    """
    res = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = res.scalar_one_or_none()

    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Alert #{alert_id} not found.")

    alert.acknowledged = True
    alert.user_id = user.user_id
    alert.role = user.role
    await db.commit()

    return {
        "status": "success",
        "alert_id": alert.id,
        "acknowledged": True,
        "user_id": user.user_id,
        "role": user.role,
        "message": f"Alert #{alert_id} has been marked as acknowledged.",
        "timestamp": datetime.now(timezone.utc)
    }

@router.get("/audit-log/verify/{asset_id}", status_code=status.HTTP_200_OK)
async def verify_asset_audit_integrity_endpoint(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("inspector", "safety_manager", "admin", "auditor"))
):
    """
    Tamper-Evident SHA-256 Hash Chain Integrity Verification Endpoint.
    Verifies link-by-link cryptographic integrity across all chronological audit records for an asset.
    """
    stmt = select(AuditLog).where(AuditLog.asset_id == asset_id)
    stmt = apply_tenant_filter(stmt, user, AuditLog).order_by(AuditLog.created_at.asc(), AuditLog.id.asc())
    res = await db.execute(stmt)
    entries = res.scalars().all()

    if not entries:
        return {
            "status": "success",
            "asset_id": asset_id,
            "verified": True,
            "total_records": 0,
            "chain_status": "INTACT",
            "message": "No audit records found for verification.",
            "timestamp": datetime.now(timezone.utc)
        }

    expected_prev_hash = entries[0].previous_hash if (entries and entries[0].previous_hash) else "GENESIS_HASH_CHAIN_0000000000000000000000000000000000000000000"
    for entry in entries:
        if entry.previous_hash and entry.previous_hash != expected_prev_hash:
            return {
                "status": "warning",
                "asset_id": asset_id,
                "verified": False,
                "chain_status": "CORRUPTED",
                "corrupted_record_id": entry.id,
                "message": f"Audit trail tampering detected! Record #{entry.id} previous hash link broken.",
                "timestamp": datetime.now(timezone.utc)
            }

        computed_hash = entry.calculate_entry_hash(expected_prev_hash)
        if entry.hash and entry.hash != computed_hash:
            return {
                "status": "warning",
                "asset_id": asset_id,
                "verified": False,
                "chain_status": "CORRUPTED",
                "corrupted_record_id": entry.id,
                "message": f"Audit trail tampering detected! Record #{entry.id} content payload hash mismatch.",
                "timestamp": datetime.now(timezone.utc)
            }

        expected_prev_hash = entry.hash or computed_hash

    return {
        "status": "success",
        "asset_id": asset_id,
        "verified": True,
        "total_records": len(entries),
        "chain_status": "INTACT",
        "message": f"Audit trail SHA-256 hash chain verified successfully ({len(entries)} records). No tampering detected.",
        "timestamp": datetime.now(timezone.utc)
    }

@router.get("/audit-log/{asset_id}", status_code=status.HTTP_200_OK)
async def get_asset_audit_log_endpoint(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("inspector", "safety_manager", "admin", "auditor"))
):
    """Retrieve full append-only audit trail for one asset in chronological order"""
    asset_stmt = select(Asset).where(Asset.id == asset_id)
    asset_stmt = apply_tenant_filter(asset_stmt, user, Asset)
    asset_res = await db.execute(asset_stmt)
    asset = asset_res.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Asset #{asset_id} not found.")

    stmt = select(AuditLog).where(AuditLog.asset_id == asset_id)
    stmt = apply_tenant_filter(stmt, user, AuditLog).order_by(AuditLog.created_at.asc())
    res = await db.execute(stmt)
    entries = res.scalars().all()

    audit_records = []
    for entry in entries:
        audit_records.append({
            "audit_id": entry.id,
            "asset_id": entry.asset_id,
            "input_data_snapshot": entry.input_data_snapshot,
            "score_breakdown": entry.score_breakdown,
            "user_id": entry.user_id,
            "role": entry.role,
            "previous_hash": entry.previous_hash,
            "hash": entry.hash,
            "created_at": entry.created_at
        })

    return {
        "status": "success",
        "asset_id": asset.id,
        "asset_name": asset.name,
        "audit_count": len(audit_records),
        "audit_trail": audit_records,
        "timestamp": datetime.now(timezone.utc)
    }

@router.get("/audit-log/{asset_id}/export", status_code=status.HTTP_200_OK)
async def export_asset_audit_log_endpoint(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("inspector", "safety_manager", "admin", "auditor"))
):
    """Export complete audit trail as a downloadable JSON file attachment ('Trust Requires a Trail')"""
    audit_data = await get_asset_audit_log_endpoint(asset_id=asset_id, db=db, user=user)
    
    filename = f"risk_radar_audit_trail_asset_{asset_id}.json"
    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"'
    }
    return JSONResponse(content=jsonable_encoder(audit_data), headers=headers)

@router.get("/auth-events", status_code=status.HTTP_200_OK)
async def get_auth_events_endpoint(
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("admin", "auditor"))
):
    """Retrieve identity and session security logs (Admin & Auditor ONLY)"""
    stmt = select(AuthEvent)
    stmt = apply_tenant_filter(stmt, user, AuthEvent).order_by(AuthEvent.timestamp.desc()).limit(limit)
    res = await db.execute(stmt)
    events = res.scalars().all()

    return {
        "status": "success",
        "count": len(events),
        "auth_events": [
            {
                "id": ev.id,
                "timestamp": ev.timestamp,
                "user_id": ev.user_id,
                "email": ev.email,
                "event_type": ev.event_type,
                "ip_address": ev.ip_address,
            }
            for ev in events
        ],
        "timestamp": datetime.now(timezone.utc)
    }

@router.get("/risk/{asset_id}/export-pdf", status_code=status.HTTP_200_OK)
async def export_asset_pdf_endpoint(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("inspector", "safety_manager", "admin", "auditor"))
):
    """
    Downloads printable PDF safety report for a specific asset.
    Includes factor breakdown, RAG SOP grounded explanation, and audit trail history.
    Logs export event in audit trail.
    """
    asset_stmt = select(Asset).where(Asset.id == asset_id)
    asset_stmt = apply_tenant_filter(asset_stmt, user, Asset)
    asset_res = await db.execute(asset_stmt)
    asset = asset_res.scalar_one_or_none()
    if not asset:
        asset = Asset(
            id=asset_id,
            organization_id=user.organization_id,
            name=f"Industrial Asset #{asset_id}",
            asset_type="Equipment",
            location="Unit 1",
            consequence_score=3
        )
        db.add(asset)
        await db.commit()

    try:
        pdf_bytes = await generate_asset_report(db=db, asset_id=asset_id)
    except Exception as e:
        logger.error(f"Failed to generate asset PDF report: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate asset PDF report: {str(e)}")

    # Log export event in audit trail
    prev_stmt = select(AuditLog.hash).where(AuditLog.asset_id == asset_id).order_by(AuditLog.created_at.desc(), AuditLog.id.desc()).limit(1)
    prev_res = await db.execute(prev_stmt)
    prev_hash = prev_res.scalar_one_or_none() or "GENESIS_HASH_CHAIN_0000000000000000000000000000000000000000000"

    audit_entry = AuditLog(
        organization_id=user.organization_id,
        asset_id=asset_id,
        input_data_snapshot={"export_type": "single_asset_pdf", "asset_name": asset.name},
        score_breakdown={"export_by": user.user_id, "role": user.role},
        user_id=user.user_id,
        role=user.role,
        previous_hash=prev_hash,
        created_at=datetime.now(timezone.utc)
    )
    audit_entry.hash = audit_entry.calculate_entry_hash(prev_hash)
    db.add(audit_entry)
    await db.commit()

    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    clean_name = asset.name.lower().replace(" ", "_").replace("#", "")
    filename = f"riskradar_{clean_name}_{date_str}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/reports/facility-export-pdf", status_code=status.HTTP_200_OK)
async def export_facility_pdf_endpoint(
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("inspector", "safety_manager", "admin", "auditor"))
):
    """
    Downloads multi-page consolidated facility PDF report covering all flagged (medium/high) assets.
    Includes executive summary stats and detailed inspection sections.
    Logs export event in audit trail.
    """
    try:
        pdf_bytes = await generate_facility_report(db=db, organization_id=user.organization_id)
    except Exception as e:
        logger.error(f"Failed to generate facility PDF report: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate facility PDF report: {str(e)}")

    # Log export event
    prev_stmt = select(AuditLog.hash).order_by(AuditLog.created_at.desc(), AuditLog.id.desc()).limit(1)
    prev_res = await db.execute(prev_stmt)
    prev_hash = prev_res.scalar_one_or_none() or "GENESIS_HASH_CHAIN_0000000000000000000000000000000000000000000"

    audit_entry = AuditLog(
        organization_id=user.organization_id,
        asset_id=1,
        input_data_snapshot={"export_type": "consolidated_facility_pdf"},
        score_breakdown={"export_by": user.user_id, "role": user.role},
        user_id=user.user_id,
        role=user.role,
        previous_hash=prev_hash,
        created_at=datetime.now(timezone.utc)
    )
    audit_entry.hash = audit_entry.calculate_entry_hash(prev_hash)
    db.add(audit_entry)
    await db.commit()

    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    filename = f"riskradar_facility_summary_{date_str}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
