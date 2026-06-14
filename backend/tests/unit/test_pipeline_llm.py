"""Unit tests for LLM extraction"""
import json
import pytest
from unittest.mock import patch, AsyncMock

from app.pipeline.extract import extract_concepts, ExtractionResult, ExtractedConcept


@pytest.mark.asyncio
async def test_extract_concepts_returns_result():
    """Should return ExtractionResult with concepts."""
    mock_response = json.dumps({
        "concepts": [
            {"name": "html", "description": "Markup language", "difficulty": "beginner"}
        ],
        "summary": "Introduction to HTML",
        "tags": ["html"],
    })

    with patch("app.pipeline.extract._call_zen_api", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = mock_response
        result = await extract_concepts("node1", "HTML Basics", "HTML content")

    assert isinstance(result, ExtractionResult)
    assert result.node_id == "node1"
    assert len(result.concepts) == 1
    assert result.concepts[0].name == "html"


@pytest.mark.asyncio
async def test_extract_concepts_empty_content():
    """Should handle empty content."""
    with patch("app.pipeline.extract._call_zen_api", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = json.dumps({"concepts": [], "summary": "", "tags": []})
        result = await extract_concepts("node1", "Title", "")

    assert result.concepts == []
    assert result.summary == ""


@pytest.mark.asyncio
async def test_extract_batch():
    """Should extract concepts for multiple nodes."""
    from app.pipeline.extract import extract_batch
    from app.pipeline.parse import ParsedNode

    nodes = [
        ParsedNode(node_id="n1", title="HTML", content="HTML basics"),
        ParsedNode(node_id="n2", title="CSS", content="CSS basics"),
    ]

    with patch("app.pipeline.extract._call_zen_api", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = json.dumps({"concepts": [], "summary": "", "tags": []})
        results = await extract_batch(nodes)

    assert len(results) == 2
    assert all(isinstance(r, ExtractionResult) for r in results)


@pytest.mark.asyncio
async def test_extract_concepts_handles_error():
    """Should return empty result on API error."""
    with patch("app.pipeline.extract._call_zen_api", new_callable=AsyncMock) as mock_llm:
        mock_llm.side_effect = RuntimeError("API error")
        result = await extract_concepts("node1", "Title", "Content")

    assert result.concepts == []
    assert result.summary == ""
