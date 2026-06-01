# Phase 7: Chat Agent

## Overview

**Purpose:** AI chat tutor with LangGraph state machine — 7 sequential nodes: classify → load context → retrieve text → retrieve graph → fuse → generate → summarize. SSE streaming response.
**Mobile Alignment:** Supports Mobile Phase 4 (Chat Tab)
**Phase:** 7

---

## Services & Repositories

| Service | File Path | Description |
|---------|-----------|-------------|
| Chat Session Repository | `backend/app/services/chat_repo.py` | create, find_by_user, find_by_id, update, delete, save_message |
| Zen API Client | `backend/app/services/zen_api.py` | Async chat completion, JSON response, streaming, error handling |

## Agent Nodes

| Node | File Path | Model | Purpose |
|------|-----------|-------|---------|
| classify_query | `backend/app/agent/nodes.py` | Qwen3.5 Plus | Classify query type, extract entities, determine complexity |
| load_user_context | `backend/app/agent/nodes.py` | — | Fetch knowledge_profile, resolve effective_difficulty, load conversation_summary |
| retrieve_text | `backend/app/agent/nodes.py` | — | MongoDB $text search on courses collection |
| retrieve_graph | `backend/app/agent/nodes.py` | — | topic_graph lookup, relationship traversal, cross-topic expansion |
| fuse_results | `backend/app/agent/nodes.py` | — | Combine text+graph, deduplicate, filter mastered, rank, top 5 |
| generate_response | `backend/app/agent/nodes.py` | Qwen3.6 Plus | Generate SSE streaming response with difficulty adjustment |
| check_summarize | `backend/app/agent/nodes.py` | Qwen3.5 Plus | Compress conversation at 8 messages or 4000 tokens |

## Graph Workflow

| File Path | Description |
|-----------|-------------|
| `backend/app/graph/workflow.py` | LangGraph sequential graph: START → classify → load_context → retrieve_text → retrieve_graph → fuse → generate → summarize → END |
| `backend/app/agent/state.py` | ChatState TypedDict with all state fields |

## API Endpoints

| Endpoint | Method | Status | Request Shape | Response Shape |
|----------|--------|--------|---------------|----------------|
| `/api/chat/stream` | POST (SSE) | ⬜ | `{ message, course_id?, node_id? }` | SSE events: `token`, `source`, `done` |
| `/api/chat/history` | GET | ⬜ | — | `{ sessions: [{ session_id, course_context, summary, created_at, message_count }] }` |
| `/api/chat/history/{session_id}` | GET | ⬜ | — | `{ session_id, messages: [{ role, content, timestamp, sources }], summary }` |
| `/api/chat/history/{session_id}` | DELETE | ⬜ | — | `{ status: "ok" }` |

## Data Models

| Model | File Path | Description |
|-------|-----------|-------------|
| ChatState | `backend/app/agent/state.py` | TypedDict with all graph state fields |
| ChatMessage | `backend/app/models/__init__.py` | Already defined — needs sources_used, difficulty_level |
| ChatSession | `backend/app/models/__init__.py` | Already defined — needs course_context_id, node_context_id, token_count |

---

## Tests

| Test ID | Type | Test Case | File Path | Status | Notes |
|---------|------|-----------|-----------|--------|-------|
| T-079 | Contract | Chat stream: SSE token events stream | `backend/tests/contract/test_chat_stream.py` | ⬜ | — |
| T-080 | Contract | Chat stream: SSE source events emitted | `backend/tests/contract/test_chat_stream.py` | ⬜ | — |
| T-081 | Contract | Chat stream: SSE done event with session_id | `backend/tests/contract/test_chat_stream.py` | ⬜ | — |
| T-082 | Contract | Chat stream: 401 without auth | `backend/tests/contract/test_chat_stream.py` | ⬜ | — |
| T-083 | Contract | Chat history: 200 with sessions list | `backend/tests/contract/test_chat_history.py` | ⬜ | — |
| T-084 | Contract | Chat session: 200 with full messages | `backend/tests/contract/test_chat_session.py` | ⬜ | — |
| T-085 | Contract | Chat session: 404 if not found | `backend/tests/contract/test_chat_session.py` | ⬜ | — |
| T-086 | Contract | Chat delete: 200 removes session | `backend/tests/contract/test_chat_delete.py` | ⬜ | — |
| T-087 | Unit | classify_query: factual classification | `backend/tests/unit/test_classify_query.py` | ⬜ | — |
| T-088 | Unit | classify_query: conceptual classification | `backend/tests/unit/test_classify_query.py` | ⬜ | — |
| T-089 | Unit | classify_query: cross-topic classification | `backend/tests/unit/test_classify_query.py` | ⬜ | — |
| T-090 | Unit | classify_query: entity extraction | `backend/tests/unit/test_classify_query.py` | ⬜ | — |
| T-091 | Unit | load_user_context: fetches profile | `backend/tests/unit/test_load_user_context.py` | ⬜ | — |
| T-092 | Unit | load_user_context: resolves auto difficulty | `backend/tests/unit/test_load_user_context.py` | ⬜ | — |
| T-093 | Unit | retrieve_text: MongoDB text search | `backend/tests/unit/test_retrieve_text.py` | ⬜ | — |
| T-094 | Unit | retrieve_text: course filter applied | `backend/tests/unit/test_retrieve_text.py` | ⬜ | — |
| T-095 | Unit | retrieve_graph: topic lookup | `backend/tests/unit/test_retrieve_graph.py` | ⬜ | — |
| T-096 | Unit | retrieve_graph: cross-topic traversal | `backend/tests/unit/test_retrieve_graph.py` | ⬜ | — |
| T-097 | Unit | fuse_results: deduplication | `backend/tests/unit/test_fuse_results.py` | ⬜ | — |
| T-098 | Unit | fuse_results: filters mastered topics | `backend/tests/unit/test_fuse_results.py` | ⬜ | — |
| T-099 | Unit | fuse_results: returns top 5 | `backend/tests/unit/test_fuse_results.py` | ⬜ | — |
| T-100 | Unit | check_summarize: triggers at 8 messages | `backend/tests/unit/test_check_summarize.py` | ⬜ | — |
| T-101 | Unit | check_summarize: triggers at 4000 tokens | `backend/tests/unit/test_check_summarize.py` | ⬜ | — |
| T-102 | Integration | Full chat flow: send message → SSE stream → session saved → retrieve history | `backend/tests/integration/test_chat.py` | ⬜ | — |
| T-103 | Integration | Chat with course context: filters retrieval | `backend/tests/integration/test_chat.py` | ⬜ | — |
| T-104 | Integration | Conversation summarization: compresses at threshold | `backend/tests/integration/test_chat.py` | ⬜ | — |

---

## Implementation Details

### Key Decisions

- LangGraph sequential graph (no conditional routing in Phase 1)
- Qwen3.5 Plus for classification (cheap, fast, ~$0.0002/call)
- Qwen3.6 Plus for generation (higher quality, via Zen API)
- SSE streaming via FastAPI StreamingResponse with `text/event-stream`
- Conversation summary stored in MongoDB for context compression
- Mastery filtering: don't re-explain topics user has mastered (>=0.8)
- Top 5 results returned as context to LLM

### Dependencies

- Depends on Phase 3 (Auth) — chat requires authentication
- Depends on Phase 4 (Pipeline) — needs topic_graph for retrieval
- Depends on Phase 5 (Courses) — needs courses for text search
- Depends on Phase 6 (Progress) — needs knowledge_profile for difficulty adjustment

### Error Handling

- CHAT_LLM_FAILED (502) — Zen API error
- CHAT_SESSION_NOT_FOUND (404) — session doesn't exist
- CHAT_INVALID_MESSAGE (400) — empty message

---

## SSE Event Format

```
event: token
data: {"token": "A"}

event: source
data: {"node_id": "javascript-basics", "title": "JavaScript Basics"}

event: done
data: {"session_id": "abc123", "token_count": 3200}
```

---

## Mobile API Contract Alignment

| Mobile Endpoint | Backend Status | Notes |
|-----------------|----------------|-------|
| `POST /api/chat/stream` (SSE) | ⬜ | Mobile uses react-native-sse |
| `GET /api/chat/history` | ⬜ | Matches mobile ChatSession[] interface |
| `GET /api/chat/history/{id}` | ⬜ | Matches mobile ChatMessage[] interface |
| SSE token events | ⬜ | `{ "token": "..." }` format |
| SSE source events | ⬜ | `{ "node_id": "...", "title": "..." }` format |
| SSE done event | ⬜ | `{ "session_id": "...", "token_count": N }` format |

---

## Changelog

| Date | Phase | Change | Author |
|------|-------|--------|--------|
| — | 7 | Initial creation | — |
