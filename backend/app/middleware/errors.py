"""Error handling middleware — catches exceptions and returns standardized ApiError responses."""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from jose import JWTError

from app.models.errors import ApiError


async def error_middleware(request: Request, call_next):
    """Catch all exceptions and return standardized error responses."""
    try:
        response = await call_next(request)
        return response
    except ValidationError as e:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Request validation failed",
                    "details": e.errors(),
                }
            },
        )
    except JWTError:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "error": {
                    "code": "AUTH_INVALID_TOKEN",
                    "message": "Invalid or expired access token",
                    "details": {},
                }
            },
        )
    except ValueError as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": {
                    "code": "BAD_REQUEST",
                    "message": str(e),
                    "details": {},
                }
            },
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An internal error occurred",
                    "details": {"error_type": type(e).__name__},
                }
            },
        )
