// =============================================================================
// Vedic Astrology (Guna Milan / Ashtakoot) Data Tables
// =============================================================================
// The Ashtakoot system assigns points across 8 Kootas totaling 36.
// A score >= 18 is traditionally considered acceptable for marriage.
// =============================================================================

import type { Nakshatra, Varna, Gana, Yoni, VedicSign } from '../types';

// ---------------------------------------------------------------------------
// Nakshatra ordered list (27 nakshatras)
// ---------------------------------------------------------------------------
export const NAKSHATRA_LIST: Nakshatra[] = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
  'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
  'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
  'Vishakha', 'Anuradha', 'Jyeshtha', 'Moola', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

// ---------------------------------------------------------------------------
// 1. VARNA KOOTA (1 point max) - Spiritual / ego compatibility
// Brahmin > Kshatriya > Vaishya > Shudra (groom >= bride = 1 pt)
// ---------------------------------------------------------------------------
export const NAKSHATRA_VARNA: Record<Nakshatra, Varna> = {
  'Ashwini': 'Vaishya', 'Bharani': 'Shudra', 'Krittika': 'Brahmin',
  'Rohini': 'Shudra', 'Mrigashira': 'Vaishya', 'Ardra': 'Shudra',
  'Punarvasu': 'Vaishya', 'Pushya': 'Kshatriya', 'Ashlesha': 'Shudra',
  'Magha': 'Shudra', 'Purva Phalguni': 'Brahmin', 'Uttara Phalguni': 'Kshatriya',
  'Hasta': 'Vaishya', 'Chitra': 'Vaishya', 'Swati': 'Shudra',
  'Vishakha': 'Brahmin', 'Anuradha': 'Shudra', 'Jyeshtha': 'Vaishya',
  'Moola': 'Shudra', 'Purva Ashadha': 'Brahmin', 'Uttara Ashadha': 'Kshatriya',
  'Shravana': 'Shudra', 'Dhanishta': 'Vaishya', 'Shatabhisha': 'Shudra',
  'Purva Bhadrapada': 'Brahmin', 'Uttara Bhadrapada': 'Kshatriya', 'Revati': 'Shudra',
};

export const VARNA_RANK: Record<Varna, number> = {
  Brahmin: 4, Kshatriya: 3, Vaishya: 2, Shudra: 1,
};

// ---------------------------------------------------------------------------
// 2. VASYA KOOTA (2 points max) - Dominance / mutual attraction
// Sign-based: each sign has a set of signs it is attracted to (vasya).
// ---------------------------------------------------------------------------
export const VASYA_GROUPS: Record<VedicSign, VedicSign[]> = {
  Aries:       ['Leo', 'Scorpio'],
  Taurus:      ['Cancer', 'Libra'],
  Gemini:      ['Virgo'],
  Cancer:      ['Scorpio', 'Sagittarius'],
  Leo:         ['Libra'],
  Virgo:       ['Pisces', 'Gemini'],
  Libra:       ['Virgo', 'Capricorn'],
  Scorpio:     ['Cancer'],
  Sagittarius: ['Pisces'],
  Capricorn:   ['Aries', 'Aquarius'],
  Aquarius:    ['Aries'],
  Pisces:      ['Capricorn'],
};

// ---------------------------------------------------------------------------
// 3. TARA KOOTA (3 points max) - Birth star compatibility
// Based on counting nakshatras from one to the other mod 9.
// Auspicious remainders: 1(Janma), 2(Sampat), 4(Kshema), 6(Sadhana), 8(Mitra), 9(Param Mitra)
// ---------------------------------------------------------------------------
export const TARA_AUSPICIOUS_REMAINDERS = new Set([1, 2, 4, 6, 8, 0]); // 0 represents 9

// ---------------------------------------------------------------------------
// 4. YONI KOOTA (4 points max) - Sexual / physical compatibility
// Each nakshatra maps to an animal yoni and gender.
// ---------------------------------------------------------------------------
export const NAKSHATRA_YONI: Record<Nakshatra, { animal: Yoni; gender: 'Male' | 'Female' }> = {
  'Ashwini':           { animal: 'Horse',    gender: 'Male' },
  'Bharani':           { animal: 'Elephant', gender: 'Male' },
  'Krittika':          { animal: 'Sheep',    gender: 'Female' },
  'Rohini':            { animal: 'Serpent',  gender: 'Male' },
  'Mrigashira':        { animal: 'Serpent',  gender: 'Female' },
  'Ardra':             { animal: 'Dog',      gender: 'Female' },
  'Punarvasu':         { animal: 'Cat',      gender: 'Female' },
  'Pushya':            { animal: 'Sheep',    gender: 'Male' },
  'Ashlesha':          { animal: 'Cat',      gender: 'Male' },
  'Magha':             { animal: 'Rat',      gender: 'Male' },
  'Purva Phalguni':    { animal: 'Rat',      gender: 'Female' },
  'Uttara Phalguni':   { animal: 'Cow',      gender: 'Male' },
  'Hasta':             { animal: 'Buffalo',  gender: 'Female' },
  'Chitra':            { animal: 'Tiger',    gender: 'Female' },
  'Swati':             { animal: 'Buffalo',  gender: 'Male' },
  'Vishakha':          { animal: 'Tiger',    gender: 'Male' },
  'Anuradha':          { animal: 'Hare',     gender: 'Female' },
  'Jyeshtha':          { animal: 'Hare',     gender: 'Male' },
  'Moola':             { animal: 'Dog',      gender: 'Male' },
  'Purva Ashadha':     { animal: 'Monkey',   gender: 'Male' },
  'Uttara Ashadha':    { animal: 'Mongoose', gender: 'Male' },
  'Shravana':          { animal: 'Monkey',   gender: 'Female' },
  'Dhanishta':         { animal: 'Lion',     gender: 'Female' },
  'Shatabhisha':       { animal: 'Horse',    gender: 'Female' },
  'Purva Bhadrapada':  { animal: 'Lion',     gender: 'Male' },
  'Uttara Bhadrapada': { animal: 'Cow',      gender: 'Female' },
  'Revati':            { animal: 'Elephant', gender: 'Female' },
};

// Yoni enemy pairs -- these animals are natural enemies
export const YONI_ENEMIES: [Yoni, Yoni][] = [
  ['Horse', 'Buffalo'],
  ['Elephant', 'Lion'],
  ['Sheep', 'Monkey'],
  ['Serpent', 'Mongoose'],
  ['Dog', 'Hare'],
  ['Cat', 'Rat'],
  ['Tiger', 'Cow'],
];

// ---------------------------------------------------------------------------
// 5. GRAHA MAITRI (5 points max) - Planetary friendship
// Based on Moon sign lords' relationship.
// ---------------------------------------------------------------------------
export const SIGN_LORD: Record<VedicSign, string> = {
  Aries: 'Mars',     Taurus: 'Venus',     Gemini: 'Mercury',
  Cancer: 'Moon',    Leo: 'Sun',          Virgo: 'Mercury',
  Libra: 'Venus',    Scorpio: 'Mars',     Sagittarius: 'Jupiter',
  Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

// Planetary friendship table: 1=enemy, 2=neutral, 3=friend, 4=great friend, 0=self
export const GRAHA_FRIENDSHIP: Record<string, Record<string, number>> = {
  Sun:     { Sun: 0, Moon: 3, Mars: 3, Mercury: 1, Jupiter: 3, Venus: 1, Saturn: 1 },
  Moon:    { Sun: 3, Moon: 0, Mars: 2, Mercury: 2, Jupiter: 2, Venus: 2, Saturn: 2 },
  Mars:    { Sun: 3, Moon: 3, Mars: 0, Mercury: 1, Jupiter: 3, Venus: 2, Saturn: 1 },
  Mercury: { Sun: 3, Moon: 1, Mars: 1, Mercury: 0, Jupiter: 2, Venus: 3, Saturn: 3 },
  Jupiter: { Sun: 3, Moon: 3, Mars: 3, Mercury: 1, Jupiter: 0, Venus: 1, Saturn: 1 },
  Venus:   { Sun: 1, Moon: 2, Mars: 2, Mercury: 3, Jupiter: 1, Venus: 0, Saturn: 3 },
  Saturn:  { Sun: 1, Moon: 1, Mars: 1, Mercury: 3, Jupiter: 2, Venus: 3, Saturn: 0 },
};

// ---------------------------------------------------------------------------
// 6. GANA KOOTA (6 points max) - Temperament compatibility
// ---------------------------------------------------------------------------
export const NAKSHATRA_GANA: Record<Nakshatra, Gana> = {
  'Ashwini': 'Deva',       'Bharani': 'Manushya',     'Krittika': 'Rakshasa',
  'Rohini': 'Manushya',    'Mrigashira': 'Deva',      'Ardra': 'Manushya',
  'Punarvasu': 'Deva',     'Pushya': 'Deva',          'Ashlesha': 'Rakshasa',
  'Magha': 'Rakshasa',     'Purva Phalguni': 'Manushya', 'Uttara Phalguni': 'Manushya',
  'Hasta': 'Deva',         'Chitra': 'Rakshasa',      'Swati': 'Deva',
  'Vishakha': 'Rakshasa',  'Anuradha': 'Deva',        'Jyeshtha': 'Rakshasa',
  'Moola': 'Rakshasa',     'Purva Ashadha': 'Manushya', 'Uttara Ashadha': 'Manushya',
  'Shravana': 'Deva',      'Dhanishta': 'Rakshasa',   'Shatabhisha': 'Rakshasa',
  'Purva Bhadrapada': 'Manushya', 'Uttara Bhadrapada': 'Manushya', 'Revati': 'Deva',
};

// Gana compatibility matrix [person1_gana][person2_gana] => points out of 6
export const GANA_COMPATIBILITY: Record<Gana, Record<Gana, number>> = {
  Deva:     { Deva: 6, Manushya: 5, Rakshasa: 1 },
  Manushya: { Deva: 6, Manushya: 6, Rakshasa: 0 },
  Rakshasa: { Deva: 1, Manushya: 0, Rakshasa: 6 },
};

// ---------------------------------------------------------------------------
// 7. BHAKOOT KOOTA (7 points max) - Emotional & financial compatibility
// Based on the relative position of Moon signs (rashi).
// Inauspicious combinations: 2/12, 6/8, 5/9 from each other => 0 points
// ---------------------------------------------------------------------------
export const RASHI_ORDER: VedicSign[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export const BHAKOOT_BAD_PAIRS = new Set(['2-12', '12-2', '6-8', '8-6', '5-9', '9-5']);

// ---------------------------------------------------------------------------
// 8. NADI KOOTA (8 points max) - Health & genetic compatibility
// Most important koota. Same nadi = 0 points (Nadi dosha).
// ---------------------------------------------------------------------------
export type NadiType = 'Aadi' | 'Madhya' | 'Antya';

export const NAKSHATRA_NADI: Record<Nakshatra, NadiType> = {
  'Ashwini': 'Aadi',           'Bharani': 'Madhya',        'Krittika': 'Antya',
  'Rohini': 'Antya',           'Mrigashira': 'Madhya',     'Ardra': 'Aadi',
  'Punarvasu': 'Aadi',         'Pushya': 'Madhya',         'Ashlesha': 'Antya',
  'Magha': 'Aadi',             'Purva Phalguni': 'Madhya', 'Uttara Phalguni': 'Antya',
  'Hasta': 'Antya',            'Chitra': 'Madhya',         'Swati': 'Aadi',
  'Vishakha': 'Aadi',          'Anuradha': 'Madhya',       'Jyeshtha': 'Antya',
  'Moola': 'Aadi',             'Purva Ashadha': 'Madhya',  'Uttara Ashadha': 'Antya',
  'Shravana': 'Antya',         'Dhanishta': 'Madhya',      'Shatabhisha': 'Aadi',
  'Purva Bhadrapada': 'Aadi',  'Uttara Bhadrapada': 'Madhya', 'Revati': 'Antya',
};

// ---------------------------------------------------------------------------
// Nakshatra -> Moon sign mapping (each sign spans 2.25 nakshatras)
// ---------------------------------------------------------------------------
export const NAKSHATRA_MOON_SIGN: Record<Nakshatra, VedicSign> = {
  'Ashwini': 'Aries',            'Bharani': 'Aries',
  'Krittika': 'Aries',           // Krittika spans Aries/Taurus; pada 1 = Aries
  'Rohini': 'Taurus',            'Mrigashira': 'Taurus',
  'Ardra': 'Gemini',             'Punarvasu': 'Gemini',
  'Pushya': 'Cancer',            'Ashlesha': 'Cancer',
  'Magha': 'Leo',                'Purva Phalguni': 'Leo',
  'Uttara Phalguni': 'Virgo',    'Hasta': 'Virgo',
  'Chitra': 'Virgo',             'Swati': 'Libra',
  'Vishakha': 'Libra',           'Anuradha': 'Scorpio',
  'Jyeshtha': 'Scorpio',         'Moola': 'Sagittarius',
  'Purva Ashadha': 'Sagittarius','Uttara Ashadha': 'Sagittarius',
  'Shravana': 'Capricorn',       'Dhanishta': 'Capricorn',
  'Shatabhisha': 'Aquarius',     'Purva Bhadrapada': 'Aquarius',
  'Uttara Bhadrapada': 'Pisces', 'Revati': 'Pisces',
};
