"""Unit tests for BUILD GRAPH step"""
import pytest

from app.pipeline.parse import ParsedCourse, ParsedNode
from app.pipeline.extract import ExtractionResult, ExtractedConcept
from app.pipeline.build_graph import build_topic_graph, TopicNode


@pytest.fixture
def sample_courses():
    return [
        ParsedCourse(
            course_id="frontend",
            title="Frontend",
            nodes=[
                ParsedNode(node_id="html", title="HTML", tags=["markup"]),
                ParsedNode(node_id="css", title="CSS", tags=["styling"]),
            ],
        )
    ]


@pytest.fixture
def sample_extractions():
    return {
        "html": ExtractionResult(
            node_id="html",
            concepts=[ExtractedConcept(name="html", description="Markup language")],
        ),
        "css": ExtractionResult(
            node_id="css",
            concepts=[ExtractedConcept(name="css", description="Styling language")],
        ),
    }


def test_build_topic_graph_creates_topics(sample_courses, sample_extractions):
    """Should create topic nodes from extractions."""
    topics = build_topic_graph(sample_courses, sample_extractions)
    assert len(topics) == 2
    topic_names = [t.name for t in topics]
    assert "html" in topic_names
    assert "css" in topic_names


def test_build_topic_graph_tracks_courses(sample_courses, sample_extractions):
    """Should track which courses contain each topic."""
    topics = build_topic_graph(sample_courses, sample_extractions)
    html_topic = next(t for t in topics if t.name == "html")
    assert "frontend" in html_topic.courses_seen_in


def test_build_topic_graph_empty_courses():
    """Should return empty list for no courses."""
    topics = build_topic_graph([], {})
    assert topics == []


def test_build_topic_graph_no_extractions(sample_courses):
    """Should handle missing extractions gracefully."""
    topics = build_topic_graph(sample_courses, {})
    assert topics == []
