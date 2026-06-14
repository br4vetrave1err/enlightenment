"""Unit tests for classify_query node"""
import pytest
from unittest.mock import patch, AsyncMock

from app.agent.nodes import classify_query


@pytest.mark.asyncio
async def test_classify_query_sets_defaults():
    state = {"user_message": "What is Python?"}
    with patch("app.agent.nodes.ZenAPIClient") as mock_client:
        mock_instance = mock_client.return_value
        mock_instance.chat_completion = AsyncMock(return_value='{"query_type": "factual", "complexity": "simple", "extracted_entities": ["Python"]}')
        result = await classify_query(state)
    assert result["query_type"] == "factual"
    assert result["complexity"] == "simple"
    assert "Python" in result["extracted_entities"]


@pytest.mark.asyncio
async def test_classify_query_handles_api_error():
    state = {"user_message": "What is Python?"}
    with patch("app.agent.nodes.ZenAPIClient") as mock_client:
        mock_instance = mock_client.return_value
        mock_instance.chat_completion = AsyncMock(side_effect=RuntimeError("API error"))
        result = await classify_query(state)
    assert result["query_type"] == "general"
    assert result["complexity"] == "simple"
    assert result["extracted_entities"] == []
