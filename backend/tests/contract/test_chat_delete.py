"""Contract tests for DELETE /api/chat/history/{session_id}"""
import pytest
from bson import ObjectId


@pytest.mark.asyncio
async def test_chat_delete(auth_client, mock_mongodb):
    """Should delete chat session."""
    session_id = str(ObjectId())
    await mock_mongodb.chat_sessions.insert_one({
        "_id": ObjectId(session_id),
        "user_id": "test_user_id",
        "messages": [],
    })

    response = await auth_client.delete(f"/api/chat/history/{session_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "deleted"


@pytest.mark.asyncio
async def test_chat_delete_not_found(auth_client, mock_mongodb):
    """Should return 404 for nonexistent session."""
    response = await auth_client.delete(f"/api/chat/history/{ObjectId()}")
    assert response.status_code == 404
