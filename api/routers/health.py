import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from api.db import get_db
from api.config import settings
from api.schemas.health import HealthResponse

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Health Check"])

@router.get("/health", response_model=HealthResponse, status_code=status.HTTP_200_OK)
@router.get("/api/v1/health", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Health check endpoint verifying database connectivity and API status.
    Returns 200 OK when DB connection is operational, 503 if unreachable.
    """
    try:
        # Perform lightweight connectivity probe query
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        logger.error(f"Health check failed to query database: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connectivity check failed: {str(e)}"
        )

    return HealthResponse(
        status="healthy",
        database=db_status,
        timestamp=datetime.now(timezone.utc),
        version=settings.VERSION
    )
