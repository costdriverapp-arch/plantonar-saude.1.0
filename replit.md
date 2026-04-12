# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Plantonar Saúde (artifacts/plantonar-saude)
- **Type**: Expo mobile app (React Native)
- **Preview path**: /
- **Description**: Healthcare staffing platform connecting professionals (nurses, caregivers) with clients who need care for patients.

#### Architecture
- `app/(auth)/` — Authentication screens: welcome, login, register, forgot-password, terms
- `app/(professional)/` — Professional dashboard, vacancies, applications, notifications, profile
- `app/(client)/` — Client dashboard, my-vacancies, create-vacancy, vacancy-detail, profile
- `app/(admin)/` — Admin panel for user management
- `context/AuthContext.tsx` — Authentication state with AsyncStorage persistence
- `context/AppContext.tsx` — App state: vacancies, applications, notifications, credits
- `components/ui/` — Shared components: CustomModal, GradientHeader, AppInput, VacancyCard
- `types/index.ts` — All TypeScript types

#### User Roles
- **Professional**: Blue gradient headers, 1 daily credit, apply to vacancies
- **Client**: Green gradient headers, create vacancies, manage applications
- **Admin**: Purple gradient headers, manage all users and statuses

#### Key Features
- 3 user types with separate dashboards and navigation
- Credit system: 1 free daily credit per professional (non-cumulative)
- Application flow: apply, counter-proposal, accept/reject cycle
- Notifications: vacancy filled, accepted, rejected
- Custom modals (no native Alert)
- Fade transitions between screens
- Input focus chain (Enter advances to next input)
- Currency auto-formatting (R$ X.XXX,XX)
- All data stored in AsyncStorage

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
