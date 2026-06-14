import React from 'react';
import type { Resource } from '../types';

interface ResourceLinkProps {
  resource: Resource;
}

export const ResourceLink: React.FC<ResourceLinkProps> = ({ resource }) => {
  return (
    <a
      href={resource.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 border border-slate-200 rounded-lg hover:border-primary hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-slate-800 text-sm">{resource.title}</h4>
          <span className="text-xs text-slate-500 capitalize">{resource.type}</span>
        </div>
        {resource.free && (
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
            Free
          </span>
        )}
      </div>
      {resource.duration_minutes && (
        <div className="text-xs text-slate-400 mt-2">
          ⏱ {resource.duration_minutes} mins
        </div>
      )}
    </a>
  );
};
