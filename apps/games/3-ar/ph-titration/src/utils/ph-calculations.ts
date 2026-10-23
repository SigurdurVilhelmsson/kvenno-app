import { Titration } from '../types';

/**
 * pH Calculation Utilities for Titrations
 * Handles strong-strong, weak-strong and strong-weak acid-base titrations. The
 * polyprotic branches were deleted on 2026-10-23 (mobile-pass decision 115 (a)):
 * nothing rendered them, and some fell to −∞ or NaN.
 */

const EPSILON = 1e-10; // Tolerance for floating point comparisons
const KW = 1e-14; // Ion product of water

/**
 * Calculate pH for strong acid + strong base titration
 */
export function calculateStrongStrongPH(
  volumeAcid: number,
  molarityAcid: number,
  volumeBase: number,
  molarityBase: number
): number {
  const molesAcid = (volumeAcid * molarityAcid) / 1000;
  const molesBase = (volumeBase * molarityBase) / 1000;
  const totalVolume = (volumeAcid + volumeBase) / 1000;

  if (Math.abs(molesAcid - molesBase) < EPSILON) {
    // Equivalence point
    return 7.0;
  } else if (molesAcid > molesBase) {
    // Excess acid
    const excessH = (molesAcid - molesBase) / totalVolume;
    return -Math.log10(excessH);
  } else {
    // Excess base
    const excessOH = (molesBase - molesAcid) / totalVolume;
    const pOH = -Math.log10(excessOH);
    return 14 - pOH;
  }
}

/**
 * The ion a weak acid (or base) releases when it stands beside its conjugate:
 * the root x of K = x(cConjugate + x) / (cWeak − x), the buffer's ICE table.
 *
 * Henderson-Hasselbalch is this equation with x dropped beside cConjugate, and
 * on the first drops of titrant it is not negligible: cConjugate starts at
 * zero, so HH sends the pH to minus infinity. Until 2026-09-23 the game used
 * HH here and one 0,05 mL drop of NaOH took HF from pH 2,00 to 0,21 (acetic
 * acid 2,87 → 2,05, formic 2,22 → 0,84), while a drop of HCl took ammonia
 * from 11,13 up to 11,96 — the pH moved away from the titrant, and every
 * weak-acid curve opened with a hook downwards. Once cConjugate ≫ x the root
 * is Henderson-Hasselbalch again, so the buffer region and half-equivalence
 * (pH = pKa) are unchanged.
 *
 * Written as 2Kc / (b + √(b² + 4Kc)) rather than the textbook
 * (−b + √(b² + 4Kc)) / 2, which cancels catastrophically when x is small.
 */
function conjugatePairIon(K: number, cWeak: number, cConjugate: number): number {
  const b = cConjugate + K;
  return (2 * K * cWeak) / (b + Math.sqrt(b * b + 4 * K * cWeak));
}

/**
 * Calculate pH for weak acid + strong base titration.
 * The buffer region solves the buffer's ICE table (see conjugatePairIon).
 */
export function calculateWeakStrongPH(
  volumeAcid: number,
  molarityAcid: number,
  Ka: number,
  volumeBase: number,
  molarityBase: number
): number {
  const molesAcid = (volumeAcid * molarityAcid) / 1000;
  const molesBase = (volumeBase * molarityBase) / 1000;
  const totalVolume = (volumeAcid + volumeBase) / 1000;

  if (molesBase === 0) {
    // Initial pH (weak acid). Deliberately the √(Ka·C) approximation: it is
    // the value 3-ar/syrufastinn grades against and reproduces (titrations.ts
    // initialPH 2.87), so the two adjacent nodes agree about the same beaker.
    const sqrtKaCa = Math.sqrt(Ka * molarityAcid);
    return -Math.log10(sqrtKaCa);
  } else if (molesBase < molesAcid - EPSILON) {
    // Buffer region: remaining weak acid beside the conjugate base formed
    const cHA = (molesAcid - molesBase) / totalVolume;
    const cA = molesBase / totalVolume;
    return -Math.log10(conjugatePairIon(Ka, cHA, cA));
  } else if (Math.abs(molesBase - molesAcid) < EPSILON) {
    // Equivalence point (weak base solution)
    const Cb = molesBase / totalVolume;
    const Kb = KW / Ka;
    const pOH = 0.5 * (-Math.log10(Kb) - Math.log10(Cb));
    return 14 - pOH;
  } else {
    // Excess strong base
    const excessOH = (molesBase - molesAcid) / totalVolume;
    return 14 + Math.log10(excessOH);
  }
}

/**
 * Calculate pH for weak base + strong acid titration
 */
export function calculateStrongWeakPH(
  volumeBase: number,
  molarityBase: number,
  pKa: number,
  volumeAcid: number,
  molarityAcid: number
): number {
  const molesBase = (volumeBase * molarityBase) / 1000;
  const molesAcid = (volumeAcid * molarityAcid) / 1000;
  const totalVolume = (volumeBase + volumeAcid) / 1000;
  const Ka = Math.pow(10, -pKa);

  if (molesAcid === 0) {
    // Initial pH (weak base)
    const Kb = KW / Ka;
    const pOH = 0.5 * (-Math.log10(Kb) - Math.log10(molarityBase));
    return 14 - pOH;
  } else if (molesAcid < molesBase - EPSILON) {
    // Buffer region: remaining weak base beside the conjugate acid formed
    const cB = (molesBase - molesAcid) / totalVolume;
    const cBH = molesAcid / totalVolume;
    return 14 + Math.log10(conjugatePairIon(KW / Ka, cB, cBH));
  } else if (Math.abs(molesAcid - molesBase) < EPSILON) {
    // Equivalence point (weak acid solution)
    const Ca = molesAcid / totalVolume;
    const sqrtKaCa = Math.sqrt(Ka * Ca);
    return -Math.log10(sqrtKaCa);
  } else {
    // Excess strong acid
    const excessH = (molesAcid - molesBase) / totalVolume;
    return -Math.log10(excessH);
  }
}

/**
 * Main pH calculation dispatcher based on titration type
 */
export function calculatePH(titration: Titration, volumeAdded: number): number {
  switch (titration.type) {
    case 'strong-strong':
      return calculateStrongStrongPH(
        titration.analyte.volume,
        titration.analyte.molarity,
        volumeAdded,
        titration.titrant.molarity
      );

    case 'weak-strong': {
      const Ka = titration.Ka || 1e-5;
      return calculateWeakStrongPH(
        titration.analyte.volume,
        titration.analyte.molarity,
        Ka,
        volumeAdded,
        titration.titrant.molarity
      );
    }

    case 'strong-weak': {
      const pKa = titration.pKa || 9.0;
      return calculateStrongWeakPH(
        titration.analyte.volume,
        titration.analyte.molarity,
        pKa,
        volumeAdded,
        titration.titrant.molarity
      );
    }

    default: {
      const _exhaustiveCheck: never = titration;
      throw new Error(`Unknown titration type: ${(_exhaustiveCheck as Titration).type}`);
    }
  }
}

/**
 * Generate titration curve data points
 */
export function generateTitrationCurve(
  titration: Titration,
  maxVolume?: number
): Array<{ volume: number; pH: number }> {
  const eqVol = titration.equivalenceVolume;
  const max = maxVolume || eqVol * 2;
  const points: Array<{ volume: number; pH: number }> = [];

  // Generate points with higher density near equivalence point
  for (let v = 0; v <= max; v += 0.5) {
    points.push({ volume: v, pH: calculatePH(titration, v) });
  }

  // Add extra points very close to equivalence for better curve
  const margins = [0.1, 0.05, 0.01];
  for (const margin of margins) {
    if (eqVol - margin > 0) {
      points.push({ volume: eqVol - margin, pH: calculatePH(titration, eqVol - margin) });
    }
    if (eqVol + margin <= max) {
      points.push({ volume: eqVol + margin, pH: calculatePH(titration, eqVol + margin) });
    }
  }

  // Sort by volume
  points.sort((a, b) => a.volume - b.volume);

  return points;
}

/**
 * Get pH color for visualization
 */
export function getPHColor(pH: number): string {
  if (pH < 0) pH = 0;
  if (pH > 14) pH = 14;

  const colors = [
    '#8B0000', // 0 - Dark red
    '#DC143C', // 1 - Crimson
    '#FF0000', // 2 - Red
    '#FF4500', // 3 - Orange red
    '#FF6347', // 4 - Tomato
    '#FFA500', // 5 - Orange
    '#FFD700', // 6 - Gold
    '#00FF00', // 7 - Green
    '#00CED1', // 8 - Dark turquoise
    '#1E90FF', // 9 - Dodger blue
    '#0000FF', // 10 - Blue
    '#4B0082', // 11 - Indigo
    '#8B00FF', // 12 - Violet
    '#9400D3', // 13 - Dark violet
    '#800080', // 14 - Purple
  ];

  const index = Math.floor(pH);
  return colors[Math.min(index, 14)];
}
