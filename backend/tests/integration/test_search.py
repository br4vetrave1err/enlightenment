"""Integration tests for search"""
import pytest


@pytest.mark.asyncio
async def test_search_flow(auth_client, test_course_factory, mock_mongodb):
    """Should search and return relevant results."""
    course = test_course_factory()
    await mock_mongodb.courses.insert_one(course)

    response = await auth_client.post(
        "/api/search",
        json={"query": "HTML", "course_filter": None, "limit": 10},
    )

    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert "total" in data
