"""Unit tests for load_user_context node"""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock

from app.agent.nodes import load_user_context


@pytest.mark.asyncio
async def test_load_user_context_sets_defaults():
    state = {"user_id": "user1", "_db": None}
    result = await load_user_context(state)
    assert result["knowledge_profile"] == {}
    assert result["completed_nodes"] == []
    assert result["effective_difficulty"] == "intermediate"


@pytest.mark.asyncio
async def test_load_user_context_fetches_progress():
    mock_db = MagicMock()
    mock_repo = MagicMock()
    mock_repo.find_by_user = AsyncMock(return_value=[
        {"completed_nodes": ["n1"]}
    ])

    state = {"user_id": "user1", "_db": mock_db, "difficulty_preference": "beginner"}

    with patch("app.agent.nodes.ProgressRepo", return_value=mock_repo):
        result = await load_user_context(state)

    assert result["knowledge_profile"]["total_completed"] == 1
    assert "n1" in result["completed_nodes"]
    assert result["effective_difficulty"] == "beginner"
