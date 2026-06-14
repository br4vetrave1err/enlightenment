"""Contract tests for GET /api/chat/history"""
import pytest


@pytest.mark.asyncio
async def test_chat_history_returns_list(auth_client, mock_mongodb):
    """Should return list of chat sessions."""
    response = await auth_client.get("/api/chat/history")

    assert response.status_code == 200
    data = response.json()
    assert "sessions" in data
