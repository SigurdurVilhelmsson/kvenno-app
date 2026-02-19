/**
 * Complete Bank of 30 Equilibrium Systems
 * Organized by difficulty: Beginner (10), Intermediate (12), Advanced (8)
 */

import { Equilibrium, DifficultyLevel } from '../types';

export const equilibria: Equilibrium[] = [
  // ==================== BEGINNER LEVEL (10) ====================

  // Equilibrium 1: Dinitrogen Tetroxide
  {
    id: 1,
    equation: 'N₂O₄(g) ⇌ 2NO₂(g)',
    name: 'Dinitrogen Tetroxide',
    nameIs: 'Díköfnunarefnisoxíð',
    difficulty: 'beginner',
    reactants: [
      { formula: 'N₂O₄', coefficient: 1, phase: 'g', display: '⚫' }
    ],
    products: [
      { formula: 'NO₂', coefficient: 2, phase: 'g', display: '🟤' }
    ],
    thermodynamics: {
      deltaH: 58,
      type: 'endothermic'
    },
    gasMoles: {
      reactants: 1,
      products: 2
    },
    description: 'Colorless N₂O₄ gas converts to brown NO₂ gas when heated.',
    descriptionIs: 'Litlaust N₂O₄ gas breytist í brúnt NO₂ gas við upphitun.',
    possibleStresses: [
      { type: 'add-reactant', target: 'N₂O₄' },
      { type: 'add-product', target: 'NO₂' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null },
      { type: 'increase-pressure', target: null },
      { type: 'decrease-pressure', target: null },
      { type: 'add-catalyst', target: null }
    ]
  },

  // Equilibrium 2: Hydrogen Iodide Formation
  {
    id: 2,
    equation: 'H₂(g) + I₂(g) ⇌ 2HI(g)',
    name: 'Hydrogen Iodide Formation',
    nameIs: 'Myndun vetnisjoðíðs',
    difficulty: 'beginner',
    reactants: [
      { formula: 'H₂', coefficient: 1, phase: 'g', display: '⚪' },
      { formula: 'I₂', coefficient: 1, phase: 'g', display: '🟣' }
    ],
    products: [
      { formula: 'HI', coefficient: 2, phase: 'g', display: '⚪🟣' }
    ],
    thermodynamics: {
      deltaH: 53,
      type: 'endothermic'
    },
    gasMoles: {
      reactants: 2,
      products: 2
    },
    description: 'Simple formation reaction used to teach equilibrium constants.',
    descriptionIs: 'Einfalt myndunarhvarf sem notað er til að kenna jafnvægisfasta.',
    possibleStresses: [
      { type: 'add-reactant', target: 'H₂' },
      { type: 'add-reactant', target: 'I₂' },
      { type: 'add-product', target: 'HI' },
      { type: 'remove-product', target: 'HI' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null },
      { type: 'increase-pressure', target: null },
      { type: 'add-catalyst', target: null }
    ]
  },

  // Equilibrium 3: Phosphorus Pentachloride
  {
    id: 3,
    equation: 'PCl₅(g) ⇌ PCl₃(g) + Cl₂(g)',
    name: 'Phosphorus Pentachloride',
    nameIs: 'Fosfórpentaklóríð',
    difficulty: 'beginner',
    reactants: [
      { formula: 'PCl₅', coefficient: 1, phase: 'g', display: '🔷' }
    ],
    products: [
      { formula: 'PCl₃', coefficient: 1, phase: 'g', display: '🔹' },
      { formula: 'Cl₂', coefficient: 1, phase: 'g', display: '🟢' }
    ],
    thermodynamics: {
      deltaH: 88,
      type: 'endothermic'
    },
    gasMoles: {
      reactants: 1,
      products: 2
    },
    description: 'Decomposition of PCl₅ upon heating.',
    descriptionIs: 'Umbreyting PCl₅ við upphitun.',
    possibleStresses: [
      { type: 'add-reactant', target: 'PCl₅' },
      { type: 'add-product', target: 'Cl₂' },
      { type: 'remove-product', target: 'Cl₂' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null },
      { type: 'increase-pressure', target: null },
      { type: 'add-catalyst', target: null }
    ]
  },

  // Equilibrium 4: Methanol Synthesis
  {
    id: 4,
    equation: 'CO(g) + 2H₂(g) ⇌ CH₃OH(g)',
    name: 'Methanol Synthesis',
    nameIs: 'Metanólframleiðsla',
    difficulty: 'beginner',
    reactants: [
      { formula: 'CO', coefficient: 1, phase: 'g', display: '⚫🔴' },
      { formula: 'H₂', coefficient: 2, phase: 'g', display: '⚪' }
    ],
    products: [
      { formula: 'CH₃OH', coefficient: 1, phase: 'g', display: '🧪' }
    ],
    thermodynamics: {
      deltaH: -91,
      type: 'exothermic'
    },
    gasMoles: {
      reactants: 3,
      products: 1
    },
    description: 'Industrial production of methanol for fuel and chemicals.',
    descriptionIs: 'Iðnaðarframleiðsla á metanóli sem eldsneyti og efni.',
    possibleStresses: [
      { type: 'add-reactant', target: 'CO' },
      { type: 'add-reactant', target: 'H₂' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null },
      { type: 'increase-pressure', target: null },
      { type: 'decrease-pressure', target: null },
      { type: 'add-catalyst', target: null }
    ]
  },

  // Equilibrium 5: Calcium Carbonate Decomposition
  {
    id: 5,
    equation: 'CaCO₃(s) ⇌ CaO(s) + CO₂(g)',
    name: 'Calcium Carbonate Decomposition',
    nameIs: 'Sundrun kalsíumkarbónats',
    difficulty: 'beginner',
    reactants: [
      { formula: 'CaCO₃', coefficient: 1, phase: 's', display: '🪨' }
    ],
    products: [
      { formula: 'CaO', coefficient: 1, phase: 's', display: '⚪' },
      { formula: 'CO₂', coefficient: 1, phase: 'g', display: '⚫🔴' }
    ],
    thermodynamics: {
      deltaH: 178,
      type: 'endothermic'
    },
    gasMoles: {
      reactants: 0,
      products: 1
    },
    description: 'Limestone decomposition, used in cement production.',
    descriptionIs: 'Kalksteinn við upphitun, notað í sementframleiðslu.',
    possibleStresses: [
      { type: 'remove-product', target: 'CO₂' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null },
      { type: 'increase-pressure', target: null },
      { type: 'decrease-pressure', target: null }
    ]
  },

  // Equilibrium 6: Iron Thiocyanate Complex
  {
    id: 6,
    equation: 'Fe³⁺(aq) + SCN⁻(aq) ⇌ FeSCN²⁺(aq)',
    name: 'Iron Thiocyanate Complex',
    nameIs: 'Járn-þíósýanatkomplexið',
    difficulty: 'beginner',
    reactants: [
      { formula: 'Fe³⁺', coefficient: 1, phase: 'aq', display: '🟡⁺' },
      { formula: 'SCN⁻', coefficient: 1, phase: 'aq', display: '⚪⁻' }
    ],
    products: [
      { formula: 'FeSCN²⁺', coefficient: 1, phase: 'aq', display: '🔴' }
    ],
    thermodynamics: {
      deltaH: -20,
      type: 'exothermic'
    },
    gasMoles: {
      reactants: 0,
      products: 0
    },
    description: 'Blood-red complex ion, used in chemistry demonstrations.',
    descriptionIs: 'Blóðrauður þynningarefnakomplexinn, notaður í efnafræðisýningum.',
    possibleStresses: [
      { type: 'add-reactant', target: 'Fe³⁺' },
      { type: 'add-reactant', target: 'SCN⁻' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null }
    ]
  },

  // Equilibrium 7: Water Autoionization
  {
    id: 7,
    equation: 'H₂O(l) ⇌ H⁺(aq) + OH⁻(aq)',
    name: 'Water Autoionization',
    nameIs: 'Sjálfjafnvægi vatns',
    difficulty: 'beginner',
    reactants: [
      { formula: 'H₂O', coefficient: 1, phase: 'l', display: '💧' }
    ],
    products: [
      { formula: 'H⁺', coefficient: 1, phase: 'aq', display: '⊕' },
      { formula: 'OH⁻', coefficient: 1, phase: 'aq', display: '⊖' }
    ],
    thermodynamics: {
      deltaH: 56,
      type: 'endothermic'
    },
    gasMoles: {
      reactants: 0,
      products: 0
    },
    description: 'Self-ionization of water, basis of pH system.',
    descriptionIs: 'Sjálfjafnvægi vatns, grunnur pH kerfis.',
    possibleStresses: [
      { type: 'add-product', target: 'H⁺' },
      { type: 'add-product', target: 'OH⁻' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null }
    ]
  },

  // Equilibrium 8: Acetic Acid Dissociation
  {
    id: 8,
    equation: 'CH₃COOH(aq) ⇌ CH₃COO⁻(aq) + H⁺(aq)',
    name: 'Acetic Acid Dissociation',
    nameIs: 'Ediksýrusundrun',
    difficulty: 'beginner',
    reactants: [
      { formula: 'CH₃COOH', coefficient: 1, phase: 'aq', display: '🧪' }
    ],
    products: [
      { formula: 'CH₃COO⁻', coefficient: 1, phase: 'aq', display: '🧪⁻' },
      { formula: 'H⁺', coefficient: 1, phase: 'aq', display: '⊕' }
    ],
    thermodynamics: {
      deltaH: 5,
      type: 'endothermic'
    },
    gasMoles: {
      reactants: 0,
      products: 0
    },
    description: 'Acetic acid, typical weak acid equilibrium.',
    descriptionIs: 'Ediksýra, dæmigert veikt sýrujafnvægi.',
    possibleStresses: [
      { type: 'add-reactant', target: 'CH₃COOH' },
      { type: 'add-product', target: 'H⁺' },
      { type: 'increase-temp', target: null }
    ]
  },

  // Equilibrium 9: Ammonia Base
  {
    id: 9,
    equation: 'NH₃(aq) + H₂O(l) ⇌ NH₄⁺(aq) + OH⁻(aq)',
    name: 'Ammonia Base',
    nameIs: 'Ammóníak sem basi',
    difficulty: 'beginner',
    reactants: [
      { formula: 'NH₃', coefficient: 1, phase: 'aq', display: '🔷' },
      { formula: 'H₂O', coefficient: 1, phase: 'l', display: '💧' }
    ],
    products: [
      { formula: 'NH₄⁺', coefficient: 1, phase: 'aq', display: '🔷⁺' },
      { formula: 'OH⁻', coefficient: 1, phase: 'aq', display: '⊖' }
    ],
    thermodynamics: {
      deltaH: -3,
      type: 'exothermic'
    },
    gasMoles: {
      reactants: 0,
      products: 0
    },
    description: 'Ammonia as a weak base in water.',
    descriptionIs: 'Ammóníak sem veikur basi í vatni.',
    possibleStresses: [
      { type: 'add-reactant', target: 'NH₃' },
      { type: 'add-product', target: 'OH⁻' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null }
    ]
  },

  // Equilibrium 10: Silver Chloride Precipitation
  {
    id: 10,
    equation: 'AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq)',
    name: 'Silver Chloride Precipitation',
    nameIs: 'Silfurklóríð úrfellingajafnvægi',
    difficulty: 'beginner',
    reactants: [
      { formula: 'AgCl', coefficient: 1, phase: 's', display: '🔘' }
    ],
    products: [
      { formula: 'Ag⁺', coefficient: 1, phase: 'aq', display: '⚪⁺' },
      { formula: 'Cl⁻', coefficient: 1, phase: 'aq', display: '🟢⁻' }
    ],
    thermodynamics: {
      deltaH: 65,
      type: 'endothermic'
    },
    gasMoles: {
      reactants: 0,
      products: 0
    },
    description: 'Solubility equilibrium of silver chloride, white precipitate.',
    descriptionIs: 'Leysnijafnvægi silfurklóríðs, hvítur fellur út.',
    possibleStresses: [
      { type: 'add-product', target: 'Ag⁺' },
      { type: 'add-product', target: 'Cl⁻' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null }
    ]
  },

  // ==================== INTERMEDIATE LEVEL (12) ====================

  // Equilibrium 11: Haber Process
  {
    id: 11,
    equation: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)',
    name: 'Haber Process',
    nameIs: 'Haber-aðferð',
    difficulty: 'intermediate',
    reactants: [
      { formula: 'N₂', coefficient: 1, phase: 'g', display: '🔵' },
      { formula: 'H₂', coefficient: 3, phase: 'g', display: '⚪' }
    ],
    products: [
      { formula: 'NH₃', coefficient: 2, phase: 'g', display: '🔷' }
    ],
    thermodynamics: {
      deltaH: -92,
      type: 'exothermic'
    },
    gasMoles: {
      reactants: 4,
      products: 2
    },
    description: 'Haber process, industrial ammonia synthesis for fertilizers.',
    descriptionIs: 'Haber-aðferð, iðnaðarframleiðsla á ammóníaki fyrir áburð.',
    possibleStresses: [
      { type: 'add-reactant', target: 'N₂' },
      { type: 'add-reactant', target: 'H₂' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null },
      { type: 'increase-pressure', target: null },
      { type: 'decrease-pressure', target: null },
      { type: 'add-catalyst', target: null }
    ]
  },

  // Equilibrium 12: Contact Process
  {
    id: 12,
    equation: '2SO₂(g) + O₂(g) ⇌ 2SO₃(g)',
    name: 'Contact Process',
    nameIs: 'Snertiaðferð',
    difficulty: 'intermediate',
    reactants: [
      { formula: 'SO₂', coefficient: 2, phase: 'g', display: '💛' },
      { formula: 'O₂', coefficient: 1, phase: 'g', display: '🔴' }
    ],
    products: [
      { formula: 'SO₃', coefficient: 2, phase: 'g', display: '🟡' }
    ],
    thermodynamics: {
      deltaH: -198,
      type: 'exothermic'
    },
    gasMoles: {
      reactants: 3,
      products: 2
    },
    description: 'Sulfuric acid production in industry.',
    descriptionIs: 'Brennisteinssýruframleiðsla í iðnaði.',
    possibleStresses: [
      { type: 'add-reactant', target: 'SO₂' },
      { type: 'add-reactant', target: 'O₂' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null },
      { type: 'increase-pressure', target: null },
      { type: 'add-catalyst', target: null }
    ]
  },

  // Equilibrium 13: Ostwald Process
  {
    id: 13,
    equation: '4NH₃(g) + 5O₂(g) ⇌ 4NO(g) + 6H₂O(g)',
    name: 'Ostwald Process',
    nameIs: 'Ostwald-aðferð',
    difficulty: 'intermediate',
    reactants: [
      { formula: 'NH₃', coefficient: 4, phase: 'g', display: '🔷' },
      { formula: 'O₂', coefficient: 5, phase: 'g', display: '🔴' }
    ],
    products: [
      { formula: 'NO', coefficient: 4, phase: 'g', display: '🔴⚫' },
      { formula: 'H₂O', coefficient: 6, phase: 'g', display: '💧' }
    ],
    thermodynamics: {
      deltaH: -905,
      type: 'exothermic'
    },
    gasMoles: {
      reactants: 9,
      products: 10
    },
    description: 'Nitrogen oxide production for nitric acid.',
    descriptionIs: 'Köfnunarefnisoxíðframleiðsla fyrir salpeturssýru.',
    possibleStresses: [
      { type: 'add-reactant', target: 'NH₃' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null },
      { type: 'increase-pressure', target: null },
      { type: 'add-catalyst', target: null }
    ]
  },

  // Equilibrium 14: Water Gas Shift
  {
    id: 14,
    equation: 'CO(g) + H₂O(g) ⇌ CO₂(g) + H₂(g)',
    name: 'Water Gas Shift',
    nameIs: 'Vatnsgas hvarfið',
    difficulty: 'intermediate',
    reactants: [
      { formula: 'CO', coefficient: 1, phase: 'g', display: '⚫🔴' },
      { formula: 'H₂O', coefficient: 1, phase: 'g', display: '💧' }
    ],
    products: [
      { formula: 'CO₂', coefficient: 1, phase: 'g', display: '⚫🔴🔴' },
      { formula: 'H₂', coefficient: 1, phase: 'g', display: '⚪' }
    ],
    thermodynamics: {
      deltaH: -41,
      type: 'exothermic'
    },
    gasMoles: {
      reactants: 2,
      products: 2
    },
    description: 'Important in hydrogen production and industry.',
    descriptionIs: 'Mikilvægt í vetniframleiðslu og iðnaði.',
    possibleStresses: [
      { type: 'add-reactant', target: 'CO' },
      { type: 'remove-product', target: 'H₂' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null },
      { type: 'increase-pressure', target: null }
    ]
  },

  // Equilibrium 15: Nitrogen Oxide Formation
  {
    id: 15,
    equation: '2NO(g) + O₂(g) ⇌ 2NO₂(g)',
    name: 'Nitrogen Oxide Formation',
    nameIs: 'Myndun köfnunarefnisoxíðs',
    difficulty: 'intermediate',
    reactants: [
      { formula: 'NO', coefficient: 2, phase: 'g', display: '🔴⚫' },
      { formula: 'O₂', coefficient: 1, phase: 'g', display: '🔴' }
    ],
    products: [
      { formula: 'NO₂', coefficient: 2, phase: 'g', display: '🟤' }
    ],
    thermodynamics: {
      deltaH: -114,
      type: 'exothermic'
    },
    gasMoles: {
      reactants: 3,
      products: 2
    },
    description: 'Air pollution and industrial reaction.',
    descriptionIs: 'Loftmengun og iðnaðarhvarf.',
    possibleStresses: [
      { type: 'add-reactant', target: 'NO' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null },
      { type: 'increase-pressure', target: null },
      { type: 'decrease-pressure', target: null }
    ]
  },

  // Equilibrium 16: Boudouard Reaction
  {
    id: 16,
    equation: 'C(s) + CO₂(g) ⇌ 2CO(g)',
    name: 'Boudouard Reaction',
    nameIs: 'Boudouard hvarf',
    difficulty: 'intermediate',
    reactants: [
      { formula: 'C', coefficient: 1, phase: 's', display: '⚫' },
      { formula: 'CO₂', coefficient: 1, phase: 'g', display: '⚫🔴🔴' }
    ],
    products: [
      { formula: 'CO', coefficient: 2, phase: 'g', display: '⚫🔴' }
    ],
    thermodynamics: {
      deltaH: 172,
      type: 'endothermic'
    },
    gasMoles: {
      reactants: 1,
      products: 2
    },
    description: 'Carbon reaction in high-temperature furnaces and metallurgy.',
    descriptionIs: 'Kolefnishvarf í há hitasmíði og málmvinnslu.',
    possibleStresses: [
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null },
      { type: 'increase-pressure', target: null },
      { type: 'decrease-pressure', target: null },
      { type: 'remove-product', target: 'CO' }
    ]
  },

  // Equilibrium 17: Steam Reforming
  {
    id: 17,
    equation: 'CH₄(g) + H₂O(g) ⇌ CO(g) + 3H₂(g)',
    name: 'Steam Reforming',
    nameIs: 'Gufuumbrot',
    difficulty: 'intermediate',
    reactants: [
      { formula: 'CH₄', coefficient: 1, phase: 'g', display: '⚫⚪' },
      { formula: 'H₂O', coefficient: 1, phase: 'g', display: '💧' }
    ],
    products: [
      { formula: 'CO', coefficient: 1, phase: 'g', display: '⚫🔴' },
      { formula: 'H₂', coefficient: 3, phase: 'g', display: '⚪' }
    ],
    thermodynamics: {
      deltaH: 206,
      type: 'endothermic'
    },
    gasMoles: {
      reactants: 2,
      products: 4
    },
    description: 'Primary method for hydrogen production from natural gas.',
    descriptionIs: 'Helsta aðferð við vetniframleiðslu úr náttúrugasi.',
    possibleStresses: [
      { type: 'add-reactant', target: 'CH₄' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null },
      { type: 'increase-pressure', target: null },
      { type: 'decrease-pressure', target: null },
      { type: 'add-catalyst', target: null }
    ]
  },

  // Equilibrium 18: Reverse Water Gas
  {
    id: 18,
    equation: 'H₂(g) + CO₂(g) ⇌ H₂O(g) + CO(g)',
    name: 'Reverse Water Gas',
    nameIs: 'Andhverfa vatnsgas',
    difficulty: 'intermediate',
    reactants: [
      { formula: 'H₂', coefficient: 1, phase: 'g', display: '⚪' },
      { formula: 'CO₂', coefficient: 1, phase: 'g', display: '⚫🔴🔴' }
    ],
    products: [
      { formula: 'H₂O', coefficient: 1, phase: 'g', display: '💧' },
      { formula: 'CO', coefficient: 1, phase: 'g', display: '⚫🔴' }
    ],
    thermodynamics: {
      deltaH: 41,
      type: 'endothermic'
    },
    gasMoles: {
      reactants: 2,
      products: 2
    },
    description: 'Reverse of the Water Gas Shift reaction.',
    descriptionIs: 'Andhverfa Water Gas Shift hvarfsins.',
    possibleStresses: [
      { type: 'add-reactant', target: 'H₂' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null },
      { type: 'increase-pressure', target: null },
      { type: 'remove-product', target: 'CO' }
    ]
  },

  // Equilibrium 19: Nitrogen Fixation
  {
    id: 19,
    equation: 'N₂(g) + O₂(g) ⇌ 2NO(g)',
    name: 'Nitrogen Fixation',
    nameIs: 'Köfnunarefnisbinding',
    difficulty: 'intermediate',
    reactants: [
      { formula: 'N₂', coefficient: 1, phase: 'g', display: '🔵' },
      { formula: 'O₂', coefficient: 1, phase: 'g', display: '🔴' }
    ],
    products: [
      { formula: 'NO', coefficient: 2, phase: 'g', display: '🔴⚫' }
    ],
    thermodynamics: {
      deltaH: 181,
      type: 'endothermic'
    },
    gasMoles: {
      reactants: 2,
      products: 2
    },
    description: 'Lightning in atmosphere fixes nitrogen.',
    descriptionIs: 'Eldingar í andrúmslofti binda köfnunarefni.',
    possibleStresses: [
      { type: 'add-reactant', target: 'N₂' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null },
      { type: 'increase-pressure', target: null }
    ]
  },

  // Equilibrium 20: Hydrogen Sulfide Oxidation
  {
    id: 20,
    equation: '2H₂S(g) + 3O₂(g) ⇌ 2H₂O(g) + 2SO₂(g)',
    name: 'Hydrogen Sulfide Oxidation',
    nameIs: 'Oxun vetisbrennsiteins',
    difficulty: 'intermediate',
    reactants: [
      { formula: 'H₂S', coefficient: 2, phase: 'g', display: '💛⚪' },
      { formula: 'O₂', coefficient: 3, phase: 'g', display: '🔴' }
    ],
    products: [
      { formula: 'H₂O', coefficient: 2, phase: 'g', display: '💧' },
      { formula: 'SO₂', coefficient: 2, phase: 'g', display: '💛' }
    ],
    thermodynamics: {
      deltaH: -1036,
      type: 'exothermic'
    },
    gasMoles: {
      reactants: 5,
      products: 4
    },
    description: 'Combustion of hydrogen sulfide, rotten egg smell.',
    descriptionIs: 'Brennsla vetisbrennsisteinss, lykt af rotnum eggjum.',
    possibleStresses: [
      { type: 'add-reactant', target: 'H₂S' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null },
      { type: 'increase-pressure', target: null },
      { type: 'remove-reactant', target: 'O₂' }
    ]
  },

  // Equilibrium 21: Carbonic Acid
  {
    id: 21,
    equation: 'H₂CO₃(aq) ⇌ H⁺(aq) + HCO₃⁻(aq)',
    name: 'Carbonic Acid',
    nameIs: 'Kolsýra',
    difficulty: 'intermediate',
    reactants: [
      { formula: 'H₂CO₃', coefficient: 1, phase: 'aq', display: '💧⚫' }
    ],
    products: [
      { formula: 'H⁺', coefficient: 1, phase: 'aq', display: '⊕' },
      { formula: 'HCO₃⁻', coefficient: 1, phase: 'aq', display: '⊖' }
    ],
    thermodynamics: {
      deltaH: 10,
      type: 'endothermic'
    },
    gasMoles: {
      reactants: 0,
      products: 0
    },
    description: 'Carbonic acid in water, important in blood buffer system.',
    descriptionIs: 'Kolsýra í vatni, mikilvægt í blóðpufferkerfi.',
    possibleStresses: [
      { type: 'add-reactant', target: 'H₂CO₃' },
      { type: 'add-product', target: 'H⁺' },
      { type: 'increase-temp', target: null }
    ]
  },

  // Equilibrium 22: Copper Ammonia Complex
  {
    id: 22,
    equation: 'Cu(NH₃)₄²⁺(aq) ⇌ Cu²⁺(aq) + 4NH₃(aq)',
    name: 'Copper Ammonia Complex',
    nameIs: 'Kopar-ammóníak komplexið',
    difficulty: 'intermediate',
    reactants: [
      { formula: 'Cu(NH₃)₄²⁺', coefficient: 1, phase: 'aq', display: '🔵' }
    ],
    products: [
      { formula: 'Cu²⁺', coefficient: 1, phase: 'aq', display: '💙' },
      { formula: 'NH₃', coefficient: 4, phase: 'aq', display: '🔷' }
    ],
    thermodynamics: {
      deltaH: 42,
      type: 'endothermic'
    },
    gasMoles: {
      reactants: 0,
      products: 0
    },
    description: 'Deep blue copper-ammonia complex, example of ligand exchange.',
    descriptionIs: 'Djúpblár koparammóníakkomplexinn, dæmi um ligandskipti.',
    possibleStresses: [
      { type: 'add-product', target: 'NH₃' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null }
    ]
  },

  // ==================== ADVANCED LEVEL (8) ====================

  // Equilibrium 23: Coupled Carbon Equilibria
  {
    id: 23,
    equation: '2C(s) + O₂(g) ⇌ 2CO(g)',
    name: 'Coupled Carbon Equilibria',
    nameIs: 'Samtengt kolefnishvarf',
    difficulty: 'advanced',
    reactants: [
      { formula: 'C', coefficient: 2, phase: 's', display: '⚫' },
      { formula: 'O₂', coefficient: 1, phase: 'g', display: '🔴' }
    ],
    products: [
      { formula: 'CO', coefficient: 2, phase: 'g', display: '⚫🔴' }
    ],
    thermodynamics: {
      deltaH: -221,
      type: 'exothermic'
    },
    gasMoles: {
      reactants: 1,
      products: 2
    },
    description: 'Complex coupled reactions in combustion processes.',
    descriptionIs: 'Flókin samtenging hvarfa í brennsluferli.',
    possibleStresses: [
      { type: 'add-reactant', target: 'O₂' },
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null },
      { type: 'increase-pressure', target: null }
    ]
  },

  // Equilibrium 24: Buffer System (Acetic Acid)
  {
    id: 24,
    equation: 'CH₃COOH(aq) + H₂O(l) ⇌ CH₃COO⁻(aq) + H₃O⁺(aq)',
    name: 'Buffer System (Acetic Acid)',
    nameIs: 'Bufferkerfi (ediksýra)',
    difficulty: 'advanced',
    reactants: [
      { formula: 'CH₃COOH', coefficient: 1, phase: 'aq', display: '🧪' },
      { formula: 'H₂O', coefficient: 1, phase: 'l', display: '💧' }
    ],
    products: [
      { formula: 'CH₃COO⁻', coefficient: 1, phase: 'aq', display: '🧪⁻' },
      { formula: 'H₃O⁺', coefficient: 1, phase: 'aq', display: '⊕' }
    ],
    thermodynamics: {
      deltaH: 0,
      type: 'exothermic'
    },
    gasMoles: {
      reactants: 0,
      products: 0
    },
    description: 'Buffer system that maintains stable pH.',
    descriptionIs: 'Bufferkerfi sem viðheldur pH stöðugu.',
    possibleStresses: [
      { type: 'add-product', target: 'H₃O⁺' },
      { type: 'add-product', target: 'CH₃COO⁻' }
    ]
  },

  // Equilibrium 25: Temperature-Dependent K (Haber)
  {
    id: 25,
    equation: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)',
    name: 'Temperature-Dependent K',
    nameIs: 'Hitastig háð K',
    difficulty: 'advanced',
    reactants: [
      { formula: 'N₂', coefficient: 1, phase: 'g', display: '🔵' },
      { formula: 'H₂', coefficient: 3, phase: 'g', display: '⚪' }
    ],
    products: [
      { formula: 'NH₃', coefficient: 2, phase: 'g', display: '🔷' }
    ],
    thermodynamics: {
      deltaH: -92,
      type: 'exothermic'
    },
    gasMoles: {
      reactants: 4,
      products: 2
    },
    description: 'How equilibrium constant changes with temperature.',
    descriptionIs: 'Hvernig jafnvægisfasti breytist með hitastigi.',
    possibleStresses: [
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null },
      { type: 'increase-pressure', target: null },
      { type: 'add-catalyst', target: null }
    ]
  },

  // Equilibrium 26: Pressure-Dependent Industrial Process
  {
    id: 26,
    equation: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)',
    name: 'Pressure-Dependent Industrial Process',
    nameIs: 'Þrýstings háð iðnaðarferli',
    difficulty: 'advanced',
    reactants: [
      { formula: 'N₂', coefficient: 1, phase: 'g', display: '🔵' },
      { formula: 'H₂', coefficient: 3, phase: 'g', display: '⚪' }
    ],
    products: [
      { formula: 'NH₃', coefficient: 2, phase: 'g', display: '🔷' }
    ],
    thermodynamics: {
      deltaH: -92,
      type: 'exothermic'
    },
    gasMoles: {
      reactants: 4,
      products: 2
    },
    description: 'Real industrial optimization with trade-offs.',
    descriptionIs: 'Raunveruleg iðnaðarbestun með mótsögnum.',
    possibleStresses: [
      { type: 'increase-pressure', target: null },
      { type: 'decrease-pressure', target: null },
      { type: 'increase-temp', target: null },
      { type: 'add-catalyst', target: null }
    ]
  },

  // Equilibrium 27: Simultaneous Equilibria
  {
    id: 27,
    equation: 'H₃PO₄(aq) ⇌ H⁺(aq) + H₂PO₄⁻(aq)',
    name: 'Simultaneous Equilibria',
    nameIs: 'Samhliða jafnvægi',
    difficulty: 'advanced',
    reactants: [
      { formula: 'H₃PO₄', coefficient: 1, phase: 'aq', display: '🧪' }
    ],
    products: [
      { formula: 'H⁺', coefficient: 1, phase: 'aq', display: '⊕' },
      { formula: 'H₂PO₄⁻', coefficient: 1, phase: 'aq', display: '🧪⁻' }
    ],
    thermodynamics: {
      deltaH: 5,
      type: 'endothermic'
    },
    gasMoles: {
      reactants: 0,
      products: 0
    },
    description: 'Stepwise deprotonation of phosphoric acid.',
    descriptionIs: 'Þrepin deprotonun fosforsýru.',
    possibleStresses: [
      { type: 'add-product', target: 'H⁺' },
      { type: 'increase-temp', target: null }
    ]
  },

  // Equilibrium 28: Heterogeneous Catalysis
  {
    id: 28,
    equation: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)',
    name: 'Heterogeneous Catalysis',
    nameIs: 'Fjölyfirborðshvöt',
    difficulty: 'advanced',
    reactants: [
      { formula: 'N₂', coefficient: 1, phase: 'g', display: '🔵' },
      { formula: 'H₂', coefficient: 3, phase: 'g', display: '⚪' }
    ],
    products: [
      { formula: 'NH₃', coefficient: 2, phase: 'g', display: '🔷' }
    ],
    thermodynamics: {
      deltaH: -92,
      type: 'exothermic'
    },
    gasMoles: {
      reactants: 4,
      products: 2
    },
    description: 'How catalysts speed equilibrium without shifting it.',
    descriptionIs: 'Hvernig hvatar flýta fyrir jafnvægi án þess að hliðra því.',
    possibleStresses: [
      { type: 'add-catalyst', target: null },
      { type: 'increase-temp', target: null },
      { type: 'increase-pressure', target: null }
    ]
  },

  // Equilibrium 29: Le Chatelier in Biology
  {
    id: 29,
    equation: 'Hb(aq) + 4O₂(g) ⇌ Hb(O₂)₄(aq)',
    name: 'Le Chatelier in Biology',
    nameIs: 'Le Chatelier í líffræði',
    difficulty: 'advanced',
    reactants: [
      { formula: 'Hb', coefficient: 1, phase: 'aq', display: '🔴' },
      { formula: 'O₂', coefficient: 4, phase: 'g', display: '🔴' }
    ],
    products: [
      { formula: 'Hb(O₂)₄', coefficient: 1, phase: 'aq', display: '🔴💧' }
    ],
    thermodynamics: {
      deltaH: -50,
      type: 'exothermic'
    },
    gasMoles: {
      reactants: 4,
      products: 0
    },
    description: 'Hemoglobin binding oxygen in blood.',
    descriptionIs: 'Hemóglóbín binding súrefnis í blóði.',
    possibleStresses: [
      { type: 'add-reactant', target: 'O₂' },
      { type: 'remove-reactant', target: 'O₂' },
      { type: 'increase-temp', target: null },
      { type: 'increase-pressure', target: null }
    ]
  },

  // Equilibrium 30: Industrial Optimization Problem
  {
    id: 30,
    equation: '2SO₂(g) + O₂(g) ⇌ 2SO₃(g)',
    name: 'Industrial Optimization Problem',
    nameIs: 'Iðnaðarbestunarverkefni',
    difficulty: 'advanced',
    reactants: [
      { formula: 'SO₂', coefficient: 2, phase: 'g', display: '💛' },
      { formula: 'O₂', coefficient: 1, phase: 'g', display: '🔴' }
    ],
    products: [
      { formula: 'SO₃', coefficient: 2, phase: 'g', display: '🟡' }
    ],
    thermodynamics: {
      deltaH: -198,
      type: 'exothermic'
    },
    gasMoles: {
      reactants: 3,
      products: 2
    },
    description: 'Real industrial decision-making with multiple variables.',
    descriptionIs: 'Raunveruleg iðnaðarákvörðun með mörgum breytum.',
    possibleStresses: [
      { type: 'increase-temp', target: null },
      { type: 'decrease-temp', target: null },
      { type: 'increase-pressure', target: null },
      { type: 'add-catalyst', target: null }
    ]
  }
];

// Helper functions
export const getEquilibriumById = (id: number): Equilibrium | undefined => {
  return equilibria.find(eq => eq.id === id);
};

export const getEquilibriaByDifficulty = (difficulty: DifficultyLevel): Equilibrium[] => {
  return equilibria.filter(eq => eq.difficulty === difficulty);
};

export const getRandomEquilibrium = (difficulty?: DifficultyLevel): Equilibrium => {
  const pool = difficulty ? getEquilibriaByDifficulty(difficulty) : equilibria;
  return pool[Math.floor(Math.random() * pool.length)];
};
