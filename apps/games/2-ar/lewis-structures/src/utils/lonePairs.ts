/** "1 par", "2 pör": Icelandic counts a single pair in the singular. */
export const pairCount = (n: number): string => `${n} ${n === 1 ? 'par' : 'pör'}`;

/**
 * Where the central atom's lone pairs sit: `count` angles in the gaps between
 * its bonds. Every gap takes as many pairs as its share of the circle allows,
 * spread evenly inside it, so no pair lands on a bond and none is dropped.
 * It used to draw at most one pair per gap, so HCl's three pairs on Cl (one
 * bond, one gap) drew as one, and H₂O never showed more than two.
 */
export function centralLonePairAngles(bondAngles: number[], count: number): number[] {
  if (count <= 0) return [];
  if (bondAngles.length === 0) {
    return Array.from({ length: count }, (_, i) => (i / count) * Math.PI * 2 - Math.PI / 2);
  }
  const sorted = [...bondAngles].sort((a, b) => a - b);
  const gaps = sorted.map((start, i) => {
    let size = sorted[(i + 1) % sorted.length] - start;
    if (size <= 0) size += Math.PI * 2;
    return { start, size, pairs: 0 };
  });
  // Hand the pairs out one at a time to the gap with the most room left.
  for (let placed = 0; placed < count; placed++) {
    let best = gaps[0];
    for (const g of gaps) {
      if (g.size / (g.pairs + 1) > best.size / (best.pairs + 1)) best = g;
    }
    best.pairs++;
  }
  return gaps.flatMap((g) =>
    Array.from({ length: g.pairs }, (_, j) => g.start + (g.size * (j + 1)) / (g.pairs + 1))
  );
}
