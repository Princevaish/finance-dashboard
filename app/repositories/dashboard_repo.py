from __future__ import annotations

import logging
from decimal import Decimal

from sqlalchemy import func, extract, case
from sqlalchemy.orm import Session

from app.models.financial_record import FinancialRecord, RecordType

logger = logging.getLogger(__name__)

# Sentinel zero — used everywhere to safely coalesce NULL from SUM()
ZERO = Decimal("0.00")


def get_totals_by_type(
    db: Session,
    user_id: int,
) -> dict[str, Decimal]:
    """
    Returns total_income and total_expense for the user.
    Uses a single query with conditional aggregation — one DB round trip.
    """
    result = db.query(
        func.coalesce(
            func.sum(
                case(
                    (FinancialRecord.type == RecordType.income, FinancialRecord.amount),
                    else_=0,
                )
            ),
            ZERO,
        ).label("total_income"),
        func.coalesce(
            func.sum(
                case(
                    (FinancialRecord.type == RecordType.expense, FinancialRecord.amount),
                    else_=0,
                )
            ),
            ZERO,
        ).label("total_expense"),
    ).filter(FinancialRecord.user_id == user_id).one()

    return {
        "total_income": Decimal(str(result.total_income)),
        "total_expense": Decimal(str(result.total_expense)),
    }


def get_category_breakdown(
    db: Session,
    user_id: int,
    record_type: RecordType,
) -> list[tuple[str, Decimal]]:
    """
    Returns [(category, total_amount), ...] for the given type,
    ordered by total descending.
    """
    rows = (
        db.query(
            FinancialRecord.category,
            func.coalesce(func.sum(FinancialRecord.amount), ZERO).label("total"),
        )
        .filter(
            FinancialRecord.user_id == user_id,
            FinancialRecord.type == record_type,
        )
        .group_by(FinancialRecord.category)
        .order_by(func.sum(FinancialRecord.amount).desc())
        .all()
    )
    return [(row.category, Decimal(str(row.total))) for row in rows]


def get_recent_records(
    db: Session,
    user_id: int,
    limit: int = 5,
) -> list[FinancialRecord]:
    """Returns the N most recent financial records for the user."""
    return (
        db.query(FinancialRecord)
        .filter(FinancialRecord.user_id == user_id)
        .order_by(FinancialRecord.date.desc(), FinancialRecord.id.desc())
        .limit(limit)
        .all()
    )


def get_monthly_trends(
    db: Session,
    user_id: int,
) -> list[tuple[str, Decimal, Decimal]]:
    """
    Returns monthly aggregated (month_str, total_income, total_expense).
    month_str format: 'YYYY-MM'

    Uses extract(year) + extract(month) for cross-DB compatibility.
    Avoids to_char() which is PostgreSQL-only.
    """
    rows = (
        db.query(
            extract("year", FinancialRecord.date).label("year"),
            extract("month", FinancialRecord.date).label("month"),
            func.coalesce(
                func.sum(
                    case(
                        (FinancialRecord.type == RecordType.income, FinancialRecord.amount),
                        else_=0,
                    )
                ),
                ZERO,
            ).label("total_income"),
            func.coalesce(
                func.sum(
                    case(
                        (FinancialRecord.type == RecordType.expense, FinancialRecord.amount),
                        else_=0,
                    )
                ),
                ZERO,
            ).label("total_expense"),
        )
        .filter(FinancialRecord.user_id == user_id)
        .group_by(
            extract("year", FinancialRecord.date),
            extract("month", FinancialRecord.date),
        )
        .order_by(
            extract("year", FinancialRecord.date).asc(),
            extract("month", FinancialRecord.date).asc(),
        )
        .all()
    )

    # Format month as zero-padded "YYYY-MM" string
    return [
        (
            f"{int(row.year):04d}-{int(row.month):02d}",
            Decimal(str(row.total_income)),
            Decimal(str(row.total_expense)),
        )
        for row in rows
    ]