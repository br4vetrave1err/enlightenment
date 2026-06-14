"""Contract tests for POST /api/auth/logout."""

import pytest
from httpx import AsyncClient


@pytest.mark.contract
@pytest.mark.asyncio
async def test_logout_success(async_client: AsyncClient):
    reg = await async_client.post(
        "/api/auth/register",
        json={
            "email": "logout@example.com",
            "password": "securepassword123",
            "display_name": "Test",
        },
    )
    tokens = reg.json()
    access_token = tokens["access_token"]
    refresh_token = tokens["refresh_token"]

    response = await async_client.post(
        "/api/auth/logout",
        json={"refresh_token": refresh_token},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 200


@pytest.mark.contract
@pytest.mark.asyncio
async def test_logout_no_auth(async_client: AsyncClient):
    response = await async_client.post(
        "/api/auth/logout",
        json={"refresh_token": "some-token"},
    )
    assert response.status_code == 401
