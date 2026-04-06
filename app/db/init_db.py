import logging
from sqlalchemy.orm import Session
from app.models.role import Role
from app.models.user import User
from app.core.security import hash_password

logger = logging.getLogger(__name__)

DEFAULT_ROLES: list[str] = ["viewer", "analyst", "admin"]

# Only created if no users exist at all — safe for production
SEED_ADMIN_EMAIL = "admin@example.com"
SEED_ADMIN_PASSWORD = "securepass123"   # change after first login


def init_db(db: Session) -> None:
    # ── Seed roles ────────────────────────────────────────────────────────────
    try:
        for role_name in DEFAULT_ROLES:
            existing = db.query(Role).filter(Role.name == role_name).first()
            if not existing:
                db.add(Role(name=role_name))
                logger.info("Seeded role: '%s'", role_name)
            else:
                logger.debug("Role already present: '%s'", role_name)
        db.commit()
        logger.info("init_db complete — all default roles are present.")
    except Exception:
        db.rollback()
        logger.exception("init_db FAILED during role seeding.")
        raise

    # ── Seed default admin user (only if no users exist) ─────────────────────
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            admin_role = db.query(Role).filter(Role.name == "admin").first()
            if admin_role:
                admin_user = User(
                    email=SEED_ADMIN_EMAIL,
                    hashed_password=hash_password(SEED_ADMIN_PASSWORD),
                    is_active=True,
                    role_id=admin_role.id,
                )
                db.add(admin_user)
                db.commit()
                logger.info(
                    "Seeded default admin user: email=%s — CHANGE THIS PASSWORD.",
                    SEED_ADMIN_EMAIL,
                )
            else:
                logger.error("Admin role missing — cannot seed admin user.")
        else:
            logger.debug("Users already exist — skipping admin seed.")
    except Exception:
        db.rollback()
        logger.exception("init_db FAILED during admin user seeding.")
        raise