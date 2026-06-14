"""Learning stats service."""

from datetime import datetime, timedelta, timezone
from typing import Dict, List


class StatsService:
    """Calculate learning statistics."""

    def nodes_per_week(self, completed_nodes: List[dict], weeks: int = 4) -> float:
        if not completed_nodes:
            return 0.0
        cutoff = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(weeks=weeks)
        recent = []
        for n in completed_nodes:
            completed_at = n.get("completed_at", datetime.min)
            if completed_at.tzinfo is not None:
                completed_at = completed_at.astimezone(timezone.utc).replace(tzinfo=None)
            if completed_at > cutoff:
                recent.append(n)
        return round(len(recent) / weeks, 1)

    def current_streak(self, activity_dates: List[datetime]) -> int:
        if not activity_dates:
            return 0
        sorted_dates = sorted(set(d.date() for d in activity_dates), reverse=True)
        streak = 0
        expected = datetime.now(timezone.utc).date()
        for d in sorted_dates:
            if d == expected:
                streak += 1
                expected -= timedelta(days=1)
            elif d < expected:
                break
        return streak

    def total_time_hours(self, time_per_node: Dict[str, int]) -> float:
        total_seconds = sum(time_per_node.values())
        return round(total_seconds / 3600, 1)
