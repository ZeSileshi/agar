export interface GiftItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  points: number;
  category: 'romantic' | 'fun' | 'premium';
}

export const GIFT_CATALOG: GiftItem[] = [
  // Romantic
  { id: 'rose', name: 'Rose', emoji: '\u{1F339}', description: 'A classic red rose', points: 10, category: 'romantic' },
  { id: 'kiss', name: 'Kiss', emoji: '\u{1F48B}', description: 'Blow them a kiss', points: 40, category: 'romantic' },
  { id: 'bouquet', name: 'Bouquet', emoji: '\u{1F490}', description: 'A beautiful flower bouquet', points: 50, category: 'romantic' },
  { id: 'love_letter', name: 'Love Letter', emoji: '\u{1F48C}', description: 'A heartfelt love letter', points: 30, category: 'romantic' },
  { id: 'heart_box', name: 'Heart Chocolates', emoji: '\u{1F36B}', description: 'Box of heart-shaped chocolates', points: 35, category: 'romantic' },

  // Fun
  { id: 'coffee', name: 'Coffee Date', emoji: '\u{2615}', description: 'Virtual coffee date invite', points: 15, category: 'fun' },
  { id: 'star', name: 'Shooting Star', emoji: '\u{1F320}', description: 'Make a wish together', points: 20, category: 'fun' },
  { id: 'pizza', name: 'Pizza', emoji: '\u{1F355}', description: 'Share a virtual pizza', points: 10, category: 'fun' },
  { id: 'music', name: 'Mixtape', emoji: '\u{1F3B5}', description: 'A playlist for two', points: 25, category: 'fun' },

  // Premium
  { id: 'diamond', name: 'Diamond', emoji: '\u{1F48E}', description: 'The ultimate expression', points: 100, category: 'premium' },
  { id: 'crown', name: 'Crown', emoji: '\u{1F451}', description: 'They reign supreme', points: 75, category: 'premium' },
  { id: 'ring', name: 'Promise Ring', emoji: '\u{1F48D}', description: 'A symbol of commitment', points: 150, category: 'premium' },
  { id: 'trip', name: 'Dream Trip', emoji: '\u{2708}\u{FE0F}', description: 'Virtual getaway for two', points: 80, category: 'premium' },
];

export const POINTS_PACKAGES = [
  { id: 'small', points: 20, price: 500, label: '20 Points', priceLabel: '$5.00' },
  { id: 'medium', points: 50, price: 1000, label: '50 Points', priceLabel: '$10.00', badge: 'Popular' },
  { id: 'large', points: 120, price: 2000, label: '120 Points', priceLabel: '$20.00', badge: 'Best Value' },
];

export const DAILY_UNLOCK_COST = 10; // points to unlock extra 15 daily profiles
