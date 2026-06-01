# API Specification — Roadmap Learning Platform

**Version:** 0.1.0  
**Base URL:** `http://localhost:8000`  
**Auth:** JWT Bearer tokens  
**Streaming:** Server-Sent Events (SSE) for chat

---

## Auth

### POST `/api/auth/register`
Register with email + password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "display_name": "John"
}
```

**Response (201):**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": { "id": "...", "email": "...", "display_name": "John" }
}
```

### POST `/api/auth/login`
Login with email + password.

**Request:**
```json
{ "email": "user@example.com", "password": "securepassword123" }
```

**Response (200):** Same as register.

### POST `/api/auth/google`
Initiate Google OAuth flow.

**Response (200):**
```json
{ "auth_url": "https://accounts.google.com/..." }
```

### POST `/api/auth/google/callback`
Handle Google OAuth callback.

**Request:**
```json
{ "code": "4/0AX4XfWh...", "state": "csrf_token" }
```

**Response (200):** Same as register.

### POST `/api/auth/refresh`
Refresh access token.

**Request:**
```json
{ "refresh_token": "eyJ..." }
```

**Response (200):**
```json
{ "access_token": "eyJ...", "refresh_token": "eyJ..." }
```

### POST `/api/auth/logout`
Invalidate refresh token. Requires auth header.

---

## Courses

### GET `/api/courses`
List all available roadmaps with user progress.

**Query params:** `status` (all | in_progress | completed)

**Response (200):**
```json
{
  "courses": [
    {
      "course_id": "frontend",
      "title": "Frontend Developer",
      "description": "Learn to become a frontend developer...",
      "icon": "🎨",
      "total_nodes": 45,
      "completed_nodes": 12,
      "completion_percentage": 26.7,
      "last_accessed": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### GET `/api/courses/{course_id}`
Get full roadmap graph (nodes + edges) with user progress overlay.

**Response (200):**
```json
{
  "course_id": "frontend",
  "title": "Frontend Developer",
  "nodes": [
    {
      "node_id": "html-basics",
      "title": "HTML Basics",
      "position": { "x": 100, "y": 200 },
      "status": "completed",
      "confidence": 4,
      "estimated_minutes": 30
    }
  ],
  "edges": [
    { "from": "html-basics", "to": "css-basics", "type": "sequential" }
  ]
}
```

### GET `/api/courses/{course_id}/nodes/{node_id}`
Get single node content (markdown + metadata).

**Response (200):**
```json
{
  "node_id": "html-basics",
  "title": "HTML Basics",
  "content": "# HTML Basics\n\nHTML stands for...",
  "links": ["https://mdn.io/html"],
  "prerequisites": [],
  "estimated_minutes": 30
}
```

---

## User Progress

### GET `/api/user/progress`
Get progress across all courses.

**Response (200):**
```json
{
  "courses": [
    {
      "course_id": "frontend",
      "started_at": "2024-01-01T00:00:00Z",
      "last_accessed": "2024-01-15T10:30:00Z",
      "completed_nodes": ["html-basics", "css-basics"],
      "current_node": "javascript-basics",
      "time_spent_seconds": 7200,
      "completion_percentage": 26.7
    }
  ]
}
```

### GET `/api/user/progress/{course_id}`
Get progress for a specific course.

### POST `/api/user/progress/{course_id}/node`
Mark a node as viewed/completed.

**Request:**
```json
{
  "node_id": "javascript-basics",
  "action": "complete",
  "time_spent_seconds": 1800,
  "self_rating": 4
}
```

### PUT `/api/user/progress/{course_id}/node/{node_id}`
Update node state (rating, time, status).

### GET `/api/user/knowledge-profile`
Get cross-course knowledge graph with mastery levels.

**Response (200):**
```json
{
  "topics": [
    {
      "name": "http",
      "mastery_level": 0.7,
      "sources": ["backend", "api-design"],
      "last_verified": "2024-01-15T10:30:00Z",
      "status": "proficient"
    }
  ],
  "knowledge_gaps": [
    { "topic": "websockets", "recommended_course": "backend", "recommended_node": "websockets" }
  ],
  "learning_velocity": {
    "nodes_per_week": 5.2,
    "current_streak_days": 12
  }
}
```

### GET `/api/user/learning-stats`
Get aggregated learning statistics.

**Response (200):**
```json
{
  "total_nodes_completed": 42,
  "courses_in_progress": 3,
  "current_streak_days": 12,
  "nodes_per_week": 5.2,
  "time_spent_total_hours": 28.5,
  "knowledge_gaps": [
    { "topic": "websockets", "recommended": "backend" }
  ]
}
```

---

## Chat (SSE Streaming)

### POST `/api/chat/stream`
Stream chat response via Server-Sent Events.

**Request:**
```json
{
  "message": "What are closures in JavaScript?",
  "course_id": "frontend",
  "node_id": "javascript-basics"
}
```

**SSE Events:**
```
event: token
data: {"token": "A"}

event: token
data: {"token": " closure"}

event: source
data: {"node_id": "javascript-basics", "title": "JavaScript Basics"}

event: done
data: {"session_id": "abc123", "token_count": 3200}
```

### GET `/api/chat/history`
List past chat sessions.

**Response (200):**
```json
{
  "sessions": [
    {
      "session_id": "abc123",
      "course_context": "frontend",
      "summary": "User asked about closures and scope...",
      "created_at": "2024-01-15T10:30:00Z",
      "message_count": 8
    }
  ]
}
```

### GET `/api/chat/history/{session_id}`
Get full session messages.

### DELETE `/api/chat/history/{session_id}`
Clear a session.

---

## Content Sync

### POST `/api/webhook/github`
GitHub webhook receiver for roadmap.sh repo changes.

**Headers:** `X-Hub-Signature-256` (HMAC validation)

**Request:** GitHub push event payload.

**Response (200):**
```json
{ "status": "sync_triggered", "sync_id": "sync_abc123" }
```

### GET `/api/sync/status`
Get last sync status.

**Response (200):**
```json
{
  "last_sync": "2024-01-15T10:30:00Z",
  "status": "completed",
  "courses_updated": ["frontend", "backend"],
  "nodes_added": 3,
  "nodes_updated": 12,
  "github_sha": "abc123..."
}
```

### POST `/api/sync/trigger`
Manually trigger content sync.

---

## Search

### POST `/api/search`
Semantic + keyword search across all course content.

**Request:**
```json
{
  "query": "middleware authentication",
  "course_filter": "backend",
  "limit": 5
}
```

**Response (200):**
```json
{
  "results": [
    {
      "node_id": "express-middleware",
      "title": "Express Middleware",
      "snippet": "Middleware functions have access to the request and response objects...",
      "relevance_score": 0.92,
      "course_id": "backend"
    }
  ]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "AUTH_INVALID_TOKEN",
    "message": "Invalid or expired access token",
    "details": {}
  }
}
```

**HTTP Status Codes:**
- `400` — Bad Request (validation errors)
- `401` — Unauthorized (missing/invalid auth)
- `403` — Forbidden (insufficient permissions)
- `404` — Not Found
- `422` — Unprocessable Entity (validation)
- `429` — Rate Limited
- `500` — Internal Server Error
