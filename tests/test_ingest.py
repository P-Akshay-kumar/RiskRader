import os
import sys
import pytest
import pandas as pd
import numpy as np

# Ensure project root is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.ingest import (
    clean_and_process_maintenance_logs,
    clean_and_process_inspection_reports,
    clean_and_process_sensor_readings,
    clean_and_process_incidents,
    run_ingestion_pipeline,
)

def test_missing_date_handling_and_coercion():
    """
    Test robust date coercion on messy date strings ('2024-03-15', '03/15/2024', '15-Mar-2024', NaN, invalid text).
    """
    raw_maint_data = pd.DataFrame({
        "asset_id": [1, 1, 1, 2],
        "maintenance_date": ["2024-01-15", "04/20/2024", "INVALID_DATE_STRING", None],
        "maintenance_type": ["Preventive", "Emergency Repair", "Routine", "Preventive"],
        "notes": ["ok", "emergency fix", "bad date", "no date"]
    })

    ref_date = pd.Timestamp("2024-08-20")
    df_cleaned = clean_and_process_maintenance_logs(raw_maint_data, ref_date=ref_date)

    assert len(df_cleaned) == 2 # Asset 1 & Asset 2
    assert "days_since_last_maintenance" in df_cleaned.columns
    assert "failure_count_last_12_months" in df_cleaned.columns

    # Asset 1 latest valid date is 2024-04-20 -> days since = 122
    asset_1 = df_cleaned[df_cleaned["asset_id"] == 1].iloc[0]
    assert asset_1["days_since_last_maintenance"] == 122.0
    assert asset_1["failure_count_last_12_months"] == 1 # 1 Emergency Repair

    # Asset 2 has no valid dates -> defaults to 365 days
    asset_2 = df_cleaned[df_cleaned["asset_id"] == 2].iloc[0]
    assert asset_2["days_since_last_maintenance"] == 365.0
    assert asset_2["failure_count_last_12_months"] == 0

def test_out_of_range_sensor_detection():
    """
    Test calculation of out-of-range sensor percentage across valid telemetry rows.
    """
    raw_sensor_data = pd.DataFrame({
        "asset_id": [10, 10, 10, 10],
        "timestamp": ["2024-08-15T08:00:00Z"] * 4,
        "reading_type": ["temperature", "pressure", "vibration", "vibration"],
        "value": [95.0, 30.0, 6.5, np.nan], # 95.0 > 85.0 (out), 30.0 inside, 6.5 > 4.5 (out), nan ignored
        "safe_min": [20.0, 10.0, 0.5, 0.5],
        "safe_max": [85.0, 50.0, 4.5, 4.5]
    })

    df_cleaned = clean_and_process_sensor_readings(raw_sensor_data)
    assert len(df_cleaned) == 1
    asset_10 = df_cleaned.iloc[0]

    # 2 out of 3 valid readings out of range -> (2 / 3) * 100 = 66.67%
    assert asset_10["pct_sensor_readings_out_of_range"] == 66.67

def test_merged_output_schema():
    """
    Test full ingestion pipeline merged feature table schema and data types.
    """
    df_features = run_ingestion_pipeline(data_dir="data")

    expected_columns = [
        "asset_id",
        "days_since_last_maintenance",
        "failure_count_last_12_months",
        "latest_inspection_severity",
        "pct_sensor_readings_out_of_range",
        "incident_count",
    ]

    for col in expected_columns:
        assert col in df_features.columns, f"Missing expected column '{col}' in feature table"

    # Ensure 10 distinct assets are produced
    assert len(df_features) >= 10
    assert not df_features["asset_id"].isnull().any()
    assert df_features["days_since_last_maintenance"].min() >= 0
    assert df_features["pct_sensor_readings_out_of_range"].max() <= 100.0
