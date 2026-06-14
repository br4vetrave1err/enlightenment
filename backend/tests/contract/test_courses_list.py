"""Contract tests for GET /api/courses"""
import pytest


@pytest.mark.asyncio
async def test_list_courses_returns_courses(auth_client, test_course_factory, mock_mongodb):
    """Should return list of courses with progress fields."""
    course = test_course_factory()
    await mock_mongodb.courses.insert_one(course)

    response = await auth_client.get("/api/courses/")

    assert response.status_code == 200
    data = response.json()
    assert "courses" in data
    assert len(data["courses"]) == 1
    course_data = data["courses"][0]
    assert course_data["course_id"] == "frontend"
    assert course_data["title"] == "Frontend Developer"
    assert "total_nodes" in course_data
    assert "completed_nodes" in course_data
    assert "completion_percentage" in course_data


@pytest.mark.asyncio
async def test_list_courses_status_filter(auth_client, test_course_factory, mock_mongodb):
    """Should support status filter parameter."""
    course = test_course_factory()
    await mock_mongodb.courses.insert_one(course)

    response = await auth_client.get("/api/courses/", params={"status_filter": "all"})

    assert response.status_code == 200
    data = response.json()
    assert len(data["courses"]) == 1


@pytest.mark.asyncio
async def test_list_courses_empty(auth_client, mock_mongodb):
    """Should return empty list when no courses exist."""
    response = await auth_client.get("/api/courses/")

    assert response.status_code == 200
    data = response.json()
    assert data["courses"] == []
