# Backend — Implementation Tasks

All tasks for the FastAPI (Python) backend with MongoDB, LangGraph AI agents, and GitHub content pipeline.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose:** Test framework, project structure, database indexes, shared utilities

### 1.1 Test Framework
- [x] [BE-001] Create test directory structure: `backend/tests/unit/`, `backend/tests/integration/`, `backend/tests/contract/`
- [x] [BE-002] Create `backend/pytest.ini` with async test configuration
- [x] [BE-003] Create `backend/tests/conftest.py` with async test client fixture, mock MongoDB fixture, test user factory
- [x] [BE-004] Add test dependencies to `backend/requirements.txt`: `pytest==8.0.0`, `pytest-asyncio==0.23.0`, `httpx==0.27.0`, `mongomock==4.1.0`

### 1.2 Shared Utilities
- [x] [BE-005] Create `backend/app/core/db_indexes.py` — all MongoDB index definitions per 02-data-model.md
- [x] [BE-006] Create `backend/app/models/errors.py` — ApiError model with code, message, details fields
- [x] [BE-007] Create `backend/app/models/dtos.py` — RegisterRequest, LoginRequest, TokenResponse, NodeProgressRequest, ChatRequest, SearchRequest with validation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose:** Core infrastructure that MUST be complete before ANY user story can begin

### 2.1 Auth Utilities
- [x] [BE-008] Implement `backend/app/core/password.py` — bcrypt hash + verify functions
- [x] [BE-009] Implement `backend/app/core/oauth.py` — Google OAuth: get auth URL, exchange code for tokens, fetch user info

### 2.2 Middleware & Error Handling
- [x] [BE-010] Implement `backend/app/middleware/errors.py` — catch exceptions, return standardized ApiError
- [x] [BE-011] Register error middleware in `backend/app/main.py`

### 2.3 Database Setup
- [x] [BE-012] Create DB indexes on startup in `backend/app/main.py` lifespan (users, courses, user_progress, topic_graph, knowledge_profile, chat_sessions, sync_log)

### 2.4 Tests for Phase 1-2
- [x] [BE-013] Contract test for health endpoint in `backend/tests/contract/test_health.py`
- [x] [BE-014] Unit test for password hashing in `backend/tests/unit/test_password.py`
- [x] [BE-015] Unit test for JWT token creation/verification in `backend/tests/unit/test_jwt.py`
- [x] [BE-016] Unit test for OAuth URL generation in `backend/tests/unit/test_oauth.py`
- [x] [BE-017] Integration test for DB index creation in `backend/tests/integration/test_db_indexes.py`

**⚠️ MANDATORY: Update `docs/01-setup.md` and `docs/02-foundational.md` with implementation details, test results, and changelog before marking phase complete.**

---

## Phase 3: Auth Flow

**Goal:** Users can register with email/password, login, use Google OAuth, and manage tokens

**Mobile Alignment:** Supports Mobile Phase 2 (Auth Flow)

### 3.1 Repositories
- [x] [BE-018] Implement `backend/app/services/user_repo.py` — create, find_by_email, find_by_google_id, update_last_login
- [x] [BE-019] Implement `backend/app/services/token_repo.py` — store refresh token, validate, revoke, cleanup expired

### 3.2 Endpoints
- [x] [BE-020] Implement POST `/api/auth/register` — validate email uniqueness, hash password, create user, return tokens
- [x] [BE-021] Implement POST `/api/auth/login` — verify password, generate tokens, update last_login
- [x] [BE-022] Implement POST `/api/auth/refresh` — validate refresh token, rotate tokens, revoke old
- [x] [BE-023] Implement POST `/api/auth/logout` — revoke refresh token, requires auth
- [x] [BE-024] Implement POST `/api/auth/google` — return Google OAuth URL with state
- [x] [BE-025] Implement POST `/api/auth/google/callback` — exchange code, find/create user, return tokens

### 3.3 Validation
- [x] [BE-026] Add email/password validation in `backend/app/models/dtos.py` — email format, password min 8 chars

### 3.4 Tests
- [x] [BE-027] Contract test for register (201, 409 duplicate, 422 invalid) in `backend/tests/contract/test_auth_register.py`
- [x] [BE-028] Contract test for login (200, 401 wrong password, 401 nonexistent) in `backend/tests/contract/test_auth_login.py`
- [x] [BE-029] Contract test for refresh (200, 401 invalid, 401 expired) in `backend/tests/contract/test_auth_refresh.py`
- [x] [BE-030] Contract test for logout (200, 401 no auth) in `backend/tests/contract/test_auth_logout.py`
- [x] [BE-031] Contract test for Google OAuth (200 auth_url, 200 callback) in `backend/tests/contract/test_auth_google.py`
- [x] [BE-032] Integration test for full auth flow in `backend/tests/integration/test_auth_flow.py`
- [x] [BE-033] Integration test for Google OAuth flow in `backend/tests/integration/test_auth_google_flow.py`

**⚠️ MANDATORY: Update `docs/03-auth.md` with implementation details, test results, and changelog before marking phase complete.**

---

## Phase 4: Content Pipeline

**Goal:** GitHub webhook triggers async pipeline: fetch → parse → LLM extract → build graph → store

**Mobile Alignment:** Supports Mobile Phase 3 (Courses Tab) — provides course data

### 4.1 Pipeline Structure
- [x] [BE-034] Create pipeline module: `backend/app/pipeline/__init__.py`, `fetch.py`, `parse.py`, `extract.py`, `build_graph.py`, `store.py`, `orchestrator.py`, `cron.py`

### 4.2 Pipeline Steps
- [x] [BE-035] Implement FETCH step in `backend/app/pipeline/fetch.py` — SHA comparison, git clone/pull, FetchResult dataclass
- [x] [BE-036] Implement PARSE step in `backend/app/pipeline/parse.py` — read JSON roadmaps, extract nodes/edges, parse markdown content
- [x] [BE-037] Implement LLM EXTRACT step in `backend/app/pipeline/extract.py` — Qwen3.5 Plus via Zen API, JSON response, per-node extraction, rate limiting
- [x] [BE-038] Implement BUILD GRAPH step in `backend/app/pipeline/build_graph.py` — aggregate topics, build relationships, deduplicate, calculate strength
- [x] [BE-039] Implement STORE step in `backend/app/pipeline/store.py` — upsert courses, upsert topic_graph, create sync_log, count nodes
- [x] [BE-040] Implement orchestrator in `backend/app/pipeline/orchestrator.py` — run_pipeline function, retry logic, timeout, error handling, BackgroundTasks

### 4.3 Repositories
- [x] [BE-041] Implement `backend/app/services/course_repo.py` — find_all, find_by_id, find_node_by_id, upsert
- [x] [BE-042] Implement `backend/app/services/topic_graph_repo.py` — find_by_name, find_all, upsert, find_related
- [x] [BE-043] Implement `backend/app/services/sync_log_repo.py` — create, find_latest, find_by_sha

### 4.4 Endpoints
- [x] [BE-044] Connect webhook to pipeline in `backend/app/api/webhook.py` — trigger BackgroundTasks, return sync_id
- [x] [BE-045] Implement GET `/api/sync/status` in `backend/app/api/sync.py` — query latest sync_log
- [x] [BE-046] Implement POST `/api/sync/trigger` in `backend/app/api/sync.py` — manual trigger

### 4.5 Tests
- [x] [BE-050] Contract test for webhook (valid sig, invalid sig, non-master) in `backend/tests/contract/test_webhook.py`
- [x] [BE-051] Contract test for sync status in `backend/tests/contract/test_sync_status.py`
- [x] [BE-052] Contract test for sync trigger in `backend/tests/contract/test_sync_trigger.py`
- [x] [BE-053] Unit test for FETCH step in `backend/tests/unit/test_pipeline_fetch.py`
- [x] [BE-054] Unit test for PARSE step in `backend/tests/unit/test_pipeline_parse.py`
- [x] [BE-055] Unit test for LLM extraction in `backend/tests/unit/test_pipeline_llm.py`
- [x] [BE-056] Unit test for BUILD GRAPH in `backend/tests/unit/test_pipeline_build_graph.py`
- [x] [BE-057] Unit test for STORE in `backend/tests/unit/test_pipeline_store.py`
- [x] [BE-058] Integration test for full pipeline in `backend/tests/integration/test_pipeline.py`

**⚠️ MANDATORY: Update `docs/04-pipeline.md` with implementation details, test results, and changelog before marking phase complete.**

---

## Phase 5: Courses Browsing

**Goal:** List courses with progress overlay, view full roadmap graphs, read individual node content

**Mobile Alignment:** Supports Mobile Phase 3 (Courses Tab)

### 5.1 Services
- [x] [BE-056] Implement node status calculation in `backend/app/services/progress_service.py` — locked/available/in_progress/completed based on prerequisites + user progress

### 5.2 Endpoints
- [x] [BE-057] Implement GET `/api/courses` — query courses, join user_progress, calculate completion_percentage, status filter
- [x] [BE-058] Implement GET `/api/courses/{course_id}` — fetch course, overlay user progress status on nodes, return graph
- [x] [BE-059] Implement GET `/api/courses/{course_id}/nodes/{node_id}` — find node by ID, return content + metadata

### 5.3 Tests
- [x] [BE-059] Contract test for course list (200, status filter, progress fields) in `backend/tests/contract/test_courses_list.py`
- [x] [BE-060] Contract test for course detail (200, status overlay, 404) in `backend/tests/contract/test_course_detail.py`
- [x] [BE-061] Contract test for node content (200, 404) in `backend/tests/contract/test_node_content.py`
- [x] [BE-062] Integration test for course browsing flow in `backend/tests/integration/test_courses.py`
- [x] [BE-063] Unit test for node status calculation in `backend/tests/unit/test_progress_service.py`

**⚠️ MANDATORY: Update `docs/05-courses.md` with implementation details, test results, and changelog before marking phase complete.**

---

## Phase 6: Progress Tracking

**Goal:** Mark nodes as viewed/completed, track time spent, self-rate, calculate mastery levels, detect knowledge gaps, aggregate learning stats

**Mobile Alignment:** Supports Mobile Phase 5 (Progress Tab)

### 6.1 Repositories
- [x] [BE-065] Implement `backend/app/services/progress_repo.py` — find_by_user_course, upsert, mark_node_complete, update_rating, update_time
- [x] [BE-066] Implement `backend/app/services/knowledge_profile_repo.py` — find_by_user, upsert, update_topics, calculate_gaps

### 6.2 Services
- [x] [BE-067] Implement mastery calculation in `backend/app/services/mastery_service.py` — base_score × time_weight × verification_bonus, status mapping
- [x] [BE-068] Implement knowledge gap detection in `backend/app/services/knowledge_profile_service.py` — find low-mastery topics, recommend courses/nodes
- [x] [BE-069] Implement learning stats in `backend/app/services/stats_service.py` — nodes_per_week, current_streak_days, total_time

### 6.3 Endpoints
- [x] [BE-070] Implement POST `/api/user/progress/{course_id}/node` — mark viewed/completed, update time+rating, recalculate mastery
- [x] [BE-071] Implement PUT `/api/user/progress/{course_id}/node/{node_id}` — update node state
- [x] [BE-072] Implement GET `/api/user/progress` — list all course progress for user
- [x] [BE-073] Implement GET `/api/user/knowledge-profile` — calculate + return knowledge profile
- [x] [BE-074] Implement GET `/api/user/learning-stats` — aggregate stats

### 6.4 Tests
- [x] [BE-064] Contract test for progress update in `backend/tests/contract/test_progress_update.py`
- [x] [BE-065] Contract test for progress list in `backend/tests/contract/test_progress_list.py`
- [x] [BE-066] Contract test for knowledge profile in `backend/tests/contract/test_knowledge_profile.py`
- [x] [BE-067] Contract test for learning stats in `backend/tests/contract/test_learning_stats.py`
- [x] [BE-068] Integration test for progress tracking flow in `backend/tests/integration/test_progress.py`
- [x] [BE-069] Unit test for mastery calculation in `backend/tests/unit/test_mastery_service.py`
- [x] [BE-070] Unit test for knowledge gap detection in `backend/tests/unit/test_knowledge_profile_service.py`
- [x] [BE-071] Unit test for learning stats in `backend/tests/unit/test_stats_service.py`
- [x] [BE-072] Integration test for node status calculation in `backend/tests/integration/test_node_status.py`

**⚠️ MANDATORY: Update `docs/06-progress.md` with implementation details, test results, and changelog before marking phase complete.**

---

## Phase 7: Chat Agent

**Goal:** AI chat tutor with LangGraph state machine — 7 sequential nodes, SSE streaming responses

**Mobile Alignment:** Supports Mobile Phase 4 (Chat Tab)

### 7.1 Agent Structure
- [x] [BE-073] Create agent module: `backend/app/agent/__init__.py`, `state.py`, `nodes.py`
- [x] [BE-074] Create graph module: `backend/app/graph/__init__.py`, `workflow.py`

### 7.2 State & Nodes
- [x] [BE-075] Implement ChatState TypedDict in `backend/app/agent/state.py` — all fields per 03-chat-agent.md
- [x] [BE-076] Implement classify_query node in `backend/app/agent/nodes.py` — Qwen3.5 Plus, JSON response, query_type + complexity + entities
- [x] [BE-077] Implement load_user_context node in `backend/app/agent/nodes.py` — fetch profile, resolve difficulty, load summary
- [x] [BE-078] Implement retrieve_text node in `backend/app/agent/nodes.py` — MongoDB $text search, course filter
- [x] [BE-079] Implement retrieve_graph node in `backend/app/agent/nodes.py` — topic_graph lookup, relationship traversal
- [x] [BE-080] Implement fuse_results node in `backend/app/agent/nodes.py` — combine, deduplicate, filter mastered, rank, top 5
- [x] [BE-081] Implement generate_response node in `backend/app/agent/nodes.py` — Qwen3.6 Plus via Zen API, SSE streaming
- [x] [BE-082] Implement check_summarize node in `backend/app/agent/nodes.py` — summarize at threshold, trim messages, save to DB

### 7.3 Workflow & Services
- [x] [BE-083] Implement LangGraph workflow in `backend/app/graph/workflow.py` — sequential graph START → classify → load_context → retrieve_text → retrieve_graph → fuse → generate → summarize → END
- [x] [BE-084] Implement `backend/app/services/chat_repo.py` — create, find_by_user, find_by_id, update, delete, save_message
- [x] [BE-085] Implement `backend/app/services/zen_api.py` — async chat completion, JSON response, streaming support, error handling

### 7.4 Endpoints
- [x] [BE-086] Implement POST `/api/chat/stream` — SSE EventSourceResponse, invoke graph.astream_events, yield token/source/done events
- [x] [BE-087] Implement GET `/api/chat/history` — list user sessions, ordered by created_at desc
- [x] [BE-088] Implement GET `/api/chat/history/{session_id}` — get full session with messages
- [x] [BE-089] Implement DELETE `/api/chat/history/{session_id}` — delete session

### 7.5 Tests
- [x] [BE-090] Contract test for chat stream (SSE token/source/done events) in `backend/tests/contract/test_chat_stream.py`
- [x] [BE-091] Contract test for chat history in `backend/tests/contract/test_chat_history.py`
- [x] [BE-092] Contract test for chat session in `backend/tests/contract/test_chat_session.py`
- [x] [BE-093] Contract test for chat delete in `backend/tests/contract/test_chat_delete.py`
- [x] [BE-094] Unit test for classify_query in `backend/tests/unit/test_classify_query.py`
- [x] [BE-095] Unit test for load_user_context in `backend/tests/unit/test_load_user_context.py`
- [x] [BE-096] Unit test for retrieve_text in `backend/tests/unit/test_retrieve_text.py`
- [x] [BE-097] Unit test for retrieve_graph in `backend/tests/unit/test_retrieve_graph.py`
- [x] [BE-098] Unit test for fuse_results in `backend/tests/unit/test_fuse_results.py`
- [x] [BE-099] Unit test for check_summarize in `backend/tests/unit/test_check_summarize.py`
- [x] [BE-100] Integration test for full chat flow in `backend/tests/integration/test_chat.py`

**⚠️ MANDATORY: Update `docs/07-chat.md` with implementation details, test results, and changelog before marking phase complete.**

---

## Phase 8: Search

**Goal:** Keyword search across all course content with relevance scoring and snippets

**Mobile Alignment:** Future mobile search feature

### 8.1 Services
- [x] [BE-101] Implement search service in `backend/app/services/search_service.py` — MongoDB text search, snippet extraction, relevance scoring, course filter, limit

### 8.2 Endpoints
- [x] [BE-102] Implement POST `/api/search` in `backend/app/api/search.py` — query + course_filter + limit, return ranked results
- [x] [BE-103] Register search router in `backend/app/main.py`

### 8.3 Tests
- [x] [BE-104] Contract test for search in `backend/tests/contract/test_search.py`
- [x] [BE-105] Integration test for search in `backend/tests/integration/test_search.py`

**⚠️ MANDATORY: Update `docs/08-search.md` with implementation details, test results, and changelog before marking phase complete.**

---

## Phase 9: Polish & Cross-Cutting

**Purpose:** Rate limiting, logging, CORS, cron sync, Docker deployment, full test suite validation

### 9.1 Middleware
- [x] [BE-106] Implement rate limiting middleware in `backend/app/middleware/rate_limit.py`
- [x] [BE-107] Implement request logging middleware in `backend/app/middleware/logging.py`
- [x] [BE-108] Configure CORS in `backend/app/main.py` — allow mobile app origin

### 9.2 Infrastructure
- [x] [BE-109] Implement fallback cron sync in `backend/app/pipeline/cron.py` — check for new commits every 6 hours
- [x] [BE-110] Create `backend/.env.example` with all environment variables documented
- [x] [BE-111] Create `backend/Dockerfile` for containerized deployment
- [x] [BE-112] Create `docker-compose.yml` with FastAPI + MongoDB services

### 9.3 Documentation
- [x] [BE-113] Add OpenAPI annotations to all route files (response models, error responses, descriptions)

### 9.4 Validation Tests
- [x] [BE-114] Integration test for auth-protected routes in `backend/tests/integration/test_auth_protection.py`
- [x] [BE-115] Integration test for error handling in `backend/tests/integration/test_error_handling.py`
- [x] [BE-116] Integration test for rate limiting in `backend/tests/integration/test_rate_limit.py`
- [x] [BE-117] Integration test for CORS in `backend/tests/integration/test_cors.py`
- [x] [BE-118] Contract test for OpenAPI spec completeness in `backend/tests/contract/test_openapi.py`
- [x] [BE-119] Run full test suite and verify all tests pass

**⚠️ MANDATORY: Update `docs/09-polish.md` with implementation details, test results, and changelog before marking phase complete.**

---

## Execution Order

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8 → Phase 9
```

Each phase MUST update its corresponding documentation file in `docs/0N-*.md` before marking complete.
