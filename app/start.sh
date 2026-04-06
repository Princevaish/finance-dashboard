#!/usr/bin/env bash

# create tables manually
python -c "from app.db.base import Base; from app.db.session import engine; Base.metadata.create_all(bind=engine)"

# run migrations (optional backup)
alembic upgrade head

# start app
uvicorn app.main:app --host 0.0.0.0 --port 10000