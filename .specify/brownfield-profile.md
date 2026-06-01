# Project Profile

## Tech Stack
| Category | Detected |
|----------|----------|
| **Primary language** | Python (backend), TypeScript (shared/mobile) |
| **Backend** | FastAPI, Uvicorn, Pydantic, Motor (MongoDB) |
| **AI/ML** | LangGraph, LangChain, LangChain-OpenAI |
| **Mobile** | Expo/React Native (inferred from app structure) |
| **Shared** | TypeScript API contracts |
| **Database** | MongoDB (via Motor) |
| **Auth** | python-jose (JWT) |
| **Testing** | pytest (backend tests/ directory) |
| **Containerization** | Docker (backend/Dockerfile, docker/) |

## Architecture
- **Pattern**: Frontend (Mobile) + Backend (API) + Shared Contracts
- **Backend**: `backend/` — FastAPI REST API with AI agent pipeline
- **Mobile**: `mobile/` — Expo/React Native app with (tabs) and (auth) routes
- **Shared**: `shared/` — TypeScript API contract definitions
- **Database**: MongoDB (async via Motor)
- **AI Pipeline**: LangGraph-based agent with service/pipeline architecture

## Module Map
| Module | Path | Purpose | Dependencies |
|--------|------|---------|-------------|
| Backend API | `backend/app/` | FastAPI REST + AI Agent | MongoDB, OpenAI |
| Mobile App | `mobile/app/` | React Native UI | Backend API |
| Shared Types | `shared/` | API contract definitions | — |
| Specs | `specs/` | Feature specifications | — |
| Docker | `docker/` | Container orchestration | Backend, MongoDB |

## Backend Structure
| Directory | Purpose |
|-----------|---------|
| `api/` | Route handlers |
| `auth/` | Authentication (JWT) |
| `core/` | Core configuration/utilities |
| `db/` | Database models/connections |
| `models/` | Pydantic schemas |
| `services/` | Business logic |
| `agent/` | AI agent logic |
| `graph/` | LangGraph workflow |
| `pipeline/` | Data processing pipeline |

## Mobile Architecture (Obytes Template Pattern)
- **Framework**: Expo SDK with Expo Router (file-based routing)
- **Styling**: TailwindCSS (NativeWind v4)
- **State Management**: Zustand + React Query (TanStack Query)
- **Forms**: TanStack Form + Zod validation
- **Storage**: react-native-mmkv for secure local storage
- **Navigation**: Expo Router with (tabs) and (auth) route groups
- **Testing**: Jest + React Testing Library (unit), Maestro (E2E)
- **Git Hooks**: Husky + lint-staged + commitlint
- **CI/CD**: GitHub Actions + EAS Build
- **i18n**: i18next for localization
- **Animations**: react-native-reanimated + moti
- **Theme**: Space Exploration (dark mode only)

## Space Exploration Design System
- **Theme**: Dark mode only, space exploration metaphor
- **Design Guide**: `mobile/DESIGN_GUIDE.md`
- **Theme Files**: `mobile/src/theme/` (colors, typography, spacing, animations)
- **Core Components**: `mobile/src/components/ui/` (StarField, OrbitProgress, PlanetCard, NebulaButton, HolographicCard)
- **Feature Components**: `mobile/src/features/*/components/`
- **Color Palette**: Deep space blacks, cosmic purples, aurora greens, solar golds
- **Animation Style**: Subtle, purposeful, respects reduced motion preferences
- **Metaphors**: Learning = exploration, progress = orbits, courses = planets, roadmap = constellation

## Mobile Module Structure (Obytes Convention)
| Directory | Purpose |
|-----------|---------|
| `mobile/src/app/` | Expo Router pages (file-based routing) |
| `mobile/src/features/` | Feature modules (business logic + UI) |
| `mobile/src/components/ui/` | Shared UI components (buttons, inputs, etc.) |
| `mobile/src/lib/` | Utilities, API client, config |
| `mobile/src/translations/` | i18n locale files |
| `mobile/src/global.css` | TailwindCSS global styles |

## Conventions
- **File naming**: snake_case (Python backend), kebab-case or camelCase (TypeScript)
- **Mobile**: PascalCase for components, camelCase for utilities, kebab-case for files
- **Branch pattern**: Not yet established (only initial commit)
- **Commit style**: Conventional Commits (via commitlint)
- **Test location**: `backend/tests/` (pytest), `mobile/__tests__/` (Jest), `mobile/.maestro/` (E2E)
- **Spec location**: `specs/` (numbered markdown specs)

## Existing Governance
- ✅ AGENTS.md (AI agent instructions)
- ✅ .specify/ (spec-kit setup)
- ✅ .env.example
- ✅ Docker configuration
- ❌ CONTRIBUTING.md
- ❌ ARCHITECTURE.md
- ❌ CI/CD pipeline

## Recommendations
- Constitution should enforce: snake_case (backend), camelCase (shared TypeScript)
- Mobile should follow Obytes template conventions (Expo Router, TailwindCSS, feature-based architecture)
- Feature specs should map to backend API + mobile contract split
- AI agent features should follow LangGraph workflow patterns
- Use existing `specs/` directory for all new specifications
- Mobile features should reference shared API contracts
- Mobile development should use: Zustand (state), React Query (data fetching), TanStack Form (forms), Zod (validation)
