from __future__ import annotations

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.middleware.rbac import require_analyst_or_above
from app.models.user import User
from app.schemas.dashboard import DashboardSummary, TrendResponse
from app.services import dashboard_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/summary",
    response_model=DashboardSummary,
    summary="Financial summary — analyst, admin",
    responses={
        200: {"description": "Dashboard summary returned successfully"},
        401: {"description": "Not authenticated"},
        403: {"description": "Insufficient permissions"},
    },
)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst_or_above()),
) -> DashboardSummary:
    """
    Returns aggregated financial data for the authenticated user:
    - Total income and expense
    - Net balance
    - Breakdown by category (income + expense separately)
    - 5 most recent transactions

    Access: analyst, admin
    """
    logger.info("GET /dashboard/summary user_id=%s", current_user.id)
    return dashboard_service.get_summary(db, current_user.id)


@router.get(
    "/trends",
    response_model=TrendResponse,
    summary="Monthly income/expense trends — analyst, admin",
    responses={
        200: {"description": "Monthly trend series returned successfully"},
        401: {"description": "Not authenticated"},
        403: {"description": "Insufficient permissions"},
    },
)
def get_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst_or_above()),
) -> TrendResponse:
    """
    Returns monthly aggregated income and expense for charting.
    Each entry represents one calendar month with income, expense, and net values.

    Access: analyst, admin
    """
    logger.info("GET /dashboard/trends user_id=%s", current_user.id)
    return dashboard_service.get_trends(db, current_user.id)