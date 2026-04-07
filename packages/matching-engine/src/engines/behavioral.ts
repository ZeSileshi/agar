import type { BehavioralScore } from '@agar/shared';

interface PersonalityProfile {
  // Big Five mapped to dating context
  openness: number;       // 0-1: Adventure vs routine
  conscientiousness: number; // 0-1: Organized vs spontaneous
  extraversion: number;   // 0-1: Social vs reserved
  agreeableness: number;  // 0-1: Accommodating vs independent
  neuroticism: number;    // 0-1: Sensitive vs resilient

  // Dating-specific traits
  communicationStyle: 'direct' | 'indirect' | 'balanced';
  loveLanguage: 'words' | 'acts' | 'gifts' | 'time' | 'touch';
  conflictStyle: 'confronting' | 'avoiding' | 'compromising';
  socialEnergy: 'introvert' | 'ambivert' | 'extrovert';
  lifestyle: 'active' | 'balanced' | 'relaxed';
}

export class BehavioralEngine {
  calculateScore(
    profile1: Partial<PersonalityProfile>,
    profile2: Partial<PersonalityProfile>,
    interests1: string[],
    interests2: string[],
  ): BehavioralScore {
    const personalityMatch = this.calculatePersonalityMatch(profile1, profile2);
    const interestSimilarity = this.calculateInterestSimilarity(interests1, interests2);
    const communicationStyle = this.calculateCommunicationMatch(profile1, profile2);
    const lifestyleMatch = this.calculateLifestyleMatch(profile1, profile2);

    // Weighted combination
    const score = Math.round(
      personalityMatch * 0.30 +
      interestSimilarity * 0.25 +
      communicationStyle * 0.25 +
      lifestyleMatch * 0.20,
    );

    return {
      score: Math.max(0, Math.min(100, score)),
      personalityMatch,
      interestSimilarity,
      communicationStyle,
      lifestyleMatch,
      insights: this.generateInsights(personalityMatch, interestSimilarity, communicationStyle, lifestyleMatch),
    };
  }

  private calculatePersonalityMatch(p1: Partial<PersonalityProfile>, p2: Partial<PersonalityProfile>): number {
    const traits: (keyof PersonalityProfile)[] = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

    let totalSimilarity = 0;
    let traitCount = 0;

    for (const trait of traits) {
      const v1 = p1[trait] as number | undefined;
      const v2 = p2[trait] as number | undefined;
      if (v1 !== undefined && v2 !== undefined) {
        // Complementary scoring:
        // - For some traits, similarity is good (openness, agreeableness)
        // - For others, moderate difference is ideal (extraversion)
        const diff = Math.abs(v1 - v2);

        if (trait === 'extraversion') {
          // Moderate difference is good for extraversion
          totalSimilarity += diff < 0.5 ? (1 - diff * 0.5) : (1 - diff * 1.2);
        } else if (trait === 'neuroticism') {
          // Lower combined neuroticism is better
          totalSimilarity += 1 - (v1 + v2) / 2;
        } else {
          // Similarity is generally good
          totalSimilarity += 1 - diff;
        }
        traitCount++;
      }
    }

    if (traitCount === 0) return 60; // Default moderate score
    return Math.round((totalSimilarity / traitCount) * 100);
  }

  private calculateInterestSimilarity(interests1: string[], interests2: string[]): number {
    if (interests1.length === 0 || interests2.length === 0) return 50;

    const set1 = new Set(interests1);
    const set2 = new Set(interests2);

    // Jaccard similarity
    const intersection = interests1.filter(i => set2.has(i)).length;
    const union = new Set([...interests1, ...interests2]).size;

    if (union === 0) return 50;

    const jaccard = intersection / union;

    // Boost for having multiple shared interests
    const sharedCount = intersection;
    const sharedBonus = Math.min(sharedCount * 5, 20);

    return Math.min(100, Math.round(jaccard * 80 + sharedBonus));
  }

  private calculateCommunicationMatch(p1: Partial<PersonalityProfile>, p2: Partial<PersonalityProfile>): number {
    let score = 65; // Base score

    // Communication style
    if (p1.communicationStyle && p2.communicationStyle) {
      if (p1.communicationStyle === p2.communicationStyle) score += 15;
      else if (p1.communicationStyle === 'balanced' || p2.communicationStyle === 'balanced') score += 10;
    }

    // Love language
    if (p1.loveLanguage && p2.loveLanguage) {
      if (p1.loveLanguage === p2.loveLanguage) score += 15;
      else score += 5;
    }

    // Conflict style
    if (p1.conflictStyle && p2.conflictStyle) {
      if (p1.conflictStyle === p2.conflictStyle) score += 5;
      else if (p1.conflictStyle === 'compromising' || p2.conflictStyle === 'compromising') score += 10;
    }

    return Math.min(100, score);
  }

  private calculateLifestyleMatch(p1: Partial<PersonalityProfile>, p2: Partial<PersonalityProfile>): number {
    let score = 65;

    // Social energy
    if (p1.socialEnergy && p2.socialEnergy) {
      if (p1.socialEnergy === p2.socialEnergy) score += 20;
      else if (p1.socialEnergy === 'ambivert' || p2.socialEnergy === 'ambivert') score += 15;
      else score += 5;
    }

    // Lifestyle pace
    if (p1.lifestyle && p2.lifestyle) {
      if (p1.lifestyle === p2.lifestyle) score += 15;
      else if (p1.lifestyle === 'balanced' || p2.lifestyle === 'balanced') score += 10;
    }

    return Math.min(100, score);
  }

  private generateInsights(
    personality: number, interests: number, communication: number, lifestyle: number,
  ): string[] {
    const insights: string[] = [];

    if (personality >= 75) insights.push('Strong personality alignment — you complement each other well');
    else if (personality < 50) insights.push('Different personalities can bring exciting growth opportunities');

    if (interests >= 70) insights.push('Many shared interests — lots to do together');
    else if (interests < 40) insights.push('Different interests can broaden each other\'s horizons');

    if (communication >= 75) insights.push('Communication styles are well-matched');
    if (lifestyle >= 75) insights.push('Compatible lifestyle preferences');

    return insights;
  }
}
