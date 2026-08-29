/**
 * Weak-acid equilibrium maths.
 *
 * Everything the game grades on lives here, deliberately free of React and of
 * Icelandic, so it can be tested against literature values directly.
 *
 * The one design decision the rest of the game follows from: **the exact
 * solution is the source of truth, and the √(Ka·C) approximation is a thing the
 * student is taught to check, not a thing the game secretly relies on.**
 *
 * `ph-titration` already computes initial pH as `-log₁₀(√(Ka·Ca))`
 * (`utils/ph-calculations.ts:57-58`) with no validity test. That is fine for the
 * acids and concentrations it ships, but it is exactly the habit this game
 * exists to replace: a student who cannot say *why* the approximation is
 * allowed cannot tell when it stops being allowed. So `solveWeakAcid` returns
 * both roots and the error between them, and the Apply phase asks about the
 * gap.
 */

/** Autoionisation constant of water at 25 °C (klofningsfasti vatns). */
export const KW = 1.0e-14;

export interface WeakAcidSolution {
  /** [H⁺] from the exact quadratic, mol/L. */
  hExact: number;
  /** [H⁺] from the √(Ka·C) approximation, mol/L. */
  hApprox: number;
  /** pH from the exact root. */
  pH: number;
  /** pH from the approximation. */
  pHApprox: number;
  /** Fraction of the acid dissociated, 0–1 (from the exact root). */
  fractionDissociated: number;
  /** Relative error of the approximation in [H⁺], as a fraction. */
  approxRelativeError: number;
  /**
   * Whether the approximation is acceptable by the usual 5 % rule — i.e.
   * dissociation is under 5 %, so C − x ≈ C holds.
   */
  approximationValid: boolean;
}

/**
 * Solve HA ⇌ H⁺ + A⁻ for a monoprotic weak acid in pure water.
 *
 * Exact within the model: solves x² + Ka·x − Ka·C = 0, which is the mass-action
 * expression with C − x in the denominator, not C. The model still neglects
 * water's own autoionisation, so it is not valid for very dilute or very weak
 * acids — see `waterContributionMatters`.
 */
export function solveWeakAcid(ka: number, concentration: number): WeakAcidSolution {
  if (!(ka > 0)) throw new RangeError(`Ka must be positive, got ${ka}`);
  if (!(concentration > 0))
    throw new RangeError(`Concentration must be positive, got ${concentration}`);

  // x = (−Ka + √(Ka² + 4·Ka·C)) / 2 — the positive root.
  const hExact = (-ka + Math.sqrt(ka * ka + 4 * ka * concentration)) / 2;
  const hApprox = Math.sqrt(ka * concentration);

  const fractionDissociated = hExact / concentration;
  const approxRelativeError = (hApprox - hExact) / hExact;

  return {
    hExact,
    hApprox,
    pH: -Math.log10(hExact),
    pHApprox: -Math.log10(hApprox),
    fractionDissociated,
    approxRelativeError,
    // The 5 % rule is stated on dissociation, not on the error in [H⁺]; the two
    // are close but not identical, and the textbook rule is the one taught.
    approximationValid: fractionDissociated < 0.05,
  };
}

/**
 * Whether water's own H⁺ is within `threshold` of the acid's — i.e. whether
 * ignoring it (as `solveWeakAcid` does) is starting to matter.
 *
 * A guard rail for the problem data, not something the student is asked. Any
 * problem where this is true would need the full treatment and does not belong
 * in this game.
 */
export function waterContributionMatters(hExact: number, threshold = 0.01): boolean {
  return 1e-7 / hExact > threshold;
}

/** Ka → pKa. */
export function pKa(ka: number): number {
  return -Math.log10(ka);
}

/** pKa → Ka. */
export function kaFromPKa(value: number): number {
  return Math.pow(10, -value);
}

/**
 * Kb of the conjugate base, from Ka of the acid: Ka·Kb = Kw.
 *
 * This identity is the whole reason the game covers bases at all — there is no
 * separate body of base arithmetic to learn, only the relationship.
 */
export function kbFromKa(ka: number): number {
  return KW / ka;
}

/** Ka of the conjugate acid, from Kb of the base. The same identity, reversed. */
export function kaFromKb(kb: number): number {
  return KW / kb;
}

/**
 * Ka back out of a measured equilibrium, which is how Ka is determined in the
 * first place: Ka = x²/(C − x), where x = [H⁺] at equilibrium.
 *
 * The Explore phase runs this direction — measure pH, recover Ka — so that Ka
 * arrives as something derived from an observation rather than as a number
 * handed over in a table.
 */
export function kaFromMeasuredPH(measuredPH: number, concentration: number): number {
  const h = Math.pow(10, -measuredPH);
  if (h >= concentration)
    throw new RangeError(
      `[H⁺] (${h.toExponential(3)}) must be below the acid concentration (${concentration}) — ` +
        'a weak acid cannot be more than fully dissociated.'
    );
  return (h * h) / (concentration - h);
}

/** pOH → pH and back, at 25 °C. */
export function pHFromPOH(poh: number): number {
  return 14 - poh;
}

/** pH of a weak base solution, via Kb and the same quadratic. */
export function solveWeakBase(kb: number, concentration: number): WeakAcidSolution {
  // Structurally identical: OH⁻ plays the role H⁺ plays for the acid.
  const asAcid = solveWeakAcid(kb, concentration);
  return {
    ...asAcid,
    pH: pHFromPOH(-Math.log10(asAcid.hExact)),
    pHApprox: pHFromPOH(-Math.log10(asAcid.hApprox)),
  };
}
