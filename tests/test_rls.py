import os
import sys
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from api.main import app
from api.db import get_db, Base
from api.models.organization import Organization
from sqlalchemy.pool import StaticPool
from api.models.asset import Asset
from api.models.risk_score import RiskScore
from api.auth import apply_tenant_filter, AuthenticatedUser

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

@pytest_asyncio.fixture(autouse=True)
async def setup_multi_tenant_db():
    app.dependency_overrides[get_db] = override_get_db
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        # Seed Org 1 & Org 2
        org1 = Organization(id=1, name="Alpha Refining Corp")
        org2 = Organization(id=2, name="Beta Energy Ltd")
        session.add_all([org1, org2])

        # Seed Org 1 Asset
        asset_org1 = Asset(
            id=101,
            organization_id=1,
            name="Alpha Catalytic Pump #101",
            asset_type="Pump",
            location="Alpha Plant Deck",
            consequence_score=4
        )
        score_org1 = RiskScore(
            id=101,
            organization_id=1,
            asset_id=101,
            rule_score=80.0,
            ml_score=75.0,
            fused_score=77.5,
            risk_band="high"
        )
        session.add_all([asset_org1, score_org1])

        # Seed Org 2 Asset
        asset_org2 = Asset(
            id=202,
            organization_id=2,
            name="Beta Hydrogen Compressor #202",
            asset_type="Compressor",
            location="Beta Plant Deck",
            consequence_score=5
        )
        score_org2 = RiskScore(
            id=202,
            organization_id=2,
            asset_id=202,
            rule_score=95.0,
            ml_score=90.0,
            fused_score=92.5,
            risk_band="critical"
        )
        session.add_all([asset_org2, score_org2])

        await session.commit()

    yield

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_tenant_isolation_prevents_cross_org_read():
    """
    Verifies defense-in-depth tenant isolation:
    A query executed by Org 1 user against Org 2 data returns zero rows even if code omits WHERE clause.
    """
    user_org1 = AuthenticatedUser(
        user_id="usr_org1_operator",
        role="inspector",
        organization_id=1
    )
    user_org2 = AuthenticatedUser(
        user_id="usr_org2_operator",
        role="inspector",
        organization_id=2
    )

    async with TestSessionLocal() as session:
        # Deliberately "buggy" query missing explicit WHERE clause for asset_id=202 (Org 2)
        base_query = select(Asset).where(Asset.id == 202)
        
        # Apply RLS Tenant Isolation Filter
        filtered_query_org1 = apply_tenant_filter(base_query, user_org1, Asset)
        res_org1 = await session.execute(filtered_query_org1)
        rows_org1 = res_org1.scalars().all()
        
        # Org 1 user MUST receive ZERO rows for Org 2 asset
        assert len(rows_org1) == 0

        # Org 2 user querying Org 2 asset receives the row
        filtered_query_org2 = apply_tenant_filter(base_query, user_org2, Asset)
        res_org2 = await session.execute(filtered_query_org2)
        rows_org2 = res_org2.scalars().all()
        assert len(rows_org2) == 1
        assert rows_org2[0].name == "Beta Hydrogen Compressor #202"

@pytest.mark.asyncio
async def test_cross_org_api_endpoint_returns_zero_results():
    """
    Verifies GET /risk/ranked endpoint enforces tenant boundaries:
    Org 2 user sees ONLY Org 2 assets, Org 1 user sees ONLY Org 1 assets.
    """
    # Org 1 Header
    headers_org1 = {"Authorization": "Bearer inspector_token"} # Org 1
    # Org 2 Header
    headers_org2 = {"Authorization": "Bearer org2_user_token"} # Org 2

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res1 = await ac.get("/api/v1/risk/ranked", headers=headers_org1)
        assert res1.status_code == 200
        results1 = res1.json()["results"]
        assert all(r["asset_id"] == 101 for r in results1)

        res2 = await ac.get("/api/v1/risk/ranked", headers=headers_org2)
        assert res2.status_code == 200
        results2 = res2.json()["results"]
        assert all(r["asset_id"] == 202 for r in results2)
