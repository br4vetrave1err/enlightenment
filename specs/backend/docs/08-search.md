# Phase 8: Search

## Overview

**Purpose:** Keyword search across all course content with relevance scoring and snippets
**Mobile Alignment:** Future mobile search feature (not in current mobile TASKS.md)
**Phase:** 8

---

## Services & Repositories

| Service | File Path | Description |
|---------|-----------|-------------|
| Search Service | `backend/app/services/search_service.py` | MongoDB text search, snippet extraction, relevance scoring, course filter, limit |

## API Endpoints

| Endpoint | Method | Status | Request Shape | Response Shape |
|----------|--------|--------|---------------|----------------|
| `/api/search` | POST | ✅ Implemented | `{ query, course_filter?, limit? }` | `{ results: [{ node_id, title, snippet, relevance_score, course_id }] }` |

---

## Tests

| Test ID | Type | Test Case | File Path | Status | Notes |
|---------|------|-----------|-----------|--------|-------|
| T-105 | Contract | Search: 200 with results array | `backend/tests/contract/test_search.py` | ✅ Passed | — |
| T-106 | Contract | Search: relevance_score included | `backend/tests/contract/test_search.py` | ✅ Passed | — |
| T-107 | Contract | Search: snippets truncated properly | `backend/tests/contract/test_search.py` | ✅ Passed | — |
| T-108 | Contract | Search: course_filter works | `backend/tests/contract/test_search.py` | ✅ Passed | — |
| T-109 | Contract | Search: limit respected | `backend/tests/contract/test_search.py` | ✅ Passed | — |
| T-110 | Integration | Search flow: seed data → search → verify results → filter by course | `backend/tests/integration/test_search.py` | ✅ Passed | — |

---

## Implementation Details

### Key Decisions

- Uses MongoDB text index on courses.nodes.title/content/tags (created in Phase 1)
- Snippet extraction: 150 chars around first match
- Relevance score: MongoDB text score normalized to 0-1
- Default limit: 10, max: 50

### Dependencies

- Depends on Phase 4 (Pipeline) — needs populated courses collection
- Depends on Phase 1 (DB indexes) — needs text index

### Error Handling

- SEARCH_INVALID_QUERY (400) — empty query string

---

## Mobile API Contract Alignment

| Mobile Endpoint | Backend Status | Notes |
|-----------------|----------------|-------|
| `POST /api/search` | ✅ Implemented | Not in current mobile spec — future feature |

---

## Changelog

| Date | Phase | Change | Author |
|------|-------|--------|--------|
| 2026-01-XX | 8 | Search implemented with regex fallback, tests passing | — |
| — | 8 | Initial creation | — |
