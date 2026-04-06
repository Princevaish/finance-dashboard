import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.middleware.rbac import require_admin, require_any_role
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services import user_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/",
    response_model=list[UserResponse],
    summary="List all users — admin only",
)
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin()),
) -> list[UserResponse]:
    """
    Returns all registered users.
    Restricted to: admin
    """
    logger.info("list_users called by user_id=%s", current_user.id)
    return user_service.get_all_users(db)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get own profile — any authenticated user",
)
def get_my_profile(
    current_user: User = Depends(require_any_role()),
) -> UserResponse:
    """
    Returns the profile of the currently authenticated user.
    Restricted to: viewer, analyst, admin
    """
    return UserResponse.model_validate(current_user)


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update user role — admin only",
)
def update_user_role(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin()),
) -> UserResponse:
    """
    Updates a user's role by ID.
    Restricted to: admin
    """
    logger.info("update_user_role user_id=%s, role_id=%s by admin user_id=%s", user_id, payload.role_id, current_user.id)
    return user_service.update_user_role(db, user_id, payload.role_id)


@router.put(
    "/{user_id}/deactivate",
    response_model=UserResponse,
    summary="Deactivate a user — admin only",
)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin()),
) -> UserResponse:
    """
    Deactivates a user account by ID.
    Restricted to: admin
    """
    logger.info("deactivate_user user_id=%s by admin user_id=%s", user_id, current_user.id)
    return user_service.deactivate_user(db, user_id)


@router.delete(
    "/{user_id}",
    status_code=204,
    summary="Delete a user — admin only",
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin()),
) -> None:
    """
    Permanently deletes a user account.
    Restricted to: admin
    """
    logger.info("delete_user user_id=%s by admin user_id=%s", user_id, current_user.id)
    user_service.delete_user(db, user_id)