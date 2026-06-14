"""Integration tests for progress tracking flow"""
import pytest


@pytest.mark.asyncio
async def test_progress_tracking_flow(auth_client, test_course_factory, mock_mongodb):
    """Should track progress: update node → list progress → check stats."""
    course = test_course_factory()
    await mock_mongodb.courses.insert_one(course)

    update_resp = await auth_client.post(
        "/api/user/progress/frontend/node",
        json={"node_id": "html-basics", "action": "complete", "time_spent_seconds": 1800},
    )
    assert update_resp.status_code == 200

    list_resp = await auth_client.get("/api/user/progress")
    assert list_resp.status_code == 200

    stats_resp = await auth_client.get("/api/user/learning-stats")
    assert stats_resp.status_code == 200

    profile_resp = await auth_client.get("/api/user/knowledge-profile")
    assert profile_resp.status_code == 200
