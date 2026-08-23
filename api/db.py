import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from api.config import settings
from api.models import Base, Organization, Asset, RiskScore, AuditLog, Alert, AssetFeature, AuthEvent, DatasetUpload, Lead

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
    async with engine.begin() as conn:
        logger.info("Initializing database schema tables on Neon Postgres...")
        await conn.run_sync(Base.metadata.create_all)

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
