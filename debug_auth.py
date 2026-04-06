# debug_auth.py — run with: python debug_auth.py
import logging
logging.basicConfig(level=logging.DEBUG)

from app.db import base  # noqa: registers all models
from app.core.config import settings
from app.core.security import create_access_token, decode_access_token
from app.db.session import SessionLocal
from app.repositories import user_repo

print("\n" + "="*60)
print("STEP 1 — Config check")
print(f"  SECRET_KEY (first 10): {settings.SECRET_KEY[:10]}")
print(f"  ALGORITHM:             {settings.ALGORITHM}")
print(f"  TOKEN_EXPIRE_MINUTES:  {settings.ACCESS_TOKEN_EXPIRE_MINUTES}")

print("\nSTEP 2 — Create token")
token = create_access_token({
    "user_id": 1,
    "email": "test@example.com",
    "role": "admin"
})
print(f"  Token (first 60): {token[:60]}...")

print("\nSTEP 3 — Decode token")
payload = decode_access_token(token)
print(f"  Payload: {payload}")

if payload is None:
    print("  ❌ FAILED: decode returned None")
else:
    user_id = payload.get("user_id")
    print(f"  user_id from payload: {user_id}")
    if user_id is None:
        print("  ❌ FAILED: 'user_id' key missing — check create_access_token payload keys")
    else:
        print("  ✅ user_id extracted successfully")

print("\nSTEP 4 — Fetch user from DB")
db = SessionLocal()
try:
    user = user_repo.get_user_by_id(db, 1)
    if user is None:
        print("  ⚠️  user_id=1 not found — try a real user_id from your DB")
    else:
        print(f"  ✅ User found: id={user.id} email={user.email} active={user.is_active}")
        print(f"  Role: {user.role.name if user.role else 'NO ROLE ASSIGNED'}")
finally:
    db.close()

print("\nSTEP 5 — Full Invoke-RestMethod simulation")
print("  Run this in PowerShell after server starts:")
print("""
  $body = @{ username = "your@email.com"; password = "yourpass" }
  $login = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/login" `
    -Method POST -Body $body
  $token = $login.access_token
  Write-Host "Token: $($token.Substring(0,40))..."
  Invoke-RestMethod -Uri "http://localhost:8000/api/v1/records/" `
    -Headers @{ Authorization = "Bearer $token" }
""")
print("="*60)