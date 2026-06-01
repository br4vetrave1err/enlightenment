# Map Tab

## Overview

**Purpose:** Cross-course constellation map showing all courses as interconnected galaxies.
**User Stories:** As a learner, I want to see the full learning landscape and navigate between courses visually.
**Phase:** 6

---

## Components

| Component | File Path | Props | Description |
|-----------|-----------|-------|-------------|
| Map Screen | `mobile/src/app/(tabs)/map/index.tsx` | — | Full-screen constellation map with zoom/pan |
| GalaxyMap | `mobile/src/features/map/components/GalaxyMap.tsx` | courses | Multi-course constellation with color-coded groups |

---

## API Integration

| Endpoint | Method | Used By | Request Shape | Response Shape |
|----------|--------|---------|---------------|----------------|
| `/api/courses` | GET | Map Screen | — | `{ courses: Course[] }` |
| `/api/courses/{id}` | GET | GalaxyMap (per course) | — | `RoadmapGraph` |

---

## State Management

Uses `course-store` for course list. Individual course graphs fetched on demand.

### Data Flow

```
(tabs)/map → course-store.fetchCourses() → GalaxyMap renders all courses
    → tap course cluster → zooms into that constellation
    → tap node → navigates to [courseId]/[nodeId]
```

---

## Tests

| Test ID | Component | Test Case | Status | Notes |
|---------|-----------|-----------|--------|-------|
| T-108 | map/index.tsx | Shows all courses as interconnected constellations | ⬜ | — |
| T-109 | map/index.tsx | Allows zoom and pan | ⬜ | — |
| T-110 | map/index.tsx | Tap node navigates to node detail | ⬜ | — |
| T-111 | GalaxyMap | Renders multiple course constellations | ⬜ | — |
| T-112 | GalaxyMap | Color-codes courses by category | ⬜ | — |
| T-113 | GalaxyMap | Shows legend for course colors | ⬜ | — |

---

## Design Notes

### Space Theme Usage

- Each course rendered as a distinct constellation cluster
- Course clusters separated by spatial distance
- Node colors follow same status scheme as course detail view
- Background uses `StarField` with higher star density for "deep space" feel
- Legend uses `HolographicCard` with course color swatches

### Accessibility

- Zoom/pan gestures supported
- Legend items have `accessibilityLabel` with course name
- Nodes announce title and course on focus
- Reduced motion mode disables constellation animations

---

## Changelog

| Date | Phase | Change | Author |
|------|-------|--------|--------|
| — | 6 | Initial creation | — |
