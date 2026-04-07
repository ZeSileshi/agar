# Agar - Referral-First Dating App: Technical Architecture

## Executive Summary

Agar's differentiator is **trust-based entry**: every user enters through a friend's referral, and matches are powered by palmistry + astrology + behavioral science. This document details the end-to-end technical flow across 4 core modules.

---

## Module 1: Referral & Registration Flow

### 1.1 Database Schema Extensions

The existing `referrals` table handles in-app referrals (User A recommends User B to User C). We need a new table for **invite links** — bringing new users onto the platform.

```sql
-- New table: invite_links (extends existing schema)
CREATE TABLE invite_links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invite_code     VARCHAR(12) UNIQUE NOT NULL,       -- e.g., "SARA-7X2K"
  deep_link_url   VARCHAR(500) NOT NULL,             -- https://agar.app/invite/SARA-7X2K
  invitee_name    VARCHAR(100),                       -- Optional: "Hey Dawit, join me"
  invitee_phone   VARCHAR(20),                        -- Optional: for SMS delivery
  invitee_email   VARCHAR(255),                       -- Optional: for email delivery
  channel         VARCHAR(20) DEFAULT 'link',         -- 'sms' | 'email' | 'whatsapp' | 'link' | 'qr'
  message         TEXT,                               -- Custom message from inviter
  status          VARCHAR(20) DEFAULT 'pending',      -- 'pending' | 'clicked' | 'registered' | 'expired' | 'revoked'
  max_uses        INTEGER DEFAULT 1,
  use_count       INTEGER DEFAULT 0,
  credits_awarded BOOLEAN DEFAULT FALSE,
  clicked_at      TIMESTAMPTZ,
  registered_at   TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ NOT NULL,               -- 30-day expiry
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- New table: referral_credits
CREATE TABLE referral_credits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount          INTEGER NOT NULL,                   -- Credit amount
  type            VARCHAR(30) NOT NULL,               -- 'invite_signup' | 'invite_onboarded' | 'successful_match' | 'bonus'
  source_invite_id UUID REFERENCES invite_links(id),
  source_user_id  UUID REFERENCES users(id),          -- Who triggered the credit
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add to users table
ALTER TABLE users ADD COLUMN invited_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN invite_code_used VARCHAR(12);
ALTER TABLE users ADD COLUMN referral_credits INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN trust_score REAL DEFAULT 0;           -- Derived from referral chain quality
```

### 1.2 Invite Mechanism — Technical Flow

```
Recommender (Sara)                     Backend                          Referred User (Dawit)
       |                                  |                                    |
       |-- POST /api/v1/invites --------->|                                    |
       |   { inviteeName: "Dawit",        |                                    |
       |     phone: "+251...",            |                                    |
       |     message: "You'd love this",  |                                    |
       |     channel: "whatsapp" }        |                                    |
       |                                  |-- Generate invite_code: "SARA-7X2K"|
       |                                  |-- Build deep link:                 |
       |                                  |   agar.app/invite/SARA-7X2K       |
       |                                  |-- Store in invite_links table      |
       |                                  |-- If channel=sms: queue SMS via    |
       |                                  |   Twilio/AfricasTalking           |
       |                                  |-- If channel=whatsapp: return      |
       |<-- { deepLink, inviteCode } -----|   share URL for client to open     |
       |                                  |                                    |
       |   [Sara shares via WhatsApp] ----|-------- Link arrives ------------>|
       |                                  |                                    |
       |                                  |<-- GET /invite/SARA-7X2K ---------|
       |                                  |-- Lookup invite_links             |
       |                                  |-- Validate: not expired,          |
       |                                  |   use_count < max_uses            |
       |                                  |-- Update: status='clicked',       |
       |                                  |   clicked_at=NOW()                |
       |                                  |-- Resolve inviter profile:        |
       |                                  |   Sara's name + avatar            |
       |                                  |                                    |
       |                                  |--- Redirect to:                   |
       |                                  |   Mobile: expo deep link          |
       |                                  |   Web: /welcome?code=SARA-7X2K---|
       |                                  |                                    |
       |                                  |            WELCOME SCREEN          |
       |                                  |   "Sara thinks you'd love Agar"   |
       |                                  |   [Sara's avatar + custom msg]    |
       |                                  |   [Join Now] button               |
```

### 1.3 Deep Link Architecture

```typescript
// apps/api/src/routes/invites.ts

// POST /api/v1/invites — Create invite
// Generates: https://agar.app/invite/{CODE}
// Mobile handling: agar://invite/{CODE} (Expo deep link)
// Universal link: https://agar.app/.well-known/apple-app-site-association

// Deep link resolution flow:
// 1. User clicks link → hits /invite/:code endpoint
// 2. Backend checks if mobile app is installed (via User-Agent)
// 3. If installed → redirect to agar://invite/{CODE}
// 4. If not installed → redirect to web /welcome?code={CODE}
//    with App Store / Play Store fallback banners
// 5. Expo handles with expo-linking:
//    Linking.addEventListener('url', ({ url }) => {
//      const code = extractInviteCode(url);
//      navigation.navigate('Welcome', { inviteCode: code });
//    });
```

### 1.4 Welcome Screen (Mobile)

```
┌─────────────────────────────────┐
│                                 │
│         [Sara's Avatar]         │
│              ○                  │
│                                 │
│     Sara thinks you'd          │
│       love it here.            │
│                                 │
│   "Dawit, I found this app     │
│    and it's actually good.     │
│    Try it!"                    │
│          — Sara                │
│                                 │
│   ┌─────────────────────────┐  │
│   │    Join Agar — it's     │  │
│   │        free             │  │
│   └─────────────────────────┘  │
│                                 │
│   Already have an account?     │
│         Sign in                │
│                                 │
│   ─── or continue with ───    │
│   [Google] [Apple] [Phone]    │
│                                 │
│   By joining, you agree to     │
│   Terms & Privacy Policy       │
└─────────────────────────────────┘
```

### 1.5 Registration Flow

```typescript
// Step 1: Auth (Minimal — phone or email)
POST /api/v1/auth/register
{
  phone: "+251912345678",     // OR email: "dawit@example.com"
  inviteCode: "SARA-7X2K",   // Required for referral-first
  language: "en"              // Detected from device, user can change
}
// → Server validates invite code
// → Creates user with invited_by = Sara's userId
// → Sends OTP via SMS/email
// → Returns { userId, otpSent: true }

// Step 2: Verify OTP
POST /api/v1/auth/verify-otp
{
  userId: "...",
  otp: "482916"
}
// → Verifies OTP
// → Updates invite_links: status='registered', registered_at=NOW()
// → Awards Sara 50 credits (invite_signup)
// → Returns { accessToken, refreshToken, user, nextStep: 'onboarding' }

// Step 3: Onboarding flag
// user.isOnboarded = false until they complete:
//   1. Basic profile (name, DOB, gender)     → onboarding_step = 1
//   2. Photos (min 3)                         → onboarding_step = 2
//   3. Palm scan (optional but prompted)      → onboarding_step = 3
//   4. Birth details for astrology            → onboarding_step = 4
//   5. Personality questions (5 min quiz)     → onboarding_step = 5
// After step 5: isOnboarded = true
```

### 1.6 Credit System

| Action                          | Credits | Recipient     |
|--------------------------------|---------|---------------|
| Invited friend signs up         | +50     | Inviter       |
| Invited friend completes onboarding | +100 | Inviter       |
| Referral match leads to conversation | +25 | Referrer      |
| Referral match lasts 7+ days   | +200    | Referrer      |
| New user sign-up bonus          | +100    | New user      |

Credits unlock: **Super Likes**, **Priority in Queue**, **See Who Liked You**, **Boost Profile**.

---

## Module 2: Multimedia Onboarding (Photos & Palmistry)

### 2.1 Photo Upload System

#### Storage Architecture

```
AWS S3 / Cloudflare R2
├── users/{userId}/photos/
│   ├── original/          ← Full resolution uploads
│   │   ├── {photoId}.jpg
│   │   └── ...
│   ├── display/           ← Optimized for feed (800x1000, WebP)
│   │   ├── {photoId}.webp
│   │   └── ...
│   └── thumbnail/         ← Grid/list views (200x200, WebP)
│       ├── {photoId}.webp
│       └── ...
├── users/{userId}/palm/
│   ├── original/          ← Raw palm capture
│   │   └── {scanId}.jpg
│   ├── processed/         ← Annotated with detected lines
│   │   └── {scanId}_annotated.jpg
│   └── analysis/          ← JSON analysis results
│       └── {scanId}.json
```

#### Photo Upload Flow

```typescript
// Mobile UI: Multi-slot photo uploader
// ┌───────┐ ┌───────┐ ┌───────┐
// │  📷   │ │  📷   │ │  📷   │  ← Slots 1-3 (required, gold border)
// │ Slot 1│ │ Slot 2│ │ Slot 3│
// └───────┘ └───────┘ └───────┘
// ┌───────┐ ┌───────┐ ┌───────┐
// │  +    │ │  +    │ │  +    │  ← Slots 4-6 (optional, dashed border)
// │ Slot 4│ │ Slot 5│ │ Slot 6│
// └───────┘ └───────┘ └───────┘
// [Continue] button disabled until slots 1-3 filled

// API Flow:
// 1. Client requests presigned upload URL
POST /api/v1/photos/upload-url
{ contentType: "image/jpeg", slot: 1 }
// → Returns { uploadUrl: "https://s3.../presigned", photoId: "uuid" }

// 2. Client uploads directly to S3 (no server bandwidth cost)
PUT {uploadUrl}
// Body: raw image bytes
// Headers: Content-Type: image/jpeg

// 3. Client confirms upload complete
POST /api/v1/photos/confirm
{ photoId: "uuid", slot: 1 }
// → Server triggers Lambda/worker:
//    a. Validate image (not corrupt, is a photo of a person)
//    b. NSFW detection (AWS Rekognition / custom model)
//    c. Generate display (800x1000) and thumbnail (200x200) via Sharp
//    d. Face detection — at least 1 face required in slot 1
//    e. Update photos table: url, thumbnailUrl, order
//    f. If slot 1: set isPrimary = true
// → Returns { photo: { id, url, thumbnailUrl, status: 'processing' } }

// 4. Webhook/poll for processing complete
GET /api/v1/photos?userId={id}
// → Returns all photos with status: 'approved' | 'rejected' | 'processing'
```

#### Photo Validation Rules

```typescript
const PHOTO_RULES = {
  minPhotos: 3,
  maxPhotos: 6,
  maxFileSize: 10 * 1024 * 1024,        // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/heic', 'image/webp'],
  minDimension: 400,                      // px
  requireFace: [1],                       // Slot 1 must have a face
  nsfwThreshold: 0.85,                    // Reject if NSFW confidence > 85%
  duplicateCheck: true,                   // Perceptual hash to prevent same photo twice
};
```

### 2.2 Palmistry Capture System

#### Camera Overlay UI (React Native)

```
┌─────────────────────────────────┐
│ ← Back              Skip →     │
│                                 │
│        Scan Your Palm          │
│   Place your right hand in     │
│      the guide below           │
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │    ╭─── ─── ─── ──╮   │   │  ← Dashed hand outline overlay
│  │    │  ╭──────────╮ │   │   │
│  │    │  │          │ │   │   │    Guide shows:
│  │    │  │   PALM   │ │   │   │    • Hand silhouette
│  │    │  │   AREA   │ │   │   │    • "Align fingers here" markers
│  │    │  ╰──────────╯ │   │   │    • Real-time edge detection
│  │    ╰─── ─── ─── ──╯   │   │       highlights hand in green
│  │                         │   │       when aligned
│  └─────────────────────────┘   │
│                                 │
│  💡 Tips:                      │
│  • Use good lighting           │
│  • Open your hand flat         │
│  • Keep steady for 2 seconds   │
│                                 │
│  ┌─────────────────────────┐   │
│  │      📷 Capture         │   │  ← Enabled only when hand detected
│  └─────────────────────────┘   │
│                                 │
│  ○ ○ ● ○ ○  Step 3 of 5       │
└─────────────────────────────────┘
```

#### Palm Detection & Analysis — Backend Flow

```
Mobile App                    API Server                   ML Service (Python)
    |                             |                              |
    |-- Upload palm image ------->|                              |
    |   POST /api/v1/palm/scan   |                              |
    |   { image: base64/file }   |                              |
    |                             |-- Store original to S3 ----->|
    |                             |                              |
    |                             |-- POST /ml/palm/analyze ---->|
    |                             |   { imageUrl, userId }       |
    |                             |                              |
    |                             |   ML Pipeline:               |
    |                             |   1. Image preprocessing     |
    |                             |      - Normalize lighting    |
    |                             |      - Crop to palm region   |
    |                             |      - Enhance contrast      |
    |                             |                              |
    |                             |   2. Hand landmark detection |
    |                             |      - MediaPipe Hands       |
    |                             |      - 21 key points         |
    |                             |      - Validate: is a palm?  |
    |                             |                              |
    |                             |   3. Palm line extraction    |
    |                             |      - Edge detection (Canny)|
    |                             |      - Line segmentation     |
    |                             |      - Classify:             |
    |                             |        • Heart Line          |
    |                             |        • Head Line           |
    |                             |        • Life Line           |
    |                             |        • Fate Line (opt)     |
    |                             |        • Sun Line (opt)      |
    |                             |                              |
    |                             |   4. Line analysis           |
    |                             |      For each line:          |
    |                             |      - Length (relative)     |
    |                             |      - Curvature             |
    |                             |      - Depth/clarity         |
    |                             |      - Branch points         |
    |                             |      - Start/end positions   |
    |                             |                              |
    |                             |   5. Trait mapping           |
    |                             |      Heart Line → emotional  |
    |                             |        style, attachment     |
    |                             |      Head Line → thinking    |
    |                             |        style, decision-making|
    |                             |      Life Line → vitality,   |
    |                             |        life changes, energy  |
    |                             |                              |
    |                             |   6. Generate annotated image|
    |                             |      - Draw colored lines    |
    |                             |        on palm photo         |
    |                             |      - Heart=red, Head=blue  |
    |                             |        Life=green            |
    |                             |                              |
    |                             |<-- Return PalmistryResult ---|
    |                             |    {                         |
    |                             |      lines: {               |
    |                             |        heart: { length, curve|
    |                             |          depth, traits },    |
    |                             |        head: { ... },        |
    |                             |        life: { ... },        |
    |                             |      },                      |
    |                             |      traits: [               |
    |                             |        { name: "Romantic",   |
    |                             |          score: 0.82,        |
    |                             |          source: "heart" },  |
    |                             |        { name: "Analytical", |
    |                             |          score: 0.71,        |
    |                             |          source: "head" },   |
    |                             |      ],                      |
    |                             |      annotatedImageUrl,      |
    |                             |      confidence: 0.89        |
    |                             |    }                         |
    |                             |                              |
    |                             |-- Store result in DB --------|
    |                             |-- Store annotated img to S3 -|
    |<-- { palmResult, preview }--|                              |
    |                             |                              |
    |   Show user:               |                              |
    |   "Your Palm Reading"      |                              |
    |   [Annotated hand image]   |                              |
    |   Heart Line: Deep romantic|                              |
    |   Head Line: Analytical    |                              |
    |   Life Line: Adventurous   |                              |
```

#### Palm Data Schema Extension

```sql
CREATE TABLE palm_scans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_url      VARCHAR(500) NOT NULL,
  annotated_url     VARCHAR(500),
  hand              VARCHAR(10) DEFAULT 'right',   -- 'left' | 'right'

  -- Heart Line (emotional/romantic style)
  heart_length      REAL,            -- 0-1 normalized
  heart_curvature   REAL,            -- 0=straight, 1=deeply curved
  heart_depth       REAL,            -- Line clarity/prominence
  heart_branches    INTEGER,
  heart_traits      JSONB,           -- ["romantic", "passionate", "guarded"]

  -- Head Line (thinking/decision style)
  head_length       REAL,
  head_curvature    REAL,
  head_depth        REAL,
  head_branches     INTEGER,
  head_traits       JSONB,           -- ["analytical", "creative", "practical"]

  -- Life Line (vitality/energy)
  life_length       REAL,
  life_curvature    REAL,
  life_depth        REAL,
  life_branches     INTEGER,
  life_traits       JSONB,           -- ["adventurous", "stable", "energetic"]

  -- Optional lines
  fate_detected     BOOLEAN DEFAULT FALSE,
  sun_detected      BOOLEAN DEFAULT FALSE,

  -- Aggregated personality traits from palm
  personality_traits JSONB,          -- [{ name, score, source }]

  confidence        REAL NOT NULL,
  status            VARCHAR(20) DEFAULT 'processing', -- 'processing' | 'complete' | 'failed' | 'retry'
  error_message     TEXT,

  scanned_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX palm_scans_user_idx ON palm_scans(user_id);
```

#### ML Service Tech Stack (services/ml-service/)

```
services/ml-service/
├── Dockerfile
├── requirements.txt          ← mediapipe, opencv-python, numpy, pillow, fastapi
├── app/
│   ├── main.py               ← FastAPI server
│   ├── routes/
│   │   └── palm.py           ← POST /palm/analyze
│   ├── models/
│   │   ├── hand_detector.py  ← MediaPipe Hands wrapper
│   │   ├── line_extractor.py ← OpenCV edge detection + line classification
│   │   └── trait_mapper.py   ← Line features → personality traits
│   ├── utils/
│   │   ├── image_processing.py
│   │   └── s3_client.py
│   └── config.py
```

---

## Module 3: Astrology Data Entry

### 3.1 Birth Details Input — UI Flow

```
┌─────────────────────────────────┐
│ ← Back              Step 4/5   │
│                                 │
│    ✨ Your Birth Chart         │
│                                 │
│  We need a few details to      │
│  calculate your natal chart.   │
│  The more precise, the more    │
│  accurate your matches.        │
│                                 │
│  Date of Birth *               │
│  ┌─────────────────────────┐   │
│  │  March 15, 1996         │   │  ← Native date picker
│  └─────────────────────────┘   │
│                                 │
│  Time of Birth                 │
│  ┌──────────┐                  │
│  │  14:30   │  24-hour picker  │  ← ScrollPicker (HH:MM)
│  └──────────┘                  │
│  ℹ️ Check your birth           │
│    certificate or ask family   │
│                                 │
│  □ I don't know my birth time  │  ← Toggle: sets time=null,
│                                 │    uses noon as estimate
│                                 │
│  Birth Location *              │
│  ┌─────────────────────────┐   │
│  │ 🔍 Addis Ababa, Eth... │   │  ← Google Places Autocomplete
│  └─────────────────────────┘   │
│  Resolved: 9.0192° N, 38.7525°│  ← Shows lat/lng confirmation
│  Timezone: Africa/Addis_Ababa  │
│                                 │
│  ┌─────────────────────────┐   │
│  │   Calculate My Chart    │   │  ← Gold gradient button
│  └─────────────────────────┘   │
│                                 │
│  Your data is encrypted and    │
│  never shared. 🔒              │
└─────────────────────────────────┘
```

### 3.2 Birth Location — Google Places Integration

```typescript
// Mobile: expo-google-places or react-native-google-places-autocomplete
// Web: @react-google-maps/api or use Places API directly

// API Key scoped to:
//  - Places API (Autocomplete, Place Details)
//  - Geocoding API (for lat/lng)
//  - Restricted to app bundle IDs + web domains

interface BirthLocationInput {
  query: string;              // User types "Addis Ababa"
}

interface BirthLocationResolved {
  placeId: string;            // Google Place ID
  city: string;               // "Addis Ababa"
  country: string;            // "Ethiopia"
  latitude: number;           // 9.0192
  longitude: number;          // 38.7525
  timezone: string;           // "Africa/Addis_Ababa" (via TimeZone API or tz-lookup)
  utcOffset: number;          // +3
}

// Flow:
// 1. User types → debounced autocomplete request (300ms)
// 2. Google Places Autocomplete → returns suggestions
//    Filter: types=['(cities)'] to only show cities
// 3. User selects city → Place Details API → lat/lng
// 4. Lat/lng → timezone-lookup (node package, no API needed)
//    OR Google TimeZone API for precision
// 5. Store all resolved data
```

### 3.3 Natal Chart Generation — Processing Pipeline

```
User Input                    API Server                    Chart Calculator
    |                             |                              |
    |-- POST /api/v1/birth-data ->|                              |
    |   {                         |                              |
    |     dateOfBirth: "1996-03-15",                             |
    |     timeOfBirth: "14:30",   |                              |
    |     birthCity: "Addis Ababa",                              |
    |     birthCountry: "Ethiopia",                              |
    |     birthLat: 9.0192,       |                              |
    |     birthLng: 38.7525,      |                              |
    |     birthTimezone: "Africa/Addis_Ababa"                    |
    |   }                         |                              |
    |                             |                              |
    |                             |-- Calculate Western Chart --->|
    |                             |   Input: UTC datetime + lat/lng
    |                             |   Using: swiss-ephemeris or   |
    |                             |   astrology-engine (npm)      |
    |                             |                              |
    |                             |   Process:                   |
    |                             |   1. Convert local time →    |
    |                             |      Julian Date (UTC)       |
    |                             |   2. Calculate planetary     |
    |                             |      positions at birth:     |
    |                             |      Sun, Moon, Mercury,     |
    |                             |      Venus, Mars, Jupiter,   |
    |                             |      Saturn, Uranus, Neptune,|
    |                             |      Pluto                   |
    |                             |   3. Calculate house cusps   |
    |                             |      using Placidus system   |
    |                             |   4. Determine Ascendant     |
    |                             |      (Rising sign) from      |
    |                             |      lat/lng + sidereal time |
    |                             |   5. Map each planet → sign  |
    |                             |                              |
    |                             |   Output:                    |
    |                             |   { sunSign: "Pisces",       |
    |                             |     moonSign: "Scorpio",     |
    |                             |     risingSign: "Leo",       |
    |                             |     venusSign: "Aquarius",   |
    |                             |     marsSign: "Pisces",      |
    |                             |     mercurySign: "Pisces" }  |
    |                             |                              |
    |                             |-- Calculate Vedic Chart ----->|
    |                             |   Input: Same datetime       |
    |                             |   Process:                   |
    |                             |   1. Apply Ayanamsa          |
    |                             |      correction (Lahiri:     |
    |                             |      ~23.85° for 1996)       |
    |                             |   2. Sidereal positions      |
    |                             |   3. Moon's Nakshatra =      |
    |                             |      lunar mansion (1 of 27) |
    |                             |   4. Nakshatra pada =        |
    |                             |      sub-division (1-4)      |
    |                             |   5. Rashi = Vedic Moon sign |
    |                             |                              |
    |                             |   Output:                    |
    |                             |   { rashi: "Vrischika",      |
    |                             |     nakshatra: "Anuradha",   |
    |                             |     nakshatraPada: 3 }       |
    |                             |                              |
    |                             |-- Calculate Chinese Zodiac -->|
    |                             |   Input: Birth year (lunar   |
    |                             |   calendar adjusted)         |
    |                             |   Process:                   |
    |                             |   1. Convert Gregorian →     |
    |                             |      Chinese lunar year      |
    |                             |   2. year % 12 → Animal      |
    |                             |   3. Heavenly Stem → Element |
    |                             |   4. year % 2 → Yin/Yang     |
    |                             |                              |
    |                             |   Output:                    |
    |                             |   { animal: "Rat",           |
    |                             |     element: "Fire",         |
    |                             |     yinYang: "Yang" }        |
    |                             |                              |
    |                             |<-- All 3 charts calculated --|
    |                             |                              |
    |                             |-- Store in birth_data table  |
    |                             |-- Cache chart as JSON in     |
    |                             |   Redis for fast matching    |
    |                             |                              |
    |<-- Return combined result --|                              |
    |   {                         |                              |
    |     western: { sun, moon,   |                              |
    |       rising, venus, mars,  |                              |
    |       mercury },            |                              |
    |     vedic: { rashi,         |                              |
    |       nakshatra, pada },    |                              |
    |     chinese: { animal,      |                              |
    |       element, yinYang },   |                              |
    |     chartImageUrl: "..."    |  ← Optional: SVG natal wheel |
    |   }                         |                              |
```

### 3.4 Chart Generation Libraries

```typescript
// packages/matching-engine/src/charts/natal-chart.ts

// Option A: swiss-ephemeris (most accurate, C++ bindings)
// npm install swisseph
// Pros: Astronomical precision, used by professional astrologers
// Cons: Native dependency, harder to deploy

// Option B: astronomia (pure JS)
// npm install astronomia
// Pros: No native deps, works everywhere
// Cons: Slightly less precise for outer planets

// Option C: Hybrid approach (RECOMMENDED)
// - Use astronomia for basic sun/moon/rising (fast, good enough)
// - Use swiss-ephemeris via ML service (Python: pyswisseph) for full chart
// - Cache results aggressively (chart never changes)

// Vedic calculation:
// Western longitude - Ayanamsa = Sidereal longitude
// Lahiri Ayanamsa for 1996 ≈ 23.85°
// Example: Sun at 25° Pisces (tropical) = 1° Pisces (sidereal)

// Nakshatra calculation:
// Moon's sidereal longitude / 13.333° = Nakshatra index (0-26)
// Each Nakshatra = 13°20' of the zodiac
// Each Nakshatra has 4 padas (quarters) of 3°20'
```

### 3.5 "I Don't Know My Birth Time" Handling

```typescript
// If user checks "I don't know my birth time":
// 1. Store timeOfBirth = null
// 2. Use 12:00 noon as estimate for chart calculation
// 3. Mark chart confidence = 'low' (affects Rising sign accuracy)
// 4. Sun sign, Chinese zodiac: still accurate (date-based)
// 5. Moon sign: may be off by ±1 sign (moves ~13°/day)
// 6. Rising sign: UNKNOWN (changes every ~2 hours)
// 7. In compatibility scoring:
//    - Skip Rising sign comparisons
//    - Reduce western astrology weight by 30%
//    - Increase behavioral weight to compensate
// 8. Show user: "Add your birth time later for more accurate matches"
//    with a persistent but non-intrusive banner
```

---

## Module 4: Recommendation Engine

### 4.1 Discovery Feed Architecture

The feed is NOT purely algorithmic swipe-through. It's a **referral-weighted, multi-signal queue**.

```
┌─────────────────────────────────────────────────────────────────┐
│                    DISCOVERY FEED PIPELINE                       │
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │ Candidate│───>│  Score   │───>│  Boost   │───>│  Rank &  │ │
│  │  Pool    │    │  Engine  │    │  Layer   │    │  Serve   │ │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
│                                                                 │
│  Stage 1: CANDIDATE POOL                                        │
│  ├── Filter: gender preference, age range, distance             │
│  ├── Exclude: already swiped, blocked, self                     │
│  └── Pool size: ~500-2000 candidates                            │
│                                                                 │
│  Stage 2: SCORE ENGINE (existing UnifiedCompatibilityEngine)    │
│  ├── Behavioral:  40% (Big Five personality + interests)        │
│  ├── Western:     20% (synastry aspects)                        │
│  ├── Vedic:       15% (Guna Milan 36-point)                     │
│  ├── Chinese:     10% (animal + element compatibility)          │
│  ├── Palmistry:    5% (trait complementarity)                   │
│  └── Profile:     10% (shared interests, lifestyle)             │
│      = base_score (0-100)                                       │
│                                                                 │
│  Stage 3: REFERRAL BOOST LAYER  ← This is the differentiator   │
│  ├── +15 pts: Mutual friend referred both users                 │
│  ├── +12 pts: "Vouched for" — a friend explicitly recommended   │
│  ├── +10 pts: Share 2+ mutual connections                       │
│  ├── +8 pts:  Share 1 mutual connection                         │
│  ├── +5 pts:  Invited by someone in your extended network       │
│  ├── +3 pts:  High trust_score (quality referral chain)         │
│  └── Trust multiplier: base_score × (1 + trust_factor × 0.15)  │
│                                                                 │
│  Stage 4: RANK & SERVE                                          │
│  ├── Sort by final_score DESC                                   │
│  ├── Inject variety: max 3 consecutive high-score profiles      │
│  ├── Pin "Referred for you" cards at positions 1, 4, 8          │
│  └── Paginate: 20 profiles per batch, prefetch next 20          │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Referral Impact on Queue — Detailed Logic

```typescript
// packages/matching-engine/src/engines/referral-boost.ts

interface ReferralSignal {
  type: 'vouched' | 'mutual_friend' | 'network_connection' | 'trust_chain';
  strength: number;           // 0-1
  referrerName?: string;      // For "Vouched by Sara" badge
  mutualCount?: number;       // Number of mutual connections
}

function calculateReferralBoost(
  userId: string,
  candidateId: string,
  signals: ReferralSignal[]
): { boost: number; badge?: string; badgeDetail?: string } {

  let boost = 0;
  let badge: string | undefined;
  let badgeDetail: string | undefined;

  for (const signal of signals) {
    switch (signal.type) {
      case 'vouched':
        // A mutual friend explicitly said "you two should meet"
        // This is the HIGHEST signal — real human endorsement
        boost += 15 * signal.strength;
        badge = 'vouched';
        badgeDetail = `Vouched for by ${signal.referrerName}`;
        break;

      case 'mutual_friend':
        // Both users were invited by the same person
        // OR both are friends with someone on the platform
        boost += Math.min(signal.mutualCount! * 5, 12);
        badge = badge || 'mutual';
        badgeDetail = badgeDetail || `${signal.mutualCount} mutual connections`;
        break;

      case 'network_connection':
        // Connected through 2-degree referral chain
        // User A invited User B who invited Candidate
        boost += 8 * signal.strength;
        badge = badge || 'network';
        badgeDetail = badgeDetail || 'In your extended circle';
        break;

      case 'trust_chain':
        // Candidate has high trust_score from quality referral history
        boost += 3 * signal.strength;
        break;
    }
  }

  return { boost: Math.min(boost, 20), badge, badgeDetail };
  // Cap at +20 to prevent referrals from completely overriding compatibility
}
```

### 4.3 Profile Cards with Referral Badges

```
┌──────────────────────────────────┐
│                                  │
│  ┌────────────────────────────┐  │
│  │                            │  │
│  │      [Profile Photo]       │  │
│  │                            │  │
│  │  ┌──────────────────────┐  │  │
│  │  │ 🤝 Vouched for by   │  │  │  ← Referral badge overlay
│  │  │    Sara              │  │  │     Gold border + icon
│  │  └──────────────────────┘  │  │
│  │                            │  │
│  │  Hana, 25                  │  │
│  │  📍 2 km away              │  │
│  │                            │  │
│  │  ┌────┐ ┌────┐ ┌────┐    │  │
│  │  │ 87%│ │ ♓  │ │ 🐉 │    │  │  ← Match % | Sun sign | Chinese
│  │  │match│ │Rise│ │Fire│    │  │
│  │  └────┘ └────┘ └────┘    │  │
│  │                            │  │
│  └────────────────────────────┘  │
│                                  │
│   [✕ Pass]  [⭐ Super]  [♥ Like] │
│                                  │
│  "Sara thinks you two would     │
│   really click — you both love  │
│   hiking and have compatible    │
│   charts."                      │  ← Referrer's message shown
│                                  │
└──────────────────────────────────┘

Badge types:
┌──────────────────────┐
│ 🤝 Vouched for by X  │  ← Direct recommendation (gold badge)
│ 👥 3 mutual friends   │  ← Shared connections (blue badge)
│ 🔗 In your circle     │  ← Network proximity (subtle badge)
│ ⭐ Top compatibility  │  ← No referral, but >90% match (purple badge)
└──────────────────────┘
```

### 4.4 Trust Score Calculation

```typescript
// A user's trust_score reflects the quality of their referral chain
// and behavior on the platform.

function calculateTrustScore(userId: string): number {
  const weights = {
    referralChainDepth: 0.15,     // How many levels from an "OG" user
    referrerTrustScore: 0.25,     // Trust of the person who invited them
    profileCompleteness: 0.15,    // Completed onboarding, verified photos
    behaviorQuality: 0.20,        // Report rate, match response rate
    referralSuccess: 0.15,        // % of their referrals that became active
    accountAge: 0.10,             // Longer = more trusted
  };

  // Scores are 0-1, weighted sum = trust_score
  // Stored on users table, recalculated weekly via cron job
  // Used in: discovery ranking, spam detection, feature unlocks
}
```

### 4.5 SQL: Referral-Boosted Discovery Query

```sql
-- Core discovery query with referral signals
WITH candidate_pool AS (
  -- Stage 1: Filter eligible candidates
  SELECT p.user_id, p.first_name, p.location_lat, p.location_lng,
         p.date_of_birth, p.interests, p.gender
  FROM profiles p
  JOIN users u ON u.id = p.user_id
  WHERE u.is_active = true
    AND u.is_onboarded = true
    AND p.user_id != :current_user_id
    AND p.gender = :preferred_gender        -- or 'everyone'
    AND EXTRACT(YEAR FROM AGE(p.date_of_birth)) BETWEEN :age_min AND :age_max
    AND p.user_id NOT IN (SELECT target_id FROM swipes WHERE swiper_id = :current_user_id)
    -- Distance filter (approximate, using lat/lng)
    AND (
      6371 * acos(cos(radians(:user_lat)) * cos(radians(p.location_lat))
      * cos(radians(p.location_lng) - radians(:user_lng))
      + sin(radians(:user_lat)) * sin(radians(p.location_lat)))
    ) <= :max_distance_km
),
referral_signals AS (
  -- Stage 3: Compute referral boost per candidate
  SELECT
    cp.user_id AS candidate_id,
    -- Direct vouch: someone referred this candidate TO the current user
    MAX(CASE WHEN r.referred_for_id = :current_user_id AND r.status = 'accepted' THEN 15 ELSE 0 END) AS vouch_boost,
    -- Mutual inviter: both users were invited by the same person
    MAX(CASE WHEN u_me.invited_by = u_them.invited_by AND u_me.invited_by IS NOT NULL THEN 10 ELSE 0 END) AS mutual_inviter_boost,
    -- Network proximity: count mutual connections
    COALESCE(mc.mutual_count, 0) * 4 AS network_boost
  FROM candidate_pool cp
  LEFT JOIN referrals r ON r.candidate_id = cp.user_id AND r.referred_for_id = :current_user_id
  LEFT JOIN users u_me ON u_me.id = :current_user_id
  LEFT JOIN users u_them ON u_them.id = cp.user_id
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS mutual_count FROM (
      SELECT invited_by FROM users WHERE id = :current_user_id AND invited_by IS NOT NULL
      INTERSECT
      SELECT invited_by FROM users WHERE id = cp.user_id AND invited_by IS NOT NULL
    ) mc_sub
  ) mc ON true
  GROUP BY cp.user_id
),
scored AS (
  -- Stage 2 + 3: Combine compatibility + referral boost
  SELECT
    cp.user_id,
    COALESCE(cs.overall_score, 50) AS base_score,
    LEAST(COALESCE(rs.vouch_boost, 0) + COALESCE(rs.mutual_inviter_boost, 0) + COALESCE(rs.network_boost, 0), 20) AS referral_boost,
    COALESCE(cs.overall_score, 50) + LEAST(COALESCE(rs.vouch_boost, 0) + COALESCE(rs.mutual_inviter_boost, 0) + COALESCE(rs.network_boost, 0), 20) AS final_score,
    CASE
      WHEN rs.vouch_boost > 0 THEN 'vouched'
      WHEN rs.mutual_inviter_boost > 0 THEN 'mutual'
      WHEN rs.network_boost > 0 THEN 'network'
      ELSE NULL
    END AS referral_badge
  FROM candidate_pool cp
  LEFT JOIN compatibility_scores cs ON (
    (cs.user1_id = LEAST(:current_user_id, cp.user_id) AND cs.user2_id = GREATEST(:current_user_id, cp.user_id))
  )
  LEFT JOIN referral_signals rs ON rs.candidate_id = cp.user_id
)
-- Stage 4: Rank and serve
SELECT * FROM scored
ORDER BY
  -- Pin vouched profiles at top
  CASE WHEN referral_badge = 'vouched' THEN 0 ELSE 1 END,
  final_score DESC
LIMIT 20 OFFSET :page_offset;
```

---

## Technical Stack Recommendation

### Database Layer

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Primary DB** | **PostgreSQL 16** (already in use) | Relational integrity for users/referrals/matches. JSONB for flexible traits. PostGIS extension for geo queries. |
| **Cache** | **Redis 7** (already in use) | Session tokens, rate limiting, online presence, compatibility score cache, real-time pub/sub for chat. |
| **Search** | **PostgreSQL full-text** → **Meilisearch** at scale | Profile search, interest matching. Start with pg_trgm, migrate to Meilisearch when >100K users. |

### Media Storage

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Object Storage** | **Cloudflare R2** (or AWS S3) | Zero egress fees (R2), presigned uploads, lifecycle policies for cleanup. |
| **Image CDN** | **Cloudflare Images** or **imgproxy** | On-the-fly resize/format conversion. Serve WebP to mobile, AVIF to modern browsers. |
| **Palm Scan Processing** | Store originals in S3, process via **ML service** (FastAPI + MediaPipe), store annotated results back to S3. |

### Backend Services

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **API Server** | **Express 5** (existing) | Already built. Add API versioning (/v1/, /v2/). |
| **ML Service** | **FastAPI (Python)** | MediaPipe for hand detection, OpenCV for line extraction. Separate service = independent scaling. |
| **Chart Calculation** | **astronomia** (npm) + **pyswisseph** (Python) | JS for quick sun/moon, Python for precision full charts. |
| **Background Jobs** | **BullMQ** (Redis-backed) | Photo processing, chart calculation, trust score updates, referral expiry. |
| **Real-time** | **Socket.io** (existing) | Chat, online presence, match notifications. |

### Infrastructure

```
┌──────────────────────────────────────────────────────────┐
│                    Production Architecture                │
│                                                          │
│  Mobile App ──→ CDN (Cloudflare) ──→ Load Balancer      │
│  Web App ────→                       │                   │
│                                      ▼                   │
│                              ┌──────────────┐            │
│                              │  Express API  │ ×3        │
│                              │  (Node.js)    │            │
│                              └──────┬───────┘            │
│                                     │                     │
│                    ┌────────────────┼────────────────┐   │
│                    ▼                ▼                ▼   │
│             ┌──────────┐    ┌──────────┐    ┌────────┐  │
│             │PostgreSQL│    │  Redis   │    │  R2/S3 │  │
│             │ Primary  │    │ Cluster  │    │ Media  │  │
│             │ + Replica│    │          │    │ Store  │  │
│             └──────────┘    └──────────┘    └────────┘  │
│                                     │                     │
│                              ┌──────────────┐            │
│                              │  ML Service   │ ×1-2      │
│                              │  (FastAPI)    │            │
│                              │  + GPU (opt)  │            │
│                              └──────────────┘            │
│                                     │                     │
│                              ┌──────────────┐            │
│                              │  BullMQ      │            │
│                              │  Workers ×2  │            │
│                              └──────────────┘            │
└──────────────────────────────────────────────────────────┘
```

---

## Implementation Priority

### Phase 1 (Weeks 1-3): Core Referral Loop
1. `invite_links` table + API routes
2. Deep link generation + resolution (Expo Linking)
3. Welcome screen with inviter context
4. Phone/email registration with OTP
5. Credit system (basic)

### Phase 2 (Weeks 4-6): Profile & Photos
1. Multi-slot photo uploader (mobile)
2. S3 presigned upload flow
3. Image processing worker (resize, NSFW check)
4. Basic profile form (name, DOB, gender, bio)

### Phase 3 (Weeks 7-9): Astrology Engine
1. Birth details form with Google Places
2. Western chart calculation (astronomia)
3. Vedic/Chinese calculation
4. Store in birth_data table
5. Connect to existing matching engine

### Phase 4 (Weeks 10-12): Palmistry + Discovery
1. ML service skeleton (FastAPI + MediaPipe)
2. Palm camera overlay (React Native)
3. Line detection + trait mapping
4. Referral boost layer in discovery
5. Profile cards with referral badges

### Phase 5 (Weeks 13-16): Polish & Scale
1. Trust score system
2. Real-time chat integration
3. Push notifications
4. Performance optimization (query tuning, caching)
5. Beta testing with invite-only launch
