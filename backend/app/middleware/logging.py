"""Request logging middleware."""

import logging
import time
from fastapi import Request

logger = logging.getLogger("roadmap_api")


async def logging_middleware(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start

    logger.info(
        "%s %s %s %.3fs",
        request.method,
        request.url.path,
        response.status_code,
        duration,
    )
    return response
