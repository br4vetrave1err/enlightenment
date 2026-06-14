"""Contract tests for GET /api/courses/ and /api/courses/{id}"""
import pytest


@pytest.mark.asyncio
async def test_list_courses_returns_progress(auth_client, test_course_factory, mock_mongodb):
    """Should return courses with real completion data."""
    course = test_course_factory()
    await mock_mongodb.courses.insert_one(course)

    response = await auth_client.get("/api/courses/")
    assert response.status_code == 200
    data = response.json()
    assert "courses" in data
    assert len(data["courses"]) > 0

    c = data["courses"][0]
    assert "course_id" in c
    assert "completed_nodes" in c
    assert "completion_percentage" in c
    assert c["completed_nodes"] == 0
    assert c["completion_percentage"] == 0.0


@pytest.mark.asyncio
async def test_list_courses_with_completed_nodes(auth_client, test_course_factory, mock_mongodb):
    """Should show completion data after marking nodes complete."""
    course = test_course_factory()
    await mock_mongodb.courses.insert_one(course)

    await auth_client.post(
        "/api/user/progress/frontend/node",
        json={"node_id": "html-basics", "action": "complete"},
    )

    response = await auth_client.get("/api/courses/")
    c = response.json()["courses"][0]
    assert c["completed_nodes"] == 1
    assert c["completion_percentage"] == 50.0


@pytest.mark.asyncio
async def test_get_course_shows_node_status(auth_client, test_course_factory, mock_mongodb):
    """Should show real node statuses based on prerequisites."""
    course = test_course_factory()
    await mock_mongodb.courses.insert_one(course)

    response = await auth_client.get("/api/courses/frontend")
    assert response.status_code == 200
    data = response.json()
    assert len(data["nodes"]) == 2

    html_node = data["nodes"][0]
    css_node = data["nodes"][1]
    assert html_node["node_id"] == "html-basics"
    assert html_node["status"] == "available"
    assert css_node["node_id"] == "css-basics"
    assert css_node["status"] == "locked"


@pytest.mark.asyncio
async def test_get_course_unlocks_after_prereq(auth_client, test_course_factory, mock_mongodb):
    """Should unlock nodes after completing prerequisites."""
    course = test_course_factory()
    await mock_mongodb.courses.insert_one(course)

    await auth_client.post(
        "/api/user/progress/frontend/node",
        json={"node_id": "html-basics", "action": "complete"},
    )

    response = await auth_client.get("/api/courses/frontend")
    nodes = response.json()["nodes"]
    css_node = [n for n in nodes if n["node_id"] == "css-basics"][0]
    assert css_node["status"] == "available"


@pytest.mark.asyncio
async def test_get_course_not_found(auth_client, mock_mongodb):
    """Should return 404 for nonexistent course."""
    response = await auth_client.get("/api/courses/nonexistent")
    assert response.status_code == 404
