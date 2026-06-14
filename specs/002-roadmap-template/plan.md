# Implementation Plan: UI Overhaul to roadmap.sh Style

**Branch**: `002-roadmap-template` | **Date**: 2026-06-14 | **Spec**: [spec.md](file:///home/br4vetrave1er/Desktop/projects/enlightenment/specs/002-roadmap-template/spec.md)

**Input**: Feature specification from `/specs/002-roadmap-template/spec.md`

## Summary

We will overhaul the roadmap visualization page (`CourseDetail.tsx`) from the planetary serpentine path to an interactive, zoomable, and pannable node-link graph inspired by roadmap.sh. The graph will be rendered using React Flow (`@xyflow/react`) with hierarchical node grouping and automatic layout computation (via `dagre`). The UI will adopt a clean dark theme matching roadmap.sh aesthetics (yellow/purple/green borders based on node status, clean sans-serif layouts, grid background). Nodes will support direct status checks, and a search/filter bar will allow users to filter nodes.

## Technical Context

**Language/Version**: React 19, TypeScript, Vite, Tailwind CSS v4

**Primary Dependencies**: `@xyflow/react`, `dagre`, `lucide-react`, `zustand`, `react-router-dom`

**Storage**: Backend SQL DB (FastAPI client API), Frontend `localStorage` for visual skip settings

**Testing**: React Testing Library & Vitest (or manual browser validation if not configured)

**Target Platform**: Modern desktop and mobile web browsers

**Project Type**: Web application frontend component integration

**Performance Goals**: Smooth panning, zooming, and rendering of up to 200 nodes and hierarchical parent groups with less than 100ms layout execution.

**Constraints**: Must run in Vite environment, maintain compatibility with existing progress tracking endpoints (`/api/user/progress/...`).

**Scale/Scope**: Refactoring `CourseDetail.tsx`, introducing custom React Flow node types (`RoadmapNode`, `GroupNode`), custom edge types, and layout utility files.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Library-First)**: Standard React component modularity. Keep helper functions, layout calculations, and sub-components separate.
- **Principle II (TypeScript Strictness)**: Fully type all custom React Flow Node and Edge data attributes.
- **Principle III (Simplicity & Performance)**: Avoid heavy external styling libraries; use Tailwind CSS v4 utility classes and vanilla CSS transitions.

## Project Structure

### Documentation (this feature)

```text
specs/002-roadmap-template/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks output)
```

### Source Code

```text
web/
├── src/
│   ├── components/
│   │   ├── TopicDetailsPanel.tsx
│   │   └── VariantSelector.tsx
│   ├── features/
│   │   └── courses/
│   │       └── utils/
│   │           └── layout.ts          # Dagre layout logic
│   └── pages/
│       └── courses/
│           ├── CourseDetail.tsx       # Main page overhaul
│           ├── RoadmapNode.tsx        # Custom React Flow topic node
│           ├── GroupNode.tsx          # Custom React Flow group node
│           └── RoadmapEdge.tsx        # Custom React Flow connection line
```

**Structure Decision**: Overhaul `web/src/pages/courses/CourseDetail.tsx` and custom nodes. Create layout utility functions to automatically calculate node positions from the topic graph.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
