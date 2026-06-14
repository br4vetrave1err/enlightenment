"""Chat session repository."""

from datetime import datetime, timezone
from typing import Optional, List
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class ChatRepo:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["chat_sessions"]

    async def create(self, user_id: str, course_context: str = None, node_context: str = None) -> str:
        doc = {
            "user_id": user_id,
            "course_context_id": course_context,
            "node_context_id": node_context,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            "messages": [],
            "token_count": 0,
        }
        result = await self.collection.insert_one(doc)
        return str(result.inserted_id)

    async def find_by_user(self, user_id: str) -> List[dict]:
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1)
        results = await cursor.to_list(length=50)
        for r in results:
            r["_id"] = str(r["_id"])
        return results

    async def find_by_id(self, session_id: str) -> Optional[dict]:
        try:
            oid = ObjectId(session_id)
        except Exception:
            return None
        doc = await self.collection.find_one({"_id": oid})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def save_message(self, session_id: str, role: str, content: str, sources: list = None):
        try:
            oid = ObjectId(session_id)
        except Exception:
            return
        await self.collection.update_one(
            {"_id": oid},
            {
                "$push": {
                    "messages": {
                        "role": role,
                        "content": content,
                        "timestamp": datetime.now(timezone.utc),
                        "sources_used": sources or [],
                    }
                },
                "$set": {"updated_at": datetime.now(timezone.utc)},
            },
        )

    async def delete(self, session_id: str, user_id: str) -> bool:
        try:
            oid = ObjectId(session_id)
        except Exception:
            return False
        result = await self.collection.delete_one({"_id": oid, "user_id": user_id})
        return result.deleted_count > 0
