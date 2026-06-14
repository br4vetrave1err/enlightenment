"""BUILD GRAPH step — aggregate topics, build relationships, deduplicate."""

from dataclasses import dataclass, field
from typing import List, Dict, Optional
from collections import defaultdict

from app.pipeline.parse import ParsedCourse
from app.pipeline.extract import ExtractionResult


@dataclass
class TopicNode:
    name: str
    description: str = ""
    courses_seen_in: List[str] = field(default_factory=list)
    node_ids: List[str] = field(default_factory=list)
    relationships: List[dict] = field(default_factory=list)


def build_topic_graph(
    courses: List[ParsedCourse],
    extractions: Dict[str, ExtractionResult],
) -> List[TopicNode]:
    """Build knowledge graph from parsed courses and LLM extractions."""
    topic_map: Dict[str, TopicNode] = {}

    for course in courses:
        for node in course.nodes:
            extraction = extractions.get(node.node_id)
            concepts = extraction.concepts if extraction else []

            for concept in concepts:
                if concept.name not in topic_map:
                    topic_map[concept.name] = TopicNode(
                        name=concept.name,
                        description=concept.description,
                    )

                topic = topic_map[concept.name]
                if course.course_id not in topic.courses_seen_in:
                    topic.courses_seen_in.append(course.course_id)
                if node.node_id not in topic.node_ids:
                    topic.node_ids.append(node.node_id)

    relationships = _build_relationships(topic_map)
    for topic in topic_map.values():
        topic.relationships = relationships.get(topic.name, [])

    return list(topic_map.values())


def _build_relationships(
    topic_map: Dict[str, TopicNode],
    min_cooccurrence: int = 2,
) -> Dict[str, List[dict]]:
    """Build relationships based on co-occurrence in courses."""
    cooccurrence: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))

    for topic in topic_map.values():
        for course_id in topic.courses_seen_in:
            for other_topic in topic_map.values():
                if other_topic.name != topic.name and course_id in other_topic.courses_seen_in:
                    cooccurrence[topic.name][other_topic.name] += 1

    relationships: Dict[str, List[dict]] = defaultdict(list)
    for topic_name, related in cooccurrence.items():
        for other_name, count in related.items():
            if count >= min_cooccurrence:
                strength = min(1.0, count / 5.0)
                relationships[topic_name].append({
                    "to": other_name,
                    "type": "related",
                    "strength": round(strength, 2),
                })

    return relationships
