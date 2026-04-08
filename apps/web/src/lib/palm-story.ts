/**
 * Palm Story Generator for Agar
 * Generates personalized narratives from PalmReading data.
 */

import type {
  PalmReading,
  HeartLineType,
  HeadLineType,
  LifeLineType,
  FateLineType,
} from './palmistry';

/* ---------- Types ---------- */

export interface PalmStorySection {
  line: string;
  icon: string;
  trait: string;
  narrative: string;
}

export interface PalmStory {
  title: string;
  sections: PalmStorySection[];
  summary: string;
}

/* ---------- Heart Line Narratives ---------- */

const HEART_NARRATIVES: Record<HeartLineType, string> = {
  long_curved:
    'Your heart line sweeps in a graceful arc across your palm, the mark of someone who loves with their whole being. You bring warmth and passion to your relationships, and your emotional intelligence helps you navigate even the deepest connections. Partners are drawn to your ability to express feelings openly and honestly.',
  short_straight:
    'Your heart line runs short and direct, revealing a practical and measured approach to love. You value clarity over grand gestures, and your partners appreciate your honesty and reliability. In relationships, you bring stability and a grounded perspective that others find deeply reassuring.',
  long_straight:
    'A long, straight heart line speaks of an idealist in love -- someone who dreams deeply and holds their relationships to high standards. You seek meaningful connection built on mutual respect and intellectual resonance. Your devotion runs quiet but immeasurably deep.',
  curved_to_index:
    'Your heart line curves upward toward your index finger, a sign of natural contentment and warmth in relationships. You find joy in partnership and express affection freely and generously. Others feel genuinely cared for in your presence, and you create safe, nurturing bonds.',
  curved_to_middle:
    'Your heart line curves toward your middle finger, indicating someone who is deliberate and self-aware in matters of the heart. You know what you want and pursue it with focused intent. In love, you balance personal ambition with partnership, seeking someone who respects your drive.',
  short:
    'A shorter heart line reveals someone who values independence and personal freedom above all. You love on your own terms, never losing yourself in another. Partners who respect your autonomy discover a loyal and quietly devoted companion beneath the surface.',
};

/* ---------- Head Line Narratives ---------- */

const HEAD_NARRATIVES: Record<HeadLineType, string> = {
  long_straight:
    'Your head line stretches long and straight across your palm, the hallmark of a clear, analytical mind. You think in systems and logic, approaching problems with methodical precision. In relationships, you bring thoughtful communication and the kind of mental clarity that helps navigate difficult conversations.',
  short:
    'A shorter head line reveals someone who learns through experience rather than theory. You are action-oriented and hands-on, preferring to dive in rather than overthink. Your spontaneity and directness make you a refreshing and energizing partner.',
  curved:
    'The gentle curve of your head line reveals a creative and intuitive mind. You think in patterns and possibilities rather than rigid logic, making you an innovative problem-solver. In relationships, you bring imagination and a willingness to see things from your partner\'s perspective.',
  deep:
    'Your head line runs deep and clear, indicating exceptional focus and memory. You absorb and retain information with remarkable depth, and your concentration brings intensity to everything you do. Partners value your attentiveness -- when you listen, you truly hear.',
  wavy:
    'A wavy head line speaks of a restless, multifaceted intelligence. Your mind moves between interests with agile curiosity, always seeking the next fascinating thread to pull. In love, you bring variety and spontaneity, keeping your relationships vibrant and never predictable.',
  broken:
    'Your head line shows breaks or shifts, reflecting a mind that has undergone significant evolution. You have experienced transformative changes in how you think and see the world. This adaptability is your strength -- you approach love with hard-won wisdom and openness to growth.',
};

/* ---------- Life Line Narratives ---------- */

const LIFE_NARRATIVES: Record<LifeLineType, string> = {
  long_deep:
    'A long, deeply etched life line speaks of tremendous vitality and resilience. You approach life with stamina and determination, weathering challenges with grace. Your inner strength is magnetic -- people are drawn to your steady energy and unwavering presence.',
  short_shallow:
    'Your life line is delicate and subtle, reflecting a sensitive and perceptive nature. You feel the world deeply and respond to its nuances with awareness others miss. In relationships, your empathy and emotional attunement create profound intimacy and understanding.',
  curved:
    'Your life line sweeps in a generous curve, the mark of an adventurous spirit full of energy. You embrace new experiences with enthusiasm and bring that same vitality to your relationships. Partners love your zest for life and willingness to explore the unknown together.',
  close_to_thumb:
    'A life line that stays close to the thumb reveals someone who is thoughtful and intentional in how they spend their energy. You prefer quality over quantity in all things, including relationships. Your careful, considered approach to life creates deep and meaningful bonds.',
  wide_arc:
    'Your life line swings in a wide, generous arc across your palm, radiating abundance and warmth. You live fully and give generously, embracing every experience with open arms. In love, you are expansive and welcoming, creating a sense of home wherever you go.',
  broken:
    'Breaks in your life line mark significant turning points and transformations. You have navigated -- or will navigate -- major life changes that reshape your path. This resilience gives you depth and wisdom, making you a partner who understands that growth sometimes requires letting go.',
};

/* ---------- Fate Line Narratives ---------- */

const FATE_NARRATIVES: Record<FateLineType, string> = {
  deep_clear:
    'A deep, clear fate line reveals a strong sense of purpose running through your life. You know where you are headed, and that certainty gives you a compelling presence. In partnership, you bring direction and ambition, inspiring those around you to pursue their own callings.',
  broken:
    'Your fate line shows breaks and redirections, mapping a life of reinvention. You have worn many hats and walked many paths, gaining richness of experience along the way. In love, you bring adaptability and the understanding that the best journeys are rarely straight lines.',
  starts_from_life:
    'Your fate line emerges from your life line, the mark of a self-made individual. Everything you have built has come from your own effort and determination. Partners admire your independence and the quiet confidence that comes from knowing you can rely on yourself.',
  joins_life_middle:
    'Your fate line meets your life line midway, indicating someone whose purpose is deeply connected to community and service. You find meaning through helping others and building something larger than yourself. In relationships, your generosity of spirit creates deeply fulfilling bonds.',
  faint:
    'A faint fate line suggests you are still in the beautiful process of discovering your path. You keep your options open and let life reveal its possibilities organically. In love, this openness makes you wonderfully receptive to unexpected connections and new horizons.',
};

/* ---------- Summary Generator ---------- */

function generateSummary(reading: PalmReading): string {
  const traits: string[] = [];

  // Heart
  if (['long_curved', 'curved_to_index'].includes(reading.heartLine)) {
    traits.push('deeply romantic');
  } else if (['short_straight', 'long_straight'].includes(reading.heartLine)) {
    traits.push('thoughtful in love');
  } else {
    traits.push('independent in heart');
  }

  // Head
  if (['long_straight', 'deep'].includes(reading.headLine)) {
    traits.push('analytically sharp');
  } else if (['curved', 'wavy'].includes(reading.headLine)) {
    traits.push('creatively minded');
  } else {
    traits.push('experientially driven');
  }

  // Life
  if (['long_deep', 'wide_arc', 'curved'].includes(reading.lifeLine)) {
    traits.push('full of vitality');
  } else if (['close_to_thumb', 'short_shallow'].includes(reading.lifeLine)) {
    traits.push('deeply perceptive');
  } else {
    traits.push('resilient through change');
  }

  const traitStr =
    traits.length === 3
      ? `${traits[0]}, ${traits[1]}, and ${traits[2]}`
      : traits.join(' and ');

  const fateNote = reading.fateLine
    ? reading.fateLine === 'deep_clear'
      ? ' Your strong sense of purpose adds a compelling magnetism to your personality.'
      : reading.fateLine === 'faint'
        ? ' You remain beautifully open to wherever life leads next.'
        : ' Your life path reflects a journey of meaningful evolution.'
    : '';

  return `Your palm reveals someone who is ${traitStr}. Together, these qualities create a unique emotional fingerprint -- one that will resonate deeply with the right partner.${fateNote}`;
}

/* ---------- Main Export ---------- */

export function generatePalmStory(
  reading: PalmReading,
  name: string,
): PalmStory {
  const sections: PalmStorySection[] = [
    {
      line: 'Heart Line',
      icon: 'heart',
      trait: reading.heartLine,
      narrative: HEART_NARRATIVES[reading.heartLine],
    },
    {
      line: 'Head Line',
      icon: 'brain',
      trait: reading.headLine,
      narrative: HEAD_NARRATIVES[reading.headLine],
    },
    {
      line: 'Life Line',
      icon: 'sparkles',
      trait: reading.lifeLine,
      narrative: LIFE_NARRATIVES[reading.lifeLine],
    },
  ];

  if (reading.fateLine) {
    sections.push({
      line: 'Fate Line',
      icon: 'star',
      trait: reading.fateLine,
      narrative: FATE_NARRATIVES[reading.fateLine],
    });
  }

  return {
    title: `${name}'s Palm Reading`,
    sections,
    summary: generateSummary(reading),
  };
}
