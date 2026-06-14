"""Standardized error response model."""

from pydantic import BaseModel
from typing import Any, Optional


class ApiError(BaseModel):
    """Standard error response format."""

    code: str
    message: str
    details: Optional[Any] = None


class ErrorResponse(BaseModel):
    """Wrapper for API error responses."""

    error: ApiError
