"""Chat agent nodes — real implementations with Zen API and MongoDB."""

import json
import logging
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.agent.state import ChatState
from app.core.config import settings
from app.services.zen_api import ZenAPIClient
from app.services.search_service import SearchService
from app.services.topic_graph_repo import TopicGraphRepo
from app.services.progress_repo import ProgressRepo

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """You are an expert programming tutor. Help users learn technical concepts step by step.

Rules:
- Explain concepts clearly at the user's difficulty level
- Use concrete code examples when helpful
- Reference the provided context when relevant
- If context doesn't contain the answer, say so and provide general knowledge
- Keep responses concise but thorough
- Use markdown formatting for code blocks

Context about the user's progress:
{context}

Retrieved learning materials:
{retrieved}
"""


async def classify_query(state: ChatState) -> ChatState:
    """Classify user query type using Zen API."""
    client = ZenAPIClient()

    messages = [
        {"role": "system", "content": """Classify the user's query. Return JSON only.
Fields:
- query_type: "factual" (specific fact), "conceptual" (understanding), "cross-topic" (connecting topics), "general" (chat)
- complexity: "simple" (single concept), "moderate" (multiple concepts), "complex" (deep dive)
- extracted_entities: list of technical terms, course names, or node IDs mentioned"""},
        {"role": "user", "content": state["user_message"]},
    ]

    try:
        response = await client.chat_completion(
            messages=messages,
            model=settings.LLM_MODEL,
            temperature=0.1,
            max_tokens=200,
        )
        data = json.loads(response)
        state["query_type"] = data.get("query_type", "general")
        state["complexity"] = data.get("complexity", "simple")
        state["extracted_entities"] = data.get("extracted_entities", [])
    except Exception as e:
        logger.warning("classify_query failed: %s", e)
        state["query_type"] = "general"
        state["complexity"] = "simple"
        state["extracted_entities"] = []

    return state


async def load_user_context(state: ChatState) -> ChatState:
    """Fetch user profile, progress, and determine effective difficulty."""
    db: AsyncIOMotorDatabase = state.get("_db")
    if not db:
        state["knowledge_profile"] = {}
        state["completed_nodes"] = []
        state["effective_difficulty"] = "intermediate"
        return state

    progress_repo = ProgressRepo(db)

    try:
        progress = await progress_repo.find_by_user(state["user_id"])
        completed = []
        for p in progress:
            completed.extend(p.get("completed_nodes", []))

        state["completed_nodes"] = completed
        state["knowledge_profile"] = {
            "total_completed": len(completed),
            "courses_in_progress": len(progress),
        }
        state["effective_difficulty"] = state.get("difficulty_preference", "intermediate")
    except Exception:
        state["completed_nodes"] = []
        state["knowledge_profile"] = {}
        state["effective_difficulty"] = "intermediate"

    return state


async def retrieve_text(state: ChatState) -> ChatState:
    """MongoDB full-text search across course content."""
    db: AsyncIOMotorDatabase = state.get("_db")
    if not db:
        state["text_results"] = []
        return state

    search_service = SearchService(db)
    query = state["user_message"]

    course_filter = state.get("course_context")
    if not course_filter and state.get("extracted_entities"):
        course_filter = state["extracted_entities"][0]

    try:
        results = await search_service.search(
            query=query,
            course_filter=course_filter,
            limit=5,
        )
        state["text_results"] = results
    except Exception:
        state["text_results"] = []

    return state


async def retrieve_graph(state: ChatState) -> ChatState:
    """Knowledge graph traversal — find related topics."""
    db: AsyncIOMotorDatabase = state.get("_db")
    if not db:
        state["graph_results"] = []
        return state

    graph_repo = TopicGraphRepo(db)
    entities = state.get("extracted_entities", [])

    results = []
    try:
        for entity in entities[:3]:
            related = await graph_repo.find_related(entity, max_results=3)
            results.extend(related)
    except Exception:
        pass

    state["graph_results"] = results[:10]
    return state


async def fuse_results(state: ChatState) -> ChatState:
    """Combine, deduplicate, and rank text + graph results."""
    text_results = state.get("text_results", [])
    graph_results = state.get("graph_results", [])
    completed = set(state.get("completed_nodes", []))

    seen = set()
    fused = []

    for r in text_results:
        node_id = r.get("node_id", "")
        if node_id and node_id in seen:
            continue
        if node_id:
            seen.add(node_id)
        r["_source"] = "text_search"
        r["_score"] = r.get("relevance_score", 0.5)
        fused.append(r)

    for r in graph_results:
        topic = r.get("topic", "")
        if topic and topic in seen:
            continue
        if topic:
            seen.add(topic)
        r["_source"] = "knowledge_graph"
        r["_score"] = r.get("strength", 0.3)
        fused.append(r)

    fused.sort(key=lambda x: x.get("_score", 0), reverse=True)

    state["fused_results"] = fused[:5]
    return state


async def generate_response(state: ChatState) -> ChatState:
    """Generate response via Zen API with retrieved context."""
    client = ZenAPIClient()

    context_parts = []
    if state.get("knowledge_profile"):
        profile = state["knowledge_profile"]
        context_parts.append(
            f"User has completed {profile.get('total_completed', 0)} nodes "
            f"across {profile.get('courses_in_progress', 0)} courses."
        )

    retrieved = state.get("fused_results", [])
    if retrieved:
        context_parts.append("Relevant learning materials:")
        for i, r in enumerate(retrieved, 1):
            title = r.get("title", r.get("topic", "Unknown"))
            snippet = r.get("snippet", r.get("description", ""))[:200]
            source = r.get("_source", "unknown")
            context_parts.append(f"{i}. [{source}] {title}: {snippet}")

    context_str = "\n".join(context_parts) if context_parts else "No specific context available."
    retrieved_str = "\n".join(context_parts) if context_parts else "No retrieved materials."

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT.format(
            context=context_str,
            retrieved=retrieved_str,
        )},
        {"role": "user", "content": state["user_message"]},
    ]

    try:
        response = await client.chat_completion(
            messages=messages,
            model=settings.LLM_MODEL,
            temperature=0.7,
            max_tokens=2000,
        )
        state["response"] = response
        state["sources_cited"] = [
            {"title": r.get("title", r.get("topic", "")), "source": r.get("_source", "")}
            for r in retrieved[:3]
        ]
    except Exception as e:
        logger.error("generate_response failed: %s", e)
        state["response"] = f"I'm having trouble connecting right now. Please try again. (Error: {str(e)})"
        state["sources_cited"] = []

    return state


async def generate_response_stream(state: ChatState) -> ChatState:
    """Generate streaming response via Zen API with retrieved context."""
    client = ZenAPIClient()

    context_parts = []
    if state.get("knowledge_profile"):
        profile = state["knowledge_profile"]
        context_parts.append(
            f"User has completed {profile.get('total_completed', 0)} nodes "
            f"across {profile.get('courses_in_progress', 0)} courses."
        )

    retrieved = state.get("fused_results", [])
    if retrieved:
        context_parts.append("Relevant learning materials:")
        for i, r in enumerate(retrieved, 1):
            title = r.get("title", r.get("topic", "Unknown"))
            snippet = r.get("snippet", r.get("description", ""))[:200]
            source = r.get("_source", "unknown")
            context_parts.append(f"{i}. [{source}] {title}: {snippet}")

    context_str = "\n".join(context_parts) if context_parts else "No specific context available."
    retrieved_str = "\n".join(context_parts) if context_parts else "No retrieved materials."

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT.format(
            context=context_str,
            retrieved=retrieved_str,
        )},
        {"role": "user", "content": state["user_message"]},
    ]

    full_response = []
    try:
        async for chunk in client.chat_stream(
            messages=messages,
            model=settings.LLM_MODEL,
            temperature=0.7,
        ):
            try:
                data = json.loads(chunk)
                delta = data.get("choices", [{}])[0].get("delta", {})
                content = delta.get("content", "")
                if content:
                    full_response.append(content)
                    state["_stream_chunk"] = content
                    yield dict(state)
            except (json.JSONDecodeError, KeyError, IndexError):
                continue
    except Exception as e:
        logger.error("generate_response_stream failed: %s", e)
        state["_stream_chunk"] = f"Error: {str(e)}"
        yield dict(state)

    state["response"] = "".join(full_response)
    state["sources_cited"] = [
        {"title": r.get("title", r.get("topic", "")), "source": r.get("_source", "")}
        for r in retrieved[:3]
    ]
    state.pop("_stream_chunk", None)
    yield dict(state)


async def check_summarize(state: ChatState) -> ChatState:
    """Compress conversation if message count exceeds threshold."""
    message_count = state.get("message_count", 0)
    token_count = state.get("token_count", 0)

    if message_count < 10 and token_count < 8000:
        return state

    client = ZenAPIClient()

    conversation = state.get("_conversation_history", [])
    if not conversation:
        return state

    messages = [
        {"role": "system", "content": "Summarize this conversation in 3-4 sentences, preserving key technical concepts and user progress. Return only the summary."},
    ] + conversation[-8:]

    try:
        summary = await client.chat_completion(
            messages=messages,
            model=settings.LLM_MODEL,
            temperature=0.1,
            max_tokens=300,
        )
        state["conversation_summary"] = summary
    except Exception as e:
        logger.warning("check_summarize failed: %s", e)

    return state
