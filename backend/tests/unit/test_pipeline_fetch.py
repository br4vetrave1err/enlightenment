"""Unit tests for FETCH step"""
import pytest
from unittest.mock import patch, MagicMock

from app.pipeline.fetch import fetch_content, FetchResult


@pytest.mark.asyncio
async def test_fetch_content_returns_result():
    """Should return FetchResult with SHA and changed status."""
    mock_run = MagicMock()
    mock_run.returncode = 0
    mock_run.stdout = "abc123\n"

    with patch("app.pipeline.fetch.subprocess.run", return_value=mock_run):
        result = await fetch_content(previous_sha=None)

    assert isinstance(result, FetchResult)
    assert result.sha == "abc123"
    assert result.changed is True


@pytest.mark.asyncio
async def test_fetch_content_no_change():
    """Should detect no change when SHA matches."""
    mock_run = MagicMock()
    mock_run.returncode = 0
    mock_run.stdout = "abc123\n"

    with patch("app.pipeline.fetch.subprocess.run", return_value=mock_run):
        result = await fetch_content(previous_sha="abc123")

    assert result.changed is False


@pytest.mark.asyncio
async def test_fetch_content_raises_on_error():
    """Should raise RuntimeError on git failure."""
    mock_run = MagicMock()
    mock_run.returncode = 1
    mock_run.stderr = "fatal: repository not found"

    with patch("app.pipeline.fetch.subprocess.run", return_value=mock_run):
        with pytest.raises(RuntimeError) as exc_info:
            await fetch_content(previous_sha=None)

        assert "Git clone/pull failed" in str(exc_info.value)
