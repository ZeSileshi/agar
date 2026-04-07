// =============================================================================
// Unified Compatibility Scoring Engine
// =============================================================================
// Orchestrates all sub-engines and produces a single compatibility score.
//
// Features:
//   - Weighted combination with configurable weights
//   - Confidence score based on data completeness
//   - Graceful degradation when data is missing
//   - Automatic weight redistribution for unavailable engines
//   - Aggregated strengths and challenges
// =============================================================================

import type {
  UserProfile,
  EngineWeights,
  EngineResult,
  UnifiedCompatibilityResult,
  WesternAstrologyResult,
  VedicAstrologyResult,
  ChineseZodiacResult,
  BehavioralMatchResult,
} from '../types';

import { DEFAULT_WEIGHTS } from '../types';
import { computeWesternAstrology } from './western-astrology';
import { computeVedicAstrology } from './vedic-astrology';
import { computeChineseZodiac } from './chinese-zodiac';
import { computeBehavioralMatch } from './behavioral-matching';
import { clamp } from '../utils/math';

// ---------------------------------------------------------------------------
// Confidence Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate confidence score (0-1) based on how much profile data is
 * available for each engine. More complete data = higher confidence.
 */
function calculateConfidence(
  profile1: UserProfile,
  profile2: UserProfile,
  availableEngines: Set<string>,
): number {
  const factors: number[] = [];

  // Base confidence from profile completeness
  factors.push((profile1.profileCompleteness + profile2.profileCompleteness) / 2);

  // Engine availability factor: more engines = higher confidence
  const totalEngines = 6; // All engine types
  const engineCoverage = availableEngines.size / totalEngines;
  factors.push(engineCoverage);

  // Behavioral data depth (most important for accuracy)
  if (profile1.behavioral && profile2.behavioral) {
    const interestDepth1 = profile1.behavioral.interests.length > 0 ? 1 : 0;
    const interestDepth2 = profile2.behavioral.interests.length > 0 ? 1 : 0;
    factors.push((interestDepth1 + interestDepth2) / 2);
  }

  // Average all confidence factors
  const avgConfidence = factors.reduce((a, b) => a + b, 0) / factors.length;
  return clamp(avgConfidence, 0, 1);
}

// ---------------------------------------------------------------------------
// Weight Redistribution
// ---------------------------------------------------------------------------

/**
 * When some engines are unavailable (missing data), redistribute their
 * weight proportionally across available engines.
 */
function redistributeWeights(
  baseWeights: EngineWeights,
  availableEngines: Set<string>,
): Map<string, number> {
  const engineKeys: (keyof EngineWeights)[] = [
    'behavioral', 'westernAstrology', 'vedicAstrology',
    'chineseZodiac', 'palmistry', 'profileMatch',
  ];

  let unavailableWeight = 0;
  let availableWeight = 0;

  for (const key of engineKeys) {
    if (!availableEngines.has(key)) {
      unavailableWeight += baseWeights[key];
    } else {
      availableWeight += baseWeights[key];
    }
  }

  const redistributed = new Map<string, number>();

  if (availableWeight === 0) {
    // No engines available, equal distribution as fallback
    for (const key of engineKeys) {
      redistributed.set(key, 1 / engineKeys.length);
    }
    return redistributed;
  }

  // Redistribute unavailable weight proportionally
  const redistributionFactor = availableWeight > 0
    ? (availableWeight + unavailableWeight) / availableWeight
    : 1;

  for (const key of engineKeys) {
    if (availableEngines.has(key)) {
      redistributed.set(key, baseWeights[key] * redistributionFactor);
    } else {
      redistributed.set(key, 0);
    }
  }

  return redistributed;
}

// ---------------------------------------------------------------------------
// Profile Match Scorer (basic profile-level compatibility)
// ---------------------------------------------------------------------------

/**
 * Simple profile-based matching for attributes not covered by other engines.
 * This includes age proximity, location, education level, etc.
 * Returns 0-100.
 */
function scoreProfileMatch(profile1: UserProfile, profile2: UserProfile): number {
  let score = 50; // Start neutral

  // Age proximity bonus (closer ages = higher score, within reason)
  const age1 = getAge(profile1.birthDate);
  const age2 = getAge(profile2.birthDate);
  const ageDiff = Math.abs(age1 - age2);

  if (ageDiff <= 2) score += 20;
  else if (ageDiff <= 5) score += 15;
  else if (ageDiff <= 10) score += 5;
  else if (ageDiff > 15) score -= 10;

  // Profile completeness bonus (both having complete profiles suggests seriousness)
  const avgCompleteness = (profile1.profileCompleteness + profile2.profileCompleteness) / 2;
  score += avgCompleteness * 20;

  return clamp(score, 0, 100);
}

function getAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// ---------------------------------------------------------------------------
// Main Unified Engine
// ---------------------------------------------------------------------------

export interface UnifiedScorerOptions {
  /** Override default weights. Must sum to ~1.0. */
  weights?: Partial<EngineWeights>;
  /** If true, skip engines that would normally run with available data. */
  skipEngines?: (keyof EngineWeights)[];
}

export function computeUnifiedScore(
  profile1: UserProfile,
  profile2: UserProfile,
  options: UnifiedScorerOptions = {},
): UnifiedCompatibilityResult {
  const baseWeights: EngineWeights = {
    ...DEFAULT_WEIGHTS,
    ...options.weights,
  };

  const skipSet = new Set(options.skipEngines || []);
  const availableEngines = new Set<string>();
  const engineResults: EngineResult[] = [];
  const allStrengths: string[] = [];
  const allChallenges: string[] = [];

  // ---- Run Western Astrology ----
  let westernResult: WesternAstrologyResult | null = null;
  if (profile1.westernChart && profile2.westernChart && !skipSet.has('westernAstrology')) {
    westernResult = computeWesternAstrology(profile1.westernChart, profile2.westernChart);
    availableEngines.add('westernAstrology');
    allStrengths.push(...westernResult.strengths);
    allChallenges.push(...westernResult.challenges);
  }

  // ---- Run Vedic Astrology ----
  let vedicResult: VedicAstrologyResult | null = null;
  if (profile1.vedicChart && profile2.vedicChart && !skipSet.has('vedicAstrology')) {
    vedicResult = computeVedicAstrology(profile1.vedicChart, profile2.vedicChart);
    availableEngines.add('vedicAstrology');
    if (vedicResult.recommendation === 'Excellent' || vedicResult.recommendation === 'Very Good') {
      allStrengths.push(`Vedic Guna Milan: ${vedicResult.recommendation} (${vedicResult.totalGunaPoints}/36 points)`);
    }
    if (vedicResult.manglikStatus.isDosha) {
      allChallenges.push('Manglik Dosha detected - one partner is Manglik while the other is not');
    }
  }

  // ---- Run Chinese Zodiac ----
  let chineseResult: ChineseZodiacResult | null = null;
  if (profile1.chineseZodiac && profile2.chineseZodiac && !skipSet.has('chineseZodiac')) {
    chineseResult = computeChineseZodiac(profile1.chineseZodiac, profile2.chineseZodiac);
    availableEngines.add('chineseZodiac');
    allStrengths.push(...chineseResult.strengths);
    allChallenges.push(...chineseResult.challenges);
  }

  // ---- Run Behavioral Matching ----
  let behavioralResult: BehavioralMatchResult | null = null;
  if (profile1.behavioral && profile2.behavioral && !skipSet.has('behavioral')) {
    behavioralResult = computeBehavioralMatch(profile1.behavioral, profile2.behavioral);
    availableEngines.add('behavioral');
    allStrengths.push(...behavioralResult.complementaryTraits);
    allChallenges.push(...behavioralResult.potentialFriction);
  }

  // ---- Profile Match (always available) ----
  const profileMatchScore = scoreProfileMatch(profile1, profile2);
  if (!skipSet.has('profileMatch')) {
    availableEngines.add('profileMatch');
  }

  // ---- Palmistry placeholder (always returns neutral when no data) ----
  const palmistryScore = 50; // Placeholder - requires image analysis integration
  if (!skipSet.has('palmistry')) {
    // Only mark as available if we had real palmistry data
    // For now, it contributes a neutral score that gets redistributed
  }

  // ---- Redistribute weights based on available engines ----
  const adjustedWeights = redistributeWeights(baseWeights, availableEngines);

  // ---- Build engine results array ----
  const engineEntries: Array<{
    name: string;
    key: string;
    score: number;
    available: boolean;
    details: unknown;
  }> = [
    {
      name: 'Behavioral Matching',
      key: 'behavioral',
      score: behavioralResult?.score ?? 0,
      available: behavioralResult !== null,
      details: behavioralResult,
    },
    {
      name: 'Western Astrology',
      key: 'westernAstrology',
      score: westernResult?.score ?? 0,
      available: westernResult !== null,
      details: westernResult,
    },
    {
      name: 'Vedic Astrology (Guna Milan)',
      key: 'vedicAstrology',
      score: vedicResult?.score ?? 0,
      available: vedicResult !== null,
      details: vedicResult,
    },
    {
      name: 'Chinese Zodiac',
      key: 'chineseZodiac',
      score: chineseResult?.score ?? 0,
      available: chineseResult !== null,
      details: chineseResult,
    },
    {
      name: 'Palmistry',
      key: 'palmistry',
      score: palmistryScore,
      available: false, // Placeholder until image analysis is integrated
      details: null,
    },
    {
      name: 'Profile Match',
      key: 'profileMatch',
      score: profileMatchScore,
      available: !skipSet.has('profileMatch'),
      details: { score: profileMatchScore },
    },
  ];

  // ---- Calculate weighted composite score ----
  let weightedSum = 0;
  let totalWeight = 0;

  for (const entry of engineEntries) {
    const weight = adjustedWeights.get(entry.key) ?? 0;
    const weightedScore = entry.available ? entry.score * weight : 0;

    engineResults.push({
      engineName: entry.name,
      score: entry.score,
      weight,
      weightedScore,
      available: entry.available,
      details: entry.details,
    });

    if (entry.available) {
      weightedSum += weightedScore;
      totalWeight += weight;
    }
  }

  const overallScore = totalWeight > 0
    ? Math.round(weightedSum / totalWeight)
    : 0;

  // ---- Calculate confidence ----
  const confidence = calculateConfidence(profile1, profile2, availableEngines);

  // ---- Rank and deduplicate strengths/challenges ----
  const uniqueStrengths = [...new Set(allStrengths)].slice(0, 5);
  const uniqueChallenges = [...new Set(allChallenges)].slice(0, 5);

  return {
    overallScore: clamp(overallScore, 0, 100),
    confidence: Math.round(confidence * 100) / 100,
    engines: engineResults,
    topStrengths: uniqueStrengths,
    topChallenges: uniqueChallenges,
    weights: baseWeights,
    computedAt: new Date(),
  };
}
