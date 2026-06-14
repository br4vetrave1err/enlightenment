---
description: "Task list for Course Roadmap Rendering Template (v2)"
---

# Tasks: Course Roadmap Rendering Template (v2)

**Input**: Design documents from `/specs/002-roadmap-template/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/course-schema.json

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Vite React TypeScript project in repository root
- [x] T002 Install Tailwind CSS and configure `tailwind.config.js` and `postcss.config.js`
- [x] T003 [P] Create base directory structure (`src/components`, `src/types`, `src/data`, `src/hooks`)
- [x] T004 [P] Configure global CSS imports in `src/index.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create TypeScript interfaces from `contracts/course-schema.json` in `src/types/index.ts`
- [x] T006 Setup dummy roadmap content JSON in `src/data/course-roadmap.json`
- [x] T007 Setup dummy user progress JSON in `src/data/user-progress.json`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Roadmap UI Core (Priority: P1) 🎯 MVP

**Goal**: Render the phases and topics as a visual node graph using Tailwind CSS.

**Independent Test**: Ensure the static roadmap UI renders all phases and topics based on the JSON without any state.

### Implementation for User Story 1

- [x] T008 [P] [US1] Create `RoadmapNode` component in `src/components/RoadmapNode.tsx`
- [x] T009 [P] [US1] Create `PhaseSection` component in `src/components/PhaseSection.tsx`
- [x] T010 [US1] Create `RoadmapViewer` in `src/components/RoadmapViewer.tsx` to iterate over phases and render nodes
- [x] T011 [US1] Update `src/App.tsx` to mount `RoadmapViewer` with data from `course-roadmap.json`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Roadmap State Management (Priority: P1)

**Goal**: Merge user progress state to visually differentiate completed, pending, and in-progress topics.

**Independent Test**: Changing the `status` of a topic in `user-progress.json` dynamically updates the node's visual styling (e.g., green for completed).

### Implementation for User Story 2

- [x] T012 [P] [US2] Create `useRoadmapProgress` hook in `src/hooks/useRoadmapProgress.ts` to merge content with progress state
- [x] T013 [US2] Update `RoadmapViewer.tsx` to pass the merged status down to `PhaseSection` and `RoadmapNode`
- [x] T014 [US2] Add conditional Tailwind classes in `RoadmapNode.tsx` for `completed`, `in_progress`, and `pending` states

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Topic Details Panel (Priority: P2)

**Goal**: Click a topic to see descriptions and external learning resources.

**Independent Test**: Clicking any node opens a panel showing its `resources` array.

### Implementation for User Story 3

- [x] T015 [P] [US3] Create `TopicDetailsPanel` component in `src/components/TopicDetailsPanel.tsx`
- [x] T016 [P] [US3] Create `ResourceLink` component in `src/components/ResourceLink.tsx`
- [x] T017 [US3] Update `RoadmapViewer.tsx` to manage active topic selection state
- [x] T018 [US3] Integrate `TopicDetailsPanel` into `RoadmapViewer.tsx`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - Graph Dependencies (Priority: P2)

**Goal**: Draw visual edges connecting prerequisite topics based on the `topic_graph` definitions.

**Independent Test**: Edges visually connect dependent nodes correctly on the screen.

### Implementation for User Story 4

- [x] T019 [P] [US4] Create `RoadmapEdge` SVG component in `src/components/RoadmapEdge.tsx`
- [x] T020 [US4] Implement edge positioning logic in `RoadmapViewer.tsx` based on `topic_graph` array
- [x] T021 [US4] Add CSS animations for the edges in `src/index.css`

---

## Phase 7: User Story 5 - Variant Filtering (Priority: P3)

**Goal**: Let users select a path variant that skips specific phases or topics.

**Independent Test**: Selecting a variant instantly hides skipped phases/topics from the UI.

### Implementation for User Story 5

- [x] T022 [P] [US5] Create `VariantSelector` component in `src/components/VariantSelector.tsx`
- [x] T023 [US5] Implement variant filtering logic inside `useRoadmapProgress.ts`
- [x] T024 [US5] Update `RoadmapViewer.tsx` to render the `VariantSelector` and pass selected variant state

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T025 [P] Polish responsive design for mobile screens in `src/index.css` and components
- [x] T026 Check accessibility (ARIA labels, keyboard navigation) across components

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Models/Components within a story marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

---

## Phase 9: Backend API Integration & Global Knowledge Graph (Bugfix BUG-001)

**Goal**: Update the backend to extract and serve a dynamically constructed roadmap from the global universe of topics.

- [x] T027 Update `backend/scripts/initial_sync.py` to populate global skills/frameworks and edges.
- [x] T028 Update `backend/app/services/course_repo.py` to support dynamic global subgraph extraction.
- [x] T029 Update `backend/app/api/courses.py` to construct phases, variants, and skip lists dynamically based on user preferences.
- [x] T030 Refactor `web/src/pages/courses/CourseDetail.tsx` to stop mocking "General Foundations" and accurately render the backend's DAG.

**Bugfix**: 2026-06-14 — [BUG-001] Updated from bugfix patch.
