from __future__ import annotations

import logging
from datetime import date as Date
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.middleware.rbac import require_admin, require_any_role
from app.models.financial_record import RecordType
from app.models.user import User
from app.schemas.record import (
    PaginatedRecordResponse,
    RecordCreate,
    RecordFilters,
    RecordResponse,
    RecordUpdate,
)
from app.services import record_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/records", tags=["Financial Records"])


@router.post(
    "/",
    response_model=RecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a financial record — admin only",
)
def create_record(
    payload: RecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin()),
) -> RecordResponse:
    logger.info("POST /records by user_id=%s", current_user.id)
    return record_service.create_record(db, payload, current_user.id)


@router.get(
    "/",
    response_model=PaginatedRecordResponse,   # ← typed, no raw dict
    status_code=status.HTTP_200_OK,
    summary="List financial records — viewer, analyst, admin",
)
def list_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role()),
    type: Optional[RecordType] = Query(default=None),
    category: Optional[str] = Query(default=None, max_length=100),
    start_date: Optional[Date] = Query(default=None),
    end_date: Optional[Date] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> PaginatedRecordResponse:
    filters = RecordFilters(
        type=type,
        category=category,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        offset=offset,
    )
    logger.info("GET /records user_id=%s", current_user.id)
    return record_service.get_records(db, current_user.id, filters)


@router.get(
    "/{record_id}",
    response_model=RecordResponse,
    summary="Get a single record — viewer, analyst, admin",
)
def get_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role()),
) -> RecordResponse:
    return record_service.get_record_by_id(db, record_id, current_user.id)


@router.put(
    "/{record_id}",
    response_model=RecordResponse,
    summary="Update a record — admin only",
)
def update_record(
    record_id: int,
    payload: RecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin()),
) -> RecordResponse:
    logger.info("PUT /records/%s by user_id=%s", record_id, current_user.id)
    return record_service.update_record(db, record_id, payload, current_user.id)


@router.delete(
    "/{record_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a record — admin only",
)
def delete_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin()),
) -> None:
    logger.info("DELETE /records/%s by user_id=%s", record_id, current_user.id)
    record_service.delete_record(db, record_id, current_user.id)