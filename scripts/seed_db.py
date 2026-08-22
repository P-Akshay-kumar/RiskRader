import asyncio
import sys
import os
from datetime import datetime, timezone

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from api.db import engine, AsyncSessionLocal, init_db
from api.models.asset import Asset
from api.models.risk_score import RiskScore, Explanation
from api.models.audit_log import AuditLog
from api.models.alert import Alert

sample_assets = [
    {
        "name": "High-Pressure Catalytic Feed Pump (PUMP-408B)",
        "asset_type": "Centrifugal Pump",
        "location": "Cracker Unit 3",
        "consequence_score": 5, # Critical
    },
    {
        "name": "Turbine Gas Compressor A (COMP-102)",
        "asset_type": "Gas Compressor",
        "location": "Reformer Deck B",
        "consequence_score": 4, # High
    },
    {
        "name": "Auxiliary Boiler Inlet Valve (VALVE-881)",
        "asset_type": "Control Valve",
        "location": "Boiler Line B",
        "consequence_score": 2, # Medium
    },
    {
        "name": "Distillation Tower Reboiler (TOWER-304)",
        "asset_type": "Heat Exchanger",
        "location": "Fractionation Plant",
        "consequence_score": 5, # Critical
    },
]

async def seed():
    print("Initializing database tables for seeding...")
    await init_db()

    async with AsyncSessionLocal() as session:
        # Check if assets already exist
        result = await session.execute(select(Asset))
        existing_assets = result.scalars().all()

        if existing_assets:
            print(f"Database already contains {len(existing_assets)} assets. Skipping duplicate insertion.")
            return

        print("Seeding sample industrial assets...")
        created_assets = []
        for asset_data in sample_assets:
            asset = Asset(**asset_data)
            session.add(asset)
            created_assets.append(asset)

        await session.commit()

        # Refresh created assets to get IDs
        for asset in created_assets:
            await session.refresh(asset)
            print(f"Created Asset ID {asset.id}: {asset.name} (Consequence: {asset.consequence_score}/5)")

        # Create initial Risk Score + Explanation for Asset #1 (PUMP-408B)
        pump = created_assets[0]
        risk_score = RiskScore(
            asset_id=pump.id,
            rule_score=92.0,
            ml_score=84.0,
            fused_score=87.0,
            risk_band="critical",
            computed_at=datetime.now(timezone.utc)
        )
        session.add(risk_score)
        await session.commit()
        await session.refresh(risk_score)

        explanation = Explanation(
            risk_score_id=risk_score.id,
            explanation_text="Vibration levels +140% over baseline combined with 14-day service overdue state.",
            recommended_action="Trigger immediate seal cooling & isolate secondary bypass valve within 45 mins.",
            retrieved_source_snippet="SOP-402 Section 3.2: High-Pressure Bearing Cavitation Relief & Seal Maintenance",
            retrieved_source_title="Plant SOP-402: Centrifugal Pump Cavitation Protocol"
        )
        session.add(explanation)
        await session.commit()
        await session.refresh(explanation)

        # Create initial Audit Log Entry (Append-only)
        audit = AuditLog(
            asset_id=pump.id,
            input_data_snapshot={
                "vibration_mms": 7.8,
                "temperature_c": 112.4,
                "days_overdue": 14,
                "inspection_condition": "Minor Abnormality (Seal weeping)"
            },
            score_breakdown={
                "rule_score": 92.0,
                "ml_score": 84.0,
                "fused_score": 87.0,
                "shap_attributions": {
                    "vibration": 0.38,
                    "temperature": 0.29,
                    "maintenance_delay": 0.18,
                    "inspection_history": 0.15
                }
            },
            explanation_id=explanation.id
        )
        session.add(audit)

        # Create initial Alert
        alert = Alert(
            asset_id=pump.id,
            previous_band="medium",
            new_band="critical",
            triggered_at=datetime.now(timezone.utc),
            acknowledged=False
        )
        session.add(alert)

        await session.commit()
        print("Database successfully seeded with assets, risk scores, RAG explanations, audit logs, and alerts!")

if __name__ == "__main__":
    asyncio.run(seed())
