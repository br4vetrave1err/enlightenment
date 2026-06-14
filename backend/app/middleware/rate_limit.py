"""Rate limiting middleware."""

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from collections import defaultdict
import time
import os


class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests: dict = defaultdict(list)

    def _is_disabled(self) -> bool:
        return os.getenv("DISABLE_RATE_LIMIT", "false").lower() == "true"

    async def __call__(self, request: Request, call_next):
        if self._is_disabled():
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - 60

        self.requests[client_ip] = [
            t for t in self.requests[client_ip] if t > window_start
        ]

        if len(self.requests[client_ip]) >= self.requests_per_minute:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": {
                        "code": "RATE_LIMITED",
                        "message": "Too many requests. Please try again later.",
                        "details": {},
                    }
                },
            )

        self.requests[client_ip].append(now)
        response = await call_next(request)
        return response
