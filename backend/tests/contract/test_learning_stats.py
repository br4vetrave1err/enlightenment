"""Contract tests for GET /api/user/learning-stats"""
import pytest


@pytest.mark.asyncio
async def test_learning_stats_empty(auth_client, mock_mongodb):
    """Should return zero stats for user with no progress."""
    response = await auth_client.get("/api/user/learning-stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_nodes_completed" in data
    assert "courses_in_progress" in data
    assert "current_streak_days" in data
    assert "nodes_per_week" in data
    assert "time_spent_total_hours" in data
    assert "knowledge_gaps" in data
    assert data["total_nodes_completed"] == 0


@pytest.mark.asyncio
async def test_learning_stats_after_completion(auth_client, test_course_factory, mock_mongodb):
    """Should reflect completed nodes in stats."""
    course = test_course_factory()
    await mock_mongodb.courses.insert_one(course)

    await auth_client.post(
        "/api/user/progress/frontend/node",
        json={"node_id": "html-basics", "action": "complete", "time_spent_seconds": 1800},
    )

    response = await auth_client.get("/api/user/learning-stats")
    data = response.json()
    assert data["total_nodes_completed"] == 1
    assert data["courses_in_progress"] == 1
    assert data["time_spent_total_hours"] > 0
