import type {
  CompatibilityReport, CompatibilityBreakdown, CompatibilityInsight,
  WesternChart, VedicChart, ChineseZodiacProfile, BirthData,
} from '@agar/shared';
import { DEFAULT_COMPATIBILITY_WEIGHTS, type CompatibilityWeights } from '@agar/shared';
import { WesternAstrologyEngine } from './western-astrology';
import { VedicAstrologyEngine } from './vedic-astrology';
import { ChineseZodiacEngine } from './chinese-zodiac';
import { BehavioralEngine } from './behavioral';

interface UserData {
  userId: string;
  birthData?: BirthData;
  interests: string[];
  personalityProfile?: Record<string, unknown>;
}

export class UnifiedCompatibilityEngine {
  private westernEngine = new WesternAstrologyEngine();
  private vedicEngine = new VedicAstrologyEngine();
  private chineseEngine = new ChineseZodiacEngine();
  private behavioralEngine = new BehavioralEngine();

  calculateCompatibility(
    user1: UserData,
    user2: UserData,
    weights: CompatibilityWeights = DEFAULT_COMPATIBILITY_WEIGHTS,
  ): CompatibilityReport {
    const breakdown: CompatibilityBreakdown = {
      behavioral: this.behavioralEngine.calculateScore(
        (user1.personalityProfile ?? {}) as any,
        (user2.personalityProfile ?? {}) as any,
        user1.interests,
        user2.interests,
      ),
      profile: {
        score: this.calculateProfileMatch(user1, user2),
        sharedInterests: user1.interests.filter(i => user2.interests.includes(i)),
        locationProximity: 70, // Default — needs geo data
        ageCompatibility: 80,
        goalAlignment: 70,
      },
    };

    let confidence = 0.3; // Base confidence with just profile data

    // Western Astrology (if both have birth data with signs)
    if (user1.birthData?.westernChart && user2.birthData?.westernChart) {
      breakdown.western = this.westernEngine.calculateSynastry(
        user1.birthData.westernChart,
        user2.birthData.westernChart,
      );
      confidence += 0.2;
    }

    // Vedic Astrology (if both have nakshatra data)
    if (user1.birthData?.vedicChart && user2.birthData?.vedicChart) {
      breakdown.vedic = this.vedicEngine.calculateGunaScore(
        user1.birthData.vedicChart,
        user2.birthData.vedicChart,
      );
      confidence += 0.2;
    }

    // Chinese Zodiac (if both have Chinese zodiac profiles)
    if (user1.birthData?.chineseZodiac && user2.birthData?.chineseZodiac) {
      breakdown.chinese = this.chineseEngine.calculateCompatibility(
        user1.birthData.chineseZodiac,
        user2.birthData.chineseZodiac,
      );
      confidence += 0.15;
    }

    // Normalize weights to active engines
    const activeWeights = this.normalizeWeights(weights, breakdown);

    // Calculate unified score
    let overallScore = 0;
    overallScore += (breakdown.behavioral?.score ?? 0) * activeWeights.behavioral;
    overallScore += (breakdown.western?.score ?? 0) * activeWeights.western;
    overallScore += (breakdown.vedic?.normalizedScore ?? 0) * activeWeights.vedic;
    overallScore += (breakdown.chinese?.score ?? 0) * activeWeights.chinese;
    overallScore += (breakdown.palmistry?.score ?? 0) * activeWeights.palmistry;
    overallScore += (breakdown.profile?.score ?? 0) * activeWeights.profile;

    overallScore = Math.round(Math.max(0, Math.min(100, overallScore)));

    // Generate insights
    const insights = this.generateUnifiedInsights(breakdown);
    const { strengths, challenges, advice } = this.categorizeInsights(breakdown, overallScore);

    return {
      user1Id: user1.userId,
      user2Id: user2.userId,
      overallScore,
      confidence: Math.min(1, confidence),
      breakdown,
      insights,
      strengths,
      challenges,
      advice,
      calculatedAt: new Date().toISOString(),
    };
  }

  private calculateProfileMatch(user1: UserData, user2: UserData): number {
    const shared = user1.interests.filter(i => user2.interests.includes(i));
    const total = new Set([...user1.interests, ...user2.interests]).size;
    if (total === 0) return 50;

    return Math.round((shared.length / total) * 80 + 20);
  }

  private normalizeWeights(
    weights: CompatibilityWeights,
    breakdown: CompatibilityBreakdown,
  ): CompatibilityWeights {
    const active: CompatibilityWeights = { ...weights };

    // Zero out weights for missing engines
    if (!breakdown.western) active.western = 0;
    if (!breakdown.vedic) active.vedic = 0;
    if (!breakdown.chinese) active.chinese = 0;
    if (!breakdown.palmistry) active.palmistry = 0;

    // Normalize so weights sum to 1
    const total = Object.values(active).reduce((s, v) => s + v, 0);
    if (total === 0) return DEFAULT_COMPATIBILITY_WEIGHTS;

    return {
      behavioral: active.behavioral / total,
      western: active.western / total,
      vedic: active.vedic / total,
      chinese: active.chinese / total,
      palmistry: active.palmistry / total,
      profile: active.profile / total,
    };
  }

  private generateUnifiedInsights(breakdown: CompatibilityBreakdown): CompatibilityInsight[] {
    const insights: CompatibilityInsight[] = [];

    // Behavioral insights
    if (breakdown.behavioral.score >= 75) {
      insights.push({
        category: 'behavioral',
        title: 'Strong Personality Match',
        description: 'Your personalities complement each other naturally',
        icon: 'brain',
        sentiment: 'positive',
      });
    }

    // Western astrology insights
    if (breakdown.western && breakdown.western.score >= 70) {
      insights.push({
        category: 'western',
        title: 'Celestial Harmony',
        description: 'The stars indicate strong romantic potential',
        icon: 'stars',
        sentiment: 'positive',
      });
    }

    // Vedic insights
    if (breakdown.vedic) {
      if (breakdown.vedic.verdict === 'excellent') {
        insights.push({
          category: 'vedic',
          title: 'Auspicious Vedic Match',
          description: `${breakdown.vedic.totalScore}/36 Gunas — highly favorable`,
          icon: 'om',
          sentiment: 'positive',
        });
      } else if (breakdown.vedic.verdict === 'not_recommended') {
        insights.push({
          category: 'vedic',
          title: 'Vedic Compatibility Note',
          description: 'Lower Guna score — other compatibility factors may compensate',
          icon: 'om',
          sentiment: 'caution',
        });
      }
    }

    // Chinese zodiac insights
    if (breakdown.chinese) {
      if (breakdown.chinese.relationship === 'best_match') {
        insights.push({
          category: 'chinese',
          title: 'Zodiac Soulmates',
          description: 'Your Chinese zodiac signs are a legendary match',
          icon: 'dragon',
          sentiment: 'positive',
        });
      }
    }

    // Shared interests
    if (breakdown.profile.sharedInterests.length >= 3) {
      insights.push({
        category: 'profile',
        title: 'Lots in Common',
        description: `You share ${breakdown.profile.sharedInterests.length} interests`,
        icon: 'heart',
        sentiment: 'positive',
      });
    }

    return insights;
  }

  private categorizeInsights(
    breakdown: CompatibilityBreakdown,
    overallScore: number,
  ): { strengths: string[]; challenges: string[]; advice: string[] } {
    const strengths: string[] = [];
    const challenges: string[] = [];
    const advice: string[] = [];

    if (breakdown.behavioral.personalityMatch >= 70) strengths.push('Complementary personalities');
    if (breakdown.behavioral.interestSimilarity >= 70) strengths.push('Many shared interests');
    if (breakdown.behavioral.communicationStyle >= 70) strengths.push('Compatible communication styles');
    if (breakdown.western && breakdown.western.score >= 70) strengths.push('Favorable astrological alignment');
    if (breakdown.vedic && breakdown.vedic.totalScore >= 21) strengths.push('Good Vedic compatibility');
    if (breakdown.chinese && breakdown.chinese.score >= 70) strengths.push('Chinese zodiac harmony');

    if (breakdown.behavioral.personalityMatch < 50) challenges.push('Different personality types');
    if (breakdown.behavioral.interestSimilarity < 40) challenges.push('Few shared interests');
    if (breakdown.western && breakdown.western.score < 40) challenges.push('Astrological tension to navigate');

    if (overallScore >= 80) {
      advice.push('This is an exceptional match — be open and authentic from the start');
    } else if (overallScore >= 60) {
      advice.push('Good foundation — focus on your shared interests to build connection');
    } else {
      advice.push('Take time to discover common ground — differences can create growth');
    }

    if (breakdown.behavioral.communicationStyle < 60) {
      advice.push('Discuss your communication preferences early on');
    }

    return { strengths, challenges, advice };
  }
}
