import type { WesternChart, SynastryResult, PlanetaryAspect, ZodiacSign, Planet, AspectType } from '@agar/shared';
import { getElement, getModality, getAspectBetweenSigns } from '../utils/astro-utils';

const ELEMENT_COMPAT: Record<string, Record<string, number>> = {
  fire:  { fire: 0.85, earth: 0.45, air: 0.90, water: 0.35 },
  earth: { fire: 0.45, earth: 0.80, air: 0.40, water: 0.85 },
  air:   { fire: 0.90, earth: 0.40, air: 0.75, water: 0.50 },
  water: { fire: 0.35, earth: 0.85, air: 0.50, water: 0.80 },
};

const ASPECT_SCORES: Record<string, number> = {
  conjunction: 85, trine: 95, sextile: 80, square: 40, opposition: 50, none: 55,
};

const PLANET_WEIGHTS: Record<Planet, number> = {
  sun: 0.25, moon: 0.25, venus: 0.20, mars: 0.15, mercury: 0.15, jupiter: 0, saturn: 0,
};

export class WesternAstrologyEngine {
  calculateSynastry(chart1: WesternChart, chart2: WesternChart): SynastryResult {
    const aspects: PlanetaryAspect[] = [];
    let weightedScore = 0;
    let totalWeight = 0;

    const pairs: [Planet, keyof WesternChart, Planet, keyof WesternChart][] = [
      ['sun', 'sunSign', 'sun', 'sunSign'],
      ['sun', 'sunSign', 'moon', 'moonSign'],
      ['moon', 'moonSign', 'moon', 'moonSign'],
      ['venus', 'venusSign', 'venus', 'venusSign'],
      ['venus', 'venusSign', 'mars', 'marsSign'],
      ['mars', 'marsSign', 'venus', 'venusSign'],
      ['mercury', 'mercurySign', 'mercury', 'mercurySign'],
    ];

    for (const [p1, k1, p2, k2] of pairs) {
      const s1 = chart1[k1]; const s2 = chart2[k2];
      if (!s1 || !s2) continue;
      const aspect = getAspectBetweenSigns(s1, s2);
      const score = ASPECT_SCORES[aspect] ?? 55;
      const weight = (PLANET_WEIGHTS[p1] + PLANET_WEIGHTS[p2]) / 2;
      aspects.push({ planet1: p1, sign1: s1, planet2: p2, sign2: s2, aspect: aspect as AspectType, score, description: `${p1} in ${s1} ${aspect} ${p2} in ${s2}` });
      weightedScore += score * weight;
      totalWeight += weight;
    }

    const elem1 = getElement(chart1.sunSign); const elem2 = getElement(chart2.sunSign);
    const elementCompatibility = Math.round((ELEMENT_COMPAT[elem1]?.[elem2] ?? 0.5) * 100);
    const mod1 = getModality(chart1.sunSign); const mod2 = getModality(chart2.sunSign);
    const modalityCompatibility = mod1 === mod2 ? 70 : 80;
    const aspectScore = totalWeight > 0 ? weightedScore / totalWeight : 55;
    const finalScore = Math.round(aspectScore * 0.50 + elementCompatibility * 0.30 + modalityCompatibility * 0.20);

    return {
      score: Math.max(0, Math.min(100, finalScore)),
      aspects, elementCompatibility, modalityCompatibility,
      insights: this.genInsights(chart1, chart2, finalScore),
    };
  }

  private genInsights(c1: WesternChart, c2: WesternChart, score: number): string[] {
    const ins: string[] = [];
    const sa = getAspectBetweenSigns(c1.sunSign, c2.sunSign);
    if (sa === 'trine') ins.push('Sun signs share the same element — natural harmony');
    if (sa === 'opposition') ins.push('Opposite sun signs — you balance each other');
    if (c1.venusSign && c2.marsSign) {
      const va = getAspectBetweenSigns(c1.venusSign, c2.marsSign);
      if (va === 'conjunction' || va === 'trine') ins.push('Strong Venus-Mars chemistry');
    }
    if (score >= 80) ins.push('Exceptional celestial alignment');
    else if (score >= 60) ins.push('Good astrological compatibility');
    return ins;
  }
}
