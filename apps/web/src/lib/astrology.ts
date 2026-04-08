/**
 * Client-side astrology utilities for Agar (አጋር)
 * Western zodiac, Chinese zodiac, and simple compatibility scoring.
 */

/* ---------- Sun Sign (Western Zodiac) ---------- */

interface ZodiacSign {
  name: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

const ZODIAC_SIGNS: ZodiacSign[] = [
  { name: 'Capricorn',   symbol: '\u2651', element: 'Earth', startMonth: 12, startDay: 22, endMonth: 1,  endDay: 19 },
  { name: 'Aquarius',    symbol: '\u2652', element: 'Air',   startMonth: 1,  startDay: 20, endMonth: 2,  endDay: 18 },
  { name: 'Pisces',      symbol: '\u2653', element: 'Water', startMonth: 2,  startDay: 19, endMonth: 3,  endDay: 20 },
  { name: 'Aries',       symbol: '\u2648', element: 'Fire',  startMonth: 3,  startDay: 21, endMonth: 4,  endDay: 19 },
  { name: 'Taurus',      symbol: '\u2649', element: 'Earth', startMonth: 4,  startDay: 20, endMonth: 5,  endDay: 20 },
  { name: 'Gemini',      symbol: '\u264A', element: 'Air',   startMonth: 5,  startDay: 21, endMonth: 6,  endDay: 20 },
  { name: 'Cancer',      symbol: '\u264B', element: 'Water', startMonth: 6,  startDay: 21, endMonth: 7,  endDay: 22 },
  { name: 'Leo',         symbol: '\u264C', element: 'Fire',  startMonth: 7,  startDay: 23, endMonth: 8,  endDay: 22 },
  { name: 'Virgo',       symbol: '\u264D', element: 'Earth', startMonth: 8,  startDay: 23, endMonth: 9,  endDay: 22 },
  { name: 'Libra',       symbol: '\u264E', element: 'Air',   startMonth: 9,  startDay: 23, endMonth: 10, endDay: 22 },
  { name: 'Scorpio',     symbol: '\u264F', element: 'Water', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { name: 'Sagittarius', symbol: '\u2650', element: 'Fire',  startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
];

export function getSunSign(month: number, day: number): string {
  for (const sign of ZODIAC_SIGNS) {
    if (sign.startMonth === sign.endMonth) {
      if (month === sign.startMonth && day >= sign.startDay && day <= sign.endDay) return sign.name;
    } else if (sign.startMonth > sign.endMonth) {
      // Capricorn wraps Dec -> Jan
      if ((month === sign.startMonth && day >= sign.startDay) ||
          (month === sign.endMonth && day <= sign.endDay)) {
        return sign.name;
      }
    } else {
      if ((month === sign.startMonth && day >= sign.startDay) ||
          (month === sign.endMonth && day <= sign.endDay)) {
        return sign.name;
      }
    }
  }
  return 'Unknown';
}

export function getSunSignSymbol(signName: string): string {
  const sign = ZODIAC_SIGNS.find((s) => s.name === signName);
  return sign?.symbol ?? '';
}

export function getSunSignElement(signName: string): 'Fire' | 'Earth' | 'Air' | 'Water' | 'Unknown' {
  const sign = ZODIAC_SIGNS.find((s) => s.name === signName);
  return sign?.element ?? 'Unknown';
}

/* ---------- Chinese Zodiac ---------- */

const CHINESE_ANIMALS: string[] = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig',
];

const CHINESE_ANIMAL_EMOJI: Record<string, string> = {
  Rat: '\uD83D\uDC00',
  Ox: '\uD83D\uDC02',
  Tiger: '\uD83D\uDC05',
  Rabbit: '\uD83D\uDC07',
  Dragon: '\uD83D\uDC09',
  Snake: '\uD83D\uDC0D',
  Horse: '\uD83D\uDC0E',
  Goat: '\uD83D\uDC10',
  Monkey: '\uD83D\uDC12',
  Rooster: '\uD83D\uDC13',
  Dog: '\uD83D\uDC15',
  Pig: '\uD83D\uDC16',
};

export function getChineseZodiac(year: number): string {
  return CHINESE_ANIMALS[(year - 4) % 12] ?? 'Unknown';
}

export function getChineseZodiacEmoji(animal: string): string {
  return CHINESE_ANIMAL_EMOJI[animal] ?? '';
}

export function getElement(year: number): string {
  const elements: string[] = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'];
  return elements[year % 10] ?? 'Unknown';
}

/* ---------- Compatibility: Sun Signs ---------- */

const ELEMENT_COMPAT: Record<string, Record<string, number>> = {
  Fire:  { Fire: 85, Air: 90, Earth: 50, Water: 45 },
  Earth: { Earth: 85, Water: 90, Fire: 50, Air: 45 },
  Air:   { Air: 85, Fire: 90, Water: 50, Earth: 45 },
  Water: { Water: 85, Earth: 90, Air: 50, Fire: 45 },
};

export function sunSignCompatibility(sign1: string, sign2: string): number {
  if (sign1 === sign2) return 80; // Same sign: good but can clash
  const e1 = getSunSignElement(sign1);
  const e2 = getSunSignElement(sign2);
  if (e1 === 'Unknown' || e2 === 'Unknown') return 60;
  return ELEMENT_COMPAT[e1]?.[e2] ?? 60;
}

/* ---------- Compatibility: Chinese Zodiac ---------- */

// Traditional trine groups (highly compatible)
const TRINE_GROUPS = [
  ['Rat', 'Dragon', 'Monkey'],
  ['Ox', 'Snake', 'Rooster'],
  ['Tiger', 'Horse', 'Dog'],
  ['Rabbit', 'Goat', 'Pig'],
];

// Traditional clash pairs
const CLASH_PAIRS = [
  ['Rat', 'Horse'], ['Ox', 'Goat'], ['Tiger', 'Monkey'],
  ['Rabbit', 'Rooster'], ['Dragon', 'Dog'], ['Snake', 'Pig'],
];

export function chineseZodiacCompatibility(animal1: string, animal2: string): number {
  if (animal1 === animal2) return 75;

  // Check trine (best compatibility)
  for (const group of TRINE_GROUPS) {
    if (group.includes(animal1) && group.includes(animal2)) return 90;
  }

  // Check clash (worst compatibility)
  for (const [a, b] of CLASH_PAIRS) {
    if ((animal1 === a && animal2 === b) || (animal1 === b && animal2 === a)) return 40;
  }

  // Neutral
  return 65;
}

/* ---------- Combined astrology profile from DOB ---------- */

export interface AstrologyProfile {
  sunSign: string;
  sunSignSymbol: string;
  sunSignElement: string;
  chineseAnimal: string;
  chineseAnimalEmoji: string;
  chineseElement: string;
}

/* ---------- Overall Compatibility Score ---------- */

export function computeOverallCompatibility(
  dob1: string,
  dob2: string,
  interests1: string[] = [],
  interests2: string[] = [],
  hasPalm1 = false,
  hasPalm2 = false,
): {
  overall: number;
  western: number;
  chinese: number;
  profile: number;
  palmistry: number;
  breakdown: Record<string, number>;
} {
  const p1 = getAstrologyProfile(dob1);
  const p2 = getAstrologyProfile(dob2);

  // Western astrology (sun sign element compatibility)
  const western = p1 && p2 ? sunSignCompatibility(p1.sunSign, p2.sunSign) : 60;

  // Chinese zodiac compatibility
  const chinese = p1 && p2 ? chineseZodiacCompatibility(p1.chineseAnimal, p2.chineseAnimal) : 60;

  // Profile similarity (shared interests)
  let profile = 50;
  if (interests1.length > 0 && interests2.length > 0) {
    const set1 = new Set(interests1.map((i) => i.toLowerCase()));
    const shared = interests2.filter((i) => set1.has(i.toLowerCase())).length;
    const total = new Set([...interests1, ...interests2].map((i) => i.toLowerCase())).size;
    profile = total > 0 ? Math.round((shared / total) * 100) : 50;
    profile = Math.max(30, Math.min(95, profile)); // clamp
  }

  // Palmistry bonus (both users have palm scans = +5 bonus to overall)
  const palmistry = hasPalm1 && hasPalm2 ? 75 : hasPalm1 || hasPalm2 ? 60 : 50;

  // Weighted average
  // Weights: western 25%, chinese 15%, profile 45%, palmistry 15%
  const overall = Math.round(
    western * 0.25 + chinese * 0.15 + profile * 0.45 + palmistry * 0.15
  );

  return {
    overall: Math.max(20, Math.min(99, overall)),
    western,
    chinese,
    profile,
    palmistry,
    breakdown: { western, chinese, profile, palmistry },
  };
}

export function getAstrologyProfile(dateOfBirth: string): AstrologyProfile | null {
  if (!dateOfBirth) return null;
  const d = new Date(dateOfBirth);
  if (isNaN(d.getTime())) return null;

  const month = d.getMonth() + 1;
  const day = d.getDate();
  const year = d.getFullYear();

  const sunSign = getSunSign(month, day);
  const animal = getChineseZodiac(year);

  return {
    sunSign,
    sunSignSymbol: getSunSignSymbol(sunSign),
    sunSignElement: getSunSignElement(sunSign),
    chineseAnimal: animal,
    chineseAnimalEmoji: getChineseZodiacEmoji(animal),
    chineseElement: getElement(year),
  };
}
