"""Contract tests for POST /api/auth/register."""

import pytest
from httpx import AsyncClient


@pytest.mark.contract
@pytest.mark.asyncio
async def test_register_success(async_client: AsyncClient):
    response = await async_client.post(
        "/api/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "securepassword123",
            "display_name": "New User",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "newuser@example.com"
    assert data["user"]["display_name"] == "New User"


@pytest.mark.contract
@pytest.mark.asyncio
async def test_register_duplicate_email(async_client: AsyncClient):
    await async_client.post(
        "/api/auth/register",
        json={
            "email": "dup@example.com",
            "password": "securepassword123",
            "display_name": "First",
        },
    )
    response = await async_client.post(
        "/api/auth/register",
        json={
            "email": "dup@example.com",
            "password": "anotherpassword123",
            "display_name": "Second",
        },
    )
    assert response.status_code == 409


@pytest.mark.contract
@pytest.mark.asyncio
async def test_register_invalid_email(async_client: AsyncClient):
    response = await async_client.post(
        "/api/auth/register",
        json={
            "email": "not-an-email",
            "password": "securepassword123",
            "display_name": "Test",
        },
    )
    assert response.status_code == 422


@pytest.mark.contract
@pytest.mark.asyncio
async def test_register_short_password(async_client: AsyncClient):
    response = await async_client.post(
        "/api/auth/register",
        json={
            "email": "short@example.com",
            "password": "short",
            "display_name": "Test",
        },
    )
    assert response.status_code == 422
