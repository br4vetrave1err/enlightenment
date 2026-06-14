import React from 'react';
import type { Topic } from '../types';

interface RoadmapNodeProps {
  topic: Topic;
  status?: string;
  onClick?: (topic: Topic) => void;
}

export const RoadmapNode: React.FC<RoadmapNodeProps> = ({ topic, status = 'not_started', onClick }) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'done':
        return 'border-secondary bg-emerald-50';
      case 'in_progress':
        return 'border-primary bg-blue-50';
      case 'skipped':
        return 'border-slate-300 bg-slate-100 opacity-60';
      default:
        return 'border-slate-300 hover:border-primary bg-white';
    }
  };

  return (
    <button
      className={`relative z-10 p-4 w-48 text-left border-2 rounded-xl cursor-pointer transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${getStatusClasses()}`}
      onClick={() => onClick && onClick(topic)}
      data-testid={`node-${topic.id}`}
      aria-label={`Topic: ${topic.name}`}
    >
      <div className="text-sm font-semibold text-slate-800">{topic.name}</div>
      <div className="text-xs text-slate-500 mt-1 line-clamp-2">{topic.description}</div>
    </button>
  );
};
