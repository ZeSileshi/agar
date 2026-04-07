// =============================================================================
// Western Astrology Data Tables
// =============================================================================

import type { ZodiacSign, WesternElement, Modality, PlanetaryAspect } from '../types';

// ---------------------------------------------------------------------------
// Sign -> Element mapping
// ---------------------------------------------------------------------------
export const SIGN_ELEMENT: Record<ZodiacSign, WesternElement> = {
  Aries: 'Fire',     Taurus: 'Earth',    Gemini: 'Air',       Cancer: 'Water',
  Leo: 'Fire',       Virgo: 'Earth',     Libra: 'Air',        Scorpio: 'Water',
  Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air',   Pisces: 'Water',
};

// ---------------------------------------------------------------------------
// Sign -> Modality mapping
// ---------------------------------------------------------------------------
export const SIGN_MODALITY: Record<ZodiacSign, Modality> = {
  Aries: 'Cardinal',    Taurus: 'Fixed',     Gemini: 'Mutable',
  Cancer: 'Cardinal',   Leo: 'Fixed',        Virgo: 'Mutable',
  Libra: 'Cardinal',    Scorpio: 'Fixed',    Sagittarius: 'Mutable',
  Capricorn: 'Cardinal', Aquarius: 'Fixed',  Pisces: 'Mutable',
};

// ---------------------------------------------------------------------------
// Ordered sign list (for degree-based aspect calculation)
// ---------------------------------------------------------------------------
export const SIGN_ORDER: ZodiacSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// ---------------------------------------------------------------------------
// Element compatibility matrix  (0-1 scale)
// Fire+Air thrive; Earth+Water thrive; same element = strong bond
// ---------------------------------------------------------------------------
export const ELEMENT_COMPATIBILITY: Record<WesternElement, Record<WesternElement, number>> = {
  Fire:  { Fire: 0.80, Earth: 0.35, Air: 0.90, Water: 0.30 },
  Earth: { Fire: 0.35, Earth: 0.80, Air: 0.40, Water: 0.85 },
  Air:   { Fire: 0.90, Earth: 0.40, Air: 0.75, Water: 0.45 },
  Water: { Fire: 0.30, Earth: 0.85, Air: 0.45, Water: 0.80 },
};

// ---------------------------------------------------------------------------
// Modality compatibility matrix (0-1 scale)
// Same modality can clash (both want to lead / both resist change).
// Cardinal + Mutable = flexible leadership; Fixed + Mutable = stable yet adaptive.
// ---------------------------------------------------------------------------
export const MODALITY_COMPATIBILITY: Record<Modality, Record<Modality, number>> = {
  Cardinal: { Cardinal: 0.50, Fixed: 0.65, Mutable: 0.85 },
  Fixed:    { Cardinal: 0.65, Fixed: 0.55, Mutable: 0.80 },
  Mutable:  { Cardinal: 0.85, Fixed: 0.80, Mutable: 0.60 },
};

// ---------------------------------------------------------------------------
// Aspect scores -- how harmonious each angular relationship is (0-1)
// ---------------------------------------------------------------------------
export const ASPECT_HARMONY: Record<PlanetaryAspect, number> = {
  conjunction: 0.85,   // powerful, can go either way -- generally positive
  sextile:    0.90,    // easy, flowing harmony
  trine:      0.95,    // most harmonious
  square:     0.35,    // tension / growth through challenge
  opposition: 0.50,    // polarity / attraction of opposites
};

// ---------------------------------------------------------------------------
// Sun-sign compatibility matrix (12x12).
// Values are 0-100.  Derived from traditional synastry interpretations.
// Row = person1 sign, Col = person2 sign.
// ---------------------------------------------------------------------------
export const SUN_SIGN_COMPATIBILITY: Record<ZodiacSign, Record<ZodiacSign, number>> = {
  Aries: {
    Aries: 70, Taurus: 45, Gemini: 78, Cancer: 42, Leo: 90, Virgo: 40,
    Libra: 72, Scorpio: 50, Sagittarius: 93, Capricorn: 47, Aquarius: 80, Pisces: 55,
  },
  Taurus: {
    Aries: 45, Taurus: 75, Gemini: 42, Cancer: 88, Leo: 55, Virgo: 90,
    Libra: 58, Scorpio: 82, Sagittarius: 38, Capricorn: 92, Aquarius: 40, Pisces: 80,
  },
  Gemini: {
    Aries: 78, Taurus: 42, Gemini: 68, Cancer: 48, Leo: 80, Virgo: 55,
    Libra: 90, Scorpio: 38, Sagittarius: 72, Capricorn: 40, Aquarius: 92, Pisces: 45,
  },
  Cancer: {
    Aries: 42, Taurus: 88, Gemini: 48, Cancer: 72, Leo: 55, Virgo: 78,
    Libra: 45, Scorpio: 92, Sagittarius: 35, Capricorn: 68, Aquarius: 38, Pisces: 95,
  },
  Leo: {
    Aries: 90, Taurus: 55, Gemini: 80, Cancer: 55, Leo: 70, Virgo: 48,
    Libra: 78, Scorpio: 58, Sagittarius: 92, Capricorn: 45, Aquarius: 68, Pisces: 50,
  },
  Virgo: {
    Aries: 40, Taurus: 90, Gemini: 55, Cancer: 78, Leo: 48, Virgo: 65,
    Libra: 50, Scorpio: 80, Sagittarius: 42, Capricorn: 92, Aquarius: 45, Pisces: 62,
  },
  Libra: {
    Aries: 72, Taurus: 58, Gemini: 90, Cancer: 45, Leo: 78, Virgo: 50,
    Libra: 65, Scorpio: 55, Sagittarius: 80, Capricorn: 52, Aquarius: 90, Pisces: 48,
  },
  Scorpio: {
    Aries: 50, Taurus: 82, Gemini: 38, Cancer: 92, Leo: 58, Virgo: 80,
    Libra: 55, Scorpio: 70, Sagittarius: 45, Capricorn: 78, Aquarius: 42, Pisces: 90,
  },
  Sagittarius: {
    Aries: 93, Taurus: 38, Gemini: 72, Cancer: 35, Leo: 92, Virgo: 42,
    Libra: 80, Scorpio: 45, Sagittarius: 68, Capricorn: 48, Aquarius: 85, Pisces: 55,
  },
  Capricorn: {
    Aries: 47, Taurus: 92, Gemini: 40, Cancer: 68, Leo: 45, Virgo: 92,
    Libra: 52, Scorpio: 78, Sagittarius: 48, Capricorn: 72, Aquarius: 50, Pisces: 70,
  },
  Aquarius: {
    Aries: 80, Taurus: 40, Gemini: 92, Cancer: 38, Leo: 68, Virgo: 45,
    Libra: 90, Scorpio: 42, Sagittarius: 85, Capricorn: 50, Aquarius: 65, Pisces: 52,
  },
  Pisces: {
    Aries: 55, Taurus: 80, Gemini: 45, Cancer: 95, Leo: 50, Virgo: 62,
    Libra: 48, Scorpio: 90, Sagittarius: 55, Capricorn: 70, Aquarius: 52, Pisces: 72,
  },
};

// ---------------------------------------------------------------------------
// Planet weights for synastry scoring
// Sun = core identity, Moon = emotional, Venus = love style,
// Mars = physical/drive, Mercury = communication
// ---------------------------------------------------------------------------
export const PLANET_WEIGHTS: Record<string, number> = {
  sun: 0.30,
  moon: 0.25,
  venus: 0.25,
  mars: 0.10,
  mercury: 0.10,
};
