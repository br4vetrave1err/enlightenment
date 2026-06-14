"""Unit tests for password hashing."""

import pytest
from app.core.password import hash_password, verify_password


@pytest.mark.unit
def test_hash_password_returns_string():
    hashed = hash_password("securepassword123")
    assert isinstance(hashed, str)
    assert hashed.startswith("$2b$")


@pytest.mark.unit
def test_verify_password_correct():
    password = "securepassword123"
    hashed = hash_password(password)
    assert verify_password(password, hashed) is True


@pytest.mark.unit
def test_verify_password_incorrect():
    hashed = hash_password("securepassword123")
    assert verify_password("wrongpassword", hashed) is False


@pytest.mark.unit
def test_hash_password_different_each_time():
    hashed1 = hash_password("samepassword")
    hashed2 = hash_password("samepassword")
    assert hashed1 != hashed2


@pytest.mark.unit
def test_verify_password_invalid_hash():
    assert verify_password("password", "not-a-valid-hash") is False
