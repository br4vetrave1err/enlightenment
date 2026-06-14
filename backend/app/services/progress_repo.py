"""Progress repository — MongoDB operations for user progress."""

from datetime import datetime, timezone
from typing import Optional, List
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class ProgressRepo:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["user_progress"]

    async def find_by_user_course(self, user_id: str, course_id: str) -> Optional[dict]:
        doc = await self.collection.find_one({"user_id": user_id, "course_id": course_id})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def upsert(self, user_id: str, course_id: str, data: dict) -> dict:
        data["user_id"] = user_id
        data["course_id"] = course_id
        data["last_accessed"] = datetime.now(timezone.utc)
        result = await self.collection.update_one(
            {"user_id": user_id, "course_id": course_id},
            {"$set": data},
            upsert=True,
        )
        doc = await self.collection.find_one({"_id": result.upserted_id or {"$in": []}})
        if not doc:
            doc = await self.collection.find_one({"user_id": user_id, "course_id": course_id})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def mark_node_complete(
        self, user_id: str, course_id: str, node_id: str,
        time_spent: int = 0, rating: Optional[int] = None,
    ) -> dict:
        update = {
            "$addToSet": {"completed_nodes": node_id},
            "$set": {
                "current_node": node_id,
                "last_accessed": datetime.now(timezone.utc),
            },
        }
        if time_spent > 0:
            update["$set"][f"time_spent_per_node.{node_id}"] = time_spent
        if rating:
            update["$set"][f"node_ratings.{node_id}"] = rating

        await self.collection.update_one(
            {"user_id": user_id, "course_id": course_id},
            update,
            upsert=True,
        )
        return await self.find_by_user_course(user_id, course_id)

    async def find_all_for_user(self, user_id: str) -> List[dict]:
        cursor = self.collection.find({"user_id": user_id})
        results = await cursor.to_list(length=100)
        for r in results:
            r["_id"] = str(r["_id"])
        return results

    async def find_by_user(self, user_id: str) -> List[dict]:
        """Alias for find_all_for_user."""
        return await self.find_all_for_user(user_id)
