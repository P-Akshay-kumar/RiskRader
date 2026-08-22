import os
import sys
import pytest
import numpy as np
import pandas as pd

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.ml_model import (
    load_or_train_model,
    predict_ml_risk,
    encode_inspection_severity,
    MODEL_PATH,
)

def test_model_training_and_disk_persistence():
    """
    Test that XGBoost model trains without errors and saves to disk.
    """
    model, explainer = load_or_train_model(force_retrain=True)

    assert model is not None
    assert explainer is not None
    assert os.path.exists(MODEL_PATH), f"Model file expected at {MODEL_PATH}"

def test_predict_ml_risk_returns_valid_score_and_band():
    """
    Test that predict_ml_risk returns a valid score in [0, 100] and a recognized risk_band string.
    """
    sample_asset_features = {
        "days_since_last_maintenance": 120.0,
        "failure_count_last_12_months": 2,
        "pct_sensor_readings_out_of_range": 75.0,
        "latest_inspection_severity": "high",
        "incident_count": 1,
    }

    ml_score, ml_band, shap_breakdown = predict_ml_risk(sample_asset_features)

    assert isinstance(ml_score, float)
    assert 0.0 <= ml_score <= 100.0
    assert ml_band in ["low", "medium", "high"]

def test_shap_breakdown_validity_and_top_drivers():
    """
    Test that SHAP breakdown is non-empty, values are finite numbers (no NaN/inf),
    and prints the top 3 SHAP-driving features to the console.
    """
    sample_asset_features = {
        "days_since_last_maintenance": 140.0,
        "failure_count_last_12_months": 3,
        "pct_sensor_readings_out_of_range": 85.0,
        "latest_inspection_severity": "critical",
        "incident_count": 2,
    }

    ml_score, ml_band, shap_breakdown = predict_ml_risk(sample_asset_features)

    assert "shap_values" in shap_breakdown
    assert "top_shap_drivers" in shap_breakdown

    shap_vals = shap_breakdown["shap_values"]
    assert len(shap_vals) > 0

    for feature_name, val in shap_vals.items():
        assert not np.isnan(val), f"SHAP value for {feature_name} is NaN"
        assert not np.isinf(val), f"SHAP value for {feature_name} is Inf"
        assert isinstance(val, (float, int))

    top_drivers = shap_breakdown["top_shap_drivers"]
    assert len(top_drivers) <= 3

    print("\n==========================================================")
    print("      SAMPLE ASSET TOP 3 SHAP-DRIVING FEATURES (SANITY)   ")
    print("==========================================================")
    print(f"Sample Asset ML Risk Score: {ml_score:.2f} ({ml_band.upper()})")
    for idx, driver in enumerate(top_drivers, 1):
        print(f"  #{idx} Driver: {driver['feature']:<35} | SHAP Attribution: {driver['shap_attribution']:+.4f}")
    print("==========================================================\n")
