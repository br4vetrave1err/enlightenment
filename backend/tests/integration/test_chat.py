"""Integration tests for full chat flow"""
import pytest
from unittest.mock import patch, AsyncMock
from bson import ObjectId


async def mock_stream_generator():
    yield '{"choices": [{"delta": {"content": "Hello"}}]}'
    yield '{"choices": [{"delta": {"content": " world"}}]}'


@pytest.mark.asyncio
async def test_chat_flow(auth_client, mock_mongodb):
    """Should complete full chat flow with mocked Zen API."""
    with patch("app.agent.nodes.ZenAPIClient") as mock_client:
        mock_instance = mock_client.return_value
        mock_instance.chat_completion = AsyncMock(return_value="Test response")
        mock_instance.chat_stream = mock_stream_generator

        stream_resp = await auth_client.post(
            "/api/chat/stream",
            json={"message": "What is React?", "session_id": None},
        )
        assert stream_resp.status_code == 200

        history_resp = await auth_client.get("/api/chat/history")
        assert history_resp.status_code == 200
        sessions = history_resp.json()["sessions"]
        assert len(sessions) > 0

        session_id = sessions[0]["_id"]
        session_resp = await auth_client.get(f"/api/chat/history/{session_id}")
        assert session_resp.status_code == 200

        delete_resp = await auth_client.delete(f"/api/chat/history/{session_id}")
        assert delete_resp.status_code == 200
