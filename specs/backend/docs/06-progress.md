# Phase 6: Progress Tracking

## Overview

**Purpose:** Mark nodes as viewed/completed, track time spent, self-rate, calculate mastery levels, detect knowledge gaps, aggregate learning stats
**Mobile Alignment:** Supports Mobile Phase 5 (Progress Tab)
**Phase:** 6

---

## Services & Repositories

| Service | File Path | Description |
|---------|-----------|-------------|
| Progress Repository | `backend/app/services/progress_repo.py` | find_by_user_course, upsert, mark_node_complete, update_rating, update_time |
| KnowledgeProfile Repository | `backend/app/services/knowledge_profile_repo.py` | find_by_user, upsert, update_topics, calculate_gaps |
| Mastery Service | `backend/app/services/mastery_service.py` | Mastery formula: base_score × time_weight × verification_bonus |
| Knowledge Profile Service | `backend/app/services/knowledge_profile_service.py` | Gap detection, course/node recommendations |
| Stats Service | `backend/app/services/stats_service.py` | nodes_per_week, current_streak_days, total_time |

## API Endpoints

| Endpoint | Method | Status | Request Shape | Response Shape |
|----------|--------|--------|---------------|----------------|
| `/api/user/progress` | GET | ⬜ | — | `{ courses: [{ course_id, started_at, last_accessed, completed_nodes, current_node, time_spent_seconds, completion_percentage }] }` |
| `/api/user/progress/{course_id}` | GET | ⬜ | — | Same as above for single course |
| `/api/user/progress/{course_id}/node` | POST | ⬜ | `{ node_id, action, time_spent_seconds, self_rating }` | `{ status, completion_percentage }` |
| `/api/user/progress/{course_id}/node/{node_id}` | PUT | ⬜ | `{ action, time_spent_seconds, self_rating }` | `{ status }` |
| `/api/user/knowledge-profile` | GET | ⬜ | — | `{ topics: [{ name, mastery_level, sources, last_verified, status }], knowledge_gaps: [{ topic, recommended_course, recommended_node }], learning_velocity: { nodes_per_week, current_streak_days } }` |
| `/api/user/learning-stats` | GET | ⬜ | — | `{ total_nodes_completed, courses_in_progress, current_streak_days, nodes_per_week, time_spent_total_hours, knowledge_gaps }` |

## Data Models

| Model | File Path | Description |
|-------|-----------|-------------|
| UserProgress | `backend/app/models/__init__.py` | Already defined — needs expansion |
| KnowledgeProfile | `backend/app/models/__init__.py` | Needs: topics[], knowledge_gaps[], learning_velocity |

---

## Tests

| Test ID | Type | Test Case | File Path | Status | Notes |
|---------|------|-----------|-----------|--------|-------|
| T-062 | Contract | Progress update: 200 marks node complete | `backend/tests/contract/test_progress_update.py` | ⬜ | — |
| T-063 | Contract | Progress update: updates time_spent | `backend/tests/contract/test_progress_update.py` | ⬜ | — |
| T-064 | Contract | Progress update: updates self_rating | `backend/tests/contract/test_progress_update.py` | ⬜ | — |
| T-065 | Contract | Node update: PUT changes rating | `backend/tests/contract/test_progress_node_update.py` | ⬜ | — |
| T-066 | Contract | Progress list: returns all courses | `backend/tests/contract/test_progress_list.py` | ⬜ | — |
| T-067 | Contract | Knowledge profile: returns topics with mastery | `backend/tests/contract/test_knowledge_profile.py` | ⬜ | — |
| T-068 | Contract | Knowledge profile: returns knowledge_gaps | `backend/tests/contract/test_knowledge_profile.py` | ⬜ | — |
| T-069 | Contract | Learning stats: returns all fields | `backend/tests/contract/test_learning_stats.py` | ⬜ | — |
| T-070 | Unit | Mastery: base_score calculation | `backend/tests/unit/test_mastery.py` | ⬜ | — |
| T-071 | Unit | Mastery: time_weight capped at 1.0 | `backend/tests/unit/test_mastery.py` | ⬜ | — |
| T-072 | Unit | Mastery: verification_bonus max 1.3 | `backend/tests/unit/test_mastery.py` | ⬜ | — |
| T-073 | Unit | Mastery: status mapping (new/learning/proficient/mastered) | `backend/tests/unit/test_mastery.py` | ⬜ | — |
| T-074 | Unit | Knowledge gaps: identifies low-mastery topics | `backend/tests/unit/test_knowledge_gaps.py` | ⬜ | — |
| T-075 | Unit | Knowledge gaps: recommends courses from topic_graph | `backend/tests/unit/test_knowledge_gaps.py` | ⬜ | — |
| T-076 | Unit | Stats: nodes_per_week calculation | `backend/tests/unit/test_stats.py` | ⬜ | — |
| T-077 | Unit | Stats: current_streak_days calculation | `backend/tests/unit/test_stats.py` | ⬜ | — |
| T-078 | Integration | Progress flow: complete nodes → check profile → verify mastery → check stats | `backend/tests/integration/test_progress.py` | ⬜ | — |

---

## Implementation Details

### Key Decisions

- Mastery formula per spec: `base_score × time_weight × verification_bonus`
  - base_score = completed_nodes_with_topic / total_nodes_with_topic
  - time_weight = min(1.0, time_spent / estimated_time)
  - verification_bonus = 1.0 + (chat_correct_answers × 0.1), max 1.3
- Status thresholds: <0.3=new, 0.3-0.5=learning, 0.5-0.8=proficient, >=0.8=mastered
- Knowledge gaps: topics with mastery < 0.5, recommend from topic_graph relationships
- Streak calculation: consecutive days with at least one node completed
- Velocity: nodes completed in last 7 days / 7

### Dependencies

- Depends on Phase 3 (Auth) — all endpoints require authentication
- Depends on Phase 5 (Courses) — needs course + node data
- Depends on Phase 4 (Pipeline) — needs topic_graph for knowledge gaps

### Error Handling

- PROGRESS_INVALID_ACTION (400) — action not "view" or "complete"
- PROGRESS_NODE_NOT_FOUND (404) — node doesn't exist in course
- PROGRESS_COURSE_NOT_FOUND (404) — course doesn't exist

---

## Mobile API Contract Alignment

| Mobile Endpoint | Backend Status | Notes |
|-----------------|----------------|-------|
| `POST /api/user/progress/{cid}/node` | ⬜ | Matches mobile request shape |
| `GET /api/user/learning-stats` | ⬜ | Matches mobile LearningStats interface |
| `GET /api/user/knowledge-profile` | ⬜ | Matches mobile KnowledgeProfile interface |
| Mastery levels | ⬜ | Mobile displays as "new\|learning\|proficient\|mastered" |

---

## Changelog

| Date | Phase | Change | Author |
|------|-------|--------|--------|
| — | 6 | Initial creation | — |
