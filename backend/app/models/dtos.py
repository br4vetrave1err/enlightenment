"""Request/Response DTOs with validation."""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Literal


class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    display_name: str = Field(..., min_length=1, max_length=100)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email format")
        return v.lower().strip()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: dict


class GoogleAuthRequest(BaseModel):
    code: str
    state: str


class GoogleAuthUrlResponse(BaseModel):
    auth_url: str


class NodeProgressRequest(BaseModel):
    node_id: str
    action: Literal["view", "complete"]
    time_spent_seconds: int = Field(default=0, ge=0)
    self_rating: Optional[int] = Field(default=None, ge=1, le=5)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    course_id: Optional[str] = None
    node_id: Optional[str] = None


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    course_filter: Optional[str] = None
    limit: int = Field(default=5, ge=1, le=50)
