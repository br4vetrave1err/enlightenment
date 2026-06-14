"""Integration tests for course browsing flow"""
import pytest


@pytest.mark.asyncio
async def test_course_browsing_flow(auth_client, test_course_factory, mock_mongodb):
    """Should browse courses: list → detail → node content."""
    course = test_course_factory()
    await mock_mongodb.courses.insert_one(course)

    list_resp = await auth_client.get("/api/courses/")
    assert list_resp.status_code == 200
    courses = list_resp.json()["courses"]
    assert len(courses) == 1

    detail_resp = await auth_client.get("/api/courses/frontend")
    assert detail_resp.status_code == 200
    nodes = detail_resp.json()["nodes"]
    assert len(nodes) == 2

    node_resp = await auth_client.get("/api/courses/frontend/nodes/html-basics")
    assert node_resp.status_code == 200
    node_data = node_resp.json()
    assert "HTML" in node_data["content"]
