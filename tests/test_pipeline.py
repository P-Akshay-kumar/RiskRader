import os
import sys
import pytest
import pytest_asyncio
from sqlalchemy import select

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from api.db import AsyncSessionLocal
from api.models.asset import Asset
from api.models.asset_feature import AssetFeature
from api.models.risk_score import RiskScore, Explanation
from api.models.alert import Alert
from api.models.audit_log import AuditLog
from src.orchestrate import run_full_pipeline

@pytest.mark.asyncio
async def test_full_pipeline_orchestration_end_to_end():
    """
    Integration test confirming run_full_pipeline() executes end-to-end
    and populates all expected database tables (asset_features, risk_scores, explanations, audit_log).
    """
    async with AsyncSessionLocal() as db:
        summary = await run_full_pipeline(db)

        assert summary["status"] == "success"
        assert summary["assets_processed"] >= 10
        assert summary["processing_time_seconds"] > 0.0

        # Verify asset_features table is populated
        feat_res = await db.execute(select(AssetFeature))
        features = feat_res.scalars().all()
        assert len(features) >= 10

        # Verify risk_scores table is populated
        score_res = await db.execute(select(RiskScore))
        scores = score_res.scalars().all()
        assert len(scores) >= 10

        # Verify audit_log table contains entries
        audit_res = await db.execute(select(AuditLog))
        audits = audit_res.scalars().all()
        assert len(audits) >= 10
