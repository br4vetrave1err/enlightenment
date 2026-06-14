"""Contract tests for POST /api/sync/trigger."""

import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock


@pytest.mark.contract
@pytest.mark.asyncio
async def test_sync_trigger_success(async_client: AsyncClient):
    """Manual sync trigger should return completed status."""
    mock_result = {
        "status": "completed",
        "sync_id": "mock-sync-id",
        "sha": "abc123",
        "courses_updated": 2,
        "topics_built": 10,
        "nodes_added": 42,
        "nodes_updated": 0,
    }

    with patch("app.api.sync.run_pipeline", new_callable=AsyncMock, return_value=mock_result):
        response = await async_client.post("/api/sync/trigger")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
        assert data["sha"] == "abc123"
        assert data["courses_updated"] == 2


@pytest.mark.contract
@pytest.mark.asyncio
async def test_sync_trigger_no_changes(async_client: AsyncClient):
    """When no changes detected, return no_changes status."""
    mock_result = {
        "status": "no_changes",
        "sha": "abc123",
        "message": "No new commits since last sync",
    }

    with patch("app.api.sync.run_pipeline", new_callable=AsyncMock, return_value=mock_result):
        response = await async_client.post("/api/sync/trigger")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "no_changes"


@pytest.mark.contract
@pytest.mark.asyncio
async def test_sync_trigger_failure(async_client: AsyncClient):
    """When pipeline fails, return 500 with error detail."""
    mock_result = {
        "status": "failed",
        "error": "Git clone failed: repository not found",
    }

    with patch("app.api.sync.run_pipeline", new_callable=AsyncMock, return_value=mock_result):
        response = await async_client.post("/api/sync/trigger")

        assert response.status_code == 500
        data = response.json()
        assert "Git clone failed" in data["detail"]
