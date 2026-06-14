"""Unit tests for retrieve_text node"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from app.agent.nodes import retrieve_text


@pytest.mark.asyncio
async def test_retrieve_text_initializes_results():
    state = {"user_message": "test", "_db": None}
    result = await retrieve_text(state)
    assert result["text_results"] == []
