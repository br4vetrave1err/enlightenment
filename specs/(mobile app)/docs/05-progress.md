# Progress Tab

## Overview

**Purpose:** Display learning statistics, knowledge gaps, and topic mastery using orbital visualization.
**User Stories:** As a learner, I want to see my overall progress, identify knowledge gaps, and track topic mastery.
**Phase:** 5

---

## Components

| Component | File Path | Props | Description |
|-----------|-----------|-------|-------------|
| Progress Screen | `mobile/src/app/(tabs)/progress/index.tsx` | — | Dashboard fetching stats + profile, renders OrbitTracker |
| OrbitTracker | `mobile/src/features/progress/components/OrbitTracker.tsx` | stats, profile | Already built — orbital rings for metrics, knowledge gaps, topic mastery |

---

## API Integration

| Endpoint | Method | Used By | Request Shape | Response Shape |
|----------|--------|---------|---------------|----------------|
| `/api/user/learning-stats` | GET | Progress Screen | — | `LearningStats` |
| `/api/user/knowledge-profile` | GET | Progress Screen | — | `KnowledgeProfile` |

---

## State Management

No dedicated store needed. Data fetched on screen mount and passed directly to OrbitTracker.

### Data Flow

```
(tabs)/progress → GET /api/user/learning-stats → LearningStats
                → GET /api/user/knowledge-profile → KnowledgeProfile
                → <OrbitTracker stats={...} profile={...} />
```

---

## Tests

| Test ID | Component | Test Case | Status | Notes |
|---------|-----------|-----------|--------|-------|
| T-101 | progress/index.tsx | Fetches stats and profile on mount | ⬜ | — |
| T-102 | progress/index.tsx | Renders OrbitTracker with data | ⬜ | — |
| T-103 | progress/index.tsx | Shows loading state during fetch | ⬜ | — |
| T-104 | progress/index.tsx | Shows error state with retry | ⬜ | — |
| T-105 | OrbitTracker | Displays correct stats values | ⬜ | — |
| T-106 | OrbitTracker | Knowledge gaps render when present | ⬜ | — |
| T-107 | OrbitTracker | Topic mastery bars render with correct widths | ⬜ | — |

---

## Design Notes

### Space Theme Usage

- OrbitTracker uses `OrbitProgress` rings for metrics (already themed)
- `HolographicCard` containers for each section
- Topic mastery bars use status colors: new=starlightDim, learning=nebulaBlue, proficient=solar, mastered=aurora
- Knowledge gap recommendations use `spaceColors.starlightMuted` text

### Accessibility

- OrbitProgress announces percentage to screen readers
- Topic mastery bars include status text labels
- Knowledge gaps are structured as list items for navigation

---

## Changelog

| Date | Phase | Change | Author |
|------|-------|--------|--------|
| — | 5 | Initial creation | — |
