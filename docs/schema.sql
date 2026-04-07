-- Agar (አጋር) Database Schema
-- PostgreSQL 16 with PostGIS extension
-- Generated: 2026-04-07

-- ============================================================
-- Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "postgis";     -- Geolocation queries

-- ============================================================
-- Enums
-- ============================================================
CREATE TYPE auth_provider AS ENUM ('email', 'google', 'apple', 'facebook');
CREATE TYPE user_role AS ENUM ('user', 'referrer', 'admin');
CREATE TYPE swipe_action AS ENUM ('like', 'pass', 'super_like');
CREATE TYPE swipe_source AS ENUM ('self', 'referral');
CREATE TYPE message_type AS ENUM ('text', 'image', 'gif', 'voice');
CREATE TYPE referral_status AS ENUM ('pending', 'seen_by_referee', 'accepted', 'declined', 'expired');
CREATE TYPE referral_response AS ENUM ('interested', 'not_interested');
CREATE TYPE report_reason AS ENUM ('inappropriate', 'fake', 'harassment', 'spam', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'action_taken', 'dismissed');
CREATE TYPE looking_for_type AS ENUM ('relationship', 'marriage', 'friendship');
CREATE TYPE notification_channel AS ENUM ('push', 'email', 'in_app');
CREATE TYPE email_digest_freq AS ENUM ('daily', 'weekly', 'never');

-- ============================================================
-- Users
-- ============================================================
CREATE TABLE users (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email             VARCHAR(255) UNIQUE NOT NULL,
    phone             VARCHAR(20) UNIQUE,
    password_hash     VARCHAR(255),
    display_name      VARCHAR(100) NOT NULL,
    locale            VARCHAR(5) NOT NULL DEFAULT 'en'
                      CHECK (locale IN ('en', 'am', 'es')),
    role              user_role NOT NULL DEFAULT 'user',
    auth_provider     auth_provider NOT NULL,
    auth_provider_id  VARCHAR(255),
    is_verified       BOOLEAN NOT NULL DEFAULT FALSE,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    is_banned         BOOLEAN NOT NULL DEFAULT FALSE,
    last_active_at    TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_active ON users (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_users_provider ON users (auth_provider, auth_provider_id)
    WHERE auth_provider_id IS NOT NULL;

-- ============================================================
-- Refresh Tokens (for rotation tracking)
-- ============================================================
CREATE TABLE refresh_tokens (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash        VARCHAR(255) NOT NULL UNIQUE,
    family_id         UUID NOT NULL,            -- groups related tokens for revocation
    is_revoked        BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at        TIMESTAMPTZ NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_family ON refresh_tokens (family_id);

-- ============================================================
-- Profiles
-- ============================================================
CREATE TABLE profiles (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gender            VARCHAR(20) NOT NULL,
    gender_preference VARCHAR(20)[] NOT NULL DEFAULT '{}',
    bio               TEXT,
    date_of_birth     DATE NOT NULL,
    height_cm         INTEGER CHECK (height_cm BETWEEN 100 AND 250),
    location_lat      DECIMAL(10,8),
    location_lng      DECIMAL(11,8),
    location_city     VARCHAR(100),
    location_country  VARCHAR(100),
    education         VARCHAR(100),
    occupation        VARCHAR(100),
    religion          VARCHAR(50),
    ethnicity         VARCHAR(50),
    interests         TEXT[] NOT NULL DEFAULT '{}',
    looking_for       looking_for_type,
    max_distance_km   INTEGER NOT NULL DEFAULT 100 CHECK (max_distance_km > 0),
    age_range_min     INTEGER NOT NULL DEFAULT 18 CHECK (age_range_min >= 18),
    age_range_max     INTEGER NOT NULL DEFAULT 99 CHECK (age_range_max <= 99),
    profile_complete  BOOLEAN NOT NULL DEFAULT FALSE,
    allow_referral_discovery BOOLEAN NOT NULL DEFAULT TRUE,
    extra_fields      JSONB NOT NULL DEFAULT '{}',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (age_range_min <= age_range_max)
);

CREATE INDEX idx_profiles_location ON profiles
    USING GIST (ST_MakePoint(location_lng, location_lat))
    WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;
CREATE INDEX idx_profiles_gender ON profiles (gender);
CREATE INDEX idx_profiles_complete ON profiles (profile_complete) WHERE profile_complete = TRUE;
CREATE INDEX idx_profiles_religion ON profiles (religion) WHERE religion IS NOT NULL;

-- ============================================================
-- User Photos
-- ============================================================
CREATE TABLE user_photos (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url               VARCHAR(500) NOT NULL,
    position          INTEGER NOT NULL CHECK (position >= 0 AND position <= 8),
    is_verified       BOOLEAN NOT NULL DEFAULT FALSE,
    moderation_status VARCHAR(20) NOT NULL DEFAULT 'pending'
                      CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, position)
);

CREATE INDEX idx_photos_user ON user_photos (user_id, position);

-- ============================================================
-- Birth Data (Astrology input + cached computations)
-- ============================================================
CREATE TABLE birth_data (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth     DATE NOT NULL,
    time_of_birth     TIME,
    city_of_birth     VARCHAR(100),
    country_of_birth  VARCHAR(100),
    latitude          DECIMAL(10,8),
    longitude         DECIMAL(11,8),
    timezone          VARCHAR(50),
    -- Cached Western astrology
    western_sun_sign  VARCHAR(20),
    western_moon_sign VARCHAR(20),
    western_rising    VARCHAR(20),
    -- Cached Vedic astrology
    vedic_rashi       VARCHAR(20),
    vedic_nakshatra   VARCHAR(20),
    -- Cached Chinese zodiac
    chinese_animal    VARCHAR(20),
    chinese_element   VARCHAR(20),
    -- Full chart data
    natal_chart_data  JSONB,
    kundli_data       JSONB,
    palm_analysis     JSONB,
    palm_image_url    VARCHAR(500),
    computed_at       TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_birth_data_signs ON birth_data (western_sun_sign, chinese_animal);

-- ============================================================
-- Compatibility Scores (pairwise, computed async)
-- ============================================================
CREATE TABLE compatibility_scores (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_b_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Sub-scores (0.00 to 100.00)
    western_score     DECIMAL(5,2) CHECK (western_score BETWEEN 0 AND 100),
    vedic_score       DECIMAL(5,2) CHECK (vedic_score BETWEEN 0 AND 100),
    chinese_score     DECIMAL(5,2) CHECK (chinese_score BETWEEN 0 AND 100),
    palmistry_score   DECIMAL(5,2) CHECK (palmistry_score BETWEEN 0 AND 100),
    behavioral_score  DECIMAL(5,2) CHECK (behavioral_score BETWEEN 0 AND 100),
    -- Weighted aggregate
    overall_score     DECIMAL(5,2) NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    -- Metadata
    score_breakdown   JSONB NOT NULL DEFAULT '{}',
    weights_used      JSONB NOT NULL DEFAULT '{}',
    computed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at        TIMESTAMPTZ,
    UNIQUE(user_a_id, user_b_id),
    CHECK (user_a_id < user_b_id)
);

CREATE INDEX idx_compat_user_a ON compatibility_scores (user_a_id);
CREATE INDEX idx_compat_user_b ON compatibility_scores (user_b_id);
CREATE INDEX idx_compat_overall ON compatibility_scores (overall_score DESC);
CREATE INDEX idx_compat_expires ON compatibility_scores (expires_at)
    WHERE expires_at IS NOT NULL;

-- ============================================================
-- Swipe History
-- ============================================================
CREATE TABLE swipe_history (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    swiper_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    swiped_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action            swipe_action NOT NULL,
    source            swipe_source NOT NULL DEFAULT 'self',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(swiper_id, swiped_id)
);

CREATE INDEX idx_swipe_swiper ON swipe_history (swiper_id, created_at DESC);
CREATE INDEX idx_swipe_swiped ON swipe_history (swiped_id, action)
    WHERE action = 'like';
-- For match detection: find mutual likes
CREATE INDEX idx_swipe_mutual ON swipe_history (swiped_id, swiper_id)
    WHERE action IN ('like', 'super_like');

-- ============================================================
-- Referral Permissions
-- ============================================================
CREATE TABLE referral_permissions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referrer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship      VARCHAR(30) NOT NULL,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    granted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, referrer_id),
    CHECK (user_id != referrer_id)
);

CREATE INDEX idx_refperm_user ON referral_permissions (user_id) WHERE is_active = TRUE;
CREATE INDEX idx_refperm_referrer ON referral_permissions (referrer_id) WHERE is_active = TRUE;

-- ============================================================
-- Referrals
-- ============================================================
CREATE TABLE referrals (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referee_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    candidate_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status            referral_status NOT NULL DEFAULT 'pending',
    referrer_note     TEXT,
    referee_response  referral_response,
    candidate_response referral_response,
    expires_at        TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(referrer_id, referee_id, candidate_id),
    CHECK (referrer_id != referee_id),
    CHECK (referrer_id != candidate_id),
    CHECK (referee_id != candidate_id)
);

CREATE INDEX idx_referrals_referee ON referrals (referee_id, status);
CREATE INDEX idx_referrals_candidate ON referrals (candidate_id, status);
CREATE INDEX idx_referrals_referrer ON referrals (referrer_id, created_at DESC);
CREATE INDEX idx_referrals_expires ON referrals (expires_at)
    WHERE status = 'pending';

-- ============================================================
-- Matches
-- ============================================================
CREATE TABLE matches (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_b_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source            swipe_source NOT NULL DEFAULT 'self',
    referral_id       UUID REFERENCES referrals(id),
    matched_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    unmatched_at      TIMESTAMPTZ,
    unmatched_by      UUID REFERENCES users(id),
    UNIQUE(user_a_id, user_b_id),
    CHECK (user_a_id < user_b_id)
);

CREATE INDEX idx_matches_user_a ON matches (user_a_id) WHERE is_active = TRUE;
CREATE INDEX idx_matches_user_b ON matches (user_b_id) WHERE is_active = TRUE;
CREATE INDEX idx_matches_active ON matches (is_active, matched_at DESC);

-- ============================================================
-- Messages
-- ============================================================
CREATE TABLE messages (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id          UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    sender_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content           TEXT,
    message_type      message_type NOT NULL DEFAULT 'text',
    media_url         VARCHAR(500),
    is_read           BOOLEAN NOT NULL DEFAULT FALSE,
    read_at           TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_match ON messages (match_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages (match_id, is_read)
    WHERE is_read = FALSE;

-- ============================================================
-- Blocked Users
-- ============================================================
CREATE TABLE blocked_users (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason            VARCHAR(50),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
);

CREATE INDEX idx_blocked_blocker ON blocked_users (blocker_id);
CREATE INDEX idx_blocked_blocked ON blocked_users (blocked_id);

-- ============================================================
-- Reports
-- ============================================================
CREATE TABLE reports (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason            report_reason NOT NULL,
    description       TEXT,
    status            report_status NOT NULL DEFAULT 'pending',
    reviewed_by       UUID REFERENCES users(id),
    reviewed_at       TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (reporter_id != reported_id)
);

CREATE INDEX idx_reports_status ON reports (status) WHERE status = 'pending';
CREATE INDEX idx_reports_reported ON reports (reported_id);

-- ============================================================
-- Notification Preferences
-- ============================================================
CREATE TABLE notification_preferences (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    new_match         BOOLEAN NOT NULL DEFAULT TRUE,
    new_message       BOOLEAN NOT NULL DEFAULT TRUE,
    referral_update   BOOLEAN NOT NULL DEFAULT TRUE,
    compatibility_ready BOOLEAN NOT NULL DEFAULT TRUE,
    email_digest      email_digest_freq NOT NULL DEFAULT 'daily',
    push_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Push Tokens (for mobile notifications)
-- ============================================================
CREATE TABLE push_tokens (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token             VARCHAR(500) NOT NULL,
    platform          VARCHAR(10) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, token)
);

CREATE INDEX idx_push_tokens_user ON push_tokens (user_id) WHERE is_active = TRUE;

-- ============================================================
-- Async Job Tracking (mirrors BullMQ for queryability)
-- ============================================================
CREATE TABLE async_jobs (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_type          VARCHAR(50) NOT NULL,
    queue_name        VARCHAR(50) NOT NULL,
    bull_job_id       VARCHAR(100),
    status            VARCHAR(20) NOT NULL DEFAULT 'queued'
                      CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    payload           JSONB NOT NULL DEFAULT '{}',
    result            JSONB,
    error_message     TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at        TIMESTAMPTZ,
    completed_at      TIMESTAMPTZ
);

CREATE INDEX idx_jobs_user ON async_jobs (user_id, job_type, status);
CREATE INDEX idx_jobs_status ON async_jobs (status) WHERE status IN ('queued', 'processing');

-- ============================================================
-- Updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_birth_data_updated_at BEFORE UPDATE ON birth_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_referrals_updated_at BEFORE UPDATE ON referrals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_notif_prefs_updated_at BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Helper view: discover feed candidates
-- Excludes blocked, already-swiped, and inactive users
-- ============================================================
CREATE OR REPLACE VIEW discover_candidates AS
SELECT
    p.user_id,
    p.gender,
    p.gender_preference,
    p.date_of_birth,
    p.location_lat,
    p.location_lng,
    p.location_city,
    p.religion,
    p.ethnicity,
    p.looking_for,
    p.interests,
    u.display_name,
    u.is_verified,
    u.last_active_at
FROM profiles p
JOIN users u ON u.id = p.user_id
WHERE u.is_active = TRUE
  AND u.is_banned = FALSE
  AND p.profile_complete = TRUE;
