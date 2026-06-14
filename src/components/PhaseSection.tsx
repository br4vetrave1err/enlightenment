import React from 'react';
import type { Phase } from '../types';
import { RoadmapNode } from './RoadmapNode';

interface PhaseSectionProps {
  phase: Phase;
  onTopicClick?: (topic: any) => void;
  getTopicStatus?: (topicId: string) => string;
  isTopicSkipped?: (topicId: string) => boolean;
}

export const PhaseSection: React.FC<PhaseSectionProps> = ({ phase, onTopicClick, getTopicStatus, isTopicSkipped }) => {
  const visibleTopics = phase.topics.filter(t => !isTopicSkipped || !isTopicSkipped(t.id));

  if (visibleTopics.length === 0) return null;

  return (
    <div className="relative mb-12" data-testid={`phase-${phase.id}`}>
      <div className="mb-6 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-slate-800">{phase.name}</h2>
        <p className="text-sm text-slate-500 mt-1">{phase.description}</p>
        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full mt-2 font-medium">
          {phase.duration}
        </span>
      </div>
      
      <div className="flex flex-col items-center space-y-8 relative">
        {visibleTopics.map(topic => (
          <div key={topic.id} className="relative">
            <RoadmapNode
              topic={topic}
              onClick={onTopicClick}
              status={getTopicStatus ? getTopicStatus(topic.id) : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
