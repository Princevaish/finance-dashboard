import logging

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import TokenResponse
from app.schemas.user import UserCreate, UserResponse
from app.services import auth_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user with optional role",
    responses={
        400: {"description": "Email already registered or invalid role"},
        500: {"description": "Server or database error"},
    },
)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    """
    Registers a new user.

    Body:
        email: valid email address
        password: minimum 8 characters
        role: one of "viewer" | "analyst" | "admin" (defaults to "viewer")
    """
    logger.info("POST /register for email=%s role=%s", payload.email, payload.role)
    return auth_service.register_user(db, payload)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Login and receive a JWT token",
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> TokenResponse:
    logger.info("POST /login for username=%s", form_data.username)
    return auth_service.login_user(db, form_data.username, form_data.password)