"""Knowledge gap detection service."""

from typing import List, Dict


class KnowledgeProfileService:
    """Detect knowledge gaps and recommend learning paths."""

    def find_gaps(self, topics: List[dict], threshold: float = 0.3) -> List[dict]:
        gaps = []
        for topic in topics:
            mastery = topic.get("mastery_level", 0.0)
            if mastery < threshold:
                gaps.append({
                    "topic": topic["name"],
                    "mastery_level": mastery,
                    "recommended_course": topic.get("sources", ["general"])[0],
                })
        return gaps

    def recommend_nodes(self, gaps: List[dict], course_nodes: dict) -> List[dict]:
        recommendations = []
        for gap in gaps:
            topic = gap["topic"]
            if topic in course_nodes:
                recommendations.append({
                    "topic": topic,
                    "node_id": course_nodes[topic],
                    "course": gap["recommended_course"],
                })
        return recommendations
