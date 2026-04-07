import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.db import base  # noqa: F401 — registers all models with SQLAlchemy
from app.db.init_db import init_db
from app.db.session import SessionLocal

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan ──────────────────────────────────────────────────────────────────
# Keep lifespan lean. Any exception here causes Render to mark the deploy
# as failed, which surfaces as 503 — not a CORS error, but worth noting.
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=== Startup: seeding DB ===")
    db = SessionLocal()
    try:
        init_db(db)
    except Exception:
        logger.exception("FATAL: init_db failed.")
        raise
    finally:
        db.close()
    yield
    logger.info("=== Shutdown ===")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    lifespan=lifespan,
)


# ── CORS — must be the FIRST middleware registered ────────────────────────────
#
# Why order matters:
#   FastAPI/Starlette applies middleware as a stack (LIFO).
#   The last-registered middleware wraps the outermost layer.
#   CORSMiddleware must be outermost so it can:
#     1. Intercept OPTIONS preflight requests before any auth/routing runs
#     2. Return 200 + CORS headers without touching the actual route
#
# If you add any other middleware (e.g. auth, logging) BEFORE this line,
# those middlewares wrap OUTSIDE of CORS and will see the raw OPTIONS
# request — which they reject with 400/401 because it has no auth token.
#
# Rule: app.add_middleware(CORSMiddleware, ...) must come FIRST,
#       before any other app.add_middleware() call.

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    # Add every Vercel URL that appears as Origin in browser network logs.
    # Check the exact string — no trailing slash, exact subdomain.
    "https://finance-dashboard-ten-puce.vercel.app",
    "https://finance-dashboard-pquhjo6rv-princevaishs-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    # allow_credentials=True requires explicit origins (no wildcard "*").
    # Since we use JWT in Authorization header (not cookies), False is correct
    # and simpler — keeps OPTIONS responses clean.
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With",
    ],
    # Browsers cache preflight results for this many seconds.
    # 600 = 10 minutes, reduces repeated OPTIONS round-trips in production.
    max_age=600,
)


# ── Global OPTIONS handler ────────────────────────────────────────────────────
#
# Why this exists:
#   CORSMiddleware handles OPTIONS for routes that are registered in FastAPI.
#   If a route doesn't exist yet (typo, version mismatch) OR if any
#   middleware short-circuits before CORS runs, the browser gets a 404/400
#   for OPTIONS and blocks the real request.
#
#   This catch-all ensures every OPTIONS preflight gets 200 regardless of
#   whether the actual route exists. The real route will enforce auth/validation
#   when the browser follows up with the actual GET/POST.
#
#   This is not a security hole — OPTIONS carries no payload and no auth,
#   and the actual request still goes through all your normal guards.

@app.options("/{rest_of_path:path}")
async def global_options_handler(rest_of_path: str, request: Request) -> Response:
    """
    Return 200 for all OPTIONS preflight requests.
    CORSMiddleware adds the actual CORS headers on top of this response.
    """
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin":  request.headers.get("origin", "*"),
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, Origin, X-Requested-With",
            "Access-Control-Max-Age":       "600",
        },
    )


# ── Routes ────────────────────────────────────────────────────────────────────
# Include routers AFTER middleware registration.
app.include_router(api_router, prefix=settings.API_V1_STR)


# ── Health check ──────────────────────────────────────────────────────────────
# Render pings this to verify the service is alive.
# Returning 200 here prevents Render from cycling the instance.
@app.get("/health", tags=["Health"], include_in_schema=False)
async def health_check():
    return {"status": "ok"}
