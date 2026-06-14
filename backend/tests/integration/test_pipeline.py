"""Integration tests for full pipeline"""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock

from app.pipeline.orchestrator import run_pipeline


@pytest.mark.asyncio
async def test_full_pipeline_runs():
    """Should run full pipeline: fetch → parse → extract → build → store."""
    mock_db = MagicMock()
    mock_db.courses.find_one = AsyncMock(return_value=None)
    mock_db.courses.insert_one = AsyncMock()
    mock_db.topic_graph.replace_one = AsyncMock()
    mock_db.sync_log.insert_one = AsyncMock(return_value=MagicMock(inserted_id="log1"))

    # Mock fetch
    mock_fetch_result = MagicMock()
    mock_fetch_result.sha = "abc123"
    mock_fetch_result.changed = True
    mock_fetch_result.repo_path = "/tmp/test"

    # Mock parse
    from app.pipeline.parse import ParsedCourse, ParsedNode
    mock_courses = [
        ParsedCourse(
            course_id="test",
            title="Test",
            nodes=[ParsedNode(node_id="n1", title="Node 1")],
        )
    ]

    with patch("app.pipeline.orchestrator.fetch_content", new_callable=AsyncMock) as mock_fetch, \
         patch("app.pipeline.orchestrator.parse_roadmap", return_value=mock_courses) as mock_parse, \
         patch("app.pipeline.orchestrator.extract_batch", new_callable=AsyncMock) as mock_extract, \
         patch("app.pipeline.orchestrator.build_topic_graph", return_value=[]) as mock_build:

        mock_fetch.return_value = mock_fetch_result
        mock_extract.return_value = []

        result = await run_pipeline(mock_db, triggered_by="test")

    assert result["status"] == "completed"
    assert result["sha"] == "abc123"


@pytest.mark.asyncio
async def test_pipeline_no_changes():
    """Should return no_changes when SHA matches."""
    mock_db = MagicMock()

    mock_fetch_result = MagicMock()
    mock_fetch_result.sha = "abc123"
    mock_fetch_result.changed = False

    with patch("app.pipeline.orchestrator.fetch_content", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = mock_fetch_result

        result = await run_pipeline(mock_db, triggered_by="test", previous_sha="abc123")

    assert result["status"] == "no_changes"


@pytest.mark.asyncio
async def test_pipeline_handles_error():
    """Should handle errors and log them."""
    mock_db = MagicMock()
    mock_db.sync_log.insert_one = AsyncMock(return_value=MagicMock(inserted_id="log1"))

    with patch("app.pipeline.orchestrator.fetch_content", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.side_effect = RuntimeError("Git failed")

        result = await run_pipeline(mock_db, triggered_by="test")

    assert result["status"] == "failed"
    assert "error" in result
