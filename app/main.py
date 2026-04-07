import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

# ── CRITICAL: must be first import before any DB/ORM usage ──────────────────
# This registers all models with SQLAlchemy's mapper registry.
# Without this, relationship() string references like "FinancialRecord"
# cannot be resolved and the mapper explodes on first query.
from app.db import base  # noqa: F401

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.init_db import init_db
from app.db.session import SessionLocal

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=== Startup: seeding DB ===")
    db = SessionLocal()
    try:
        init_db(db)
    except Exception:
        logger.exception("FATAL: init_db failed — aborting startup.")
        raise
    finally:
        db.close()

    yield

    logger.info("=== Shutdown ===")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    lifespan=lifespan,
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://finance-dashboard-ten-puce.vercel.app","https://finance-dashboard-pquhjo6rv-princevaishs-projects.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)
