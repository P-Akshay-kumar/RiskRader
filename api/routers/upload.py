import io
import json
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, Response
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from api.db import get_db
from api.auth import verify_token, require_role, AuthenticatedUser, log_auth_event, apply_tenant_filter
from api.models.dataset_upload import DatasetUpload
from api.models.asset import Asset
from api.models.audit_log import AuditLog
from src.rule_engine import compute_rule_score
from src.ml_model import predict_ml_risk
from src.fusion import fuse_scores
from src.prioritize import calculate_priority_score
from src.rag_retrieval import retrieve
from src.rag_explain import generate_explanation

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["upload"])

REQUIRED_COLUMNS = [
    "asset_id",
    "asset_name",
    "asset_type",
    "location",
    "last_maintenance_date",
    "failure_count_12mo",
    "latest_inspection_severity",
    "sensor_type",
    "sensor_value",
    "sensor_safe_min",
    "sensor_safe_max",
    "consequence_score"
]

@router.get("/upload/template", status_code=status.HTTP_200_OK)
async def download_upload_template(
    format: str = Query("csv", pattern="^(csv|xlsx)$"),
    user: AuthenticatedUser = Depends(require_role("inspector", "safety_manager", "admin", "auditor"))
):
    """
    Returns downloadable sample CSV or XLSX template pre-filled with 3 realistic example rows
    matching exact RiskRadar required schema.
    """
    sample_data = [
        {
            "asset_id": 101,
            "asset_name": "High-Pressure Catalytic Feed Pump A-1",
            "asset_type": "Pump",
            "location": "Cracker Unit 3",
            "last_maintenance_date": "2024-01-15",
            "failure_count_12mo": 3,
            "latest_inspection_severity": "High",
            "sensor_type": "Vibration_mm_s",
            "sensor_value": 8.4,
            "sensor_safe_min": 0.0,
            "sensor_safe_max": 4.5,
            "consequence_score": 5
        },
        {
            "asset_id": 102,
            "asset_name": "Crude Overhead Heat Exchanger E-202",
            "asset_type": "Heat Exchanger",
            "location": "Distillation Deck B",
            "last_maintenance_date": "2023-11-20",
            "failure_count_12mo": 1,
            "latest_inspection_severity": "Medium",
            "sensor_type": "Pressure_psi",
            "sensor_value": 310.0,
            "sensor_safe_min": 150.0,
            "sensor_safe_max": 280.0,
            "consequence_score": 4
        },
        {
            "asset_id": 103,
            "asset_name": "Secondary Boiler Feedwater Line V-12",
            "asset_type": "Valve",
            "location": "Utilities Bay 1",
            "last_maintenance_date": "2024-05-10",
            "failure_count_12mo": 0,
            "latest_inspection_severity": "Low",
            "sensor_type": "Temperature_C",
            "sensor_value": 72.5,
            "sensor_safe_min": 20.0,
            "sensor_safe_max": 95.0,
            "consequence_score": 2
        }
    ]

    df = pd.DataFrame(sample_data)

    if format == "csv":
        output = df.to_csv(index=False)
        filename = "riskradar_upload_template.csv"
        headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
        return Response(content=output, media_type="text/csv", headers=headers)
    else:
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="Template")
        filename = "riskradar_upload_template.xlsx"
        headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
        return Response(
            content=buffer.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers=headers
        )

@router.post("/upload/dataset", status_code=status.HTTP_200_OK)
async def upload_custom_dataset(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("inspector", "safety_manager", "admin"))
):
    """
    Strict Schema Live-Demo Dataset Upload.
    Parses .csv or .xlsx, validates required columns and types, runs complete RiskRadar pipeline,
    records dataset upload audit trail, and returns ranked risk queue.
    """
    filename = file.filename or "uploaded_dataset"
    ext = filename.split(".")[-1].lower()

    if ext not in ["csv", "xlsx", "xls"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '.{ext}'. RiskRadar strict upload mode requires a valid .csv or .xlsx file."
        )

    content = await file.read()
    try:
        if ext == "csv":
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content), engine="openpyxl")
    except Exception as e:
        # Record failed upload in DB
        upload_log = DatasetUpload(
            organization_id=user.organization_id,
            user_id=user.user_id,
            filename=filename,
            file_type=ext,
            row_count=0,
            validation_status="failed",
            error_details={"parse_error": str(e)}
        )
        db.add(upload_log)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse upload file '{filename}': {str(e)}"
        )

    # 1. Validate Column Schema
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        error_msg = f"Strict Schema Validation Failed for '{filename}'. Missing required columns: {', '.join(missing_cols)}."
        upload_log = DatasetUpload(
            organization_id=user.organization_id,
            user_id=user.user_id,
            filename=filename,
            file_type=ext,
            row_count=len(df),
            validation_status="failed",
            error_details={"missing_columns": missing_cols}
        )
        db.add(upload_log)
        await db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)

    # 2. Validate Data Types & Date Parsing
    # Check date column
    invalid_dates = []
    parsed_dates = []
    for idx, raw_val in enumerate(df["last_maintenance_date"]):
        try:
            p_date = pd.to_datetime(raw_val, errors="coerce")
            if pd.isna(p_date):
                invalid_dates.append(f"Row {idx+1} ({raw_val})")
            else:
                parsed_dates.append(p_date)
        except Exception:
            invalid_dates.append(f"Row {idx+1} ({raw_val})")

    if invalid_dates:
        error_msg = f"Invalid date formatting in 'last_maintenance_date' column. Unparseable dates found at: {', '.join(invalid_dates[:5])}. Dates must be in YYYY-MM-DD format."
        upload_log = DatasetUpload(
            organization_id=user.organization_id,
            user_id=user.user_id,
            filename=filename,
            file_type=ext,
            row_count=len(df),
            validation_status="failed",
            error_details={"invalid_dates": invalid_dates}
        )
        db.add(upload_log)
        await db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)

    # Log successful upload entity
    upload_log = DatasetUpload(
        organization_id=user.organization_id,
        user_id=user.user_id,
        filename=filename,
        file_type=ext,
        row_count=len(df),
        validation_status="success",
        error_details=None
    )
    db.add(upload_log)
    await db.commit()

    # 3. Run Pipeline for Uploaded Data
    processed_results = []

    for _, row in df.iterrows():
        a_id = int(row["asset_id"])
        a_name = str(row["asset_name"])
        a_type = str(row["asset_type"])
        loc = str(row["location"])
        c_score = int(row["consequence_score"])
        
        # Calculate days since last maintenance
        m_date = pd.to_datetime(row["last_maintenance_date"], errors="coerce")
        now_dt = pd.Timestamp.now()
        days_overdue = max(0.0, (now_dt - m_date).days) if pd.notna(m_date) else 90.0
        
        # Sensor out of range percentage estimate
        val = float(row["sensor_value"])
        s_min = float(row["sensor_safe_min"])
        s_max = float(row["sensor_safe_max"])
        pct_sensor_out = 100.0 if (val < s_min or val > s_max) else 0.0

        # Rule scoring
        r_score, r_band, breakdown = compute_rule_score(
            days_since_last_maintenance=days_overdue,
            failure_count_last_12_months=int(row["failure_count_12mo"]),
            pct_sensor_readings_out_of_range=pct_sensor_out,
            latest_inspection_severity=str(row["latest_inspection_severity"])
        )

        # ML model prediction
        ml_score, _, _ = predict_ml_risk({
            "days_since_last_maintenance": days_overdue,
            "failure_count_last_12_months": int(row["failure_count_12mo"]),
            "pct_sensor_readings_out_of_range": pct_sensor_out,
            "latest_inspection_severity": str(row["latest_inspection_severity"])
        })

        # Fusion & Priority
        fused_score, final_band, needs_review = fuse_scores(rule_score=r_score, ml_score=ml_score)
        p_score = calculate_priority_score(fused_score=fused_score, consequence_score=c_score)

        # RAG retrieval & explanation
        rag_snippets = retrieve(
            query=f"{a_type} {loc} {str(row['sensor_type'])} {final_band} risk",
            top_k=2
        )

        exp_result = generate_explanation(
            asset_name=a_name,
            factor_breakdown=breakdown,
            retrieved_snippets=rag_snippets
        )

        processed_results.append({
            "asset_id": a_id,
            "asset_name": a_name,
            "asset_type": a_type,
            "location": loc,
            "consequence_score": c_score,
            "rule_score": r_score,
            "ml_score": ml_score,
            "fused_score": fused_score,
            "risk_band": final_band,
            "priority_score": p_score,
            "explanation": exp_result["explanation_text"],
            "recommended_action": exp_result["recommended_action"],
            "cited_source": exp_result["cited_source"]
        })

    # Sort by priority score descending
    processed_results.sort(key=lambda x: x["priority_score"], reverse=True)

    target_asset_id = processed_results[0]["asset_id"] if processed_results else 1
    prev_stmt = select(AuditLog.hash).where(AuditLog.asset_id == target_asset_id).order_by(AuditLog.created_at.desc(), AuditLog.id.desc()).limit(1)
    prev_res = await db.execute(prev_stmt)
    prev_hash = prev_res.scalar_one_or_none() or "GENESIS_HASH_CHAIN_0000000000000000000000000000000000000000000"

    audit_entry = AuditLog(
        organization_id=user.organization_id,
        asset_id=target_asset_id,
        input_data_snapshot={"filename": filename, "uploaded_rows": len(df)},
        score_breakdown={"processed_assets": len(processed_results), "top_asset": processed_results[0]["asset_name"] if processed_results else "None"},
        user_id=user.user_id,
        role=user.role,
        previous_hash=prev_hash,
        created_at=datetime.now(timezone.utc)
    )
    audit_entry.hash = audit_entry.calculate_entry_hash(prev_hash)
    db.add(audit_entry)
    await db.commit()

    return {
        "status": "success",
        "filename": filename,
        "total_rows": len(df),
        "processed_results": processed_results,
        "uploaded_by": user.user_id,
        "timestamp": datetime.now(timezone.utc)
    }

@router.post("/upload/pdf", status_code=status.HTTP_200_OK)
async def upload_pdf_experimental(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: AuthenticatedUser = Depends(require_role("inspector", "safety_manager", "admin"))
):
    """
    Experimental PDF Table Extraction Mode.
    Extracts tabular data using pdfplumber, maps columns onto standard schema,
    and returns a preview for user confirmation before pipeline execution.
    """
    filename = file.filename or "uploaded_pdf.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a valid .pdf document."
        )

    content = await file.read()
    extracted_tables = []

    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page_idx, page in enumerate(pdf.pages):
                tables = page.extract_tables()
                for t in tables:
                    if t and len(t) > 1: # At least header + 1 row
                        extracted_tables.append(t)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"PDF extraction error: {str(e)}. Please try uploading a structured CSV or Excel file instead."
        )

    if not extracted_tables:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No usable tabular data extracted from PDF. Please upload a structured CSV or Excel (.xlsx) file instead."
        )

    # Use first non-empty table
    table_data = extracted_tables[0]
    headers = [str(h).strip().lower().replace(" ", "_") if h else f"col_{idx}" for idx, h in enumerate(table_data[0])]
    rows = table_data[1:]

    # Map headers to required schema
    mapped_preview = []
    for r in rows:
        row_dict = {}
        for idx, val in enumerate(r):
            col_name = headers[idx] if idx < len(headers) else f"col_{idx}"
            row_dict[col_name] = val
        mapped_preview.append(row_dict)

    upload_log = DatasetUpload(
        organization_id=user.organization_id,
        user_id=user.user_id,
        filename=filename,
        file_type="pdf",
        row_count=len(mapped_preview),
        validation_status="preview",
        error_details=None
    )
    db.add(upload_log)
    await db.commit()

    return {
        "status": "preview",
        "mode": "EXPERIMENTAL_PDF_MAPPING",
        "filename": filename,
        "extracted_rows_count": len(mapped_preview),
        "detected_headers": headers,
        "suggested_mapping": {
            "asset_name": "asset_name" if "asset_name" in headers else headers[0],
            "location": "location" if "location" in headers else (headers[1] if len(headers) > 1 else headers[0]),
            "consequence_score": 4
        },
        "mapped_preview": mapped_preview[:5],
        "message": "PDF tabular data extracted successfully. Please review the suggested mapping before confirming pipeline run."
    }
