# Agar (አጋር) - Project Guide

## What is this?
Agar is an AI-powered matchmaking platform combining modern dating with cultural compatibility intelligence (astrology, palmistry, behavioral AI). Trilingual: English, Amharic, Spanish.

## Tech Stack
- **Monorepo**: Turborepo with npm workspaces
- **Web**: Next.js 15, React 19, Tailwind CSS v4
- **Mobile**: React Native (Expo SDK 52)
- **API**: Express 5, Drizzle ORM, PostgreSQL, Redis
- **Matching Engine**: TypeScript (Western/Vedic/Chinese astrology + behavioral AI)
- **Real-time**: Socket.io
- **Auth**: JWT + OAuth2

## Project Structure
```
apps/web        → Next.js web app (port 3000)
apps/mobile     → React Native/Expo mobile app
apps/api        → Express backend API (port 4000)
packages/shared → Shared TypeScript types and constants
packages/i18n   → Internationalization (en/am/es)
packages/matching-engine → Compatibility algorithms
packages/ui     → Shared UI components
services/ml-service → Python ML service (future)
```

## Commands
```bash
npm run dev           # Start all apps
npm run dev:web       # Start web app only
npm run dev:api       # Start API only
npm run build         # Build all packages
npm run test          # Run all tests
npm run lint          # Lint all packages
```

## Database
- Uses Drizzle ORM with PostgreSQL
- Schema: `apps/api/src/db/schema.ts`
- Migrations: `npx drizzle-kit generate` then `npx drizzle-kit migrate`

## Environment
- Copy `apps/api/.env.example` to `apps/api/.env`
- PostgreSQL on localhost:5432/agar
- Redis on localhost:6379

## Key Architecture Decisions
1. Monorepo for code sharing between web/mobile/api
2. Matching engine is a pure TypeScript package (no external deps) for portability
3. i18n uses i18next with JSON locale files
4. Database-first approach with Drizzle (type-safe SQL)
5. WebSocket for real-time chat and presence
6. Compatibility scores cached in DB, recalculated on demand
