/**
 * Calculate the least common multiple of two positive integers.
 */
export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

/**
 * Calculate the greatest common divisor of two positive integers.
 */
export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y > 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

/**
 * Given electron counts for oxidation and reduction half-reactions,
 * calculate the multipliers needed to balance electrons.
 *
 * Returns [multiplierOx, multiplierRed].
 */
export function calculateMultipliers(
  electronsOx: number,
  electronsRed: number
): [number, number] {
  const totalElectrons = lcm(electronsOx, electronsRed);
  return [totalElectrons / electronsOx, totalElectrons / electronsRed];
}

/**
 * Strip superscript/subscript characters from a chemical species string
 * for case-insensitive comparison.
 */
export function stripCharges(species: string): string {
  return species.replace(/[⁺⁻²³⁴₂₃₄]/g, '').toLowerCase();
}

/**
 * Check if a user's identification of oxidized/reduced species is correct.
 */
export function checkIdentification(
  userOxidized: string,
  userReduced: string,
  correctOxSpecies: string,
  correctRedSpecies: string
): { oxidizedCorrect: boolean; reducedCorrect: boolean } {
  return {
    oxidizedCorrect: stripCharges(userOxidized) === stripCharges(correctOxSpecies),
    reducedCorrect: stripCharges(userReduced) === stripCharges(correctRedSpecies),
  };
}
