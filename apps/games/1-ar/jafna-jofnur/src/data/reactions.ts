/**
 * Reaction data for the Jafna Jöfnur (Balance Equations) game.
 * ~20 unbalanced reactions at 3 difficulty tiers.
 *
 * Each molecule stores its element composition so we can count atoms
 * programmatically when checking balance.
 */

export interface Molecule {
  /** Display formula, e.g. "H₂O" */
  formula: string;
  /** Element composition, e.g. { H: 2, O: 1 } */
  elements: Record<string, number>;
  /** The correct coefficient for the balanced equation */
  coefficient: number;
}

export interface Reaction {
  id: number;
  reactants: Molecule[];
  products: Molecule[];
  difficulty: 'easy' | 'medium' | 'hard';
  /** Optional hint in Icelandic */
  hint?: string;
}

export const REACTIONS: Reaction[] = [
  // ─── Easy (7 reactions) ───────────────────────────────────────
  {
    id: 1,
    reactants: [
      { formula: 'H₂', elements: { H: 2 }, coefficient: 2 },
      { formula: 'O₂', elements: { O: 2 }, coefficient: 1 },
    ],
    products: [{ formula: 'H₂O', elements: { H: 2, O: 1 }, coefficient: 2 }],
    difficulty: 'easy',
    hint: 'Byrjaðu á að telja vetnisatóm beggja vegna.',
  },
  {
    id: 2,
    reactants: [
      { formula: 'Na', elements: { Na: 1 }, coefficient: 2 },
      { formula: 'Cl₂', elements: { Cl: 2 }, coefficient: 1 },
    ],
    products: [{ formula: 'NaCl', elements: { Na: 1, Cl: 1 }, coefficient: 2 }],
    difficulty: 'easy',
    hint: 'Klór kemur sem Cl₂ - tvö atóm saman.',
  },
  {
    id: 3,
    reactants: [
      { formula: 'Mg', elements: { Mg: 1 }, coefficient: 2 },
      { formula: 'O₂', elements: { O: 2 }, coefficient: 1 },
    ],
    products: [{ formula: 'MgO', elements: { Mg: 1, O: 1 }, coefficient: 2 }],
    difficulty: 'easy',
    hint: 'O₂ hefur 2 súrefnisatóm - þú þarft 2 MgO til að jafna.',
  },
  {
    id: 4,
    reactants: [
      { formula: 'N₂', elements: { N: 2 }, coefficient: 1 },
      { formula: 'H₂', elements: { H: 2 }, coefficient: 3 },
    ],
    products: [{ formula: 'NH₃', elements: { N: 1, H: 3 }, coefficient: 2 }],
    difficulty: 'easy',
    hint: 'N₂ gefur 2 köfnunarefnisatóm - þú þarft 2 NH₃.',
  },
  {
    id: 5,
    reactants: [
      { formula: 'Fe', elements: { Fe: 1 }, coefficient: 4 },
      { formula: 'O₂', elements: { O: 2 }, coefficient: 3 },
    ],
    products: [{ formula: 'Fe₂O₃', elements: { Fe: 2, O: 3 }, coefficient: 2 }],
    difficulty: 'easy',
    hint: 'Byrjaðu á járni: Fe₂O₃ hefur 2 Fe, svo 2 Fe₂O₃ þarf 4 Fe.',
  },
  {
    id: 6,
    reactants: [
      { formula: 'Ca', elements: { Ca: 1 }, coefficient: 2 },
      { formula: 'O₂', elements: { O: 2 }, coefficient: 1 },
    ],
    products: [{ formula: 'CaO', elements: { Ca: 1, O: 1 }, coefficient: 2 }],
    difficulty: 'easy',
    hint: 'Sama mynstur og Mg + O₂ → MgO.',
  },
  {
    id: 7,
    reactants: [
      { formula: 'Li', elements: { Li: 1 }, coefficient: 2 },
      { formula: 'H₂O', elements: { H: 2, O: 1 }, coefficient: 2 },
    ],
    products: [
      { formula: 'LiOH', elements: { Li: 1, O: 1, H: 1 }, coefficient: 2 },
      { formula: 'H₂', elements: { H: 2 }, coefficient: 1 },
    ],
    difficulty: 'easy',
    hint: 'Telja vetni: hægri hlið hefur H í LiOH og í H₂.',
  },

  // ─── Medium (7 reactions) ─────────────────────────────────────
  {
    id: 8,
    reactants: [
      { formula: 'CH₄', elements: { C: 1, H: 4 }, coefficient: 1 },
      { formula: 'O₂', elements: { O: 2 }, coefficient: 2 },
    ],
    products: [
      { formula: 'CO₂', elements: { C: 1, O: 2 }, coefficient: 1 },
      { formula: 'H₂O', elements: { H: 2, O: 1 }, coefficient: 2 },
    ],
    difficulty: 'medium',
    hint: 'Byrjaðu á kolefni, síðan vetni, og jafnaðu súrefni síðast.',
  },
  {
    id: 9,
    reactants: [
      { formula: 'Al', elements: { Al: 1 }, coefficient: 2 },
      { formula: 'HCl', elements: { H: 1, Cl: 1 }, coefficient: 6 },
    ],
    products: [
      { formula: 'AlCl₃', elements: { Al: 1, Cl: 3 }, coefficient: 2 },
      { formula: 'H₂', elements: { H: 2 }, coefficient: 3 },
    ],
    difficulty: 'medium',
    hint: 'AlCl₃ þarf 3 Cl per Al - byrjaðu þar.',
  },
  {
    id: 10,
    reactants: [
      { formula: 'Fe₂O₃', elements: { Fe: 2, O: 3 }, coefficient: 2 },
      { formula: 'C', elements: { C: 1 }, coefficient: 3 },
    ],
    products: [
      { formula: 'Fe', elements: { Fe: 1 }, coefficient: 4 },
      { formula: 'CO₂', elements: { C: 1, O: 2 }, coefficient: 3 },
    ],
    difficulty: 'medium',
    hint: 'Jafnaðu járn fyrst, síðan kolefni, og athugaðu súrefni.',
  },
  {
    id: 11,
    reactants: [{ formula: 'KClO₃', elements: { K: 1, Cl: 1, O: 3 }, coefficient: 2 }],
    products: [
      { formula: 'KCl', elements: { K: 1, Cl: 1 }, coefficient: 2 },
      { formula: 'O₂', elements: { O: 2 }, coefficient: 3 },
    ],
    difficulty: 'medium',
    hint: 'Jafnaðu K og Cl fyrst - þeir eru auðveldastir.',
  },
  {
    id: 12,
    reactants: [
      { formula: 'NaOH', elements: { Na: 1, O: 1, H: 1 }, coefficient: 2 },
      { formula: 'H₂SO₄', elements: { H: 2, S: 1, O: 4 }, coefficient: 1 },
    ],
    products: [
      { formula: 'Na₂SO₄', elements: { Na: 2, S: 1, O: 4 }, coefficient: 1 },
      { formula: 'H₂O', elements: { H: 2, O: 1 }, coefficient: 2 },
    ],
    difficulty: 'medium',
    hint: 'Na₂SO₄ þarf 2 Na - byrjaðu með 2 NaOH.',
  },
  {
    id: 13,
    reactants: [{ formula: 'CaCO₃', elements: { Ca: 1, C: 1, O: 3 }, coefficient: 1 }],
    products: [
      { formula: 'CaO', elements: { Ca: 1, O: 1 }, coefficient: 1 },
      { formula: 'CO₂', elements: { C: 1, O: 2 }, coefficient: 1 },
    ],
    difficulty: 'medium',
    hint: 'Þessi jafna er nú þegar jöfn með stuðlum 1.',
  },
  {
    id: 14,
    reactants: [
      { formula: 'Zn', elements: { Zn: 1 }, coefficient: 1 },
      { formula: 'HCl', elements: { H: 1, Cl: 1 }, coefficient: 2 },
    ],
    products: [
      { formula: 'ZnCl₂', elements: { Zn: 1, Cl: 2 }, coefficient: 1 },
      { formula: 'H₂', elements: { H: 2 }, coefficient: 1 },
    ],
    difficulty: 'medium',
    hint: 'ZnCl₂ þarf 2 Cl - svo þarf 2 HCl.',
  },

  // ─── Hard (6 reactions) ───────────────────────────────────────
  {
    id: 15,
    reactants: [
      { formula: 'C₃H₈', elements: { C: 3, H: 8 }, coefficient: 1 },
      { formula: 'O₂', elements: { O: 2 }, coefficient: 5 },
    ],
    products: [
      { formula: 'CO₂', elements: { C: 1, O: 2 }, coefficient: 3 },
      { formula: 'H₂O', elements: { H: 2, O: 1 }, coefficient: 4 },
    ],
    difficulty: 'hard',
  },
  {
    id: 16,
    reactants: [
      { formula: 'C₂H₆', elements: { C: 2, H: 6 }, coefficient: 2 },
      { formula: 'O₂', elements: { O: 2 }, coefficient: 7 },
    ],
    products: [
      { formula: 'CO₂', elements: { C: 1, O: 2 }, coefficient: 4 },
      { formula: 'H₂O', elements: { H: 2, O: 1 }, coefficient: 6 },
    ],
    difficulty: 'hard',
  },
  {
    id: 17,
    reactants: [
      { formula: 'Fe', elements: { Fe: 1 }, coefficient: 3 },
      { formula: 'H₂O', elements: { H: 2, O: 1 }, coefficient: 4 },
    ],
    products: [
      { formula: 'Fe₃O₄', elements: { Fe: 3, O: 4 }, coefficient: 1 },
      { formula: 'H₂', elements: { H: 2 }, coefficient: 4 },
    ],
    difficulty: 'hard',
  },
  {
    id: 18,
    reactants: [
      { formula: 'Al', elements: { Al: 1 }, coefficient: 2 },
      { formula: 'Fe₂O₃', elements: { Fe: 2, O: 3 }, coefficient: 1 },
    ],
    products: [
      { formula: 'Al₂O₃', elements: { Al: 2, O: 3 }, coefficient: 1 },
      { formula: 'Fe', elements: { Fe: 1 }, coefficient: 2 },
    ],
    difficulty: 'hard',
  },
  {
    id: 19,
    reactants: [
      { formula: 'NH₃', elements: { N: 1, H: 3 }, coefficient: 4 },
      { formula: 'O₂', elements: { O: 2 }, coefficient: 5 },
    ],
    products: [
      { formula: 'NO', elements: { N: 1, O: 1 }, coefficient: 4 },
      { formula: 'H₂O', elements: { H: 2, O: 1 }, coefficient: 6 },
    ],
    difficulty: 'hard',
  },
  {
    id: 20,
    reactants: [
      { formula: 'C₆H₁₂O₆', elements: { C: 6, H: 12, O: 6 }, coefficient: 1 },
      { formula: 'O₂', elements: { O: 2 }, coefficient: 6 },
    ],
    products: [
      { formula: 'CO₂', elements: { C: 1, O: 2 }, coefficient: 6 },
      { formula: 'H₂O', elements: { H: 2, O: 1 }, coefficient: 6 },
    ],
    difficulty: 'hard',
  },
];
