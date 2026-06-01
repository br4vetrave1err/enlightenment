# Courses Tab

## Overview

**Purpose:** Browse courses as planets, explore roadmap as constellation graph, read node content.
**User Stories:** As a learner, I want to see available courses, explore the roadmap visually, and read learning content.
**Phase:** 3

---

## Components

### Course List

| Component | File Path | Props | Description |
|-----------|-----------|-------|-------------|
| Course List Screen | `mobile/src/app/(tabs)/courses/index.tsx` | — | List screen with StarField background, loading/error states |
| CourseList | `mobile/src/features/courses/components/CourseList.tsx` | courses, onPress | FlatList of PlanetCards |
| CourseListHeader | `mobile/src/features/courses/components/CourseListHeader.tsx` | totalCourses, completedCount | "Your Galaxy" header with stats |

### Constellation Map

| Component | File Path | Props | Description |
|-----------|-----------|-------|-------------|
| Course Detail | `mobile/src/app/(tabs)/courses/[courseId].tsx` | — | Fetches RoadmapGraph, renders ConstellationGraph |
| ConstellationGraph | `mobile/src/features/courses/components/ConstellationGraph.tsx` | nodes, edges, onNodePress | Force-directed layout using d3-force |
| GraphNode | `mobile/src/features/courses/components/GraphNode.tsx` | node, size, color, onPress | Star-shaped node with status color |
| GraphEdge | `mobile/src/features/courses/components/GraphEdge.tsx` | from, to, type | Line between nodes with opacity by type |
| NodeDetailCard | `mobile/src/features/courses/components/NodeDetailCard.tsx` | node, onStartLearning | HolographicCard with node info |

### Node Detail

| Component | File Path | Props | Description |
|-----------|-----------|-------|-------------|
| Node Detail Screen | `mobile/src/app/(tabs)/courses/[courseId]/[nodeId].tsx` | — | Fetches NodeContent, auto-submits view progress |
| NodeContent | `mobile/src/features/courses/components/NodeContent.tsx` | content, links | Markdown renderer with space theme |
| NodeProgressActions | `mobile/src/features/courses/components/NodeProgressActions.tsx` | courseId, nodeId, onComplete | Mark complete + 1-5 star rating |

---

## API Integration

| Endpoint | Method | Used By | Request Shape | Response Shape |
|----------|--------|---------|---------------|----------------|
| `/api/courses` | GET | CourseList | — | `{ courses: Course[] }` |
| `/api/courses/{id}` | GET | Course Detail | — | `RoadmapGraph` |
| `/api/courses/{cid}/nodes/{nid}` | GET | Node Detail | — | `NodeContent` |
| `/api/user/progress/{cid}/node` | POST | NodeProgressActions | `{ node_id, action, time_spent_seconds, self_rating? }` | — |

---

## State Management

| Store | File Path | Data Managed |
|-------|-----------|--------------|
| course-store | `mobile/src/lib/store/course-store.ts` | Courses list, loading, error |

### Data Flow

```
(tabs)/courses → course-store.fetchCourses() → renders PlanetCard[]
    → tap course → [courseId] → GET /api/courses/{id} → ConstellationGraph
    → tap node → [courseId]/[nodeId] → GET /api/courses/{cid}/nodes/{nid}
    → auto POST /api/user/progress/{cid}/node (action: view)
    → "Mark Complete" → POST /api/user/progress/{cid}/node (action: complete)
```

---

## Tests

| Test ID | Component | Test Case | Status | Notes |
|---------|-----------|-----------|--------|-------|
| T-036 | courses/index.tsx | Renders StarField background | ⬜ | — |
| T-037 | courses/index.tsx | Shows OrbitProgress loading state | ⬜ | — |
| T-038 | courses/index.tsx | Renders PlanetCard for each course | ⬜ | — |
| T-039 | courses/index.tsx | Shows error state with retry | ⬜ | — |
| T-040 | courses/index.tsx | Empty state shows "No courses available" | ⬜ | — |
| T-041 | CourseList | Renders FlatList with Course[] | ⬜ | — |
| T-042 | CourseList | PlanetCard shows title, icon, progress, status | ⬜ | — |
| T-043 | CourseList | Tap navigates to course detail | ⬜ | — |
| T-044 | CourseListHeader | Displays total courses and completion count | ⬜ | — |
| T-045 | [courseId].tsx | Fetches RoadmapGraph on mount | ⬜ | — |
| T-046 | [courseId].tsx | Renders ConstellationGraph | ⬜ | — |
| T-047 | [courseId].tsx | Handles missing course with error | ⬜ | — |
| T-048 | ConstellationGraph | Generates layout from nodes + edges | ⬜ | — |
| T-049 | ConstellationGraph | Nodes render with status colors | ⬜ | — |
| T-050 | ConstellationGraph | Edges render between nodes | ⬜ | — |
| T-051 | ConstellationGraph | Tap node expands detail card | ⬜ | — |
| T-052 | ConstellationGraph | Completed nodes show green glow | ⬜ | — |
| T-053 | ConstellationGraph | Locked nodes show dim grey | ⬜ | — |
| T-054 | ConstellationGraph | Current node shows breathing animation | ⬜ | — |
| T-055 | GraphNode | Circle size proportional to estimated_minutes | ⬜ | — |
| T-056 | GraphNode | Correct color by status | ⬜ | — |
| T-057 | GraphNode | Triggers onPress on tap | ⬜ | — |
| T-058 | GraphEdge | Renders line from source to target | ⬜ | — |
| T-059 | GraphEdge | Opacity by edge type | ⬜ | — |
| T-060 | NodeDetailCard | Shows title, estimated_minutes, status | ⬜ | — |
| T-061 | NodeDetailCard | "Start Learning" navigates to node detail | ⬜ | — |
| T-062 | [nodeId].tsx | Fetches NodeContent on mount | ⬜ | — |
| T-063 | [nodeId].tsx | Auto-submits "view" progress | ⬜ | — |
| T-064 | [nodeId].tsx | Renders markdown content | ⬜ | — |
| T-065 | [nodeId].tsx | "Mark Complete" submits progress | ⬜ | — |
| T-066 | NodeContent | Headings use starlight color | ⬜ | — |
| T-067 | NodeContent | Code blocks use monospace | ⬜ | — |
| T-068 | NodeContent | Links render as styled buttons | ⬜ | — |
| T-069 | NodeProgressActions | Renders "Mark Complete" button | ⬜ | — |
| T-070 | NodeProgressActions | Renders 1-5 star rating | ⬜ | — |
| T-071 | NodeProgressActions | Submits POST on action | ⬜ | — |
| T-072 | NodeProgressActions | Shows success feedback | ⬜ | — |

---

## Design Notes

### Space Theme Usage

- Course list: `StarField` background, `PlanetCard` for each course
- Constellation: nodes as glowing stars, edges as subtle lines, dark background
- Node status colors: completed=aurora(green), current=nebulaBlue, locked=locked(dim), available=available
- Node detail: `HolographicCard` container, `NebulaButton` for actions
- Progress bars use `spaceColors.aurora` fill on `spaceColors.locked` track

### Accessibility

- Constellation nodes have `accessibilityLabel` with title and status
- Graph is pannable/zoomable with gesture support
- Node detail card announces status changes to screen readers
- Markdown content preserves heading hierarchy for navigation

---

## Changelog

| Date | Phase | Change | Author |
|------|-------|--------|--------|
| — | 3 | Initial creation | — |
