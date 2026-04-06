from __future__ import annotations

from typing import TYPE_CHECKING
from sqlalchemy import Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

if TYPE_CHECKING:
    # These imports are ONLY for type checkers (mypy/pyright).
    # They do NOT run at runtime, so they cannot cause circular imports.
    from app.models.role import Role
    from app.models.financial_record import FinancialRecord


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    role_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("roles.id", ondelete="SET NULL"), nullable=True
    )

    # String references ("FinancialRecord") let SQLAlchemy resolve the class
    # lazily after ALL models are imported — this is the correct pattern.
    role: Mapped[Role | None] = relationship("Role", back_populates="users")
    financial_records: Mapped[list[FinancialRecord]] = relationship(
        "FinancialRecord",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}')>"