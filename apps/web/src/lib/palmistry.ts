/**
 * Palmistry Analysis & Compatibility Engine for Agar
 * Based on traditional Chinese palmistry (heart, head, life, fate lines).
 * Reference: https://www.chinaeducationaltours.com/guide/culture-palmistry-meaning.htm
 */

/* ---------- Palm Line Types ---------- */

// Heart Line -- indicates emotional life and relationships
export type HeartLineType =
  | 'long_curved'      // Romantic, warm, good at expressing emotions
  | 'short_straight'   // Practical, analytical in love
  | 'long_straight'    // Deep thinker, idealistic in love
  | 'curved_to_index'  // Content, happy in relationships
  | 'curved_to_middle' // Selfish in love, materialistic
  | 'short';           // Self-centered, little interest in romance

// Head Line -- indicates intellect and communication style
export type HeadLineType =
  | 'long_straight'    // Analytical, clear thinker
  | 'short'            // Physical over mental achievements
  | 'curved'           // Creative, spontaneous
  | 'deep'             // Excellent memory, focused
  | 'wavy'             // Restless, short attention span
  | 'broken';          // Inconsistent thinking

// Life Line -- indicates vitality and life experience (NOT life length)
export type LifeLineType =
  | 'long_deep'        // Great vitality, stamina
  | 'short_shallow'    // Easily manipulated by others
  | 'curved'           // Full of energy, adventurous
  | 'close_to_thumb'   // Often tired, cautious
  | 'wide_arc'         // Full of life, generous
  | 'broken';          // Major life changes

// Fate Line -- indicates life direction and career (optional)
export type FateLineType =
  | 'deep_clear'       // Strong sense of purpose, career-driven
  | 'broken'           // Many career changes
  | 'starts_from_life' // Self-made, independent
  | 'joins_life_middle'// Community-oriented, gives to others
  | 'faint';           // Uncertain path

/* ---------- Palm Reading Interface ---------- */

export interface PalmReading {
  heartLine: HeartLineType;
  headLine: HeadLineType;
  lifeLine: LifeLineType;
  fateLine: FateLineType | null; // optional, not everyone has one
}

/* ---------- Display Metadata ---------- */

export interface LineOption<T extends string> {
  value: T;
  label: string;
  description: string;
}

export const HEART_LINE_OPTIONS: LineOption<HeartLineType>[] = [
  { value: 'long_curved',      label: 'Long & Curved',       description: 'Romantic, warm, and good at expressing emotions freely' },
  { value: 'short_straight',   label: 'Short & Straight',    description: 'Practical and analytical approach to love and relationships' },
  { value: 'long_straight',    label: 'Long & Straight',     description: 'Deep thinker with idealistic views about love' },
  { value: 'curved_to_index',  label: 'Curves to Index Finger', description: 'Content, happy, and naturally fulfilled in relationships' },
  { value: 'curved_to_middle', label: 'Curves to Middle Finger', description: 'Focused on material security and personal desires in love' },
  { value: 'short',            label: 'Short',               description: 'Independent, values personal freedom over deep romance' },
];

export const HEAD_LINE_OPTIONS: LineOption<HeadLineType>[] = [
  { value: 'long_straight', label: 'Long & Straight',  description: 'Analytical and clear thinker, logical decision-maker' },
  { value: 'short',         label: 'Short',            description: 'Prefers physical achievements and hands-on experiences' },
  { value: 'curved',        label: 'Curved',           description: 'Creative, spontaneous, and imaginative thinker' },
  { value: 'deep',          label: 'Deep & Clear',     description: 'Excellent memory, highly focused and concentrated' },
  { value: 'wavy',          label: 'Wavy',             description: 'Restless mind, multitasker with varied interests' },
  { value: 'broken',        label: 'Broken / Split',   description: 'Experiences shifts in thinking style throughout life' },
];

export const LIFE_LINE_OPTIONS: LineOption<LifeLineType>[] = [
  { value: 'long_deep',      label: 'Long & Deep',      description: 'Great vitality, strong stamina, and resilience' },
  { value: 'short_shallow',  label: 'Short & Shallow',  description: 'Sensitive to influence, goes with the flow in life' },
  { value: 'curved',         label: 'Curved',           description: 'Full of energy, loves adventure and new experiences' },
  { value: 'close_to_thumb', label: 'Close to Thumb',   description: 'Thoughtful and cautious, prefers steady routines' },
  { value: 'wide_arc',       label: 'Wide Arc',         description: 'Full of life, generous spirit, embraces everything' },
  { value: 'broken',         label: 'Broken / Split',   description: 'Has experienced or will experience major life changes' },
];

export const FATE_LINE_OPTIONS: LineOption<FateLineType>[] = [
  { value: 'deep_clear',        label: 'Deep & Clear',          description: 'Strong sense of purpose and direction, career-driven' },
  { value: 'broken',            label: 'Broken / Fragmented',   description: 'Multiple career paths or frequent life direction changes' },
  { value: 'starts_from_life',  label: 'Starts from Life Line', description: 'Self-made individual, built success independently' },
  { value: 'joins_life_middle', label: 'Joins Life Line',       description: 'Community-oriented, finds purpose through helping others' },
  { value: 'faint',             label: 'Faint / Barely Visible', description: 'Still discovering their path, open to possibilities' },
];

/* ---------- Heart Line Compatibility ---------- */

const HEART_COMPAT: Record<HeartLineType, Record<HeartLineType, { score: number; insight: string }>> = {
  long_curved: {
    long_curved:      { score: 88, insight: 'Both deeply emotional -- a passionate and expressive connection' },
    short_straight:   { score: 62, insight: 'Heart vs. mind in love -- requires patience and mutual understanding' },
    long_straight:    { score: 78, insight: 'Romantic warmth meets deep idealism -- a poetic bond' },
    curved_to_index:  { score: 85, insight: 'Both seek happiness in love -- naturally nurturing partnership' },
    curved_to_middle: { score: 52, insight: 'Generous heart meets guarded one -- may need to bridge emotional gaps' },
    short:            { score: 45, insight: 'One craves connection while the other values independence' },
  },
  short_straight: {
    long_curved:      { score: 62, insight: 'Heart vs. mind in love -- requires patience and mutual understanding' },
    short_straight:   { score: 80, insight: 'Practical partnership -- both value logic and stability in love' },
    long_straight:    { score: 72, insight: 'Two thinkers approaching love differently -- stimulating debates' },
    curved_to_index:  { score: 68, insight: 'Warmth tempers practicality -- a balancing dynamic' },
    curved_to_middle: { score: 70, insight: 'Both pragmatic about relationships -- clear expectations' },
    short:            { score: 65, insight: 'Both value independence -- space-respecting partnership' },
  },
  long_straight: {
    long_curved:      { score: 78, insight: 'Romantic warmth meets deep idealism -- a poetic bond' },
    short_straight:   { score: 72, insight: 'Two thinkers approaching love differently -- stimulating debates' },
    long_straight:    { score: 82, insight: 'Shared idealism creates deep intellectual and emotional resonance' },
    curved_to_index:  { score: 75, insight: 'Idealist meets optimist -- uplifting and inspiring pairing' },
    curved_to_middle: { score: 55, insight: 'Idealism clashes with materialism -- fundamentally different values' },
    short:            { score: 50, insight: 'Deep longing meets detachment -- emotional disconnect likely' },
  },
  curved_to_index: {
    long_curved:      { score: 85, insight: 'Both seek happiness in love -- naturally nurturing partnership' },
    short_straight:   { score: 68, insight: 'Warmth tempers practicality -- a balancing dynamic' },
    long_straight:    { score: 75, insight: 'Idealist meets optimist -- uplifting and inspiring pairing' },
    curved_to_index:  { score: 90, insight: 'Two content souls -- harmonious, joyful, and deeply satisfying love' },
    curved_to_middle: { score: 58, insight: 'One gives freely while the other focuses inward -- imbalance risk' },
    short:            { score: 55, insight: 'One nurtures while the other maintains distance -- patience needed' },
  },
  curved_to_middle: {
    long_curved:      { score: 52, insight: 'Generous heart meets guarded one -- may need to bridge emotional gaps' },
    short_straight:   { score: 70, insight: 'Both pragmatic about relationships -- clear expectations' },
    long_straight:    { score: 55, insight: 'Idealism clashes with materialism -- fundamentally different values' },
    curved_to_index:  { score: 58, insight: 'One gives freely while the other focuses inward -- imbalance risk' },
    curved_to_middle: { score: 60, insight: 'Both self-focused -- may struggle to prioritize each other' },
    short:            { score: 63, insight: 'Both value personal space -- functional but may lack depth' },
  },
  short: {
    long_curved:      { score: 45, insight: 'One craves connection while the other values independence' },
    short_straight:   { score: 65, insight: 'Both value independence -- space-respecting partnership' },
    long_straight:    { score: 50, insight: 'Deep longing meets detachment -- emotional disconnect likely' },
    curved_to_index:  { score: 55, insight: 'One nurtures while the other maintains distance -- patience needed' },
    curved_to_middle: { score: 63, insight: 'Both value personal space -- functional but may lack depth' },
    short:            { score: 58, insight: 'Two independents -- strong freedom but may drift apart' },
  },
};

export function heartLineCompatibility(
  h1: HeartLineType,
  h2: HeartLineType,
): { score: number; insight: string } {
  return HEART_COMPAT[h1]?.[h2] ?? { score: 60, insight: 'Unique emotional dynamic' };
}

/* ---------- Head Line Compatibility ---------- */

const HEAD_COMPAT: Record<HeadLineType, Record<HeadLineType, { score: number; insight: string }>> = {
  long_straight: {
    long_straight: { score: 85, insight: 'Two analytical minds -- excellent intellectual partnership' },
    short:         { score: 55, insight: 'Thinker meets doer -- complementary if respected' },
    curved:        { score: 78, insight: 'Logic meets creativity -- stimulating and balanced dynamic' },
    deep:          { score: 88, insight: 'Both focused thinkers -- deep understanding and mutual respect' },
    wavy:          { score: 50, insight: 'Structured mind meets scattered energy -- requires patience' },
    broken:        { score: 52, insight: 'Consistent thinker meets evolving one -- adaptation needed' },
  },
  short: {
    long_straight: { score: 55, insight: 'Thinker meets doer -- complementary if respected' },
    short:         { score: 72, insight: 'Both action-oriented -- great for shared physical activities' },
    curved:        { score: 68, insight: 'Hands-on meets creative -- fun and spontaneous together' },
    deep:          { score: 58, insight: 'Surface explorer meets deep diver -- different processing styles' },
    wavy:          { score: 62, insight: 'Both prefer variety -- never boring but may lack depth' },
    broken:        { score: 60, insight: 'Both adaptable -- flexible partnership' },
  },
  curved: {
    long_straight: { score: 78, insight: 'Logic meets creativity -- stimulating and balanced dynamic' },
    short:         { score: 68, insight: 'Hands-on meets creative -- fun and spontaneous together' },
    curved:        { score: 82, insight: 'Double creativity -- imaginative and inspiring relationship' },
    deep:          { score: 75, insight: 'Creative spark meets focused depth -- powerful combination' },
    wavy:          { score: 70, insight: 'Two free spirits -- exciting but may need grounding' },
    broken:        { score: 65, insight: 'Creative mind meets adaptive one -- ever-evolving dynamic' },
  },
  deep: {
    long_straight: { score: 88, insight: 'Both focused thinkers -- deep understanding and mutual respect' },
    short:         { score: 58, insight: 'Surface explorer meets deep diver -- different processing styles' },
    curved:        { score: 75, insight: 'Creative spark meets focused depth -- powerful combination' },
    deep:          { score: 85, insight: 'Two deeply focused minds -- intense and meaningful connection' },
    wavy:          { score: 48, insight: 'Deep focus meets restlessness -- fundamental tension' },
    broken:        { score: 55, insight: 'Steadfast mind meets shifting perspective -- patience required' },
  },
  wavy: {
    long_straight: { score: 50, insight: 'Structured mind meets scattered energy -- requires patience' },
    short:         { score: 62, insight: 'Both prefer variety -- never boring but may lack depth' },
    curved:        { score: 70, insight: 'Two free spirits -- exciting but may need grounding' },
    deep:          { score: 48, insight: 'Deep focus meets restlessness -- fundamental tension' },
    wavy:          { score: 60, insight: 'Both restless -- exciting chaos but may lack stability' },
    broken:        { score: 58, insight: 'Both unpredictable -- wild ride with uncertain destination' },
  },
  broken: {
    long_straight: { score: 52, insight: 'Consistent thinker meets evolving one -- adaptation needed' },
    short:         { score: 60, insight: 'Both adaptable -- flexible partnership' },
    curved:        { score: 65, insight: 'Creative mind meets adaptive one -- ever-evolving dynamic' },
    deep:          { score: 55, insight: 'Steadfast mind meets shifting perspective -- patience required' },
    wavy:          { score: 58, insight: 'Both unpredictable -- wild ride with uncertain destination' },
    broken:        { score: 55, insight: 'Both in transition -- can grow together or apart' },
  },
};

export function headLineCompatibility(
  h1: HeadLineType,
  h2: HeadLineType,
): { score: number; insight: string } {
  return HEAD_COMPAT[h1]?.[h2] ?? { score: 60, insight: 'Unique intellectual dynamic' };
}

/* ---------- Life Line Compatibility ---------- */

const LIFE_COMPAT: Record<LifeLineType, Record<LifeLineType, { score: number; insight: string }>> = {
  long_deep: {
    long_deep:       { score: 90, insight: 'Both full of vitality -- an energetic and resilient partnership' },
    short_shallow:   { score: 52, insight: 'One strong, one sensitive -- protector dynamic may emerge' },
    curved:          { score: 85, insight: 'Stamina meets adventure -- unstoppable together' },
    close_to_thumb:  { score: 60, insight: 'Energetic meets cautious -- one may push while the other pulls back' },
    wide_arc:        { score: 88, insight: 'Both embrace life fully -- generous and vibrant partnership' },
    broken:          { score: 65, insight: 'Stability supports transformation -- grounding influence' },
  },
  short_shallow: {
    long_deep:       { score: 52, insight: 'One strong, one sensitive -- protector dynamic may emerge' },
    short_shallow:   { score: 62, insight: 'Both sensitive -- gentle partnership but may lack drive' },
    curved:          { score: 55, insight: 'Adventurer may overwhelm the sensitive soul -- pace matters' },
    close_to_thumb:  { score: 70, insight: 'Both prefer a gentle pace -- quiet comfort together' },
    wide_arc:        { score: 58, insight: 'Generous spirit may overwhelm -- needs balanced giving' },
    broken:          { score: 60, insight: 'Both navigating uncertainty -- can find strength in shared vulnerability' },
  },
  curved: {
    long_deep:       { score: 85, insight: 'Stamina meets adventure -- unstoppable together' },
    short_shallow:   { score: 55, insight: 'Adventurer may overwhelm the sensitive soul -- pace matters' },
    curved:          { score: 82, insight: 'Two adventurers -- thrilling life together, always exploring' },
    close_to_thumb:  { score: 50, insight: 'Explorer meets homebody -- fundamental lifestyle tension' },
    wide_arc:        { score: 85, insight: 'Both love life -- adventurous and generous together' },
    broken:          { score: 68, insight: 'Adventure helps navigate life changes -- supportive dynamic' },
  },
  close_to_thumb: {
    long_deep:       { score: 60, insight: 'Energetic meets cautious -- one may push while the other pulls back' },
    short_shallow:   { score: 70, insight: 'Both prefer a gentle pace -- quiet comfort together' },
    curved:          { score: 50, insight: 'Explorer meets homebody -- fundamental lifestyle tension' },
    close_to_thumb:  { score: 75, insight: 'Two cautious souls -- safe and predictable but may miss excitement' },
    wide_arc:        { score: 55, insight: 'One expands while the other contracts -- opposite energies' },
    broken:          { score: 58, insight: 'Caution meets change -- one provides stability through transitions' },
  },
  wide_arc: {
    long_deep:       { score: 88, insight: 'Both embrace life fully -- generous and vibrant partnership' },
    short_shallow:   { score: 58, insight: 'Generous spirit may overwhelm -- needs balanced giving' },
    curved:          { score: 85, insight: 'Both love life -- adventurous and generous together' },
    close_to_thumb:  { score: 55, insight: 'One expands while the other contracts -- opposite energies' },
    wide_arc:        { score: 88, insight: 'Two generous souls -- abundant, joyful life together' },
    broken:          { score: 68, insight: 'Generosity supports transformation -- healing partnership' },
  },
  broken: {
    long_deep:       { score: 65, insight: 'Stability supports transformation -- grounding influence' },
    short_shallow:   { score: 60, insight: 'Both navigating uncertainty -- can find strength in shared vulnerability' },
    curved:          { score: 68, insight: 'Adventure helps navigate life changes -- supportive dynamic' },
    close_to_thumb:  { score: 58, insight: 'Caution meets change -- one provides stability through transitions' },
    wide_arc:        { score: 68, insight: 'Generosity supports transformation -- healing partnership' },
    broken:          { score: 55, insight: 'Both in flux -- exciting journey but may lack anchor' },
  },
};

export function lifeLineCompatibility(
  l1: LifeLineType,
  l2: LifeLineType,
): { score: number; insight: string } {
  return LIFE_COMPAT[l1]?.[l2] ?? { score: 60, insight: 'Unique life energy dynamic' };
}

/* ---------- Fate Line Insights (bonus, no score impact) ---------- */

const FATE_INSIGHTS: Record<FateLineType, Record<FateLineType, string>> = {
  deep_clear: {
    deep_clear:        'Both purpose-driven -- a power couple building something meaningful together',
    broken:            'One steady, one evolving -- patience and support will strengthen the bond',
    starts_from_life:  'Two self-starters -- impressive ambition but make time for each other',
    joins_life_middle: 'Career-driven meets community-focused -- can accomplish great things together',
    faint:             'One knows their path, the other is seeking -- guidance without pressure helps',
  },
  broken: {
    deep_clear:        'One steady, one evolving -- patience and support will strengthen the bond',
    broken:            'Both on winding paths -- shared journey of discovery and reinvention',
    starts_from_life:  'Independence meets change -- adaptable and resilient together',
    joins_life_middle: 'Life changes meet community purpose -- growth through service',
    faint:             'Both exploring -- open-minded but may need shared goals',
  },
  starts_from_life: {
    deep_clear:        'Two self-starters -- impressive ambition but make time for each other',
    broken:            'Independence meets change -- adaptable and resilient together',
    starts_from_life:  'Two self-made individuals -- mutual respect for independence',
    joins_life_middle: 'Individual drive meets collective purpose -- powerful balance',
    faint:             'Self-made meets seeker -- one can inspire the other',
  },
  joins_life_middle: {
    deep_clear:        'Career-driven meets community-focused -- can accomplish great things together',
    broken:            'Life changes meet community purpose -- growth through service',
    starts_from_life:  'Individual drive meets collective purpose -- powerful balance',
    joins_life_middle: 'Both community-oriented -- a giving partnership that uplifts others',
    faint:             'Purpose-driven meets uncertain -- shared service can provide direction',
  },
  faint: {
    deep_clear:        'One knows their path, the other is seeking -- guidance without pressure helps',
    broken:            'Both exploring -- open-minded but may need shared goals',
    starts_from_life:  'Self-made meets seeker -- one can inspire the other',
    joins_life_middle: 'Purpose-driven meets uncertain -- shared service can provide direction',
    faint:             'Both still searching -- a journey of discovery together',
  },
};

function fateLineInsight(f1: FateLineType | null, f2: FateLineType | null): string | null {
  if (!f1 || !f2) return null;
  return FATE_INSIGHTS[f1]?.[f2] ?? null;
}

/* ---------- Overall Palmistry Compatibility ---------- */

export interface PalmistryCompatResult {
  score: number;
  heartScore: number;
  headScore: number;
  lifeScore: number;
  insights: string[];
  /** Single short insight for display on cards */
  summaryInsight: string;
}

export function palmistryCompatibility(
  reading1: PalmReading,
  reading2: PalmReading,
): PalmistryCompatResult {
  const heart = heartLineCompatibility(reading1.heartLine, reading2.heartLine);
  const head = headLineCompatibility(reading1.headLine, reading2.headLine);
  const life = lifeLineCompatibility(reading1.lifeLine, reading2.lifeLine);

  // Weights: heart 50%, head 25%, life 25%
  const score = Math.round(heart.score * 0.5 + head.score * 0.25 + life.score * 0.25);

  const insights: string[] = [
    `Heart lines: ${heart.insight}`,
    `Head lines: ${head.insight}`,
    `Life lines: ${life.insight}`,
  ];

  // Add fate line insight as bonus
  const fate = fateLineInsight(reading1.fateLine, reading2.fateLine);
  if (fate) {
    insights.push(`Fate lines: ${fate}`);
  }

  // Pick the most relevant short insight (heart line since it's most important for dating)
  const summaryInsight = heart.insight;

  return {
    score: Math.max(20, Math.min(99, score)),
    heartScore: heart.score,
    headScore: head.score,
    lifeScore: life.score,
    insights,
    summaryInsight,
  };
}

/* ---------- Validation ---------- */

export function isValidPalmReading(reading: unknown): reading is PalmReading {
  if (!reading || typeof reading !== 'object') return false;
  const r = reading as Record<string, unknown>;
  const validHeart: string[] = ['long_curved', 'short_straight', 'long_straight', 'curved_to_index', 'curved_to_middle', 'short'];
  const validHead: string[] = ['long_straight', 'short', 'curved', 'deep', 'wavy', 'broken'];
  const validLife: string[] = ['long_deep', 'short_shallow', 'curved', 'close_to_thumb', 'wide_arc', 'broken'];
  const validFate: string[] = ['deep_clear', 'broken', 'starts_from_life', 'joins_life_middle', 'faint'];

  if (!validHeart.includes(r.heartLine as string)) return false;
  if (!validHead.includes(r.headLine as string)) return false;
  if (!validLife.includes(r.lifeLine as string)) return false;
  if (r.fateLine !== null && !validFate.includes(r.fateLine as string)) return false;
  return true;
}
