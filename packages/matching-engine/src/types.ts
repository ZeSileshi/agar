// =============================================================================
// Agar Compatibility Intelligence Engine - Core Types
// =============================================================================

// ---------------------------------------------------------------------------
// Western Astrology Types
// ---------------------------------------------------------------------------

export type ZodiacSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer'
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio'
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type WesternElement = 'Fire' | 'Earth' | 'Air' | 'Water';

export type Modality = 'Cardinal' | 'Fixed' | 'Mutable';

export type PlanetaryAspect =
  | 'conjunction'   // 0 degrees
  | 'sextile'       // 60 degrees
  | 'square'        // 90 degrees
  | 'trine'         // 120 degrees
  | 'opposition';   // 180 degrees

export type Planet = 'Sun' | 'Moon' | 'Venus' | 'Mars' | 'Mercury';

export interface WesternChart {
  sun: ZodiacSign;
  moon: ZodiacSign;
  venus: ZodiacSign;
  mars: ZodiacSign;
  mercury: ZodiacSign;
}

export interface WesternAstrologyResult {
  score: number;            // 0-100
  breakdown: {
    sunCompatibility: number;
    moonCompatibility: number;
    venusCompatibility: number;
    marsCompatibility: number;
    mercuryCompatibility: number;
    elementHarmony: number;
    modalityBalance: number;
    aspectScore: number;
  };
  dominantAspects: PlanetaryAspect[];
  strengths: string[];
  challenges: string[];
}

// ---------------------------------------------------------------------------
// Vedic Astrology Types (Guna Milan / Ashtakoot)
// ---------------------------------------------------------------------------

export type Nakshatra =
  | 'Ashwini' | 'Bharani' | 'Krittika' | 'Rohini' | 'Mrigashira'
  | 'Ardra' | 'Punarvasu' | 'Pushya' | 'Ashlesha' | 'Magha'
  | 'Purva Phalguni' | 'Uttara Phalguni' | 'Hasta' | 'Chitra' | 'Swati'
  | 'Vishakha' | 'Anuradha' | 'Jyeshtha' | 'Moola' | 'Purva Ashadha'
  | 'Uttara Ashadha' | 'Shravana' | 'Dhanishta' | 'Shatabhisha'
  | 'Purva Bhadrapada' | 'Uttara Bhadrapada' | 'Revati';

export type VedicSign = ZodiacSign; // Same 12 signs, different calculations

export type Varna = 'Brahmin' | 'Kshatriya' | 'Vaishya' | 'Shudra';
export type Gana = 'Deva' | 'Manushya' | 'Rakshasa';
export type Yoni =
  | 'Horse' | 'Elephant' | 'Sheep' | 'Serpent' | 'Dog'
  | 'Cat' | 'Rat' | 'Cow' | 'Buffalo' | 'Tiger'
  | 'Hare' | 'Monkey' | 'Lion' | 'Mongoose';

export interface VedicChart {
  moonSign: VedicSign;
  nakshatra: Nakshatra;
  nakshatraPada: 1 | 2 | 3 | 4;
  isManglik: boolean;
}

export interface KootaScore {
  koota: string;
  maxPoints: number;
  scored: number;
  description: string;
}

export interface VedicAstrologyResult {
  score: number;              // 0-100 (normalized from 0-36)
  totalGunaPoints: number;    // 0-36 raw
  kootaScores: KootaScore[];
  manglikStatus: {
    person1Manglik: boolean;
    person2Manglik: boolean;
    isDosha: boolean;
    doshaRemedyAvailable: boolean;
  };
  recommendation: 'Excellent' | 'Very Good' | 'Good' | 'Average' | 'Below Average' | 'Not Recommended';
}

// ---------------------------------------------------------------------------
// Chinese Zodiac Types
// ---------------------------------------------------------------------------

export type ChineseAnimal =
  | 'Rat' | 'Ox' | 'Tiger' | 'Rabbit'
  | 'Dragon' | 'Snake' | 'Horse' | 'Goat'
  | 'Monkey' | 'Rooster' | 'Dog' | 'Pig';

export type ChineseElement = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';

export type YinYang = 'Yin' | 'Yang';

export interface ChineseZodiacProfile {
  animal: ChineseAnimal;
  element: ChineseElement;
  yinYang: YinYang;
  birthYear: number;
}

export interface ChineseZodiacResult {
  score: number;          // 0-100
  breakdown: {
    animalCompatibility: number;
    elementHarmony: number;
    yinYangBalance: number;
  };
  relationship: 'Best Match' | 'Compatible' | 'Neutral' | 'Challenging' | 'Conflicting';
  strengths: string[];
  challenges: string[];
}

// ---------------------------------------------------------------------------
// Behavioral Matching Types
// ---------------------------------------------------------------------------

/** Big Five personality dimensions mapped to dating context */
export interface PersonalityVector {
  openness: number;           // 0-1: curiosity, adventurousness
  conscientiousness: number;  // 0-1: organization, reliability
  extraversion: number;       // 0-1: sociability, energy level
  agreeableness: number;      // 0-1: empathy, cooperativeness
  neuroticism: number;        // 0-1: emotional sensitivity, reactivity
}

export interface CommunicationStyle {
  directness: number;         // 0-1: direct vs indirect
  emotionalExpression: number;// 0-1: reserved vs expressive
  conflictStyle: number;      // 0-1: avoiding vs confronting
  responseSpeed: number;      // 0-1: slow/thoughtful vs quick/spontaneous
  loveLanguage: 'words' | 'acts' | 'gifts' | 'time' | 'touch';
}

export interface LifestylePreferences {
  socialFrequency: number;    // 0-1: homebody vs social butterfly
  activityLevel: number;      // 0-1: sedentary vs very active
  sleepSchedule: number;      // 0-1: early bird vs night owl
  tidiness: number;           // 0-1: relaxed vs meticulous
  spendingHabit: number;      // 0-1: frugal vs generous
  familyOrientation: number;  // 0-1: independent vs family-centered
  religiosity: number;        // 0-1: secular vs devout
  dietaryPreference: number;  // 0-1: flexible vs strict
}

export interface BehavioralProfile {
  personality: PersonalityVector;
  interests: number[];               // Embedding vector (normalized)
  communicationStyle: CommunicationStyle;
  lifestyle: LifestylePreferences;
  dealbreakers?: string[];
}

export interface BehavioralMatchResult {
  score: number;              // 0-100
  breakdown: {
    personalityMatch: number;
    interestSimilarity: number;
    communicationMatch: number;
    lifestyleMatch: number;
  };
  complementaryTraits: string[];
  potentialFriction: string[];
}

// ---------------------------------------------------------------------------
// Unified Engine Types
// ---------------------------------------------------------------------------

export interface EngineWeights {
  behavioral: number;
  westernAstrology: number;
  vedicAstrology: number;
  chineseZodiac: number;
  palmistry: number;
  profileMatch: number;
}

export const DEFAULT_WEIGHTS: EngineWeights = {
  behavioral: 0.40,
  westernAstrology: 0.20,
  vedicAstrology: 0.15,
  chineseZodiac: 0.10,
  palmistry: 0.05,
  profileMatch: 0.10,
};

export interface UserProfile {
  id: string;
  birthDate: Date;
  birthTime?: string;            // HH:MM format, optional
  birthPlace?: string;           // For precise chart calculation
  westernChart?: WesternChart;
  vedicChart?: VedicChart;
  chineseZodiac?: ChineseZodiacProfile;
  behavioral?: BehavioralProfile;
  profileCompleteness: number;   // 0-1
}

export interface EngineResult {
  engineName: string;
  score: number;
  weight: number;
  weightedScore: number;
  available: boolean;
  details: unknown;
}

export interface UnifiedCompatibilityResult {
  overallScore: number;          // 0-100
  confidence: number;            // 0-1 based on data completeness
  engines: EngineResult[];
  topStrengths: string[];
  topChallenges: string[];
  weights: EngineWeights;
  computedAt: Date;
}
