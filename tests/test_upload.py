import os
import sys
import io
import pandas as pd
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from api.main import app
from api.db import get_db, Base

# Setup Async SQLite Test Engine
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=False
)
TestSessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)

async def override_get_db():
    async with TestSessionLocal() as session:
        yield session

@pytest_asyncio.fixture(autouse=True)
async def setup_upload_db():
    app.dependency_overrides[get_db] = override_get_db
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    yield

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_download_template_csv():
    """GET /upload/template returns valid CSV with required schema columns"""
    headers = {"Authorization": "Bearer inspector_token"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/upload/template?format=csv", headers=headers)
        assert res.status_code == 200
        assert "text/csv" in res.headers["content-type"]
        assert "riskradar_upload_template.csv" in res.headers["content-disposition"]
        
        df = pd.read_csv(io.BytesIO(res.content))
        required_cols = [
            "asset_id", "asset_name", "asset_type", "location", "last_maintenance_date",
            "failure_count_12mo", "latest_inspection_severity", "sensor_type",
            "sensor_value", "sensor_safe_min", "sensor_safe_max", "consequence_score"
        ]
        for col in required_cols:
            assert col in df.columns
        assert len(df) >= 3

@pytest.mark.asyncio
async def test_upload_correct_csv_runs_pipeline():
    """POST /upload/dataset with valid CSV runs end-to-end and returns ranked results"""
    csv_content = (
        "asset_id,asset_name,asset_type,location,last_maintenance_date,failure_count_12mo,latest_inspection_severity,sensor_type,sensor_value,sensor_safe_min,sensor_safe_max,consequence_score\n"
        "501,Catalytic Reactor A,Reactor,Unit 1,2024-02-10,2,High,Vibration,7.2,0.0,4.0,5\n"
        "502,Auxiliary Water Pump B,Pump,Bay 2,2024-04-15,0,Low,Temperature,35.0,10.0,80.0,2\n"
    ).encode("utf-8")

    files = {"file": ("custom_telemetry.csv", csv_content, "text/csv")}
    headers = {"Authorization": "Bearer inspector_token"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/upload/dataset", files=files, headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["total_rows"] == 2
        assert len(data["processed_results"]) == 2
        # Check priority sorting (Reactor A with severity High and consequence 5 should be ranked first)
        assert data["processed_results"][0]["asset_id"] == 501

@pytest.mark.asyncio
async def test_upload_missing_column_returns_400():
    """POST /upload/dataset missing a required column returns 400 naming the missing column"""
    bad_csv = (
        "asset_id,asset_name,asset_type,location\n"
        "501,Catalytic Reactor A,Reactor,Unit 1\n"
    ).encode("utf-8")

    files = {"file": ("bad_schema.csv", bad_csv, "text/csv")}
    headers = {"Authorization": "Bearer inspector_token"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/upload/dataset", files=files, headers=headers)
        assert res.status_code == 400
        detail = res.json()["detail"]
        assert "Missing required columns" in detail
        assert "last_maintenance_date" in detail

@pytest.mark.asyncio
async def test_upload_bad_date_format_returns_400():
    """POST /upload/dataset with unparseable date format is rejected with clear message"""
    bad_date_csv = (
        "asset_id,asset_name,asset_type,location,last_maintenance_date,failure_count_12mo,latest_inspection_severity,sensor_type,sensor_value,sensor_safe_min,sensor_safe_max,consequence_score\n"
        "501,Catalytic Reactor A,Reactor,Unit 1,invalid-date-string,2,High,Vibration,7.2,0.0,4.0,5\n"
    ).encode("utf-8")

    files = {"file": ("bad_date.csv", bad_date_csv, "text/csv")}
    headers = {"Authorization": "Bearer inspector_token"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/upload/dataset", files=files, headers=headers)
        assert res.status_code == 400
        detail = res.json()["detail"]
        assert "Invalid date formatting in 'last_maintenance_date'" in detail
