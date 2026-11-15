import type { ParticleCounts } from '@shared/components/ParticleBeaker';

import { solveBuffer } from './buffer';
import { BUFFER_PROBLEMS } from '../data/problems';

/**
 * The chemistry behind this game's Nærmynd: 50 mL of a buffer beside 50 mL of
 * pure water, with 1,0 M saltsýra or natríumhýdroxíð dripped into both.
 *
 * The buffer is problem 1, the first one Stig 2 sets: an ediksýra buffer at
 * pH 4,74, 0,10 M in all. `solveBuffer` gives its acid and base amounts, so the
 * scene and Stig 2 describe one solution.
 *
 * The pH is exact, from the charge balance of the whole solution, not from
 * Henderson-Hasselbalch: that formula holds only while both the acid and its
 * base are present, and the scene is about what happens when one runs out.
 *
 * The particles are amounts on a fixed scale, 4 per mmól, so each glass starts
 * with 10 CH₃COOH and 10 CH₃COO⁻ (and their 10 Na⁺), and each particle of
 * reagent is 0,25 mL. Every amount is a whole number of particles, so nothing
 * is rounded and nothing is exaggerated; the H⁺ and OH⁻ that water and the
 * buffer hold on their own are far below one particle and are not drawn,
 * which the screen says.
 */

export const SCENE_PROBLEM = BUFFER_PROBLEMS.find((p) => p.id === 1)!;

/** mL of buffer, and of water, in each glass. */
export const V_SAMPLE = 50;
/** M, the saltsýra and the natríumhýdroxíð alike. */
export const C_REAGENT = 1.0;
export const PARTICLES_PER_MMOL = 4;
export const ML_PER_PARTICLE = 1 / (PARTICLES_PER_MMOL * C_REAGENT);
/** The most reagent the slider adds, mL: past the buffer's capacity. */
export const V_MAX = 3.5;

export const KA = Math.pow(10, -SCENE_PROBLEM.pKa);
export const PKA = SCENE_PROBLEM.pKa;
export const KW = 1e-14;

const recipe = solveBuffer(SCENE_PROBLEM);
/** mmól in the 50 mL sample. */
export const N_ACID = recipe.acidConc * V_SAMPLE;
export const N_BASE = recipe.baseConc * V_SAMPLE;
export const ACID_PARTICLES = Math.round(N_ACID * PARTICLES_PER_MMOL);
export const BASE_PARTICLES = Math.round(N_BASE * PARTICLES_PER_MMOL);
/** mL of reagent the buffer can take before its base (or acid) is gone. */
export const V_CAPACITY_ACID = N_BASE / C_REAGENT;
export const V_CAPACITY_BASE = N_ACID / C_REAGENT;

export type Reagent = 'HCl' | 'NaOH';
export type Glass = 'buffer' | 'water';

/** Particles of reagent in `v` mL. */
export function reagentParticles(v: number): number {
  return Math.round(v * C_REAGENT * PARTICLES_PER_MMOL);
}

/**
 * [H⁺] from the charge balance, [H⁺] + [Na⁺] = [CH₃COO⁻] + [OH⁻] + [Cl⁻], with
 * [CH₃COO⁻] = C·Kₐ/(Kₐ + [H⁺]). The left side less the right rises with [H⁺],
 * so there is one root, found by bisection on log [H⁺].
 */
export function pHAfter(glass: Glass, reagent: Reagent, v: number): number {
  const volume = V_SAMPLE + v;
  const added = C_REAGENT * v;
  const total = glass === 'buffer' ? (N_ACID + N_BASE) / volume : 0;
  const na = ((glass === 'buffer' ? N_BASE : 0) + (reagent === 'NaOH' ? added : 0)) / volume;
  const cl = (reagent === 'HCl' ? added : 0) / volume;
  const excess = (logH: number) => {
    const h = Math.pow(10, logH);
    return h + na - cl - (total * KA) / (KA + h) - KW / h;
  };
  let lo = -15;
  let hi = 1;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (excess(mid) > 0) hi = mid;
    else lo = mid;
  }
  return -(lo + hi) / 2;
}

/**
 * The particles in a glass after `v` mL of reagent, by stoichiometry: each H⁺
 * turns one CH₃COO⁻ into CH₃COOH until none is left and stays free after that;
 * each OH⁻ turns one CH₃COOH into CH₃COO⁻ the same way. In water nothing takes
 * them.
 */
export function countsAfter(glass: Glass, reagent: Reagent, v: number): ParticleCounts {
  const n = reagentParticles(v);
  const acid = glass === 'buffer' ? ACID_PARTICLES : 0;
  const base = glass === 'buffer' ? BASE_PARTICLES : 0;
  if (reagent === 'HCl') {
    const used = Math.min(n, base);
    return { HA: acid + used, A: base - used, H3O: n - used, OH: 0, Na: base, Cl: n, flag: null };
  }
  const used = Math.min(n, acid);
  return { HA: acid - used, A: base + used, H3O: 0, OH: n - used, Na: base + n, Cl: 0, flag: null };
}

/** How full each glass is, 0–1, on a scale that ends at the slider's last mark. */
export function fillAt(v: number): number {
  return (V_SAMPLE + v) / (V_SAMPLE + V_MAX);
}
