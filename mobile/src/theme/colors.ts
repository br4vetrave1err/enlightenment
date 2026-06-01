export const spaceColors = {
  // Background layers (dark mode only)
  void: '#050814',
  cosmos: '#0a0e27',
  nebula: '#1a1f4d',
  deepSpace: '#12163a',

  // Text colors
  starlight: '#f0f4ff',
  starlightMuted: '#a0a8d0',
  starlightDim: '#6b72a0',

  // Accent colors
  solar: '#ffd700',
  mars: '#ff4500',
  cosmic: '#6b3fa0',
  aurora: '#00ff88',
  galaxy: '#ff6b9d',
  nebulaBlue: '#4a90d9',

  // Status colors
  locked: '#2a2d5e',
  available: '#3d4178',
  inProgress: '#4a6fa5',
  completed: '#2ecc71',

  // UI elements
  border: 'rgba(240, 244, 255, 0.1)',
  borderGlow: 'rgba(107, 63, 160, 0.3)',
  overlay: 'rgba(5, 8, 20, 0.8)',
  glass: 'rgba(26, 31, 77, 0.6)',
} as const

export type SpaceColor = keyof typeof spaceColors
