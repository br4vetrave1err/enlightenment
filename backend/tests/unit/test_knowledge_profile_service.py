"""Unit tests for KnowledgeProfileService"""
import pytest

from app.services.knowledge_profile_service import KnowledgeProfileService


@pytest.fixture
def knowledge_service():
    return KnowledgeProfileService()


class TestFindGaps:
    def test_no_gaps(self, knowledge_service):
        topics = [
            {"name": "html", "mastery_level": 0.8, "sources": ["frontend"]},
            {"name": "css", "mastery_level": 0.6, "sources": ["frontend"]},
        ]
        gaps = knowledge_service.find_gaps(topics)
        assert len(gaps) == 0

    def test_finds_gaps_below_threshold(self, knowledge_service):
        topics = [
            {"name": "html", "mastery_level": 0.8, "sources": ["frontend"]},
            {"name": "css", "mastery_level": 0.1, "sources": ["frontend"]},
            {"name": "js", "mastery_level": 0.2, "sources": ["frontend"]},
        ]
        gaps = knowledge_service.find_gaps(topics)
        assert len(gaps) == 2
        assert gaps[0]["topic"] == "css"
        assert gaps[1]["topic"] == "js"

    def test_custom_threshold(self, knowledge_service):
        topics = [
            {"name": "html", "mastery_level": 0.4, "sources": ["frontend"]},
            {"name": "css", "mastery_level": 0.6, "sources": ["frontend"]},
        ]
        gaps = knowledge_service.find_gaps(topics, threshold=0.5)
        assert len(gaps) == 1
        assert gaps[0]["topic"] == "html"

    def test_empty_topics(self, knowledge_service):
        gaps = knowledge_service.find_gaps([])
        assert gaps == []

    def test_gap_structure(self, knowledge_service):
        topics = [{"name": "python", "mastery_level": 0.1, "sources": ["backend"]}]
        gaps = knowledge_service.find_gaps(topics)
        assert "topic" in gaps[0]
        assert "mastery_level" in gaps[0]
        assert "recommended_course" in gaps[0]


class TestRecommendNodes:
    def test_recommends_nodes(self, knowledge_service):
        gaps = [{"topic": "html", "recommended_course": "frontend"}]
        course_nodes = {"html": "html-basics"}
        recs = knowledge_service.recommend_nodes(gaps, course_nodes)
        assert len(recs) == 1
        assert recs[0]["node_id"] == "html-basics"

    def test_no_match(self, knowledge_service):
        gaps = [{"topic": "unknown", "recommended_course": "frontend"}]
        course_nodes = {"html": "html-basics"}
        recs = knowledge_service.recommend_nodes(gaps, course_nodes)
        assert len(recs) == 0
