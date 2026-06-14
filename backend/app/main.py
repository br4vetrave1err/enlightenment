from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os

from app.api import auth, courses, chat, progress, webhook, sync, search
from app.core.config import settings
from app.core.db_indexes import create_indexes
from app.middleware.errors import error_middleware
from app.middleware.rate_limit import RateLimiter
from app.middleware.logging import logging_middleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    app.mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
    app.db = app.mongodb_client[settings.DATABASE_NAME]

    # Create database indexes
    await create_indexes(app.db)

    # Start background cron sync (every 6 hours)
    from app.pipeline.cron import cron_sync
    cron_task = asyncio.create_task(cron_sync(app.db))

    yield

    # Shutdown
    cron_task.cancel()
    app.mongodb_client.close()


app = FastAPI(
    title="Roadmap Learning API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow mobile app origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(",") if settings.CORS_ORIGINS else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error middleware
app.middleware("http")(error_middleware)

# Rate limiting
rate_limiter = RateLimiter(requests_per_minute=60)
app.middleware("http")(rate_limiter)

# Request logging
app.middleware("http")(logging_middleware)

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(progress.router, prefix="/api/user", tags=["progress"])
app.include_router(webhook.router, prefix="/api/webhook", tags=["webhook"])
app.include_router(sync.router, prefix="/api/sync", tags=["sync"])
app.include_router(search.router, prefix="/api", tags=["search"])


@app.get("/api/health")
async def health():
    return {"status": "ok"}
