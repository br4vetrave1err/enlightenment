# Infrastructure & Foundation

## Overview

**Purpose:** Set up API client layer, state management stores, and navigation shell for the mobile app.
**User Stories:** As a user, I need the app to connect to the backend, manage my authentication state, and navigate between screens.
**Phase:** 1

---

## Components

### API Layer

| Component | File Path | Description |
|-----------|-----------|-------------|
| authFetch | `mobile/src/lib/api.ts` | Wrapper around fetch with token refresh, 401 handling, error parsing |
| API Client | `mobile/src/lib/api-client.ts` | Typed functions: getCourses, getCourseGraph, getNodeContent, submitProgress, getLearningStats, getKnowledgeProfile, chatStream, getChatHistory |
| SSE Client | `mobile/src/lib/sse.ts` | Server-Sent Events wrapper using react-native-sse for chat streaming |

### State Stores

| Store | File Path | Data Managed |
|-------|-----------|--------------|
| auth-store | `mobile/src/lib/store/auth-store.ts` | Tokens, user info, isAuthenticated, login/logout actions |
| course-store | `mobile/src/lib/store/course-store.ts` | Courses list, loading state, error state |
| chat-store | `mobile/src/lib/store/chat-store.ts` | Messages array, streaming state, active session ID |

### Navigation

| Route | File Path | Description |
|-------|-----------|-------------|
| Root Layout | `mobile/src/app/_layout.tsx` | Stack navigator with auth guard — redirects to login or tabs |
| Auth Layout | `mobile/src/app/(auth)/_layout.tsx` | Stack for login/register, no tab bar |
| Tabs Layout | `mobile/src/app/(tabs)/_layout.tsx` | Tab navigator: Courses, Map, Chat, Progress with space-themed icons |
| Tabs Index | `mobile/src/app/(tabs)/index.tsx` | Redirects to (tabs)/courses |

---

## API Integration

| Endpoint | Method | Used By | Request Shape | Response Shape |
|----------|--------|---------|---------------|----------------|
| `/api/auth/refresh` | POST | `api.ts` | `{ refresh_token: string }` | `{ access_token, refresh_token }` |
| `/api/courses` | GET | `api-client.ts` | — | `{ courses: Course[] }` |
| `/api/courses/{id}` | GET | `api-client.ts` | — | `RoadmapGraph` |
| `/api/courses/{cid}/nodes/{nid}` | GET | `api-client.ts` | — | `NodeContent` |
| `/api/user/progress/{cid}/node` | POST | `api-client.ts` | `{ node_id, action, time_spent_seconds }` | — |
| `/api/user/learning-stats` | GET | `api-client.ts` | — | `LearningStats` |
| `/api/user/knowledge-profile` | GET | `api-client.ts` | — | `KnowledgeProfile` |
| `/api/chat/stream` | POST (SSE) | `sse.ts` | Query params: message, course_id?, node_id? | SSE events: token, source, done |
| `/api/chat/history` | GET | `api-client.ts` | — | `{ sessions: ChatSession[] }` |

---

## State Management

### Data Flow

```
App Start → auth-store reads SecureStore → sets isAuthenticated
    ↓
_layout.tsx checks isAuthenticated → routes to (auth) or (tabs)
    ↓
(tabs)/courses → course-store.fetchCourses() → GET /api/courses → stores Course[]
    ↓
Chat → chat-store manages messages → sse.ts streams tokens → updates store
```

---

## Tests

| Test ID | Component | Test Case | Status | Notes |
|---------|-----------|-----------|--------|-------|
| T-001 | authFetch | Returns parsed JSON on 200 | ⬜ | — |
| T-002 | authFetch | Retries once on 401 after token refresh | ⬜ | — |
| T-003 | authFetch | Redirects to login on persistent 401 | ⬜ | — |
| T-004 | authFetch | Throws ApiError on non-2xx | ⬜ | — |
| T-005 | api-client | getCourses returns Course[] | ⬜ | — |
| T-006 | api-client | getCourseGraph returns RoadmapGraph | ⬜ | — |
| T-007 | sse.ts | Sends Authorization header | ⬜ | — |
| T-008 | sse.ts | Parses token events, accumulates response | ⬜ | — |
| T-009 | sse.ts | Closes on done event, returns session_id | ⬜ | — |
| T-010 | auth-store | login stores tokens in SecureStore | ⬜ | — |
| T-011 | auth-store | logout clears tokens and resets state | ⬜ | — |
| T-012 | auth-store | Initializes from SecureStore on start | ⬜ | — |
| T-013 | course-store | fetchCourses populates with Course[] | ⬜ | — |
| T-014 | course-store | fetchCourses sets error on failure | ⬜ | — |
| T-015 | chat-store | addMessage appends user message | ⬜ | — |
| T-016 | chat-store | streaming state toggles during SSE | ⬜ | — |
| T-017 | _layout.tsx | Redirects to login when not authenticated | ⬜ | — |
| T-018 | _layout.tsx | Redirects to courses when authenticated | ⬜ | — |

---

## Design Notes

### Space Theme Usage

- Tab bar uses `spaceColors.cosmos` background with `spaceColors.starlight` icons
- All screens inherit `StarField` background from root layout
- Loading states use `OrbitProgress` component

### Accessibility

- Auth guard prevents unauthenticated access to protected routes
- Token refresh is transparent to the user
- Error states include retry buttons with clear messaging

---

## Changelog

| Date | Phase | Change | Author |
|------|-------|--------|--------|
| — | 1 | Initial creation | — |
