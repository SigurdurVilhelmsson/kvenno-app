/**
 * Nærmynd for Stig 0: three solutes in water, the chemistry behind the scenes.
 *
 * Built on the particle-view template (docs/particle-view-template.md). The solutes, their
 * dissociation equations and their electrolyte classes are Stig 0's own
 * (`data/electrolytes.ts`, `classify()`), and acetic acid's Ka is the book's
 * (`@shared/data/appendix-d`). Nothing is random; the view draws what these functions say.
 *
 * Each beaker holds 20,0 mL of a 0,100 M solution, so 2,00 mmól of solute, drawn at ten
 * particles per mmól: twenty formula units or molecules. Sodium chloride comes apart
 * completely, glucose not at all, and acetic acid by the fraction its Ka allows, which at this
 * concentration is about a quarter of one particle. That one pair is drawn, exaggerated and
 * marked, as the template's rule 3 allows.
 */
import { APPENDIX_D1_ACIDS } from '@shared/data/appendix-d';

import {
  CLASSES,
  SOLUTES,
  classify,
  type ElectrolyteClass,
  type Solute,
} from '../data/electrolytes';

export const VOLUME_ML = 20.0;
export const CONCENTRATION_M = 0.1;
/** mmól of solute in each beaker. */
export const AMOUNT_MMOL = VOLUME_ML * CONCENTRATION_M;
/** Particles drawn per mmól: twenty formula units or molecules per beaker. */
export const PER_MMOL = 10;
export const UNITS = Math.round(AMOUNT_MMOL * PER_MMOL);

export type NaermyndSolute = 'nacl' | 'ch3cooh' | 'c6h12o6';

function solute(id: NaermyndSolute): Solute {
  const s = SOLUTES.find((x) => x.id === id);
  if (!s) throw new RangeError(`Nærmynd needs ${id} in data/electrolytes.ts`);
  return s;
}

export const KA_ACETIC = APPENDIX_D1_ACIDS.acetic.ka[0];

/**
 * [H⁺] in M for acetic acid at concentration `c`, the exact root of Ka = x²/(c − x). The
 * quadratic rather than √(Ka·c), so the fraction shown is the true one; the two differ by
 * under 1 % here.
 */
export function aceticIonised(c: number = CONCENTRATION_M): number {
  return (-KA_ACETIC + Math.sqrt(KA_ACETIC * KA_ACETIC + 4 * KA_ACETIC * c)) / 2;
}

/** The fraction of acetic acid molecules that have come apart, about 1,3 %. */
export const ACETIC_FRACTION = aceticIonised() / CONCENTRATION_M;

export interface BeakerState {
  solute: Solute;
  electrolyte: ElectrolyteClass;
  bulb: 'bright' | 'dim' | 'off';
  /** Whole molecules drawn. */
  molecules: number;
  /** Cations and anions drawn: always equal here, one of each per unit that came apart. */
  ionPairs: number;
  /** Ion pairs the true amount gives, before any rounding or exaggeration. */
  trueIonPairs: number;
  /** One pair is drawn where the true amount rounds to none. */
  exaggerated: boolean;
}

/** What one beaker draws. */
export function beakerState(id: NaermyndSolute): BeakerState {
  const s = solute(id);
  const electrolyte = classify(s.kind);
  const fraction = electrolyte === 'sterkur' ? 1 : id === 'ch3cooh' ? ACETIC_FRACTION : 0;
  const trueIonPairs = UNITS * fraction;
  const rounded = Math.round(trueIonPairs);
  // Rule 3 of the template: exaggerate only where the scene is about something too small to
  // see. A weak acid's few ions are exactly that; without them it looks like glucose.
  const exaggerated = electrolyte === 'veikur' && rounded === 0;
  const ionPairs = exaggerated ? 1 : rounded;
  return {
    solute: s,
    electrolyte,
    bulb: CLASSES[electrolyte].bulb,
    molecules: UNITS - ionPairs,
    ionPairs,
    trueIonPairs,
    exaggerated,
  };
}
