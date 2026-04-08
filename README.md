# Agar (አጋር) - AI-Powered Matchmaking

A mobile-first matchmaking platform combining modern dating with cultural compatibility intelligence. Trilingual: English, Amharic, Spanish.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + npm workspaces |
| Mobile | React Native 0.81 (Expo SDK 54, React 19) |
| Web | Next.js 15, React 19, Tailwind CSS v4 |
| API | Express 5, Drizzle ORM, PostgreSQL, Redis |
| Matching | TypeScript (Western/Vedic/Chinese astrology + palmistry + behavioral AI) |
| Real-time | Socket.io |
| Auth | JWT + OAuth2 |

## Recent Changes & Enhancement Notes

### Palm Scanner — Guided Visual Picker (current)
- **What**: Users photograph their palm, then identify their heart/head/life/fate lines by comparing their photo against highlighted reference diagrams
- **How**: Step-by-step flow with SVG hand illustrations that highlight one line at a time. User selects the option that best matches their line shape
- **Zero external deps**: No API calls, no ML models, works 100% offline
- **Feeds into**: Existing `palmistryCompatibility()` engine for matching scores
- **Enhancement opportunities**:
  - On-device edge detection (OpenCV/TFLite) to auto-highlight lines in the user's photo
  - MediaPipe Hands for landmark detection as a pre-filter
  - Better SVG hand — current one is functional but could use a professional illustrator pass
  - Animated transitions between steps
  - Palm line overlay drawn on top of user's captured photo

### Points Economy & Gift Shop
- Virtual currency (Agar Points) earned through engagement
- Gift shop with purchasable items via Stripe
- Chat gifts — send animated gifts in real-time conversations

### Compatibility Scoring
- Multi-engine scoring: Western/Vedic/Chinese astrology + palmistry + behavioral AI
- Weighted composite scores displayed on discover cards
- Per-line palmistry compatibility (heart 50%, head 25%, life 25%)

### Palmistry Engine
- Full compatibility matrices for heart, head, life, and fate lines
- Based on traditional Chinese palmistry classification
- Each line type has personality descriptions and pairwise compatibility insights

## Project Structure

```
apps/mobile     → React Native/Expo (primary client — mobile-first)
apps/web        → Next.js web app (port 3000)
apps/api        → Express backend API (port 4000)
packages/shared → Shared TypeScript types and constants
packages/i18n   → Internationalization (en/am/es)
packages/matching-engine → Compatibility algorithms
packages/ui     → Shared UI components
```

## Getting Started

```bash
npm install               # Install all dependencies
cp apps/api/.env.example apps/api/.env  # Configure environment
npm run dev               # Start all apps
npm run dev:api           # API only (port 4000)
npm run dev:web           # Web only (port 3000)
```

## Mobile Development

```bash
cd apps/mobile
npx expo start            # Start Expo dev server
npx expo run:ios          # Run on iOS simulator
npx expo run:android      # Run on Android emulator
```

## Database

- Drizzle ORM with PostgreSQL (localhost:5432/agar)
- `npx drizzle-kit generate` → generate migrations
- `npx drizzle-kit migrate` → apply migrations
