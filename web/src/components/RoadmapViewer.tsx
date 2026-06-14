import React, { useState } from 'react';
import type { RoadmapData, UserProgressData, Topic } from '../types';
import { PhaseSection } from './PhaseSection';
import { useRoadmapProgress } from '../hooks/useRoadmapProgress';
import { TopicDetailsPanel } from './TopicDetailsPanel';
import { RoadmapEdge } from './RoadmapEdge';
import { VariantSelector } from './VariantSelector';

interface RoadmapViewerProps {
  data: RoadmapData;
  progressData?: UserProgressData;
  onMarkComplete?: (topicId: string) => void;
  markingComplete?: boolean;
}

export const RoadmapViewer: React.FC<RoadmapViewerProps> = ({ 
  data, 
  progressData,
  onMarkComplete,
  markingComplete
}) => {
  const { roadmap } = data;
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  
  const { 
    getTopicStatus, 
    selectedVariantId, 
    setSelectedVariantId,
    isPhaseSkipped,
    isTopicSkipped
  } = useRoadmapProgress(
    data, 
    progressData || { user_progress: { topics: [] } } as unknown as UserProgressData
  );

  const visiblePhases = roadmap.phases.filter(p => !isPhaseSkipped(p.id));

  // Also filter edges where either from or to is skipped
  const visibleEdges = roadmap.topic_graph.filter(edge => 
    !isTopicSkipped(edge.from) && !isTopicSkipped(edge.to)
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 relative flex roadmap-scroll-area">
      <div className="flex-grow">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-white mb-4">{roadmap.title}</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">{roadmap.description}</p>
          
          <VariantSelector 
            variants={roadmap.variants} 
            selectedVariantId={selectedVariantId}
            onSelect={setSelectedVariantId}
          />
        </div>

        {visibleEdges.map((edge, idx) => (
          <RoadmapEdge key={`edge-${idx}`} fromId={edge.from} toId={edge.to} type={edge.type} />
        ))}

        <div className="relative">
          {visiblePhases.map((phase) => (
            <PhaseSection
              key={phase.id}
              phase={phase}
              getTopicStatus={getTopicStatus}
              isTopicSkipped={isTopicSkipped}
              onTopicClick={setSelectedTopic}
            />
          ))}
        </div>
      </div>
      
      <TopicDetailsPanel 
        topic={selectedTopic} 
        onClose={() => setSelectedTopic(null)} 
        onMarkComplete={onMarkComplete}
        isCompleted={selectedTopic ? (getTopicStatus(selectedTopic.id) === 'done' || getTopicStatus(selectedTopic.id) === 'completed') : false}
        markingComplete={markingComplete}
      />
    </div>
  );
};
