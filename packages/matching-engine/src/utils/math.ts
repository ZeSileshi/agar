// =============================================================================
// Mathematical Utilities for the Matching Engine
// =============================================================================

/**
 * Cosine similarity between two vectors.
 * Returns a value between -1 and 1.
 * For normalized embedding vectors this equals the dot product.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Euclidean distance between two vectors, normalized to 0-1 range.
 * Returns 0 for identical vectors, 1 for maximally distant.
 */
export function normalizedEuclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 1;

  let sumSqDiff = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sumSqDiff += diff * diff;
  }

  // Max possible distance for vectors with components in [0,1]
  const maxDistance = Math.sqrt(a.length);
  return Math.sqrt(sumSqDiff) / maxDistance;
}

/**
 * Convert a similarity score (-1 to 1) to a 0-100 compatibility score.
 */
export function similarityToScore(similarity: number): number {
  // Map [-1, 1] -> [0, 100]
  return Math.round(((similarity + 1) / 2) * 100);
}

/**
 * Weighted average of values with corresponding weights.
 */
export function weightedAverage(values: number[], weights: number[]): number {
  if (values.length !== weights.length || values.length === 0) return 0;

  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < values.length; i++) {
    weightedSum += values[i] * weights[i];
    totalWeight += weights[i];
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate the "complementarity score" for a trait pair.
 *
 * Some traits are best when similar (e.g., values alignment),
 * while others benefit from complementarity (e.g., introvert + extrovert).
 *
 * @param v1 - Person 1's trait value (0-1)
 * @param v2 - Person 2's trait value (0-1)
 * @param optimalDifference - The ideal difference between values (0 = same is best, 0.5 = opposite is best)
 * @param tolerance - How much deviation from optimal is acceptable (0-1)
 */
export function traitCompatibility(
  v1: number,
  v2: number,
  optimalDifference: number = 0,
  tolerance: number = 0.3,
): number {
  const actualDiff = Math.abs(v1 - v2);
  const deviation = Math.abs(actualDiff - optimalDifference);

  // Gaussian-like falloff from optimal
  const score = Math.exp(-(deviation * deviation) / (2 * tolerance * tolerance));
  return score;
}
