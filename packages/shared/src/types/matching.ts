import type { SynastryResult, GunaResult, ChineseCompatibilityResult, PalmistryResult } from './astrology';

export type MatchMode = 'self' | 'referral';
export type SwipeAction = 'like' | 'pass' | 'super_like';
export type MatchStatus = 'pending' | 'matched' | 'unmatched' | 'expired';

export interface MatchCandidate {
  userId: string;
  displayName: string;
  age: number;
  primaryPhotoUrl: string;
  photos: string[];
  bio?: string;
  distance?: number; // km
  interests: string[];
  compatibilityScore: number; // 0-100
  compatibilityHighlights: string[];
  sunSign?: string;
  isOnline: boolean;
  lastActive?: string;
  mode: MatchMode;
  referredBy?: string;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  status: MatchStatus;
  mode: MatchMode;
  compatibilityScore: number;
  matchedAt: string;
  lastMessageAt?: string;
  referralId?: string;
}

export interface SwipeRecord {
  id: string;
  swiperId: string;
  targetId: string;
  action: SwipeAction;
  timestamp: string;
}

export interface CompatibilityReport {
  user1Id: string;
  user2Id: string;
  overallScore: number; // 0-100
  confidence: number; // 0-1
  breakdown: CompatibilityBreakdown;
  insights: CompatibilityInsight[];
  strengths: string[];
  challenges: string[];
  advice: string[];
  calculatedAt: string;
}

export interface CompatibilityBreakdown {
  behavioral: BehavioralScore;
  western?: SynastryResult;
  vedic?: GunaResult;
  chinese?: ChineseCompatibilityResult;
  palmistry?: PalmistryResult;
  profile: ProfileMatchScore;
}

export interface BehavioralScore {
  score: number; // 0-100
  personalityMatch: number;
  interestSimilarity: number;
  communicationStyle: number;
  lifestyleMatch: number;
  insights: string[];
}

export interface ProfileMatchScore {
  score: number; // 0-100
  sharedInterests: string[];
  locationProximity: number;
  ageCompatibility: number;
  goalAlignment: number;
}

export interface CompatibilityInsight {
  category: string;
  title: string;
  description: string;
  icon: string;
  sentiment: 'positive' | 'neutral' | 'caution';
}

export type CompatibilityLevel = 'excellent' | 'good' | 'moderate' | 'challenging';

export function getCompatibilityLevel(score: number): CompatibilityLevel {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'moderate';
  return 'challenging';
}
