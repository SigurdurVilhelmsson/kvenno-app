import { Titration } from '../types';

/**
 * pH Calculation Utilities for Titrations
 * Handles strong-strong, weak-strong, strong-weak, and polyprotic acid-base titrations
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
 * Calculate pH for weak acid + strong base titration
 * Uses Henderson-Hasselbalch equation in buffer region
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
  const pKa = -Math.log10(Ka);

  if (molesBase === 0) {
    // Initial pH (weak acid)
    const sqrtKaCa = Math.sqrt(Ka * (molarityAcid / 1000));
    return -Math.log10(sqrtKaCa);
  } else if (molesBase < molesAcid - EPSILON) {
    // Buffer region (Henderson-Hasselbalch)
    const molesA = molesBase; // Conjugate base formed
    const molesHA = molesAcid - molesBase; // Remaining weak acid
    return pKa + Math.log10(molesA / molesHA);
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
    const pOH = 0.5 * (-Math.log10(Kb) - Math.log10(molarityBase / 1000));
    return 14 - pOH;
  } else if (molesAcid < molesBase - EPSILON) {
    // Buffer region
    const molesBH = molesAcid; // Conjugate acid formed
    const molesB = molesBase - molesAcid; // Remaining weak base
    return pKa + Math.log10(molesB / molesBH);
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
 * Calculate pH for diprotic acid + strong base titration
 */
export function calculatePolyproticDiproticPH(
  volumeAcid: number,
  molarityAcid: number,
  Ka1: number,
  Ka2: number,
  volumeBase: number,
  molarityBase: number
): number {
  const molesAcid = (volumeAcid * molarityAcid) / 1000;
  const molesBase = (volumeBase * molarityBase) / 1000;
  const totalVolume = (volumeAcid + volumeBase) / 1000;
  const pKa1 = -Math.log10(Ka1);
  const pKa2 = -Math.log10(Ka2);

  if (molesBase === 0) {
    // Initial pH - diprotic acid (use Ka1 only)
    const sqrtKaCa = Math.sqrt(Ka1 * (molarityAcid / 1000));
    return -Math.log10(sqrtKaCa);
  } else if (molesBase < molesAcid * 0.5 - EPSILON) {
    // First buffer region (H2A/HA-)
    const molesHA = molesBase;
    const molesH2A = molesAcid - molesBase;
    return pKa1 + Math.log10(molesHA / molesH2A);
  } else if (Math.abs(molesBase - molesAcid * 0.5) < EPSILON) {
    // First half-equivalence point
    return pKa1;
  } else if (molesBase < molesAcid - EPSILON) {
    // Between half-eq and first eq point
    const molesHA = molesAcid - molesBase;
    const molesA = molesBase - molesHA;
    return pKa1 + Math.log10(molesA / molesHA);
  } else if (Math.abs(molesBase - molesAcid) < EPSILON) {
    // First equivalence point (HA- amphoteric)
    return (pKa1 + pKa2) / 2;
  } else if (molesBase < molesAcid * 1.5 - EPSILON) {
    // Second buffer region (HA-/A2-)
    const molesA = molesBase - molesAcid;
    const molesHA = 2 * molesAcid - molesBase;
    return pKa2 + Math.log10(molesA / molesHA);
  } else if (Math.abs(molesBase - molesAcid * 1.5) < EPSILON) {
    // Second half-equivalence point
    return pKa2;
  } else if (molesBase < molesAcid * 2 - EPSILON) {
    // Between second half-eq and second eq
    const molesHA = molesAcid * 2 - molesBase;
    const molesA = molesBase - molesAcid;
    return pKa2 + Math.log10(molesA / molesHA);
  } else if (Math.abs(molesBase - molesAcid * 2) < EPSILON) {
    // Second equivalence point (A2- weak base)
    const Cb = molesBase / totalVolume;
    const Kb = KW / Ka2;
    const pOH = 0.5 * (-Math.log10(Kb) - Math.log10(Cb));
    return 14 - pOH;
  } else {
    // Excess strong base
    const excessOH = (molesBase - molesAcid * 2) / totalVolume;
    return 14 + Math.log10(excessOH);
  }
}

/**
 * Calculate pH for triprotic acid + strong base titration
 */
export function calculatePolyproticTriproticPH(
  volumeAcid: number,
  molarityAcid: number,
  Ka1: number,
  Ka2: number,
  Ka3: number,
  volumeBase: number,
  molarityBase: number
): number {
  const molesAcid = (volumeAcid * molarityAcid) / 1000;
  const molesBase = (volumeBase * molarityBase) / 1000;
  const totalVolume = (volumeAcid + volumeBase) / 1000;
  const pKa1 = -Math.log10(Ka1);
  const pKa2 = -Math.log10(Ka2);
  const pKa3 = -Math.log10(Ka3);

  if (molesBase === 0) {
    // Initial pH - triprotic acid
    const sqrtKaCa = Math.sqrt(Ka1 * (molarityAcid / 1000));
    return -Math.log10(sqrtKaCa);
  } else if (molesBase < molesAcid * 0.5) {
    // First buffer region (H3A/H2A-)
    const molesH2A = molesBase;
    const molesH3A = molesAcid - molesBase;
    return pKa1 + Math.log10(molesH2A / molesH3A);
  } else if (Math.abs(molesBase - molesAcid) < EPSILON) {
    // First equivalence point
    return (pKa1 + pKa2) / 2;
  } else if (molesBase < molesAcid * 1.5) {
    // Second buffer region (H2A-/HA2-)
    const molesHA = molesBase - molesAcid;
    const molesH2A = 2 * molesAcid - molesBase;
    return pKa2 + Math.log10(molesHA / molesH2A);
  } else if (Math.abs(molesBase - molesAcid * 2) < EPSILON) {
    // Second equivalence point
    return (pKa2 + pKa3) / 2;
  } else if (molesBase < molesAcid * 2.5) {
    // Third buffer region (HA2-/A3-)
    const molesA = molesBase - 2 * molesAcid;
    const molesHA = 3 * molesAcid - molesBase;
    return pKa3 + Math.log10(molesA / molesHA);
  } else if (Math.abs(molesBase - molesAcid * 3) < EPSILON) {
    // Third equivalence point
    const Cb = molesBase / totalVolume;
    const Kb = KW / Ka3;
    const pOH = 0.5 * (-Math.log10(Kb) - Math.log10(Cb));
    return 14 - pOH;
  } else {
    // Excess strong base
    const excessOH = (molesBase - molesAcid * 3) / totalVolume;
    return 14 + Math.log10(excessOH);
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

    case 'polyprotic-diprotic':
      return calculatePolyproticDiproticPH(
        titration.analyte.volume,
        titration.analyte.molarity,
        titration.Ka1,
        titration.Ka2,
        volumeAdded,
        titration.titrant.molarity
      );

    case 'polyprotic-triprotic':
      return calculatePolyproticTriproticPH(
        titration.analyte.volume,
        titration.analyte.molarity,
        titration.Ka1,
        titration.Ka2,
        titration.Ka3!,
        volumeAdded,
        titration.titrant.molarity
      );

    default:
      throw new Error(`Unknown titration type: ${(titration as any).type}`);
  }
}

/**
 * Generate titration curve data points
 */
export function generateTitrationCurve(
  titration: Titration,
  maxVolume?: number
): Array<{ volume: number; pH: number }> {
  // Determine equivalence volume based on titration type
  let eqVol: number;
  if (titration.type === 'polyprotic-diprotic' || titration.type === 'polyprotic-triprotic') {
    eqVol = Math.max(...(titration as any).equivalenceVolumes);
  } else {
    eqVol = (titration as any).equivalenceVolume;
  }

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
