"""Contract tests for GET /api/courses/{course_id}/nodes/{node_id}"""
import pytest


@pytest.mark.asyncio
async def test_get_node_returns_content(auth_client, test_course_factory, mock_mongodb):
    """Should return node content and metadata."""
    course = test_course_factory()
    await mock_mongodb.courses.insert_one(course)

    response = await auth_client.get("/api/courses/frontend/nodes/html-basics")

    assert response.status_code == 200
    data = response.json()
    assert data["node_id"] == "html-basics"
    assert data["title"] == "HTML Basics"
    assert "content" in data
    assert "links" in data
    assert "prerequisites" in data
    assert data["estimated_minutes"] == 30


@pytest.mark.asyncio
async def test_get_node_not_found(auth_client, mock_mongodb):
    """Should return 404 for nonexistent node."""
    response = await auth_client.get("/api/courses/frontend/nodes/nonexistent")

    assert response.status_code == 404
