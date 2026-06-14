import React, { useEffect, useState, useRef } from 'react';

interface RoadmapEdgeProps {
  fromId: string;
  toId: string;
  type: string;
}

export const RoadmapEdge: React.FC<RoadmapEdgeProps> = ({ fromId, toId, type }) => {
  const [lineProps, setLineProps] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const ref = useRef<SVGLineElement>(null);

  useEffect(() => {
    const updateLine = () => {
      const fromEl = document.querySelector(`[data-testid="node-${fromId}"]`);
      const toEl = document.querySelector(`[data-testid="node-${toId}"]`);
      
      if (fromEl && toEl) {
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        
        // Use scroll position for absolute placement
        const scrollY = window.scrollY;
        
        setLineProps({
          x1: fromRect.left + fromRect.width / 2,
          y1: fromRect.bottom + scrollY,
          x2: toRect.left + toRect.width / 2,
          y2: toRect.top + scrollY
        });
      }
    };

    updateLine();
    window.addEventListener('resize', updateLine);
    return () => window.removeEventListener('resize', updateLine);
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
