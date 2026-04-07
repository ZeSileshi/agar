import type { ChineseZodiacProfile, ChineseCompatibilityResult, ChineseAnimal, ChineseElement } from '@agar/shared';

const COMPAT: Record<ChineseAnimal, Record<ChineseAnimal, number>> = {
  rat:     { rat: 2, ox: 3, tiger: 1, rabbit: 0, dragon: 3, snake: 2, horse: -1, goat: 0, monkey: 3, rooster: 1, dog: 1, pig: 2 },
  ox:      { rat: 3, ox: 2, tiger: 0, rabbit: 1, dragon: 1, snake: 3, horse: -1, goat: 0, monkey: 1, rooster: 3, dog: 0, pig: 1 },
  tiger:   { rat: 1, ox: 0, tiger: 2, rabbit: 2, dragon: 2, snake: 0, horse: 3, goat: 1, monkey: -1, rooster: 0, dog: 3, pig: 3 },
  rabbit:  { rat: 0, ox: 1, tiger: 2, rabbit: 2, dragon: 1, snake: 1, horse: 1, goat: 3, monkey: 1, rooster: -1, dog: 3, pig: 3 },
  dragon:  { rat: 3, ox: 1, tiger: 2, rabbit: 1, dragon: 2, snake: 2, horse: 1, goat: 1, monkey: 3, rooster: 3, dog: -1, pig: 2 },
  snake:   { rat: 2, ox: 3, tiger: 0, rabbit: 1, dragon: 2, snake: 2, horse: 1, goat: 0, monkey: 1, rooster: 3, dog: 1, pig: -1 },
  horse:   { rat: -1, ox: -1, tiger: 3, rabbit: 1, dragon: 1, snake: 1, horse: 2, goat: 3, monkey: 1, rooster: 1, dog: 3, pig: 2 },
  goat:    { rat: 0, ox: 0, tiger: 1, rabbit: 3, dragon: 1, snake: 0, horse: 3, goat: 2, monkey: 1, rooster: 0, dog: 1, pig: 3 },
  monkey:  { rat: 3, ox: 1, tiger: -1, rabbit: 1, dragon: 3, snake: 1, horse: 1, goat: 1, monkey: 2, rooster: 1, dog: 1, pig: 1 },
  rooster: { rat: 1, ox: 3, tiger: 0, rabbit: -1, dragon: 3, snake: 3, horse: 1, goat: 0, monkey: 1, rooster: 2, dog: 0, pig: 1 },
  dog:     { rat: 1, ox: 0, tiger: 3, rabbit: 3, dragon: -1, snake: 1, horse: 3, goat: 1, monkey: 1, rooster: 0, dog: 2, pig: 2 },
  pig:     { rat: 2, ox: 1, tiger: 3, rabbit: 3, dragon: 2, snake: -1, horse: 2, goat: 3, monkey: 1, rooster: 1, dog: 2, pig: 2 },
};

const ELEM_REL: Record<ChineseElement, { gen: ChineseElement; over: ChineseElement; by: ChineseElement }> = {
  wood: { gen: 'fire', over: 'earth', by: 'water' }, fire: { gen: 'earth', over: 'metal', by: 'wood' },
  earth: { gen: 'metal', over: 'water', by: 'fire' }, metal: { gen: 'water', over: 'wood', by: 'earth' },
  water: { gen: 'wood', over: 'fire', by: 'metal' },
};

export class ChineseZodiacEngine {
  calculateCompatibility(p1: ChineseZodiacProfile, p2: ChineseZodiacProfile): ChineseCompatibilityResult {
    const animal = this.animalScore(p1.animal, p2.animal);
    const element = this.elemScore(p1.element, p2.element);
    const yy = p1.yinYang !== p2.yinYang ? 85 : 65;
    const score = Math.round(animal * 0.50 + element * 0.30 + yy * 0.20);
    const raw = COMPAT[p1.animal]?.[p2.animal] ?? 1;
    const rel = raw === 3 ? 'best_match' as const : raw === 2 ? 'compatible' as const : raw === 1 ? 'neutral' as const : raw === 0 ? 'challenging' as const : 'clash' as const;
    const insights: string[] = [];
    if (animal >= 75) insights.push(`${p1.animal} and ${p2.animal} are naturally drawn to each other`);
    if (p1.yinYang !== p2.yinYang) insights.push('Yin-Yang balance achieved');
    return { score: Math.max(0, Math.min(100, score)), animalCompatibility: animal, elementCompatibility: element, yinYangBalance: yy, relationship: rel, insights };
  }
  private animalScore(a1: ChineseAnimal, a2: ChineseAnimal): number {
    return Math.round(((( COMPAT[a1]?.[a2] ?? 1) + 1) / 4) * 100);
  }
  private elemScore(e1: ChineseElement, e2: ChineseElement): number {
    if (e1 === e2) return 75;
    const r = ELEM_REL[e1]; if (!r) return 50;
    if (r.gen === e2 || r.by === e2) return 90;
    if (r.over === e2) return 35;
    return 55;
  }
}
