# Testing Infrastructure

## Overview

**Purpose:** Set up test framework, write component/store/API tests, configure E2E flows.
**User Stories:** As a developer, I need reliable tests to verify the mobile app works correctly.
**Phase:** 7

---

## Test Framework

| Tool | Purpose | Config File |
|------|---------|-------------|
| Jest | Test runner | `mobile/jest.config.js` |
| React Testing Library | Component testing | — |
| Maestro | E2E testing | `mobile/.maestro/` |

---

## Test Setup

| File | Purpose |
|------|---------|
| `mobile/__tests__/setup.ts` | Global mocks: expo-router, SecureStore, react-native-sse, fetch |

### Mocked Modules

```typescript
// expo-router: router.replace, router.push, useLocalSearchParams
// expo-secure-store: getItemAsync, setItemAsync, deleteItemAsync
// react-native-sse: EventSource (mock SSE events)
// fetch: global fetch mock with configurable responses
```

---

## Component Tests

| Test ID | Component | Test Case | Status | Notes |
|---------|-----------|-----------|--------|-------|
| T-114 | StarField | Renders correct star count | ⬜ | — |
| T-115 | StarField | Respects opacity prop | ⬜ | — |
| T-116 | OrbitProgress | Renders correct progress percentage | ⬜ | — |
| T-117 | OrbitProgress | Renders label and color | ⬜ | — |
| T-118 | PlanetCard | Renders title, subtitle, progress bar | ⬜ | — |
| T-119 | PlanetCard | Status color matches prop | ⬜ | — |
| T-120 | NebulaButton | Renders label and variant styles | ⬜ | — |
| T-121 | NebulaButton | Disabled state grays out | ⬜ | — |
| T-122 | HolographicCard | Renders children | ⬜ | — |
| T-123 | HolographicCard | Glass-morphism style applied | ⬜ | — |
| T-045 | LoginForm | Validation errors display | ⬜ | — |
| T-046 | RegisterForm | Password match check | ⬜ | — |
| T-047 | CourseList | Renders courses list | ⬜ | — |
| T-048 | ChatMessageBubble | User vs assistant styling | ⬜ | — |
| T-049 | ChatInput | Send/empty states | ⬜ | — |

---

## Store Tests

| Test ID | Store | Test Case | Status | Notes |
|---------|-------|-----------|--------|-------|
| T-010 | auth-store | login stores tokens in SecureStore | ⬜ | — |
| T-011 | auth-store | logout clears tokens and resets | ⬜ | — |
| T-012 | auth-store | Initializes from SecureStore | ⬜ | — |
| T-013 | course-store | fetchCourses populates with Course[] | ⬜ | — |
| T-014 | course-store | fetchCourses sets error on failure | ⬜ | — |
| T-015 | chat-store | addMessage appends user message | ⬜ | — |
| T-016 | chat-store | streaming state toggles | ⬜ | — |

---

## API Client Tests

| Test ID | Module | Test Case | Status | Notes |
|---------|--------|-----------|--------|-------|
| T-001 | api.ts | authFetch returns parsed JSON on 200 | ⬜ | — |
| T-002 | api.ts | authFetch retries on 401 | ⬜ | — |
| T-003 | api.ts | authFetch redirects on persistent 401 | ⬜ | — |
| T-004 | api.ts | authFetch throws ApiError on non-2xx | ⬜ | — |
| T-005 | api-client.ts | getCourses returns Course[] | ⬜ | — |
| T-006 | api-client.ts | getCourseGraph returns RoadmapGraph | ⬜ | — |
| T-007 | sse.ts | Sends Authorization header | ⬜ | — |
| T-008 | sse.ts | Parses token events | ⬜ | — |
| T-009 | sse.ts | Closes on done event | ⬜ | — |

---

## E2E Tests (Maestro)

| Test ID | Flow | Steps | Status | Notes |
|---------|------|-------|--------|-------|
| T-124 | login | Open app → tap login → enter credentials → submit | ✅ | `mobile/.maestro/login.yaml` |
| T-125 | register | Open app → tap register → fill form → submit | ✅ | `mobile/.maestro/register.yaml` |
| T-126 | courses | Open app → browse courses → tap course → view detail | ✅ | `mobile/.maestro/courses.yaml` |
| T-127 | chat | Open app → navigate to chat → type message → send | ✅ | `mobile/.maestro/chat.yaml` |
| T-128 | progress | Open app → navigate to progress → view stats/skills/achievements | ✅ | `mobile/.maestro/progress.yaml` |
| T-129 | map | Open app → navigate to map → view roadmap graph | ✅ | `mobile/.maestro/map.yaml` |
| T-130 | user-journey | Complete user journey: login → browse → progress → map → chat | ✅ | `mobile/.maestro/user-journey.yaml` |

---

## Design Notes

### Test Conventions

- Component tests use `render()` from React Testing Library
- Store tests use direct store method calls
- API tests mock `fetch` globally
- E2E tests use Maestro YAML flows
- All tests run in CI via GitHub Actions

### Coverage Targets

- Components: 80%+ line coverage
- Stores: 90%+ line coverage
- API client: 90%+ line coverage
- E2E: 3 critical user journeys

---

## Changelog

| Date | Phase | Change | Author |
|------|-------|--------|--------|
| 2026-06-01 | 7 | Added Maestro E2E test flows (login, register, courses, chat, progress, map, user-journey) | opencode |
