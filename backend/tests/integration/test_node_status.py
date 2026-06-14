"""Integration tests for node status calculation"""
import pytest


@pytest.mark.asyncio
async def test_node_status_calculation(auth_client, test_course_factory, mock_mongodb):
    """Should calculate correct node statuses."""
    course = test_course_factory()
    await mock_mongodb.courses.insert_one(course)

    response = await auth_client.get("/api/courses/frontend")

    assert response.status_code == 200
    data = response.json()
    nodes = data["nodes"]

    html_node = next(n for n in nodes if n["node_id"] == "html-basics")
    assert html_node["status"] == "available"

    css_node = next(n for n in nodes if n["node_id"] == "css-basics")
    assert css_node["status"] == "locked"


@pytest.mark.asyncio
async def test_node_unlocks_after_prereq(auth_client, test_course_factory, mock_mongodb):
    """Should unlock nodes after completing prerequisites."""
    course = test_course_factory()
    await mock_mongodb.courses.insert_one(course)

    await auth_client.post(
        "/api/user/progress/frontend/node",
        json={"node_id": "html-basics", "action": "complete"},
    )

    response = await auth_client.get("/api/courses/frontend")
    nodes = response.json()["nodes"]

    css_node = next(n for n in nodes if n["node_id"] == "css-basics")
    assert css_node["status"] == "available"
