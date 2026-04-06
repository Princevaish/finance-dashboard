from __future__ import annotations

from datetime import date as Date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.record import RecordResponse


class CategoryBreakdown(BaseModel):
    """Income or expense total grouped by category."""
    category: str
    total: Decimal

    model_config = {"from_attributes": True}


class TrendPoint(BaseModel):
    """Aggregated income/expense for a single calendar month."""
    month: str = Field(..., description="Format: YYYY-MM")
    income: Decimal
    expense: Decimal
    net: Decimal

    model_config = {"from_attributes": True}


class DashboardSummary(BaseModel):
    """
    Full financial summary for the authenticated user.
    All monetary values default to 0 if no records exist.
    """
    total_income: Decimal = Decimal("0.00")
    total_expense: Decimal = Decimal("0.00")
    net_balance: Decimal = Decimal("0.00")
    income_by_category: list[CategoryBreakdown] = []
    expense_by_category: list[CategoryBreakdown] = []
    recent_transactions: list[RecordResponse] = []

    model_config = {"from_attributes": True}


class TrendResponse(BaseModel):
    """Monthly trend series for the authenticated user."""
    trends: list[TrendPoint] = []
    total_months: int = 0