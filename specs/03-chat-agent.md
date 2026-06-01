# Chat Agent Specification — LangGraph State Machine

**Framework:** LangGraph (Python)  
**LLM:** Zen API via Go subscription (Qwen3.6 Plus for generation, Qwen3.5 Plus for classification)  
**Retrieval:** MongoDB Text Search + Knowledge Graph (Phase 1)  
**Output:** SSE streaming tokens

---

## State Schema

```python
from typing import TypedDict, Optional, Literal, List, Any
from datetime import datetime

class ChatState(TypedDict):
    # Input
    user_id: str
    user_message: str
    course_context: Optional[str]        # current course ID from mobile app
    node_context: Optional[str]          # current node ID from mobile app

    # Classification
    query_type: Literal["factual", "conceptual", "cross-topic", "general"]
    complexity: Literal["simple", "moderate", "complex"]
    extracted_entities: List[str]        # topics mentioned in query

    # User profile (injected, not in messages)
    knowledge_profile: dict              # { topic_name: mastery_level }
    completed_nodes: List[str]
    difficulty_preference: str           # auto | beginner | intermediate | advanced
    effective_difficulty: str            # resolved difficulty for this response

    # Retrieval results
    text_results: List[dict]             # from MongoDB text search
    graph_results: List[dict]            # from knowledge graph traversal
    fused_results: List[dict]            # combined + ranked
    tool_calls: List[dict]               # any tool calls made

    # Response
    response: str
    sources_cited: List[dict]            # [{ node_id, title }]

    # Memory
    conversation_summary: Optional[str]  # compressed history
    session_id: str
    message_count: int
    token_count: int
```

---

## Graph Nodes

### Node 1: `classify_query`

**Purpose:** Determine query type and extract key entities.  
**Model:** Qwen3.5 Plus (cheap, fast)  
**Cost:** ~$0.0002 per call

**Prompt:**
```
Classify this user query about developer learning content.

Query: {user_message}
Current course context: {course_context}
Current node context: {node_context}

Return JSON:
{
  "query_type": "factual | conceptual | cross-topic | general",
  "complexity": "simple | moderate | complex",
  "entities": ["topic1", "topic2"]
}

Definitions:
- factual: Direct question about a specific concept ("What is middleware?")
- conceptual: Asks for explanation, comparison, or understanding ("How does caching work?")
- cross-topic: Connects multiple topics ("How is REST different from GraphQL?")
- general: Open-ended or meta question ("What should I learn next?")
```

**Output:** Sets `query_type`, `complexity`, `extracted_entities`

---

### Node 2: `load_user_context`

**Purpose:** Fetch user profile and determine effective difficulty.  
**Data source:** MongoDB `knowledge_profile` + `user_progress` collections

**Logic:**
```python
def load_user_context(state: ChatState) -> ChatState:
    # Fetch profile
    profile = db.knowledge_profile.find_one({"user_id": state["user_id"]})
    completed = db.user_progress.find_one({"user_id": state["user_id"]})

    state["knowledge_profile"] = {t["name"]: t["mastery_level"] for t in profile["topics"]}
    state["completed_nodes"] = completed["completed_nodes"]

    # Resolve effective difficulty
    pref = profile.get("difficulty_preference", "auto")
    if pref == "auto":
        # Check mastery of entities mentioned in query
        entity_masteries = [
            state["knowledge_profile"].get(e, 0.0)
            for e in state["extracted_entities"]
        ]
        avg_mastery = sum(entity_masteries) / max(len(entity_masteries), 1)
        if avg_mastery < 0.3:
            state["effective_difficulty"] = "beginner"
        elif avg_mastery < 0.7:
            state["effective_difficulty"] = "intermediate"
        else:
            state["effective_difficulty"] = "advanced"
    else:
        state["effective_difficulty"] = pref

    # Load conversation summary
    session = db.chat_sessions.find_one({"_id": state["session_id"]})
    if session and session.get("summary"):
        state["conversation_summary"] = session["summary"]

    return state
```

---

### Node 3: `retrieve_text`

**Purpose:** MongoDB full-text search.  
**Data source:** `courses` collection text index

```python
def retrieve_text(state: ChatState) -> ChatState:
    query = state["user_message"]
    course_filter = state["course_context"]

    search_filter = {"$text": {"$search": query}}
    if course_filter:
        search_filter["course_id"] = course_filter

    results = list(db.courses.aggregate([
        {"$match": search_filter},
        {"$project": {
            "course_id": 1,
            "nodes": {
                "$filter": {
                    "input": "$nodes",
                    "as": "node",
                    "cond": {"$gt": ["$$node.text_score", 0]}
                }
            }
        }}
    ]))

    state["text_results"] = flatten_nodes(results)
    return state
```

---

### Node 4: `retrieve_graph`

**Purpose:** Knowledge graph traversal for relationships and cross-topic context.  
**Data source:** `topic_graph` collection (loaded into memory at startup)

```python
def retrieve_graph(state: ChatState) -> ChatState:
    entities = state["extracted_entities"]
    graph_results = []

    for entity in entities:
        # Find topic in graph
        topic = db.topic_graph.find_one({"_id": entity})
        if topic:
            graph_results.append({
                "topic": entity,
                "description": topic["description"],
                "relationships": topic["relationships"][:5],  # top 5
                "courses_seen_in": topic["courses_seen_in"],
                "related_nodes": topic["node_ids"][:3]
            })

            # Follow relationships for cross-topic queries
            if state["query_type"] == "cross-topic":
                for rel in topic["relationships"]:
                    related = db.topic_graph.find_one({"_id": rel["to"]})
                    if related:
                        graph_results.append({
                            "topic": rel["to"],
                            "relationship_type": rel["type"],
                            "strength": rel["strength"],
                            "description": related["description"]
                        })

    state["graph_results"] = graph_results
    return state
```

---

### Node 5: `fuse_results`

**Purpose:** Combine text + graph results, deduplicate, rank.

```python
def fuse_results(state: ChatState) -> ChatState:
    # Simple fusion: text results first, then graph context
    # Phase 1: no complex rank fusion needed

    seen_nodes = set()
    fused = []

    # Add text-matched nodes
    for result in state["text_results"]:
        if result["node_id"] not in seen_nodes:
            seen_nodes.add(result["node_id"])
            fused.append({
                "type": "text_match",
                "node_id": result["node_id"],
                "title": result["title"],
                "content": result["content"][:500],  # truncate for context
                "course_id": result["course_id"]
            })

    # Add graph context nodes not already in text results
    for result in state["graph_results"]:
        for node_id in result.get("related_nodes", []):
            if node_id not in seen_nodes:
                seen_nodes.add(node_id)
                node = find_node_by_id(node_id)
                if node:
                    fused.append({
                        "type": "graph_related",
                        "node_id": node_id,
                        "title": node["title"],
                        "content": node["content"][:300],
                        "course_id": node["course_id"]
                    })

    # Filter out nodes user has already mastered (don't re-explain)
    mastered_topics = [
        t for t, m in state["knowledge_profile"].items() if m >= 0.8
    ]
    fused = [
        f for f in fused
        if not any(tag in mastered_topics for tag in f.get("tags", []))
    ]

    state["fused_results"] = fused[:5]  # top 5
    return state
```

---

### Node 6: `generate_response`

**Purpose:** Generate streaming response with grounded context.  
**Model:** Qwen3.6 Plus via Zen API  
**Output:** SSE token stream

**System Prompt:**
```
You are a helpful learning assistant for a developer learning platform.

USER CONTEXT:
- Difficulty level: {effective_difficulty}
- Completed topics: {completed_nodes}
- Current course: {course_context}
- Current node: {node_context}

RESPONSE RULES:
1. Ground your answer in the provided course content
2. Adjust complexity to the user's difficulty level
3. Don't re-explain concepts the user has already mastered
4. Cite specific nodes when referencing content
5. If the answer spans multiple topics, explain the connections
6. Keep responses concise — aim for clarity over completeness
7. If unsure, say so and suggest what the user should explore next

DIFFICULTY ADJUSTMENT:
- Beginner: Use analogies, step-by-step explanations, avoid jargon
- Intermediate: Use technical terms, include code examples
- Advanced: Deep dives, edge cases, best practices, trade-offs
```

**Streaming:**
```python
async for event in graph.astream_events(state, version="v2"):
    if event["event"] == "on_chat_model_stream":
        token = event["data"]["chunk"].content
        yield f"data: {json.dumps({'token': token})}\n\n"
```

---

### Node 7: `check_summarize`

**Purpose:** Compress conversation history when context grows too large.

```python
def check_summarize(state: ChatState) -> ChatState:
    if state["message_count"] >= 8 or state["token_count"] >= 4000:
        # Summarize conversation
        summary_prompt = f"""
        Summarize this conversation in 3 bullet points.
        Preserve: key questions asked, topics covered, user's confusion points, resolved answers.

        Conversation:
        {state["messages"]}
        """
        summary = call_llm(summary_prompt, model="qwen3.5-plus")
        state["conversation_summary"] = summary

        # Trim messages, keep last 2 raw
        state["messages"] = state["messages"][-2:]

    # Save to MongoDB
    db.chat_sessions.update_one(
        {"_id": state["session_id"]},
        {"$set": {
            "summary": state.get("conversation_summary"),
            "messages": state["messages"],
            "token_count": state["token_count"],
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )

    return state
```

---

## Graph Edges

```
START → classify_query → load_user_context → retrieve_text → retrieve_graph → fuse_results → generate_response → check_summarize → END
```

All edges are sequential. No conditional routing in Phase 1.

---

## Tools (Phase 1 — Not Used)

Tools are defined but not actively called by the agent in Phase 1. All context is pre-retrieved.

```python
# Defined for Phase 2 expansion:
# - get_node_content(node_id)
# - get_user_progress(course_id)
# - search_knowledge(query, course_filter)
# - get_prerequisites(node_id)
# - get_related_topics(topic_name)
```

---

## SSE Event Format

```
event: token
data: {"token": "A"}

event: token
data: {"token": " closure"}

event: source
data: {"node_id": "javascript-basics", "title": "JavaScript Basics"}

event: done
data: {"session_id": "abc123", "token_count": 3200}
```
