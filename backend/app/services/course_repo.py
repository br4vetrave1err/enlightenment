"""Course repository — MongoDB operations for courses."""

from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorDatabase


class CourseRepo:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db["courses"]

    async def find_all(self) -> List[dict]:
        cursor = self.collection.find({}, {"_id": 0})
        return await cursor.to_list(length=None)

    async def find_by_id(self, course_id: str) -> Optional[dict]:
        return await self.collection.find_one({"course_id": course_id}, {"_id": 0})

    async def find_node_by_id(self, course_id: str, node_id: str) -> Optional[dict]:
        course = await self.collection.find_one(
            {"course_id": course_id, "nodes.node_id": node_id},
            {"_id": 0, "nodes": {"$elemMatch": {"node_id": node_id}}},
        )
        if course and course.get("nodes"):
            return course["nodes"][0]
        return None

    async def upsert(self, course_doc: dict) -> bool:
        result = await self.collection.update_one(
            {"course_id": course_doc["course_id"]},
            {"$set": course_doc},
            upsert=True,
        )
        return result.modified_count > 0 or result.upserted_id is not None

    async def get_dynamic_roadmap(self, course_id: str, user_preferences: dict) -> Optional[dict]:
        """Extract a dynamic subgraph based on user preferences.
        This maps from the global universe (the course nodes) and prunes/constructs variants
        dynamically.
        """
        course = await self.find_by_id(course_id)
        if not course:
            return None
        
        # Determine skip topics from user preferences (e.g. known_skills)
        known_skills = user_preferences.get("known_skills", [])
        
        # Build a dynamic variant
        dynamic_variant = {
            "id": "personalized-path",
            "label": "Personalized Fast Track",
            "description": "Custom roadmap based on your current knowledge",
            "skip_phases": [],
            "skip_topics": known_skills,
            "unlocks_at": None
        }

        # Build phases
        phases = []
        phase_map = {}
        for node in course.get("nodes", []):
            phase_name = "General Foundations"
            if node.get("title", "").startswith(("Step", "Phase", "Section", "Unit")):
                phase_name = node["title"]
                
            if phase_name not in phase_map:
                phase_map[phase_name] = {
                    "id": f"phase-{len(phases)+1}",
                    "order": len(phases) + 1,
                    "name": phase_name,
                    "description": "Learning checkpoint",
                    "duration": "1 week",
                    "topics": []
                }
                phases.append(phase_map[phase_name])
                
            phase_map[phase_name]["topics"].append({
                "id": node.get("node_id"),
                "order": len(phase_map[phase_name]["topics"]) + 1,
                "name": node.get("title"),
                "description": node.get("summary") or node.get("content") or "Topic details",
                "type": "optional" if "optional" in node.get("title", "").lower() else "core",
                "difficulty": node.get("difficulty", "medium"),
                "estimated_hours": max(1, node.get("estimated_minutes", 30) // 60),
                "tags": node.get("tags", []),
                "resources": node.get("links", [])
            })

        course["phases"] = phases
        course["variants"] = [dynamic_variant]
        
        # Map edges to topic_graph
        topic_graph = []
        for edge in course.get("edges", []):
            topic_graph.append({
                "from": edge.get("from") or edge.get("from_node"),
                "to": edge.get("to") or edge.get("to_node"),
                "type": edge.get("type", "required")
            })
        course["topic_graph"] = topic_graph
        
        return course
