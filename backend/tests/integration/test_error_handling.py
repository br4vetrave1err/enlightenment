"""Integration tests for error handling"""
import pytest


@pytest.mark.asyncio
async def test_error_returns_standard_format(async_client, mock_mongodb):
    """Should return standardized error format."""
    response = await async_client.get("/api/nonexistent")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data


@pytest.mark.asyncio
async def test_validation_error(async_client, mock_mongodb):
    """Should return 422 for validation errors."""
    response = await async_client.post(
        "/api/auth/register",
        json={"email": "invalid", "password": "short"},
    )
    assert response.status_code == 422
