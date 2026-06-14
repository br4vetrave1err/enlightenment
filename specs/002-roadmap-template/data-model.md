# Data Model: Course Roadmap (v2)

This model separates static course content from user progress. It allows caching the roadmap definition globally while maintaining user state separately.

## 1. Roadmap Content Model

**Roadmap Object**:
- `id`, `slug`, `title`, `description`, `version`, `roadmap_type`
- `meta`: Aggregate data (e.g. `total_duration`, `total_topics`, `level`, `tags`)
- `phases`: An array of learning phases (e.g. Foundations, Advanced).
- `topic_graph`: Global definitions of dependencies (edges) connecting topics.
- `variants`: Custom paths letting users skip phases or topics based on prior knowledge.

**Phase Object**:
- `id`, `order`, `name`, `description`, `duration`
- `topics`: The individual learning units in this phase.
- `milestone`: Optional project/quiz at the end of the phase.

**Topic Object**:
- `id`, `order`, `name`, `description`, `type`, `difficulty`, `estimated_hours`, `tags`
- `resources`: Array of curated learning links (videos, articles) with metadata like `quality_score` and `duration_minutes`.

**Topic Graph Edge**:
- `from`, `to`, `type` (required, recommended, alternative).

**Variant Object**:
- `id`, `label`, `description`, `skip_phases`, `skip_topics`, `unlocks_at`.

## 2. User Progress Model

**UserProgress Object**:
- `user_id`, `roadmap_id`, `roadmap_version`, `variant_id`
- `percent_complete`, `started_at`, `last_activity_at`, `estimated_completion`
- `topics`: Array of topic progress states.
- `milestones`: Array of milestone completions.

**Topic Progress Object**:
- `topic_id`
- `status` (not_started, in_progress, done, skipped)
- `started_at`, `done_at`, `note`
- `resource_interactions`: Tracking user engagement with specific resources.

**Milestone Completion Object**:
- `phase_id`, `completed_at`, `artifact_url`
