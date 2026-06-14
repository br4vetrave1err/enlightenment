"""Integration tests for rate limiting"""
import pytest


@pytest.mark.asyncio
async def test_rate_limit_allows_normal_usage(async_client, mock_mongodb):
    """Should allow normal request rate."""
    for _ in range(5):
        response = await async_client.get("/api/health")
        assert response.status_code == 200
