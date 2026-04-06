from __future__ import annotations

import logging
from decimal import Decimal

from sqlalchemy.orm import Session

from app.repositories import dashboard_repo
from app.schemas.dashboard import (
    CategoryBreakdown,
    DashboardSummary,
    TrendPoint,
    TrendResponse,
)
from app.schemas.record import RecordResponse
from app.models.financial_record import RecordType

logger = logging.getLogger(__name__)

ZERO = Decimal("0.00")


def get_summary(db: Session, user_id: int) -> DashboardSummary:
    """
    Builds the full dashboard summary for a user.
    All aggregations are safe against empty tables — returns 0 values,
    not None or errors, when the user has no records.
    """
    logger.info("Building dashboard summary for user_id=%s", user_id)

    # ── 1. Income / expense totals ────────────────────────────────────────────
    totals = dashboard_repo.get_totals_by_type(db, user_id)
    total_income: Decimal = totals["total_income"]
    total_expense: Decimal = totals["total_expense"]
    net_balance: Decimal = total_income - total_expense

    # ── 2. Category breakdowns ────────────────────────────────────────────────
    income_rows = dashboard_repo.get_category_breakdown(
        db, user_id, RecordType.income
    )
    expense_rows = dashboard_repo.get_category_breakdown(
        db, user_id, RecordType.expense
    )

    income_by_category = [
        CategoryBreakdown(category=cat, total=total)
        for cat, total in income_rows
    ]
    expense_by_category = [
        CategoryBreakdown(category=cat, total=total)
        for cat, total in expense_rows
    ]

    # ── 3. Recent transactions ────────────────────────────────────────────────
    recent_records = dashboard_repo.get_recent_records(db, user_id, limit=5)
    recent_transactions = [
        RecordResponse.model_validate(r) for r in recent_records
    ]

    summary = DashboardSummary(
        total_income=total_income,
        total_expense=total_expense,
        net_balance=net_balance,
        income_by_category=income_by_category,
        expense_by_category=expense_by_category,
        recent_transactions=recent_transactions,
    )

    logger.info(
        "Summary built: user_id=%s income=%s expense=%s net=%s",
        user_id,
        total_income,
        total_expense,
        net_balance,
    )
    return summary


def get_trends(db: Session, user_id: int) -> TrendResponse:
    """
    Builds a monthly trend series for the user.
    Returns an empty list (not an error) when the user has no records.
    """
    logger.info("Building trend data for user_id=%s", user_id)

    monthly_data = dashboard_repo.get_monthly_trends(db, user_id)

    trend_points = [
        TrendPoint(
            month=month_str,
            income=income,
            expense=expense,
            net=income - expense,
        )
        for month_str, income, expense in monthly_data
    ]

    logger.info(
        "Trends built: user_id=%s months=%s", user_id, len(trend_points)
    )

    return TrendResponse(
        trends=trend_points,
        total_months=len(trend_points),
    )