import os
import sys
import pytest

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.rule_engine import (
    compute_rule_score,
    classify_risk_band,
    WEIGHT_MAINTENANCE_RECENCY,
    WEIGHT_FAILURE_HISTORY,
    WEIGHT_SENSOR_DEVIATION,
    WEIGHT_INSPECTION_SEVERITY,
)

def test_zero_factors_asset_score_and_band():
    """
    Test an asset with all zero/healthy risk factors:
    - 0 days overdue
    - 0 annual failures
    - 0% sensor deviation
    - 'none' inspection severity
    Should yield score = 0.0 and risk_band = 'low'.
    """
    rule_score, risk_band, breakdown = compute_rule_score(
        days_since_last_maintenance=0.0,
        failure_count_last_12_months=0,
        pct_sensor_readings_out_of_range=0.0,
        latest_inspection_severity="none"
    )

    assert rule_score == 0.0
    assert risk_band == "low"
    assert breakdown["rule_score"] == 0.0
    assert breakdown["risk_band"] == "low"

def test_maxed_factors_asset_score_and_band():
    """
    Test an asset with all maxed critical risk factors:
    - 180+ days overdue (>= 180.0)
    - 3+ annual failures (>= 3)
    - 100% sensor deviation (>= 100.0)
    - 'critical' inspection severity
    Should yield score = 100.0 and risk_band = 'high'.
    """
    rule_score, risk_band, breakdown = compute_rule_score(
        days_since_last_maintenance=250.0, # > 180 cap
        failure_count_last_12_months=5,     # > 3 cap
        pct_sensor_readings_out_of_range=100.0,
        latest_inspection_severity="critical"
    )

    assert rule_score == 100.0
    assert risk_band == "high"
    assert breakdown["rule_score"] == 100.0
    assert breakdown["risk_band"] == "high"

def test_factor_breakdown_weighted_contributions_sum():
    """
    Test that the sum of weighted contributions in factor_breakdown equals the computed total rule_score.
    """
    rule_score, risk_band, breakdown = compute_rule_score(
        days_since_last_maintenance=90.0, # 90/180 = 0.5 norm * 30 = 15.0
        failure_count_last_12_months=1,    # 1/3 = 0.3333 norm * 30 = 10.0
        pct_sensor_readings_out_of_range=50.0, # 50/100 = 0.5 norm * 25 = 12.5
        latest_inspection_severity="medium"    # 0.5 norm * 15 = 7.5
    )

    factors = breakdown["factors"]
    sum_contributions = (
        factors["maintenance_recency"]["weighted_contribution"] +
        factors["failure_history"]["weighted_contribution"] +
        factors["sensor_deviation"]["weighted_contribution"] +
        factors["inspection_severity"]["weighted_contribution"]
    )

    assert abs(sum_contributions - rule_score) < 0.1
    assert breakdown["factors"]["maintenance_recency"]["weight"] == WEIGHT_MAINTENANCE_RECENCY

def test_partially_missing_data_graceful_degradation():
    """
    Test that an asset with null/missing/NaN input values degrades gracefully without raising exceptions.
    """
    rule_score, risk_band, breakdown = compute_rule_score(
        days_since_last_maintenance=None,
        failure_count_last_12_months=None,
        pct_sensor_readings_out_of_range=None,
        latest_inspection_severity=None
    )

    assert isinstance(rule_score, float)
    assert 0.0 <= rule_score <= 100.0
    assert risk_band in ["low", "medium", "high"]
    assert "factors" in breakdown
