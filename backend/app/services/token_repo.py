"""Token repository — MongoDB operations for refresh tokens."""

from datetime import datetime, timedelta, timezone
from typing import Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class TokenRepo:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["refresh_tokens"]

    async def store(self, user_id: str, token: str, expires_at: datetime) -> str:
        doc = {
            "user_id": user_id,
            "token": token,
            "expires_at": expires_at,
            "revoked": False,
            "created_at": datetime.now(timezone.utc),
        }
        result = await self.collection.insert_one(doc)
        return str(result.inserted_id)

    async def validate(self, token: str) -> Optional[dict]:
        doc = await self.collection.find_one({
            "token": token,
            "revoked": False,
            "expires_at": {"$gt": datetime.now(timezone.utc)},
        })
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def revoke(self, token: str) -> bool:
        result = await self.collection.update_one(
            {"token": token},
            {"$set": {"revoked": True}},
        )
        return result.modified_count > 0

    async def cleanup_expired(self) -> int:
        result = await self.collection.delete_many({
            "expires_at": {"$lte": datetime.now(timezone.utc)},
        })
        return result.deleted_count

    async def revoke_all_for_user(self, user_id: str) -> int:
        result = await self.collection.update_many(
            {"user_id": user_id},
            {"$set": {"revoked": True}},
        )
        return result.modified_count
