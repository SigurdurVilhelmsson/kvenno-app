/**
 * The particle view's numbers: how many particles of each species to draw in
 * each of the three frames of a stress (in equilibrium, the instant after the
 * stress, the new equilibrium), on one fixed scale per system.
 *
 * Every amount comes from `applyStress` (or `equilibrate` before a stress), so
 * the picture cannot disagree with the numbers panel. Particles are amounts in
 * the vessel, concentration times volume, so compressing it leaves the counts
 * alone and shrinks the box; the shift that follows is what changes them.
 *
 * A system is drawn only where its smallest species is still at least two
 * particles when its largest is `TARGET`: the gas-phase industrial systems,
 * the iron thiocyanate complex and phosphoric acid. N₂O₄ ⇌ 2NO₂ is not, since
 * its NO₂ would be a single particle. A weak acid's H⁺ is a
 * hundredth of the acid and would need exaggerating, which this view does not
 * do; those systems show the Q and K axis alone.
 */

import type { Amounts } from '@shared/engine/equilibrium';

import { VOLUME_FACTOR, type StressOutcome } from './stress';
import type { Equilibrium, Stress } from '../types';

/** Particles for the most plentiful species before any stress. */
export const TARGET = 20;
/**
 * The smallest species must be at least this share of the largest, so it is at
 * least two particles: at one, rounding alone can make a species vanish or
 * double, which would read as chemistry.
 */
export const MIN_RATIO = 1 / 10;

export interface MixtureSpecies {
  formula: string;
  side: 'reactant' | 'product';
}

export interface MixtureFrame {
  counts: Record<string, number>;
  /** The vessel's volume, L; 1 except after a pressure change. */
  volume: number;
}

export interface Mixture {
  species: MixtureSpecies[];
  /** Particles per mol. */
  scale: number;
  frames: MixtureFrame[];
}

/** The species K counts, in the order the equation writes them. */
export function shownSpecies(equilibrium: Equilibrium): MixtureSpecies[] {
  const inK = (phase: string) => phase === 'g' || phase === 'aq';
  return [
    ...equilibrium.reactants
      .filter((m) => inK(m.phase))
      .map((m) => ({ formula: m.formula, side: 'reactant' as const })),
    ...equilibrium.products
      .filter((m) => inK(m.phase))
      .map((m) => ({ formula: m.formula, side: 'product' as const })),
  ];
}

function volumeAfter(stress: Stress | null): number {
  if (stress?.type === 'increase-pressure') return 1 / VOLUME_FACTOR;
  if (stress?.type === 'decrease-pressure') return VOLUME_FACTOR;
  return 1;
}

/**
 * The frames to draw, or `null` where the system cannot be drawn to scale.
 * With no outcome, one frame: the mixture in equilibrium. With one, the
 * instant after the stress too, and the new equilibrium where it is known.
 */
export function mixtureFrames(
  equilibrium: Equilibrium,
  before: Amounts,
  outcome: StressOutcome | null,
  stress: Stress | null
): Mixture | null {
  const species = shownSpecies(equilibrium);
  if (species.length === 0) return null;
  // A pressure change on a system with dissolved species compresses only the gas, which one
  // box cannot show.
  if (
    stress &&
    (stress.type === 'increase-pressure' || stress.type === 'decrease-pressure') &&
    [...equilibrium.reactants, ...equilibrium.products].some((m) => m.phase === 'aq')
  ) {
    return null;
  }

  const amounts = species.map((s) => before[s.formula] ?? 0);
  const max = Math.max(...amounts);
  const min = Math.min(...amounts);
  if (!(max > 0) || min / max < MIN_RATIO) return null;
  const scale = TARGET / max;

  const frame = (a: Amounts, volume: number): MixtureFrame => ({
    counts: Object.fromEntries(
      species.map((s) => [s.formula, Math.round((a[s.formula] ?? 0) * volume * scale)])
    ),
    volume,
  });

  const frames = [frame(before, 1)];
  if (outcome) {
    const v = volumeAfter(stress);
    frames.push(frame(outcome.afterStress, v));
    // Where K's new value is unknown, the solver settles back on the old one; drawing that
    // as the new equilibrium would show a heater doing nothing, so the view stops at the stress.
    if (outcome.afterEquilibrium && !outcome.kUnknown) {
      frames.push(frame(outcome.afterEquilibrium, v));
    }
  }
  return { species, scale, frames };
}
