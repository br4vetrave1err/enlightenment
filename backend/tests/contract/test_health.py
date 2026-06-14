"""Contract test for health endpoint."""

import pytest
from httpx import AsyncClient


@pytest.mark.contract
@pytest.mark.asyncio
async def test_health_returns_ok(async_client: AsyncClient):
    response = await async_client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
