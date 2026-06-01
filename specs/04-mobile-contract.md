# Mobile API Contract — React Native (Expo)

**Framework:** React Native with Expo  
**Navigation:** Expo Router (file-based)  
**API Client:** `fetch` with SSE support via `react-native-sse`  
**State Management:** Zustand  
**TypeScript:** Strict mode

---

## Shared Types

```typescript
// shared/api-contract.ts

export interface Course {
  course_id: string;
  title: string;
  description: string;
  icon: string;
  total_nodes: number;
  completed_nodes: number;
  completion_percentage: number;
  last_accessed: string;
}

export interface RoadmapGraph {
  course_id: string;
  title: string;
  nodes: Node[];
  edges: Edge[];
}

export interface Node {
  node_id: string;
  title: string;
  position: { x: number; y: number };
  status: "locked" | "available" | "in_progress" | "completed";
  estimated_minutes: number;
}

export interface Edge {
  from: string;
  to: string;
  type: "sequential" | "prerequisite" | "related";
}

export interface NodeContent {
  node_id: string;
  title: string;
  content: string;
  links: string[];
  prerequisites: string[];
  estimated_minutes: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: { node_id: string; title: string }[];
}

export interface ChatSession {
  session_id: string;
  course_context: string | null;
  summary: string;
  created_at: string;
  message_count: number;
}

export interface KnowledgeProfile {
  topics: {
    name: string;
    mastery_level: number;
    sources: string[];
    status: "new" | "learning" | "proficient" | "mastered";
  }[];
  knowledge_gaps: {
    topic: string;
    recommended_course: string;
    recommended_node: string;
  }[];
  learning_velocity: {
    nodes_per_week: number;
    current_streak_days: number;
  };
}

export interface LearningStats {
  total_nodes_completed: number;
  courses_in_progress: number;
  current_streak_days: number;
  nodes_per_week: number;
  time_spent_total_hours: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

---

## Screen-to-API Mapping

### Auth Flow — `(auth)/`

**`login.tsx`**
- POST `/api/auth/login` → store tokens in SecureStore
- POST `/api/auth/google` → open browser → POST `/api/auth/google/callback`

**`register.tsx`**
- POST `/api/auth/register` → store tokens

---

### Courses Tab — `(tabs)/courses/`

**`index.tsx` — Course List**
```typescript
// GET /api/courses
const response = await fetch(`${API_URL}/api/courses`, {
  headers: { Authorization: `Bearer ${token}` }
});
const data: { courses: Course[] } = await response.json();
```

**`[courseId].tsx` — Constellation Map**
```typescript
// GET /api/courses/{course_id}
const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
  headers: { Authorization: `Bearer ${token}` }
});
const graph: RoadmapGraph = await response.json();
```

**`[courseId]/[nodeId].tsx` — Node Detail**
```typescript
// GET /api/courses/{course_id}/nodes/{node_id}
const response = await fetch(
  `${API_URL}/api/courses/${courseId}/nodes/${nodeId}`,
  { headers: { Authorization: `Bearer ${token}` } }
);
const content: NodeContent = await response.json();

// POST /api/user/progress/{course_id}/node (on view)
await fetch(`${API_URL}/api/user/progress/${courseId}/node`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    node_id: nodeId,
    action: "view",
    time_spent_seconds: timeSpent,
  }),
});
```

---

### Chat Tab — `(tabs)/chat/`

**`index.tsx` — Chat Screen**
```typescript
// SSE Stream
import EventSource from "react-native-sse";

const startChat = (message: string, courseId?: string, nodeId?: string) => {
  const params = new URLSearchParams({
    message,
    ...(courseId && { course_id: courseId }),
    ...(nodeId && { node_id: nodeId }),
  });

  const eventSource = new EventSource(
    `${API_URL}/api/chat/stream?${params}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      method: "POST",
    }
  );

  eventSource.addEventListener("token", (e: any) => {
    const { token } = JSON.parse(e.data);
    setResponse((prev) => prev + token);
  });

  eventSource.addEventListener("source", (e: any) => {
    const source = JSON.parse(e.data);
    setSources((prev) => [...prev, source]);
  });

  eventSource.addEventListener("done", (e: any) => {
    const { session_id } = JSON.parse(e.data);
    setSessionId(session_id);
    eventSource.close();
  });
};
```

**`history.tsx` — Chat History**
```typescript
// GET /api/chat/history
const response = await fetch(`${API_URL}/api/chat/history`, {
  headers: { Authorization: `Bearer ${token}` }
});
const data: { sessions: ChatSession[] } = await response.json();
```

---

### Progress Tab — `(tabs)/progress/`

**`index.tsx` — Stats Dashboard**
```typescript
// GET /api/user/learning-stats
const statsResponse = await fetch(`${API_URL}/api/user/learning-stats`, {
  headers: { Authorization: `Bearer ${token}` }
});
const stats: LearningStats = await statsResponse.json();

// GET /api/user/knowledge-profile
const profileResponse = await fetch(`${API_URL}/api/user/knowledge-profile`, {
  headers: { Authorization: `Bearer ${token}` }
});
const profile: KnowledgeProfile = await profileResponse.json();
```

---

## Constellation Map Layout (Auto-Generated)

Force-directed layout generated client-side:

```typescript
import { forceSimulation, forceManyBody, forceLink, forceCenter } from "d3-force";

const generateLayout = (nodes: Node[], edges: Edge[]) => {
  const simulation = forceSimulation(nodes)
    .force("charge", forceManyBody().strength(-200))
    .force("link", forceLink(edges).id((d: any) => d.node_id).distance(100))
    .force("center", forceCenter(width / 2, height / 2))
    .stop();

  for (let i = 0; i < 300; i++) simulation.tick();

  return nodes.map((n) => ({
    ...n,
    position: { x: n.x, y: n.y },
  }));
};
```

**Visual Design:**
- Dark background (#0a0a0a)
- Nodes: glowing circles (size = estimated_minutes)
- Completed: green glow (#22c55e)
- Current: breathing animation, blue glow (#3b82f6)
- Locked: dim grey (#4b5563)
- Edges: subtle lines, opacity by relationship type
- Tap: expands into card with title + estimated_minutes
- Swipe: navigate to adjacent nodes

---

## API Client Setup

```typescript
// mobile/services/api.ts
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

async function authFetch(path: string, options: RequestInit = {}) {
  const token = await SecureStore.getItemAsync("access_token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return authFetch(path, options);
    }
    router.replace("/(auth)/login");
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}

async function refreshToken() {
  const refreshToken = await SecureStore.getItemAsync("refresh_token");
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (response.ok) {
    const { access_token, refresh_token } = await response.json();
    await SecureStore.setItemAsync("access_token", access_token);
    await SecureStore.setItemAsync("refresh_token", refresh_token);
    return true;
  }
  return false;
}

export { authFetch, API_URL };
```
