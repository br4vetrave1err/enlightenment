export type Difficulty = 'easy' | 'medium' | 'hard';
export type TopicType = 'core' | 'optional' | 'tool' | 'project';
export type TopicStatus = 'not_started' | 'in_progress' | 'done' | 'skipped' | 'locked' | 'available' | 'completed';
export type EdgeType = 'required' | 'recommended' | 'alternative';
export type ResourceType = 'article' | 'video' | 'book' | 'course' | 'docs' | 'practice' | 'podcast';
export type MilestoneType = 'project' | 'quiz' | 'portfolio' | 'certification';
export type ResourceAction = 'opened' | 'bookmarked' | 'completed';

export interface Resource {
  id: string;
  title: string;
  url: string | null;
  type: ResourceType;
  free: boolean;
  duration_minutes: number | null;
  quality_score: number;
  verified: boolean;
  added_at: string;
  language: string;
}

export interface Topic {
  id: string;
  order: number;
  name: string;
  description: string;
  type: TopicType;
  difficulty: Difficulty;
  estimated_hours: number;
  tags: string[];
  resources: Resource[];
}

export interface Milestone {
  title: string;
  description: string;
  type: MilestoneType;
}

export interface Phase {
  id: string;
  order: number;
  name: string;
  description: string;
  duration: string;
  topics: Topic[];
  milestone?: Milestone;
}

export interface TopicGraphEdge {
  from: string;
  to: string;
  type: EdgeType;
}

export interface Variant {
  id: string;
  label: string;
  description: string;
  skip_phases: string[];
  skip_topics: string[];
  unlocks_at: string | null;
}

export interface RoadmapMeta {
  level: string;
  total_duration: string;
  total_phases: number;
  total_topics: number;
  tags: string[];
  prerequisites: string[];
}

export interface Roadmap {
  id: string;
  slug: string;
  title: string;
  description: string;
  roadmap_type: string;
  version: string;
  created_at: string;
  updated_at: string;
  meta: RoadmapMeta;
  phases: Phase[];
  topic_graph: TopicGraphEdge[];
  variants: Variant[];
}

export interface RoadmapData {
  roadmap: Roadmap;
}

export interface ResourceInteraction {
  resource_id: string;
  action: ResourceAction;
  at: string;
}

export interface TopicProgress {
  topic_id: string;
  status: TopicStatus;
  started_at: string | null;
  done_at: string | null;
  note: string | null;
  resource_interactions: ResourceInteraction[];
}

export interface MilestoneProgress {
  phase_id: string;
  completed_at: string;
  artifact_url: string | null;
}

export interface UserProgress {
  user_id: string;
  roadmap_id: string;
  roadmap_version: string;
  variant_id: string | null;
  percent_complete: number;
  started_at: string | null;
  last_activity_at: string | null;
  estimated_completion: string | null;
  topics: TopicProgress[];
  milestones: MilestoneProgress[];
}

export interface UserProgressData {
  user_progress: UserProgress;
}
