"""LLM EXTRACT step — extract concepts from nodes using Qwen via Zen API."""

import asyncio
import json
from typing import List, Optional
from dataclasses import dataclass, field

from app.core.config import settings


@dataclass
class ExtractedConcept:
    name: str
    description: str
    difficulty: str = "beginner"


@dataclass
class ExtractionResult:
    node_id: str
    concepts: List[ExtractedConcept] = field(default_factory=list)
    summary: str = ""
    extracted_concepts: List[str] = field(default_factory=list)
    difficulty: str = "beginner"


EXTRACTION_PROMPT = """Extract key learning concepts from this node content.

Title: {title}
Content: {content}

Return JSON:
{{
  "concepts": [
    {{"name": "concept_name", "description": "brief description", "difficulty": "beginner|intermediate|advanced"}}
  ],
  "summary": "2-3 sentence summary of this node",
  "tags": ["tag1", "tag2"]
}}

Extract 3-8 key concepts. Focus on technical terms, patterns, and skills.
"""


async def extract_concepts(
    node_id: str,
    title: str,
    content: str,
) -> ExtractionResult:
    """Use LLM to extract concepts from node content."""
    prompt = EXTRACTION_PROMPT.format(title=title, content=content[:3000])

    try:
        response = await _call_zen_api(prompt)
        data = json.loads(response)

        concepts = [
            ExtractedConcept(
                name=c.get("name", ""),
                description=c.get("description", ""),
                difficulty=c.get("difficulty", "beginner"),
            )
            for c in data.get("concepts", [])
        ]

        return ExtractionResult(
            node_id=node_id,
            concepts=concepts,
            summary=data.get("summary", ""),
            extracted_concepts=[c.name for c in concepts],
            difficulty=data.get("difficulty", "beginner"),
        )
    except Exception:
        return ExtractionResult(
            node_id=node_id,
            concepts=[],
            summary="",
            extracted_concepts=[],
            difficulty="beginner",
        )


async def extract_batch(
    nodes: list,
    concurrency: int = 3,
) -> List[ExtractionResult]:
    """Extract concepts from multiple nodes with rate limiting."""
    semaphore = asyncio.Semaphore(concurrency)
    results = []

    async def _extract(node):
        async with semaphore:
            return await extract_concepts(
                node_id=node.node_id,
                title=node.title,
                content=node.content or "",
            )

    tasks = [_extract(n) for n in nodes]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    return [r for r in results if isinstance(r, ExtractionResult)]


async def _call_zen_api(prompt: str) -> str:
    """Call Zen API for LLM extraction."""
    import httpx

    if not settings.ZEN_API_KEY:
        raise RuntimeError("ZEN_API_KEY not configured")

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            "https://api.zen.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.ZEN_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "qwen3.5-plus",
                "messages": [
                    {"role": "system", "content": "You are a technical education analyst. Return ONLY valid JSON."},
                    {"role": "user", "content": prompt},
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.1,
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
