"""Integration test for Google OAuth flow using live MongoDB."""

import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch

from app.main import app


MOCK_GOOGLE_TOKENS = {
    "access_token": "mock-google-access-token",
    "token_type": "Bearer",
    "expires_in": 3600,
}

MOCK_GOOGLE_USER = {
    "sub": "google-123456789",
    "email": "google-oauth-user@example.com",
    "name": "Google OAuth User",
    "picture": "https://example.com/avatar.jpg",
}


@pytest.mark.integration
@pytest.mark.asyncio
async def test_google_oauth_creates_user(live_client: AsyncClient):
    """Test Google OAuth creates a new user and returns tokens."""
    # Get auth URL first
    response = await live_client.post("/api/auth/google")
    assert response.status_code == 200
    state = response.json()["state"]

    # Mock Google API and trigger callback
    with patch("app.api.auth.exchange_code_for_tokens", new_callable=AsyncMock, return_value=MOCK_GOOGLE_TOKENS), \
         patch("app.api.auth.fetch_google_user_info", new_callable=AsyncMock, return_value=MOCK_GOOGLE_USER):

        response = await live_client.post(
            "/api/auth/google/callback",
            json={"code": "mock-auth-code", "state": state},
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == "google-oauth-user@example.com"
        assert data["user"]["display_name"] == "Google OAuth User"

    # Verify user exists in DB
    user = await app.db.users.find_one({"email": "google-oauth-user@example.com"})
    assert user is not None


@pytest.mark.integration
@pytest.mark.asyncio
async def test_google_oauth_existing_user_returns_tokens(live_client: AsyncClient):
    """Test Google OAuth with existing user returns tokens without creating duplicate."""
    # First login creates user
    with patch("app.api.auth.exchange_code_for_tokens", new_callable=AsyncMock, return_value=MOCK_GOOGLE_TOKENS), \
         patch("app.api.auth.fetch_google_user_info", new_callable=AsyncMock, return_value=MOCK_GOOGLE_USER):

        response = await live_client.post(
            "/api/auth/google/callback",
            json={"code": "code1", "state": "state1"},
        )
        assert response.status_code == 200
        first_tokens = response.json()

    # Second login with same account
    with patch("app.api.auth.exchange_code_for_tokens", new_callable=AsyncMock, return_value=MOCK_GOOGLE_TOKENS), \
         patch("app.api.auth.fetch_google_user_info", new_callable=AsyncMock, return_value=MOCK_GOOGLE_USER):

        response = await live_client.post(
            "/api/auth/google/callback",
            json={"code": "code2", "state": "state2"},
        )
        assert response.status_code == 200
        second_tokens = response.json()

    # Both should return tokens for the same user
    assert first_tokens["user"]["id"] == second_tokens["user"]["id"]

    # Verify only one user exists with this email
    count = await app.db.users.count_documents({"email": "google-oauth-user@example.com"})
    assert count == 1
