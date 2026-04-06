from __future__ import annotations

import logging
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.financial_record import FinancialRecord
from app.schemas.record import RecordCreate, RecordFilters, RecordUpdate

logger = logging.getLogger(__name__)


def get_by_id(db: Session, record_id: int) -> FinancialRecord | None:
    return (
        db.query(FinancialRecord)
        .filter(FinancialRecord.id == record_id)
        .first()
    )


def get_many(
    db: Session,
    *,
    user_id: int,
    filters: RecordFilters,
) -> tuple[list[FinancialRecord], int]:
    """
    Returns (records, total_count).
    total_count is pre-pagination for building has_more / pagination metadata.
    """
    query = (
        db.query(FinancialRecord)
        .filter(FinancialRecord.user_id == user_id)
    )

    if filters.type is not None:
        query = query.filter(FinancialRecord.type == filters.type)

    if filters.category is not None:
        query = query.filter(
            FinancialRecord.category.ilike(f"%{filters.category}%")
        )

    if filters.start_date is not None:
        query = query.filter(FinancialRecord.date >= filters.start_date)

    if filters.end_date is not None:
        query = query.filter(FinancialRecord.date <= filters.end_date)

    total: int = query.count()

    records = (
        query
        .order_by(FinancialRecord.date.desc(), FinancialRecord.id.desc())
        .offset(filters.offset)
        .limit(filters.limit)
        .all()
    )

    return records, total


def create(
    db: Session,
    *,
    payload: RecordCreate,
    user_id: int,
) -> FinancialRecord:
    record = FinancialRecord(
        user_id=user_id,
        amount=payload.amount,
        type=payload.type,
        category=payload.category,
        date=payload.date,
        notes=payload.notes,
    )
    try:
        db.add(record)
        db.commit()
        db.refresh(record)
        logger.info("Record created: id=%s user_id=%s", record.id, user_id)
        return record
    except SQLAlchemyError:
        db.rollback()
        logger.exception("DB error creating record for user_id=%s", user_id)
        raise


def update(
    db: Session,
    *,
    record: FinancialRecord,
    payload: RecordUpdate,
) -> FinancialRecord:
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return record
    for field, value in update_data.items():
        setattr(record, field, value)
    try:
        db.commit()
        db.refresh(record)
        logger.info("Record updated: id=%s fields=%s", record.id, list(update_data.keys()))
        return record
    except SQLAlchemyError:
        db.rollback()
        logger.exception("DB error updating record id=%s", record.id)
        raise


def delete(db: Session, *, record: FinancialRecord) -> None:
    try:
        db.delete(record)
        db.commit()
        logger.info("Record deleted: id=%s", record.id)
    except SQLAlchemyError:
        db.rollback()
        logger.exception("DB error deleting record id=%s", record.id)
        raise