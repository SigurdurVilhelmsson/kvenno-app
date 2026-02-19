/**
 * Level 2 Problems for Dimensional Analysis Game
 * Contains scaffolded problems for learning dimensional analysis with unit conversion
 */

/**
 * Represents a Level 2 problem - single or multi-step unit conversion with scaffolding
 */
export interface Level2Problem {
  /** Unique identifier for the problem */
  id: string;
  /** Difficulty level: scaffolded_high (most support), medium, or advanced (least support) */
  difficulty: 'scaffolded_high' | 'medium' | 'advanced';
  /** Context or question in Icelandic for the problem */
  context: string;
  /** Starting numerical value */
  startValue: number;
  /** Starting unit */
  startUnit: string;
  /** Target unit for conversion */
  targetUnit: string;
  /** Array of conversion factors in the correct sequence */
  correctPath: string[];
  /** Scaffolding level: 3 (most support), 2 (medium), or 1 (least support) */
  scaffoldingLevel: number;
}

/**
 * Level 2 Problems: Unit conversion exercises with varying difficulty levels
 * Problems progress from single-step conversions with high scaffolding to multi-step conversions with minimal support
 */
export const level2Problems: Level2Problem[] = [
  {
    id: 'L2-1',
    difficulty: 'scaffolded_high',
    context: 'Lyfjagjöf er 500 mg. Umbúðirnar sýna styrk í g.',
    startValue: 500,
    startUnit: 'mg',
    targetUnit: 'g',
    correctPath: ['1 g / 1000 mg'],
    scaffoldingLevel: 3
  },
  {
    id: 'L2-2',
    difficulty: 'scaffolded_high',
    context: 'Breyttu rúmmáli úr mL í L.',
    startValue: 2500,
    startUnit: 'mL',
    targetUnit: 'L',
    correctPath: ['1 L / 1000 mL'],
    scaffoldingLevel: 3
  },
  {
    id: 'L2-3',
    difficulty: 'scaffolded_high',
    context: 'Breyttu massa úr g í kg.',
    startValue: 3500,
    startUnit: 'g',
    targetUnit: 'kg',
    correctPath: ['1 kg / 1000 g'],
    scaffoldingLevel: 3
  },
  {
    id: 'L2-4',
    difficulty: 'scaffolded_high',
    context: 'Breyttu lengd úr cm í m.',
    startValue: 250,
    startUnit: 'cm',
    targetUnit: 'm',
    correctPath: ['1 m / 100 cm'],
    scaffoldingLevel: 3
  },
  {
    id: 'L2-5',
    difficulty: 'scaffolded_high',
    context: 'Breyttu massa úr kg í g.',
    startValue: 2.5,
    startUnit: 'kg',
    targetUnit: 'g',
    correctPath: ['1000 g / 1 kg'],
    scaffoldingLevel: 3
  },
  {
    id: 'L2-6',
    difficulty: 'medium',
    context: 'Breyttu lengd úr km í cm.',
    startValue: 0.5,
    startUnit: 'km',
    targetUnit: 'cm',
    correctPath: ['1000 m / 1 km', '100 cm / 1 m'],
    scaffoldingLevel: 2
  },
  {
    id: 'L2-7',
    difficulty: 'medium',
    context: 'Breyttu massa úr mg í kg.',
    startValue: 5000,
    startUnit: 'mg',
    targetUnit: 'kg',
    correctPath: ['1 g / 1000 mg', '1 kg / 1000 g'],
    scaffoldingLevel: 2
  },
  {
    id: 'L2-8',
    difficulty: 'medium',
    context: 'Breyttu hraða úr km/klst í m/s.',
    startValue: 90,
    startUnit: 'km/klst',
    targetUnit: 'm/s',
    correctPath: ['1000 m / 1 km', '1 klst / 3600 s'],
    scaffoldingLevel: 2
  },
  {
    id: 'L2-9',
    difficulty: 'medium',
    context: 'Breyttu tíma úr klst í s.',
    startValue: 2,
    startUnit: 'klst',
    targetUnit: 's',
    correctPath: ['3600 s / 1 klst'],
    scaffoldingLevel: 2
  },
  {
    id: 'L2-10',
    difficulty: 'medium',
    context: 'Breyttu lengd úr mm í km.',
    startValue: 5000000,
    startUnit: 'mm',
    targetUnit: 'km',
    correctPath: ['1 m / 1000 mm', '1 km / 1000 m'],
    scaffoldingLevel: 2
  },
  {
    id: 'L2-11',
    difficulty: 'advanced',
    context: 'Breyttu hraða úr m/s í km/klst.',
    startValue: 25,
    startUnit: 'm/s',
    targetUnit: 'km/klst',
    correctPath: ['1 km / 1000 m', '3600 s / 1 klst'],
    scaffoldingLevel: 1
  },
  {
    id: 'L2-12',
    difficulty: 'advanced',
    context: 'Breyttu lengd úr cm í km.',
    startValue: 150000,
    startUnit: 'cm',
    targetUnit: 'km',
    correctPath: ['1 m / 100 cm', '1 km / 1000 m'],
    scaffoldingLevel: 1
  },
  {
    id: 'L2-13',
    difficulty: 'advanced',
    context: 'Breyttu rúmmál úr mL í L og síðan aftur í mL með öðru gildi.',
    startValue: 500,
    startUnit: 'mL',
    targetUnit: 'L',
    correctPath: ['1 L / 1000 mL'],
    scaffoldingLevel: 1
  },
  {
    id: 'L2-14',
    difficulty: 'advanced',
    context: 'Breyttu tíma úr s í klst.',
    startValue: 7200,
    startUnit: 's',
    targetUnit: 'klst',
    correctPath: ['1 klst / 3600 s'],
    scaffoldingLevel: 1
  },
  {
    id: 'L2-15',
    difficulty: 'advanced',
    context: 'Breyttu eðlismassa úr g/mL í kg/L.',
    startValue: 1.5,
    startUnit: 'g/mL',
    targetUnit: 'kg/L',
    correctPath: ['1 kg / 1000 g', '1000 mL / 1 L'],
    scaffoldingLevel: 1
  }
];
