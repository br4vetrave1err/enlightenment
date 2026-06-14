"""Contract tests for POST /api/webhook/github."""

import hashlib
import hmac
import json
import pytest
from httpx import AsyncClient

from app.core.config import settings


def _sign_payload(payload: dict, secret: str) -> str:
    body = json.dumps(payload).encode()
    return "sha256=" + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


@pytest.mark.contract
@pytest.mark.asyncio
async def test_webhook_valid_signature(async_client: AsyncClient, monkeypatch):
    """Webhook with valid signature should trigger sync."""
    monkeypatch.setattr(settings, "GITHUB_WEBHOOK_SECRET", "test-secret")

    payload = {"ref": "refs/heads/master"}
    signature = _sign_payload(payload, "test-secret")

    response = await async_client.post(
        "/api/webhook/github",
        json=payload,
        headers={"X-Hub-Signature-256": signature},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "sync_triggered"


@pytest.mark.contract
@pytest.mark.asyncio
async def test_webhook_invalid_signature(async_client: AsyncClient, monkeypatch):
    """Webhook with invalid signature should return 401."""
    monkeypatch.setattr(settings, "GITHUB_WEBHOOK_SECRET", "test-secret")

    payload = {"ref": "refs/heads/master"}

    response = await async_client.post(
        "/api/webhook/github",
        json=payload,
        headers={"X-Hub-Signature-256": "sha256=invalid-signature"},
    )
    assert response.status_code == 401


@pytest.mark.contract
@pytest.mark.asyncio
async def test_webhook_non_master_branch(async_client: AsyncClient, monkeypatch):
    """Webhook for non-master branch should be ignored."""
    monkeypatch.setattr(settings, "GITHUB_WEBHOOK_SECRET", "test-secret")

    payload = {"ref": "refs/heads/develop"}
    signature = _sign_payload(payload, "test-secret")

    response = await async_client.post(
        "/api/webhook/github",
        json=payload,
        headers={"X-Hub-Signature-256": signature},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ignored"
    assert "not master" in data["reason"]


@pytest.mark.contract
@pytest.mark.asyncio
async def test_webhook_no_secret_configured(async_client: AsyncClient, monkeypatch):
    """Webhook with no secret configured should accept any request."""
    monkeypatch.setattr(settings, "GITHUB_WEBHOOK_SECRET", "")

    payload = {"ref": "refs/heads/master"}

    response = await async_client.post(
        "/api/webhook/github",
        json=payload,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "sync_triggered"
