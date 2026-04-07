import type { VedicChart, GunaResult, KootaScore, Nakshatra, DoshaResult } from '@agar/shared';

const NK_VARNA: Record<string, number> = {
  ashwini: 4, pushya: 4, hasta: 4, swati: 4, anuradha: 4, shravana: 4, revati: 4,
  bharani: 3, magha: 3, purva_phalguni: 3, vishakha: 3, purva_ashadha: 3, purva_bhadrapada: 3,
  krittika: 2, rohini: 2, uttara_phalguni: 2, chitra: 2, uttara_ashadha: 2, uttara_bhadrapada: 2,
  mrigashira: 1, ardra: 1, punarvasu: 1, ashlesha: 1, jyeshtha: 1, mula: 1, dhanishta: 1, shatabhisha: 1,
};

const NK_GANA: Record<string, string> = {
  ashwini: 'deva', mrigashira: 'deva', punarvasu: 'deva', pushya: 'deva',
  hasta: 'deva', swati: 'deva', anuradha: 'deva', shravana: 'deva', revati: 'deva',
  bharani: 'manushya', rohini: 'manushya', ardra: 'manushya', purva_phalguni: 'manushya',
  uttara_phalguni: 'manushya', purva_ashadha: 'manushya', uttara_ashadha: 'manushya',
  purva_bhadrapada: 'manushya', uttara_bhadrapada: 'manushya',
  krittika: 'rakshasa', ashlesha: 'rakshasa', magha: 'rakshasa', chitra: 'rakshasa',
  vishakha: 'rakshasa', jyeshtha: 'rakshasa', mula: 'rakshasa', dhanishta: 'rakshasa', shatabhisha: 'rakshasa',
};

const NK_YONI: Record<string, string> = {
  ashwini: 'horse', bharani: 'elephant', krittika: 'goat', rohini: 'serpent',
  mrigashira: 'serpent', ardra: 'dog', punarvasu: 'cat', pushya: 'goat',
  ashlesha: 'cat', magha: 'rat', purva_phalguni: 'rat', uttara_phalguni: 'cow',
  hasta: 'buffalo', chitra: 'tiger', swati: 'buffalo', vishakha: 'tiger',
  anuradha: 'deer', jyeshtha: 'deer', mula: 'dog', purva_ashadha: 'monkey',
  uttara_ashadha: 'mongoose', shravana: 'monkey', dhanishta: 'lion',
  shatabhisha: 'horse', purva_bhadrapada: 'lion', uttara_bhadrapada: 'cow', revati: 'elephant',
};

const YONI_ENEMIES: Record<string, string> = {
  horse: 'buffalo', elephant: 'lion', goat: 'monkey', serpent: 'mongoose',
  dog: 'deer', cat: 'rat', cow: 'tiger', buffalo: 'horse',
  tiger: 'cow', rat: 'cat', monkey: 'goat', mongoose: 'serpent', deer: 'dog', lion: 'elephant',
};

const NK_NADI: Record<string, number> = {
  ashwini: 1, bharani: 2, krittika: 3, rohini: 3, mrigashira: 2, ardra: 1,
  punarvasu: 1, pushya: 2, ashlesha: 3, magha: 3, purva_phalguni: 2, uttara_phalguni: 1,
  hasta: 1, chitra: 2, swati: 3, vishakha: 3, anuradha: 2, jyeshtha: 1,
  mula: 1, purva_ashadha: 2, uttara_ashadha: 3, shravana: 3, dhanishta: 2, shatabhisha: 1,
  purva_bhadrapada: 1, uttara_bhadrapada: 2, revati: 3,
};

export class VedicAstrologyEngine {
  calculateGunaScore(c1: VedicChart, c2: VedicChart): GunaResult {
    const kootas: KootaScore[] = [
      this.varna(c1.nakshatra, c2.nakshatra),
      this.vasya(c1.rashi, c2.rashi),
      this.tara(c1.nakshatra, c2.nakshatra),
      this.yoni(c1.nakshatra, c2.nakshatra),
      this.grahaMaitri(c1.rashi, c2.rashi),
      this.gana(c1.nakshatra, c2.nakshatra),
      this.bhakoot(c1.rashi, c2.rashi),
      this.nadi(c1.nakshatra, c2.nakshatra),
    ];
    const total = kootas.reduce((s, k) => s + k.score, 0);
    const norm = Math.round((total / 36) * 100);
    const doshas = this.detectDoshas(kootas);
    const verdict = total >= 28 ? 'excellent' as const : total >= 21 ? 'good' as const : total >= 15 ? 'moderate' as const : 'not_recommended' as const;
    return { totalScore: total, normalizedScore: norm, kootas, doshas, verdict, insights: this.insights(total, kootas, doshas) };
  }

  private varna(n1: Nakshatra, n2: Nakshatra): KootaScore {
    const score = (NK_VARNA[n1] ?? 2) >= (NK_VARNA[n2] ?? 2) ? 1 : 0;
    return { name: 'varna', maxPoints: 1, score, description: score ? 'Spiritual harmony' : 'Different spiritual levels' };
  }
  private vasya(r1: string, r2: string): KootaScore {
    return { name: 'vasya', maxPoints: 2, score: r1 === r2 ? 2 : 1, description: 'Attraction compatibility' };
  }
  private tara(n1: Nakshatra, n2: Nakshatra): KootaScore {
    const nks = Object.keys(NK_VARNA);
    const diff = ((nks.indexOf(n2) - nks.indexOf(n1) + 27) % 27) % 9;
    const ok = [1, 2, 4, 6, 8].includes(diff);
    return { name: 'tara', maxPoints: 3, score: ok ? 3 : 0, description: ok ? 'Destiny aligned' : 'Destiny requires attention' };
  }
  private yoni(n1: Nakshatra, n2: Nakshatra): KootaScore {
    const y1 = NK_YONI[n1] ?? ''; const y2 = NK_YONI[n2] ?? '';
    if (y1 === y2) return { name: 'yoni', maxPoints: 4, score: 4, description: 'Excellent physical match' };
    if (YONI_ENEMIES[y1] === y2) return { name: 'yoni', maxPoints: 4, score: 0, description: 'Physical compatibility needs work' };
    return { name: 'yoni', maxPoints: 4, score: 2, description: 'Good physical compatibility' };
  }
  private grahaMaitri(r1: string, r2: string): KootaScore {
    return { name: 'graha_maitri', maxPoints: 5, score: r1 === r2 ? 5 : 3, description: 'Mental compatibility' };
  }
  private gana(n1: Nakshatra, n2: Nakshatra): KootaScore {
    const g1 = NK_GANA[n1] ?? 'manushya'; const g2 = NK_GANA[n2] ?? 'manushya';
    if (g1 === g2) return { name: 'gana', maxPoints: 6, score: 6, description: 'Matching temperaments' };
    if (g1 === 'deva' || g2 === 'deva') return { name: 'gana', maxPoints: 6, score: 3, description: 'Compatible temperaments' };
    return { name: 'gana', maxPoints: 6, score: 0, description: 'Different temperaments' };
  }
  private bhakoot(r1: string, r2: string): KootaScore {
    return { name: 'bhakoot', maxPoints: 7, score: r1 === r2 ? 7 : 4, description: 'Love and health compatibility' };
  }
  private nadi(n1: Nakshatra, n2: Nakshatra): KootaScore {
    const nd1 = NK_NADI[n1] ?? 1; const nd2 = NK_NADI[n2] ?? 2;
    return nd1 !== nd2
      ? { name: 'nadi', maxPoints: 8, score: 8, description: 'Excellent health compatibility' }
      : { name: 'nadi', maxPoints: 8, score: 0, description: 'Nadi Dosha detected' };
  }
  private detectDoshas(kootas: KootaScore[]): DoshaResult[] {
    const d: DoshaResult[] = [];
    const nadi = kootas.find(k => k.name === 'nadi');
    if (nadi && nadi.score === 0) d.push({ name: 'Nadi Dosha', detected: true, severity: 'severe', description: 'Same Nadi', remedies: ['Nadi Nivarana Puja', 'Mahamrityunjaya Mantra'] });
    if (d.length === 0) d.push({ name: 'None', detected: false, severity: 'none', description: 'No doshas detected' });
    return d;
  }
  private insights(total: number, _k: KootaScore[], doshas: DoshaResult[]): string[] {
    const ins: string[] = [];
    if (total >= 28) ins.push('Exceptional Vedic match');
    else if (total >= 21) ins.push('Good Vedic compatibility');
    else ins.push('Moderate Vedic compatibility');
    if (doshas.some(d => d.detected)) ins.push('Dosha(s) detected — remedies available');
    return ins;
  }
}
