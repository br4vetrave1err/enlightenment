import { useMemo, useState } from 'react';
import type { RoadmapData, UserProgressData, TopicStatus } from '../types';

export function useRoadmapProgress(
  roadmapData: RoadmapData,
  progressData: UserProgressData
) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const statusMap = useMemo(() => {
    const map = new Map<string, TopicStatus>();
    progressData.user_progress.topics.forEach(t => {
      map.set(t.topic_id, t.status);
    });
    return map;
  }, [progressData]);

  const activeVariant = useMemo(() => {
    if (!selectedVariantId) return null;
    return roadmapData.roadmap.variants.find(v => v.id === selectedVariantId) || null;
  }, [selectedVariantId, roadmapData]);

  const getTopicStatus = (topicId: string): TopicStatus => {
    return statusMap.get(topicId) || 'not_started';
  };

  const isPhaseSkipped = (phaseId: string) => {
    if (!activeVariant) return false;
    return activeVariant.skip_phases.includes(phaseId);
  };

  const isTopicSkipped = (topicId: string) => {
    if (!activeVariant) return false;
    return activeVariant.skip_topics.includes(topicId);
  };

  return {
    getTopicStatus,
    percentComplete: progressData.user_progress.percent_complete,
    selectedVariantId,
    setSelectedVariantId,
    isPhaseSkipped,
    isTopicSkipped
  };
}
