/**
 * The equilibrium constants this game puts behind Le Chatelier.
 *
 * **Every value here is a constant the platform already sources.** Nothing is
 * new, nothing is coined, and nothing is transcribed a second time: the acids
 * and bases come from `@shared/data/appendix-d` (Brown Tables D.1–D.3, which
 * Siggi ruled authoritative on 2026-09-19) and the gas-phase Kc values from the
 * citations `3-ar/jafnvaegisfasti` carries to the school's chapter 13. Where a
 * reaction is the *reverse* of one of those, K is derived as `1/K`, not looked
 * up somewhere else.
 *
 * **Reactions with no sourced constant carry none, and that is deliberate.**
 * **Ten** of the thirty are in that position — the iron thiocyanate and copper
 * ammine complexes, the hemoglobin system, the two where K has nothing on one
 * side to solve for, and five gas reactions the book puts no number on. They still teach Le Chatelier perfectly well; they just
 * do not show a number. Inventing one would put an unsourced figure on screen
 * exactly where a student is being taught to trust the figure.
 *
 * That split is what `sourced-constants.test.ts` holds: it checks the count, so
 * a future edit that quietly supplies a missing K fails rather than passes.
 */

import { APPENDIX_D1_ACIDS, APPENDIX_D2_BASES, APPENDIX_D3_KSP } from '@shared/data/appendix-d';

/** What kind of constant it is. They are all equilibrium constants; the label says which. */
export type ConstantKind = 'Kc' | 'Ka' | 'Kb' | 'Ksp' | 'Kw';

export interface EquilibriumConstant {
  value: number;
  kind: ConstantKind;
  /** Absent where the source states none. Without it, K cannot be moved in temperature. */
  temperatureC?: number;
  /** Where the number comes from, shown to the student. */
  source: string;
  /** Set where this reaction is written as the reverse of the sourced one. */
  reversedFrom?: string;
}

const D1 = 'Brown, tafla D.1';
const D2 = 'Brown, tafla D.2';
const D3 = 'Brown, tafla D.3';
const CH13 = 'Efnafræði 2e, kafli 13';

/**
 * Ion product of water at 25 °C.
 *
 * `appendix-d.ts` carries `PKW = 14`, which is the same statement; this is it
 * as a K so the panel can compare it with a Q like any other.
 */
const KW = 1.0e-14;

/**
 * Keyed by the equilibrium's `id` in `equilibria.ts`.
 *
 * The four Haber entries and the two contact-process entries share a constant
 * because they are the same reaction asked about from different angles — see
 * the note on duplicates in that file.
 */
export const CONSTANTS: Record<number, EquilibriumConstant> = {
  // N₂O₄ ⇌ 2NO₂ — the reverse of jafnvaegisfasti's 2NO₂ ⇌ N₂O₄.
  1: {
    value: 1 / 1.6e2,
    kind: 'Kc',
    temperatureC: 25,
    source: `${CH13} — sýnidæmi um hvarfstuðul`,
    reversedFrom: '2NO₂ ⇌ N₂O₄, Kc = 1,6 × 10²',
  },
  2: { value: 50, kind: 'Kc', temperatureC: 400, source: `${CH13} — tengd efnahvörf` },
  3: {
    value: 0.0211,
    kind: 'Kc',
    source: `${CH13} — útreikningur á jafnvægisstyrkjum`,
  },
  // CO + 2H₂ ⇌ CH₃OH — the reverse of the methanol decomposition.
  4: {
    value: 1 / 0.0952,
    kind: 'Kc',
    temperatureC: 227,
    source: `${CH13} — útreikningur á Kp`,
    reversedFrom: 'CH₃OH ⇌ CO + 2H₂, Kc = 0,0952',
  },
  7: { value: KW, kind: 'Kw', temperatureC: 25, source: 'Klofningsfasti vatns' },
  8: { value: APPENDIX_D1_ACIDS.acetic.ka[0], kind: 'Ka', temperatureC: 25, source: D1 },
  9: { value: APPENDIX_D2_BASES.ammonia.kb, kind: 'Kb', temperatureC: 25, source: D2 },
  10: { value: APPENDIX_D3_KSP.AgCl.ksp, kind: 'Ksp', temperatureC: 25, source: D3 },
  11: { value: 0.5, kind: 'Kc', temperatureC: 400, source: `${CH13} — tengd efnahvörf` },
  12: { value: 4.32, kind: 'Kc', temperatureC: 600, source: `${CH13} — athugaðu vinnuna þína` },
  14: { value: 0.64, kind: 'Kc', temperatureC: 800, source: `${CH13} — stefna efnahvarfs` },
  // H₂ + CO₂ ⇌ H₂O + CO is the water-gas shift written backwards.
  18: {
    value: 1 / 0.64,
    kind: 'Kc',
    temperatureC: 800,
    source: `${CH13} — stefna efnahvarfs`,
    reversedFrom: 'CO + H₂O ⇌ CO₂ + H₂, Kc = 0,64',
  },
  19: {
    value: 4.1e-4,
    kind: 'Kc',
    temperatureC: 2000,
    source: `${CH13} — jafnvægisstyrkur sem vantar`,
  },
  21: { value: APPENDIX_D1_ACIDS.carbonic.ka[0], kind: 'Ka', temperatureC: 25, source: D1 },
  24: { value: APPENDIX_D1_ACIDS.acetic.ka[0], kind: 'Ka', temperatureC: 25, source: D1 },
  25: { value: 0.5, kind: 'Kc', temperatureC: 400, source: `${CH13} — tengd efnahvörf` },
  26: { value: 0.5, kind: 'Kc', temperatureC: 400, source: `${CH13} — tengd efnahvörf` },
  27: { value: APPENDIX_D1_ACIDS.phosphoric.ka[0], kind: 'Ka', temperatureC: 25, source: D1 },
  28: { value: 0.5, kind: 'Kc', temperatureC: 400, source: `${CH13} — tengd efnahvörf` },
  30: { value: 4.32, kind: 'Kc', temperatureC: 600, source: `${CH13} — athugaðu vinnuna þína` },
};

/**
 * The ones with no sourced constant, listed so the absence is deliberate
 * rather than an oversight nobody noticed.
 */
export const WITHOUT_CONSTANT: Record<number, string> = {
  5: 'CaCO₃ ⇌ CaO + CO₂ — K er einfaldlega [CO₂], svo ekkert jafnvægisdæmi er að leysa',
  6: 'Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺ — myndunarfasti flókajónar, ekki í töflum D.1–D.3',
  13: '4NH₃ + 5O₂ ⇌ 4NO + 6H₂O — kennslubókin gefur ekkert K fyrir þetta hvarf',
  15: '2NO + O₂ ⇌ 2NO₂ — ekkert K í heimildunum sem pallurinn notar',
  16: 'C + CO₂ ⇌ 2CO — ekkert K í heimildunum sem pallurinn notar',
  17: 'CH₄ + H₂O ⇌ CO + 3H₂ — ekkert K í heimildunum sem pallurinn notar',
  20: '2H₂S + 3O₂ ⇌ 2H₂O + 2SO₂ — ekkert K í heimildunum sem pallurinn notar',
  22: 'Cu(NH₃)₄²⁺ ⇌ Cu²⁺ + 4NH₃ — myndunarfasti flókajónar, ekki í töflum D.1–D.3',
  23: '2C + O₂ ⇌ 2CO — ekkert K í heimildunum sem pallurinn notar',
  29: 'Hb + 4O₂ ⇌ Hb(O₂)₄ — lífefnafræðilegt jafnvægi, ekkert K í heimildunum',
};

export function constantFor(id: number): EquilibriumConstant | undefined {
  return CONSTANTS[id];
}

/**
 * A stated starting mixture for each system that can be settled.
 *
 * **These are the problem, not the answer.** Choosing to start from 1,00 M of
 * each reactant is a teacher's choice, the way `3-ar/jafnvaegisfasti`'s ICE
 * problems state their initial concentrations; everything that follows from it
 * — the equilibrium mixture, Q after a stress, where it settles again — is
 * computed by the shared engine and written down nowhere.
 *
 * Two systems with a constant have no entry, and cannot: `H₂O(l) ⇌ H⁺ + OH⁻`
 * and `AgCl(s) ⇌ Ag⁺ + Cl⁻` have nothing in K on the reactant side, so there is
 * no extent to solve for. They still show K and Q; they just cannot show a
 * mixture settling.
 */
export const STARTING_MIXTURES: Record<number, Record<string, number>> = {
  1: { 'N₂O₄': 1.0, 'NO₂': 0 },
  2: { 'H₂': 1.0, 'I₂': 1.0, HI: 0 },
  3: { 'PCl₅': 1.0, 'PCl₃': 0, 'Cl₂': 0 },
  4: { CO: 1.0, 'H₂': 2.0, 'CH₃OH': 0 },
  8: { 'CH₃COOH': 0.1, 'CH₃COO⁻': 0, 'H⁺': 0 },
  // Water is written in because the equation names it; its amount is the molarity
  // of pure water and cannot move the answer, which a test checks.
  9: { 'NH₃': 0.1, 'H₂O': 55.5, 'NH₄⁺': 0, 'OH⁻': 0 },
  11: { 'N₂': 1.0, 'H₂': 3.0, 'NH₃': 0 },
  12: { 'SO₂': 1.0, 'O₂': 1.0, 'SO₃': 0 },
  14: { CO: 1.0, 'H₂O': 1.0, 'CO₂': 0, 'H₂': 0 },
  18: { 'H₂': 1.0, 'CO₂': 1.0, 'H₂O': 0, CO: 0 },
  // The composition of dry air, so the answer says something about the real world.
  19: { 'N₂': 0.781, 'O₂': 0.209, NO: 0 },
  21: { 'H₂CO₃': 0.1, 'H⁺': 0, 'HCO₃⁻': 0 },
  24: { 'CH₃COOH': 0.1, 'H₂O': 55.5, 'CH₃COO⁻': 0, 'H₃O⁺': 0 },
  25: { 'N₂': 1.0, 'H₂': 3.0, 'NH₃': 0 },
  26: { 'N₂': 1.0, 'H₂': 3.0, 'NH₃': 0 },
  27: { 'H₃PO₄': 0.1, 'H⁺': 0, 'H₂PO₄⁻': 0 },
  28: { 'N₂': 1.0, 'H₂': 3.0, 'NH₃': 0 },
  30: { 'SO₂': 1.0, 'O₂': 1.0, 'SO₃': 0 },
};
