// =============================================================================
// Behavioral Matching Engine
// =============================================================================
// Computes compatibility based on psychological and behavioral dimensions:
//
//   1. Personality (Big Five model mapped to dating context)
//   2. Interest similarity (cosine similarity on interest embeddings)
//   3. Communication style matching
//   4. Lifestyle compatibility
//
// The engine uses a blend of similarity matching (shared traits) and
// complementarity matching (traits that balance each other).
//
// Returns a 0-100 composite score.
// =============================================================================

import type {
  BehavioralProfile,
  BehavioralMatchResult,
  PersonalityVector,
  CommunicationStyle,
  LifestylePreferences,
} from '../types';

import {
  cosineSimilarity,
  traitCompatibility,
  weightedAverage,
  clamp,
} from '../utils/math';

// ---------------------------------------------------------------------------
// Sub-engine weights
// ---------------------------------------------------------------------------
const COMPONENT_WEIGHTS = {
  personality: 0.30,
  interests: 0.25,
  communication: 0.25,
  lifestyle: 0.20,
};

// ---------------------------------------------------------------------------
// 1. Personality Matching (Big Five)
// ---------------------------------------------------------------------------
// Research-informed trait matching for romantic compatibility:
//
// - Openness: Similarity preferred. Partners who explore together thrive.
//   optimalDiff = 0.0, tolerance = 0.35
//
// - Conscientiousness: Similarity preferred. Mismatched tidiness/planning
//   causes daily friction.
//   optimalDiff = 0.0, tolerance = 0.30
//
// - Extraversion: Moderate complementarity. Some difference creates balance,
//   but extreme mismatch causes social-life friction.
//   optimalDiff = 0.15, tolerance = 0.35
//
// - Agreeableness: High values in both partners stabilize relationships.
//   Similarity preferred, but we also reward high absolute levels.
//   optimalDiff = 0.0, tolerance = 0.30
//
// - Neuroticism: Lower values in both partners predict satisfaction.
//   Similarity preferred, with a bonus for mutually low neuroticism.
//   optimalDiff = 0.0, tolerance = 0.25
// ---------------------------------------------------------------------------

interface TraitConfig {
  key: keyof PersonalityVector;
  weight: number;
  optimalDiff: number;
  tolerance: number;
  label: string;
}

const PERSONALITY_TRAITS: TraitConfig[] = [
  { key: 'openness',          weight: 0.20, optimalDiff: 0.0,  tolerance: 0.35, label: 'Shared curiosity and openness to experience' },
  { key: 'conscientiousness', weight: 0.25, optimalDiff: 0.0,  tolerance: 0.30, label: 'Aligned organization and reliability' },
  { key: 'extraversion',      weight: 0.15, optimalDiff: 0.15, tolerance: 0.35, label: 'Balanced social energy levels' },
  { key: 'agreeableness',     weight: 0.20, optimalDiff: 0.0,  tolerance: 0.30, label: 'Mutual warmth and cooperativeness' },
  { key: 'neuroticism',       weight: 0.20, optimalDiff: 0.0,  tolerance: 0.25, label: 'Emotional stability alignment' },
];

function scorePersonality(p1: PersonalityVector, p2: PersonalityVector): {
  score: number;
  complementary: string[];
  friction: string[];
} {
  const traitScores: number[] = [];
  const traitWeights: number[] = [];
  const complementary: string[] = [];
  const friction: string[] = [];

  for (const trait of PERSONALITY_TRAITS) {
    const v1 = p1[trait.key];
    const v2 = p2[trait.key];
    const score = traitCompatibility(v1, v2, trait.optimalDiff, trait.tolerance);

    traitScores.push(score);
    traitWeights.push(trait.weight);

    if (score >= 0.75) {
      complementary.push(trait.label);
    } else if (score < 0.35) {
      friction.push(`Misaligned ${trait.key} levels may cause tension`);
    }
  }

  // Bonus: both partners having high agreeableness (> 0.7) is strongly predictive
  const agreeablenessBonus =
    p1.agreeableness > 0.7 && p2.agreeableness > 0.7 ? 5 : 0;

  // Bonus: both having low neuroticism (< 0.3) predicts satisfaction
  const stabilityBonus =
    p1.neuroticism < 0.3 && p2.neuroticism < 0.3 ? 5 : 0;

  const baseScore = weightedAverage(traitScores, traitWeights) * 100;
  const score = clamp(baseScore + agreeablenessBonus + stabilityBonus, 0, 100);

  return { score, complementary, friction };
}

// ---------------------------------------------------------------------------
// 2. Interest Similarity
// ---------------------------------------------------------------------------
// Uses cosine similarity on interest embedding vectors.
// These embeddings can come from:
//   - Pre-trained sentence encoders on interest descriptions
//   - TF-IDF vectors over interest categories
//   - Collaborative filtering embeddings
// ---------------------------------------------------------------------------

function scoreInterests(interests1: number[], interests2: number[]): number {
  if (interests1.length === 0 || interests2.length === 0) {
    return 50; // Neutral when data is missing
  }

  const similarity = cosineSimilarity(interests1, interests2);

  // Map cosine similarity [-1, 1] to score [0, 100]
  // In practice, interest vectors are usually non-negative, so similarity
  // ranges from 0 to 1. We use a more generous mapping.
  const score = clamp(similarity * 100, 0, 100);

  return score;
}

// ---------------------------------------------------------------------------
// 3. Communication Style Matching
// ---------------------------------------------------------------------------

function scoreCommunication(c1: CommunicationStyle, c2: CommunicationStyle): {
  score: number;
  complementary: string[];
  friction: string[];
} {
  const complementary: string[] = [];
  const friction: string[] = [];

  // Directness: similarity is better (avoids misunderstandings)
  const directnessScore = traitCompatibility(c1.directness, c2.directness, 0, 0.3);

  // Emotional expression: moderate difference is OK; extreme mismatch is bad
  const emotionScore = traitCompatibility(c1.emotionalExpression, c2.emotionalExpression, 0.1, 0.35);

  // Conflict style: similarity reduces destructive conflict patterns
  const conflictScore = traitCompatibility(c1.conflictStyle, c2.conflictStyle, 0, 0.3);

  // Response speed: some difference tolerable
  const speedScore = traitCompatibility(c1.responseSpeed, c2.responseSpeed, 0, 0.4);

  // Love language: matching = strong bonus; mismatch still workable
  const loveLanguageBonus = c1.loveLanguage === c2.loveLanguage ? 15 : 0;

  const baseScore = weightedAverage(
    [directnessScore, emotionScore, conflictScore, speedScore],
    [0.30, 0.25, 0.25, 0.20],
  ) * 100;

  const score = clamp(baseScore + loveLanguageBonus, 0, 100);

  if (directnessScore >= 0.75) complementary.push('Aligned communication directness');
  if (c1.loveLanguage === c2.loveLanguage) complementary.push(`Shared love language: ${c1.loveLanguage}`);
  if (conflictScore >= 0.75) complementary.push('Compatible conflict resolution styles');

  if (directnessScore < 0.35) friction.push('Different directness levels may cause misunderstandings');
  if (emotionScore < 0.35) friction.push('Emotional expression mismatch may feel invalidating');
  if (conflictScore < 0.35) friction.push('Opposing conflict styles may escalate disagreements');

  return { score, complementary, friction };
}

// ---------------------------------------------------------------------------
// 4. Lifestyle Compatibility
// ---------------------------------------------------------------------------

interface LifestyleTraitConfig {
  key: keyof LifestylePreferences;
  weight: number;
  optimalDiff: number;
  tolerance: number;
  matchLabel: string;
  mismatchLabel: string;
}

const LIFESTYLE_TRAITS: LifestyleTraitConfig[] = [
  {
    key: 'socialFrequency', weight: 0.12, optimalDiff: 0.1, tolerance: 0.35,
    matchLabel: 'Compatible social preferences',
    mismatchLabel: 'Different socializing needs may require negotiation',
  },
  {
    key: 'activityLevel', weight: 0.10, optimalDiff: 0.1, tolerance: 0.35,
    matchLabel: 'Similar activity levels',
    mismatchLabel: 'Different energy levels for physical activities',
  },
  {
    key: 'sleepSchedule', weight: 0.12, optimalDiff: 0.0, tolerance: 0.30,
    matchLabel: 'Aligned sleep schedules',
    mismatchLabel: 'Mismatched sleep schedules may reduce quality time',
  },
  {
    key: 'tidiness', weight: 0.15, optimalDiff: 0.0, tolerance: 0.25,
    matchLabel: 'Similar tidiness standards',
    mismatchLabel: 'Different cleanliness standards often cause daily friction',
  },
  {
    key: 'spendingHabit', weight: 0.15, optimalDiff: 0.0, tolerance: 0.25,
    matchLabel: 'Aligned financial habits',
    mismatchLabel: 'Different spending habits may create financial tension',
  },
  {
    key: 'familyOrientation', weight: 0.15, optimalDiff: 0.0, tolerance: 0.30,
    matchLabel: 'Shared family values',
    mismatchLabel: 'Different family involvement expectations',
  },
  {
    key: 'religiosity', weight: 0.12, optimalDiff: 0.0, tolerance: 0.25,
    matchLabel: 'Aligned spiritual or religious values',
    mismatchLabel: 'Different religiosity levels may need careful navigation',
  },
  {
    key: 'dietaryPreference', weight: 0.09, optimalDiff: 0.0, tolerance: 0.40,
    matchLabel: 'Compatible dietary preferences',
    mismatchLabel: 'Different dietary needs may complicate shared meals',
  },
];

function scoreLifestyle(l1: LifestylePreferences, l2: LifestylePreferences): {
  score: number;
  complementary: string[];
  friction: string[];
} {
  const traitScores: number[] = [];
  const traitWeights: number[] = [];
  const complementary: string[] = [];
  const friction: string[] = [];

  for (const trait of LIFESTYLE_TRAITS) {
    const v1 = l1[trait.key];
    const v2 = l2[trait.key];
    const score = traitCompatibility(v1, v2, trait.optimalDiff, trait.tolerance);

    traitScores.push(score);
    traitWeights.push(trait.weight);

    if (score >= 0.75) {
      complementary.push(trait.matchLabel);
    } else if (score < 0.35) {
      friction.push(trait.mismatchLabel);
    }
  }

  const score = clamp(weightedAverage(traitScores, traitWeights) * 100, 0, 100);
  return { score, complementary, friction };
}

// ---------------------------------------------------------------------------
// Dealbreaker Check
// ---------------------------------------------------------------------------
// Dealbreakers are hard filters. If either partner has a dealbreaker that the
// other violates, the overall behavioral score receives a significant penalty.
// This is handled at the unified engine level, but we flag it here.

function checkDealbreakers(
  profile1: BehavioralProfile,
  profile2: BehavioralProfile,
): string[] {
  const violations: string[] = [];
  const db1 = profile1.dealbreakers || [];
  const db2 = profile2.dealbreakers || [];

  // In a full implementation, dealbreakers would be checked against
  // specific profile attributes. Here we flag when dealbreaker lists
  // overlap with the other profile's characteristics.
  // This is a placeholder for the matching service to implement
  // with actual user data.

  if (db1.length > 0 || db2.length > 0) {
    // Dealbreakers exist but require profile-specific checking
    // which depends on the broader user profile schema.
  }

  return violations;
}

// ---------------------------------------------------------------------------
// Main Engine
// ---------------------------------------------------------------------------

export function computeBehavioralMatch(
  profile1: BehavioralProfile,
  profile2: BehavioralProfile,
): BehavioralMatchResult {

  // 1. Personality
  const personality = scorePersonality(profile1.personality, profile2.personality);

  // 2. Interests
  const interestScore = scoreInterests(profile1.interests, profile2.interests);

  // 3. Communication
  const communication = scoreCommunication(
    profile1.communicationStyle,
    profile2.communicationStyle,
  );

  // 4. Lifestyle
  const lifestyle = scoreLifestyle(profile1.lifestyle, profile2.lifestyle);

  // Composite score
  const overallScore = Math.round(
    personality.score * COMPONENT_WEIGHTS.personality +
    interestScore * COMPONENT_WEIGHTS.interests +
    communication.score * COMPONENT_WEIGHTS.communication +
    lifestyle.score * COMPONENT_WEIGHTS.lifestyle,
  );

  // Aggregate strengths and friction
  const complementaryTraits = [
    ...personality.complementary,
    ...communication.complementary,
    ...lifestyle.complementary,
  ];

  const potentialFriction = [
    ...personality.friction,
    ...communication.friction,
    ...lifestyle.friction,
    ...checkDealbreakers(profile1, profile2),
  ];

  return {
    score: clamp(overallScore, 0, 100),
    breakdown: {
      personalityMatch: Math.round(personality.score),
      interestSimilarity: Math.round(interestScore),
      communicationMatch: Math.round(communication.score),
      lifestyleMatch: Math.round(lifestyle.score),
    },
    complementaryTraits: complementaryTraits.slice(0, 5), // Top 5
    potentialFriction: potentialFriction.slice(0, 5),      // Top 5
  };
}
