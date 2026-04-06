from __future__ import annotations

from datetime import date as Date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from app.models.financial_record import RecordType


class RecordCreate(BaseModel):
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    type: RecordType
    category: str = Field(..., min_length=1, max_length=100)
    date: Date
    notes: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("category")
    @classmethod
    def category_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Category cannot be blank.")
        return v.strip()

    @field_validator("notes")
    @classmethod
    def notes_not_blank(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            return None
        return v.strip() if v else v


class RecordUpdate(BaseModel):
    amount: Optional[Decimal] = Field(default=None, gt=0, decimal_places=2)
    type: Optional[RecordType] = None
    category: Optional[str] = Field(default=None, min_length=1, max_length=100)
    date: Optional[Date] = None
    notes: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("category")
    @classmethod
    def category_not_blank(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Category cannot be blank.")
        return v.strip() if v else v


class RecordResponse(BaseModel):
    id: int
    user_id: int
    amount: Decimal
    type: RecordType
    category: str
    date: Date
    notes: Optional[str]

    model_config = {
        "from_attributes": True,
        "json_encoders": {Decimal: str},  # ensures Decimal → "10.00" not error
    }


class PaginatedRecordResponse(BaseModel):
    """
    Replaces the raw dict return — avoids Decimal JSON serialization errors.
    """
    items: list[RecordResponse]
    total: int
    limit: int
    offset: int
    has_more: bool


class RecordFilters(BaseModel):
    type: Optional[RecordType] = None
    category: Optional[str] = None
    start_date: Optional[Date] = None
    end_date: Optional[Date] = None
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)