"""Contract tests for GET /api/courses/{course_id}"""
import pytest


@pytest.mark.asyncio
async def test_get_course_returns_detail(auth_client, test_course_factory, mock_mongodb):
    """Should return course detail with nodes and edges."""
    course = test_course_factory()
    await mock_mongodb.courses.insert_one(course)

    response = await auth_client.get("/api/courses/frontend")

    assert response.status_code == 200
    data = response.json()
    assert data["course_id"] == "frontend"
    assert data["title"] == "Frontend Developer"
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) == 2
    assert data["nodes"][0]["node_id"] == "html-basics"
    assert data["nodes"][0]["status"] == "available"


@pytest.mark.asyncio
async def test_get_course_not_found(auth_client, mock_mongodb):
    """Should return 404 for nonexistent course."""
    response = await auth_client.get("/api/courses/nonexistent")

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_course_status_overlay(auth_client, test_course_factory, mock_mongodb):
    """Should include status overlay on nodes."""
    course = test_course_factory()
    await mock_mongodb.courses.insert_one(course)

    response = await auth_client.get("/api/courses/frontend")

    data = response.json()
    for node in data["nodes"]:
        assert "status" in node
        assert node["status"] in ("available", "locked", "completed", "in_progress")
