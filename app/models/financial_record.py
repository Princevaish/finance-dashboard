from __future__ import annotations

import enum
from datetime import date as date_type
from typing import TYPE_CHECKING

from sqlalchemy import Integer, Numeric, String, Text, Date, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base_class import Base

if TYPE_CHECKING:
    from app.models.user import User


class RecordType(str, enum.Enum):
    income = "income"
    expense = "expense"


class FinancialRecord(Base):
    __tablename__ = "financial_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    type: Mapped[RecordType] = mapped_column(
        Enum(RecordType, name="record_type_enum"), nullable=False
    )
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    date: Mapped[date_type] = mapped_column(Date, nullable=False, index=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped[User] = relationship("User", back_populates="financial_records")

    def __repr__(self) -> str:
        return f"<FinancialRecord(id={self.id}, user_id={self.user_id}, type='{self.type}')>"