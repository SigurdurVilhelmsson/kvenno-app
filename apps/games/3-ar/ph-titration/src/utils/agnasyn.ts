/**
 * The chemistry behind Agnasýn, the particle view of one titration: 25,0 mL of
 * 0,100 M ediksýra titrated with 0,100 M NaOH. It is titration 5 in
 * `data/titrations.ts` and the textbook's own worked example (ch. 14, the
 * equivalence point at pH 8,72), so the screen, the book and Stig 2 describe
 * one flask.
 *
 * The pH comes from `calculateWeakStrongPH`, the same function that draws every
 * curve in this game, so the particle view cannot disagree with Stig 2. The
 * species follow from that pH: [CH₃COO⁻] = C·Kₐ / (Kₐ + [H₃O⁺]).
 *
 * The particle counts are the amounts on a fixed scale, 8 particles per mmól,
 * so the 2,50 mmól of acid are 20 particles and each 1,25 mL of NaOH is one
 * Na⁺ and one OH⁻. Two minor species are far below one particle and are what
 * the two scenes about them are for: the ions of the acid's own ionisation at
 * the start (0,27 of a particle) and the OH⁻ of acetate's base ionisation at
 * the equivalence point (0,002). At exactly those two volumes the view shows
 * one pair, drawn with a dashed ring and named on screen as exaggerated. Every
 * other count is the amount, rounded.
 */

import { titrations } from '../data/titrations';
import type { MonoproticTitration } from '../types';
import { calculateWeakStrongPH } from './ph-calculations';

const found = titrations.find(
  (t): t is MonoproticTitration => t.id === 5 && t.type === 'weak-strong'
);
if (!found || found.Ka == null) throw new Error('Agnasýn needs titration 5, ediksýra + NaOH');
export const ACETIC: MonoproticTitration = found;

export const KA: number = found.Ka;
export const KW = 1e-14;
export const PKA = -Math.log10(KA);
/** mL of acid in the flask. */
export const V_ACID = found.analyte.volume;
export const C_ACID = found.analyte.molarity;
export const C_BASE = found.titrant.molarity;
/** mmól of acid at the start. */
export const N_ACID = V_ACID * C_ACID;
/** mL of NaOH at the equivalence point. */
export const V_EQ = N_ACID / C_BASE;
export const V_HALF = V_EQ / 2;
/** The end of the búretta's scale on screen. */
export const V_MAX = 40;

/** Particles per mmól: 20 for the acid. */
export const PARTICLES_PER_MMOL = 8;
export const ACID_PARTICLES = N_ACID * PARTICLES_PER_MMOL;
/** mL of NaOH that carries one Na⁺ and one OH⁻ particle. */
export const ML_PER_PARTICLE = 1 / (PARTICLES_PER_MMOL * C_BASE);

const TOL = 1e-9;

export function pHAt(v: number): number {
  return calculateWeakStrongPH(V_ACID, C_ACID, KA, v, C_BASE);
}

export interface Species {
  pH: number;
  /** Amounts in mmól. */
  mmol: { HA: number; A: number; H3O: number; OH: number; Na: number };
  /** Concentrations in mol/L. */
  conc: { HA: number; A: number; H3O: number; OH: number; Na: number };
  totalVolume: number;
}

export function speciesAt(v: number): Species {
  const pH = pHAt(v);
  const totalVolume = V_ACID + v;
  const h = Math.pow(10, -pH);
  const oh = KW / h;
  const cTotal = N_ACID / totalVolume;
  const a = (cTotal * KA) / (KA + h);
  const conc = { HA: cTotal - a, A: a, H3O: h, OH: oh, Na: (v * C_BASE) / totalVolume };
  const mmol = {
    HA: conc.HA * totalVolume,
    A: conc.A * totalVolume,
    H3O: conc.H3O * totalVolume,
    OH: conc.OH * totalVolume,
    Na: conc.Na * totalVolume,
  };
  return { pH, mmol, conc, totalVolume };
}

/**
 * The exaggerated pair at the two volumes where the minor species matter:
 * `ion` is CH₃COOH → CH₃COO⁻ + H₃O⁺ at the start, `hyd` is
 * CH₃COO⁻ + H₂O → CH₃COOH + OH⁻ at the equivalence point.
 */
export type FlagPair = 'ion' | 'hyd' | null;

/** What the view draws at a volume: the real counts, and the exaggerated pair if any. */
export interface ParticleCounts {
  HA: number;
  A: number;
  H3O: number;
  OH: number;
  Na: number;
  flag: FlagPair;
}

export function isStart(v: number): boolean {
  return Math.abs(v) < TOL;
}

export function isEquivalence(v: number): boolean {
  return Math.abs(v - V_EQ) < TOL;
}

/**
 * The real counts by the reaction's stoichiometry, which is what the amounts
 * round to everywhere but the two flagged volumes: every OH⁻ added turns one
 * CH₃COOH into CH₃COO⁻ until none is left, and after that it stays.
 */
export function particleCountsAt(v: number): ParticleCounts {
  const na = Math.round(v * C_BASE * PARTICLES_PER_MMOL);
  const reacted = Math.min(na, ACID_PARTICLES);
  return {
    HA: ACID_PARTICLES - reacted,
    A: reacted,
    H3O: 0,
    OH: na - reacted,
    Na: na,
    flag: isStart(v) ? 'ion' : isEquivalence(v) ? 'hyd' : null,
  };
}

/**
 * What the drawn counts are once the flagged pair is drawn: at the start one
 * CH₃COOH is shown as CH₃COO⁻ beside one H₃O⁺, at the equivalence point one
 * CH₃COO⁻ as CH₃COOH beside one OH⁻.
 */
export function drawnCounts(c: ParticleCounts): Omit<ParticleCounts, 'flag'> {
  if (c.flag === 'ion') return { ...c, HA: c.HA - 1, A: c.A + 1, H3O: c.H3O + 1 };
  if (c.flag === 'hyd') return { ...c, A: c.A - 1, HA: c.HA + 1, OH: c.OH + 1 };
  return { HA: c.HA, A: c.A, H3O: c.H3O, OH: c.OH, Na: c.Na };
}

/** How many particles the flagged species would really be, for the note beside it. */
export function trueMinorParticles(v: number): number {
  const s = speciesAt(v);
  return (isEquivalence(v) ? s.mmol.OH : s.mmol.H3O) * PARTICLES_PER_MMOL;
}

/** Percent of the acid ionised at the start, [H₃O⁺]/C. */
export function percentIonised(): number {
  return (speciesAt(0).conc.H3O / C_ACID) * 100;
}

/** Kb of acetate, Kw/Ka. */
export const KB = KW / KA;
