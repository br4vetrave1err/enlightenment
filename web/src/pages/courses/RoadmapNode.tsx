import { Handle, Position } from '@xyflow/react';
import { Check, Lock } from 'lucide-react';

interface NodeData {
  label: string;
  status: 'completed' | 'unlocked' | 'locked';
  onClick: (id: string) => void;
}

export default function RoadmapNode({ id, data }: { id: string; data: NodeData }) {
  const isCompleted = data.status === 'completed';
  const isUnlocked = data.status === 'unlocked';
  const isLocked = data.status === 'locked';

  let bgColor = '#2a2a40';
  let borderColor = '#444';
  let textColor = 'var(--text-muted)';
  let shadow = 'none';

  if (isCompleted) {
    bgColor = 'var(--starlight)';
    borderColor = '#fff';
    textColor = '#000';
    shadow = '0 0 15px rgba(0,212,255,0.4)';
  } else if (isUnlocked) {
    bgColor = 'var(--nebula)';
    borderColor = '#fff';
    textColor = '#fff';
    shadow = '0 0 15px rgba(255,0,255,0.4)';
  }

  return (
    <div
      onClick={() => {
        if (!isLocked) data.onClick(id);
      }}
      style={{
        padding: '12px 20px',
        borderRadius: '8px',
        background: bgColor,
        border: `2px solid ${borderColor}`,
        boxShadow: shadow,
        color: textColor,
        fontWeight: 'bold',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        minWidth: '150px',
        justifyContent: 'center',
        transition: 'transform 0.2s',
        opacity: isLocked ? 0.7 : 1,
      }}
      onMouseOver={(e) => {
        if (!isLocked) e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
      
      {isCompleted && <Check size={18} color="#000" />}
      {isLocked && <Lock size={16} />}
      <span>{data.label}</span>

      <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
    </div>
  );
}
