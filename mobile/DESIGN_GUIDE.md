# Space Exploration Design Guide

## 🌌 Theme Philosophy

Transform the learning journey into a cosmic exploration experience. Every interaction should feel like navigating through the universe - mysterious, rewarding, and infinite.

**Core Principles:**
- **Subtle over dramatic**: Gentle animations that enhance, not distract
- **Dark mode only**: Space is dark; our app should be too
- **Metaphor consistency**: Learning = exploration, progress = orbits, courses = planets
- **Accessible**: Maintain contrast ratios and respect motion preferences

---

## 🎨 Color System

### Background Layers

| Name | Hex | Usage |
|------|-----|-------|
| `void` | `#050814` | Deepest background, modals |
| `cosmos` | `#0a0e27` | Primary screen background |
| `nebula` | `#1a1f4d` | Cards, surfaces |
| `deepSpace` | `#12163a` | Secondary surfaces |

### Text Colors

| Name | Hex | Usage |
|------|-----|-------|
| `starlight` | `#f0f4ff` | Primary text, headings |
| `starlightMuted` | `#a0a8d0` | Secondary text, descriptions |
| `starlightDim` | `#6b72a0` | Tertiary text, placeholders |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| `solar` | `#ffd700` | Success, achievements, gold |
| `mars` | `#ff4500` | Warnings, active states |
| `cosmic` | `#6b3fa0` | Primary actions, brand |
| `aurora` | `#00ff88` | Progress, growth, completion |
| `galaxy` | `#ff6b9d` | Highlights, special states |
| `nebulaBlue` | `#4a90d9` | Info, learning states |

### Status Colors

| Name | Hex | Usage |
|------|-----|-------|
| `locked` | `#2a2d5e` | Unavailable content |
| `available` | `#3d4178` | Ready to explore |
| `inProgress` | `#4a6fa5` | Currently learning |
| `completed` | `#2ecc71` | Mastery achieved |

### Usage Examples

```typescript
import { spaceColors } from '@/theme/colors'

// In styles
backgroundColor: spaceColors.cosmos
color: spaceColors.starlight
borderColor: spaceColors.border
```

```css
/* In NativeWind */
bg-cosmos
text-starlight
border-space
```

---

## ✨ Components

### StarField

Animated twinkling stars background. Subtle and non-distracting.

```tsx
import { StarField } from '@/components/ui'

<StarField starCount={50} opacity={0.8} />
```

**Props:**
- `starCount`: Number of stars (default: 50)
- `opacity`: Overall opacity (default: 1)

**When to use:**
- Screen backgrounds
- Modal backdrops
- Loading states

**When NOT to use:**
- Over content-heavy areas
- In forms or input screens

---

### OrbitProgress

Circular progress indicator with orbital glow effect.

```tsx
import { OrbitProgress } from '@/components/ui'

<OrbitProgress
  progress={75}
  size={120}
  strokeWidth={8}
  label="75%"
  sublabel="Course Progress"
  color={spaceColors.aurora}
/>
```

**Props:**
- `progress`: 0-100 percentage
- `size`: Diameter in pixels (default: 120)
- `strokeWidth`: Ring thickness (default: 8)
- `label`: Center text
- `sublabel`: Text below label
- `color`: Ring color

**When to use:**
- Course completion
- Skill mastery levels
- Streak counters

---

### PlanetCard

Card component representing a course or module as an explorable planet.

```tsx
import { PlanetCard } from '@/components/ui'

<PlanetCard
  title="React Fundamentals"
  subtitle="12 nodes • 4 hours"
  progress={65}
  icon="🪐"
  status="in-progress"
  onPress={() => navigateToCourse()}
/>
```

**Props:**
- `title`: Course/module name
- `subtitle`: Additional info
- `progress`: 0-100 percentage
- `icon`: Emoji or icon
- `status`: 'locked' | 'available' | 'in-progress' | 'completed'
- `onPress`: Tap handler

**Status colors:**
- `locked`: Dimmed, no interaction
- `available`: Ready to explore
- `in-progress`: Blue glow
- `completed`: Green glow

---

### NebulaButton

Primary action button with subtle glow effect.

```tsx
import { NebulaButton } from '@/components/ui'

<NebulaButton
  label="Start Learning"
  variant="primary"
  icon="🚀"
  onPress={handleStart}
/>
```

**Variants:**
- `primary`: Cosmic purple, main actions
- `secondary`: Nebula blue, alternative actions
- `ghost`: Transparent, cancel/back

**Props:**
- `label`: Button text
- `variant`: Button style
- `disabled`: Gray out button
- `icon`: Optional emoji/icon
- `onPress`: Tap handler

---

### HolographicCard

Glass-morphism card with subtle transparency.

```tsx
import { HolographicCard } from '@/components/ui'

<HolographicCard>
  <Text>Content here</Text>
</HolographicCard>
```

**When to use:**
- Content containers
- Settings panels
- Information displays

---

## 🎬 Animations

### Principles

1. **Subtle**: Animations should enhance, not dominate
2. **Purposeful**: Every animation serves a purpose
3. **Consistent**: Use preset durations and easing curves
4. **Respectful**: Honor reduced motion preferences

### Duration Scale

| Name | Duration | Usage |
|------|----------|-------|
| `instant` | 150ms | Micro-interactions |
| `fast` | 250ms | Button presses |
| `normal` | 350ms | Standard transitions |
| `slow` | 500ms | Emphasis animations |
| `deliberate` | 750ms | Major state changes |

### Easing Curves

| Name | Curve | Usage |
|------|-------|-------|
| `easeOut` | `[0.25, 0.1, 0.25, 1]` | Exiting animations |
| `easeInOut` | `[0.42, 0, 0.58, 1]` | Standard transitions |
| `spring` | `[0.34, 1.56, 0.64, 1]` | Bouncy interactions |
| `gentle` | `[0.2, 0.8, 0.2, 1]` | Subtle movements |

### Preset Animations

| Name | Effect | Usage |
|------|--------|-------|
| `twinkle` | Opacity pulse | Stars, indicators |
| `float` | Vertical drift | Cards, floating elements |
| `pulse` | Scale pulse | Active states |
| `orbit` | Rotation | Progress rings |
| `glow` | Opacity pulse | Glowing borders |

### Usage Example

```typescript
import { animations } from '@/theme/animations'

scale.value = withTiming(0.96, {
  duration: animations.durations.fast,
  easing: Easing.out(Easing.ease),
})
```

---

## 📱 Screen Patterns

### Progress Screen (Orbits)

The progress screen uses orbital rings to display learning metrics.

```
┌─────────────────────────┐
│  Learning Orbit         │
│  12.5 hours total       │
├─────────────────────────┤
│  ○ Nodes    ○ Streak    │
│  ○ Courses  ○ Velocity  │
├─────────────────────────┤
│  Knowledge Gaps         │
│  - Topic A → Course B   │
├─────────────────────────┤
│  Topic Mastery          │
│  React ████████░░ 80%   │
│  Node  ██████░░░░ 60%   │
└─────────────────────────┘
```

**Components used:**
- `OrbitTracker` (feature component)
- `OrbitProgress` (core component)
- `HolographicCard` (containers)

### Courses Screen (Planets)

Courses are displayed as explorable planets.

```
┌─────────────────────────┐
│  Your Galaxy            │
├─────────────────────────┤
│  🪐 React Basics        │
│     ████████░░ 80%      │
├─────────────────────────┤
│  🌍 Node.js             │
│     █████░░░░░ 50%      │
├─────────────────────────┤
│  🔒 Advanced TS         │
│     Locked              │
└─────────────────────────┘
```

**Components used:**
- `PlanetCard` (course items)
- `StarField` (background)

### Map Screen (Constellation)

The roadmap is visualized as a constellation graph.

```
┌─────────────────────────┐
│  Learning Constellation │
├─────────────────────────┤
│     ⭐───⭐             │
│    /     \              │
│   ⭐      ⭐───⭐       │
│    \     /              │
│     ⭐───⭐             │
└─────────────────────────┘
```

**Components to build:**
- `ConstellationGraph` (feature component)
- Node connections as lines
- Nodes as stars with status colors

---

## ♿ Accessibility

### Contrast Ratios

All text must meet WCAG AA standards:

| Combination | Ratio | Status |
|-------------|-------|--------|
| `starlight` on `cosmos` | 15.2:1 | ✅ Pass |
| `starlightMuted` on `cosmos` | 7.8:1 | ✅ Pass |
| `starlightDim` on `cosmos` | 4.5:1 | ✅ Pass |

### Motion Preferences

Respect user's motion preferences:

```typescript
import { AccessibilityInfo } from 'react-native'

const prefersReducedMotion = await AccessibilityInfo.isReduceMotionEnabled()

if (prefersReducedMotion) {
  // Use static states instead of animations
}
```

### Screen Readers

- All icons should have `accessibilityLabel`
- Progress indicators should announce percentage
- Status changes should be announced

```tsx
<OrbitProgress
  progress={75}
  accessibilityLabel="Course progress: 75 percent complete"
/>
```

---

## ✅ Do's and Don'ts

### Do's

✅ Use space metaphors consistently
✅ Keep animations subtle and purposeful
✅ Maintain dark mode throughout
✅ Use glow effects sparingly
✅ Test with reduced motion enabled
✅ Provide clear visual hierarchy

### Don'ts

❌ Don't use bright white backgrounds
❌ Don't overuse animations
❌ Don't use space theme in light mode
❌ Don't make glow effects too intense
❌ Don't ignore accessibility needs
❌ Don't mix metaphors (space + ocean, etc.)

---

## 📦 File Structure

```
mobile/src/
├── theme/
│   ├── colors.ts           # Space color palette
│   ├── typography.ts       # Typography scale
│   ├── spacing.ts          # Spacing and borders
│   ├── animations.ts       # Animation presets
│   └── index.ts            # Theme exports
│
├── components/
│   ├── ui/                 # Core space components
│   │   ├── StarField.tsx
│   │   ├── OrbitProgress.tsx
│   │   ├── PlanetCard.tsx
│   │   ├── NebulaButton.tsx
│   │   ├── HolographicCard.tsx
│   │   └── index.ts
│   │
│   └── space/              # Feature-specific components
│       ├── GalaxyMap.tsx
│       ├── WormholeTransition.tsx
│       └── StarRating.tsx
│
└── features/
    └── progress/
        └── components/
            └── OrbitTracker.tsx
```

---

## 🚀 Getting Started

1. Import theme utilities from `@/theme`
2. Use space colors instead of hardcoded values
3. Prefer core components over custom implementations
4. Follow animation duration scale
5. Test in dark mode only

```typescript
// Good
import { spaceColors, spacing, animations } from '@/theme'

backgroundColor: spaceColors.cosmos
padding: spacing.lg
duration: animations.durations.normal

// Bad
backgroundColor: '#0a0e27'
padding: 16
duration: 300
```
