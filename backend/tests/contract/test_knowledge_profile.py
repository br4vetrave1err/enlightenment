"""Contract tests for GET /api/user/knowledge-profile"""
import pytest


@pytest.mark.asyncio
async def test_knowledge_profile_empty(auth_client, mock_mongodb):
    """Should return empty profile for new user."""
    response = await auth_client.get("/api/user/knowledge-profile")
    assert response.status_code == 200
    data = response.json()
    assert "topics" in data
    assert "knowledge_gaps" in data
    assert "learning_velocity" in data
    assert data["topics"] == []
    assert data["knowledge_gaps"] == []


@pytest.mark.asyncio
async def test_knowledge_profile_with_topics(auth_client, mock_mongodb):
    """Should return topics when profile exists."""
    await mock_mongodb.knowledge_profile.insert_one({
        "user_id": "test_user_id",
        "topics": [
            {"name": "html", "mastery_level": 0.8, "sources": ["frontend"]},
            {"name": "css", "mastery_level": 0.2, "sources": ["frontend"]},
        ],
    })

    response = await auth_client.get("/api/user/knowledge-profile")
    data = response.json()
    assert len(data["topics"]) == 2
    assert len(data["knowledge_gaps"]) == 1
    assert data["knowledge_gaps"][0]["topic"] == "css"
    assert data["learning_velocity"]["nodes_per_week"] == 0.0
