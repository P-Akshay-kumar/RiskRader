import os
import sys
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from api.main import app
from api.db import get_db, Base
from api.models.asset import Asset
from api.models.risk_score import RiskScore, Explanation
from src.report_generator import generate_asset_report, generate_facility_report

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
async def setup_report_db():
    app.dependency_overrides[get_db] = override_get_db
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        # Asset 1: High Risk with Explanation
        asset1 = Asset(id=601, organization_id=1, name="High Temp Hydrocracker", asset_type="Reactor", location="Unit 1", consequence_score=5)
        score1 = RiskScore(id=601, organization_id=1, asset_id=601, rule_score=85.0, ml_score=90.0, fused_score=87.5, risk_band="high")
        exp1 = Explanation(id=601, risk_score_id=601, explanation_text="High temperature trigger", recommended_action="Inspect cooling jacket", retrieved_source_title="Hydrocracker SOP")
        session.add_all([asset1, score1, exp1])

        # Asset 2: Medium Risk without RAG Explanation (Graceful fallback test)
        asset2 = Asset(id=602, organization_id=1, name="Medium Press Feeder", asset_type="Feeder", location="Unit 2", consequence_score=3)
        score2 = RiskScore(id=602, organization_id=1, asset_id=602, rule_score=60.0, ml_score=65.0, fused_score=62.5, risk_band="medium")
        session.add_all([asset2, score2])

        # Asset 3: Low Risk
        asset3 = Asset(id=603, organization_id=1, name="Low Risk Cooling Water Valve", asset_type="Valve", location="Bay 3", consequence_score=1)
        score3 = RiskScore(id=603, organization_id=1, asset_id=603, rule_score=10.0, ml_score=15.0, fused_score=12.5, risk_band="low")
        session.add_all([asset3, score3])

        await session.commit()

    yield

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_generate_asset_report_bytes():
    """generate_asset_report() produces valid non-empty PDF bytes for a seeded asset"""
    async with TestSessionLocal() as session:
        pdf_bytes = await generate_asset_report(session, 601)
        assert isinstance(pdf_bytes, bytes)
        assert len(pdf_bytes) > 1000
        assert pdf_bytes.startswith(b"%PDF")

@pytest.mark.asyncio
async def test_generate_asset_report_fallback_no_explanation():
    """generate_asset_report() handles an asset with no RAG explanation gracefully without crashing"""
    async with TestSessionLocal() as session:
        pdf_bytes = await generate_asset_report(session, 602)
        assert isinstance(pdf_bytes, bytes)
        assert len(pdf_bytes) > 1000
        assert pdf_bytes.startswith(b"%PDF")

@pytest.mark.asyncio
async def test_generate_facility_report_filters_flagged():
    """generate_facility_report() includes medium/high risk assets and produces multi-page facility summary"""
    async with TestSessionLocal() as session:
        pdf_bytes = await generate_facility_report(session, organization_id=1)
        assert isinstance(pdf_bytes, bytes)
        assert len(pdf_bytes) > 1500
        assert pdf_bytes.startswith(b"%PDF")

@pytest.mark.asyncio
async def test_asset_pdf_export_endpoint():
    """GET /risk/{asset_id}/export-pdf returns 200 with PDF content-type"""
    headers = {"Authorization": "Bearer inspector_token"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/risk/601/export-pdf", headers=headers)
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        assert "riskradar_" in res.headers["content-disposition"]
        assert len(res.content) > 1000

@pytest.mark.asyncio
async def test_facility_pdf_export_endpoint():
    """GET /reports/facility-export-pdf returns 200 with PDF content-type"""
    headers = {"Authorization": "Bearer inspector_token"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/reports/facility-export-pdf", headers=headers)
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        assert "riskradar_facility_summary_" in res.headers["content-disposition"]
        assert len(res.content) > 1000
