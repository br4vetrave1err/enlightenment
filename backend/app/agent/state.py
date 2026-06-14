"""Chat state schema for LangGraph."""

from typing import TypedDict, Optional, Literal, List, Any


class ChatState(TypedDict, total=False):
    user_id: str
    user_message: str
    course_context: Optional[str]
    node_context: Optional[str]
    query_type: Literal["factual", "conceptual", "cross-topic", "general"]
    complexity: Literal["simple", "moderate", "complex"]
    extracted_entities: List[str]
    knowledge_profile: dict
    completed_nodes: List[str]
    difficulty_preference: str
    effective_difficulty: str
    text_results: List[dict]
    graph_results: List[dict]
    fused_results: List[dict]
    tool_calls: List[dict]
    response: str
    sources_cited: List[dict]
    conversation_summary: Optional[str]
    session_id: str
    message_count: int
    token_count: int
    _db: Any
    _conversation_history: List[dict]
    _stream_chunk: str
