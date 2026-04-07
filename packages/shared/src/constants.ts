// App constants
export const APP_NAME = 'Agar';
export const APP_NAME_AMHARIC = 'አጋር';
export const APP_VERSION = '0.1.0';

// Matching
export const MIN_COMPATIBILITY_DISPLAY = 20;
export const SUPER_LIKE_DAILY_LIMIT = 5;
export const MAX_PHOTOS = 6;
export const MIN_PHOTOS = 2;
export const MAX_BIO_LENGTH = 500;
export const MIN_AGE = 18;
export const MAX_AGE = 100;
export const DEFAULT_DISTANCE_KM = 50;
export const MAX_DISTANCE_KM = 500;

// Guna Milan thresholds
export const GUNA_EXCELLENT_THRESHOLD = 28; // 28+ out of 36
export const GUNA_GOOD_THRESHOLD = 21;
export const GUNA_MODERATE_THRESHOLD = 15;

// Interest categories
export const INTEREST_CATEGORIES = [
  'lifestyle', 'music', 'sports', 'food', 'travel',
  'arts', 'technology', 'nature', 'social', 'wellness',
  'entertainment', 'culture',
] as const;

// Predefined interests
export const INTERESTS = [
  // Lifestyle
  { id: 'cooking', name: 'Cooking', category: 'lifestyle', icon: '🍳' },
  { id: 'fitness', name: 'Fitness', category: 'lifestyle', icon: '💪' },
  { id: 'yoga', name: 'Yoga', category: 'wellness', icon: '🧘' },
  { id: 'meditation', name: 'Meditation', category: 'wellness', icon: '🧘' },
  { id: 'reading', name: 'Reading', category: 'entertainment', icon: '📚' },
  { id: 'photography', name: 'Photography', category: 'arts', icon: '📷' },
  { id: 'travel', name: 'Travel', category: 'travel', icon: '✈️' },
  { id: 'hiking', name: 'Hiking', category: 'nature', icon: '🥾' },
  { id: 'dancing', name: 'Dancing', category: 'social', icon: '💃' },
  { id: 'coffee', name: 'Coffee', category: 'food', icon: '☕' },
  { id: 'wine', name: 'Wine', category: 'food', icon: '🍷' },
  { id: 'movies', name: 'Movies', category: 'entertainment', icon: '🎬' },
  { id: 'gaming', name: 'Gaming', category: 'entertainment', icon: '🎮' },
  { id: 'music', name: 'Music', category: 'music', icon: '🎵' },
  { id: 'art', name: 'Art', category: 'arts', icon: '🎨' },
  { id: 'sports', name: 'Sports', category: 'sports', icon: '⚽' },
  { id: 'tech', name: 'Technology', category: 'technology', icon: '💻' },
  { id: 'fashion', name: 'Fashion', category: 'lifestyle', icon: '👗' },
  { id: 'pets', name: 'Pets', category: 'lifestyle', icon: '🐾' },
  { id: 'volunteering', name: 'Volunteering', category: 'social', icon: '🤝' },
  { id: 'languages', name: 'Languages', category: 'culture', icon: '🌍' },
  { id: 'astronomy', name: 'Astronomy', category: 'nature', icon: '🔭' },
  { id: 'writing', name: 'Writing', category: 'arts', icon: '✍️' },
  { id: 'running', name: 'Running', category: 'sports', icon: '🏃' },
  { id: 'swimming', name: 'Swimming', category: 'sports', icon: '🏊' },
  { id: 'camping', name: 'Camping', category: 'nature', icon: '⛺' },
  { id: 'gardening', name: 'Gardening', category: 'nature', icon: '🌱' },
  { id: 'board_games', name: 'Board Games', category: 'entertainment', icon: '🎲' },
  { id: 'ethiopian_food', name: 'Ethiopian Food', category: 'food', icon: '🍲' },
  { id: 'traditional_music', name: 'Traditional Music', category: 'music', icon: '🎼' },
] as const;

// Zodiac data
export const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer',
  'leo', 'virgo', 'libra', 'scorpio',
  'sagittarius', 'capricorn', 'aquarius', 'pisces',
] as const;

export const ZODIAC_ELEMENTS: Record<string, string> = {
  aries: 'fire', taurus: 'earth', gemini: 'air', cancer: 'water',
  leo: 'fire', virgo: 'earth', libra: 'air', scorpio: 'water',
  sagittarius: 'fire', capricorn: 'earth', aquarius: 'air', pisces: 'water',
};

export const ZODIAC_MODALITIES: Record<string, string> = {
  aries: 'cardinal', taurus: 'fixed', gemini: 'mutable', cancer: 'cardinal',
  leo: 'fixed', virgo: 'mutable', libra: 'cardinal', scorpio: 'fixed',
  sagittarius: 'mutable', capricorn: 'cardinal', aquarius: 'fixed', pisces: 'mutable',
};

export const CHINESE_ANIMALS = [
  'rat', 'ox', 'tiger', 'rabbit',
  'dragon', 'snake', 'horse', 'goat',
  'monkey', 'rooster', 'dog', 'pig',
] as const;
