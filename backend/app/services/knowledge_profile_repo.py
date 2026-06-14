"""Knowledge profile repository — MongoDB operations for user knowledge profiles."""

from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class KnowledgeProfileRepo:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["knowledge_profile"]

    async def find_by_user(self, user_id: str) -> Optional[dict]:
        doc = await self.collection.find_one({"user_id": user_id})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def upsert(self, user_id: str, profile_data: dict) -> dict:
        profile_data["user_id"] = user_id
        profile_data["updated_at"] = datetime.now(timezone.utc)
        result = await self.collection.update_one(
            {"user_id": user_id},
            {"$set": profile_data},
            upsert=True,
        )
        doc = await self.collection.find_one({"user_id": user_id})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def update_topics(self, user_id: str, topics: list) -> dict:
        await self.collection.update_one(
            {"user_id": user_id},
            {"$set": {"topics": topics, "updated_at": datetime.now(timezone.utc)}},
            upsert=True,
        )
        return await self.find_by_user(user_id)

    async def calculate_gaps(self, user_id: str) -> list:
        profile = await self.find_by_user(user_id)
        if not profile:
            return []
        gaps = []
        for topic in profile.get("topics", []):
            if topic.get("mastery_level", 0) < 0.3:
                gaps.append({
                    "topic": topic["name"],
                    "recommended_course": topic.get("sources", ["general"])[0],
                    "recommended_node": "",
                })
        return gaps
