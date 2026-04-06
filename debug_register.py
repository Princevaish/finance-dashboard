import sys
import logging
logging.basicConfig(level=logging.DEBUG)

# Must import base BEFORE any model or repo is touched
from app.db import base  # noqa: F401 — registers all models

from app.db.session import SessionLocal
from app.repositories import user_repo
from app.core.security import hash_password
from app.models.user import User

db = SessionLocal()

try:
    role = user_repo.get_role_by_name(db, "viewer")
    print(f"[1] Role lookup: {role}")
    if role is None:
        print("FAIL: viewer role missing — run init_db()")
        sys.exit(1)
    print(f"     role.id={role.id} role.name={role.name}")

    hashed = hash_password("testpassword123")
    print(f"[2] Hash: {hashed[:30]}...")

    u = User(
        email="debugtest@example.com",
        hashed_password=hashed,
        is_active=True,
        role_id=role.id,
    )
    print(f"[3] User object built: {u}")

    db.add(u)
    db.commit()
    db.refresh(u)
    print(f"[4] Saved: id={u.id} email={u.email} role_id={u.role_id}")
    print(f"[5] Role rel: {u.role}")

    print("\n✅ All checks passed.")

except Exception as e:
    db.rollback()
    print(f"\n❌ FAILED: {e}")
    raise

finally:
    db.query(User).filter(User.email == "debugtest@example.com").delete()
    db.commit()
    db.close()