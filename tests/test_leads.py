import os
import sys
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from sqlalchemy.pool import StaticPool

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from api.main import app
from api.db import get_db, Base
from api.models.lead import Lead

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
async def setup_leads_db():
    app.dependency_overrides[get_db] = override_get_db
    original_env = settings.ENVIRONMENT
    settings.ENVIRONMENT = "test"
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield
    settings.ENVIRONMENT = original_env

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_submit_valid_lead_stored_in_db():
    """POST /leads with valid payload stores lead in database and returns HTTP 200 success"""
    payload = {
        "full_name": "Marcus Vance",
        "work_email": "marcus.vance@petrochem-refining.com",
        "phone_number": "+1 (555) 234-5678",
        "company_name": "PetroChem Refining Corp",
        "job_title": "VP of Industrial Safety & Compliance",
        "facility_type": "Oil & Gas",
        "company_size": "201-1000",
        "current_inspection_process": "Some software",
        "primary_need": "We need predictive RAG-grounded failure explanations for catalytic feed pumps.",
        "source_page": "landing_page_demo_modal"
    }

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/leads", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert "lead_id" in data
        lead_id = data["lead_id"]

    # Verify lead was stored in DB
    async with TestSessionLocal() as session:
        stmt = select(Lead).where(Lead.id == lead_id)
        res = await session.execute(stmt)
        lead_db = res.scalar_one_or_none()
        assert lead_db is not None
        assert lead_db.full_name == "Marcus Vance"
        assert lead_db.work_email == "marcus.vance@petrochem-refining.com"
        assert lead_db.company_name == "PetroChem Refining Corp"
        assert lead_db.facility_type == "Oil & Gas"

@pytest.mark.asyncio
async def test_honeypot_submission_silently_rejected():
    """POST /leads with honeypot filled returns 200 success but is NOT saved in DB"""
    payload = {
        "full_name": "Bot Spam",
        "work_email": "bot@spam-network.com",
        "company_name": "Spam Bots Ltd",
        "job_title": "Spammer",
        "facility_type": "Other",
        "company_size": "1-50",
        "current_inspection_process": "None",
        "honeypot": "i_am_a_bot_filling_hidden_fields"
    }

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/leads", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data.get("bot_filtered") is True

    # Verify NOT saved in DB
    async with TestSessionLocal() as session:
        stmt = select(Lead)
        res = await session.execute(stmt)
        leads = res.scalars().all()
        assert len(leads) == 0

@pytest.mark.asyncio
async def test_invalid_email_format_returns_400():
    """POST /leads with bad email format returns 400 validation error"""
    payload = {
        "full_name": "Marcus Vance",
        "work_email": "invalid-email-no-at-sign",
        "company_name": "PetroChem",
        "job_title": "Safety Mgr",
        "facility_type": "Chemical",
        "company_size": "51-200",
        "current_inspection_process": "Manual/periodic"
    }

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.post("/api/v1/leads", json=payload)
        assert res.status_code == 400
        assert "Invalid email format" in res.json()["detail"]

@pytest.mark.asyncio
async def test_get_leads_admin_endpoint():
    """GET /leads requires admin/safety_manager role and returns submitted leads"""
    # 1. Submit a lead
    payload = {
        "full_name": "Elena Rostova",
        "work_email": "elena@utilities-grid.org",
        "company_name": "Global Utilities Grid",
        "job_title": "Chief Safety Inspector",
        "facility_type": "Utilities",
        "company_size": "1000+",
        "current_inspection_process": "Some software"
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        await ac.post("/api/v1/leads", json=payload)

    # 2. GET /leads unauthenticated returns 401
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res_unauth = await ac.get("/api/v1/leads")
        assert res_unauth.status_code == 401

    # 3. GET /leads authenticated with admin token returns 200 with lead
    headers = {"Authorization": "Bearer admin_token"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res_auth = await ac.get("/api/v1/leads", headers=headers)
        assert res_auth.status_code == 200
        data = res_auth.json()
        assert data["status"] == "success"
        assert data["count"] >= 1
        assert data["leads"][0]["full_name"] == "Elena Rostova"
