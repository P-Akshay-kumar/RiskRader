import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.config import settings
from api.db import init_db
from api.routers import health, assets, risk, upload, leads

# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager handling startup & shutdown procedures"""
    logger.info("Initializing RiskRadar API server...")
    try:
        await init_db()
    except Exception as e:
        logger.warning(f"Database table initialization warning: {e}")
    yield
    logger.info("Shutting down RiskRadar API server...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="RiskRadar Industrial Safety Risk Intelligence FastAPI Backend",
    lifespan=lifespan
)

# Configure CORS for Vercel Frontend & Local Dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api/v1 prefix
app.include_router(health.router, prefix="/api/v1")
app.include_router(assets.router, prefix="/api/v1")
app.include_router(risk.router, prefix="/api/v1")
app.include_router(upload.router, prefix="/api/v1")
app.include_router(leads.router, prefix="/api/v1")

# Also register API Routers under root / for direct compatibility (/risk/ranked, /alerts, /risk/features, /upload/dataset)
app.include_router(health.router)
app.include_router(assets.router)
app.include_router(risk.router)
app.include_router(upload.router)
app.include_router(leads.router)

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    """Root endpoint returning API status overview (supports GET & HEAD for Render health checks)"""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "docs_url": "/docs",
        "health_check": "/api/v1/health"
    }
