/**
 * "Frá lýsingu til jöfnu": reactions told in words, as the book's ch04/m68709
 * poses them ("Leitt út efnajöfnur úr frásagnarlýsingum á efnahvörfum"), with
 * the state of each substance in brackets after its formula, as the same
 * module introduces: (s) fast efni, (l) vökvi, (g) gas, (aq) leyst í vatni.
 * Year-1 plan item 17 (2026-11-15).
 *
 * Most are the book's own exercises at the end of m68709 and its worked
 * example of sodium in water; butane is replaced by methane, whose
 * coefficients fit the game's steppers (1 to 9), and the names follow the
 * platform's rulings (koldíoxíð, not the book's koltvíoxíð).
 */

export type State = 's' | 'l' | 'g' | 'aq';

export interface Species {
  formula: string;
  state: State;
  /** Atoms per formula unit, written out since some formulas carry brackets. */
  elements: Record<string, number>;
  /** In the lowest whole-number balanced equation. */
  coefficient: number;
}

export interface DescribedReaction {
  id: string;
  description: string;
  reactants: Species[];
  products: Species[];
  /**
   * A formula the description could be misread as, offered beside the right
   * ones: O for "súrefnisgas", which is O₂, and the like.
   */
  decoys: { side: 'reactants' | 'products'; formula: string; state: State }[];
}

export const STATE_NAMES: Record<State, string> = {
  s: 'fast efni',
  l: 'vökvi',
  g: 'gas',
  aq: 'leyst í vatni',
};

/** The likeliest wrong reading of each state, offered beside the right one. */
export const STATE_DECOY: Record<State, State> = { s: 'aq', aq: 's', l: 'g', g: 'l' };

export function label(formula: string, state: State): string {
  return `${formula}(${state})`;
}

export const DESCRIBED_REACTIONS: DescribedReaction[] = [
  {
    id: 'caco3',
    description:
      'Fast kalsíumkarbónat er hitað og brotnar niður í fast kalsíumoxíð og koldíoxíðgas.',
    reactants: [{ formula: 'CaCO₃', state: 's', elements: { Ca: 1, C: 1, O: 3 }, coefficient: 1 }],
    products: [
      { formula: 'CaO', state: 's', elements: { Ca: 1, O: 1 }, coefficient: 1 },
      { formula: 'CO₂', state: 'g', elements: { C: 1, O: 2 }, coefficient: 1 },
    ],
    decoys: [{ side: 'products', formula: 'CO', state: 'g' }],
  },
  {
    id: 'metan',
    description: 'Metangas, CH₄, brennur í súrefnisgasi og myndar koldíoxíðgas og vatnsgufu.',
    reactants: [
      { formula: 'CH₄', state: 'g', elements: { C: 1, H: 4 }, coefficient: 1 },
      { formula: 'O₂', state: 'g', elements: { O: 2 }, coefficient: 2 },
    ],
    products: [
      { formula: 'CO₂', state: 'g', elements: { C: 1, O: 2 }, coefficient: 1 },
      { formula: 'H₂O', state: 'g', elements: { H: 2, O: 1 }, coefficient: 2 },
    ],
    decoys: [{ side: 'reactants', formula: 'O', state: 'g' }],
  },
  {
    id: 'mgoh2',
    description:
      'Vatnslausnir af magnesíumklóríði og natríumhýdroxíði hvarfast og mynda fast magnesíumhýdroxíð og vatnslausn af natríumklóríði.',
    reactants: [
      { formula: 'MgCl₂', state: 'aq', elements: { Mg: 1, Cl: 2 }, coefficient: 1 },
      { formula: 'NaOH', state: 'aq', elements: { Na: 1, O: 1, H: 1 }, coefficient: 2 },
    ],
    products: [
      { formula: 'Mg(OH)₂', state: 's', elements: { Mg: 1, O: 2, H: 2 }, coefficient: 1 },
      { formula: 'NaCl', state: 'aq', elements: { Na: 1, Cl: 1 }, coefficient: 2 },
    ],
    decoys: [{ side: 'products', formula: 'MgOH', state: 's' }],
  },
  {
    id: 'na-gufa',
    description: 'Vatnsgufa hvarfast við fast natríum og myndar fast natríumhýdroxíð og vetnisgas.',
    reactants: [
      { formula: 'Na', state: 's', elements: { Na: 1 }, coefficient: 2 },
      { formula: 'H₂O', state: 'g', elements: { H: 2, O: 1 }, coefficient: 2 },
    ],
    products: [
      { formula: 'NaOH', state: 's', elements: { Na: 1, O: 1, H: 1 }, coefficient: 2 },
      { formula: 'H₂', state: 'g', elements: { H: 2 }, coefficient: 1 },
    ],
    decoys: [{ side: 'products', formula: 'H', state: 'g' }],
  },
  {
    id: 'kclo3',
    description:
      'Fast kalíumklórat, KClO₃, brotnar niður og myndar fast kalíumklóríð og súrefnisgas.',
    reactants: [{ formula: 'KClO₃', state: 's', elements: { K: 1, Cl: 1, O: 3 }, coefficient: 2 }],
    products: [
      { formula: 'KCl', state: 's', elements: { K: 1, Cl: 1 }, coefficient: 2 },
      { formula: 'O₂', state: 'g', elements: { O: 2 }, coefficient: 3 },
    ],
    decoys: [{ side: 'products', formula: 'O₃', state: 'g' }],
  },
  {
    id: 'al-i2',
    description: 'Fast ál hvarfast við fast joð, I₂, og myndar fast Al₂I₆.',
    reactants: [
      { formula: 'Al', state: 's', elements: { Al: 1 }, coefficient: 2 },
      { formula: 'I₂', state: 's', elements: { I: 2 }, coefficient: 3 },
    ],
    products: [{ formula: 'Al₂I₆', state: 's', elements: { Al: 2, I: 6 }, coefficient: 1 }],
    decoys: [{ side: 'reactants', formula: 'I', state: 's' }],
  },
  {
    id: 'na-vatn',
    description:
      'Fast natríum hvarfast við fljótandi vatn og myndar vetnisgas og vatnslausn af natríumhýdroxíði.',
    reactants: [
      { formula: 'Na', state: 's', elements: { Na: 1 }, coefficient: 2 },
      { formula: 'H₂O', state: 'l', elements: { H: 2, O: 1 }, coefficient: 2 },
    ],
    products: [
      { formula: 'NaOH', state: 'aq', elements: { Na: 1, O: 1, H: 1 }, coefficient: 2 },
      { formula: 'H₂', state: 'g', elements: { H: 2 }, coefficient: 1 },
    ],
    decoys: [{ side: 'products', formula: 'Na₂O', state: 's' }],
  },
  {
    id: 'cao',
    description: 'Fast kalsíumoxíð hvarfast við fljótandi vatn og myndar fast kalsíumhýdroxíð.',
    reactants: [
      { formula: 'CaO', state: 's', elements: { Ca: 1, O: 1 }, coefficient: 1 },
      { formula: 'H₂O', state: 'l', elements: { H: 2, O: 1 }, coefficient: 1 },
    ],
    products: [{ formula: 'Ca(OH)₂', state: 's', elements: { Ca: 1, O: 2, H: 2 }, coefficient: 1 }],
    decoys: [{ side: 'products', formula: 'CaOH', state: 's' }],
  },
  {
    id: 'agcl',
    description:
      'Vatnslausnir af kalsíumklóríði og silfurnítrati hvarfast og mynda fast silfurklóríð og vatnslausn af kalsíumnítrati.',
    reactants: [
      { formula: 'CaCl₂', state: 'aq', elements: { Ca: 1, Cl: 2 }, coefficient: 1 },
      { formula: 'AgNO₃', state: 'aq', elements: { Ag: 1, N: 1, O: 3 }, coefficient: 2 },
    ],
    products: [
      { formula: 'AgCl', state: 's', elements: { Ag: 1, Cl: 1 }, coefficient: 2 },
      { formula: 'Ca(NO₃)₂', state: 'aq', elements: { Ca: 1, N: 2, O: 6 }, coefficient: 1 },
    ],
    decoys: [{ side: 'products', formula: 'CaNO₃', state: 'aq' }],
  },
  {
    id: 'mg-o2',
    description: 'Fast magnesíum brennur í súrefnisgasi og myndar fast magnesíumoxíð.',
    reactants: [
      { formula: 'Mg', state: 's', elements: { Mg: 1 }, coefficient: 2 },
      { formula: 'O₂', state: 'g', elements: { O: 2 }, coefficient: 1 },
    ],
    products: [{ formula: 'MgO', state: 's', elements: { Mg: 1, O: 1 }, coefficient: 2 }],
    decoys: [{ side: 'products', formula: 'MgO₂', state: 's' }],
  },
  {
    id: 'mgcl2-rafgreining',
    description: 'Bráðið magnesíumklóríð er rafgreint og myndar fljótandi magnesíum og klórgas.',
    reactants: [{ formula: 'MgCl₂', state: 'l', elements: { Mg: 1, Cl: 2 }, coefficient: 1 }],
    products: [
      { formula: 'Mg', state: 'l', elements: { Mg: 1 }, coefficient: 1 },
      { formula: 'Cl₂', state: 'g', elements: { Cl: 2 }, coefficient: 1 },
    ],
    decoys: [{ side: 'products', formula: 'Cl', state: 'g' }],
  },
  {
    id: 'fe-o2',
    description: 'Fast járn hvarfast við súrefnisgas og myndar fast járn(III)oxíð.',
    reactants: [
      { formula: 'Fe', state: 's', elements: { Fe: 1 }, coefficient: 4 },
      { formula: 'O₂', state: 'g', elements: { O: 2 }, coefficient: 3 },
    ],
    products: [{ formula: 'Fe₂O₃', state: 's', elements: { Fe: 2, O: 3 }, coefficient: 2 }],
    decoys: [{ side: 'products', formula: 'FeO', state: 's' }],
  },
];
