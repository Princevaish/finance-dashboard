from __future__ import annotations

import logging

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.financial_record import FinancialRecord
from app.repositories import record_repo
from app.schemas.record import (
    PaginatedRecordResponse,
    RecordCreate,
    RecordFilters,
    RecordResponse,
    RecordUpdate,
)

logger = logging.getLogger(__name__)


def _get_record_or_404(db: Session, record_id: int) -> FinancialRecord:
    record = record_repo.get_by_id(db, record_id)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Record with id={record_id} not found.",
        )
    return record


def _assert_ownership(record: FinancialRecord, user_id: int) -> None:
    if record.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Record with id={record.id} not found.",
        )


def create_record(
    db: Session, payload: RecordCreate, user_id: int
) -> RecordResponse:
    record = record_repo.create(db, payload=payload, user_id=user_id)
    return RecordResponse.model_validate(record)


def get_records(
    db: Session,
    user_id: int,
    filters: RecordFilters,
) -> PaginatedRecordResponse:
    if filters.start_date and filters.end_date:
        if filters.start_date > filters.end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="start_date cannot be after end_date.",
            )

    records, total = record_repo.get_many(db, user_id=user_id, filters=filters)

    return PaginatedRecordResponse(
        items=[RecordResponse.model_validate(r) for r in records],
        total=total,
        limit=filters.limit,
        offset=filters.offset,
        has_more=(filters.offset + filters.limit) < total,
    )


def get_record_by_id(
    db: Session, record_id: int, user_id: int
) -> RecordResponse:
    record = _get_record_or_404(db, record_id)
    _assert_ownership(record, user_id)
    return RecordResponse.model_validate(record)


def update_record(
    db: Session, record_id: int, payload: RecordUpdate, user_id: int
) -> RecordResponse:
    record = _get_record_or_404(db, record_id)
    _assert_ownership(record, user_id)
    updated = record_repo.update(db, record=record, payload=payload)
    return RecordResponse.model_validate(updated)


def delete_record(db: Session, record_id: int, user_id: int) -> None:
    record = _get_record_or_404(db, record_id)
    _assert_ownership(record, user_id)
    record_repo.delete(db, record=record)