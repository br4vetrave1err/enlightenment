"""Unit tests for retrieve_graph node"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from app.agent.nodes import retrieve_graph


@pytest.mark.asyncio
async def test_retrieve_graph_initializes_results():
    state = {"extracted_entities": [], "_db": None}
    result = await retrieve_graph(state)
    assert result["graph_results"] == []
