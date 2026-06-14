# Research: roadmap.sh UI Alignment & Interactive Graph Migration

## Decision 1: Interactive Node Layout & Graph Engine
* **Decision**: Adopt `@xyflow/react` (React Flow) combined with `dagre` for automated hierarchical layout.
* **Rationale**: Replicating the exact branching, zooming, and panning behavior of roadmap.sh requires a robust canvas-based graph engine. `@xyflow/react` provides customizable node and edge components, viewport controls, and seamless react state integration, while `dagre` handles layouting of the DAG nodes dynamically on load. We will implement hierarchical grouping by assigning child nodes to parent phase nodes (`parentId`).
* **Alternatives Considered**: 
  - *SVG Canvas*: Simple but difficult to scale for large roadmaps with branches, and lacks interactive panning/zooming.
  - *D3.js Force Graphs*: Lacks standard hierarchical layout controls suited for sequential learning paths.

## Decision 2: Visual Style, Theme & Color Tokens
* **Decision**: Implement the signature roadmap.sh dark theme with sleek borders, status-colored outlines (green for completed, yellow/orange for in-progress, grey/purple for unlocked/locked), grid backgrounds, and clean sans-serif typography.
* **Rationale**: The user opted for the signature roadmap.sh visual styling. We will declare Tailwind configuration variables and root CSS variables for:
  - Background: Slate-950 (`#09090b` / `#030712`)
  - Node borders/glows: Cyan/Green (`#10b981` / `#06b6d4`), Purple (`#8b5cf6`), and Amber (`#f59e0b` for milestones/in-progress)
  - Edge connectors: Soft slate (`#334155`), with neon glow when active.
  - Grid pattern background (`Background` component from React Flow).

## Decision 3: Inline Interactive Controls & Search
* **Decision**: Custom custom-designed nodes featuring direct-click status-updating checkmarks alongside standard click triggers to open the detail drawer. Include a client-side search bar at the top of the canvas.
* **Rationale**: Directly updates node status inside the graph nodes using check/circle icons. Search functionality filters nodes on the client, updating React Flow's `nodes` array by either highlighting matching nodes or hiding non-matching ones.

## Decision 4: Note-taking & Quiz Storage
* **Decision**: Store notes and quiz results inside the MongoDB/SQLite database via progress API endpoints, keyed under `user_id` and `course_id`.
* **Rationale**: Keeps all user progress data in a single document model, preventing expensive join operations and facilitating instant sync on load.
