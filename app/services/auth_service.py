import logging

from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.repositories import user_repo
from app.schemas.auth import TokenResponse
from app.schemas.user import UserCreate, UserResponse

logger = logging.getLogger(__name__)

DEFAULT_ROLE  = "viewer"
ALLOWED_ROLES = {"viewer", "analyst", "admin"}


def register_user(db: Session, user_data: UserCreate) -> UserResponse:
    logger.info("register_user() called for email=%s role=%s", user_data.email, user_data.role)

    # ── Guard 1: duplicate email ──────────────────────────────────────────────
    try:
        existing = user_repo.get_user_by_email(db, user_data.email)
    except SQLAlchemyError:
        logger.exception("DB error during duplicate-email check.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error during registration. Please try again.",
        )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    # ── Guard 2: validate requested role ─────────────────────────────────────
    requested_role = (user_data.role or DEFAULT_ROLE).strip().lower()

    if requested_role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{requested_role}'. Allowed roles: {sorted(ALLOWED_ROLES)}.",
        )

    # ── Guard 3: role must exist in DB ────────────────────────────────────────
    try:
        role = user_repo.get_role_by_name(db, requested_role)
    except SQLAlchemyError:
        logger.exception("DB error fetching role '%s'.", requested_role)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error during registration. Please try again.",
        )

    if role is None:
        logger.error(
            "Role '%s' not found in DB. Was init_db() run?", requested_role
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error. Please contact support.",
        )

    logger.debug("Assigning role: id=%s name=%s", role.id, role.name)

    # ── Step 4: hash password ─────────────────────────────────────────────────
    try:
        hashed = hash_password(user_data.password)
    except Exception:
        logger.exception("Password hashing failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not process registration. Please try again.",
        )

    # ── Step 5: persist user ──────────────────────────────────────────────────
    try:
        user = user_repo.create_user(
            db,
            email=user_data.email,
            hashed_password=hashed,
            role_id=role.id,
        )
    except SQLAlchemyError:
        logger.exception("DB error persisting user email=%s.", user_data.email)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save user. Please try again.",
        )

    logger.info(
        "Registration complete: user_id=%s email=%s role=%s",
        user.id, user.email, requested_role,
    )

    try:
        return UserResponse.model_validate(user)
    except Exception:
        logger.exception("UserResponse serialization failed for user_id=%s.", user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User created but response serialization failed.",
        )


def login_user(db: Session, email: str, password: str) -> TokenResponse:
    logger.info("login_user() called for email=%s", email)

    try:
        user = user_repo.get_user_by_email(db, email)
    except SQLAlchemyError:
        logger.exception("DB error during login for email=%s.", email)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error. Please try again.",
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    try:
        valid = verify_password(password, user.hashed_password)
    except Exception:
        logger.exception("Password verification error for email=%s.", email)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication error. Please try again.",
        )

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact support.",
        )

    role_name = user.role.name if user.role else DEFAULT_ROLE
    token = create_access_token(
        data={"user_id": user.id, "email": user.email, "role": role_name}
    )

    logger.info("Login successful: user_id=%s role=%s", user.id, role_name)
    return TokenResponse(access_token=token)