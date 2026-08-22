import os
import sys
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Tuple, List, Optional
import numpy as np
import pandas as pd
import xgboost as xgb
import shap
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

# Directory path for model persistence
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
MODEL_PATH = os.path.join(MODEL_DIR, "ml_risk_model.json")

# Feature columns used for training and prediction
FEATURE_NAMES = [
    "days_since_last_maintenance",
    "failure_count_last_12_months",
    "pct_sensor_readings_out_of_range",
    "inspection_severity_encoded",
    "incident_count",
]

SEVERITY_ENCODING = {
    "none": 0.0,
    "low": 1.0,
    "medium": 2.0,
    "high": 3.0,
    "critical": 4.0,
}

# Global cached instances
_GLOBAL_MODEL: Optional[xgb.XGBClassifier] = None
_GLOBAL_EXPLAINER: Optional[shap.TreeExplainer] = None

def encode_inspection_severity(severity_str: str) -> float:
    """Map inspection severity text to numeric integer encoding for ML model input"""
    if not severity_str or pd.isna(severity_str):
        return 0.0
    sev_clean = str(severity_str).strip().lower()
    return SEVERITY_ENCODING.get(sev_clean, 0.0)

def generate_bootstrapped_training_data(n_samples: int = 250) -> Tuple[pd.DataFrame, np.ndarray]:
    """
    Generate a realistic bootstrapped industrial risk dataset for model training.
    
    Why (Hackathon Simplification):
    Real industrial plants accumulate years of SCADA sensor telemetry and failure events.
    For this hackathon prototype, we bootstrap 250 synthetic equipment samples derived
    from realistic distributions of maintenance recency, failure counts, telemetry deviations,
    and inspection severity findings to train the XGBoost classifier.
    """
    np.random.seed(42)

    days_maint = np.random.uniform(0.0, 365.0, n_samples)
    failure_counts = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.60, 0.25, 0.10, 0.05])
    sensor_deviations = np.random.uniform(0.0, 100.0, n_samples)
    insp_severities = np.random.choice([0.0, 1.0, 2.0, 3.0, 4.0], size=n_samples, p=[0.35, 0.30, 0.20, 0.10, 0.05])
    incident_counts = np.random.choice([0, 1, 2], size=n_samples, p=[0.70, 0.20, 0.10])

    X = pd.DataFrame({
        "days_since_last_maintenance": days_maint,
        "failure_count_last_12_months": failure_counts,
        "pct_sensor_readings_out_of_range": sensor_deviations,
        "inspection_severity_encoded": insp_severities,
        "incident_count": incident_counts,
    })

    # Ground truth failure risk label y:
    # 1 = High Equipment Failure Risk, 0 = Normal/Low Risk
    y = np.zeros(n_samples, dtype=int)
    for i in range(n_samples):
        risk_score_approx = (
            (days_maint[i] / 180.0) * 30.0 +
            (failure_counts[i] / 3.0) * 30.0 +
            (sensor_deviations[i] / 100.0) * 25.0 +
            (insp_severities[i] / 4.0) * 15.0
        )
        if risk_score_approx > 45.0 or failure_counts[i] >= 2 or (incident_counts[i] >= 1 and sensor_deviations[i] > 50.0):
            y[i] = 1

    return X, y

def train_and_save_model() -> Tuple[xgb.XGBClassifier, shap.TreeExplainer]:
    """
    Train an XGBoost classifier with cost-sensitive weighting and initialize SHAP TreeExplainer.
    
    Why:
    Uses scale_pos_weight = 4.0 to heavily penalize False Negatives (missing a critical equipment failure).
    In B2B industrial SaaS, a false alarm costs ~$50 in inspector time, whereas an unflagged
    catastrophic failure costs $100,000+ in emergency downtime and worker safety hazards.
    """
    os.makedirs(MODEL_DIR, exist_ok=True)
    X_train, y_train = generate_bootstrapped_training_data(n_samples=300)

    # Calculate scale_pos_weight = (negative samples / positive samples) * 1.5
    neg_count = np.sum(y_train == 0)
    pos_count = np.sum(y_train == 1)
    scale_pos_weight = float(neg_count / max(1, pos_count)) * 1.5

    logger.info(f"Training XGBoost Risk Classifier (Cost-Sensitive scale_pos_weight={scale_pos_weight:.2f})...")

    model = xgb.XGBClassifier(
        n_estimators=60,
        max_depth=3,
        learning_rate=0.08,
        scale_pos_weight=scale_pos_weight, # Cost-sensitive risk penalty
        random_state=42,
        eval_metric="logloss"
    )
    model.fit(X_train, y_train)

    # Save trained XGBoost model to JSON file on disk
    model.save_model(MODEL_PATH)
    logger.info(f"XGBoost model successfully saved to disk at '{MODEL_PATH}'.")

    # Initialize SHAP TreeExplainer
    explainer = shap.TreeExplainer(model)
    return model, explainer

def load_or_train_model(force_retrain: bool = False) -> Tuple[xgb.XGBClassifier, shap.TreeExplainer]:
    """
    Load cached XGBoost model from disk or train fresh if missing.
    
    Why:
    Prevents expensive model re-training on every API request.
    """
    global _GLOBAL_MODEL, _GLOBAL_EXPLAINER

    if _GLOBAL_MODEL is not None and _GLOBAL_EXPLAINER is not None and not force_retrain:
        return _GLOBAL_MODEL, _GLOBAL_EXPLAINER

    if os.path.exists(MODEL_PATH) and not force_retrain:
        try:
            logger.info(f"Loading cached XGBoost model from '{MODEL_PATH}'...")
            model = xgb.XGBClassifier()
            model.load_model(MODEL_PATH)
            explainer = shap.TreeExplainer(model)
            _GLOBAL_MODEL = model
            _GLOBAL_EXPLAINER = explainer
            return model, explainer
        except Exception as e:
            logger.warning(f"Failed to load model from disk ({e}). Training fresh model...")

    model, explainer = train_and_save_model()
    _GLOBAL_MODEL = model
    _GLOBAL_EXPLAINER = explainer
    return model, explainer

def predict_ml_risk(feature_dict: Dict[str, Any]) -> Tuple[float, str, Dict[str, Any]]:
    """
    Predict machine-learning risk score (0-100), risk band, and SHAP feature attributions.
    
    Why:
    Computes XGBoost failure probability and applies SHAP feature attribution to explain
    which sensor signals or maintenance delays contributed most to the ML risk prediction.
    """
    model, explainer = load_or_train_model()

    days = float(feature_dict.get("days_since_last_maintenance", 180.0))
    failures = float(feature_dict.get("failure_count_last_12_months", 0))
    sensor_pct = float(feature_dict.get("pct_sensor_readings_out_of_range", 0.0))
    insp_sev = encode_inspection_severity(str(feature_dict.get("latest_inspection_severity", "none")))
    incidents = float(feature_dict.get("incident_count", 0))

    X_single = pd.DataFrame([{
        "days_since_last_maintenance": days,
        "failure_count_last_12_months": failures,
        "pct_sensor_readings_out_of_range": sensor_pct,
        "inspection_severity_encoded": insp_sev,
        "incident_count": incidents,
    }])

    # 1. Predict probability of failure (0.0 to 1.0)
    probs = model.predict_proba(X_single)[0]
    prob_failure = float(probs[1]) if len(probs) > 1 else float(probs[0])
    ml_score = round(min(100.0, max(0.0, prob_failure * 100.0)), 2)

    # 2. Classify risk band
    if ml_score >= 67.0:
        ml_band = "high"
    elif ml_score >= 34.0:
        ml_band = "medium"
    else:
        ml_band = "low"

    # 3. Compute SHAP values for single prediction
    raw_shap_values = explainer.shap_values(X_single)[0]
    
    # Handle multi-class / 2D SHAP output array dimensions safely
    if isinstance(raw_shap_values, np.ndarray) and raw_shap_values.ndim > 1:
        raw_shap_values = raw_shap_values[:, 1] # Take positive class SHAP

    shap_dict = {}
    top_factors = []

    for i, col_name in enumerate(FEATURE_NAMES):
        val = float(raw_shap_values[i])
        val = 0.0 if np.isnan(val) or np.isinf(val) else round(val, 4)
        shap_dict[col_name] = val
        top_factors.append({
            "feature": col_name,
            "raw_value": X_single.iloc[0][col_name],
            "shap_attribution": val,
            "abs_contribution": abs(val)
        })

    # Sort top factors by absolute SHAP contribution descending
    top_factors.sort(key=lambda x: x["abs_contribution"], reverse=True)

    shap_breakdown = {
        "ml_score": ml_score,
        "ml_band": ml_band,
        "top_shap_drivers": top_factors[:3], # Top 3 SHAP features
        "shap_values": shap_dict
    }

    return ml_score, ml_band, shap_breakdown

async def score_all_assets_ml(db: AsyncSession) -> List[Dict[str, Any]]:
    """
    Score all assets using XGBoost + SHAP, store ml_score & fused_score in DB, and log audit trace.
    
    Why:
    Reads computed features from Module 3, executes XGBoost prediction & SHAP attribution,
    updates risk_scores table (fusing 50% Rule Engine + 50% XGBoost ML), logs AuditLog,
    and prints console sanity check summary with top 3 SHAP drivers.
    """
    from api.models.asset_feature import AssetFeature
    from api.models.asset import Asset
    from api.models.risk_score import RiskScore
    from api.models.audit_log import AuditLog

    # Fetch features and asset metadata
    stmt = select(AssetFeature, Asset).join(Asset, AssetFeature.asset_id == Asset.id)
    result = await db.execute(stmt)
    rows = result.all()

    scored_ml_results = []

    for feature, asset in rows:
        feat_dict = {
            "days_since_last_maintenance": feature.days_since_last_maintenance,
            "failure_count_last_12_months": feature.failure_count_last_12_months,
            "pct_sensor_readings_out_of_range": feature.pct_sensor_readings_out_of_range,
            "latest_inspection_severity": feature.latest_inspection_severity,
            "incident_count": feature.incident_count,
        }

        ml_score, ml_band, shap_breakdown = predict_ml_risk(feat_dict)

        # Query existing RiskScore record to combine with Rule Score
        score_stmt = select(RiskScore).where(RiskScore.asset_id == asset.id).order_by(RiskScore.computed_at.desc())
        score_res = await db.execute(score_stmt)
        existing_score = score_res.scalars().first()

        rule_score_val = existing_score.rule_score if existing_score else ml_score
        
        # Hybrid Dual Engine Fused Score: 50% Rule Score + 50% XGBoost ML Score
        fused_score_val = round(0.50 * rule_score_val + 0.50 * ml_score, 2)
        fused_band = "high" if fused_score_val >= 67.0 else ("medium" if fused_score_val >= 34.0 else "low")

        if existing_score:
            existing_score.ml_score = ml_score
            existing_score.fused_score = fused_score_val
            existing_score.risk_band = fused_band
            existing_score.computed_at = datetime.now(timezone.utc)
        else:
            new_score = RiskScore(
                asset_id=asset.id,
                rule_score=rule_score_val,
                ml_score=ml_score,
                fused_score=fused_score_val,
                risk_band=fused_band,
                computed_at=datetime.now(timezone.utc)
            )
            db.add(new_score)

        # Log AuditLog
        audit_entry = AuditLog(
            asset_id=asset.id,
            input_data_snapshot=feat_dict,
            score_breakdown={
                "rule_score": rule_score_val,
                "ml_score": ml_score,
                "fused_score": fused_score_val,
                "fused_band": fused_band,
                "shap_breakdown": shap_breakdown
            },
            created_at=datetime.now(timezone.utc)
        )
        db.add(audit_entry)

        scored_ml_results.append({
            "asset_id": asset.id,
            "asset_name": asset.name,
            "rule_score": rule_score_val,
            "ml_score": ml_score,
            "fused_score": fused_score_val,
            "fused_band": fused_band,
            "top_shap_drivers": shap_breakdown["top_shap_drivers"]
        })

    await db.commit()

    # Sort results by fused_score descending
    scored_ml_results.sort(key=lambda x: x["fused_score"], reverse=True)

    # Print console sanity check table
    print("\n==========================================================================")
    print("      RISK RADAR XGBOOST ML + SHAP EXPLAINABILITY EVALUATION SUMMARY      ")
    print("==========================================================================")
    print(f"{'ID':<4} | {'Asset Name':<38} | {'Rule':<6} | {'ML':<6} | {'Fused':<6} | {'Top SHAP Driver'}")
    print("-" * 80)
    for res in scored_ml_results:
        top_driver = res['top_shap_drivers'][0]['feature'] if res['top_shap_drivers'] else "N/A"
        top_attr = res['top_shap_drivers'][0]['shap_attribution'] if res['top_shap_drivers'] else 0.0
        print(f"{res['asset_id']:<4} | {res['asset_name']:<38} | {res['rule_score']:<6.1f} | {res['ml_score']:<6.1f} | {res['fused_score']:<6.1f} | {top_driver} ({top_attr:+.3f})")
    print("==========================================================================\n")

    return scored_ml_results
