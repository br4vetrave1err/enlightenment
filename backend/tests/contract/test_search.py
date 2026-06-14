"""Contract tests for POST /api/search"""
import pytest


@pytest.mark.asyncio
async def test_search_returns_results(auth_client, mock_mongodb):
    """Should return search results."""
    response = await auth_client.post(
        "/api/search",
        json={"query": "python", "course_filter": None, "limit": 10},
    )

    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_search_with_course_filter(auth_client, mock_mongodb):
    """Should support course filter."""
    response = await auth_client.post(
        "/api/search",
        json={"query": "react", "course_filter": "frontend", "limit": 5},
    )

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_search_empty_query(auth_client, mock_mongodb):
    """Should return 422 for empty query."""
    response = await auth_client.post(
        "/api/search",
        json={"query": "", "course_filter": None, "limit": 10},
    )

    assert response.status_code == 422
