from fastapi import FastAPI
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
import os

from app.api import auth, courses, chat, progress, webhook
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    app.mongodb_client = AsyncIOMotorClient(settings.MONGODB_URL)
    app.db = app.mongodb_client[settings.DATABASE_NAME]
    yield
    # Shutdown
    app.mongodb_client.close()


app = FastAPI(
    title="Roadmap Learning API",
    version="0.1.0",
    lifespan=lifespan,
)

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(progress.router, prefix="/api/user", tags=["progress"])
app.include_router(webhook.router, prefix="/api/webhook", tags=["webhook"])


@app.get("/api/health")
async def health():
    return {"status": "ok"}
