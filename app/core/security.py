from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import ExpiredSignatureError, JWTError, jwt

from app.core.config import settings

logger = logging.getLogger(__name__)


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def create_access_token(data: dict[str, Any]) -> str:
    """
    Creates a signed JWT.
    Payload MUST include user_id — get_current_user depends on it.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})

    # Log exactly what goes INTO the token (never log in prod without redacting)
    logger.debug(
        "create_access_token: payload keys=%s user_id=%s",
        list(to_encode.keys()),
        to_encode.get("user_id"),
    )

    token = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    return token


def decode_access_token(token: str) -> dict[str, Any] | None:
    """
    Decodes and validates a JWT.
    Returns payload dict on success, None on any failure.
    Logs exactly WHY decoding failed.
    """
    logger.debug(
        "decode_access_token: attempting decode, token_prefix=%s",
        token[:20] if token else "EMPTY",
    )
    logger.debug(
        "decode_access_token: using SECRET_KEY prefix=%s ALGORITHM=%s",
        settings.SECRET_KEY[:6],
        settings.ALGORITHM,
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        logger.debug(
            "decode_access_token: SUCCESS keys=%s user_id=%s",
            list(payload.keys()),
            payload.get("user_id"),
        )
        return payload

    except ExpiredSignatureError:
        logger.warning("decode_access_token: FAILED — token is EXPIRED")
        return None

    except JWTError as e:
        logger.warning("decode_access_token: FAILED — JWTError: %s", str(e))
        return None

    except Exception:
        logger.exception("decode_access_token: FAILED — unexpected exception")
        return None