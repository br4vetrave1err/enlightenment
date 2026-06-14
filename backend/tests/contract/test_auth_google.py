"""Contract tests for Google OAuth endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.contract
@pytest.mark.asyncio
async def test_google_auth_returns_url(async_client: AsyncClient):
    response = await async_client.post("/api/auth/google")
    assert response.status_code == 200
    data = response.json()
    assert "auth_url" in data
    assert "accounts.google.com" in data["auth_url"]
    assert "state" in data
