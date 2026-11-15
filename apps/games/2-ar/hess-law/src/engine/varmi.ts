/**
 * Calorimetry and bond energies, the arithmetic behind "Varmamælingar og tengjaorka".
 *
 * Specific heats come from the book's table in ch05/m68724 (at 25 °C and 1 bar) and the
 * average bond energies from its table in ch07/m68741. Every problem, worked step and slip on
 * the screen is computed here from the quantities it states.
 */

/** Specific heat, J/(g·°C), from ch05/m68724. */
export const SPECIFIC_HEAT = {
  vatn: 4.184,
  etanol: 2.376,
  al: 0.897,
  jarn: 0.449,
  kopar: 0.385,
  bly: 0.13,
  gull: 0.129,
} as const;
export type Substance = keyof typeof SPECIFIC_HEAT;

/** Average bond energies, kJ/mól, from ch07/m68741. */
export const BOND_ENERGY = {
  'H–H': 436,
  'C–H': 415,
  'N–H': 390,
  'O–H': 464,
  'H–Cl': 432,
  'C–C': 345,
  'C=C': 611,
  'C≡C': 837,
  'C–O': 350,
  'C=O': 741,
  'C≡O': 1080,
  'N≡N': 946,
  'O=O': 498,
  'Cl–Cl': 243,
} as const;
export type Bond = keyof typeof BOND_ENERGY;

/** q = m·c·ΔT, in J. */
export function heat(massG: number, c: number, deltaT: number): number {
  return massG * c * deltaT;
}

export interface Body {
  massG: number;
  c: number;
  /** °C at the start. */
  t: number;
}

/**
 * The temperature two or more bodies reach together when no heat leaves them:
 * Σ m·c·(T − tᵢ) = 0, so T = Σ m·c·tᵢ / Σ m·c.
 */
export function finalTemperature(bodies: readonly Body[]): number {
  const capacity = bodies.reduce((a, b) => a + b.massG * b.c, 0);
  return bodies.reduce((a, b) => a + b.massG * b.c * b.t, 0) / capacity;
}

/** ΔH ≈ Σ D(rofin tengi) − Σ D(mynduð tengi), kJ. */
export function bondEnthalpy(
  broken: readonly (readonly [Bond, number])[],
  formed: readonly (readonly [Bond, number])[]
): number {
  const sum = (list: readonly (readonly [Bond, number])[]) =>
    list.reduce((a, [bond, n]) => a + BOND_ENERGY[bond] * n, 0);
  return sum(broken) - sum(formed);
}

/** Graded to 1 %, as the other calculated answers on the platform are. */
export function within(value: number, answer: number): boolean {
  return Math.abs(value - answer) <= Math.abs(answer) * 0.01;
}
