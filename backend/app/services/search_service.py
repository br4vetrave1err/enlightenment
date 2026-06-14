"""Search service — MongoDB text search across course content."""

from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
import re


class SearchService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["courses"]

    async def search(
        self,
        query: str,
        course_filter: Optional[str] = None,
        limit: int = 5,
    ) -> List[dict]:
        # Try text search first, fall back to regex
        try:
            return await self._text_search(query, course_filter, limit)
        except Exception:
            return await self._regex_search(query, course_filter, limit)

    async def _text_search(
        self,
        query: str,
        course_filter: Optional[str],
        limit: int,
    ) -> List[dict]:
        search_filter = {"$text": {"$search": query}}
        if course_filter:
            search_filter["course_id"] = course_filter

        pipeline = [
            {"$match": search_filter},
            {"$unwind": "$nodes"},
            {"$addFields": {"score": {"$meta": "textScore"}}},
            {"$sort": {"score": {"$meta": "textScore"}}},
            {"$limit": limit},
            {"$project": {
                "node_id": "$nodes.node_id",
                "title": "$nodes.title",
                "snippet": {"$substr": ["$nodes.content", 0, 200]},
                "relevance_score": "$score",
                "course_id": "$course_id",
            }},
        ]

        results = await self.collection.aggregate(pipeline).to_list(length=limit)
        return results

    async def _regex_search(
        self,
        query: str,
        course_filter: Optional[str],
        limit: int,
    ) -> List[dict]:
        filter_dict = {"nodes.content": {"$regex": query, "$options": "i"}}
        if course_filter:
            filter_dict["course_id"] = course_filter

        courses = await self.collection.find(filter_dict).to_list(length=limit)
        results = []
        for course in courses:
            for node in course.get("nodes", []):
                content = node.get("content", "")
                if re.search(query, content, re.IGNORECASE):
                    results.append({
                        "node_id": node.get("node_id"),
                        "title": node.get("title"),
                        "snippet": content[:200],
                        "relevance_score": 1.0,
                        "course_id": course.get("course_id"),
                    })
                    if len(results) >= limit:
                        return results
        return results
