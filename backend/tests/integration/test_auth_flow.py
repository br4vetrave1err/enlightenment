"""Integration test for full auth flow: register → login → refresh → logout."""

import pytest
from httpx import AsyncClient


@pytest.mark.integration
@pytest.mark.asyncio
async def test_full_auth_flow(live_client: AsyncClient):
    reg = await live_client.post(
        "/api/auth/register",
        json={
            "email": "flow@example.com",
            "password": "securepassword123",
            "display_name": "Flow User",
        },
    )
    assert reg.status_code == 201
    tokens = reg.json()
    assert tokens["user"]["email"] == "flow@example.com"

    login = await live_client.post(
        "/api/auth/login",
        json={
            "email": "flow@example.com",
            "password": "securepassword123",
        },
    )
    assert login.status_code == 200
    login_tokens = login.json()
    assert login_tokens["user"]["email"] == "flow@example.com"

    refresh = await live_client.post(
        "/api/auth/refresh",
        json={"refresh_token": login_tokens["refresh_token"]},
    )
    assert refresh.status_code == 200
    new_tokens = refresh.json()
    assert new_tokens["refresh_token"] != login_tokens["refresh_token"]

    logout = await live_client.post(
        "/api/auth/logout",
        json={"refresh_token": new_tokens["refresh_token"]},
        headers={"Authorization": f"Bearer {new_tokens['access_token']}"},
    )
    assert logout.status_code == 200

    reused = await live_client.post(
        "/api/auth/refresh",
        json={"refresh_token": new_tokens["refresh_token"]},
    )
    assert reused.status_code == 401
