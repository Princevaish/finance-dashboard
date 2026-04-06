from __future__ import annotations

import logging

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories import user_repo
from app.schemas.user import UserResponse

logger = logging.getLogger(__name__)


def get_all_users(db: Session) -> list[UserResponse]:
    users = db.query(User).order_by(User.id).all()
    return [UserResponse.model_validate(u) for u in users]


def deactivate_user(db: Session, user_id: int) -> UserResponse:
    user = _get_or_404(db, user_id)
    user.is_active = False
    db.commit()
    db.refresh(user)
    logger.info("User deactivated: id=%s", user_id)
    return UserResponse.model_validate(user)


def update_user_role(db: Session, user_id: int, role_id: int) -> UserResponse:
    user = _get_or_404(db, user_id)
    user.role_id = role_id
    db.commit()
    db.refresh(user)
    logger.info("User role updated: id=%s, role_id=%s", user_id, role_id)
    return UserResponse.model_validate(user)


def delete_user(db: Session, user_id: int) -> None:
    user = _get_or_404(db, user_id)
    db.delete(user)
    db.commit()
    logger.info("User deleted: id=%s", user_id)


def _get_or_404(db: Session, user_id: int) -> User:
    user = user_repo.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id={user_id} not found.",
        )
    return user