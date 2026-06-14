"""Progress service — node status calculation based on prerequisites."""

from typing import List, Dict


class ProgressService:
    """Calculate node status based on prerequisites and user progress."""

    LOCKED = "locked"
    AVAILABLE = "available"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

    def calculate_node_status(
        self,
        node_id: str,
        prerequisites: List[str],
        completed_nodes: List[str],
        current_node: str,
    ) -> str:
        """Determine node status based on prerequisites and progress."""
        if node_id in completed_nodes:
            return self.COMPLETED

        if node_id == current_node:
            return self.IN_PROGRESS

        if not prerequisites:
            return self.AVAILABLE

        all_prereqs_met = all(p in completed_nodes for p in prerequisites)
        if all_prereqs_met:
            return self.AVAILABLE

        return self.LOCKED

    def calculate_completion_percentage(
        self, completed_nodes: int, total_nodes: int,
    ) -> float:
        if total_nodes == 0:
            return 0.0
        return round((completed_nodes / total_nodes) * 100, 1)
