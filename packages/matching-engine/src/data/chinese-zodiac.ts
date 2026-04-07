// =============================================================================
// Chinese Zodiac Data Tables
// =============================================================================

import type { ChineseAnimal, ChineseElement, YinYang } from '../types';

// ---------------------------------------------------------------------------
// Animal order (for cycle calculations)
// ---------------------------------------------------------------------------
export const ANIMAL_ORDER: ChineseAnimal[] = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig',
];

// ---------------------------------------------------------------------------
// Animal compatibility matrix (0-100)
//
// Traditional groupings:
//   Best friends (San He / Three Harmony): triangles in the zodiac circle
//     Rat-Dragon-Monkey, Ox-Snake-Rooster, Tiger-Horse-Dog, Rabbit-Goat-Pig
//   Secret friends (Liu He / Six Harmony): special pairs
//     Rat-Ox, Tiger-Pig, Rabbit-Dog, Dragon-Rooster, Snake-Monkey, Horse-Goat
//   Clashes (Chong): opposite signs
//     Rat-Horse, Ox-Goat, Tiger-Monkey, Rabbit-Rooster, Dragon-Dog, Snake-Pig
// ---------------------------------------------------------------------------
export const ANIMAL_COMPATIBILITY: Record<ChineseAnimal, Record<ChineseAnimal, number>> = {
  Rat: {
    Rat: 70, Ox: 90, Tiger: 55, Rabbit: 50, Dragon: 88, Snake: 60,
    Horse: 30, Goat: 45, Monkey: 88, Rooster: 55, Dog: 60, Pig: 75,
  },
  Ox: {
    Rat: 90, Ox: 70, Tiger: 40, Rabbit: 55, Dragon: 60, Snake: 88,
    Horse: 45, Goat: 30, Monkey: 60, Rooster: 88, Dog: 55, Pig: 65,
  },
  Tiger: {
    Rat: 55, Ox: 40, Tiger: 60, Rabbit: 70, Dragon: 65, Snake: 35,
    Horse: 88, Goat: 55, Monkey: 30, Rooster: 45, Dog: 88, Pig: 90,
  },
  Rabbit: {
    Rat: 50, Ox: 55, Tiger: 70, Rabbit: 65, Dragon: 50, Snake: 55,
    Horse: 55, Goat: 88, Monkey: 50, Rooster: 30, Dog: 90, Pig: 88,
  },
  Dragon: {
    Rat: 88, Ox: 60, Tiger: 65, Rabbit: 50, Dragon: 70, Snake: 75,
    Horse: 55, Goat: 55, Monkey: 88, Rooster: 90, Dog: 30, Pig: 60,
  },
  Snake: {
    Rat: 60, Ox: 88, Tiger: 35, Rabbit: 55, Dragon: 75, Snake: 65,
    Horse: 50, Goat: 55, Monkey: 90, Rooster: 80, Dog: 55, Pig: 30,
  },
  Horse: {
    Rat: 30, Ox: 45, Tiger: 88, Rabbit: 55, Dragon: 55, Snake: 50,
    Horse: 65, Goat: 90, Monkey: 55, Rooster: 50, Dog: 88, Pig: 60,
  },
  Goat: {
    Rat: 45, Ox: 30, Tiger: 55, Rabbit: 88, Dragon: 55, Snake: 55,
    Horse: 90, Goat: 65, Monkey: 55, Rooster: 45, Dog: 50, Pig: 88,
  },
  Monkey: {
    Rat: 88, Ox: 60, Tiger: 30, Rabbit: 50, Dragon: 88, Snake: 90,
    Horse: 55, Goat: 55, Monkey: 65, Rooster: 60, Dog: 55, Pig: 50,
  },
  Rooster: {
    Rat: 55, Ox: 88, Tiger: 45, Rabbit: 30, Dragon: 90, Snake: 80,
    Horse: 50, Goat: 45, Monkey: 60, Rooster: 60, Dog: 50, Pig: 55,
  },
  Dog: {
    Rat: 60, Ox: 55, Tiger: 88, Rabbit: 90, Dragon: 30, Snake: 55,
    Horse: 88, Goat: 50, Monkey: 55, Rooster: 50, Dog: 65, Pig: 75,
  },
  Pig: {
    Rat: 75, Ox: 65, Tiger: 90, Rabbit: 88, Dragon: 60, Snake: 30,
    Horse: 60, Goat: 88, Monkey: 50, Rooster: 55, Dog: 75, Pig: 70,
  },
};

// ---------------------------------------------------------------------------
// Chinese Five Element relationships (Wu Xing)
//
// Productive cycle: Wood -> Fire -> Earth -> Metal -> Water -> Wood
// Destructive cycle: Wood -> Earth -> Water -> Fire -> Metal -> Wood
// ---------------------------------------------------------------------------
export const ELEMENT_COMPATIBILITY: Record<ChineseElement, Record<ChineseElement, number>> = {
  Wood:  { Wood: 70, Fire: 90, Earth: 35, Metal: 30, Water: 85 },
  Fire:  { Wood: 90, Fire: 65, Earth: 85, Metal: 35, Water: 30 },
  Earth: { Wood: 35, Fire: 85, Earth: 70, Metal: 90, Water: 40 },
  Metal: { Wood: 30, Fire: 35, Earth: 90, Metal: 65, Water: 85 },
  Water: { Wood: 85, Fire: 30, Earth: 40, Metal: 85, Water: 70 },
};

// ---------------------------------------------------------------------------
// Yin-Yang balance scoring
// Opposite = attractive polarity; same = comfortable similarity
// ---------------------------------------------------------------------------
export const YINYANG_COMPATIBILITY: Record<YinYang, Record<YinYang, number>> = {
  Yin:  { Yin: 60, Yang: 85 },
  Yang: { Yin: 85, Yang: 60 },
};

// ---------------------------------------------------------------------------
// Birth year -> animal / element / yin-yang lookup
// ---------------------------------------------------------------------------
export function getChineseZodiacFromYear(year: number): {
  animal: ChineseAnimal;
  element: ChineseElement;
  yinYang: YinYang;
} {
  // Animal cycle: starts at Rat for years where (year - 4) % 12 == 0
  const animalIndex = (year - 4) % 12;
  const animal = ANIMAL_ORDER[animalIndex >= 0 ? animalIndex : animalIndex + 12];

  // Element cycle: 2-year periods, 10-year full cycle
  const elementCycle: ChineseElement[] = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'];
  const elementIndex = (year - 4) % 10;
  const element = elementCycle[elementIndex >= 0 ? elementIndex : elementIndex + 10];

  // Yin/Yang: even years = Yang, odd years = Yin
  const yinYang: YinYang = year % 2 === 0 ? 'Yang' : 'Yin';

  return { animal, element, yinYang };
}

// ---------------------------------------------------------------------------
// Relationship classification thresholds
// ---------------------------------------------------------------------------
export function classifyRelationship(score: number): string {
  if (score >= 85) return 'Best Match';
  if (score >= 70) return 'Compatible';
  if (score >= 50) return 'Neutral';
  if (score >= 35) return 'Challenging';
  return 'Conflicting';
}
