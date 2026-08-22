import os
import sys
import logging
from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime, timezone
import pandas as pd
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Configure module logger
logger = logging.getLogger(__name__)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# ==============================================================================
# CONFIGURABLE FACTOR WEIGHTS (Must sum to 1.0)
# ==============================================================================
WEIGHT_MAINTENANCE_RECENCY: float = 0.30  # Recency of maintenance & service delay
WEIGHT_FAILURE_HISTORY: float = 0.30      # Emergency failure repairs in last 12 months
WEIGHT_SENSOR_DEVIATION: float = 0.25     # SCADA telemetry percentage out-of-range
WEIGHT_INSPECTION_SEVERITY: float = 0.15  # Physical inspection finding severity level

# Verify total weight equals 1.0
TOTAL_WEIGHT = WEIGHT_MAINTENANCE_RECENCY + WEIGHT_FAILURE_HISTORY + WEIGHT_SENSOR_DEVIATION + WEIGHT_INSPECTION_SEVERITY
assert abs(TOTAL_WEIGHT - 1.0) < 1e-6, "Rule engine weights must sum to 1.0"

# ==============================================================================
# SENSENCE NORMALIZATION CAPS & RANGES
# ==============================================================================
# 180+ days elapsed since maintenance is capped at max risk contribution (1.0).
# Rationale: Equipment operating 6+ months past service schedule exhibits exponential wear.
CAP_DAYS_OVERDUE: float = 180.0

# 3+ emergency failure repairs in last 12 months capped at max risk (1.0).
# Rationale: Assets experiencing repeated annual failures indicate severe mechanical degradation.
CAP_FAILURE_COUNT: float = 3.0

# 100% telemetry out-of-range capped at max risk (1.0).
# Rationale: Percentage of anomalous telemetry readings scaled linearly from 0% to 100%.
CAP_SENSOR_DEVIATION: float = 100.0

# Discrete mapping for physical inspection severity ratings
SEVERITY_SCORES: Dict[str, float] = {
    "none": 0.0,
    "low": 0.25,
    "medium": 0.50,
    "high": 0.85,
    "critical": 1.0,
}

def normalize_maintenance_recency(days: float) -> float:
    """
    Normalize days since last maintenance on a 0.0 to 1.0 scale.
    
    Why:
    Scaled linearly up to 180 days. Beyond 180 days, risk contribution is capped at 1.0.
    Handles NaN/missing values by returning default median risk 0.5 (90 days).
    """
    if pd.isna(days) or days is None:
        return 0.5
    try:
        val = float(days)
        val = max(0.0, val)
        return min(1.0, val / CAP_DAYS_OVERDUE)
    except (ValueError, TypeError):
        return 0.5

def normalize_failure_history(count: int) -> float:
    """
    Normalize annual emergency failure repair count on a 0.0 to 1.0 scale.
    
    Why:
    Scaled linearly up to 3 failures per year. 3+ failures equals maximum risk score 1.0.
    Handles NaN/None gracefully by returning 0.0.
    """
    if pd.isna(count) or count is None:
        return 0.0
    try:
        val = float(count)
        val = max(0.0, val)
        return min(1.0, val / CAP_FAILURE_COUNT)
    except (ValueError, TypeError):
        return 0.0

def normalize_sensor_deviation(pct: float) -> float:
    """
    Normalize percentage of out-of-range sensor readings on a 0.0 to 1.0 scale.
    
    Why:
    Input percentage (0-100%) mapped directly to 0.0-1.0 interval.
    Missing sensor data falls back to baseline 0.0.
    """
    if pd.isna(pct) or pct is None:
        return 0.0
    try:
        val = float(pct)
        val = max(0.0, min(100.0, val))
        return val / CAP_SENSOR_DEVIATION
    except (ValueError, TypeError):
        return 0.0

def normalize_inspection_severity(severity_str: str) -> float:
    """
    Map textual physical inspection finding severity to a 0.0 to 1.0 scale.
    
    Why:
    Inspection reports contain discrete findings ('none', 'low', 'medium', 'high', 'critical').
    Provides explicit numeric risk contribution for each physical severity tier.
    """
    if not severity_str or pd.isna(severity_str):
        return 0.0
    sev_clean = str(severity_str).strip().lower()
    return SEVERITY_SCORES.get(sev_clean, 0.0)

def classify_risk_band(score: float) -> str:
    """
    Map computed numeric rule score (0-100) to a qualitative risk band.
    
    Why:
    Provides immediate visual prioritization for plant safety operators.
    - 0 to 33: low risk
    - 34 to 66: medium risk
    - 67 to 100: high risk
    """
    if score >= 67.0:
        return "high"
    elif score >= 34.0:
        return "medium"
    else:
        return "low"

def compute_rule_score(
    days_since_last_maintenance: Optional[float],
    failure_count_last_12_months: Optional[int],
    pct_sensor_readings_out_of_range: Optional[float],
    latest_inspection_severity: Optional[str]
) -> Tuple[float, str, Dict[str, Any]]:
    """
    Calculate deterministic weighted risk score (0-100) and factor breakdown.
    
    Why:
    Fuses 4 operational risk signals into a single transparent, audit-traceable risk score.
    Returns the final score, qualitative risk band, and structured factor breakdown dictionary.
    """
    norm_maint = normalize_maintenance_recency(days_since_last_maintenance)
    norm_failure = normalize_failure_history(failure_count_last_12_months)
    norm_sensor = normalize_sensor_deviation(pct_sensor_readings_out_of_range)
    norm_insp = normalize_inspection_severity(latest_inspection_severity)

    contrib_maint = WEIGHT_MAINTENANCE_RECENCY * norm_maint
    contrib_failure = WEIGHT_FAILURE_HISTORY * norm_failure
    contrib_sensor = WEIGHT_SENSOR_DEVIATION * norm_sensor
    contrib_insp = WEIGHT_INSPECTION_SEVERITY * norm_insp

    total_norm = contrib_maint + contrib_failure + contrib_sensor + contrib_insp
    rule_score = round(min(100.0, max(0.0, total_norm * 100.0)), 2)

    risk_band = classify_risk_band(rule_score)

    factor_breakdown = {
        "rule_score": rule_score,
        "risk_band": risk_band,
        "factors": {
            "maintenance_recency": {
                "raw_value": days_since_last_maintenance,
                "normalized_value": round(norm_maint, 4),
                "weight": WEIGHT_MAINTENANCE_RECENCY,
                "weighted_contribution": round(contrib_maint * 100.0, 2)
            },
            "failure_history": {
                "raw_value": failure_count_last_12_months,
                "normalized_value": round(norm_failure, 4),
                "weight": WEIGHT_FAILURE_HISTORY,
                "weighted_contribution": round(contrib_failure * 100.0, 2)
            },
            "sensor_deviation": {
                "raw_value": pct_sensor_readings_out_of_range,
                "normalized_value": round(norm_sensor, 4),
                "weight": WEIGHT_SENSOR_DEVIATION,
                "weighted_contribution": round(contrib_sensor * 100.0, 2)
            },
            "inspection_severity": {
                "raw_value": latest_inspection_severity,
                "normalized_value": round(norm_insp, 4),
                "weight": WEIGHT_INSPECTION_SEVERITY,
                "weighted_contribution": round(contrib_insp * 100.0, 2)
            }
        }
    }

    return rule_score, risk_band, factor_breakdown

async def score_all_assets(db: AsyncSession) -> List[Dict[str, Any]]:
    """
    Score all assets in asset_features table and write results into risk_scores & audit_log tables.
    
    Why:
    Reads computed feature vectors from Module 3, executes the deterministic rule engine,
    persists risk_score records, appends immutable audit trace snapshots, and returns ranked asset risk results.
    """
    from api.models.asset_feature import AssetFeature
    from api.models.asset import Asset
    from api.models.risk_score import RiskScore
    from api.models.audit_log import AuditLog

    # 1. Fetch feature records with associated asset info
    stmt = select(AssetFeature, Asset).join(Asset, AssetFeature.asset_id == Asset.id)
    result = await db.execute(stmt)
    rows = result.all()

    scored_results = []

    for feature, asset in rows:
        rule_score, risk_band, breakdown = compute_rule_score(
            days_since_last_maintenance=feature.days_since_last_maintenance,
            failure_count_last_12_months=feature.failure_count_last_12_months,
            pct_sensor_readings_out_of_range=feature.pct_sensor_readings_out_of_range,
            latest_inspection_severity=feature.latest_inspection_severity
        )

        # Create or update RiskScore DB record
        risk_score_record = RiskScore(
            asset_id=asset.id,
            rule_score=rule_score,
            ml_score=0.0,  # ML scoring added in Module 5
            fused_score=rule_score,  # Set fused score = rule_score for now
            risk_band=risk_band,
            computed_at=datetime.now(timezone.utc)
        )
        db.add(risk_score_record)

        # Create append-only AuditLog snapshot record
        audit_entry = AuditLog(
            asset_id=asset.id,
            input_data_snapshot={
                "days_since_last_maintenance": feature.days_since_last_maintenance,
                "failure_count_last_12_months": feature.failure_count_last_12_months,
                "pct_sensor_readings_out_of_range": feature.pct_sensor_readings_out_of_range,
                "latest_inspection_severity": feature.latest_inspection_severity,
                "incident_count": feature.incident_count,
            },
            score_breakdown=breakdown,
            created_at=datetime.now(timezone.utc)
        )
        db.add(audit_entry)

        scored_results.append({
            "asset_id": asset.id,
            "asset_name": asset.name,
            "rule_score": rule_score,
            "risk_band": risk_band,
            "consequence_score": asset.consequence_score,
            "factor_breakdown": breakdown
        })

    await db.commit()

    # Sort results by rule_score descending (Ranked)
    scored_results.sort(key=lambda x: x["rule_score"], reverse=True)

    # Print clean console summary table
    print("\n==========================================================================")
    print("           RISK RADAR RULE ENGINE - RANKED ASSET RISK SCORES              ")
    print("==========================================================================")
    print(f"{'Asset ID':<10} | {'Asset Name':<45} | {'Score':<8} | {'Risk Band':<10}")
    print("-" * 80)
    for res in scored_results:
        print(f"{res['asset_id']:<10} | {res['asset_name']:<45} | {res['rule_score']:<8.2f} | {res['risk_band'].upper():<10}")
    print("==========================================================================\n")

    return scored_results
