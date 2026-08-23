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

@app.middleware("http")
async def rewrite_api_v1_prefix(request, call_next):
    """Transparently route legacy non-prefixed endpoints (e.g. /risk/ranked) to /api/v1/..."""
    path = request.url.path
    if not path.startswith("/api/v1") and path not in ["/", "/docs", "/openapi.json", "/redoc"]:
        request.scope["path"] = f"/api/v1{path}"
    return await call_next(request)

# Register API Routers under /api/v1
app.include_router(health.router)
app.include_router(assets.router)
app.include_router(risk.router)
app.include_router(upload.router)
app.include_router(leads.router)

# Also mount risk router endpoints under root / for legacy compatibility (/risk/ranked, /alerts, /risk/features)
from fastapi import APIRouter
legacy_risk_router = APIRouter(tags=["Legacy Aliases"])
for route in risk.router.routes:
    legacy_risk_router.routes.append(route)
app.include_router(legacy_risk_router)

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
