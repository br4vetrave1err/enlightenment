"""Contract tests for POST /api/auth/login."""

import pytest
from httpx import AsyncClient


@pytest.mark.contract
@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient):
    await async_client.post(
        "/api/auth/register",
        json={
            "email": "loginuser@example.com",
            "password": "securepassword123",
            "display_name": "Login User",
        },
    )
    response = await async_client.post(
        "/api/auth/login",
        json={
            "email": "loginuser@example.com",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.contract
@pytest.mark.asyncio
async def test_login_wrong_password(async_client: AsyncClient):
    await async_client.post(
        "/api/auth/register",
        json={
            "email": "wrongpw@example.com",
            "password": "correctpassword123",
            "display_name": "Test",
        },
    )
    response = await async_client.post(
        "/api/auth/login",
        json={
            "email": "wrongpw@example.com",
            "password": "wrongpassword123",
        },
    )
    assert response.status_code == 401


@pytest.mark.contract
@pytest.mark.asyncio
async def test_login_nonexistent_user(async_client: AsyncClient):
    response = await async_client.post(
        "/api/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "somepassword123",
        },
    )
    assert response.status_code == 401
