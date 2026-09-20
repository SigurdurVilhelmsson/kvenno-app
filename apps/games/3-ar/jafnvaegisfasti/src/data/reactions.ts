/**
 * The reactions this game works with, and where each constant comes from.
 *
 * **Every constant carries a citation, and a test refuses one that does not.**
 *
 * This needs saying, because the rule it follows is not quite the platform's
 * existing one. Siggi's ruling of 2026-09-19 — a constant with no Appendix D
 * row does not ship — settled Ka, Kb and Ksp, and it is what let
 * `3-ar/syrufastinn` and `3-ar/leysnijafnvaegi` be built. **There is no
 * Appendix D table for Kc.** Neither book has one, and there is a reason:
 * Ka and Ksp are quoted at a single standard temperature, while Kc changes
 * with temperature, so a general equilibrium constant is only meaningful
 * beside the temperature it was measured at. Both books therefore state Kc
 * values inside worked examples rather than in an appendix.
 *
 * So the rule here is the spirit of that ruling rather than its letter: every
 * number is transcribed from a named place in the school's own textbook, the
 * place is recorded beside it, and `sources.test.ts` fails on a constant
 * without one. If Siggi would rather have a Kc table of his own, this is the
 * file it would replace.
 *
 * The module ids are the school's Icelandic second edition:
 *   ch13/m68798 — Jafnvægisfastar (equilibrium constants, Q, Kc, Kp)
 *   ch13/m68801 — Jafnvægisútreikningar (the calculations, ICE tables)
 */

import type { Reaction } from '@shared/engine/equilibrium';

const M68798 = 'ch13/m68798';
const M68801 = 'ch13/m68801';

export const REACTIONS: Reaction[] = [
  // ---------------------------------------------------------------- homogeneous, gas
  {
    id: 'no2-n2o4',
    name: 'Köfnunarefnisdíoxíð og díniturtetroxíð',
    reactants: [{ formula: 'NO₂', coefficient: 2, phase: 'g' }],
    products: [{ formula: 'N₂O₄', coefficient: 1, phase: 'g' }],
    constant: {
      value: 1.6e2,
      temperatureC: 25,
      basis: 'Kc',
      source: { module: M68798, where: 'sýnidæmi — mat á hvarfstuðli' },
    },
    source: { module: M68798, where: 'sýnidæmi — mat á hvarfstuðli' },
  },
  {
    id: 'so2-so3',
    name: 'Oxun brennisteinsdíoxíðs',
    reactants: [
      { formula: 'SO₂', coefficient: 2, phase: 'g' },
      { formula: 'O₂', coefficient: 1, phase: 'g' },
    ],
    products: [{ formula: 'SO₃', coefficient: 2, phase: 'g' }],
    constant: {
      // The book quotes this system twice. m68798's check-your-learning gives
      // 4,3 and states no temperature; m68801 gives 4,32 at 600 °C. The one
      // with a temperature is the one taken, because a Kc without one cannot
      // be converted to Kp and cannot honestly be compared with anything.
      value: 4.32,
      temperatureC: 600,
      basis: 'Kc',
      source: { module: M68801, where: 'athugaðu vinnuna þína — 2SO₂ + O₂ við 600 °C' },
    },
    source: { module: M68798, where: 'kannaðu þekkingu þína — mat á hvarfstuðli' },
  },
  {
    id: 'vatnsgas',
    name: 'Vatnsgashvarfið',
    reactants: [
      { formula: 'CO', coefficient: 1, phase: 'g' },
      { formula: 'H₂O', coefficient: 1, phase: 'g' },
    ],
    products: [
      { formula: 'CO₂', coefficient: 1, phase: 'g' },
      { formula: 'H₂', coefficient: 1, phase: 'g' },
    ],
    constant: {
      value: 0.64,
      temperatureC: 800,
      basis: 'Kc',
      source: { module: M68798, where: 'sýnidæmi — spáð fyrir um stefnu efnahvarfs' },
    },
    source: { module: M68798, where: 'sýnidæmi — spáð fyrir um stefnu efnahvarfs' },
  },
  {
    id: 'ammoniak',
    name: 'Haber-ferlið',
    reactants: [
      { formula: 'N₂', coefficient: 1, phase: 'g' },
      { formula: 'H₂', coefficient: 3, phase: 'g' },
    ],
    products: [{ formula: 'NH₃', coefficient: 2, phase: 'g' }],
    constant: {
      value: 0.5,
      temperatureC: 400,
      basis: 'Kc',
      source: { module: M68798, where: 'sýnidæmi — jafnvægisfastar tengdra efnahvarfa' },
    },
    source: { module: M68798, where: 'sýnidæmi — ritun hvarfstuðuls' },
  },
  {
    id: 'vetnisjodid',
    name: 'Myndun vetnisjoðíðs',
    reactants: [
      { formula: 'H₂', coefficient: 1, phase: 'g' },
      { formula: 'I₂', coefficient: 1, phase: 'g' },
    ],
    products: [{ formula: 'HI', coefficient: 2, phase: 'g' }],
    constant: {
      value: 50,
      temperatureC: 400,
      basis: 'Kc',
      source: { module: M68798, where: 'sýnidæmi — jafnvægisfastar tengdra efnahvarfa' },
    },
    source: { module: M68798, where: 'sýnidæmi — jafnvægisfastar tengdra efnahvarfa' },
  },
  // The two cobalt equilibria of the coupled-reactions exercise. They are here
  // rather than inline in `coupled.ts` so that `sources.test.ts` holds them to
  // the same citation rule as every other constant — and because they are the
  // one pair on the platform whose solids cancel when the equations are added,
  // which is the whole point of the exercise.
  {
    id: 'kobolt-koloxid',
    excludeFromKpExercise: true,
    name: 'Afoxun kóbaltoxíðs með kolsýringi',
    reactants: [
      { formula: 'CoO', coefficient: 1, phase: 's' },
      { formula: 'CO', coefficient: 1, phase: 'g' },
    ],
    products: [
      { formula: 'Co', coefficient: 1, phase: 's' },
      { formula: 'CO₂', coefficient: 1, phase: 'g' },
    ],
    constant: {
      value: 490,
      temperatureC: 550,
      basis: 'Kc',
      source: {
        module: M68798,
        where: 'kannaðu þekkingu þína — jafnvægisfastar tengdra efnahvarfa',
      },
    },
    source: { module: M68798, where: 'kannaðu þekkingu þína — jafnvægisfastar tengdra efnahvarfa' },
  },
  {
    id: 'kobolt-vetni',
    excludeFromKpExercise: true,
    name: 'Afoxun kóbaltoxíðs með vetni',
    reactants: [
      { formula: 'CoO', coefficient: 1, phase: 's' },
      { formula: 'H₂', coefficient: 1, phase: 'g' },
    ],
    products: [
      { formula: 'Co', coefficient: 1, phase: 's' },
      { formula: 'H₂O', coefficient: 1, phase: 'g' },
    ],
    constant: {
      value: 67,
      temperatureC: 550,
      basis: 'Kc',
      source: {
        module: M68798,
        where: 'kannaðu þekkingu þína — jafnvægisfastar tengdra efnahvarfa',
      },
    },
    source: { module: M68798, where: 'kannaðu þekkingu þína — jafnvægisfastar tengdra efnahvarfa' },
  },
  {
    id: 'kolefnistvisulfid',
    name: 'Vetnun kolefnistvísúlfíðs',
    reactants: [
      { formula: 'CS₂', coefficient: 1, phase: 'g' },
      { formula: 'H₂', coefficient: 4, phase: 'g' },
    ],
    products: [
      { formula: 'CH₄', coefficient: 1, phase: 'g' },
      { formula: 'H₂S', coefficient: 2, phase: 'g' },
    ],
    constant: {
      value: 0.28,
      temperatureC: 900,
      basis: 'Kc',
      source: { module: M68798, where: 'sýnidæmi — útreikningur á Kp, liður d' },
    },
    source: { module: M68798, where: 'sýnidæmi — útreikningur á Kp, liður d' },
  },
  {
    id: 'metanol',
    name: 'Niðurbrot metanóls',
    reactants: [{ formula: 'CH₃OH', coefficient: 1, phase: 'g' }],
    products: [
      { formula: 'CO', coefficient: 1, phase: 'g' },
      { formula: 'H₂', coefficient: 2, phase: 'g' },
    ],
    constant: {
      value: 0.0952,
      temperatureC: 227,
      basis: 'Kc',
      source: { module: M68798, where: 'kannaðu þekkingu þína — útreikningur á Kp, liður d' },
    },
    source: { module: M68798, where: 'kannaðu þekkingu þína — útreikningur á Kp, liður d' },
  },
  {
    id: 'nituroxid',
    name: 'Myndun nituroxíðs í heitu lofti',
    reactants: [
      { formula: 'N₂', coefficient: 1, phase: 'g' },
      { formula: 'O₂', coefficient: 1, phase: 'g' },
    ],
    products: [{ formula: 'NO', coefficient: 2, phase: 'g' }],
    constant: {
      value: 4.1e-4,
      temperatureC: 2000,
      basis: 'Kc',
      source: { module: M68801, where: 'sýnidæmi — útreikningur á jafnvægisstyrk sem vantar' },
    },
    source: { module: M68801, where: 'sýnidæmi — útreikningur á jafnvægisstyrk sem vantar' },
  },
  {
    id: 'pcl5',
    name: 'Niðurbrot fosfórpentaklóríðs',
    reactants: [{ formula: 'PCl₅', coefficient: 1, phase: 'g' }],
    products: [
      { formula: 'PCl₃', coefficient: 1, phase: 'g' },
      { formula: 'Cl₂', coefficient: 1, phase: 'g' },
    ],
    constant: {
      value: 0.0211,
      // The book says only "under certain conditions" and names no
      // temperature, so none is recorded. That is not a gap to fill in: a Kc
      // is meaningless without one, and inventing 25 °C here would put a
      // number on the screen that no source supports. The consequence is
      // real and deliberate — this reaction cannot be used for Kc to Kp.
      basis: 'Kc',
      source: { module: M68801, where: 'sýnidæmi — útreikningur á jafnvægisstyrkjum' },
    },
    source: { module: M68801, where: 'sýnidæmi — útreikningur á jafnvægisstyrkjum' },
  },
  {
    id: 'ozon',
    name: 'Myndun ósons',
    reactants: [{ formula: 'O₂', coefficient: 3, phase: 'g' }],
    products: [{ formula: 'O₃', coefficient: 2, phase: 'g' }],
    // No constant: the book uses this one only to practise writing the
    // expression, and quoting a value it does not give would be exactly the
    // unsourced number this file exists to refuse.
    source: { module: M68798, where: 'sýnidæmi — ritun hvarfstuðuls, liður a' },
  },
  {
    id: 'ammoniakbruni',
    name: 'Bruni ammóníaks',
    reactants: [
      { formula: 'NH₃', coefficient: 4, phase: 'g' },
      { formula: 'O₂', coefficient: 7, phase: 'g' },
    ],
    products: [
      { formula: 'NO₂', coefficient: 4, phase: 'g' },
      { formula: 'H₂O', coefficient: 6, phase: 'g' },
    ],
    source: { module: M68798, where: 'sýnidæmi — ritun hvarfstuðuls, liður c' },
  },
  {
    id: 'etan',
    name: 'Afvetnun etans',
    reactants: [{ formula: 'C₂H₆', coefficient: 1, phase: 'g' }],
    products: [
      { formula: 'C₂H₄', coefficient: 1, phase: 'g' },
      { formula: 'H₂', coefficient: 1, phase: 'g' },
    ],
    source: { module: M68798, where: 'sýnidæmi — útreikningur á Kp, liður a' },
  },

  // ---------------------------------------------------------------- quoted as Kp
  //
  // These four carry a Kp rather than a Kc, because that is how the book
  // quotes them. Nothing converts them: a Kp stated in the source is used as
  // a Kp, and `kcToKp` exists for the reactions quoted the other way round.
  {
    id: 'brennisteinsvetni',
    name: 'Niðurbrot brennisteinsvetnis',
    reactants: [{ formula: 'H₂S', coefficient: 2, phase: 'g' }],
    products: [
      { formula: 'H₂', coefficient: 2, phase: 'g' },
      { formula: 'S₂', coefficient: 1, phase: 'g' },
    ],
    constant: {
      value: 2.2e-6,
      basis: 'Kp',
      source: { module: M68801, where: 'æfing — jafnvægisþrýstingur með nálgun' },
    },
    source: { module: M68801, where: 'æfing — jafnvægisþrýstingur með nálgun' },
  },
  {
    id: 'bromklorid',
    name: 'Myndun brómklóríðs',
    reactants: [
      { formula: 'Cl₂', coefficient: 1, phase: 'g' },
      { formula: 'Br₂', coefficient: 1, phase: 'g' },
    ],
    products: [{ formula: 'BrCl', coefficient: 2, phase: 'g' }],
    constant: {
      value: 4.7e-2,
      temperatureC: 25,
      basis: 'Kp',
      source: { module: M68801, where: 'æfing — þrýstingur BrCl í jafnvægisblöndu' },
    },
    source: { module: M68801, where: 'æfing — þrýstingur BrCl í jafnvægisblöndu' },
  },
  {
    id: 'nituroxidklorid',
    name: 'Myndun nítrósýlklóríðs',
    reactants: [
      { formula: 'NO', coefficient: 2, phase: 'g' },
      { formula: 'Cl₂', coefficient: 1, phase: 'g' },
    ],
    products: [{ formula: 'NOCl', coefficient: 2, phase: 'g' }],
    constant: {
      value: 1.9e3,
      basis: 'Kp',
      source: { module: M68801, where: 'æfing — Kp út frá mældum jafnvægisþrýstingum' },
    },
    source: { module: M68801, where: 'æfing — Kp út frá mældum jafnvægisþrýstingum' },
  },
  {
    id: 'ammoniumklorid',
    name: 'Niðurbrot ammóníumklóríðs',
    reactants: [{ formula: 'NH₄Cl', coefficient: 1, phase: 's' }],
    products: [
      { formula: 'NH₃', coefficient: 1, phase: 'g' },
      { formula: 'HCl', coefficient: 1, phase: 'g' },
    ],
    constant: {
      value: 3.06,
      basis: 'Kp',
      source: { module: M68801, where: 'æfing — Kp úr þrýstingi ammóníaks' },
    },
    source: { module: M68801, where: 'æfing — Kp úr þrýstingi ammóníaks' },
  },

  // ---------------------------------------------------------------- homogeneous, aqueous
  {
    id: 'trijodid',
    name: 'Myndun þríjoðíðjónar',
    reactants: [
      { formula: 'I₂', coefficient: 1, phase: 'aq' },
      { formula: 'I⁻', coefficient: 1, phase: 'aq' },
    ],
    products: [{ formula: 'I₃⁻', coefficient: 1, phase: 'aq' }],
    // The book derives this one from measured concentrations rather than
    // quoting it, which is why the Æfa phase asks the student to do the same.
    source: { module: M68801, where: 'sýnidæmi — útreikningur á jafnvægisfasta' },
  },
  {
    id: 'blasyra',
    name: 'Klofnun vetnissýaníðs',
    reactants: [{ formula: 'HCN', coefficient: 1, phase: 'aq' }],
    products: [
      { formula: 'H⁺', coefficient: 1, phase: 'aq' },
      { formula: 'CN⁻', coefficient: 1, phase: 'aq' },
    ],
    constant: {
      value: 4.9e-10,
      // No temperature in the book here either. This is HCN's sýrufasti, and
      // 3-ar/syrufastinn ships the same 4,9 × 10⁻¹⁰ from Brown Table D.1 —
      // a test holds the two nodes to the same number.
      basis: 'Kc',
      source: { module: M68801, where: 'sýnidæmi — nálgun sem einfaldar algebruna' },
    },
    source: { module: M68801, where: 'sýnidæmi — nálgun sem einfaldar algebruna' },
  },

  // ---------------------------------------------------------------- heterogeneous
  {
    id: 'kalksteinn',
    name: 'Kalk og koldíoxíð',
    reactants: [
      { formula: 'CaO', coefficient: 1, phase: 's' },
      { formula: 'CO₂', coefficient: 1, phase: 'g' },
    ],
    products: [{ formula: 'CaCO₃', coefficient: 1, phase: 's' }],
    source: { module: M68798, where: 'misleit jafnvægi' },
  },
  {
    id: 'kolefnistvisulfid-fast',
    name: 'Kolefni og brennisteinsgufa',
    reactants: [
      { formula: 'C', coefficient: 1, phase: 's' },
      { formula: 'S', coefficient: 2, phase: 'g' },
    ],
    products: [{ formula: 'CS₂', coefficient: 1, phase: 'g' }],
    source: { module: M68798, where: 'misleit jafnvægi' },
  },
  {
    id: 'brom',
    name: 'Uppgufun bróms',
    reactants: [{ formula: 'Br₂', coefficient: 1, phase: 'l' }],
    products: [{ formula: 'Br₂', coefficient: 1, phase: 'g' }],
    source: { module: M68798, where: 'misleit jafnvægi' },
  },
  {
    id: 'blyklorid',
    name: 'Upplausn blýklóríðs',
    reactants: [{ formula: 'PbCl₂', coefficient: 1, phase: 's' }],
    products: [
      { formula: 'Pb²⁺', coefficient: 1, phase: 'aq' },
      { formula: 'Cl⁻', coefficient: 2, phase: 'aq' },
    ],
    // The book's first heterogeneous example, and deliberately the same salt
    // 3-ar/leysnijafnvaegi works with: the K it derives here IS that game's
    // leysnimargfeldi. A test holds the two together.
    source: { module: M68798, where: 'misleit jafnvægi' },
  },
];

export function reactionBy(id: string): Reaction {
  const found = REACTIONS.find((r) => r.id === id);
  if (!found) throw new RangeError(`No reaction ${id}`);
  return found;
}

/** Reactions that carry a constant, i.e. the ones a calculation can use. */
export const WITH_CONSTANT = REACTIONS.filter((r) => r.constant !== undefined);
