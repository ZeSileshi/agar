// =============================================================================
// Utility: Derive zodiac signs from birth date
// =============================================================================
// Provides functions to calculate Western sun sign and Chinese zodiac
// from a Date object. Moon/Venus/Mars/Mercury require ephemeris data
// (not included here -- would need a library like swiss-ephemeris).
// =============================================================================

import type { ZodiacSign, ChineseZodiacProfile } from '../types';
import { getChineseZodiacFromYear } from '../data/chinese-zodiac';

/**
 * Determine the Western sun sign from a birth date.
 */
export function getSunSign(birthDate: Date): ZodiacSign {
  const month = birthDate.getMonth() + 1; // 1-12
  const day = birthDate.getDate();

  // Standard tropical zodiac date ranges
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces'; // Feb 19 - Mar 20
}

/**
 * Derive Chinese zodiac profile from birth year.
 * Note: The Chinese New Year falls between Jan 21 - Feb 20. For simplicity,
 * this uses the calendar year. For production accuracy, check if the birth
 * date falls before the Chinese New Year of that year.
 */
export function getChineseProfile(birthDate: Date): ChineseZodiacProfile {
  const year = birthDate.getFullYear();
  const zodiac = getChineseZodiacFromYear(year);
  return {
    ...zodiac,
    birthYear: year,
  };
}
