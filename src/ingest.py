import os
import logging
from datetime import datetime, timezone
from typing import Tuple, Dict, Any, Optional
import pandas as pd
import numpy as np

# Configure logger for ingestion module
logger = logging.getLogger(__name__)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

def load_raw_csv_data(data_dir: str = "data") -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Load raw CSV datasets from the designated data directory.
    
    Why:
    Industrial safety telemetry, maintenance logs, inspection reports, and historical
    incidents originate from disparate plant systems (CMMS, SCADA, manual paper logs).
    Loading these raw CSV files provides the foundation for feature engineering.
    """
    maint_path = os.path.join(data_dir, "maintenance_logs.csv")
    insp_path = os.path.join(data_dir, "inspection_reports.csv")
    sensor_path = os.path.join(data_dir, "sensor_readings.csv")
    incidents_path = os.path.join(data_dir, "incident_history.csv")

    df_maint = pd.read_csv(maint_path) if os.path.exists(maint_path) else pd.DataFrame()
    df_insp = pd.read_csv(insp_path) if os.path.exists(insp_path) else pd.DataFrame()
    df_sensor = pd.read_csv(sensor_path) if os.path.exists(sensor_path) else pd.DataFrame()
    df_incidents = pd.read_csv(incidents_path) if os.path.exists(incidents_path) else pd.DataFrame()

    return df_maint, df_insp, df_sensor, df_incidents

def clean_and_process_maintenance_logs(df_maint: pd.DataFrame, ref_date: Optional[pd.Timestamp] = None) -> pd.DataFrame:
    """
    Clean maintenance logs, coerce inconsistent date formats, and compute per-asset maintenance features.
    
    Why:
    Maintenance logs in industrial CMMS databases frequently contain mixed date formats
    (e.g., '2024-03-15', '03/15/2024', '15-Mar-2024') or blank timestamps due to manual operator input.
    We convert dates flexibly with coercion, log invalid entries, and compute days since last service
    and annual emergency failure counts.
    """
    if df_maint.empty:
        return pd.DataFrame(columns=["asset_id", "days_since_last_maintenance", "failure_count_last_12_months"])

    if ref_date is None:
        ref_date = pd.Timestamp(datetime.now(timezone.utc)).tz_localize(None)
    else:
        ref_date = pd.Timestamp(ref_date).tz_localize(None)

    total_rows = len(df_maint)
    
    # Coerce dates robustly across multiple formats (e.g. 2024-01-15, 04/20/2024, 15-Mar-2024)
    df_maint["parsed_date"] = pd.to_datetime(df_maint["maintenance_date"], format="mixed", errors="coerce")
    
    # Strip timezone for uniform date comparison
    df_maint["parsed_date"] = df_maint["parsed_date"].dt.tz_localize(None)

    invalid_dates = df_maint["parsed_date"].isna().sum()
    if invalid_dates > 0:
        logger.info(f"Maintenance Logs: Coerced {invalid_dates}/{total_rows} unparseable or missing date entries to NaT.")

    records = []
    # Group by asset_id
    for asset_id, group in df_maint.groupby("asset_id"):
        valid_dates = group["parsed_date"].dropna()
        if not valid_dates.empty:
            latest_date = valid_dates.max()
            days_since = (ref_date - latest_date).days
            days_since = max(0, days_since) # Ensure non-negative
        else:
            days_since = 365 # Default baseline for assets with no valid maintenance logs

        # Count emergency/failure repairs in the last 12 months (365 days)
        one_year_ago = ref_date - pd.Timedelta(days=365)
        recent_failures = group[
            (group["parsed_date"] >= one_year_ago) &
            (group["maintenance_type"].astype(str).str.contains("Emergency|Failure|Corrective", case=False, na=False))
        ]
        failure_count = len(recent_failures)

        records.append({
            "asset_id": int(asset_id),
            "days_since_last_maintenance": float(days_since),
            "failure_count_last_12_months": int(failure_count),
        })

    return pd.DataFrame(records)

def clean_and_process_inspection_reports(df_insp: pd.DataFrame) -> pd.DataFrame:
    """
    Process inspection reports and extract the latest finding severity for each asset.
    
    Why:
    Inspectors record physical abnormalities (weeping seals, wall thinning, vibration acoustics)
    which indicate degrading physical conditions. We parse inspection dates and determine
    the most recent finding severity level per asset.
    """
    if df_insp.empty:
        return pd.DataFrame(columns=["asset_id", "latest_inspection_severity"])

    df_insp["parsed_date"] = pd.to_datetime(df_insp["inspection_date"], format="mixed", errors="coerce")
    
    records = []
    severity_order = {"none": 0, "low": 1, "medium": 2, "high": 3, "critical": 4}

    for asset_id, group in df_insp.groupby("asset_id"):
        valid_rows = group.dropna(subset=["parsed_date"])
        if not valid_rows.empty:
            latest_row = valid_rows.sort_values(by="parsed_date", ascending=False).iloc[0]
            severity_str = str(latest_row["finding_severity"]).strip().lower()
        else:
            severity_str = "none"

        if severity_str not in severity_order:
            severity_str = "none"

        records.append({
            "asset_id": int(asset_id),
            "latest_inspection_severity": severity_str
        })

    return pd.DataFrame(records)

def clean_and_process_sensor_readings(df_sensor: pd.DataFrame) -> pd.DataFrame:
    """
    Analyze SCADA sensor telemetry and calculate the percentage of out-of-range sensor readings.
    
    Why:
    Industrial sensors (vibration mm/s, bearing temperature °C, operating pressure bar)
    exceed safe operational bounds prior to mechanical failure. Calculating the percentage of
    out-of-range readings quantifies physical operational stress.
    """
    if df_sensor.empty:
        return pd.DataFrame(columns=["asset_id", "pct_sensor_readings_out_of_range"])

    # Clean numeric types
    df_sensor["value"] = pd.to_numeric(df_sensor["value"], errors="coerce")
    df_sensor["safe_min"] = pd.to_numeric(df_sensor["safe_min"], errors="coerce")
    df_sensor["safe_max"] = pd.to_numeric(df_sensor["safe_max"], errors="coerce")

    # Flag out of range readings
    df_sensor["is_out_of_range"] = (
        (df_sensor["value"] > df_sensor["safe_max"]) |
        (df_sensor["value"] < df_sensor["safe_min"])
    )

    records = []
    for asset_id, group in df_sensor.groupby("asset_id"):
        valid_readings = group.dropna(subset=["value"])
        total_valid = len(valid_readings)
        if total_valid > 0:
            out_of_range_count = valid_readings["is_out_of_range"].sum()
            pct_out = round((out_of_range_count / total_valid) * 100.0, 2)
        else:
            pct_out = 0.0

        records.append({
            "asset_id": int(asset_id),
            "pct_sensor_readings_out_of_range": float(pct_out)
        })

    return pd.DataFrame(records)

def clean_and_process_incidents(df_incidents: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate historical safety and operational incident counts per asset.
    
    Why:
    Assets with a history of thermal trips or emergency relief blow-offs carry higher
    inherent operational risk. Counting total incidents provides historical risk lineage.
    """
    if df_incidents.empty:
        return pd.DataFrame(columns=["asset_id", "incident_count"])

    counts = df_incidents.groupby("asset_id").size().reset_index(name="incident_count")
    counts["asset_id"] = counts["asset_id"].astype(int)
    counts["incident_count"] = counts["incident_count"].astype(int)
    return counts

def run_ingestion_pipeline(data_dir: str = "data", ref_date: Optional[pd.Timestamp] = None) -> pd.DataFrame:
    """
    Execute full ingestion pipeline, merging all data sources into a unified per-asset feature table.
    
    Why:
    Merges maintenance metrics, inspection findings, sensor anomaly percentages, and incident counts
    into a structured feature vector suitable for rule-based evaluation and XGBoost machine learning.
    """
    df_maint, df_insp, df_sensor, df_incidents = load_raw_csv_data(data_dir)

    rows_maint = len(df_maint)
    rows_insp = len(df_insp)
    rows_sensor = len(df_sensor)
    rows_incidents = len(df_incidents)

    # Process individual domains
    df_maint_feat = clean_and_process_maintenance_logs(df_maint, ref_date=ref_date)
    df_insp_feat = clean_and_process_inspection_reports(df_insp)
    df_sensor_feat = clean_and_process_sensor_readings(df_sensor)
    df_incidents_feat = clean_and_process_incidents(df_incidents)

    # Discover all distinct asset IDs across all sources (1 to 10 minimum)
    all_asset_ids = set()
    for df in [df_maint, df_insp, df_sensor, df_incidents]:
        if not df.empty and "asset_id" in df.columns:
            all_asset_ids.update(pd.to_numeric(df["asset_id"], errors="coerce").dropna().astype(int).unique())

    # Fallback default asset IDs if files empty
    if not all_asset_ids:
        all_asset_ids = set(range(1, 11))

    master_df = pd.DataFrame({"asset_id": sorted(list(all_asset_ids))})

    # Merge features onto master_df
    master_df = master_df.merge(df_maint_feat, on="asset_id", how="left")
    master_df = master_df.merge(df_insp_feat, on="asset_id", how="left")
    master_df = master_df.merge(df_sensor_feat, on="asset_id", how="left")
    master_df = master_df.merge(df_incidents_feat, on="asset_id", how="left")

    # Impute default values for missing asset records
    master_df["days_since_last_maintenance"] = master_df["days_since_last_maintenance"].fillna(180.0)
    master_df["failure_count_last_12_months"] = master_df["failure_count_last_12_months"].fillna(0).astype(int)
    master_df["latest_inspection_severity"] = master_df["latest_inspection_severity"].fillna("none")
    master_df["pct_sensor_readings_out_of_range"] = master_df["pct_sensor_readings_out_of_range"].fillna(0.0)
    master_df["incident_count"] = master_df["incident_count"].fillna(0).astype(int)

    # Summary logging
    logger.info("==========================================================")
    logger.info("       RISK RADAR DATA INGESTION PIPELINE SUMMARY        ")
    logger.info("==========================================================")
    logger.info(f"Loaded Raw Rows: Maint={rows_maint}, Insp={rows_insp}, Sensor={rows_sensor}, Incidents={rows_incidents}")
    logger.info(f"Cleaned & Imputed Features for {len(master_df)} Distinct Industrial Assets.")
    logger.info("==========================================================")

    return master_df

if __name__ == "__main__":
    df_features = run_ingestion_pipeline()
    print("\nProcessed Per-Asset Feature Matrix:")
    print(df_features.to_string(index=False))
