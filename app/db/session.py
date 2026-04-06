from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,       # Detects stale connections
    pool_size=10,             # Number of persistent connections
    max_overflow=20,          # Extra connections beyond pool_size
    echo=False,               # Set True for SQL query logging in dev
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,   # Prevents lazy-load issues post-commit
)


def get_db() -> Session:
    """
    Dependency that provides a SQLAlchemy DB session.
    Ensures session is always closed after request.
    """
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()