"""Sync log repository — MongoDB operations for sync audit trail."""

from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorDatabase


class SyncLogRepo:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["sync_log"]

    async def create(self, log_doc: dict) -> str:
        result = await self.collection.insert_one(log_doc)
        return str(result.inserted_id)

    async def find_latest(self) -> Optional[dict]:
        doc = await self.collection.find_one(sort=[("started_at", -1)])
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def find_by_sha(self, sha: str) -> List[dict]:
        cursor = self.collection.find({"github_sha": sha}).sort("started_at", -1)
        results = await cursor.to_list(length=50)
        for r in results:
            r["_id"] = str(r["_id"])
        return results
