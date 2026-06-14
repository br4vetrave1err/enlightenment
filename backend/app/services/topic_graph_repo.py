"""Topic graph repository — MongoDB operations for knowledge graph."""

from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorDatabase


class TopicGraphRepo:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["topic_graph"]

    async def find_by_name(self, name: str) -> Optional[dict]:
        return await self.collection.find_one({"_id": name})

    async def find_all(self) -> List[dict]:
        cursor = self.collection.find()
        return await cursor.to_list(length=None)

    async def upsert(self, topic_doc: dict) -> bool:
        result = await self.collection.update_one(
            {"_id": topic_doc.get("_id", topic_doc.get("name"))},
            {"$set": topic_doc},
            upsert=True,
        )
        return result.modified_count > 0 or result.upserted_id is not None

    async def find_related(self, topic_name: str, max_results: int = 10) -> List[dict]:
        pipeline = [
            {"$match": {"_id": topic_name}},
            {"$unwind": "$relationships"},
            {"$sort": {"relationships.strength": -1}},
            {"$limit": max_results},
            {"$lookup": {
                "from": "topic_graph",
                "localField": "relationships.to",
                "foreignField": "_id",
                "as": "related_topic",
            }},
            {"$unwind": "$related_topic"},
            {"$project": {
                "topic": "$related_topic.name",
                "relationship_type": "$relationships.type",
                "strength": "$relationships.strength",
                "description": "$related_topic.description",
            }},
        ]
        return await self.collection.aggregate(pipeline).to_list(length=max_results)
