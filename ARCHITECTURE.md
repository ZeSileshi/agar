# Agar (አጋር) - System Architecture Specification
# Version: 1.0.0 | Date: 2026-04-07

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architectural Decision Records](#2-architectural-decision-records)
3. [Tech Stack Decisions](#3-tech-stack-decisions)
4. [Monorepo Structure](#4-monorepo-structure)
5. [Service Architecture](#5-service-architecture)
6. [Database Schema](#6-database-schema)
7. [API Contracts](#7-api-contracts)
8. [Compatibility Intelligence Engine](#8-compatibility-intelligence-engine)
9. [Infrastructure and Deployment](#9-infrastructure-and-deployment)
10. [Security Architecture](#10-security-architecture)
11. [Observability](#11-observability)

---

## 1. Executive Summary

Agar is a matchmaking platform with two distinct modes of operation:

- **Self-Match Mode**: Users browse and swipe on candidates directly (standard dating app UX).
- **Referral Mode**: Friends and family refer candidates on behalf of a user, preserving a culturally significant matchmaking tradition.

The compatibility engine blends multiple systems -- Western synastry, Vedic Kundli/Guna Milan, Chinese zodiac harmony, palmistry image analysis, and behavioral AI -- into a unified compatibility score. The platform serves English, Amharic, and Spanish speakers across mobile (React Native) and web (Next.js).

### Key Architectural Principles

1. **Modular monolith first, extract later** -- Start with a well-bounded monolith, split into services only when team or scaling pressures demand it.
2. **Domain boundaries enforced at the module level** -- Each domain (user, matching, messaging, referral) owns its data and exposes only a contract.
3. **Computation-heavy work is async** -- Astrology calculations and ML inference run on background queues, never in request paths.
4. **Mobile-first, offline-tolerant** -- Design every API interaction assuming unreliable connectivity.
5. **Cultural sensitivity in architecture** -- Referral workflows, Amharic script rendering, and culturally-aware matching are first-class concerns, not afterthoughts.

---

## 2. Architectural Decision Records

### ADR-001: Modular Monolith Over Microservices at Launch

**Status**: Accepted

**Context**: The team is small (likely 1-4 developers at launch). Microservices introduce operational overhead (service mesh, distributed tracing, independent deployments, data consistency) that would slow iteration. The domain boundaries are not yet fully validated.

**Decision**: Build a modular monolith in Node.js (Fastify) where each domain module (user, matching, messaging, referral, astrology) lives in its own package within the monorepo. Modules communicate through in-process function calls with typed interfaces. The Python ML service is the single exception -- it runs as a separate process because it has fundamentally different runtime requirements.

**Consequences**:
- Easier: Local development, debugging, deployment, transactional consistency
- Harder: Independent scaling of hot modules (matching engine), independent deployments
- Migration path: Each module already has a clean interface boundary, so extracting to a service later requires adding an HTTP/gRPC layer and a message queue, not a rewrite

### ADR-002: Fastify Over Express for the API Server

**Status**: Accepted

**Context**: Express is ubiquitous but has a middleware-heavy architecture that makes request lifecycle management implicit. Fastify provides schema-based validation, built-in serialization, plugin encapsulation (which maps well to domain modules), and measurably better throughput.

**Decision**: Use Fastify with the following plugins: @fastify/cors, @fastify/jwt, @fastify/websocket, @fastify/multipart (for palm image upload), @fastify/rate-limit.

**Consequences**:
- Easier: Input validation via JSON Schema, plugin encapsulation per domain, performance under load
- Harder: Smaller ecosystem of middleware compared to Express, steeper learning curve for devs only familiar with Express

### ADR-003: PostgreSQL as Primary Data Store with Redis for Caching and Queues

**Status**: Accepted

**Context**: The data model is highly relational (users have profiles, profiles have birth data, matches link two users with scores, referrals link three users). MongoDB was considered for profile flexibility, but PostgreSQL's JSONB columns provide schema-flexible storage within a relational model. This avoids the operational cost of running two databases.

**Decision**: PostgreSQL 16 as the single source of truth. Redis for: session caching, rate limiting, real-time presence, BullMQ job queues, and geolocation caching. No MongoDB.

**Consequences**:
- Easier: Single transactional database, JSONB for flexible profile fields, PostGIS for geolocation queries, strong consistency
- Harder: Very high write throughput on swipe history may need partitioning later
- Trade-off: We accept JSONB query limitations vs. MongoDB's query flexibility because the relational integrity of user-match-referral data is more valuable

### ADR-004: Python Sidecar for ML and Astrology Computation

**Status**: Accepted

**Context**: Astrology calculations (Swiss Ephemeris for planetary positions, Vedic dasha calculations) and ML inference (behavioral matching, palm image analysis) require Python libraries (pyswisseph, flatlib, TensorFlow/PyTorch, OpenCV). Running these in Node.js is not practical.

**Decision**: A single Python FastAPI service handles all computation-heavy work. It receives jobs from BullMQ (via a Redis-backed bridge) and returns results. It does not serve user-facing HTTP traffic directly -- the Node.js API is the only gateway.

**Consequences**:
- Easier: Use best-in-class Python ML/astrology libraries, independent scaling of compute
- Harder: Cross-language debugging, deployment of two runtimes, data serialization overhead
- Mitigation: Structured logging with correlation IDs, shared protobuf/JSON schemas in the monorepo

### ADR-005: Socket.io for Real-Time Communication

**Status**: Accepted

**Context**: Raw WebSockets require manual handling of reconnection, room management, presence, and fallback to long-polling. Socket.io provides all of these out of the box and has mature React Native support.

**Decision**: Use Socket.io (server: @fastify/socket.io, client: socket.io-client) for messaging, typing indicators, online presence, and match notifications.

**Consequences**:
- Easier: Automatic reconnection, room-based messaging, namespace isolation, React Native compatibility
- Harder: Socket.io is not a standard WebSocket and requires its own client library, slightly higher overhead than raw WS
- Note: If we later need to scale beyond a single server, we add the @socket.io/redis-adapter

### ADR-006: JWT with Refresh Token Rotation for Authentication

**Status**: Accepted

**Context**: The platform needs to authenticate across web and mobile clients. OAuth2 with social login (Google, Apple, Facebook) is required for onboarding friction reduction. Session-based auth is problematic for mobile clients.

**Decision**: Short-lived access tokens (15 min) + long-lived refresh tokens (30 days) stored in httpOnly cookies (web) and secure storage (mobile). Refresh token rotation -- each use of a refresh token invalidates it and issues a new pair. Social login via Passport.js strategies.

**Consequences**:
- Easier: Stateless API verification, mobile-friendly, social login support
- Harder: Token revocation requires a Redis blocklist for the access token window, refresh token theft detection needs rotation tracking

### ADR-007: Turborepo Monorepo with pnpm Workspaces

**Status**: Accepted

**Context**: The project has three apps (web, mobile, API) and shared code (types, UI components, i18n, matching algorithms). A monorepo keeps shared code in sync and enables atomic cross-app changes.

**Decision**: Turborepo for task orchestration (build, lint, test caching), pnpm for dependency management (strict, fast, disk-efficient).

**Consequences**:
- Easier: Shared TypeScript types, single CI pipeline, atomic refactors across apps
- Harder: CI cache management, build times grow with repo size (mitigated by Turborepo remote caching)

---

## 3. Tech Stack Decisions

### Summary Table

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Web Frontend | Next.js 15 (App Router) | SSR for SEO (landing/blog), RSC for performance, Vercel deployment |
| Mobile Frontend | React Native + Expo (SDK 52) | Shared React mental model, OTA updates, Expo modules for camera/notifications |
| API Server | Node.js 22 + Fastify 5 | Plugin encapsulation, schema validation, TypeScript-native, fast |
| Compute Service | Python 3.12 + FastAPI | Astrology libs (pyswisseph, flatlib), ML inference (PyTorch), image processing (OpenCV) |
| Primary Database | PostgreSQL 16 | Relational integrity, JSONB flexibility, PostGIS geolocation, row-level security |
| Cache / Queue | Redis 7 (via Upstash or self-hosted) | BullMQ job queues, session cache, rate limiting, Socket.io adapter |
| Real-time | Socket.io 4 | Reconnection, rooms, presence, React Native support |
| Auth | JWT + Passport.js (Google, Apple, Facebook) | Stateless, mobile-friendly, social login |
| File Storage | AWS S3 (or Cloudflare R2) | Profile photos, palm images, presigned uploads from client |
| Image Processing | Sharp (Node.js) + OpenCV (Python) | Thumbnail generation (Sharp), palm line detection (OpenCV) |
| Email | Resend or AWS SES | Transactional emails (verification, match notifications) |
| Push Notifications | Expo Push + Firebase Cloud Messaging | Unified push for iOS/Android via Expo |
| Search | PostgreSQL full-text search (upgrade to Meilisearch if needed) | Avoid premature Elasticsearch complexity |
| Monitoring | Sentry (errors) + Axiom or Grafana Cloud (logs/metrics) | Cost-effective observability |
| CI/CD | GitHub Actions + Turborepo Remote Cache | Monorepo-aware caching, parallel jobs |
| Hosting (API) | Railway or Fly.io | Container-based, easy PostgreSQL/Redis addons, autoscaling |
| Hosting (Web) | Vercel | Native Next.js support, edge functions, preview deployments |
| Hosting (ML) | Railway (GPU addon) or Modal | Python container with GPU access for palm image inference |

### What We Are NOT Using and Why

| Rejected Option | Reason |
|----------------|--------|
| MongoDB | JSONB in PostgreSQL covers our flexibility needs without a second database |
| GraphQL | REST is simpler for this domain; we do not have deeply nested query patterns |
| tRPC | Good for full-stack TypeScript but adds coupling between client and server that complicates mobile |
| Prisma | Drizzle ORM is lighter, closer to SQL, and has better performance for complex queries |
| Firebase/Supabase | Need full control over matching algorithms and data pipeline |
| Kubernetes | Overkill for launch; Railway/Fly.io provide container orchestration without the overhead |

---

## 4. Monorepo Structure

```
agar/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint, type-check, test on PR
│       ├── deploy-web.yml            # Vercel deploy on main merge
│       ├── deploy-api.yml            # Railway deploy on main merge
│       └── deploy-ml.yml             # ML service deploy
├── apps/
│   ├── web/                          # Next.js 15 (App Router)
│   │   ├── app/
│   │   │   ├── (auth)/               # Login, register, onboarding
│   │   │   ├── (dashboard)/          # Matches, messages, profile
│   │   │   ├── (referral)/           # Referral mode pages
│   │   │   ├── (marketing)/          # Landing page, blog, about
│   │   │   └── api/                  # Next.js API routes (BFF proxy)
│   │   ├── components/
│   │   ├── lib/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── mobile/                       # React Native + Expo
│   │   ├── app/                      # Expo Router (file-based routing)
│   │   │   ├── (auth)/
│   │   │   ├── (tabs)/               # Bottom tab navigator
│   │   │   │   ├── discover.tsx      # Swipe/browse
│   │   │   │   ├── matches.tsx       # Match list
│   │   │   │   ├── messages.tsx      # Chat list
│   │   │   │   ├── referrals.tsx     # Referral dashboard
│   │   │   │   └── profile.tsx       # User profile
│   │   │   └── _layout.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── app.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── api/                          # Fastify API server
│       ├── src/
│       │   ├── modules/              # Domain modules (the monolith's bounded contexts)
│       │   │   ├── user/
│       │   │   │   ├── user.routes.ts
│       │   │   │   ├── user.service.ts
│       │   │   │   ├── user.repository.ts
│       │   │   │   ├── user.schema.ts    # Fastify JSON Schema validation
│       │   │   │   └── user.types.ts
│       │   │   ├── profile/
│       │   │   │   ├── profile.routes.ts
│       │   │   │   ├── profile.service.ts
│       │   │   │   ├── profile.repository.ts
│       │   │   │   └── profile.schema.ts
│       │   │   ├── matching/
│       │   │   │   ├── matching.routes.ts
│       │   │   │   ├── matching.service.ts
│       │   │   │   ├── matching.repository.ts
│       │   │   │   ├── matching.queue.ts     # BullMQ job definitions
│       │   │   │   └── matching.worker.ts    # BullMQ worker
│       │   │   ├── messaging/
│       │   │   │   ├── messaging.routes.ts
│       │   │   │   ├── messaging.service.ts
│       │   │   │   ├── messaging.repository.ts
│       │   │   │   └── messaging.socket.ts   # Socket.io handlers
│       │   │   ├── referral/
│       │   │   │   ├── referral.routes.ts
│       │   │   │   ├── referral.service.ts
│       │   │   │   ├── referral.repository.ts
│       │   │   │   └── referral.schema.ts
│       │   │   ├── notification/
│       │   │   │   ├── notification.service.ts
│       │   │   │   ├── notification.channels.ts  # email, push, in-app
│       │   │   │   └── notification.templates.ts
│       │   │   └── astrology/
│       │   │       ├── astrology.routes.ts
│       │   │       ├── astrology.service.ts      # Dispatches to Python via BullMQ
│       │   │       ├── astrology.queue.ts
│       │   │       └── astrology.types.ts
│       │   ├── plugins/              # Fastify plugins
│       │   │   ├── auth.plugin.ts
│       │   │   ├── database.plugin.ts
│       │   │   ├── redis.plugin.ts
│       │   │   ├── socket.plugin.ts
│       │   │   └── queue.plugin.ts
│       │   ├── middleware/
│       │   │   ├── rate-limit.ts
│       │   │   ├── cors.ts
│       │   │   └── error-handler.ts
│       │   ├── db/
│       │   │   ├── schema.ts          # Drizzle ORM schema definitions
│       │   │   ├── migrations/        # SQL migration files
│       │   │   └── seed.ts
│       │   ├── config/
│       │   │   ├── env.ts             # Type-safe env with zod
│       │   │   └── constants.ts
│       │   └── server.ts              # Fastify app bootstrap
│       ├── drizzle.config.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── shared/                        # Shared TypeScript types and utilities
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── user.types.ts
│   │   │   │   ├── profile.types.ts
│   │   │   │   ├── match.types.ts
│   │   │   │   ├── message.types.ts
│   │   │   │   ├── referral.types.ts
│   │   │   │   ├── astrology.types.ts
│   │   │   │   └── api.types.ts       # Request/response shapes
│   │   │   ├── constants/
│   │   │   │   ├── zodiac.ts          # Western, Vedic, Chinese sign data
│   │   │   │   ├── compatibility.ts   # Score weights, thresholds
│   │   │   │   └── enums.ts
│   │   │   ├── utils/
│   │   │   │   ├── date.ts
│   │   │   │   ├── validation.ts      # Zod schemas shared across apps
│   │   │   │   └── formatting.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui/                            # Shared UI component library
│   │   ├── src/
│   │   │   ├── primitives/            # Platform-agnostic base components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   └── Badge.tsx
│   │   │   ├── composites/
│   │   │   │   ├── ProfileCard.tsx
│   │   │   │   ├── CompatibilityBadge.tsx
│   │   │   │   ├── SwipeCard.tsx
│   │   │   │   └── MatchNotification.tsx
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── i18n/                          # Internationalization
│   │   ├── src/
│   │   │   ├── locales/
│   │   │   │   ├── en/
│   │   │   │   │   ├── common.json
│   │   │   │   │   ├── auth.json
│   │   │   │   │   ├── profile.json
│   │   │   │   │   ├── matching.json
│   │   │   │   │   ├── messaging.json
│   │   │   │   │   └── astrology.json
│   │   │   │   ├── am/                # Amharic
│   │   │   │   │   └── ... (same structure)
│   │   │   │   └── es/                # Spanish
│   │   │   │       └── ... (same structure)
│   │   │   ├── config.ts              # i18next configuration
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── matching-engine/               # Compatibility algorithm library (pure TypeScript)
│       ├── src/
│       │   ├── western-astrology/
│       │   │   ├── synastry.ts        # Aspect calculations (trine, sextile, square, etc.)
│       │   │   ├── element-harmony.ts # Fire/Earth/Air/Water compatibility
│       │   │   └── sun-moon.ts        # Sun-Moon cross-sign analysis
│       │   ├── chinese-zodiac/
│       │   │   ├── animal-compatibility.ts
│       │   │   └── element-cycle.ts
│       │   ├── behavioral/
│       │   │   ├── preference-scorer.ts
│       │   │   ├── interaction-weight.ts  # Boost from mutual engagement
│       │   │   └── dealbreaker-filter.ts
│       │   ├── aggregator.ts          # Combines all sub-scores into final score
│       │   ├── weights.ts             # Configurable weight matrix
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── services/
│   └── ml-service/                    # Python FastAPI sidecar
│       ├── app/
│       │   ├── main.py                # FastAPI app
│       │   ├── routers/
│       │   │   ├── astrology.py       # Vedic Kundli, planetary positions
│       │   │   ├── palmistry.py       # Palm image analysis
│       │   │   └── health.py
│       │   ├── services/
│       │   │   ├── vedic_calculator.py    # pyswisseph, Guna Milan
│       │   │   ├── western_calculator.py  # Planetary positions, houses
│       │   │   ├── palm_analyzer.py       # OpenCV + ML model
│       │   │   └── chinese_calculator.py
│       │   ├── models/                # ML model weights
│       │   │   └── palm_model/
│       │   ├── workers/
│       │   │   └── queue_consumer.py  # BullMQ-compatible Redis consumer
│       │   └── config.py
│       ├── requirements.txt
│       ├── Dockerfile
│       └── pyproject.toml
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml         # Local dev: PostgreSQL, Redis, ML service
│   │   ├── Dockerfile.api
│   │   └── Dockerfile.ml
│   └── scripts/
│       ├── setup.sh                   # First-time dev environment setup
│       └── seed-db.sh
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 5. Service Architecture

### Module Communication Within the Monolith

```
Client Request
     │
     ▼
┌──────────────┐
│  Fastify API  │ ◄── Rate Limiting, Auth, CORS
│   Gateway     │
└──────┬───────┘
       │
       ├──► user.service ──► user.repository ──► PostgreSQL
       │
       ├──► profile.service ──► profile.repository ──► PostgreSQL
       │         │
       │         └──► S3 (photo upload via presigned URL)
       │
       ├──► matching.service
       │         │
       │         ├──► matching-engine (TypeScript, in-process)
       │         │       ├── western-astrology module
       │         │       ├── chinese-zodiac module
       │         │       └── behavioral module
       │         │
       │         ├──► BullMQ ──► Redis ──► ml-service (Python)
       │         │       (async: Vedic calculations, palmistry)
       │         │
       │         └──► matching.repository ──► PostgreSQL
       │
       ├──► messaging.service
       │         │
       │         ├──► Socket.io (real-time delivery)
       │         └──► messaging.repository ──► PostgreSQL
       │
       ├──► referral.service
       │         │
       │         ├──► notification.service (email/push)
       │         └──► referral.repository ──► PostgreSQL
       │
       └──► notification.service
                 │
                 ├──► Resend (email)
                 ├──► Expo Push (mobile)
                 └──► Socket.io (in-app)
```

### Async Job Flow (Astrology/ML Computation)

```
1. Client submits birth data
2. API validates and stores in PostgreSQL
3. API enqueues job to BullMQ:
   - Queue: "astrology:vedic" or "astrology:western" or "palmistry:analyze"
   - Payload: { userId, birthData } or { userId, imageUrl }
4. Python ml-service consumes from Redis queue
5. Python computes result (Kundli chart, Guna score, palm reading)
6. Python writes result back to Redis result queue
7. Node.js worker picks up result, stores in PostgreSQL
8. Node.js emits Socket.io event to client: "compatibility:updated"
```

---

## 6. Database Schema

### Entity Relationship Overview

```
users 1──1 profiles
users 1──1 birth_data
users 1──N swipe_history
users N──N matches (via matches table linking two users)
users N──N compatibility_scores (linking two users)
users 1──N messages (as sender)
users 1──N referrals (as referrer, referee, or candidate)
users 1──N user_photos
users 1──N blocked_users
matches 1──N messages
```

### Table Definitions

See the companion file `docs/schema.sql` for the complete DDL. Key tables:

**users** -- Core identity and auth
```
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
email             VARCHAR(255) UNIQUE NOT NULL
phone             VARCHAR(20) UNIQUE
password_hash     VARCHAR(255)            -- null for social-only accounts
display_name      VARCHAR(100) NOT NULL
locale            VARCHAR(5) DEFAULT 'en' -- 'en', 'am', 'es'
role              VARCHAR(20) DEFAULT 'user' -- 'user', 'referrer', 'admin'
auth_provider     VARCHAR(20) NOT NULL    -- 'email', 'google', 'apple', 'facebook'
auth_provider_id  VARCHAR(255)
is_verified       BOOLEAN DEFAULT FALSE
is_active         BOOLEAN DEFAULT TRUE
last_active_at    TIMESTAMPTZ
created_at        TIMESTAMPTZ DEFAULT NOW()
updated_at        TIMESTAMPTZ DEFAULT NOW()
```

**profiles** -- Dating profile (1:1 with users)
```
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id           UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE
gender            VARCHAR(20) NOT NULL
gender_preference VARCHAR(20)[]           -- array: ['male'], ['female'], ['male','female']
bio               TEXT
age               INTEGER
date_of_birth     DATE NOT NULL
height_cm         INTEGER
location_lat      DECIMAL(10,8)
location_lng      DECIMAL(11,8)
location_city     VARCHAR(100)
location_country  VARCHAR(100)
education         VARCHAR(100)
occupation        VARCHAR(100)
religion          VARCHAR(50)
ethnicity         VARCHAR(50)
interests         TEXT[]                   -- array of interest tags
looking_for       VARCHAR(30)             -- 'relationship', 'marriage', 'friendship'
max_distance_km   INTEGER DEFAULT 100
age_range_min     INTEGER DEFAULT 18
age_range_max     INTEGER DEFAULT 99
profile_complete  BOOLEAN DEFAULT FALSE
extra_fields      JSONB DEFAULT '{}'      -- extensible fields per locale/culture
created_at        TIMESTAMPTZ DEFAULT NOW()
updated_at        TIMESTAMPTZ DEFAULT NOW()
```

**user_photos**
```
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id           UUID REFERENCES users(id) ON DELETE CASCADE
url               VARCHAR(500) NOT NULL
position          INTEGER NOT NULL        -- ordering (0 = primary)
is_verified       BOOLEAN DEFAULT FALSE   -- photo verification status
created_at        TIMESTAMPTZ DEFAULT NOW()
UNIQUE(user_id, position)
```

**birth_data** -- Astrology input (1:1 with users)
```
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id           UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE
date_of_birth     DATE NOT NULL
time_of_birth     TIME                    -- null if unknown
city_of_birth     VARCHAR(100)
country_of_birth  VARCHAR(100)
latitude          DECIMAL(10,8)           -- resolved from city
longitude         DECIMAL(11,8)
timezone          VARCHAR(50)             -- e.g. 'Africa/Addis_Ababa'
-- Computed astrology data (cached after calculation)
western_sun_sign  VARCHAR(20)
western_moon_sign VARCHAR(20)
western_rising    VARCHAR(20)
vedic_rashi       VARCHAR(20)
vedic_nakshatra   VARCHAR(20)
chinese_animal    VARCHAR(20)
chinese_element   VARCHAR(20)
natal_chart_data  JSONB                   -- full planetary positions
kundli_data       JSONB                   -- Vedic chart data
palm_analysis     JSONB                   -- palm reading results
computed_at       TIMESTAMPTZ
created_at        TIMESTAMPTZ DEFAULT NOW()
updated_at        TIMESTAMPTZ DEFAULT NOW()
```

**compatibility_scores** -- Pairwise compatibility (computed async)
```
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_a_id         UUID REFERENCES users(id) ON DELETE CASCADE
user_b_id         UUID REFERENCES users(id) ON DELETE CASCADE
-- Sub-scores (0-100 scale)
western_score     DECIMAL(5,2)
vedic_score       DECIMAL(5,2)            -- Guna Milan points (out of 36, normalized)
chinese_score     DECIMAL(5,2)
palmistry_score   DECIMAL(5,2)
behavioral_score  DECIMAL(5,2)
-- Weighted aggregate
overall_score     DECIMAL(5,2) NOT NULL
-- Metadata
score_breakdown   JSONB                   -- detailed sub-factor breakdown
weights_used      JSONB                   -- weight config at time of computation
computed_at       TIMESTAMPTZ DEFAULT NOW()
expires_at        TIMESTAMPTZ             -- recompute after behavioral data changes
UNIQUE(user_a_id, user_b_id)
CHECK (user_a_id < user_b_id)             -- canonical ordering to prevent duplicates
```

**swipe_history**
```
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
swiper_id         UUID REFERENCES users(id) ON DELETE CASCADE
swiped_id         UUID REFERENCES users(id) ON DELETE CASCADE
action            VARCHAR(10) NOT NULL    -- 'like', 'pass', 'super_like'
source            VARCHAR(20) DEFAULT 'self' -- 'self', 'referral'
created_at        TIMESTAMPTZ DEFAULT NOW()
UNIQUE(swiper_id, swiped_id)
```

**matches** -- Mutual likes
```
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_a_id         UUID REFERENCES users(id) ON DELETE CASCADE
user_b_id         UUID REFERENCES users(id) ON DELETE CASCADE
matched_at        TIMESTAMPTZ DEFAULT NOW()
source            VARCHAR(20) DEFAULT 'self' -- 'self', 'referral'
referral_id       UUID REFERENCES referrals(id)  -- if matched via referral
is_active         BOOLEAN DEFAULT TRUE
unmatched_at      TIMESTAMPTZ
unmatched_by      UUID REFERENCES users(id)
UNIQUE(user_a_id, user_b_id)
CHECK (user_a_id < user_b_id)
```

**messages**
```
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
match_id          UUID REFERENCES matches(id) ON DELETE CASCADE
sender_id         UUID REFERENCES users(id) ON DELETE CASCADE
content           TEXT
message_type      VARCHAR(20) DEFAULT 'text' -- 'text', 'image', 'gif', 'voice'
media_url         VARCHAR(500)
is_read           BOOLEAN DEFAULT FALSE
read_at           TIMESTAMPTZ
created_at        TIMESTAMPTZ DEFAULT NOW()
```

**referrals** -- Core of referral mode
```
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
referrer_id       UUID REFERENCES users(id) ON DELETE CASCADE   -- person making the referral
referee_id        UUID REFERENCES users(id) ON DELETE CASCADE   -- person being referred FOR
candidate_id      UUID REFERENCES users(id) ON DELETE CASCADE   -- person being referred
status            VARCHAR(20) DEFAULT 'pending'
                  -- 'pending', 'seen_by_referee', 'accepted', 'declined', 'expired'
referrer_note     TEXT                     -- why the referrer thinks they are compatible
referee_response  VARCHAR(20)             -- 'interested', 'not_interested'
candidate_response VARCHAR(20)            -- 'interested', 'not_interested'
expires_at        TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days')
created_at        TIMESTAMPTZ DEFAULT NOW()
updated_at        TIMESTAMPTZ DEFAULT NOW()
UNIQUE(referrer_id, referee_id, candidate_id)
```

**referral_permissions** -- Who can refer for whom
```
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id           UUID REFERENCES users(id) ON DELETE CASCADE   -- the person being referred for
referrer_id       UUID REFERENCES users(id) ON DELETE CASCADE   -- authorized referrer
relationship      VARCHAR(30)             -- 'parent', 'sibling', 'friend', 'other'
is_active         BOOLEAN DEFAULT TRUE
granted_at        TIMESTAMPTZ DEFAULT NOW()
UNIQUE(user_id, referrer_id)
```

**blocked_users**
```
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
blocker_id        UUID REFERENCES users(id) ON DELETE CASCADE
blocked_id        UUID REFERENCES users(id) ON DELETE CASCADE
reason            VARCHAR(50)
created_at        TIMESTAMPTZ DEFAULT NOW()
UNIQUE(blocker_id, blocked_id)
```

**reports**
```
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
reporter_id       UUID REFERENCES users(id) ON DELETE CASCADE
reported_id       UUID REFERENCES users(id) ON DELETE CASCADE
reason            VARCHAR(50) NOT NULL    -- 'inappropriate', 'fake', 'harassment', 'spam'
description       TEXT
status            VARCHAR(20) DEFAULT 'pending' -- 'pending', 'reviewed', 'action_taken'
created_at        TIMESTAMPTZ DEFAULT NOW()
```

### Key Indexes

```sql
CREATE INDEX idx_profiles_location ON profiles USING GIST (
  ST_MakePoint(location_lng, location_lat)
);
CREATE INDEX idx_profiles_gender_pref ON profiles (gender, gender_preference);
CREATE INDEX idx_swipe_history_swiper ON swipe_history (swiper_id, created_at DESC);
CREATE INDEX idx_swipe_history_swiped ON swipe_history (swiped_id);
CREATE INDEX idx_compatibility_users ON compatibility_scores (user_a_id, user_b_id);
CREATE INDEX idx_compatibility_overall ON compatibility_scores (overall_score DESC);
CREATE INDEX idx_messages_match ON messages (match_id, created_at DESC);
CREATE INDEX idx_referrals_referee ON referrals (referee_id, status);
CREATE INDEX idx_referrals_candidate ON referrals (candidate_id, status);
CREATE INDEX idx_matches_users ON matches (user_a_id);
CREATE INDEX idx_matches_users_b ON matches (user_b_id);
CREATE INDEX idx_birth_data_signs ON birth_data (western_sun_sign, chinese_animal);
```

---

## 7. API Contracts

### Base URL

- Production: `https://api.agar.app/v1`
- WebSocket: `wss://api.agar.app`

### Authentication

All authenticated endpoints require: `Authorization: Bearer <access_token>`

Refresh: `POST /v1/auth/refresh` with httpOnly cookie containing refresh token.

---

### Auth Module

```
POST   /v1/auth/register
  Body: { email, password, displayName, locale }
  Response: 201 { user, accessToken, refreshToken }

POST   /v1/auth/login
  Body: { email, password }
  Response: 200 { user, accessToken, refreshToken }

POST   /v1/auth/social
  Body: { provider: 'google'|'apple'|'facebook', token }
  Response: 200 { user, accessToken, refreshToken, isNewUser }

POST   /v1/auth/refresh
  Cookie: refreshToken
  Response: 200 { accessToken, refreshToken }

POST   /v1/auth/logout
  Response: 204

POST   /v1/auth/verify-email
  Body: { token }
  Response: 200

POST   /v1/auth/forgot-password
  Body: { email }
  Response: 200

POST   /v1/auth/reset-password
  Body: { token, newPassword }
  Response: 200
```

### User / Profile Module

```
GET    /v1/users/me
  Response: 200 { user, profile, birthData }

PATCH  /v1/users/me
  Body: { displayName?, locale? }
  Response: 200 { user }

GET    /v1/profiles/me
  Response: 200 { profile }

PUT    /v1/profiles/me
  Body: { gender, genderPreference, bio, dateOfBirth, heightCm, locationCity,
          locationCountry, education, occupation, religion, ethnicity,
          interests, lookingFor, maxDistanceKm, ageRangeMin, ageRangeMax }
  Response: 200 { profile }

POST   /v1/profiles/me/photos
  Body: multipart/form-data { photo, position }
  Response: 201 { photo: { id, url, position } }

DELETE /v1/profiles/me/photos/:photoId
  Response: 204

PUT    /v1/profiles/me/photos/reorder
  Body: { photoIds: string[] }   -- ordered array
  Response: 200

GET    /v1/users/:userId/profile    -- public profile view (respects blocks)
  Response: 200 { profile, photos, compatibilityScore? }
```

### Birth Data / Astrology Module

```
PUT    /v1/birth-data
  Body: { dateOfBirth, timeOfBirth?, cityOfBirth, countryOfBirth, timezone }
  Response: 200 { birthData }
  Side effect: Enqueues astrology computation job

GET    /v1/birth-data
  Response: 200 { birthData }  -- includes computed signs if available

GET    /v1/astrology/chart
  Response: 200 { westernChart, vedicChart, chineseZodiac }

GET    /v1/astrology/compatibility/:userId
  Response: 200 { overallScore, breakdown: { western, vedic, chinese, palmistry, behavioral } }

POST   /v1/astrology/palm-reading
  Body: multipart/form-data { palmImage }
  Response: 202 { jobId, status: 'processing' }
  Note: Results delivered via Socket.io event or polling

GET    /v1/astrology/palm-reading/status/:jobId
  Response: 200 { status: 'processing'|'completed'|'failed', result? }
```

### Matching / Discovery Module

```
GET    /v1/discover
  Query: { page, limit, sortBy: 'compatibility'|'distance'|'newest' }
  Response: 200 { profiles: [{ profile, photos, compatibilityScore, distance }], pagination }
  Note: Excludes already-swiped, blocked, and out-of-preference users

POST   /v1/swipe
  Body: { targetUserId, action: 'like'|'pass'|'super_like', source: 'self'|'referral' }
  Response: 200 { matched: boolean, match?: { id, matchedAt, profile } }

GET    /v1/matches
  Query: { page, limit, status: 'active'|'unmatched' }
  Response: 200 { matches: [{ match, profile, photos, lastMessage?, compatibilityScore }] }

DELETE /v1/matches/:matchId
  Response: 204   -- unmatch

GET    /v1/matches/:matchId/compatibility
  Response: 200 { detailed compatibility breakdown with explanations }
```

### Messaging Module (REST + WebSocket)

**REST Endpoints:**
```
GET    /v1/matches/:matchId/messages
  Query: { cursor, limit }   -- cursor-based pagination (newest first)
  Response: 200 { messages, nextCursor }

POST   /v1/matches/:matchId/messages
  Body: { content, messageType: 'text'|'image'|'gif'|'voice', mediaUrl? }
  Response: 201 { message }

PATCH  /v1/messages/:messageId/read
  Response: 200
```

**Socket.io Events:**

```
// Client emits:
"message:send"        { matchId, content, messageType, mediaUrl?, tempId }
"message:typing"      { matchId, isTyping }
"message:read"        { matchId, messageId }
"presence:online"     {}
"presence:offline"    {}

// Server emits:
"message:new"         { message, matchId }
"message:delivered"   { messageId, matchId, tempId }
"message:typing"      { matchId, userId, isTyping }
"message:read"        { matchId, messageId, readAt }
"match:new"           { match, profile }
"compatibility:updated"  { userId, targetUserId, scores }
"notification:new"    { type, title, body, data }
"presence:update"     { userId, status: 'online'|'offline', lastActiveAt }
```

**Socket.io Namespaces:**
```
/messaging    -- Chat messages and typing indicators
/presence     -- Online/offline status
/notifications -- Match alerts, referral updates, compatibility updates
```

### Referral Module

```
POST   /v1/referrals
  Body: { refereeId, candidateId, note }
  Response: 201 { referral }
  Validation: referrer must have permission from referee

GET    /v1/referrals/incoming
  Query: { status, page, limit }
  Response: 200 { referrals: [{ referral, referrer, candidate, compatibilityScore }] }

GET    /v1/referrals/outgoing
  Query: { status, page, limit }
  Response: 200 { referrals: [{ referral, referee, candidate }] }

PATCH  /v1/referrals/:referralId/respond
  Body: { response: 'interested'|'not_interested' }
  Response: 200 { referral }
  Note: When both referee and candidate respond 'interested', a match is created

POST   /v1/referral-permissions
  Body: { referrerId, relationship }
  Response: 201 { permission }

GET    /v1/referral-permissions
  Response: 200 { permissions: [{ referrer, relationship, grantedAt }] }

DELETE /v1/referral-permissions/:permissionId
  Response: 204
```

### Safety Module

```
POST   /v1/users/:userId/block
  Response: 201

DELETE /v1/users/:userId/block
  Response: 204

POST   /v1/users/:userId/report
  Body: { reason, description? }
  Response: 201 { report }
```

### Notification Preferences

```
GET    /v1/notification-preferences
  Response: 200 { preferences }

PATCH  /v1/notification-preferences
  Body: { newMatch: boolean, newMessage: boolean, referralUpdate: boolean,
          compatibilityReady: boolean, emailDigest: 'daily'|'weekly'|'never' }
  Response: 200 { preferences }
```

---

## 8. Compatibility Intelligence Engine

### Score Composition

The overall compatibility score is a weighted average of five sub-systems. Weights are configurable and can be personalized per user over time.

```
Default weights:
  Western Astrology (synastry):    0.20
  Vedic Astrology (Guna Milan):    0.20
  Chinese Zodiac:                  0.10
  Palmistry:                       0.10
  Behavioral AI:                   0.40
  -----------------------------------------
  Total:                           1.00
```

**Why behavioral gets the highest weight**: Astrology and palmistry are enrichment layers that add uniqueness to the product. Behavioral matching (preference alignment, engagement patterns, dealbreaker filtering) is the empirically strongest predictor of actual user satisfaction. The astrology scores provide differentiation and cultural relevance; behavioral scoring provides accuracy.

### Sub-System Details

**Western Astrology (packages/matching-engine + services/ml-service)**
- Input: Birth date, time, location for both users
- Computation: Planetary positions via Swiss Ephemeris (Python), aspect calculations (TypeScript)
- Factors: Sun-Sun compatibility, Sun-Moon cross-aspects, Venus-Mars aspects, element harmony (Fire/Earth/Air/Water)
- Output: Score 0-100

**Vedic Astrology (services/ml-service only)**
- Input: Birth date, time, location
- Computation: Kundli generation via pyswisseph, Guna Milan (Ashtakoota) scoring
- Factors: 8 Gunas (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakut, Nadi) totaling 36 points
- Output: Raw score 0-36, normalized to 0-100

**Chinese Zodiac (packages/matching-engine)**
- Input: Birth year
- Computation: Pure TypeScript lookup tables
- Factors: Animal compatibility triangle, element cycle (generating/overcoming)
- Output: Score 0-100

**Palmistry (services/ml-service)**
- Input: Palm photograph
- Computation: OpenCV preprocessing, CNN-based line detection, classification model
- Factors: Heart line analysis (emotional nature), head line (communication style), life line (vitality), mount prominence
- Output: Personality trait vector, compatibility score 0-100 when compared pairwise
- Note: This is the most experimental sub-system. Initially launch with a simplified rule-based model and iterate with ML.

**Behavioral AI (packages/matching-engine + apps/api)**
- Input: Profile preferences, swipe history, messaging patterns, response rates
- Computation: TypeScript scoring in-process
- Factors:
  - Preference alignment: Does each user fall within the other's stated preferences (age, distance, religion, ethnicity, looking_for)?
  - Dealbreaker filtering: Hard filters that zero out the score (e.g., user A requires same religion, user B is different)
  - Engagement signal boost: Users who mutually engage with similar profiles get a boost
  - Response quality: Users who respond to messages within 24h and have longer average conversations get a quality signal
- Output: Score 0-100

### Computation Flow

```
1. User A views User B's profile (or discover feed is built)
2. Check cache: Is there a valid compatibility_scores row for (A, B)?
   - Yes and not expired: Return cached score
   - No: Compute synchronously what we can, async the rest

3. Synchronous (in request path, < 50ms):
   - Chinese zodiac score (lookup table)
   - Behavioral score (preference + swipe history)
   - Western astrology element harmony (if sun signs known)

4. Asynchronous (via BullMQ):
   - Full Western synastry (needs planetary positions from Python)
   - Vedic Guna Milan (Python)
   - Palmistry (if both users have palm images)

5. Store partial score immediately, update when async results arrive
6. Notify client via Socket.io when full score is ready
```

### Score Expiration

- Astrology scores: Never expire (birth data does not change)
- Behavioral scores: Expire after 7 days (swipe/messaging patterns change)
- Overall score: Recomputed when behavioral score expires or user updates profile

---

## 9. Infrastructure and Deployment

### Local Development

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgis/postgis:16-3.4
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: agar_dev
      POSTGRES_USER: agar
      POSTGRES_PASSWORD: agar_dev

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  ml-service:
    build: ./services/ml-service
    ports: ["8000:8000"]
    environment:
      REDIS_URL: redis://redis:6379
    depends_on: [redis]
```

Dev commands (via turbo):
```bash
pnpm dev           # Runs all apps in parallel (web, mobile, api)
pnpm dev:api       # API only
pnpm dev:web       # Web only
pnpm dev:mobile    # Expo dev server
pnpm build         # Build all packages and apps
pnpm test          # Run all tests
pnpm lint          # Lint all packages
pnpm db:migrate    # Run Drizzle migrations
pnpm db:seed       # Seed development data
```

### Production Deployment

```
┌─────────────────────────────────────────────────┐
│                   Cloudflare                     │
│               (DNS + CDN + DDoS)                 │
└──────────┬──────────────────┬───────────────────┘
           │                  │
    ┌──────▼──────┐   ┌──────▼──────┐
    │   Vercel    │   │  Railway    │
    │  (Next.js)  │   │  (Fastify)  │
    │  web app    │   │  API server │
    └─────────────┘   └──────┬──────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼──────┐ ┌────▼────┐ ┌───────▼──────┐
       │ PostgreSQL  │ │  Redis  │ │   Railway     │
       │ (Railway or │ │ (Upstash│ │  (ML service) │
       │  Neon)      │ │  or RW) │ │  Python+GPU   │
       └─────────────┘ └─────────┘ └──────────────┘
                                          │
                                   ┌──────▼──────┐
                                   │  AWS S3 /   │
                                   │  Cloudflare │
                                   │  R2 (files) │
                                   └─────────────┘
```

### Environment Variables

```env
# .env.example
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://agar:agar_dev@localhost:5432/agar_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# Storage
S3_BUCKET=agar-uploads
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# ML Service
ML_SERVICE_URL=http://localhost:8000

# Email
RESEND_API_KEY=

# Push Notifications
EXPO_ACCESS_TOKEN=

# Monitoring
SENTRY_DSN=
```

---

## 10. Security Architecture

### Authentication Flow

```
Mobile/Web Client                    API Server                     Database
     │                                  │                              │
     │─── POST /auth/register ─────────►│                              │
     │    { email, password, name }     │── hash password (argon2) ───►│
     │                                  │◄── store user ───────────────│
     │◄── { accessToken, refreshToken } │                              │
     │                                  │                              │
     │─── GET /discover ───────────────►│                              │
     │    Authorization: Bearer <AT>    │── verify JWT ──►             │
     │                                  │── check not blocked/banned ─►│
     │◄── 200 { profiles }             │                              │
     │                                  │                              │
     │─── POST /auth/refresh ──────────►│                              │
     │    Cookie: refreshToken          │── verify RT + rotation ─────►│
     │◄── { newAT, newRT }             │                              │
```

### Security Measures

1. **Password hashing**: Argon2id (not bcrypt -- resistant to GPU attacks)
2. **Rate limiting**: Per-IP and per-user via @fastify/rate-limit + Redis
   - Auth endpoints: 5 req/min
   - Swipe: 100 req/min
   - Messages: 60 req/min
   - Profile updates: 10 req/min
3. **Input validation**: JSON Schema at the Fastify route level, Zod for business logic
4. **SQL injection**: Prevented by Drizzle ORM parameterized queries
5. **XSS**: Content sanitization on message content (DOMPurify on client, sanitize-html on server)
6. **CORS**: Whitelist only agar.app domains
7. **File uploads**: Presigned S3 URLs (files never transit through the API server), file type validation, max size 10MB
8. **Image moderation**: Async job to scan uploaded photos via a moderation API (AWS Rekognition or open-source)
9. **Refresh token rotation**: Each refresh token use invalidates the old token. If a stolen token is reused, the entire family is revoked.
10. **Row-level filtering**: API never returns data for blocked users. Match queries always JOIN against blocked_users.

---

## 11. Observability

### Structured Logging

Every log entry includes:
```json
{
  "level": "info",
  "timestamp": "2026-04-07T12:00:00Z",
  "requestId": "req_abc123",
  "userId": "usr_def456",
  "module": "matching",
  "action": "compute_compatibility",
  "duration_ms": 45,
  "metadata": {}
}
```

### Key Metrics to Track

| Metric | Source | Alert Threshold |
|--------|--------|----------------|
| API response time (p95) | Fastify hooks | > 500ms |
| Astrology job queue depth | BullMQ | > 1000 pending |
| Astrology job completion time | BullMQ | > 30s average |
| Match rate (likes that become matches) | Application | < 5% (indicates poor algorithm) |
| Message response rate | Application | Trending metric, no alert |
| WebSocket connection count | Socket.io | > 80% of server capacity |
| Database connection pool usage | Drizzle/pg | > 80% |
| Error rate (5xx) | Fastify hooks | > 1% of requests |
| Palm image processing failures | ML service | > 10% failure rate |

### Health Check Endpoints

```
GET /health          -- 200 if API server is up
GET /health/ready    -- 200 if API + DB + Redis are all connected
GET /health/ml       -- 200 if ML service is reachable
```

---

## Appendix: Referral Mode Workflow

This is the most architecturally distinctive feature, so it deserves explicit documentation.

### Actors
- **User**: The person looking for a match
- **Referrer**: A friend or family member authorized to suggest candidates
- **Candidate**: The person being referred

### Flow

```
1. User grants referral permission to Referrer
   POST /v1/referral-permissions { referrerId, relationship: "friend" }

2. Referrer browses candidates (sees a filtered discover feed)
   GET /v1/discover?mode=referral&refereeId=<userId>
   Note: The discover feed respects the User's preferences, not the Referrer's

3. Referrer submits a referral
   POST /v1/referrals { refereeId: <userId>, candidateId: <candidateId>, note: "..." }

4. User receives notification: "Your friend X suggested Y for you"
   Socket.io event: "notification:new" { type: "referral_incoming", referral }

5. User views referral and responds
   PATCH /v1/referrals/:id/respond { response: "interested" }

6. Candidate receives notification: "Someone is interested in you via referral"
   Note: Candidate does NOT see who the referrer is, only that they were referred

7. Candidate responds
   PATCH /v1/referrals/:id/respond { response: "interested" }

8. If BOTH respond "interested":
   - System creates a match automatically
   - Both users are notified: "You have a new match!"
   - The match record links back to the referral for attribution

9. If EITHER responds "not_interested":
   - Referral status becomes "declined"
   - No match is created
   - The declining party is not revealed to the other
```

### Privacy Constraints in Referral Mode
- Referrer cannot see messages between matched users
- Referrer can see that a referral resulted in a match (for positive feedback) but not conversation content
- Candidate can choose to never be visible in referral discover feeds (opt-out)
- Referrer permission can be revoked at any time, which expires all pending referrals from that referrer

---

*End of Architecture Specification*
