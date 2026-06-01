export { spaceColors } from './colors'
export { typography } from './typography'
export { spacing, borderRadius, shadows } from './spacing'
export { animations } from './animations'

export type { SpaceColor } from './colors'

export const theme = {
  colors: spaceColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
} as const

export type Theme = typeof theme
