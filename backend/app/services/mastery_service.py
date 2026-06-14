"""Mastery calculation service."""

from typing import List, Dict


class MasteryService:
    """Calculate topic mastery levels."""

    def calculate_mastery(
        self,
        completed_nodes: int,
        total_nodes: int,
        time_spent: float,
        estimated_time: float,
        chat_correct: int = 0,
    ) -> float:
        base_score = completed_nodes / max(total_nodes, 1)
        time_weight = min(1.0, time_spent / max(estimated_time, 1))
        verification_bonus = min(1.3, 1.0 + (chat_correct * 0.1))
        return round(base_score * time_weight * verification_bonus, 3)

    def mastery_to_status(self, mastery: float) -> str:
        if mastery < 0.3:
            return "new"
        elif mastery < 0.5:
            return "learning"
        elif mastery < 0.8:
            return "proficient"
        return "mastered"
