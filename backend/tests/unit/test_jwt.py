"""Unit tests for JWT token creation and verification."""

import pytest
from jose import jwt
from datetime import datetime, timedelta, timezone

from app.core.auth import create_access_token, create_refresh_token, get_current_user
from app.core.config import settings


@pytest.mark.unit
def test_create_access_token():
    token = create_access_token("user123")
    assert isinstance(token, str)
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    assert payload["sub"] == "user123"
    assert "exp" in payload
    assert "type" not in payload


@pytest.mark.unit
def test_create_refresh_token():
    token = create_refresh_token("user123")
    assert isinstance(token, str)
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    assert payload["sub"] == "user123"
    assert payload["type"] == "refresh"
    assert "exp" in payload


@pytest.mark.unit
def test_access_token_expiry():
    token = create_access_token("user123")
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
    now = datetime.now(tz=timezone.utc)
    assert exp > now
    assert (exp - now) < timedelta(hours=2)


@pytest.mark.unit
def test_refresh_token_expiry():
    token = create_refresh_token("user123")
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
    now = datetime.now(tz=timezone.utc)
    assert exp > now
    assert (exp - now) > timedelta(days=1)
