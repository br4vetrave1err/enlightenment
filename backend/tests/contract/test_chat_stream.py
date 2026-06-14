"""Contract tests for POST /api/chat/stream (SSE)"""
import pytest
from unittest.mock import patch, AsyncMock


async def mock_stream_generator():
    yield '{"choices": [{"delta": {"content": "Hello"}}]}'
    yield '{"choices": [{"delta": {"content": " world"}}]}'


@pytest.mark.asyncio
async def test_chat_stream_returns_sse(auth_client, mock_mongodb):
    """Should return SSE stream with token and done events."""
    with patch("app.agent.nodes.ZenAPIClient") as mock_client:
        mock_instance = mock_client.return_value
        mock_instance.chat_completion = AsyncMock(return_value="Test response")
        mock_instance.chat_stream = mock_stream_generator

        response = await auth_client.post(
            "/api/chat/stream",
            json={"message": "What is Python?", "session_id": None},
        )

        assert response.status_code == 200
        assert "text/event-stream" in response.headers.get("content-type", "")


@pytest.mark.asyncio
async def test_chat_stream_with_session(auth_client, mock_mongodb):
    """Should support existing session_id."""
    with patch("app.agent.nodes.ZenAPIClient") as mock_client:
        mock_instance = mock_client.return_value
        mock_instance.chat_completion = AsyncMock(return_value="Test response")
        mock_instance.chat_stream = mock_stream_generator

        response = await auth_client.post(
            "/api/chat/stream",
            json={"message": "Continue", "session_id": "existing-session"},
        )

        assert response.status_code == 200
