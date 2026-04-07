import type { ZodiacSign, ChineseAnimal, ChineseElement, Element, Modality, YinYang } from '@agar/shared';

// Get Western zodiac sign from date of birth
export function getZodiacSign(month: number, day: number): ZodiacSign {
  const signs: [ZodiacSign, number, number][] = [
    ['capricorn', 1, 19], ['aquarius', 2, 18], ['pisces', 3, 20],
    ['aries', 4, 19], ['taurus', 5, 20], ['gemini', 6, 20],
    ['cancer', 7, 22], ['leo', 8, 22], ['virgo', 9, 22],
    ['libra', 10, 22], ['scorpio', 11, 21], ['sagittarius', 12, 21],
  ];

  for (let i = 0; i < signs.length; i++) {
    const [sign, endMonth, endDay] = signs[i]!;
    const nextSign = signs[(i + 1) % 12]!;
    if (month === endMonth && day <= endDay) return sign;
    if (month === endMonth && day > endDay) return nextSign[0];
  }

  // Fallback lookup
  if (month === 1) return day <= 19 ? 'capricorn' : 'aquarius';
  if (month === 2) return day <= 18 ? 'aquarius' : 'pisces';
  if (month === 3) return day <= 20 ? 'pisces' : 'aries';
  if (month === 4) return day <= 19 ? 'aries' : 'taurus';
  if (month === 5) return day <= 20 ? 'taurus' : 'gemini';
  if (month === 6) return day <= 20 ? 'gemini' : 'cancer';
  if (month === 7) return day <= 22 ? 'cancer' : 'leo';
  if (month === 8) return day <= 22 ? 'leo' : 'virgo';
  if (month === 9) return day <= 22 ? 'virgo' : 'libra';
  if (month === 10) return day <= 22 ? 'libra' : 'scorpio';
  if (month === 11) return day <= 21 ? 'scorpio' : 'sagittarius';
  return day <= 21 ? 'sagittarius' : 'capricorn';
}

// Get Chinese zodiac animal from birth year
export function getChineseAnimal(year: number): ChineseAnimal {
  const animals: ChineseAnimal[] = [
    'rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
    'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig',
  ];
  return animals[(year - 4) % 12]!;
}

// Get Chinese element from birth year
export function getChineseElement(year: number): ChineseElement {
  const elements: ChineseElement[] = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'];
  return elements[year % 10]!;
}

// Get Yin/Yang from birth year
export function getYinYang(year: number): YinYang {
  return year % 2 === 0 ? 'yang' : 'yin';
}

// Element for zodiac signs
const SIGN_ELEMENTS: Record<ZodiacSign, Element> = {
  aries: 'fire', leo: 'fire', sagittarius: 'fire',
  taurus: 'earth', virgo: 'earth', capricorn: 'earth',
  gemini: 'air', libra: 'air', aquarius: 'air',
  cancer: 'water', scorpio: 'water', pisces: 'water',
};

const SIGN_MODALITIES: Record<ZodiacSign, Modality> = {
  aries: 'cardinal', cancer: 'cardinal', libra: 'cardinal', capricorn: 'cardinal',
  taurus: 'fixed', leo: 'fixed', scorpio: 'fixed', aquarius: 'fixed',
  gemini: 'mutable', virgo: 'mutable', sagittarius: 'mutable', pisces: 'mutable',
};

export function getElement(sign: ZodiacSign): Element {
  return SIGN_ELEMENTS[sign];
}

export function getModality(sign: ZodiacSign): Modality {
  return SIGN_MODALITIES[sign];
}

// Get sign position (0-11) for aspect calculation
const SIGN_ORDER: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

export function getSignPosition(sign: ZodiacSign): number {
  return SIGN_ORDER.indexOf(sign);
}

export function getAspectBetweenSigns(sign1: ZodiacSign, sign2: ZodiacSign): string {
  const pos1 = getSignPosition(sign1);
  const pos2 = getSignPosition(sign2);
  const diff = Math.abs(pos1 - pos2);
  const angle = Math.min(diff, 12 - diff);

  switch (angle) {
    case 0: return 'conjunction';
    case 2: return 'sextile';
    case 3: return 'square';
    case 4: return 'trine';
    case 6: return 'opposition';
    default: return 'none';
  }
}
