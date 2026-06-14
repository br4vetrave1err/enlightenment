# Phase 5: Courses Browsing

## Overview

**Purpose:** List courses with progress overlay, view full roadmap graphs, read individual node content
**Mobile Alignment:** Supports Mobile Phase 3 (Courses Tab)
**Phase:** 5

---

## Services & Repositories

| Service | File Path | Description |
|---------|-----------|-------------|
| Course Repository | `backend/app/services/course_repo.py` | find_all, find_by_id, find_node_by_id |
| Progress Service | `backend/app/services/progress_service.py` | Node status calculation (locked/available/in_progress/completed) |

## API Endpoints

| Endpoint | Method | Status | Request Shape | Response Shape |
|----------|--------|--------|---------------|----------------|
| `/api/courses` | GET | ✅ Implemented | Query: `status` (all\|in_progress\|completed) | `{ courses: [{ course_id, title, description, icon, total_nodes, completed_nodes, completion_percentage, last_accessed }] }` |
| `/api/courses/{course_id}` | GET | ✅ Implemented | — | `{ course_id, title, nodes: [{ node_id, title, position, status, estimated_minutes }], edges: [{ from, to, type }] }` |
| `/api/courses/{course_id}/nodes/{node_id}` | GET | ✅ Implemented | — | `{ node_id, title, content, links, prerequisites, estimated_minutes }` |

## Data Models

| Model | File Path | Description |
|-------|-----------|-------------|
| Course | `backend/app/models/__init__.py` | Already defined |
| RoadmapNode | `backend/app/models/__init__.py` | Already defined |
| RoadmapEdge | `backend/app/models/__init__.py` | Already defined |
| NodeStatus | `backend/app/models/__init__.py` | Already defined (enum) |

---

## Tests

| Test ID | Type | Test Case | File Path | Status | Notes |
|---------|------|-----------|-----------|--------|-------|
| T-050 | Contract | List courses: 200 with courses array | `backend/tests/contract/test_courses_list.py` | ✅ Passed | — |
| T-051 | Contract | List courses: status filter works | `backend/tests/contract/test_courses_list.py` | ✅ Passed | — |
| T-052 | Contract | List courses: includes progress fields | `backend/tests/contract/test_courses_list.py` | ✅ Passed | — |
| T-053 | Contract | Course detail: 200 with nodes + edges | `backend/tests/contract/test_course_detail.py` | ✅ Passed | — |
| T-054 | Contract | Course detail: node status overlay | `backend/tests/contract/test_course_detail.py` | ✅ Passed | — |
| T-055 | Contract | Course detail: 404 if not found | `backend/tests/contract/test_course_detail.py` | ✅ Passed | — |
| T-056 | Contract | Node content: 200 with content + metadata | `backend/tests/contract/test_node_content.py` | ✅ Passed | — |
| T-057 | Contract | Node content: 404 if node not found | `backend/tests/contract/test_node_content.py` | ✅ Passed | — |
| T-058 | Integration | Course browsing flow: list → detail → node content | `backend/tests/integration/test_courses.py` | ✅ Passed | — |
| T-059 | Unit | Node status: locked when prerequisites incomplete | `backend/tests/unit/test_progress_service.py` | ✅ Passed | — |
| T-060 | Unit | Node status: available when prerequisites met | `backend/tests/unit/test_progress_service.py` | ✅ Passed | — |
| T-061 | Unit | Node status: completed when user marked done | `backend/tests/unit/test_progress_service.py` | ✅ Passed | — |

---

## Implementation Details

### Key Decisions

- Node status calculated server-side based on user progress + prerequisites
- Course list joins with user_progress for completion_percentage
- Text index on courses.nodes.title/content/tags for Phase 7 (Chat) retrieval
- Position data from roadmap.sh JSON used as-is (mobile does force-directed layout client-side)

### Dependencies

- Depends on Phase 3 (Auth) — all endpoints require authentication
- Depends on Phase 4 (Pipeline) — courses must be populated
- Required by Phase 6 (Progress) — progress overlays need course data

### Error Handling

- COURSE_NOT_FOUND (404) — course_id doesn't exist
- NODE_NOT_FOUND (404) — node_id doesn't exist in course

---

## Mobile API Contract Alignment

| Mobile Endpoint | Backend Status | Notes |
|-----------------|----------------|-------|
| `GET /api/courses` | ✅ Implemented | Matches mobile Course[] interface |
| `GET /api/courses/{id}` | ✅ Implemented | Matches mobile RoadmapGraph interface |
| `GET /api/courses/{cid}/nodes/{nid}` | ✅ Implemented | Matches mobile NodeContent interface |
| Node status overlay | ✅ Implemented | Mobile expects "locked\|available\|in_progress\|completed" |

---

## Changelog

| Date | Phase | Change | Author |
|------|-------|--------|--------|
| 2026-01-XX | 5 | Courses endpoints implemented, tests passing | — |
| — | 5 | Initial creation | — |
