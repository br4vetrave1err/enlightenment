"""Contract tests for GET /api/user/progress"""
import pytest


@pytest.mark.asyncio
async def test_list_progress(auth_client, mock_mongodb):
    """Should return list of course progress."""
    response = await auth_client.get("/api/user/progress")

    assert response.status_code == 200
    data = response.json()
    assert "courses" in data
