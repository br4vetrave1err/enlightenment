"""Contract tests for GET /api/chat/history/{session_id}"""
import pytest
from bson import ObjectId


@pytest.mark.asyncio
async def test_chat_session_returns_messages(auth_client, mock_mongodb):
    """Should return chat session with messages."""
    session_id = str(ObjectId())
    await mock_mongodb.chat_sessions.insert_one({
        "_id": ObjectId(session_id),
        "user_id": "test_user_id",
        "messages": [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi there!"},
        ],
    })

    response = await auth_client.get(f"/api/chat/history/{session_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == session_id
    assert "messages" in data
    assert len(data["messages"]) == 2


@pytest.mark.asyncio
async def test_chat_session_not_found(auth_client, mock_mongodb):
    """Should return 404 for nonexistent session."""
    response = await auth_client.get(f"/api/chat/history/{ObjectId()}")
    assert response.status_code == 404
