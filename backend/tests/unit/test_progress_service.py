"""Unit tests for ProgressService node status calculation"""
import pytest

from app.services.progress_service import ProgressService


@pytest.fixture
def progress_service():
    return ProgressService()


class TestNodeStatus:
    def test_completed_node(self, progress_service):
        status = progress_service.calculate_node_status(
            node_id="html",
            prerequisites=[],
            completed_nodes=["html"],
            current_node=None,
        )
        assert status == "completed"

    def test_in_progress_node(self, progress_service):
        status = progress_service.calculate_node_status(
            node_id="css",
            prerequisites=["html"],
            completed_nodes=["html"],
            current_node="css",
        )
        assert status == "in_progress"

    def test_available_no_prereqs(self, progress_service):
        status = progress_service.calculate_node_status(
            node_id="html",
            prerequisites=[],
            completed_nodes=[],
            current_node=None,
        )
        assert status == "available"

    def test_available_prereqs_met(self, progress_service):
        status = progress_service.calculate_node_status(
            node_id="css",
            prerequisites=["html"],
            completed_nodes=["html"],
            current_node=None,
        )
        assert status == "available"

    def test_locked_prereqs_not_met(self, progress_service):
        status = progress_service.calculate_node_status(
            node_id="css",
            prerequisites=["html"],
            completed_nodes=[],
            current_node=None,
        )
        assert status == "locked"

    def test_locked_partial_prereqs(self, progress_service):
        status = progress_service.calculate_node_status(
            node_id="js",
            prerequisites=["html", "css"],
            completed_nodes=["html"],
            current_node=None,
        )
        assert status == "locked"


class TestCompletionPercentage:
    def test_zero_total(self, progress_service):
        assert progress_service.calculate_completion_percentage(0, 0) == 0.0

    def test_half_complete(self, progress_service):
        assert progress_service.calculate_completion_percentage(5, 10) == 50.0

    def test_full_complete(self, progress_service):
        assert progress_service.calculate_completion_percentage(10, 10) == 100.0

    def test_partial_complete(self, progress_service):
        assert progress_service.calculate_completion_percentage(3, 10) == 30.0
