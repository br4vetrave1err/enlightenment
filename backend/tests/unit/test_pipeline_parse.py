"""Unit tests for PARSE step"""
import pytest
import json
import tempfile
import os

from app.pipeline.parse import parse_roadmap, ParsedCourse


@pytest.fixture
def sample_roadmap_json():
    return {
        "id": "frontend",
        "title": "Frontend Developer",
        "description": "Learn frontend development",
        "icon": "🎨",
        "nodes": [
            {
                "id": "html-basics",
                "title": "HTML Basics",
                "content": "Learn HTML",
                "links": ["https://mdn.io/html"],
                "position": {"x": 100, "y": 200},
                "tags": ["html"],
                "children": [
                    {"id": "css-basics", "title": "CSS Basics"}
                ],
            }
        ],
    }


def test_parse_roadmap_returns_courses(sample_roadmap_json):
    """Should parse JSON into ParsedCourse objects."""
    with tempfile.TemporaryDirectory() as tmpdir:
        roadmaps_dir = os.path.join(tmpdir, "roadmaps")
        os.makedirs(roadmaps_dir)

        with open(os.path.join(roadmaps_dir, "frontend.json"), "w") as f:
            json.dump(sample_roadmap_json, f)

        courses = parse_roadmap(tmpdir)

        assert len(courses) == 1
        assert isinstance(courses[0], ParsedCourse)
        assert courses[0].course_id == "frontend"
        assert courses[0].title == "Frontend Developer"
        assert len(courses[0].nodes) == 2
        assert len(courses[0].edges) == 1
        assert courses[0].edges[0].from_node == "html-basics"
        assert courses[0].edges[0].to_node == "css-basics"


def test_parse_roadmap_empty_dir():
    """Should return empty list for empty directory."""
    with tempfile.TemporaryDirectory() as tmpdir:
        courses = parse_roadmap(tmpdir)
        assert courses == []


def test_parse_roadmap_invalid_json():
    """Should skip invalid JSON files."""
    with tempfile.TemporaryDirectory() as tmpdir:
        roadmaps_dir = os.path.join(tmpdir, "roadmaps")
        os.makedirs(roadmaps_dir)

        with open(os.path.join(roadmaps_dir, "invalid.json"), "w") as f:
            f.write("not valid json")

        courses = parse_roadmap(tmpdir)
        assert courses == []
