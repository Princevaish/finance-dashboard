from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    role: Optional[str] = Field(
        default="viewer",
        description="Role to assign: viewer, analyst, or admin"
    )


class UserUpdate(BaseModel):
    role_id: int = Field(..., description="Role ID: 1=viewer, 2=analyst, 3=admin")


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    role_id: int | None

    model_config = {"from_attributes": True}