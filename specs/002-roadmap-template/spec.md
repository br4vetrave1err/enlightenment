# Feature Spec: Course Roadmap Rendering Template (v2)

## User Stories

**[US1] Roadmap UI Core [P1]**
As a developer, I want a reusable React component that can take a v2 JSON roadmap and render the phases and topics as an interactive visual node graph using Tailwind CSS.
- **Backend Requirement**: The `/api/courses/{course_id}` endpoint must be updated to return the rich hierarchical data structure (phases, topics, and graph dependencies) extracted from the global knowledge universe.

**[US2] Roadmap State Management [P1]**
As a learner, I want my progress state (topics completed, in-progress) to be visually differentiated on the roadmap, so that I can easily see where I left off.

**[US3] Topic Details Panel [P2]**
As a learner, I want to click on a topic node to see a slide-out or modal containing the topic description and the list of associated learning resources, so that I can access the materials.

**[US4] Graph Dependencies [P2]**
As a developer, I want the node graph to render the global `topic_graph` dependencies (required, recommended, alternative) with connecting edges (e.g. animated lines), so that learners know prerequisites.

**[US5] Variant Filtering [P3]**
As a learner, I want to select a learning path "variant" (e.g., "I already know HTML/CSS") and see the roadmap dynamically skip phases or topics that I do not need to take.
- **Backend Requirement**: The backend must dynamically construct a personalized graph variant and skip list based on the user's initial signup preferences and current progress, mapping from a global universe of skills and frameworks.

**Bugfix**: 2026-06-14 — [BUG-001] Added backend data modeling and dynamic variant generation requirements.
