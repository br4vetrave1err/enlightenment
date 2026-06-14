"""PARSE step — read JSON roadmaps and extract nodes/edges."""

import json
from dataclasses import dataclass, field
from typing import List, Optional
from pathlib import Path


SKIP_FILES = {"migration-mapping.json", "package.json", "tsconfig.json"}


@dataclass
class ParsedNode:
    node_id: str
    title: str
    content: str = ""
    links: List[str] = field(default_factory=list)
    position: dict = field(default_factory=lambda: {"x": 0, "y": 0})
    tags: List[str] = field(default_factory=list)
    prerequisites: List[str] = field(default_factory=list)
    estimated_minutes: int = 30
    difficulty: str = "beginner"


@dataclass
class ParsedEdge:
    from_node: str
    to_node: str
    edge_type: str = "sequential"


@dataclass
class ParsedCourse:
    course_id: str
    title: str
    description: str = ""
    icon: str = ""
    nodes: List[ParsedNode] = field(default_factory=list)
    edges: List[ParsedEdge] = field(default_factory=list)


def parse_roadmap(repo_path: str) -> List[ParsedCourse]:
    """Parse all JSON roadmap files from the cloned repo."""
    courses = []
    roadmaps_dir = Path(repo_path) / "src" / "data" / "roadmaps"

    if not roadmaps_dir.exists():
        roadmaps_dir = Path(repo_path) / "roadmaps"

    if not roadmaps_dir.exists():
        return []

    for json_file in roadmaps_dir.rglob("*.json"):
        if json_file.name in SKIP_FILES:
            continue

        try:
            with open(json_file, "r") as f:
                data = json.load(f)
            course = _parse_single_roadmap(data, json_file, repo_path)
            if course and course.nodes:
                courses.append(course)
        except (json.JSONDecodeError, KeyError):
            continue

    return courses


def _parse_single_roadmap(data: dict, json_file: Path, repo_path: str) -> Optional[ParsedCourse]:
    """Parse a single roadmap JSON into a ParsedCourse."""
    if not isinstance(data, dict):
        return None

    if "nodes" not in data:
        return None

    roadmap_id = json_file.stem
    course_id = data.get("id", roadmap_id)
    title = data.get("title", roadmap_id.replace("-", " ").title())
    description = data.get("description", "")
    icon = data.get("icon", "")

    nodes = []
    edges = []
    node_ids = set()

    def parse_node_recursive(node_dict: dict, parent_id: Optional[str] = None):
        node_id = node_dict.get("id") or node_dict.get("node_id")
        if not node_id:
            return
        
        # Avoid duplicate nodes
        if node_id in node_ids:
            return
            
        node_ids.add(node_id)
        node_data = node_dict.get("data", {})
        label = ""
        if isinstance(node_data, dict):
            label = node_data.get("label", "").strip()
        if not label:
            label = node_dict.get("title", "").strip()
        if not label:
            label = node_id
            
        pos = node_dict.get("position", {})
        
        parsed = ParsedNode(
            node_id=node_id,
            title=label,
            content=node_data.get("content") or node_dict.get("content", ""),
            links=node_data.get("links") or node_dict.get("links", []),
            position={"x": pos.get("x", 0), "y": pos.get("y", 0)},
            tags=node_data.get("tags") or node_dict.get("tags", []),
            estimated_minutes=node_data.get("estimated_minutes") or node_dict.get("estimated_minutes", 30),
            difficulty=node_data.get("difficulty") or node_dict.get("difficulty", "beginner"),
        )
        parsed.content = parse_markdown_content(repo_path, parsed)
        nodes.append(parsed)
        
        if parent_id:
            edges.append(ParsedEdge(from_node=parent_id, to_node=node_id))
            
        for child in node_dict.get("children", []):
            if isinstance(child, dict):
                parse_node_recursive(child, parent_id=node_id)

    for node in data["nodes"]:
        if isinstance(node, dict):
            parse_node_recursive(node)

    for edge in data.get("edges", []):
        if not isinstance(edge, dict):
            continue

        source = edge.get("source") or edge.get("sourceHandle", "")
        target = edge.get("target", "")

        if source and target and source in node_ids and target in node_ids:
            edges.append(ParsedEdge(from_node=source, to_node=target))

    return ParsedCourse(
        course_id=course_id,
        title=title,
        description=description,
        icon=icon,
        nodes=nodes,
        edges=edges,
    )


def parse_markdown_content(repo_path: str, node: ParsedNode) -> str:
    """Try to find and read markdown content for a node."""
    possible_paths = [
        Path(repo_path) / "src" / "data" / "roadmaps" / f"{node.node_id}.md",
        Path(repo_path) / "roadmaps" / f"{node.node_id}.md",
        Path(repo_path) / f"{node.node_id}.md",
        Path(repo_path) / "content" / f"{node.node_id}.md",
    ]
    for path in possible_paths:
        if path.exists():
            return path.read_text()
    return node.content or f"# {node.title}\n\nContent to be extracted via LLM."
