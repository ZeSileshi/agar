import {
  pgTable, uuid, varchar, text, integer, boolean,
  timestamp, real, jsonb, pgEnum, index, uniqueIndex,
} from 'drizzle-orm/pg-core';

// Enums
export const genderEnum = pgEnum('gender', ['male', 'female', 'non_binary', 'other']);
export const genderPrefEnum = pgEnum('gender_preference', ['male', 'female', 'everyone']);
export const verificationEnum = pgEnum('verification_status', ['unverified', 'pending', 'verified']);
export const matchStatusEnum = pgEnum('match_status', ['pending', 'matched', 'unmatched', 'expired']);
export const matchModeEnum = pgEnum('match_mode', ['self', 'referral']);
export const swipeActionEnum = pgEnum('swipe_action', ['like', 'pass', 'super_like']);
export const messageTypeEnum = pgEnum('message_type', ['text', 'image', 'voice', 'icebreaker', 'system']);
export const messageStatusEnum = pgEnum('message_status', ['sending', 'sent', 'delivered', 'read', 'failed']);
export const referralStatusEnum = pgEnum('referral_status', ['pending', 'accepted', 'declined', 'expired']);
export const languageEnum = pgEnum('language', ['en', 'am', 'es']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique(),
  phone: varchar('phone', { length: 20 }).unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  language: languageEnum('language').default('en').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isOnboarded: boolean('is_onboarded').default(false).notNull(),
  verificationStatus: verificationEnum('verification_status').default('unverified').notNull(),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('users_email_idx').on(table.email),
  index('users_phone_idx').on(table.phone),
  index('users_active_idx').on(table.isActive),
]);

// Profiles table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }),
  displayName: varchar('display_name', { length: 200 }).notNull(),
  dateOfBirth: timestamp('date_of_birth', { withTimezone: true }).notNull(),
  gender: genderEnum('gender').notNull(),
  genderPreference: genderPrefEnum('gender_preference').default('everyone').notNull(),
  bio: text('bio'),
  height: integer('height'), // cm
  education: varchar('education', { length: 200 }),
  occupation: varchar('occupation', { length: 200 }),
  interests: jsonb('interests').$type<string[]>().default([]).notNull(),
  relationshipGoal: varchar('relationship_goal', { length: 50 }),
  locationLat: real('location_lat'),
  locationLng: real('location_lng'),
  locationCity: varchar('location_city', { length: 100 }),
  locationCountry: varchar('location_country', { length: 100 }),
  maxDistance: integer('max_distance').default(50).notNull(), // km
  ageRangeMin: integer('age_range_min').default(18).notNull(),
  ageRangeMax: integer('age_range_max').default(50).notNull(),
  showOnlineStatus: boolean('show_online_status').default(true).notNull(),
  showDistance: boolean('show_distance').default(true).notNull(),
  showAge: boolean('show_age').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('profiles_user_id_idx').on(table.userId),
  index('profiles_location_idx').on(table.locationLat, table.locationLng),
  index('profiles_gender_pref_idx').on(table.gender, table.genderPreference),
]);

// Photos table
export const photos = pgTable('photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }).notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  order: integer('order').default(0).notNull(),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('photos_user_id_idx').on(table.userId),
]);

// Birth data for astrology
export const birthData = pgTable('birth_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  dateOfBirth: timestamp('date_of_birth', { withTimezone: true }).notNull(),
  timeOfBirth: varchar('time_of_birth', { length: 5 }), // HH:mm
  birthCity: varchar('birth_city', { length: 200 }),
  birthCountry: varchar('birth_country', { length: 100 }),
  birthLat: real('birth_lat'),
  birthLng: real('birth_lng'),
  birthTimezone: varchar('birth_timezone', { length: 100 }),
  // Western astrology
  sunSign: varchar('sun_sign', { length: 20 }),
  moonSign: varchar('moon_sign', { length: 20 }),
  risingSign: varchar('rising_sign', { length: 20 }),
  venusSign: varchar('venus_sign', { length: 20 }),
  marsSign: varchar('mars_sign', { length: 20 }),
  mercurySign: varchar('mercury_sign', { length: 20 }),
  // Vedic astrology
  rashi: varchar('rashi', { length: 20 }),
  nakshatra: varchar('nakshatra', { length: 30 }),
  nakshatraPada: integer('nakshatra_pada'),
  // Chinese zodiac
  chineseAnimal: varchar('chinese_animal', { length: 20 }),
  chineseElement: varchar('chinese_element', { length: 10 }),
  chineseYinYang: varchar('chinese_yin_yang', { length: 5 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('birth_data_user_id_idx').on(table.userId),
]);

// Swipe history
export const swipes = pgTable('swipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  swiperId: uuid('swiper_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  targetId: uuid('target_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  action: swipeActionEnum('action').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('swipes_pair_idx').on(table.swiperId, table.targetId),
  index('swipes_target_idx').on(table.targetId),
]);

// Matches
export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  user1Id: uuid('user1_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  user2Id: uuid('user2_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: matchStatusEnum('status').default('matched').notNull(),
  mode: matchModeEnum('mode').default('self').notNull(),
  compatibilityScore: real('compatibility_score'),
  referralId: uuid('referral_id'),
  matchedAt: timestamp('matched_at', { withTimezone: true }).defaultNow().notNull(),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
}, (table) => [
  uniqueIndex('matches_pair_idx').on(table.user1Id, table.user2Id),
  index('matches_user1_idx').on(table.user1Id),
  index('matches_user2_idx').on(table.user2Id),
]);

// Compatibility scores cache
export const compatibilityScores = pgTable('compatibility_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  user1Id: uuid('user1_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  user2Id: uuid('user2_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  overallScore: real('overall_score').notNull(),
  behavioralScore: real('behavioral_score'),
  westernScore: real('western_score'),
  vedicScore: real('vedic_score'),
  chineseScore: real('chinese_score'),
  palmistryScore: real('palmistry_score'),
  profileScore: real('profile_score'),
  confidence: real('confidence').default(0).notNull(),
  breakdown: jsonb('breakdown'),
  insights: jsonb('insights').$type<string[]>().default([]),
  calculatedAt: timestamp('calculated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('compat_pair_idx').on(table.user1Id, table.user2Id),
  index('compat_score_idx').on(table.overallScore),
]);

// Messages
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  matchId: uuid('match_id').references(() => matches.id, { onDelete: 'cascade' }).notNull(),
  senderId: uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: messageTypeEnum('type').default('text').notNull(),
  content: text('content').notNull(),
  mediaUrl: varchar('media_url', { length: 500 }),
  status: messageStatusEnum('status').default('sent').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
}, (table) => [
  index('messages_match_idx').on(table.matchId),
  index('messages_sender_idx').on(table.senderId),
  index('messages_created_idx').on(table.createdAt),
]);

// Referrals
export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  referrerId: uuid('referrer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  referredForId: uuid('referred_for_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  candidateId: uuid('candidate_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: referralStatusEnum('status').default('pending').notNull(),
  message: text('message'),
  compatibilityScore: real('compatibility_score'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  respondedAt: timestamp('responded_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
}, (table) => [
  index('referrals_referrer_idx').on(table.referrerId),
  index('referrals_for_idx').on(table.referredForId),
  index('referrals_candidate_idx').on(table.candidateId),
]);

// User preferences for compatibility weights
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  compatibilityWeights: jsonb('compatibility_weights').$type<{
    behavioral: number;
    western: number;
    vedic: number;
    chinese: number;
    palmistry: number;
    profile: number;
  }>().default({
    behavioral: 0.40,
    western: 0.20,
    vedic: 0.15,
    chinese: 0.10,
    palmistry: 0.05,
    profile: 0.10,
  }).notNull(),
  pushNotifications: boolean('push_notifications').default(true).notNull(),
  emailNotifications: boolean('email_notifications').default(true).notNull(),
  darkMode: boolean('dark_mode').default(false).notNull(),
}, (table) => [
  uniqueIndex('user_prefs_user_id_idx').on(table.userId),
]);
