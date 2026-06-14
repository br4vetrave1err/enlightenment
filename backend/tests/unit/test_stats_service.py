"""Unit tests for StatsService"""
import pytest
from datetime import datetime, timedelta, timezone

from app.services.stats_service import StatsService


@pytest.fixture
def stats_service():
    return StatsService()


class TestNodesPerWeek:
    def test_no_nodes(self, stats_service):
        assert stats_service.nodes_per_week([]) == 0.0

    def test_recent_nodes(self, stats_service):
        now = datetime.now(timezone.utc)
        nodes = [
            {"completed_at": now - timedelta(days=1)},
            {"completed_at": now - timedelta(days=3)},
            {"completed_at": now - timedelta(days=7)},
        ]
        rate = stats_service.nodes_per_week(nodes)
        assert rate == 0.8

    def test_old_nodes_excluded(self, stats_service):
        old = datetime.now(timezone.utc) - timedelta(weeks=8)
        nodes = [{"completed_at": old}]
        assert stats_service.nodes_per_week(nodes) == 0.0


class TestCurrentStreak:
    def test_no_activity(self, stats_service):
        assert stats_service.current_streak([]) == 0

    def test_single_day(self, stats_service):
        today = datetime.now(timezone.utc)
        assert stats_service.current_streak([today]) == 1

    def test_consecutive_days(self, stats_service):
        now = datetime.now(timezone.utc)
        dates = [now - timedelta(days=i) for i in range(3)]
        assert stats_service.current_streak(dates) == 3

    def test_broken_streak(self, stats_service):
        now = datetime.now(timezone.utc)
        dates = [now, now - timedelta(days=2)]
        assert stats_service.current_streak(dates) == 1


class TestTotalTimeHours:
    def test_zero_time(self, stats_service):
        assert stats_service.total_time_hours({}) == 0.0

    def test_one_hour(self, stats_service):
        assert stats_service.total_time_hours({"node1": 3600}) == 1.0

    def test_multiple_nodes(self, stats_service):
        assert stats_service.total_time_hours({"node1": 1800, "node2": 1800}) == 1.0

    def test_partial_hour(self, stats_service):
        assert stats_service.total_time_hours({"node1": 900}) == 0.2
