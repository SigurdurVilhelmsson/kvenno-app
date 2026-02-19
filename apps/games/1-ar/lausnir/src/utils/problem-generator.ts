import { Problem, Difficulty, ProblemType, Chemical } from '../types';
import { CHEMICALS } from '../data';

export function generateProblem(difficulty: Difficulty): Problem {
  const problemTypes: ProblemType[] = [
    'dilution',
    'molarity',
    'mixing',
    'molarityFromMass',
    'massFromMolarity'
  ];

  const availableTypes = difficulty === 'easy'
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
  const chemical = chemicalSet[Math.floor(Math.random() * chemicalSet.length)];

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

function generateDilutionProblem(difficulty: Difficulty, chemical: Chemical): Problem {
  if (difficulty === 'easy') {
    const M1 = Math.round(Math.random() * 4 + 1);
    const V1 = Math.round(Math.random() * 90 + 10);
    const V2 = Math.round(Math.random() * 400 + 100);
    const M2 = parseFloat(((M1 * V1) / V2).toFixed(3));

    return {
      id: Math.random().toString(),
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
        `M₂ = ${M2.toFixed(3)} M`
      ]
    };
  } else {
    const M1 = parseFloat((Math.random() * 4.5 + 0.5).toFixed(2));
    const V1 = Math.round(Math.random() * 45 + 5);
    const V2 = Math.round(Math.random() * 450 + 50);
    const M2 = parseFloat(((M1 * V1) / V2).toFixed(4));

    return {
      id: Math.random().toString(),
      type: 'dilution',
      chemical,
      description: 'Nákvæm útþynning',
      given: { M1, V1, V2 },
      question: `Þú þarft að útbúa ${V2} mL af ${M2.toFixed(3)} M ${chemical.name} lausn með því að þynna ${M1} M stofnlausn. Hversu mikið þarftu af stofnlausninni?`,
      answer: V1,
      unit: 'mL',
      difficulty: difficulty,
      hints: [
        'V₁ = (M₂ × V₂) / M₁',
        `V₁ = (${M2.toFixed(3)} × ${V2}) / ${M1}`,
        `V₁ = ${V1} mL`
      ]
    };
  }
}

function generateMolarityProblem(difficulty: Difficulty, chemical: Chemical): Problem {
  const moles = parseFloat((Math.random() * 1.9 + 0.1).toFixed(2));
  const volume = parseFloat((Math.random() * 0.9 + 0.1).toFixed(2));
  const molarity = parseFloat((moles / volume).toFixed(3));

  return {
    id: Math.random().toString(),
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
      `M = ${molarity.toFixed(3)} M`
    ]
  };
}

function generateMolarityFromMassProblem(difficulty: Difficulty, chemical: Chemical): Problem {
  const massInGrams = Math.round(Math.random() * 90 + 10);
  const volumeInML = Math.round(Math.random() * 450 + 50);
  const moles = massInGrams / chemical.molarMass;
  const volumeInL = volumeInML / 1000;
  const molarity = parseFloat((moles / volumeInL).toFixed(3));

  return {
    id: Math.random().toString(),
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
      `mól = ${massInGrams} / ${chemical.molarMass} = ${moles.toFixed(3)}; L = ${volumeInML}/1000 = ${volumeInL.toFixed(3)}`,
      `M = ${moles.toFixed(3)} / ${volumeInL.toFixed(3)} = ${molarity.toFixed(3)} M`
    ]
  };
}

function generateMassFromMolarityProblem(difficulty: Difficulty, chemical: Chemical): Problem {
  const molarity = parseFloat((Math.random() * 2 + 0.5).toFixed(2));
  const volumeInML = Math.round(Math.random() * 400 + 100);
  const volumeInL = volumeInML / 1000;
  const moles = molarity * volumeInL;
  const mass = parseFloat((moles * chemical.molarMass).toFixed(1));

  return {
    id: Math.random().toString(),
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
      `mól = ${molarity} × ${volumeInL.toFixed(3)} = ${moles.toFixed(3)}`,
      `massi = ${moles.toFixed(3)} × ${chemical.molarMass} = ${mass.toFixed(1)} g`
    ]
  };
}

function generateMixingProblem(difficulty: Difficulty, chemical: Chemical): Problem {
  const M1 = parseFloat((Math.random() * 4 + 1).toFixed(2));
  const V1 = Math.round(Math.random() * 90 + 10);
  const M2 = parseFloat((Math.random() * 4 + 1).toFixed(2));
  const V2 = Math.round(Math.random() * 90 + 10);

  const totalMoles = (M1 * V1 + M2 * V2) / 1000;
  const totalVolume = (V1 + V2) / 1000;
  const finalMolarity = parseFloat((totalMoles / totalVolume).toFixed(3));

  return {
    id: Math.random().toString(),
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
      `M = ${finalMolarity.toFixed(3)} M`
    ]
  };
}
