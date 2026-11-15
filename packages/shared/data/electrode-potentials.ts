/**
 * Standard electrode (reduction) potentials at 25 °C, from the Icelandic book's appendix
 * *Stöðurafspenna (hálffrumuspennur)* (`efnafraedi-2e`, module m68870), in volts.
 *
 * **Why this file exists.** Year-2 audit, 2026-11-15: `2-ar/redox-reactions` typed its own E°
 * values and gave iron −0,44 V where the book says −0,447, so its Fe–Cu cell read 0,78 V
 * against the book's 0,79. Siggi's ruling the same day is that the book wins where it and a game
 * disagree, so games take E° from here, as `appendix-d.ts` holds Ka and Ksp and `thermo.ts`
 * ΔH°f. Only rows the platform uses, or is about to, are transcribed; add a row when a game needs
 * one, and do not add a value that is not in the book.
 *
 * Written as reductions, as the book writes them. Keys name the couple, oxidised form first.
 * **H⁺, not H₃O⁺:** the book writes several acid half-reactions with H₃O⁺ (the dichromate row is
 * `Cr₂O₇²⁻ + 14H₃O⁺ + 6e⁻ → 2Cr³⁺ + 21H₂O`). The platform shows students H⁺ (Siggi, 2026-11-14),
 * so those rows are rewritten with H⁺ and the water that H₃O⁺ carried taken off both sides. The
 * potential is the same reaction's.
 *
 * Two misprints in the book's spoken table summary are not copied: it reads Cl₂ as +1,36827 and
 * Cu²⁺/Cu as +0,34, where the table itself gives +1,35827 and +0,337.
 */
export interface ElectrodePotential {
  /** The half-reaction as a reduction, in display form. */
  halfReaction: string;
  /** E° in volts, to the figures the book gives. */
  e: number;
}

export const ELECTRODE_POTENTIALS = {
  'Li+/Li': { halfReaction: 'Li⁺ + e⁻ → Li', e: -3.04 },
  'K+/K': { halfReaction: 'K⁺ + e⁻ → K', e: -2.931 },
  'Ba2+/Ba': { halfReaction: 'Ba²⁺ + 2e⁻ → Ba', e: -2.912 },
  'Ca2+/Ca': { halfReaction: 'Ca²⁺ + 2e⁻ → Ca', e: -2.868 },
  'Na+/Na': { halfReaction: 'Na⁺ + e⁻ → Na', e: -2.71 },
  'Mg2+/Mg': { halfReaction: 'Mg²⁺ + 2e⁻ → Mg', e: -2.372 },
  'Al3+/Al': { halfReaction: 'Al³⁺ + 3e⁻ → Al', e: -1.662 },
  'Mn2+/Mn': { halfReaction: 'Mn²⁺ + 2e⁻ → Mn', e: -1.185 },
  'H2O/H2': { halfReaction: '2H₂O + 2e⁻ → H₂ + 2OH⁻', e: -0.8277 },
  'Zn2+/Zn': { halfReaction: 'Zn²⁺ + 2e⁻ → Zn', e: -0.7618 },
  'Cr3+/Cr': { halfReaction: 'Cr³⁺ + 3e⁻ → Cr', e: -0.744 },
  'Fe2+/Fe': { halfReaction: 'Fe²⁺ + 2e⁻ → Fe', e: -0.447 },
  'Cd2+/Cd': { halfReaction: 'Cd²⁺ + 2e⁻ → Cd', e: -0.403 },
  'Co2+/Co': { halfReaction: 'Co²⁺ + 2e⁻ → Co', e: -0.28 },
  'Ni2+/Ni': { halfReaction: 'Ni²⁺ + 2e⁻ → Ni', e: -0.257 },
  'Sn2+/Sn': { halfReaction: 'Sn²⁺ + 2e⁻ → Sn', e: -0.1375 },
  'Pb2+/Pb': { halfReaction: 'Pb²⁺ + 2e⁻ → Pb', e: -0.1262 },
  'H+/H2': { halfReaction: '2H⁺ + 2e⁻ → H₂', e: 0 },
  'Sn4+/Sn2+': { halfReaction: 'Sn⁴⁺ + 2e⁻ → Sn²⁺', e: 0.151 },
  'Cu2+/Cu': { halfReaction: 'Cu²⁺ + 2e⁻ → Cu', e: 0.337 },
  'O2/OH-': { halfReaction: 'O₂ + 2H₂O + 4e⁻ → 4OH⁻', e: 0.401 },
  'I2/I-': { halfReaction: 'I₂ + 2e⁻ → 2I⁻', e: 0.5355 },
  'Fe3+/Fe2+': { halfReaction: 'Fe³⁺ + e⁻ → Fe²⁺', e: 0.771 },
  'Ag+/Ag': { halfReaction: 'Ag⁺ + e⁻ → Ag', e: 0.7996 },
  'NO3-/NO': { halfReaction: 'NO₃⁻ + 4H⁺ + 3e⁻ → NO + 2H₂O', e: 0.957 },
  'Br2/Br-': { halfReaction: 'Br₂(aq) + 2e⁻ → 2Br⁻', e: 1.0873 },
  'O2/H2O': { halfReaction: 'O₂ + 4H⁺ + 4e⁻ → 2H₂O', e: 1.229 },
  'MnO2/Mn2+': { halfReaction: 'MnO₂ + 4H⁺ + 2e⁻ → Mn²⁺ + 2H₂O', e: 1.23 },
  'Cr2O72-/Cr3+': { halfReaction: 'Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → 2Cr³⁺ + 7H₂O', e: 1.232 },
  'Cl2/Cl-': { halfReaction: 'Cl₂ + 2e⁻ → 2Cl⁻', e: 1.35827 },
  'Au3+/Au': { halfReaction: 'Au³⁺ + 3e⁻ → Au', e: 1.498 },
  'MnO4-/Mn2+': { halfReaction: 'MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O', e: 1.507 },
  'H2O2/H2O': { halfReaction: 'H₂O₂ + 2H⁺ + 2e⁻ → 2H₂O', e: 1.776 },
  'F2/F-': { halfReaction: 'F₂ + 2e⁻ → 2F⁻', e: 2.866 },
} as const satisfies Record<string, ElectrodePotential>;

export type Couple = keyof typeof ELECTRODE_POTENTIALS;

/** E° of a couple, in volts, as the book gives it. */
export function standardPotential(couple: Couple): number {
  return ELECTRODE_POTENTIALS[couple].e;
}

/** E°cell = E°(cathode) − E°(anode), both as reductions. */
export function cellPotential(cathode: Couple, anode: Couple): number {
  return standardPotential(cathode) - standardPotential(anode);
}
