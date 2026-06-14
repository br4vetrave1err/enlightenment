"""User repository — MongoDB operations for user accounts."""

from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import settings


class UserRepo:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["users"]

    async def create(self, email: str, password_hash: str, display_name: str) -> dict:
        user = {
            "email": email,
            "password_hash": password_hash,
            "display_name": display_name,
            "created_at": datetime.now(timezone.utc),
            "last_login": datetime.now(timezone.utc),
            "settings": {
                "preferred_model": settings.LLM_MODEL,
                "difficulty_preference": "auto",
                "constellation_theme": "dark",
            },
        }
        result = await self.collection.insert_one(user)
        user["_id"] = str(result.inserted_id)
        return user

    async def find_by_email(self, email: str) -> Optional[dict]:
        user = await self.collection.find_one({"email": email})
        if user:
            user["_id"] = str(user["_id"])
        return user

    async def find_by_google_id(self, google_id: str) -> Optional[dict]:
        user = await self.collection.find_one({"google_id": google_id})
        if user:
            user["_id"] = str(user["_id"])
        return user

    async def find_by_id(self, user_id: str) -> Optional[dict]:
        try:
            oid = ObjectId(user_id)
        except Exception:
            return None
        user = await self.collection.find_one({"_id": oid})
        if user:
            user["_id"] = str(user["_id"])
        return user

    async def update_last_login(self, user_id: str) -> bool:
        try:
            oid = ObjectId(user_id)
        except Exception:
            return False
        result = await self.collection.update_one(
            {"_id": oid},
            {"$set": {"last_login": datetime.now(timezone.utc)}},
        )
        return result.modified_count > 0
