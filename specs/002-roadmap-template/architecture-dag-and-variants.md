# Architecture Deep Dive: DAGs and Dynamic Variants

This document expands on the community best practices for structuring complex learning roadmaps.

## 1. Modeling the Structure as a DAG (Directed Acyclic Graph)

### What is a DAG?
A Directed Acyclic Graph (DAG) is a conceptual way to model data where:
- **Graph**: It consists of "Nodes" (Topics) connected by "Edges" (Relationships).
- **Directed**: The edges have a strict direction (e.g., Node A points to Node B, meaning A comes *before* B).
- **Acyclic**: There are no loops. You can never traverse from Node A, to Node B, and end up back at Node A. This is critical for learning paths, as you cannot have infinite prerequisite loops.

### Why not just use Arrays?
In a flat array `[Node A, Node B, Node C]`, the only relationship is the index order. If `Node C` requires `Node A` but *doesn't* require `Node B`, an array cannot express that. 

### How it is Stored
Instead of nesting topics endlessly, the standard approach is to maintain two separate lists within your course document:

```json
{
  "nodes": [
    { "id": "html", "title": "HTML Basics", "phase": "frontend-basics" },
    { "id": "css", "title": "CSS Styling", "phase": "frontend-basics" },
    { "id": "react", "title": "React JS", "phase": "frameworks" }
  ],
  "edges": [
    { "from": "html", "to": "react", "type": "requires" },
    { "from": "css", "to": "react", "type": "recommends" }
  ]
}
```

### The Rendering Algorithm (Topological Sort & BFS)
When the frontend loads this data, it doesn't just render a list top-to-bottom. It uses graph traversal algorithms:
1. **In-Degree Calculation**: Find nodes with `0` incoming "requires" edges (e.g., HTML and CSS). These are unlocked by default.
2. **Breadth-First Search (BFS)**: Draw these initial nodes, then follow their outgoing edges to draw the next tier of nodes.
3. **State Merging**: If the user's progress state says `html` is `completed`, the system visually unlocks the outgoing edge pointing to `react`.

---

## 2. Handling Dynamic "Variants" (User Selection)

A core requirement of modern roadmaps is adaptability. If a user already knows HTML and CSS, they shouldn't be forced to click through them.

### The Problem with "Branching"
Naively, developers often try to create completely separate JSON files for different variants (e.g., `frontend-expert.json`, `frontend-beginner.json`). This leads to a maintenance nightmare. If you update the "React" node, you have to update it in 10 different files.

### The Solution: Graph Pruning via Skip Lists
A **Variant** is treated as a "lens" or "filter" applied over the master DAG. It is defined simply as a list of nodes or phases to ignore.

```json
"variants": [
  {
    "id": "skip-basics",
    "label": "I already know HTML/CSS",
    "skip_topics": ["html", "css"]
  }
]
```

### How the Frontend Handles Skip Lists
When a user selects the "skip-basics" variant, the frontend alters its graph traversal algorithm:
1. It looks at the master graph.
2. It identifies the nodes in `skip_topics`.
3. **Edge Bridging**: If Node A points to Node B (Skipped), and Node B points to Node C, the algorithm dynamically "bridges" the edge so Node A points directly to Node C.
4. Visually, the skipped nodes are either entirely removed from the DOM, or rendered as tiny, collapsed "Fast-Tracked" dots.

### Benefits
- **Single Source of Truth**: The course content exists in exactly one place.
- **Infinite Flexibility**: You can dynamically generate variants on the fly. An LLM could even generate a custom `skip_topics` array based on a user's resume, instantly generating a highly personalized roadmap without changing the database structure.
