import React, { useEffect, useState } from 'react';

interface RoadmapEdgeProps {
  fromId: string;
  toId: string;
  type: string;
}

export const RoadmapEdge: React.FC<RoadmapEdgeProps> = ({ fromId, toId, type }) => {
  const [lineProps, setLineProps] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });

  useEffect(() => {
    const updateLine = () => {
      const fromEl = document.querySelector(`[data-testid="node-${fromId}"]`);
      const toEl = document.querySelector(`[data-testid="node-${toId}"]`);
      
      if (fromEl && toEl) {
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        
        // Use scroll position relative to container
        const container = document.querySelector('.roadmap-scroll-area') || document.documentElement;
        const scrollY = container.scrollTop;
        const containerRect = container.getBoundingClientRect();
        
        setLineProps({
          x1: fromRect.left - containerRect.left + fromRect.width / 2 + container.scrollLeft,
          y1: fromRect.bottom - containerRect.top + scrollY,
          x2: toRect.left - containerRect.left + toRect.width / 2 + container.scrollLeft,
          y2: toRect.top - containerRect.top + scrollY
        });
      }
    };

    updateLine();
    // Wait a brief tick for DOM to render positions
    const timeout = setTimeout(updateLine, 100);

    window.addEventListener('resize', updateLine);
    const scrollContainer = document.querySelector('.roadmap-scroll-area');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateLine);
    }

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateLine);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', updateLine);
      }
    };
  }, [fromId, toId]);

  if (lineProps.x1 === 0) return null;

  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-visible">
      <line
        x1={lineProps.x1}
        y1={lineProps.y1}
        x2={lineProps.x2}
        y2={lineProps.y2}
        stroke={type === 'required' ? '#94a3b8' : '#cbd5e1'}
        strokeWidth="2"
        strokeDasharray={type === 'required' ? '0' : '4 4'}
        className="edge-animate"
      />
    </svg>
  );
};
