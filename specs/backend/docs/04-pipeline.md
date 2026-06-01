# Phase 4: Content Pipeline

## Overview

**Purpose:** GitHub webhook triggers async pipeline: fetch roadmap.sh content → parse JSON → LLM entity extraction → build knowledge graph → store in MongoDB
**Mobile Alignment:** Supports Mobile Phase 3 (Courses Tab) — provides course data
**Phase:** 4

---

## Services & Repositories

| Service | File Path | Description |
|---------|-----------|-------------|
| Course Repository | `backend/app/services/course_repo.py` | find_all, find_by_id, find_node_by_id, upsert |
| TopicGraph Repository | `backend/app/services/topic_graph_repo.py` | find_by_name, find_all, upsert, find_related |
| SyncLog Repository | `backend/app/services/sync_log_repo.py` | create, find_latest, find_by_sha |

## API Endpoints

| Endpoint | Method | Status | Request Shape | Response Shape |
|----------|--------|--------|---------------|----------------|
| `/api/webhook/github` | POST | ⬜ (partial) | GitHub push event payload | `{ status, sync_id }` |
| `/api/sync/status` | GET | ⬜ | — | `{ last_sync, status, courses_updated, nodes_added, nodes_updated, github_sha }` |
| `/api/sync/trigger` | POST | ⬜ | — | `{ status, sync_id }` |

## Pipeline Steps

| Step | File Path | Input | Output |
|------|-----------|-------|--------|
| FETCH | `backend/app/pipeline/fetch.py` | GitHub payload | FetchResult(sha, repo_path, status) |
| PARSE | `backend/app/pipeline/parse.py` | repo_path | List[ParsedCourse] |
| LLM EXTRACT | `backend/app/pipeline/extract.py` | ParsedCourse | ParsedCourse with extracted_concepts |
| BUILD GRAPH | `backend/app/pipeline/build_graph.py` | ParsedCourse | List[TopicGraphDoc] |
| STORE | `backend/app/pipeline/store.py` | courses + graph_docs | SyncResult |
| ORCHESTRATOR | `backend/app/pipeline/orchestrator.py` | trigger + payload | Pipeline execution |

## Data Models

| Model | File Path | Description |
|-------|-----------|-------------|
| Course | `backend/app/models/__init__.py` | Already defined — nodes, edges, sync metadata |
| TopicGraphDoc | `backend/app/models/__init__.py` | Already defined — topics, relationships |
| SyncLog | `backend/app/models/__init__.py` | Already defined — pipeline audit trail |

---

## Tests

| Test ID | Type | Test Case | File Path | Status | Notes |
|---------|------|-----------|-----------|--------|-------|
| T-029 | Contract | Webhook: valid signature → 200 | `backend/tests/contract/test_webhook.py` | ⬜ | — |
| T-030 | Contract | Webhook: invalid signature → 401 | `backend/tests/contract/test_webhook.py` | ⬜ | — |
| T-031 | Contract | Webhook: non-master branch → 200 ignored | `backend/tests/contract/test_webhook.py` | ⬜ | — |
| T-032 | Contract | Sync status: returns latest sync info | `backend/tests/contract/test_sync_status.py` | ⬜ | — |
| T-033 | Contract | Sync trigger: returns sync_id | `backend/tests/contract/test_sync_trigger.py` | ⬜ | — |
| T-034 | Unit | FETCH: SHA comparison detects no changes | `backend/tests/unit/test_pipeline_fetch.py` | ⬜ | — |
| T-035 | Unit | FETCH: git clone on first run | `backend/tests/unit/test_pipeline_fetch.py` | ⬜ | — |
| T-036 | Unit | FETCH: git pull on existing repo | `backend/tests/unit/test_pipeline_fetch.py` | ⬜ | — |
| T-037 | Unit | PARSE: JSON roadmap → nodes + edges | `backend/tests/unit/test_pipeline_parse.py` | ⬜ | — |
| T-038 | Unit | PARSE: markdown content by node ID | `backend/tests/unit/test_pipeline_parse.py` | ⬜ | — |
| T-039 | Unit | LLM EXTRACT: prompt formatting | `backend/tests/unit/test_pipeline_llm.py` | ⬜ | — |
| T-040 | Unit | LLM EXTRACT: JSON parsing + error handling | `backend/tests/unit/test_pipeline_llm.py` | ⬜ | — |
| T-041 | Unit | LLM EXTRACT: rate limiting (0.1s delay) | `backend/tests/unit/test_pipeline_llm.py` | ⬜ | — |
| T-042 | Unit | BUILD GRAPH: deduplicate relationships | `backend/tests/unit/test_pipeline_build_graph.py` | ⬜ | — |
| T-043 | Unit | BUILD GRAPH: cross-course topic aggregation | `backend/tests/unit/test_pipeline_build_graph.py` | ⬜ | — |
| T-044 | Unit | STORE: upsert courses | `backend/tests/unit/test_pipeline_store.py` | ⬜ | — |
| T-045 | Unit | STORE: upsert topic_graph | `backend/tests/unit/test_pipeline_store.py` | ⬜ | — |
| T-046 | Unit | STORE: create sync_log entry | `backend/tests/unit/test_pipeline_store.py` | ⬜ | — |
| T-047 | Integration | Full pipeline: mock GitHub → parse → mock LLM → store → verify DB | `backend/tests/integration/test_pipeline.py` | ⬜ | — |
| T-048 | Integration | Idempotent sync: same SHA = no changes | `backend/tests/integration/test_pipeline.py` | ⬜ | — |
| T-049 | Integration | Pipeline retry: failed step retries 3x | `backend/tests/integration/test_pipeline.py` | ⬜ | — |

---

## Implementation Details

### Key Decisions

- Pipeline runs as FastAPI BackgroundTask (non-blocking)
- Idempotent: same SHA = no-op (skip all steps)
- Partial sync OK: LLM extraction failure for a node doesn't block entire sync
- Retry: 3 attempts with exponential backoff per step
- Timeout: 10-minute pipeline timeout
- LLM: Qwen3.5 Plus via Zen API (~$0.15 per full sync of ~500 nodes)
- Fallback: cron every 6 hours for missed webhooks

### Dependencies

- Depends on Phase 2 (error handling, Zen API client)
- Required by Phase 5 (Courses) — courses need content
- Required by Phase 7 (Chat) — chat needs knowledge graph

### Error Handling

- PIPELINE_FETCH_FAILED — git clone/pull error
- PIPELINE_PARSE_FAILED — invalid JSON or markdown
- PIPELINE_LLM_FAILED — LLM extraction error (partial OK)
- PIPELINE_STORE_FAILED — MongoDB write error
- PIPELINE_TIMEOUT — 10-minute timeout exceeded

---

## Mobile API Contract Alignment

| Mobile Endpoint | Backend Status | Notes |
|-----------------|----------------|-------|
| Course data source | ⬜ | Pipeline populates courses collection |
| Knowledge graph | ⬜ | Pipeline builds topic_graph for chat retrieval |

---

## Changelog

| Date | Phase | Change | Author |
|------|-------|--------|--------|
| — | 4 | Initial creation | — |
