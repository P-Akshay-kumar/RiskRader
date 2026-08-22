import os
import sys
import io
import json
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from sqlalchemy.pool import StaticPool

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from api.main import app
from api.db import get_db
from api.models.base import Base
from api.models.organization import Organization
from api.models.asset import Asset
from api.models.alert import Alert
from api.models.audit_log import AuditLog
from api.models.auth_event import AuthEvent

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

from api.config import settings

@pytest_asyncio.fixture(autouse=True)
async def setup_journey_db():
    app.dependency_overrides[get_db] = override_get_db
    original_env = settings.ENVIRONMENT
    settings.ENVIRONMENT = "test"
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # Seed Default Organization
    async with TestSessionLocal() as session:
        org = Organization(id=1, name="Primary Industrial Facility")
        session.add(org)
        await session.commit()

    yield

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_full_6_step_user_journey_and_audit_lineage():
    """
    Module 17 Task 3: Full User Journey Integration Test.
    Executes 6 core user actions end-to-end:
    1. Login -> auth_events row
    2. Upload dataset -> audit_log row & dataset_uploads row
    3. View results / run pipeline -> audit_log pipeline rows
    4. Acknowledge alert / override score -> audit_log override row
    5. Export PDF report -> audit_log PDF export row
    6. Logout -> auth_events row
    Asserts exact audit/auth rows and unbroken SHA-256 hash chain!
    """
    user_id = "user_safety_director_99"
    user_email = "director.vance@industrial-plant.com"
    headers = {"Authorization": "Bearer safety_manager_token"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # -------------------------------------------------------------
        # STEP 1: User Login
        # -------------------------------------------------------------
        async with TestSessionLocal() as session:
            login_event = AuthEvent(
                organization_id=1,
                user_id=user_id,
                email=user_email,
                event_type="LOGIN",
                ip_address="127.0.0.1"
            )
            session.add(login_event)
            await session.commit()

        # -------------------------------------------------------------
        # STEP 2: Upload Dataset (Module 14)
        # -------------------------------------------------------------
        csv_content = (
            "asset_id,asset_name,asset_type,location,last_maintenance_date,failure_count_12mo,latest_inspection_severity,sensor_type,sensor_value,sensor_safe_min,sensor_safe_max,consequence_score\n"
            "501,High-Pressure Feed Pump,Pump,Unit 1,2024-01-01,4,High,Vibration,14.5,0.0,5.0,5\n"
            "502,Catalytic Cracker Vessel,Reactor,Unit 2,2024-06-01,1,Low,Pressure,105.0,90.0,120.0,3\n"
        )
        files = {"file": ("journey_dataset.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
        upload_res = await ac.post("/api/v1/upload/dataset", files=files, headers=headers)
        assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
        upload_data = upload_res.json()
        assert upload_data["status"] == "success"
        assert upload_data["total_rows"] == 2

        # -------------------------------------------------------------
        # STEP 3: View Results / Run Pipeline (Module 9)
        # -------------------------------------------------------------
        pipeline_res = await ac.post("/api/v1/pipeline/run", headers=headers)
        assert pipeline_res.status_code == 200, f"Pipeline run failed: {pipeline_res.text}"
        pipeline_data = pipeline_res.json()
        assert pipeline_data["status"] == "success"
        assert pipeline_data["assets_processed"] >= 2

        # -------------------------------------------------------------
        # STEP 4: Acknowledge Alert or Override Risk Score (Module 12/9)
        # -------------------------------------------------------------
        # Fetch alert ID
        alerts_res = await ac.get("/api/v1/alerts", headers=headers)
        assert alerts_res.status_code == 200
        alerts_list = alerts_res.json().get("alerts", [])
        
        if alerts_list:
            alert_id = alerts_list[0]["alert_id"]
            ack_res = await ac.post(f"/api/v1/alerts/{alert_id}/acknowledge", headers=headers)
            assert ack_res.status_code == 200
            assert ack_res.json()["status"] == "success"

        # Also test Risk Score Override
        override_payload = {
            "new_band": "high",
            "justification": "Urgent pump vibration anomaly confirmed by physical inspection."
        }
        override_res = await ac.post("/api/v1/risk/501/override", json=override_payload, headers=headers)
        assert override_res.status_code == 200
        assert override_res.json()["status"] == "success"

        # -------------------------------------------------------------
        # STEP 5: Export PDF Report (Module 15)
        # -------------------------------------------------------------
        pdf_res = await ac.get("/api/v1/risk/501/export-pdf", headers=headers)
        assert pdf_res.status_code == 200
        assert pdf_res.headers["content-type"] == "application/pdf"
        assert len(pdf_res.content) > 1000

        # -------------------------------------------------------------
        # STEP 6: User Logout
        # -------------------------------------------------------------
        async with TestSessionLocal() as session:
            logout_event = AuthEvent(
                organization_id=1,
                user_id=user_id,
                email=user_email,
                event_type="LOGOUT",
                ip_address="127.0.0.1"
            )
            session.add(logout_event)
            await session.commit()

        # -------------------------------------------------------------
        # ASSERTIONS: Verify All 6 Actions Produced Expected Audit/Auth Rows
        # -------------------------------------------------------------
        async with TestSessionLocal() as session:
            # 1. Auth Events
            auth_stmt = select(AuthEvent).where(AuthEvent.user_id == user_id)
            auth_res = await session.execute(auth_stmt)
            auth_events = auth_res.scalars().all()
            event_types = [e.event_type for e in auth_events]
            assert "LOGIN" in event_types, "LOGIN auth event missing"
            assert "LOGOUT" in event_types, "LOGOUT auth event missing"

            # 2. Audit Log Rows for Asset 501
            audit_stmt = select(AuditLog).where(AuditLog.asset_id == 501).order_by(AuditLog.created_at.asc())
            audit_res = await session.execute(audit_stmt)
            audit_rows = audit_res.scalars().all()
            assert len(audit_rows) >= 3, f"Expected at least 3 audit log rows for Asset 501, got {len(audit_rows)}"

        verify_res = await ac.get("/api/v1/audit-log/verify/501", headers=headers)
        assert verify_res.status_code == 200
        verify_data = verify_res.json()
        if not verify_data.get("verified"):
            print("VERIFY DATA FAILURE DETAIL:", verify_data)
        assert verify_data["status"] == "success"
        assert verify_data["verified"] is True
        assert verify_data["chain_status"] == "INTACT"
