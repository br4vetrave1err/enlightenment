import React from 'react';
import type { Topic } from '../types';
import { ResourceLink } from './ResourceLink';

interface TopicDetailsPanelProps {
  topic: Topic | null;
  onClose: () => void;
}

export const TopicDetailsPanel: React.FC<TopicDetailsPanelProps> = ({ topic, onClose }) => {
  if (!topic) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-slate-200 z-50 transform transition-transform overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{topic.name}</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 focus:outline-none"
            aria-label="Close panel"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-slate-600 mb-6">{topic.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs capitalize">
            {topic.difficulty}
          </span>
          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs capitalize">
            {topic.type}
          </span>
          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
            ~{topic.estimated_hours}h
          </span>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Resources</h3>
          {topic.resources && topic.resources.length > 0 ? (
            <div className="space-y-3">
              {topic.resources.map(resource => (
                <ResourceLink key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No resources listed for this topic yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
