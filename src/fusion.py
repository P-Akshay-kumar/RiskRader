import logging
from typing import Tuple

logger = logging.getLogger(__name__)

# Configurable Weights for Dual Engine Fusion
WEIGHT_RULE_ENGINE: float = 0.50
WEIGHT_ML_CLASSIFIER: float = 0.50

# Threshold for model disagreement flagging (in score points 0-100)
DISAGREEMENT_THRESHOLD: float = 25.0

# Verify weights sum to 1.0
assert abs((WEIGHT_RULE_ENGINE + WEIGHT_ML_CLASSIFIER) - 1.0) < 1e-6, "Fusion weights must sum to 1.0"

def classify_fused_risk_band(fused_score: float) -> str:
    """
    Map numeric fused risk score (0-100) to qualitative risk band.
    """
    if fused_score >= 67.0:
        return "high"
    elif fused_score >= 34.0:
        return "medium"
    else:
        return "low"

def fuse_scores(
    rule_score: float,
    ml_score: float,
    weight_rule: float = WEIGHT_RULE_ENGINE,
    weight_ml: float = WEIGHT_ML_CLASSIFIER,
    threshold: float = DISAGREEMENT_THRESHOLD
) -> Tuple[float, str, bool]:
    """
    Fuse deterministic Rule Engine score and XGBoost ML classifier score.
    
    Why:
    Combines physical deterministic rule guardrails with statistical anomaly signals.
    If the Rule Engine and ML Model disagree by more than `DISAGREEMENT_THRESHOLD` points
    (e.g., Rule Score = 80, ML Score = 40), flags `needs_review = True` for human safety review
    rather than silently averaging contradictory signals.
    """
    r_val = float(rule_score) if rule_score is not None else 0.0
    m_val = float(ml_score) if ml_score is not None else 0.0

    # Calculate weighted average score
    fused_score = round(weight_rule * r_val + weight_ml * m_val, 2)
    fused_score = min(100.0, max(0.0, fused_score))

    # Detect model disagreement
    score_diff = abs(r_val - m_val)
    needs_review = bool(score_diff >= threshold)

    if needs_review:
        logger.warning(
            f"Dual Engine Disagreement Detected! Rule Score={r_val:.1f}, ML Score={m_val:.1f} (Diff={score_diff:.1f} >= {threshold}). Flagging needs_review=True."
        )

    fused_band = classify_fused_risk_band(fused_score)

    return fused_score, fused_band, needs_review
