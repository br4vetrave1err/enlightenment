"""Integration tests for auth-protected routes"""
import pytest


@pytest.mark.asyncio
async def test_protected_route_requires_auth(async_client, mock_mongodb):
    """Should return 401 for protected routes without auth."""
    response = await async_client.get("/api/courses/")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_protected_route_with_invalid_token(async_client, mock_mongodb):
    """Should return 401 for invalid token."""
    response = await async_client.get(
        "/api/courses/",
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert response.status_code == 401
