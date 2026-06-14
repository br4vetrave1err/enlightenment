"""Pipeline orchestrator — run full sync pipeline with retry and error handling."""

import asyncio
from datetime import datetime
from typing import Optional, Dict, List
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.pipeline.fetch import fetch_content, FetchResult
from app.pipeline.parse import parse_roadmap, ParsedCourse
from app.pipeline.extract import extract_batch, ExtractionResult
from app.pipeline.build_graph import build_topic_graph, TopicNode
from app.pipeline.store import store_courses, store_topic_graph, create_sync_log


async def run_pipeline(
    db: AsyncIOMotorDatabase,
    triggered_by: str = "manual",
    previous_sha: Optional[str] = None,
    max_retries: int = 2,
    skip_llm: bool = False,
) -> dict:
    """Run the full content sync pipeline.

    Steps: FETCH → PARSE → EXTRACT → BUILD_GRAPH → STORE

    Args:
        skip_llm: If True, skip LLM extraction (faster initial sync).
    """
    llm_calls = 0
    llm_tokens = 0

    try:
        fetch_result = await _with_retry(fetch_content, previous_sha, retries=max_retries)

        if not fetch_result.changed and previous_sha:
            return {
                "status": "no_changes",
                "sha": fetch_result.sha,
                "message": "No new commits since last sync",
            }

        courses = parse_roadmap(fetch_result.repo_path)
        if not courses:
            await create_sync_log(
                db, triggered_by, fetch_result.sha, [], 0, 0, 0,
                error="No courses found in repo",
            )
            return {"status": "no_courses", "sha": fetch_result.sha}

        extractions: Dict[str, ExtractionResult] = {}
        if not skip_llm:
            for course in courses:
                results = await extract_batch(course.nodes)
                for r in results:
                    extractions[r.node_id] = r
                    llm_calls += 1

        topics = build_topic_graph(courses, extractions)

        store_result = await store_courses(db, courses, fetch_result.sha, extractions)
        topic_count = await store_topic_graph(db, topics)

        sync_log_id = await create_sync_log(
            db,
            triggered_by,
            fetch_result.sha,
            [c.course_id for c in courses],
            store_result["nodes_added"],
            store_result["nodes_updated"],
            0,
            llm_calls,
            llm_tokens,
        )

        return {
            "status": "completed",
            "sync_id": sync_log_id,
            "sha": fetch_result.sha,
            "courses_updated": len(courses),
            "topics_built": topic_count,
            **store_result,
        }

    except Exception as e:
        await create_sync_log(
            db, triggered_by, previous_sha or "unknown",
            [], 0, 0, 0, llm_calls, llm_tokens, error=str(e),
        )
        return {"status": "failed", "error": str(e)}


async def _with_retry(func, *args, retries: int = 2):
    """Retry a function with exponential backoff."""
    last_error = None
    for attempt in range(retries + 1):
        try:
            return await func(*args)
        except Exception as e:
            last_error = e
            if attempt < retries:
                await asyncio.sleep(2 ** attempt)
    raise last_error
