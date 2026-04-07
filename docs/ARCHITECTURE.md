# Agar System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                   CLIENTS                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ iOS App  │  │ Android  │  │  Web App     │  │
│  │ (Expo)   │  │ (Expo)   │  │  (Next.js)   │  │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
└───────┼──────────────┼───────────────┼──────────┘
        │              │               │
        └──────────────┼───────────────┘
                       │
        ┌──────────────▼───────────────┐
        │       API GATEWAY            │
        │    (Express + Socket.io)     │
        │       Port 4000             │
        └──────────────┬───────────────┘
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
┌───▼──────┐   ┌──────▼─────┐   ┌───────▼──────┐
│ Auth     │   │ Matching   │   │ Messaging    │
│ Service  │   │ Engine     │   │ Service      │
└───┬──────┘   └──────┬─────┘   └───────┬──────┘
    │                  │                  │
    └──────────────────┼──────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    ┌────▼───┐   ┌─────▼────┐  ┌────▼───┐
    │ Postgres│   │  Redis   │  │ BullMQ │
    │  (main) │   │ (cache)  │  │ (jobs) │
    └────────┘   └──────────┘  └────────┘
```

## Service Architecture

### User Service
- Registration, authentication (JWT + OAuth)
- Profile management (CRUD)
- Photo upload and management
- Location updates
- User preferences

### Matching Engine (packages/matching-engine)
- **Western Astrology**: Synastry analysis using planetary aspects
- **Vedic Astrology**: 36-point Guna Milan (Ashtakoot)
- **Chinese Zodiac**: Animal + element compatibility
- **Behavioral**: Big Five personality, interests, lifestyle
- **Unified Score**: Weighted combination (0-100)

### Discovery Service
- Feed generation with compatibility-sorted candidates
- Swipe processing with mutual match detection
- Filter support (age, distance, compatibility threshold)

### Messaging Service
- WebSocket-based real-time chat
- Message persistence (PostgreSQL)
- Typing indicators, read receipts
- Icebreaker suggestions based on compatibility

### Referral Service
- Friend/family can refer candidates
- Referral tracking and status management
- Compatibility preview for referrals

## Data Flow

### Match Discovery Flow
1. User opens discovery feed
2. API queries candidates matching preferences
3. Candidates sorted by pre-computed compatibility scores
4. User swipes → recorded in swipes table
5. Mutual like detected → match created
6. Both users notified via WebSocket

### Compatibility Calculation Flow
1. Trigger: new match, manual request, or periodic batch
2. Gather both users' birth data, profiles, interests
3. Run each engine (western, vedic, chinese, behavioral)
4. Combine with user-customizable weights
5. Cache result in compatibility_scores table
6. Return report with insights and advice

## Database Schema (Key Relations)
```
users ─┬─ profiles (1:1)
       ├─ photos (1:N)
       ├─ birth_data (1:1)
       ├─ user_preferences (1:1)
       ├─ swipes (N, as swiper)
       ├─ matches (N, as user1 or user2)
       ├─ messages (N, as sender)
       └─ referrals (N, as referrer/for/candidate)

compatibility_scores: user1_id + user2_id → scores
```

## Security Architecture
- JWT access tokens (15min) + refresh tokens (7d)
- bcrypt password hashing (cost 12)
- Rate limiting on auth endpoints (10 req/15min)
- General rate limiting (100 req/15min)
- Helmet.js security headers
- CORS origin whitelist
- Input validation with Zod schemas
- SQL injection prevention via Drizzle ORM parameterized queries

## Development Roadmap

### Phase 1: MVP (Weeks 1-6)
- [x] Project setup, monorepo, shared types
- [x] Database schema design
- [x] Auth (email/phone + JWT)
- [x] Profile CRUD
- [x] Basic discovery feed
- [x] Swipe + match detection
- [x] Western astrology engine
- [x] Basic behavioral matching
- [ ] Photo upload + storage
- [ ] Real-time chat (basic)
- [ ] Mobile app screens (onboarding, discovery, chat)

### Phase 2: Cultural Intelligence (Weeks 7-10)
- [ ] Vedic astrology (Guna Milan) integration
- [ ] Chinese zodiac engine
- [ ] Compatibility dashboard UI
- [ ] Detailed compatibility reports
- [ ] "Why you match" explainer
- [ ] Referral system v1

### Phase 3: Engagement (Weeks 11-14)
- [ ] Icebreaker suggestions
- [ ] Push notifications
- [ ] Voice/video call integration
- [ ] Premium features (super likes, profile boost)
- [ ] Dark mode
- [ ] Advanced filters

### Phase 4: Scale (Weeks 15-20)
- [ ] Palmistry (image analysis via ML)
- [ ] Adaptive matching (learn from user behavior)
- [ ] Batch compatibility pre-computation
- [ ] CDN for photos
- [ ] Analytics dashboard
- [ ] A/B testing framework
- [ ] App Store / Play Store submission
