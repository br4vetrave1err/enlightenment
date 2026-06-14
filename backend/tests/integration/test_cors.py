"""Integration tests for CORS"""
import pytest


@pytest.mark.asyncio
async def test_cors_headers_present(async_client, mock_mongodb):
    """Should include CORS headers on responses."""
    response = await async_client.get(
        "/api/health",
        headers={"Origin": "http://localhost:3000"},
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" in [h.lower() for h in response.headers]
