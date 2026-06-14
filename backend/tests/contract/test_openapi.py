"""Contract test for OpenAPI spec completeness"""
import pytest


@pytest.mark.asyncio
async def test_openapi_spec_exists(async_client):
    """Should have OpenAPI spec available."""
    response = await async_client.get("/openapi.json")
    assert response.status_code == 200
    spec = response.json()
    assert "paths" in spec
    assert len(spec["paths"]) > 0


@pytest.mark.asyncio
async def test_openapi_has_auth_paths(async_client):
    """Should document auth endpoints."""
    response = await async_client.get("/openapi.json")
    spec = response.json()
    assert "/api/auth/register" in spec["paths"]
    assert "/api/auth/login" in spec["paths"]


@pytest.mark.asyncio
async def test_openapi_has_course_paths(async_client):
    """Should document course endpoints."""
    response = await async_client.get("/openapi.json")
    spec = response.json()
    assert "/api/courses/" in spec["paths"]
    assert "/api/courses/{course_id}" in spec["paths"]


@pytest.mark.asyncio
async def test_openapi_has_chat_paths(async_client):
    """Should document chat endpoints."""
    response = await async_client.get("/openapi.json")
    spec = response.json()
    assert "/api/chat/stream" in spec["paths"]
    assert "/api/chat/history" in spec["paths"]
