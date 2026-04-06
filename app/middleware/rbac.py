from __future__ import annotations

import logging
from collections.abc import Callable

from fastapi import Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)


def require_role(required_roles: list[str]) -> Callable:
    """
    RBAC dependency factory.
    Builds on top of get_current_user — authentication is always checked first.
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role is None:
            logger.warning(
                "Access denied: user_id=%s has no role assigned", current_user.id
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No role assigned to this account. Contact support.",
            )

        user_role = current_user.role.name

        if user_role not in required_roles:
            logger.warning(
                "Access denied: user_id=%s role='%s' required=%s",
                current_user.id, user_role, required_roles,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required: {required_roles}. Your role: '{user_role}'.",
            )

        logger.debug(
            "Access granted: user_id=%s role='%s'", current_user.id, user_role
        )
        return current_user

    return role_checker


def require_admin() -> Callable:
    return require_role(["admin"])


def require_analyst_or_above() -> Callable:
    return require_role(["analyst", "admin"])


def require_any_role() -> Callable:
    return require_role(["viewer", "analyst", "admin"])