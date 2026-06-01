# Mobile App — Implementation Tasks

All tasks for the React Native (Expo) mobile application with space exploration theme.

---

## Phase 1: Infrastructure & Foundation

### 1.1 API Client Layer
- [ ] [FE-001] Create `mobile/src/lib/api.ts` — authFetch wrapper with token refresh, 401 redirect
- [ ] [FE-002] Create `mobile/src/lib/api-client.ts` — typed API functions
- [ ] [FE-003] Create `mobile/src/lib/sse.ts` — SSE client wrapper using react-native-sse

### 1.2 State Management
- [ ] [FE-004] Create `mobile/src/lib/store/auth-store.ts` — Zustand auth store
- [ ] [FE-005] Create `mobile/src/lib/store/course-store.ts` — Zustand course store
- [ ] [FE-006] Create `mobile/src/lib/store/chat-store.ts` — Zustand chat store

### 1.3 Navigation & App Shell
- [ ] [FE-007] Create `mobile/src/app/_layout.tsx` — Root layout with Stack + auth guard
- [ ] [FE-008] Create `mobile/src/app/(auth)/_layout.tsx` — Auth stack layout
- [ ] [FE-009] Create `mobile/src/app/(tabs)/_layout.tsx` — Tab navigator with space theme
- [ ] [FE-010] Create `mobile/src/app/(tabs)/index.tsx` — Redirect to courses tab

---

## Phase 2: Auth Flow

### 2.1 Login Screen
- [ ] [FE-011] Create `mobile/src/app/(auth)/login.tsx` — Email/password login + Google OAuth
- [ ] [FE-012] Create `mobile/src/features/auth/components/LoginForm.tsx` — Reusable login form with Zod
- [ ] [FE-013] Create `mobile/src/features/auth/components/GoogleAuthButton.tsx` — Google OAuth button

### 2.2 Register Screen
- [ ] [FE-014] Create `mobile/src/app/(auth)/register.tsx` — Registration form
- [ ] [FE-015] Create `mobile/src/features/auth/components/RegisterForm.tsx` — Reusable register form

---

## Phase 3: Courses Tab

### 3.1 Course List Screen
- [ ] [FE-016] Create `mobile/src/app/(tabs)/courses/index.tsx` — Course list with StarField
- [ ] [FE-017] Create `mobile/src/features/courses/components/CourseList.tsx` — Scrollable PlanetCard list
- [ ] [FE-018] Create `mobile/src/features/courses/components/CourseListHeader.tsx` — "Your Galaxy" header

### 3.2 Course Detail (Constellation Map)
- [ ] [FE-019] Create `mobile/src/app/(tabs)/courses/[courseId].tsx` — Course detail with constellation
- [ ] [FE-020] Create `mobile/src/features/courses/components/ConstellationGraph.tsx` — Force-directed graph
- [ ] [FE-021] Create `mobile/src/features/courses/components/GraphNode.tsx` — Individual node star
- [ ] [FE-022] Create `mobile/src/features/courses/components/GraphEdge.tsx` — Edge line between nodes
- [ ] [FE-023] Create `mobile/src/features/courses/components/NodeDetailCard.tsx` — Expanded node info

### 3.3 Node Detail Screen
- [ ] [FE-024] Create `mobile/src/app/(tabs)/courses/[courseId]/[nodeId].tsx` — Node content screen
- [ ] [FE-025] Create `mobile/src/features/courses/components/NodeContent.tsx` — Markdown renderer
- [ ] [FE-026] Create `mobile/src/features/courses/components/NodeProgressActions.tsx` — Complete/rate actions

---

## Phase 4: Chat Tab

### 4.1 Chat Screen
- [ ] [FE-027] Create `mobile/src/app/(tabs)/chat/index.tsx` — Main chat with SSE streaming
- [ ] [FE-028] Create `mobile/src/features/chat/components/ChatMessageList.tsx` — Scrollable message list
- [ ] [FE-029] Create `mobile/src/features/chat/components/ChatMessageBubble.tsx` — Message bubble
- [ ] [FE-030] Create `mobile/src/features/chat/components/ChatInput.tsx` — Message input bar
- [ ] [FE-031] Create `mobile/src/features/chat/components/StreamingIndicator.tsx` — Typing animation

### 4.2 Chat History
- [ ] [FE-032] Create `mobile/src/app/(tabs)/chat/history.tsx` — Chat history list
- [ ] [FE-033] Create `mobile/src/features/chat/components/ChatSessionItem.tsx` — History list item

---

## Phase 5: Progress Tab (Integration)

### 5.1 Progress Screen
- [ ] [FE-034] Create `mobile/src/app/(tabs)/progress/index.tsx` — Progress dashboard
- [ ] [FE-035] Integrate OrbitTracker with real API data

---

## Phase 6: Map Tab (Standalone Constellation)

### 6.1 Map Screen
- [ ] [FE-036] Create `mobile/src/app/(tabs)/map/index.tsx` — Cross-course constellation map
- [ ] [FE-037] Create `mobile/src/features/map/components/GalaxyMap.tsx` — Full galaxy view

---

## Phase 7: Testing Infrastructure

### 7.1 Unit Test Setup
- [ ] [FE-038] Configure Jest + React Testing Library in mobile
- [ ] [FE-039] Create `mobile/__tests__/setup.ts` — Test setup with mocks

### 7.2 Component Tests
- [ ] [FE-040] Test `StarField`
- [ ] [FE-041] Test `OrbitProgress`
- [ ] [FE-042] Test `PlanetCard`
- [ ] [FE-043] Test `NebulaButton`
- [ ] [FE-044] Test `HolographicCard`
- [ ] [FE-045] Test `LoginForm`
- [ ] [FE-046] Test `RegisterForm`
- [ ] [FE-047] Test `CourseList`
- [ ] [FE-048] Test `ChatMessageBubble`
- [ ] [FE-049] Test `ChatInput`

### 7.3 Store Tests
- [ ] [FE-050] Test `auth-store`
- [ ] [FE-051] Test `course-store`
- [ ] [FE-052] Test `chat-store`

### 7.4 API Client Tests
- [ ] [FE-053] Test `api.ts` — authFetch
- [ ] [FE-054] Test `api-client.ts` — typed functions
- [ ] [FE-055] Test `sse.ts` — event parsing

### 7.5 E2E Test Setup (Maestro)
- [ ] [FE-056] Configure Maestro in mobile/.maestro/
- [ ] [FE-057] Create `mobile/.maestro/auth-flow.yaml`
- [ ] [FE-058] Create `mobile/.maestro/course-navigation.yaml`
- [ ] [FE-059] Create `mobile/.maestro/chat-flow.yaml`

---

## Execution Order

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
```

Each phase MUST update its corresponding documentation file in `docs/0N-*.md` before marking complete.
