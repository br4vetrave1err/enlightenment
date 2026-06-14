"""Contract tests for GET /api/sync/status."""

import pytest
from httpx import AsyncClient

from app.main import app


@pytest.mark.contract
@pytest.mark.asyncio
async def test_sync_status_never_synced(async_client: AsyncClient):
    """When no sync has ever run, return never_synced."""
    response = await async_client.get("/api/sync/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "never_synced"


@pytest.mark.contract
@pytest.mark.asyncio
async def test_sync_status_after_sync(async_client: AsyncClient):
    """After a sync log exists, return sync details."""
    # Seed a sync log directly in the mock DB via the app
    # Collection name is "sync_log" (singular) per sync_log_repo.py
    await app.db.sync_log.insert_one({
        "started_at": "2024-01-15T10:00:00Z",
        "status": "completed",
        "courses_updated": ["frontend", "backend"],
        "nodes_added": 42,
        "nodes_updated": 5,
        "github_sha": "abc123def456",
    })

    response = await async_client.get("/api/sync/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["github_sha"] == "abc123def456"
    assert data["nodes_added"] == 42
    assert data["nodes_updated"] == 5
    assert "frontend" in data["courses_updated"]
