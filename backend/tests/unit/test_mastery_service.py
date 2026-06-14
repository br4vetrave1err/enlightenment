"""Unit tests for MasteryService"""
import pytest

from app.services.mastery_service import MasteryService


@pytest.fixture
def mastery_service():
    return MasteryService()


class TestCalculateMastery:
    def test_zero_progress(self, mastery_service):
        mastery = mastery_service.calculate_mastery(
            completed_nodes=0, total_nodes=10, time_spent=0, estimated_time=300
        )
        assert mastery == 0.0

    def test_full_progress(self, mastery_service):
        mastery = mastery_service.calculate_mastery(
            completed_nodes=10, total_nodes=10, time_spent=300, estimated_time=300
        )
        assert mastery == 1.0

    def test_half_progress(self, mastery_service):
        mastery = mastery_service.calculate_mastery(
            completed_nodes=5, total_nodes=10, time_spent=150, estimated_time=300
        )
        assert mastery == 0.25

    def test_verification_bonus(self, mastery_service):
        mastery = mastery_service.calculate_mastery(
            completed_nodes=10, total_nodes=10, time_spent=300, estimated_time=300, chat_correct=3
        )
        assert mastery > 1.0

    def test_division_by_zero_protection(self, mastery_service):
        mastery = mastery_service.calculate_mastery(
            completed_nodes=5, total_nodes=0, time_spent=100, estimated_time=0
        )
        assert isinstance(mastery, float)


class TestMasteryToStatus:
    def test_new(self, mastery_service):
        assert mastery_service.mastery_to_status(0.2) == "new"

    def test_learning(self, mastery_service):
        assert mastery_service.mastery_to_status(0.4) == "learning"

    def test_proficient(self, mastery_service):
        assert mastery_service.mastery_to_status(0.6) == "proficient"

    def test_mastered(self, mastery_service):
        assert mastery_service.mastery_to_status(0.9) == "mastered"

    def test_boundary_new(self, mastery_service):
        assert mastery_service.mastery_to_status(0.29) == "new"

    def test_boundary_learning(self, mastery_service):
        assert mastery_service.mastery_to_status(0.49) == "learning"

    def test_boundary_proficient(self, mastery_service):
        assert mastery_service.mastery_to_status(0.79) == "proficient"
