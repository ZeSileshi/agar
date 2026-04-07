export type Gender = 'male' | 'female' | 'non_binary' | 'other';
export type GenderPreference = 'male' | 'female' | 'everyone';
export type RelationshipGoal = 'long_term' | 'short_term' | 'friendship' | 'casual' | 'not_sure';
export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  isActive: boolean;
  isOnboarded: boolean;
  verificationStatus: VerificationStatus;
  language: 'en' | 'am' | 'es';
}

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName?: string;
  displayName: string;
  dateOfBirth: string; // ISO date
  birthTime?: string; // HH:mm format
  birthPlace?: BirthPlace;
  gender: Gender;
  genderPreference: GenderPreference;
  bio?: string;
  photos: UserPhoto[];
  interests: string[];
  relationshipGoal?: RelationshipGoal;
  height?: number; // cm
  education?: string;
  occupation?: string;
  location?: GeoLocation;
  maxDistance: number; // km
  ageRangeMin: number;
  ageRangeMax: number;
  showOnlineStatus: boolean;
  showDistance: boolean;
  showAge: boolean;
}

export interface UserPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  isPrimary: boolean;
  order: number;
  uploadedAt: string;
}

export interface BirthPlace {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export interface UserPreferences {
  userId: string;
  compatibilityWeights: CompatibilityWeights;
  notificationsEnabled: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  darkMode: boolean;
}

export interface CompatibilityWeights {
  behavioral: number;   // 0-1, default 0.40
  western: number;      // 0-1, default 0.20
  vedic: number;        // 0-1, default 0.15
  chinese: number;      // 0-1, default 0.10
  palmistry: number;    // 0-1, default 0.05
  profile: number;      // 0-1, default 0.10
}

export const DEFAULT_COMPATIBILITY_WEIGHTS: CompatibilityWeights = {
  behavioral: 0.40,
  western: 0.20,
  vedic: 0.15,
  chinese: 0.10,
  palmistry: 0.05,
  profile: 0.10,
};

export interface UserInterest {
  id: string;
  name: string;
  category: InterestCategory;
  icon: string;
}

export type InterestCategory =
  | 'lifestyle'
  | 'music'
  | 'sports'
  | 'food'
  | 'travel'
  | 'arts'
  | 'technology'
  | 'nature'
  | 'social'
  | 'wellness'
  | 'entertainment'
  | 'culture';
