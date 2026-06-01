<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan

## Project Configuration

This project uses **brownfield** mode as the default initialization preset.
The brownfield profile is located at `.specify/brownfield-profile.md` and contains
the detected architecture, tech stack, and conventions.

### Tech Stack
- **Backend**: FastAPI (Python) with MongoDB (Motor), LangGraph AI agents
- **Mobile**: Expo/React Native (TypeScript) - Obytes Template Pattern
  - Expo Router (file-based routing)
  - TailwindCSS (NativeWind v4)
  - Zustand (state management)
  - React Query (data fetching)
  - TanStack Form + Zod (forms + validation)
  - react-native-mmkv (local storage)
  - i18next (localization)
  - react-native-reanimated + moti (animations)
  - Husky + lint-staged + commitlint (git hooks)
  - GitHub Actions + EAS Build (CI/CD)
- **Shared**: TypeScript API contracts
- **Specs**: Located in `specs/` directory (numbered markdown files)
- **Design System**: Space Exploration Theme (dark mode only)

### Conventions
- Backend: snake_case, pytest tests in `backend/tests/`
- Mobile/Shared: camelCase, TypeScript
- Mobile components: PascalCase for components, kebab-case for files
- Feature branches follow sequential numbering

### Mobile Architecture (Obytes Template)
The mobile app follows the [Obytes React Native Template](https://github.com/obytes/react-native-template-obytes) structure:

```
mobile/
├── src/
│   ├── app/                    # Expo Router pages (file-based routing)
│   │   ├── (auth)/            # Auth route group
│   │   └── (tabs)/            # Tab navigation group
│   ├── features/              # Feature modules (business logic + UI)
│   ├── components/ui/         # Shared UI components
│   ├── lib/                   # Utilities, API client, config
│   ├── translations/          # i18n locale files
│   └── global.css             # TailwindCSS global styles
├── __tests__/                 # Jest unit tests
└── .maestro/                  # E2E test flows
```

### Brownfield Workflow
1. New features should reference existing module structure
2. API features → `backend/app/api/`
3. AI agent features → `backend/app/agent/` + `backend/app/graph/`
4. Mobile features → `mobile/src/features/` (feature modules)
5. Mobile routes → `mobile/src/app/` (Expo Router pages)
6. Mobile UI components → `mobile/src/components/ui/`
7. Shared contracts → `shared/`

### Space Exploration Design System
The mobile app uses a space exploration theme (dark mode only).

**Theme Files:**
- Colors: `mobile/src/theme/colors.ts`
- Typography: `mobile/src/theme/typography.ts`
- Spacing: `mobile/src/theme/spacing.ts`
- Animations: `mobile/src/theme/animations.ts`
- Design Guide: `mobile/DESIGN_GUIDE.md`

**Core UI Components:**
- `StarField` - Animated star background
- `OrbitProgress` - Circular progress with orbital glow
- `PlanetCard` - Course cards as explorable planets
- `NebulaButton` - Glowing action buttons
- `HolographicCard` - Glass-morphism containers

**Design Metaphors:**
- Learning = Space exploration
- Progress = Orbital rings
- Courses = Planets to explore
- Roadmap = Constellation graph
- Mastery = Star brightness

**Rules:**
- Dark mode only (no light mode variant)
- Subtle animations over dramatic effects
- Use theme colors from `mobile/src/theme/colors.ts`
- Follow animation duration scale (instant/fast/normal/slow/deliberate)
- Respect reduced motion preferences
- Maintain WCAG AA contrast ratios

<!-- SPECKIT END -->
