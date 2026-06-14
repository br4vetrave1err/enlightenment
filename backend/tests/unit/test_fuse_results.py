"""Unit tests for fuse_results node"""
import pytest

from app.agent.nodes import fuse_results


@pytest.mark.asyncio
async def test_fuse_results_initializes_fused():
    state = {
        "text_results": [],
        "graph_results": [],
        "completed_nodes": [],
    }
    result = await fuse_results(state)
    assert result["fused_results"] == []


@pytest.mark.asyncio
async def test_fuse_results_combines_and_ranks():
    state = {
        "text_results": [
            {"node_id": "n1", "title": "HTML", "relevance_score": 0.9},
            {"node_id": "n2", "title": "CSS", "relevance_score": 0.7},
        ],
        "graph_results": [
            {"topic": "JavaScript", "strength": 0.8},
        ],
        "completed_nodes": ["n1"],
    }
    result = await fuse_results(state)
    assert len(result["fused_results"]) == 3
    assert result["fused_results"][0]["_score"] == 0.9
    assert result["fused_results"][0]["_source"] == "text_search"
