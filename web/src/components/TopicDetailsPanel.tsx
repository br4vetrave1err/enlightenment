import React from 'react';
import type { Topic } from '../types';
import { ResourceLink } from './ResourceLink';

interface TopicDetailsPanelProps {
  topic: Topic | null;
  onClose: () => void;
  isLoading?: boolean;
  error?: string;
  onMarkComplete?: (topicId: string) => void;
  isCompleted?: boolean;
  markingComplete?: boolean;
  // Branching props
  branchChildNodes?: any[];
  disabledNodeIds?: Set<string>;
  onToggleBranch?: (nodeId: string) => void;
}

export const TopicDetailsPanel: React.FC<TopicDetailsPanelProps> = ({ 
  topic, 
  onClose,
  isLoading = false,
  error = '',
  onMarkComplete,
  isCompleted = false,
  markingComplete = false,
  branchChildNodes = [],
  disabledNodeIds,
  onToggleBranch
}) => {
  if (!topic) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[520px] max-w-full bg-[#0d0d1d]/97 backdrop-blur-md shadow-2xl border-l border-cyan-500/20 z-[1000] transform transition-transform overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-cyan-400">{topic.name}</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white focus:outline-none p-1 rounded hover:bg-white/5 transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48 text-slate-400 italic">
            Decrypting transmission...
          </div>
        ) : error ? (
          <div className="text-red-400 p-4 bg-red-950/20 border border-red-500/20 rounded-lg">
            {error}
          </div>
        ) : (
          <>
            <div className="prose prose-invert max-w-none text-slate-200 mb-6 whitespace-pre-wrap leading-relaxed">
              {topic.description}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-white/5 text-slate-300 px-2.5 py-1 rounded text-xs capitalize border border-white/10">
                {topic.difficulty}
              </span>
              <span className="bg-white/5 text-slate-300 px-2.5 py-1 rounded text-xs capitalize border border-white/10">
                {topic.type}
              </span>
              <span className="bg-white/5 text-slate-300 px-2.5 py-1 rounded text-xs border border-white/10">
                ~{topic.estimated_hours}h
              </span>
            </div>

            {onMarkComplete && (
              <div className="mb-6">
                <button
                  onClick={() => onMarkComplete(topic.id)}
                  disabled={markingComplete || isCompleted}
                  className={`w-full py-3 px-4 rounded-lg font-bold text-sm tracking-wide transition-all ${
                    isCompleted 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                      : 'bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 active:scale-[0.98]'
                  }`}
                >
                  {isCompleted ? '✓ Mission Complete' : markingComplete ? 'Saving Progress...' : 'Mark as Complete'}
                </button>
              </div>
            )}

            {/* Branch selector widget */}
            {branchChildNodes && branchChildNodes.length > 1 && onToggleBranch && disabledNodeIds && (
              <div className="mb-8 p-4 bg-pink-950/15 border border-pink-500/20 rounded-xl">
                <h3 className="text-pink-400 font-semibold mb-2">🛰️ Choose Your Path</h3>
                <p className="text-xs text-slate-400 mb-3">This node splits into multiple tracks. Choose the ones you wish to follow:</p>
                <div className="flex flex-col gap-2">
                  {branchChildNodes.map((child: any) => {
                    const isEnabled = !disabledNodeIds.has(child.node_id);
                    return (
                      <button
                        key={child.node_id}
                        className={`flex items-center justify-between p-3 rounded-lg border text-sm font-medium transition-all ${
                          isEnabled 
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' 
                            : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:bg-slate-800'
                        }`}
                        onClick={() => onToggleBranch(child.node_id)}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-cyan-400 shadow-sm shadow-cyan-400' : 'bg-slate-600'}`} />
                          <span>{child.title}</span>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded bg-black/30">
                          {isEnabled ? 'Active' : 'Skipped'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold text-pink-400 mb-4">Resources</h3>
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
          </>
        )}
      </div>
    </div>
  );
};
