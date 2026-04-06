from __future__ import annotations

import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.repositories import user_repo

logger = logging.getLogger(__name__)

# Full path must match exactly where login is mounted.
# Verify with: uvicorn startup log → "POST /api/v1/auth/login"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Reusable 401 exception
_CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials.",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Full auth dependency with step-by-step debug logging.
    Every failure point is logged before raising.
    """

    # ── Step 1: confirm token was received ───────────────────────────────────
    logger.debug("get_current_user: STEP 1 — token received")
    logger.debug("get_current_user: token prefix = '%s...'", token[:30] if token else "NONE")

    if not token:
        logger.warning("get_current_user: STEP 1 FAILED — token is empty")
        raise _CREDENTIALS_EXCEPTION

    # ── Step 2: decode token ──────────────────────────────────────────────────
    logger.debug("get_current_user: STEP 2 — decoding token")

    try:
        payload = decode_access_token(token)
    except Exception:
        # decode_access_token should never raise (returns None on failure),
        # but we guard here in case of unexpected issues
        logger.exception("get_current_user: STEP 2 FAILED — decode raised unexpectedly")
        raise _CREDENTIALS_EXCEPTION

    if payload is None:
        logger.warning(
            "get_current_user: STEP 2 FAILED — decode returned None "
            "(token invalid, expired, or wrong SECRET_KEY)"
        )
        raise _CREDENTIALS_EXCEPTION

    logger.debug("get_current_user: STEP 2 OK — payload = %s", payload)

    # ── Step 3: extract user_id ───────────────────────────────────────────────
    logger.debug("get_current_user: STEP 3 — extracting user_id")

    # CRITICAL: key must be "user_id" — matches what create_access_token puts in
    user_id: int | None = payload.get("user_id")

    logger.debug("get_current_user: STEP 3 — user_id = %s (type=%s)", user_id, type(user_id))

    if user_id is None:
        logger.warning(
            "get_current_user: STEP 3 FAILED — 'user_id' key not in payload. "
            "Payload keys: %s. "
            "This means create_access_token used a different key (e.g. 'sub').",
            list(payload.keys()),
        )
        raise _CREDENTIALS_EXCEPTION

    # ── Step 4: fetch user from DB ────────────────────────────────────────────
    logger.debug("get_current_user: STEP 4 — fetching user_id=%s from DB", user_id)

    try:
        user = user_repo.get_user_by_id(db, int(user_id))
    except Exception:
        logger.exception(
            "get_current_user: STEP 4 FAILED — DB error fetching user_id=%s", user_id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error during authentication.",
        )

    if user is None:
        logger.warning(
            "get_current_user: STEP 4 FAILED — user_id=%s not found in DB "
            "(user deleted after token was issued?)",
            user_id,
        )
        raise _CREDENTIALS_EXCEPTION

    logger.debug(
        "get_current_user: STEP 4 OK — found user: id=%s email=%s active=%s",
        user.id,
        user.email,
        user.is_active,
    )

    # ── Step 5: active check ──────────────────────────────────────────────────
    if not user.is_active:
        logger.warning(
            "get_current_user: STEP 5 FAILED — user_id=%s is deactivated", user_id
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact support.",
        )

    logger.debug(
        "get_current_user: SUCCESS — user_id=%s role=%s",
        user.id,
        user.role.name if user.role else "NO ROLE",
    )
    return user