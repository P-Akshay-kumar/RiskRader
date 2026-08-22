import os
import sys
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.pool import StaticPool
from api.main import app
from api.db import get_db, Base
from api.models.asset import Asset
from api.models.alert import Alert
from api.models.risk_score import RiskScore
from api.models.audit_log import AuditLog
from api.models.auth_event import AuthEvent

# Setup Async SQLite Test Engine with StaticPool for in-memory connection sharing
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
async def setup_test_db():
    app.dependency_overrides[get_db] = override_get_db
    original_env = settings.ENVIRONMENT
    settings.ENVIRONMENT = "test"
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    # Seed mock test asset and alert
    async with TestSessionLocal() as session:
        asset = Asset(
            id=101,
            name="Feed Pump 101",
            asset_type="Pump",
            location="Unit 1",
            consequence_score=4
        )
        session.add(asset)
        
        alert = Alert(
            id=202,
            asset_id=101,
            previous_band="medium",
            new_band="high",
            acknowledged=False
        )
        session.add(alert)

        score = RiskScore(
            id=303,
            asset_id=101,
            rule_score=85.0,
            ml_score=80.0,
            fused_score=82.5,
            risk_band="high"
        )
        session.add(score)
        await session.commit()

    yield
    settings.ENVIRONMENT = original_env

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_unauthenticated_request_returns_401():
    """A request to a protected endpoint with no token returns 401 Unauthorized"""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/risk/ranked")
        assert response.status_code == 401
        assert "Authentication required" in response.json()["detail"]

@pytest.mark.asyncio
async def test_unauthorized_role_returns_403():
    """A request with a valid token but wrong role returns 403 Forbidden"""
    headers = {"Authorization": "Bearer inspector_token"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Inspector attempts to call Admin-only endpoint (POST /pipeline/run)
        response = await ac.post("/api/v1/pipeline/run", headers=headers)
        assert response.status_code == 403
        assert "Access denied for role 'inspector'" in response.json()["detail"]

@pytest.mark.asyncio
async def test_inspector_acknowledges_alert_records_user_id():
    """A request with a valid inspector token can acknowledge an alert; alert row records user_id"""
    headers = {"Authorization": "Bearer inspector_token"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/alerts/202/acknowledge", headers=headers)
        assert response.status_code == 200
        res_data = response.json()
        assert res_data["status"] == "success"
        assert res_data["acknowledged"] is True
        assert res_data["user_id"] == "usr_inspector_101"
        assert res_data["role"] == "inspector"

    # Verify DB persistence of user_id & role on Alert record
    async with TestSessionLocal() as session:
        res = await session.execute(select(Alert).where(Alert.id == 202))
        alert_db = res.scalar_one()
        assert alert_db.acknowledged is True
        assert alert_db.user_id == "usr_inspector_101"
        assert alert_db.role == "inspector"

@pytest.mark.asyncio
async def test_safety_manager_override_without_justification_returns_400():
    """An override request from a safety_manager without a justification field is rejected (400)"""
    headers = {"Authorization": "Bearer safety_manager_token"}
    payload = {
        "new_band": "low",
        "justification": "   " # empty/whitespace
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/risk/101/override", json=payload, headers=headers)
        assert response.status_code == 400
        assert "Override justification text is mandatory" in response.json()["detail"]

@pytest.mark.asyncio
async def test_safety_manager_override_with_justification_succeeds_and_writes_audit_log():
    """An override request from a safety_manager with justification succeeds and writes audit_log override event"""
    headers = {"Authorization": "Bearer safety_manager_token"}
    payload = {
        "new_band": "critical",
        "justification": "Manual field vibration inspection revealed imminent shaft bearing failure."
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/risk/101/override", json=payload, headers=headers)
        assert response.status_code == 200
        res_data = response.json()
        assert res_data["status"] == "success"
        assert res_data["new_band"] == "critical"
        assert res_data["override_by"] == "usr_safety_mgr_202"

    # Verify AuditLog and AuthEvent records created
    async with TestSessionLocal() as session:
        audit_res = await session.execute(select(AuditLog).where(AuditLog.asset_id == 101))
        log_entry = audit_res.scalar_one()
        assert log_entry.user_id == "usr_safety_mgr_202"
        assert log_entry.role == "safety_manager"
        assert log_entry.input_data_snapshot["override_event"] is True
        assert log_entry.input_data_snapshot["justification"] == payload["justification"]

        auth_res = await session.execute(select(AuthEvent).where(AuthEvent.event_type == "override"))
        auth_entry = auth_res.scalar_one()
        assert auth_entry.user_id == "usr_safety_mgr_202"

@pytest.mark.asyncio
async def test_admin_cannot_acknowledge_alerts_enforcing_separation_of_duties():
    """An admin token cannot call POST /alerts/{id}/acknowledge (enforces separation of duties)"""
    headers = {"Authorization": "Bearer admin_token"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/alerts/202/acknowledge", headers=headers)
        assert response.status_code == 403
        assert "Access denied for role 'admin'" in response.json()["detail"]
