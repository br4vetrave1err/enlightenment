"""Unit tests for check_summarize node"""
import pytest
from unittest.mock import patch, AsyncMock

from app.agent.nodes import check_summarize


@pytest.mark.asyncio
async def test_check_summarize_returns_state():
    state = {"message_count": 2, "token_count": 100}
    result = await check_summarize(state)
    assert result["message_count"] == 2
    assert result["token_count"] == 100


@pytest.mark.asyncio
async def test_check_summarize_triggers_on_threshold():
    state = {
        "message_count": 15,
        "token_count": 10000,
        "_conversation_history": [
            {"role": "user", "content": "What is Python?"},
            {"role": "assistant", "content": "Python is a programming language."},
        ],
    }
    with patch("app.agent.nodes.ZenAPIClient") as mock_client:
        mock_instance = mock_client.return_value
        mock_instance.chat_completion = AsyncMock(return_value="Summary of conversation")
        result = await check_summarize(state)
    assert result["conversation_summary"] == "Summary of conversation"
