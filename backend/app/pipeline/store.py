"""STORE step — upsert courses, topic_graph, sync_log into MongoDB."""

from datetime import datetime, timezone
from typing import List, Dict, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.pipeline.parse import ParsedCourse
from app.pipeline.build_graph import TopicNode
from app.pipeline.extract import ExtractionResult


async def store_courses(
    db: AsyncIOMotorDatabase,
    courses: List[ParsedCourse],
    sha: str,
    extractions: Optional[Dict[str, ExtractionResult]] = None,
) -> dict:
    """Upsert courses into MongoDB."""
    nodes_added = 0
    nodes_updated = 0
    extractions = extractions or {}

    for course in courses:
        course_doc = {
            "course_id": course.course_id,
            "title": course.title,
            "description": course.description,
            "icon": course.icon,
            "last_synced": datetime.now(timezone.utc),
            "github_sha": sha,
            "nodes": [],
            "edges": [
                {"from": e.from_node, "to": e.to_node, "type": e.edge_type}
                for e in course.edges
            ],
        }

        for n in course.nodes:
            extraction = extractions.get(n.node_id)
            node_doc = {
                "node_id": n.node_id,
                "title": n.title,
                "content": n.content,
                "links": n.links,
                "position": n.position,
                "tags": n.tags,
                "prerequisites": n.prerequisites,
                "estimated_minutes": n.estimated_minutes,
                "extracted_concepts": extraction.concepts if extraction else [],
                "difficulty": extraction.difficulty if extraction else n.difficulty,
                "summary": extraction.summary if extraction else "",
            }
            course_doc["nodes"].append(node_doc)

        existing = await db.courses.find_one({"course_id": course.course_id})
        if existing:
            old_node_count = len(existing.get("nodes", []))
            await db.courses.update_one(
                {"course_id": course.course_id},
                {"$set": course_doc},
            )
            nodes_updated += max(0, len(course.nodes) - old_node_count)
        else:
            await db.courses.insert_one(course_doc)
            nodes_added += len(course.nodes)

    return {"nodes_added": nodes_added, "nodes_updated": nodes_updated}


async def store_topic_graph(db: AsyncIOMotorDatabase, topics: List[TopicNode]) -> int:
    """Upsert topic graph entries."""
    count = 0
    for topic in topics:
        doc = {
            "_id": topic.name,
            "name": topic.name,
            "description": topic.description,
            "courses_seen_in": topic.courses_seen_in,
            "node_ids": topic.node_ids,
            "relationships": topic.relationships,
            "last_updated": datetime.now(timezone.utc),
        }
        await db.topic_graph.replace_one(
            {"_id": topic.name},
            doc,
            upsert=True,
        )
        count += 1
    return count


async def create_sync_log(
    db: AsyncIOMotorDatabase,
    triggered_by: str,
    sha: str,
    courses_updated: List[str],
    nodes_added: int,
    nodes_updated: int,
    nodes_removed: int,
    llm_calls: int = 0,
    llm_tokens: int = 0,
    error: str = None,
) -> str:
    """Create a sync log entry."""
    doc = {
        "triggered_by": triggered_by,
        "github_sha": sha,
        "started_at": datetime.now(timezone.utc),
        "completed_at": datetime.now(timezone.utc),
        "status": "failed" if error else "completed",
        "courses_updated": courses_updated,
        "nodes_added": nodes_added,
        "nodes_updated": nodes_updated,
        "nodes_removed": nodes_removed,
        "llm_calls_made": llm_calls,
        "llm_tokens_used": llm_tokens,
        "error": error,
    }
    result = await db.sync_log.insert_one(doc)
    return str(result.inserted_id)
