"""Unit tests for STORE step"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from app.pipeline.store import store_courses


@pytest.mark.asyncio
async def test_store_courses_inserts_new():
    """Should insert new courses."""
    mock_db = MagicMock()
    mock_db.courses.find_one = AsyncMock(return_value=None)
    mock_db.courses.insert_one = AsyncMock()

    from app.pipeline.parse import ParsedCourse, ParsedNode
    courses = [
        ParsedCourse(
            course_id="test",
            title="Test Course",
            nodes=[ParsedNode(node_id="n1", title="Node 1")],
        )
    ]

    result = await store_courses(mock_db, courses, "abc123")

    assert mock_db.courses.insert_one.called
    assert result["nodes_added"] == 1


@pytest.mark.asyncio
async def test_store_courses_updates_existing():
    """Should update existing courses."""
    mock_db = MagicMock()
    mock_db.courses.find_one = AsyncMock(return_value={"nodes": []})
    mock_db.courses.update_one = AsyncMock()

    from app.pipeline.parse import ParsedCourse, ParsedNode
    courses = [
        ParsedCourse(
            course_id="test",
            title="Test Course",
            nodes=[ParsedNode(node_id="n1", title="Node 1")],
        )
    ]

    result = await store_courses(mock_db, courses, "abc123")

    assert mock_db.courses.update_one.called
    assert result["nodes_updated"] >= 0
