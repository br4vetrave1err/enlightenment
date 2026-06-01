from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class NodePosition(BaseModel):
    x: float
    y: float


class NodeStatus(str, Enum):
    LOCKED = "locked"
    AVAILABLE = "available"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class EdgeType(str, Enum):
    SEQUENTIAL = "sequential"
    PREREQUISITE = "prerequisite"
    RELATED = "related"


class RoadmapNode(BaseModel):
    node_id: str
    title: str
    position: Optional[NodePosition] = None
    tags: list[str] = []
    links: list[str] = []
    content: str = ""
    extracted_concepts: list[str] = []
    prerequisites: list[str] = []
    related_topics: list[str] = []
    implements: list[str] = []
    difficulty: str = "intermediate"
    summary: str = ""
    estimated_minutes: int = 15


class RoadmapEdge(BaseModel):
    from_node: str = Field(alias="from")
    to_node: str = Field(alias="to")
    type: EdgeType = EdgeType.SEQUENTIAL


class Course(BaseModel):
    course_id: str
    title: str
    description: str = ""
    icon: str = "📚"
    nodes: list[RoadmapNode] = []
    edges: list[RoadmapEdge] = []
    last_synced: Optional[datetime] = None
    github_sha: Optional[str] = None


class TopicRelationship(BaseModel):
    to: str
    type: str
    strength: float


class TopicGraphDoc(BaseModel):
    _id: str
    name: str
    description: str = ""
    courses_seen_in: list[str] = []
    node_ids: list[str] = []
    relationships: list[TopicRelationship] = []
    last_updated: Optional[datetime] = None


class UserProgress(BaseModel):
    user_id: str
    course_id: str
    nodes_completed: list[str] = []
    nodes_in_progress: dict[str, dict] = {}  # node_id -> {started_at, time_spent}
    last_accessed: datetime = Field(default_factory=datetime.utcnow)


class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    sources: list[dict] = []


class ChatSession(BaseModel):
    session_id: str
    user_id: str
    messages: list[ChatMessage] = []
    course_context: Optional[str] = None
    summary: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SyncLog(BaseModel):
    triggered_by: str
    github_sha: Optional[str] = None
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    status: str = "running"
    error: Optional[str] = None
    courses_updated: list[str] = []
    nodes_added: int = 0
    nodes_updated: int = 0
