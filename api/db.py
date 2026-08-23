import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from api.config import settings
from api.models import Base

logger = logging.getLogger(__name__)

# Configure Async SQLAlchemy Engine for Neon Postgres or Async SQLite
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=300 if "postgresql" in settings.DATABASE_URL else -1,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for providing async DB session per request"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()

async def init_db() -> None:
    """Async database table bootstrap helper & column migration runner"""
    # Import all models to register tables on Base.metadata
    from api.models import organization, asset, risk_score, audit_log, alert, auth_event, lead, dataset_upload, asset_feature

    async with engine.begin() as conn:
        logger.info("Initializing database schema tables...")
        try:
            await conn.run_sync(Base.metadata.create_all)
        except Exception as e:
            logger.warning(f"Base.metadata.create_all warning: {e}")
            from sqlalchemy import text
            ddl_statements = [
                "CREATE TABLE IF NOT EXISTS organizations (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);",
                "CREATE TABLE IF NOT EXISTS assets (id SERIAL PRIMARY KEY, organization_id INTEGER DEFAULT 1, name VARCHAR(255) NOT NULL, asset_type VARCHAR(100) NOT NULL, location VARCHAR(255) NOT NULL, consequence_score INTEGER DEFAULT 3, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);",
                "CREATE TABLE IF NOT EXISTS risk_scores (id SERIAL PRIMARY KEY, organization_id INTEGER DEFAULT 1, asset_id INTEGER, rule_score DOUBLE PRECISION DEFAULT 0.0, ml_score DOUBLE PRECISION DEFAULT 0.0, fused_score DOUBLE PRECISION DEFAULT 0.0, risk_band VARCHAR(50) DEFAULT 'low', user_id VARCHAR(100), role VARCHAR(50), computed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);",
                "CREATE TABLE IF NOT EXISTS alerts (id SERIAL PRIMARY KEY, organization_id INTEGER DEFAULT 1, asset_id INTEGER, alert_level VARCHAR(50) NOT NULL, message TEXT NOT NULL, acknowledged BOOLEAN DEFAULT FALSE, user_id VARCHAR(100), role VARCHAR(50), created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);",
                "CREATE TABLE IF NOT EXISTS audit_log (id SERIAL PRIMARY KEY, organization_id INTEGER DEFAULT 1, asset_id INTEGER, input_data_snapshot JSONB, score_breakdown JSONB, user_id VARCHAR(100), role VARCHAR(50), previous_hash VARCHAR(64), hash VARCHAR(64), created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);",
                "CREATE TABLE IF NOT EXISTS auth_events (id SERIAL PRIMARY KEY, organization_id INTEGER DEFAULT 1, user_id VARCHAR(100) NOT NULL, email VARCHAR(255), event_type VARCHAR(50) NOT NULL, ip_address VARCHAR(50), created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);",
                "CREATE TABLE IF NOT EXISTS leads (id SERIAL PRIMARY KEY, full_name VARCHAR(255) NOT NULL, work_email VARCHAR(255) NOT NULL, phone_number VARCHAR(50), company_name VARCHAR(255), job_title VARCHAR(100), facility_type VARCHAR(100), company_size VARCHAR(50), current_process VARCHAR(100), use_case_notes TEXT, status VARCHAR(50) DEFAULT 'new', created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);"
            ]
            for stmt in ddl_statements:
                try:
                    await conn.execute(text(stmt))
                except Exception as stmt_err:
                    logger.warning(f"DDL statement warning: {stmt_err}")

        # Migration: Safely add user_id, role, organization_id, previous_hash, and hash columns if missing
        for table in ["assets", "risk_scores", "alerts", "audit_log", "auth_events"]:
            try:
                from sqlalchemy import text
                await conn.execute(text(f"ALTER TABLE {table} ADD COLUMN organization_id INTEGER DEFAULT 1"))
            except Exception:
                pass

        for table in ["risk_scores", "alerts", "audit_log"]:
            for col, col_type in [("user_id", "VARCHAR(100)"), ("role", "VARCHAR(50)")]:
                try:
                    from sqlalchemy import text
                    await conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
                except Exception:
                    pass

        for col in ["previous_hash", "hash"]:
            try:
                from sqlalchemy import text
                await conn.execute(text(f"ALTER TABLE audit_log ADD COLUMN {col} VARCHAR(64)"))
            except Exception:
                pass

    # Seed Default Organization #1
    try:
        async with AsyncSessionLocal() as session:
            from api.models.organization import Organization
            from sqlalchemy import select
            res = await session.execute(select(Organization).where(Organization.id == 1))
            org = res.scalar_one_or_none()
            if not org:
                org = Organization(id=1, name="Alpha Refining Corp")
                session.add(org)
                await session.commit()
    except Exception as e:
        logger.warning(f"Organization seeding check: {e}")

    logger.info("Database schema tables created & migrated successfully.")
