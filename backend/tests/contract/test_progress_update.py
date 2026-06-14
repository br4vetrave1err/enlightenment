"""Contract tests for POST /api/user/progress/{course_id}/node"""
import pytest


@pytest.mark.asyncio
async def test_update_node_progress(auth_client, mock_mongodb):
    """Should update node progress and return status."""
    response = await auth_client.post(
        "/api/user/progress/frontend/node",
        json={"node_id": "html-basics", "action": "complete", "time_spent_seconds": 1800},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "updated"
    assert data["node_id"] == "html-basics"
    assert data["action"] == "complete"


@pytest.mark.asyncio
async def test_update_node_progress_viewed(auth_client, mock_mongodb):
    """Should support viewed action."""
    response = await auth_client.post(
        "/api/user/progress/frontend/node",
        json={"node_id": "css-basics", "action": "view", "time_spent_seconds": 600},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["action"] == "view"
