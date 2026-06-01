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
