# Data Model Specification — MongoDB Collections

**Database:** MongoDB (local instance via Docker)  
**Indexes:** Text indexes on searchable fields, compound indexes for common queries

---

## users

User accounts and settings.

```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "password_hash": "$2b$12$...",
  "google_id": "102938475...",
  "display_name": "John",
  "avatar_url": "https://...",
  "created_at": "ISODate",
  "last_login": "ISODate",
  "settings": {
    "preferred_model": "qwen3.6-plus",
    "difficulty_preference": "auto",
    "constellation_theme": "dark"
  }
}
```

**Indexes:**
- `{ email: 1 }` — unique
- `{ google_id: 1 }` — unique, sparse

---

## courses

Cached roadmap content from roadmap.sh GitHub repo.

```json
{
  "_id": "ObjectId",
  "course_id": "frontend",
  "title": "Frontend Developer",
  "description": "Learn to become a frontend developer...",
  "icon": "🎨",
  "last_synced": "ISODate",
  "github_sha": "abc123...",
  "nodes": [
    {
      "node_id": "html-basics",
      "title": "HTML Basics",
      "content": "# HTML Basics\n\nHTML stands for...",
      "links": ["https://mdn.io/html"],
      "position": { "x": 100, "y": 200 },
      "tags": ["html", "markup", "beginner"],
      "prerequisites": [],
      "estimated_minutes": 30,
      "extracted_concepts": ["html", "markup", "dom"],
      "difficulty": "beginner",
      "summary": "Introduction to HTML structure and elements"
    }
  ],
  "edges": [
    { "from": "html-basics", "to": "css-basics", "type": "sequential" },
    { "from": "css-basics", "to": "javascript-basics", "type": "sequential" }
  ]
}
```

**Indexes:**
- `{ course_id: 1 }` — unique
- `{ "nodes.node_id": 1, course_id: 1 }` — compound
- `{ "nodes.title": "text", "nodes.content": "text", "nodes.tags": "text" }` — text search

---

## user_progress

Per-user, per-course progress tracking.

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "course_id": "frontend",
  "started_at": "ISODate",
  "last_accessed": "ISODate",
  "completed_nodes": ["html-basics", "css-basics"],
  "current_node": "javascript-basics",
  "time_spent_per_node": {
    "html-basics": 1800,
    "css-basics": 2400
  },
  "node_ratings": {
    "html-basics": 4,
    "css-basics": 3
  },
  "completion_percentage": 15.2
}
```

**Indexes:**
- `{ user_id: 1, course_id: 1 }` — unique compound
- `{ user_id: 1 }` — for listing all courses

---

## topic_graph

Knowledge graph — topics as entities, relationships as edges. Built during content sync via LLM extraction.

```json
{
  "_id": "http",
  "name": "HTTP",
  "description": "Hypertext Transfer Protocol — the foundation of data communication on the web",
  "courses_seen_in": ["backend", "api-design", "devops", "full-stack"],
  "node_ids": ["http-basics", "http-methods", "http-status-codes"],
  "relationships": [
    { "to": "rest", "type": "foundation", "strength": 0.9 },
    { "to": "tcp", "type": "built_on", "strength": 0.8 },
    { "to": "caching", "type": "enables", "strength": 0.7 },
    { "to": "graphql", "type": "alternative_protocol", "strength": 0.6 }
  ],
  "last_updated": "ISODate"
}
```

**Indexes:**
- `{ name: 1 }` — unique
- `{ relationships.to: 1 }` — for reverse lookups
- `{ courses_seen_in: 1 }` — multikey

---

## knowledge_profile

Cross-course user knowledge assessment. Auto-calculated from progress.

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "updated_at": "ISODate",
  "topics": [
    {
      "name": "http",
      "mastery_level": 0.7,
      "sources": ["backend", "api-design"],
      "last_verified": "ISODate",
      "status": "proficient"
    },
    {
      "name": "caching",
      "mastery_level": 0.3,
      "sources": ["backend", "redis", "system-design"],
      "last_verified": "ISODate",
      "status": "learning"
    }
  ],
  "knowledge_gaps": [
    {
      "topic": "websockets",
      "recommended_course": "backend",
      "recommended_node": "websockets"
    }
  ],
  "learning_velocity": {
    "nodes_per_week": 5.2,
    "current_streak_days": 12
  }
}
```

**Indexes:**
- `{ user_id: 1 }` — unique

---

## chat_sessions

Conversation history with summaries for context compression.

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "course_context_id": "frontend",
  "node_context_id": "javascript-basics",
  "created_at": "ISODate",
  "updated_at": "ISODate",
  "summary": "User asked about closures and scope in JavaScript. Confused about lexical vs dynamic scope.",
  "messages": [
    {
      "role": "user",
      "content": "What are closures?",
      "timestamp": "ISODate"
    },
    {
      "role": "assistant",
      "content": "A closure is a function that has access to variables in its outer scope...",
      "timestamp": "ISODate",
      "sources_used": ["javascript-basics", "scope-and-hoisting"],
      "difficulty_level": "intermediate"
    }
  ],
  "token_count": 3200
}
```

**Indexes:**
- `{ user_id: 1, created_at: -1 }` — for listing sessions
- `{ user_id: 1, course_context_id: 1 }` — for filtering by course

---

## sync_log

Audit trail for content synchronization runs.

```json
{
  "_id": "ObjectId",
  "triggered_by": "webhook",
  "github_sha": "abc123...",
  "started_at": "ISODate",
  "completed_at": "ISODate",
  "status": "completed",
  "courses_updated": ["frontend", "backend"],
  "nodes_added": 3,
  "nodes_updated": 12,
  "nodes_removed": 0,
  "llm_calls_made": 45,
  "llm_tokens_used": 12500,
  "error": null
}
```

**Indexes:**
- `{ started_at: -1 }` — for listing recent syncs

---

## Mastery Calculation Formula

Mastery is auto-calculated, not self-reported:

```
mastery(topic) = base_score * time_weight * verification_bonus

base_score = completed_nodes_containing_topic / total_nodes_containing_topic
time_weight = min(1.0, time_spent_on_topic / estimated_time_for_topic)
verification_bonus = 1.0 + (chat_questions_answered_correctly * 0.1)  # max 1.3

status mapping:
  mastery < 0.3  → "new"
  0.3 <= mastery < 0.5  → "learning"
  0.5 <= mastery < 0.8  → "proficient"
  mastery >= 0.8  → "mastered"
```
