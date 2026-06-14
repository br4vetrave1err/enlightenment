"""Unit tests for OAuth URL generation."""

import pytest
from urllib.parse import urlparse, parse_qs

from app.core.oauth import get_google_auth_url


@pytest.mark.unit
def test_google_auth_url_contains_required_params():
    state = "test_csrf_token"
    url = get_google_auth_url(state)

    parsed = urlparse(url)
    params = parse_qs(parsed.query)

    assert parsed.netloc == "accounts.google.com"
    assert parsed.path == "/o/oauth2/v2/auth"
    assert params["state"][0] == state
    assert params["response_type"][0] == "code"
    assert "openid" in params["scope"][0]
    assert params["access_type"][0] == "offline"
