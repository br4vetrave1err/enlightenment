"""Google OAuth utilities."""

import httpx
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.core.config import settings

GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo"


def get_google_auth_url(state: str) -> str:
    """Generate Google OAuth authorization URL."""
    redirect_uri = f"{settings.APP_URL}/auth/google/callback"
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
        "prompt": "consent",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{GOOGLE_AUTH_ENDPOINT}?{query}"


async def exchange_code_for_tokens(code: str) -> dict:
    """Exchange authorization code for access and refresh tokens."""
    redirect_uri = f"{settings.APP_URL}/auth/google/callback"
    data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(GOOGLE_TOKEN_ENDPOINT, data=data)
        response.raise_for_status()
        return response.json()


async def fetch_google_user_info(access_token: str) -> dict:
    """Fetch user info from Google using access token."""
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(GOOGLE_USERINFO_ENDPOINT, headers=headers)
        response.raise_for_status()
        return response.json()


def verify_google_id_token(id_token_str: str) -> dict:
    """Verify and decode a Google ID token."""
    try:
        info = id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
        return info
    except Exception as e:
        raise ValueError(f"Invalid Google ID token: {e}")
