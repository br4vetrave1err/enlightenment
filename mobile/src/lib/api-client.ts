import { authFetch } from './api';

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
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  estimated_minutes: number;
}

export interface Edge {
  from: string;
  to: string;
  type: 'sequential' | 'prerequisite' | 'related';
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
  role: 'user' | 'assistant';
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
    status: 'new' | 'learning' | 'proficient' | 'mastered';
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

export async function getCourses(): Promise<Course[]> {
  const response = await authFetch('/api/courses');
  const data = await response.json();
  return data.courses;
}

export async function getCourse(courseId: string): Promise<RoadmapGraph> {
  const response = await authFetch(`/api/courses/${courseId}`);
  return response.json();
}

export async function getNodeContent(courseId: string, nodeId: string): Promise<NodeContent> {
  const response = await authFetch(`/api/courses/${courseId}/nodes/${nodeId}`);
  return response.json();
}

export async function trackNodeView(courseId: string, nodeId: string, timeSpent: number): Promise<void> {
  await authFetch(`/api/user/progress/${courseId}/node`, {
    method: 'POST',
    body: JSON.stringify({
      node_id: nodeId,
      action: 'view',
      time_spent_seconds: timeSpent,
    }),
  });
}

export async function completeNode(courseId: string, nodeId: string): Promise<void> {
  await authFetch(`/api/user/progress/${courseId}/node`, {
    method: 'POST',
    body: JSON.stringify({
      node_id: nodeId,
      action: 'complete',
    }),
  });
}

export async function rateNode(courseId: string, nodeId: string, rating: number): Promise<void> {
  await authFetch(`/api/user/progress/${courseId}/node`, {
    method: 'POST',
    body: JSON.stringify({
      node_id: nodeId,
      action: 'rate',
      rating,
    }),
  });
}

export async function getChatHistory(): Promise<ChatSession[]> {
  const response = await authFetch('/api/chat/history');
  const data = await response.json();
  return data.sessions;
}

export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const response = await authFetch(`/api/chat/history/${sessionId}`);
  const data = await response.json();
  return data.messages;
}

export async function getLearningStats(): Promise<LearningStats> {
  const response = await authFetch('/api/user/learning-stats');
  return response.json();
}

export async function getKnowledgeProfile(): Promise<KnowledgeProfile> {
  const response = await authFetch('/api/user/knowledge-profile');
  return response.json();
}
