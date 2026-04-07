// ============================================
// Western Astrology Types
// ============================================

export type ZodiacSign =
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export type Element = 'fire' | 'earth' | 'air' | 'water';
export type Modality = 'cardinal' | 'fixed' | 'mutable';
export type Planet = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn';

export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';

export interface WesternChart {
  sunSign: ZodiacSign;
  moonSign?: ZodiacSign;
  risingSign?: ZodiacSign;
  venusSign?: ZodiacSign;
  marsSign?: ZodiacSign;
  mercurySign?: ZodiacSign;
}

export interface SynastryResult {
  score: number; // 0-100
  aspects: PlanetaryAspect[];
  elementCompatibility: number;
  modalityCompatibility: number;
  insights: string[];
}

export interface PlanetaryAspect {
  planet1: Planet;
  sign1: ZodiacSign;
  planet2: Planet;
  sign2: ZodiacSign;
  aspect: AspectType;
  score: number;
  description: string;
}

// ============================================
// Vedic Astrology Types (Kundli / Guna Milan)
// ============================================

export type Nakshatra =
  | 'ashwini' | 'bharani' | 'krittika' | 'rohini' | 'mrigashira'
  | 'ardra' | 'punarvasu' | 'pushya' | 'ashlesha' | 'magha'
  | 'purva_phalguni' | 'uttara_phalguni' | 'hasta' | 'chitra' | 'swati'
  | 'vishakha' | 'anuradha' | 'jyeshtha' | 'mula' | 'purva_ashadha'
  | 'uttara_ashadha' | 'shravana' | 'dhanishta' | 'shatabhisha'
  | 'purva_bhadrapada' | 'uttara_bhadrapada' | 'revati';

export type VedicSign = ZodiacSign; // Same 12 signs, called Rashi

export interface VedicChart {
  rashi: VedicSign;
  nakshatra: Nakshatra;
  nakshatraPada: number; // 1-4
}

export interface GunaResult {
  totalScore: number; // 0-36
  normalizedScore: number; // 0-100
  kootas: KootaScore[];
  doshas: DoshaResult[];
  verdict: 'excellent' | 'good' | 'moderate' | 'not_recommended';
  insights: string[];
}

export interface KootaScore {
  name: KootaName;
  maxPoints: number;
  score: number;
  description: string;
}

export type KootaName =
  | 'varna'      // 1 point  - Spiritual compatibility
  | 'vasya'      // 2 points - Dominance/attraction
  | 'tara'       // 3 points - Destiny compatibility
  | 'yoni'       // 4 points - Physical/sexual compatibility
  | 'graha_maitri' // 5 points - Mental compatibility
  | 'gana'       // 6 points - Temperament
  | 'bhakoot'    // 7 points - Love/health
  | 'nadi';      // 8 points - Health/genetics

export interface DoshaResult {
  name: string;
  detected: boolean;
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  description: string;
  remedies?: string[];
}

// ============================================
// Chinese Zodiac Types
// ============================================

export type ChineseAnimal =
  | 'rat' | 'ox' | 'tiger' | 'rabbit'
  | 'dragon' | 'snake' | 'horse' | 'goat'
  | 'monkey' | 'rooster' | 'dog' | 'pig';

export type ChineseElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
export type YinYang = 'yin' | 'yang';

export interface ChineseZodiacProfile {
  animal: ChineseAnimal;
  element: ChineseElement;
  yinYang: YinYang;
  year: number;
}

export interface ChineseCompatibilityResult {
  score: number; // 0-100
  animalCompatibility: number;
  elementCompatibility: number;
  yinYangBalance: number;
  relationship: 'best_match' | 'compatible' | 'neutral' | 'challenging' | 'clash';
  insights: string[];
}

// ============================================
// Palmistry Types
// ============================================

export interface PalmistryResult {
  score: number; // 0-100
  heartLine: PalmLineReading;
  headLine: PalmLineReading;
  lifeLine: PalmLineReading;
  fateLine?: PalmLineReading;
  traits: PalmistryTrait[];
  confidence: number; // 0-1
}

export interface PalmLineReading {
  name: string;
  length: 'short' | 'medium' | 'long';
  depth: 'shallow' | 'medium' | 'deep';
  curvature: 'straight' | 'slight' | 'curved';
  interpretation: string;
}

export interface PalmistryTrait {
  name: string;
  score: number;
  description: string;
}

// ============================================
// Birth Data
// ============================================

export interface BirthData {
  userId: string;
  dateOfBirth: string; // ISO date
  timeOfBirth?: string; // HH:mm
  placeOfBirth?: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  westernChart?: WesternChart;
  vedicChart?: VedicChart;
  chineseZodiac?: ChineseZodiacProfile;
}
