import { CHEMICALS } from '../data';
import { Problem, Difficulty, ProblemType, Chemical } from '../types';

export function generateProblem(difficulty: Difficulty): Problem {
  const problemTypes: ProblemType[] = [
    'dilution',
    'molarity',
    'mixing',
    'molarityFromMass',
    'massFromMolarity',
  ];

  const availableTypes =
    difficulty === 'easy'
      ? ['dilution', 'molarity', 'molarityFromMass' as ProblemType]
      : problemTypes;

  const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];

  // Get appropriate chemical
  const chemicalSet =
    difficulty === 'easy'
      ? CHEMICALS.simple
      : difficulty === 'medium'
        ? CHEMICALS.medium
        : CHEMICALS.hard;

  // 'molarity' and 'molarityFromMass' both open "Þú leysir ... af X" — they
  // instruct the student to measure out the pure substance and dissolve it.
  // Only a solid can be handled that way. The liquids and the one gas arrive as
  // bought stock solutions, so they stay in dilution, mixing and
  // massFromMolarity, which ask what a solution contains rather than telling the
  // student to make one from the pure substance.
  const dissolvesPureSubstance = type === 'molarity' || type === 'molarityFromMass';
  // Both restrictions apply to the same two types. molarityFromMass prints the
  // mass outright; molarity states the same quantity in moles — "Þú leysir
  // 0.00079 mól af Ca(OH)₂" is 58 mg on the balance, no more carryable out for
  // being unprinted.
  const pool = chemicalSet.filter(
    (c) => !dissolvesPureSubstance || (c.form === 'solid' && canBeWeighedOut(c))
  );
  const chemical = pool[Math.floor(Math.random() * pool.length)];
  if (!chemical) {
    // Unreachable with the shipped data — every difficulty keeps at least two
    // qualifying solids, which weighable-substances.test.ts asserts directly.
    // Failing here makes a future data edit that empties a pool obvious, rather
    // than rendering "Þú leysir undefined g" to a student.
    throw new Error(`Enginn hentugur efnaskostur fyrir ${type} (${difficulty})`);
  }

  switch (type) {
    case 'dilution':
      return generateDilutionProblem(difficulty, chemical);
    case 'molarity':
      return generateMolarityProblem(difficulty, chemical);
    case 'molarityFromMass':
      return generateMolarityFromMassProblem(difficulty, chemical);
    case 'massFromMolarity':
      return generateMassFromMolarityProblem(difficulty, chemical);
    case 'mixing':
      return generateMixingProblem(difficulty, chemical);
    default:
      return generateDilutionProblem(difficulty, chemical);
  }
}

/**
 * Smallest mass worth putting in front of a student. A school balance reads to
 * 0.01 g, so below about this the measurement is mostly its own error.
 */
const MIN_WEIGHABLE_G = 0.1;

/**
 * Can this substance yield a weighable mass across the whole range
 * generateMolarityFromMassProblem draws from?
 *
 * Derived rather than hand-flagged, so lowering a `maxMolarity` later drops the
 * substance out of the mass problems by itself instead of quietly asking for
 * milligrams. The worst case is the generator's lowest molarity — `drawMolarity`
 * floors at a fifth of the ceiling — at its smallest volume, 50 mL.
 */
function canBeWeighedOut(chemical: Chemical): boolean {
  const lowestMolarity = Math.min(0.2, Math.min(4, chemical.maxMolarity) * 0.2);
  return lowestMolarity * 0.05 * chemical.molarMass >= MIN_WEIGHABLE_G;
}

/** Round to a precision that stays readable for 29 g and for 0.37 g alike. */
function roundQuantity(value: number): number {
  if (value >= 10) return Math.round(value);
  if (value >= 1) return parseFloat(value.toFixed(1));
  return parseFloat(value.toPrecision(2));
}

/**
 * Round a quantity DOWN at the same precision. Used where the quantity is what
 * determines the molarity: rounding to two significant figures can round up, and
 * a value already at the ceiling then crosses it by a few percent.
 */
function floorQuantity(value: number): number {
  if (value >= 10) return Math.floor(value);
  if (value >= 1) return Math.floor(value * 10) / 10;
  if (value <= 0) return 0;
  const magnitude = Math.pow(10, Math.ceil(-Math.log10(value)) + 1);
  return Math.floor(value * magnitude) / magnitude;
}

/** Format a quantity for a hint line without rounding a small one away to 0.000. */
function fmt(value: number): string {
  if (value === 0) return '0';
  if (Math.abs(value) < 0.01) return value.toPrecision(2);
  if (Math.abs(value) < 1) return parseFloat(value.toFixed(3)).toString();
  if (Math.abs(value) < 10) return parseFloat(value.toFixed(2)).toString();
  return parseFloat(value.toFixed(1)).toString();
}

/**
 * Draw a molarity this substance can actually reach.
 *
 * Every generator used to draw its concentrations from a fixed range with no
 * reference to what dissolves, so the game asked students to work out the
 * concentration of solutions that cannot exist: up to 54 M HCl against a real
 * limit of 12 M, and any molarity at all of Ca(OH)2, which saturates at 0.022 M.
 * The requested band is kept where the ceiling allows it and compressed under
 * the ceiling where it does not.
 */
function drawMolarity(chemical: Chemical, lo: number, hi: number): number {
  const top = Math.min(hi, chemical.maxMolarity);
  const bottom = Math.min(lo, top * 0.2);
  return roundQuantity(bottom + Math.random() * (top - bottom));
}

function generateDilutionProblem(difficulty: Difficulty, chemical: Chemical): Problem {
  if (difficulty === 'easy') {
    const M1 = drawMolarity(chemical, 1, 5);
    const V1 = Math.round(Math.random() * 90 + 10);
    const V2 = Math.round(Math.random() * 400 + 100);
    const M2 = parseFloat(((M1 * V1) / V2).toFixed(3));

    return {
      id: crypto.randomUUID(),
      type: 'dilution',
      chemical,
      description: 'Útþynning',
      given: { M1, V1, V2 },
      question: `Þú ert með ${V1} mL af ${M1} M ${chemical.name} lausn. Þú bætir við vatni þannig að endanlegt rúmmál verður ${V2} mL. Hver er endanlegur mólstyrkur?`,
      answer: M2,
      unit: 'M',
      difficulty: 'easy',
      hints: [
        'Notaðu M₁V₁ = M₂V₂',
        `M₂ = (M₁ × V₁) / V₂ = (${M1} × ${V1}) / ${V2}`,
        `M₂ = ${M2.toFixed(3)} M`,
      ],
    };
  } else {
    const M1 = drawMolarity(chemical, 0.5, 5);
    const V1 = Math.round(Math.random() * 45 + 5);
    const V2 = Math.round(Math.random() * 450 + 50);
    const M2 = parseFloat(((M1 * V1) / V2).toFixed(4));

    return {
      id: crypto.randomUUID(),
      type: 'dilution',
      chemical,
      description: 'Nákvæm útþynning',
      given: { M1, V1, V2 },
      question: `Þú þarft að útbúa ${V2} mL af ${M2.toFixed(3)} M ${chemical.name} lausn með því að þynna ${M1} M stofnlausn. Hversu mikið þarftu af stofnlausninni?`,
      answer: V1,
      unit: 'mL',
      difficulty: difficulty,
      hints: ['V₁ = (M₂ × V₂) / M₁', `V₁ = (${M2.toFixed(3)} × ${V2}) / ${M1}`, `V₁ = ${V1} mL`],
    };
  }
}

function generateMolarityProblem(difficulty: Difficulty, chemical: Chemical): Problem {
  const volume = parseFloat((Math.random() * 0.9 + 0.1).toFixed(2));
  const moles = floorQuantity(drawMolarity(chemical, 0.1, 5) * volume);
  const molarity = parseFloat((moles / volume).toFixed(3));

  return {
    id: crypto.randomUUID(),
    type: 'molarity',
    chemical,
    description: 'Reikna mólstyrk',
    given: { moles, volume },
    question: `Þú leysir ${moles} mól af ${chemical.name} í ${volume} L af lausn. Hver er mólstyrkurinn?`,
    answer: molarity,
    unit: 'M',
    difficulty: difficulty,
    hints: [
      'Mólstyrkur (M) = mól / lítrar',
      `M = ${moles} / ${volume}`,
      `M = ${molarity.toFixed(3)} M`,
    ],
  };
}

function generateMolarityFromMassProblem(difficulty: Difficulty, chemical: Chemical): Problem {
  const volumeInML = Math.round(Math.random() * 450 + 50);
  const volumeInL = volumeInML / 1000;
  const massInGrams = floorQuantity(
    drawMolarity(chemical, 0.2, 4) * volumeInL * chemical.molarMass
  );
  const moles = massInGrams / chemical.molarMass;
  const molarity = parseFloat((moles / volumeInL).toFixed(3));

  return {
    id: crypto.randomUUID(),
    type: 'molarityFromMass',
    chemical,
    description: 'Reikna mólstyrk út frá massa',
    given: { massInGrams, molarMass: chemical.molarMass, volumeInML },
    question: `Þú leysir ${massInGrams} g af ${chemical.displayName} (mólmassi ${chemical.molarMass} g/mol) í ${volumeInML} mL af lausn. Hver er mólstyrkurinn?`,
    answer: molarity,
    unit: 'M',
    difficulty: difficulty,
    hints: [
      'Fyrst reiknaðu mól = g / (g/mol), síðan M = mól / L',
      `mól = ${massInGrams} / ${chemical.molarMass} = ${fmt(moles)}; L = ${volumeInML}/1000 = ${volumeInL.toFixed(3)}`,
      `M = ${fmt(moles)} / ${volumeInL.toFixed(3)} = ${fmt(molarity)} M`,
    ],
  };
}

function generateMassFromMolarityProblem(difficulty: Difficulty, chemical: Chemical): Problem {
  const molarity = drawMolarity(chemical, 0.5, 2.5);
  const volumeInML = Math.round(Math.random() * 400 + 100);
  const volumeInL = volumeInML / 1000;
  const moles = molarity * volumeInL;
  const mass = roundQuantity(moles * chemical.molarMass);

  return {
    id: crypto.randomUUID(),
    type: 'massFromMolarity',
    chemical,
    description: 'Reikna massa út frá mólstyrk',
    given: { molarity, volumeInML, molarMass: chemical.molarMass },
    question: `Þú ert með ${volumeInML} mL af ${molarity} M ${chemical.name} lausn. Hversu mörg grömm af ${chemical.name} eru í lausninni? (mólmassi ${chemical.molarMass} g/mol)`,
    answer: mass,
    unit: 'g',
    difficulty: difficulty,
    hints: [
      'Fyrst reiknaðu mól = M × L, síðan massi = mól × mólmassi',
      `mól = ${molarity} × ${volumeInL.toFixed(3)} = ${fmt(moles)}`,
      `massi = ${fmt(moles)} × ${chemical.molarMass} = ${fmt(mass)} g`,
    ],
  };
}

function generateMixingProblem(difficulty: Difficulty, chemical: Chemical): Problem {
  const M1 = drawMolarity(chemical, 1, 5);
  const V1 = Math.round(Math.random() * 90 + 10);
  const M2 = drawMolarity(chemical, 1, 5);
  const V2 = Math.round(Math.random() * 90 + 10);

  const totalMoles = (M1 * V1 + M2 * V2) / 1000;
  const totalVolume = (V1 + V2) / 1000;
  const finalMolarity = parseFloat((totalMoles / totalVolume).toFixed(3));

  return {
    id: crypto.randomUUID(),
    type: 'mixing',
    chemical,
    description: 'Blanda tvær lausnir',
    given: { M1, V1, M2, V2 },
    question: `Þú blandar ${V1} mL af ${M1} M ${chemical.name} lausn með ${V2} mL af ${M2} M ${chemical.name} lausn. Hver er mólstyrkur blöndunnar?`,
    answer: finalMolarity,
    unit: 'M',
    difficulty: difficulty,
    hints: [
      'M_lokal = (M₁V₁ + M₂V₂) / (V₁ + V₂)',
      `M = (${M1}×${V1} + ${M2}×${V2}) / (${V1}+${V2})`,
      `M = ${finalMolarity.toFixed(3)} M`,
    ],
  };
}
