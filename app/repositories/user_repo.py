import logging
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError

from app.models.user import User
from app.models.role import Role

logger = logging.getLogger(__name__)


def get_user_by_email(db: Session, email: str) -> User | None:
    """Fetch user by email with role eagerly loaded."""
    try:
        return (
            db.query(User)
            .options(joinedload(User.role))
            .filter(User.email == email)
            .first()
        )
    except SQLAlchemyError:
        logger.exception("DB error in get_user_by_email for email=%s", email)
        raise


def get_user_by_id(db: Session, user_id: int) -> User | None:
    """Fetch user by ID with role eagerly loaded."""
    try:
        return (
            db.query(User)
            .options(joinedload(User.role))
            .filter(User.id == user_id)
            .first()
        )
    except SQLAlchemyError:
        logger.exception("DB error in get_user_by_id for user_id=%s", user_id)
        raise


def get_role_by_name(db: Session, name: str) -> Role | None:
    """
    Fetch a role by name.
    Logs clearly when missing so we know if init_db() failed silently.
    """
    try:
        role = db.query(Role).filter(Role.name == name).first()
        if role is None:
            logger.error(
                "Role '%s' does not exist in DB. "
                "Ensure init_db() ran successfully at startup.",
                name,
            )
        else:
            logger.debug("Role fetched: id=%s name=%s", role.id, role.name)
        return role
    except SQLAlchemyError:
        logger.exception("DB error in get_role_by_name for name=%s", name)
        raise


def create_user(
    db: Session,
    *,  # force keyword-only — prevents silent positional arg bugs
    email: str,
    hashed_password: str,
    role_id: int,
) -> User:
    """
    Explicitly maps every field onto the User model.
    Never uses **dict unpacking — prevents silent column mismatches.
    """
    user = User(
        email=email,
        hashed_password=hashed_password,  # MUST match exact column name in models/user.py
        is_active=True,
        role_id=role_id,
    )

    logger.debug(
        "Attempting to create user: email=%s role_id=%s", email, role_id
    )

    try:
        db.add(user)
        db.commit()         # persist to DB
        db.refresh(user)    # reload to get DB-generated id, defaults, etc.

        # Touch the role relationship NOW while session is open
        # Prevents DetachedInstanceError if role is accessed after session closes
        if user.role:
            logger.debug("Role loaded on user: %s", user.role.name)

        logger.info(
            "User created successfully: id=%s email=%s role_id=%s",
            user.id, user.email, user.role_id,
        )
        return user

    except SQLAlchemyError:
        db.rollback()
        logger.exception(
            "DB error while creating user email=%s — transaction rolled back.", email
        )
        raise