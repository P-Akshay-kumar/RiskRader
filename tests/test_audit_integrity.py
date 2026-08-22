import os
import sys
import json
import hashlib
from datetime import datetime, timezone
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from api.main import app
from sqlalchemy.pool import StaticPool
from api.db import get_db, Base
from api.models.asset import Asset
from api.models.audit_log import AuditLog

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
async def setup_audit_integrity_db():
    app.dependency_overrides[get_db] = override_get_db
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        asset = Asset(
            id=301,
            organization_id=1,
            name="Primary Catalytic Feed Reactor",
            asset_type="Reactor",
            location="Unit 3",
            consequence_score=5
        )
        session.add(asset)

        # Seed Entry 1
        now = datetime.now(timezone.utc)
        genesis_hash = "GENESIS_HASH_CHAIN_0000000000000000000000000000000000000000000"
        entry1 = AuditLog(
            id=1,
            organization_id=1,
            asset_id=301,
            input_data_snapshot={"maintenance_days_overdue": 120},
            score_breakdown={"rule_score": 75.0, "ml_score": 70.0, "fused_score": 72.5},
            previous_hash=genesis_hash,
            created_at=now
        )
        entry1.hash = entry1.calculate_entry_hash(genesis_hash)
        session.add(entry1)

        # Seed Entry 2
        entry2 = AuditLog(
            id=2,
            organization_id=1,
            asset_id=301,
            input_data_snapshot={"maintenance_days_overdue": 180},
            score_breakdown={"rule_score": 90.0, "ml_score": 85.0, "fused_score": 87.5},
            previous_hash=entry1.hash,
            created_at=now
        )
        entry2.hash = entry2.calculate_entry_hash(entry1.hash)
        session.add(entry2)

        await session.commit()

    yield

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_audit_log_update_raises_permission_error():
    """Attempting an UPDATE directly against audit_log raises a PermissionError at DB/ORM level"""
    async with TestSessionLocal() as session:
        res = await session.execute(select(AuditLog).where(AuditLog.id == 1))
        audit_entry = res.scalar_one()

        audit_entry.user_id = "malicious_hacker"
        with pytest.raises(PermissionError) as exc_info:
            await session.commit()

        assert "AuditLog records are append-only and immutable" in str(exc_info.value)
        await session.rollback()

@pytest.mark.asyncio
async def test_audit_log_delete_raises_permission_error():
    """Attempting a DELETE directly against audit_log raises a PermissionError at DB/ORM level"""
    async with TestSessionLocal() as session:
        res = await session.execute(select(AuditLog).where(AuditLog.id == 1))
        audit_entry = res.scalar_one()

        await session.delete(audit_entry)
        with pytest.raises(PermissionError) as exc_info:
            await session.commit()

        assert "AuditLog records are append-only and immutable" in str(exc_info.value)
        await session.rollback()

@pytest.mark.asyncio
async def test_hash_chain_verification_endpoint_valid_chain():
    """GET /audit-log/verify/{asset_id} returns verified=True for intact hash chain"""
    headers = {"Authorization": "Bearer inspector_token"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/audit-log/verify/301", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["verified"] is True
        assert data["chain_status"] == "INTACT"
        assert data["total_records"] == 2

@pytest.mark.asyncio
async def test_hash_chain_verification_detects_corrupted_record():
    """GET /audit-log/verify/{asset_id} correctly detects a deliberately corrupted row in a test fixture"""
    # Deliberately corrupt entry #1 directly in DB bypassing ORM listeners
    async with test_engine.begin() as conn:
        from sqlalchemy import text
        await conn.execute(text("UPDATE audit_log SET hash = 'corrupted_fake_hash_123456789' WHERE id = 1"))

    headers = {"Authorization": "Bearer inspector_token"}
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/audit-log/verify/301", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["verified"] is False
        assert data["chain_status"] == "CORRUPTED"
        assert data["corrupted_record_id"] == 1
        assert "Audit trail tampering detected" in data["message"]
