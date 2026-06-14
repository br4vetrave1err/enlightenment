"""Contract tests for POST /api/auth/refresh."""

import pytest
from httpx import AsyncClient


@pytest.mark.contract
@pytest.mark.asyncio
async def test_refresh_success(async_client: AsyncClient):
    reg = await async_client.post(
        "/api/auth/register",
        json={
            "email": "refresh@example.com",
            "password": "securepassword123",
            "display_name": "Test",
        },
    )
    refresh_token = reg.json()["refresh_token"]

    response = await async_client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["refresh_token"] != refresh_token


@pytest.mark.contract
@pytest.mark.asyncio
async def test_refresh_invalid_token(async_client: AsyncClient):
    response = await async_client.post(
        "/api/auth/refresh",
        json={"refresh_token": "invalid-token-here"},
    )
    assert response.status_code == 401


@pytest.mark.contract
@pytest.mark.asyncio
async def test_refresh_reused_token(async_client: AsyncClient):
    reg = await async_client.post(
        "/api/auth/register",
        json={
            "email": "reuse@example.com",
            "password": "securepassword123",
            "display_name": "Test",
        },
    )
    refresh_token = reg.json()["refresh_token"]

    await async_client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    response = await async_client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == 401
