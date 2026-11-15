import { formatDecimal, molarMassOf } from '@shared/utils';

import { CHEMICALS } from '../data';
import { type Chemical, type Problem } from '../types';
import { formatAnswer } from './validation';

/**
 * Concentration units other than molarity, from the book's ch03/m68704
 * ("Aðrar einingar fyrir styrk lausna") and, for mole fraction, ch11/m68783.
 * Year-1 plan item 15 (2026-11-15).
 *
 * Every problem is built from the masses it prints, and the answer is the
 * exact value of those masses. Each also carries the wrong routes a student
 * is likely to take, so the feedback can say which one they took; the
 * generators keep every wrong route outside the 2 % tolerance of the answer.
 */

export type UnitProblemType = 'massPercent' | 'ppm' | 'moleFraction';

const n = (value: number): string => formatDecimal(value);

/** Two significant figures, the precision a lab measurement here is quoted to. */
function twoSig(value: number): number {
  return Number.parseFloat(value.toPrecision(2));
}

function between(lo: number, hi: number): number {
  return lo + Math.random() * (hi - lo);
}

const WATER_MOLAR_MASS = Number.parseFloat(molarMassOf('H₂O').toFixed(2));

/** Solids that dissolve well enough to make a percent-strength solution. */
function percentSolutes(): Chemical[] {
  return [...CHEMICALS.simple, ...CHEMICALS.medium, ...CHEMICALS.hard].filter(
    (c) => c.form === 'solid' && c.maxMolarity >= 1
  ) as Chemical[];
}

export function generateMassPercentProblem(): Problem {
  const pool = percentSolutes();
  const chemical = pool[Math.floor(Math.random() * pool.length)];
  const water = Math.round(between(100, 400) / 10) * 10;
  // At most about 80 % of what dissolves (maxMolarity read as per litre of
  // water), and at least 8 % of the water's mass, so that dividing by the water
  // alone lands outside the tolerance.
  const ceiling = Math.min(40, 0.8 * chemical.maxMolarity * chemical.molarMass * (water / 1000));
  const solute = Math.round(between(0.08 * water, Math.max(0.08 * water, ceiling)));
  const solution = solute + water;
  const answer = (solute / solution) * 100;
  return {
    id: crypto.randomUUID(),
    type: 'massPercent',
    chemical,
    description: 'Massaprósenta',
    given: { solute, water },
    question: `Þú leysir ${solute} g af ${chemical.displayName} í ${water} g af vatni. Hver er massaprósenta ${chemical.name} í lausninni?`,
    answer,
    unit: '%',
    difficulty: 'hard',
    hints: [
      'Massaprósenta = (massi efnis / massi lausnar) × 100 %',
      `Massi lausnar = massi efnis + massi vatns = ${solute} g + ${water} g = ${solution} g`,
      `Massaprósenta = (${solute} / ${solution}) × 100 % = ${formatAnswer(answer)} %`,
    ],
    steps: [
      { title: 'Gefið:', lines: [`Massi efnis: ${solute} g`, `Massi vatns: ${water} g`] },
      {
        title: 'Skref 1: Massi lausnarinnar',
        lines: [`Lausnin er efnið og vatnið saman: ${solute} g + ${water} g = ${solution} g`],
      },
      {
        title: 'Skref 2: Hlutfall sem prósenta',
        lines: [`(${solute} g / ${solution} g) × 100 % = ${formatAnswer(answer)} %`],
      },
    ],
    wrongRoutes: [
      {
        value: (solute / water) * 100,
        message:
          'Þú deildir með massa vatnsins. Massaprósenta deilir með massa lausnarinnar, sem er efnið og vatnið saman.',
      },
    ],
  };
}

interface Trace {
  nom: string;
  dat: string;
  gen: string;
}

/** Trace substances in water, as the book's ppm and ppb examples have them. */
const TRACES: Trace[] = [
  { nom: 'blý', dat: 'blýi', gen: 'blýs' },
  { nom: 'kvikasilfur', dat: 'kvikasilfri', gen: 'kvikasilfurs' },
  { nom: 'flúoríð', dat: 'flúoríði', gen: 'flúoríðs' },
  { nom: 'nítrat', dat: 'nítrati', gen: 'nítrats' },
  { nom: 'arsen', dat: 'arseni', gen: 'arsens' },
];

export function generatePpmProblem(): Problem {
  const trace = TRACES[Math.floor(Math.random() * TRACES.length)];
  const sample = Math.round(between(50, 500) / 10) * 10;
  const ppb = Math.random() < 0.4;
  // The trace's mass in mg for ppm, in µg for ppb; one unit step either way.
  const unitMass = ppb ? 'µg' : 'mg';
  const toGrams = ppb ? 1e-6 : 1e-3;
  const factor = ppb ? 1e9 : 1e6;
  const target = ppb ? between(5, 800) : between(0.5, 60);
  const traceMass = twoSig((target * sample) / factor / toGrams);
  const answer = ((traceMass * toGrams) / sample) * factor;
  const unit = ppb ? 'ppb' : 'ppm';
  const power = ppb ? '10⁹' : '10⁶';
  return {
    id: crypto.randomUUID(),
    type: 'ppm',
    description: ppb ? 'Milljarðshlutar (ppb)' : 'Milljónustu hlutar (ppm)',
    given: { sample, traceMass },
    question: `${n(sample)} g sýni af vatni inniheldur ${n(traceMass)} ${unitMass} af ${trace.dat}. Hver er styrkur ${trace.gen} í ${unit}?`,
    answer,
    unit,
    difficulty: 'hard',
    hints: [
      `${unit} = (massi efnis / massi lausnar) × ${power}, báðir massar í sömu einingu`,
      `${n(traceMass)} ${unitMass} = ${formatAnswer(traceMass * toGrams)} g`,
      `${unit} = (${formatAnswer(traceMass * toGrams)} / ${n(sample)}) × ${power} = ${formatAnswer(answer)} ${unit}`,
    ],
    steps: [
      {
        title: 'Gefið:',
        lines: [`Massi sýnis: ${n(sample)} g`, `Massi ${trace.gen}: ${n(traceMass)} ${unitMass}`],
      },
      {
        title: 'Skref 1: Sama massaeining',
        lines: [`${n(traceMass)} ${unitMass} = ${formatAnswer(traceMass * toGrams)} g`],
      },
      {
        title: `Skref 2: Hlutfall × ${power}`,
        lines: [
          `(${formatAnswer(traceMass * toGrams)} g / ${n(sample)} g) × ${power} = ${formatAnswer(answer)} ${unit}`,
        ],
      },
    ],
    // For ppm, forgetting mg → g and multiplying by 10⁹ both give 1000 times
    // the answer, so one message names both.
    wrongRoutes: ppb
      ? [
          {
            value: answer * 1e6,
            message: 'Massarnir verða að vera í sömu einingu: breyttu µg í g áður en þú deilir.',
          },
          {
            value: answer / 1000,
            message:
              'Þetta er svarið í ppm. ppb margfaldar með 10⁹, svo talan er 1000 sinnum hærri en í ppm.',
          },
        ]
      : [
          {
            value: answer * 1000,
            message:
              'Talan er 1000 sinnum of há. Massarnir verða að vera í sömu einingu (breyttu mg í g áður en þú deilir), og ppm margfaldar með 10⁶, ekki 10⁹.',
          },
        ],
  };
}

interface MolecularSolute {
  name: string;
  /** As printed. */
  formula: string;
  /** As weighed, written without the hydroxyl group so `molarMassOf` reads it. */
  weighed: string;
  dat: string;
  gen: string;
  /** Highest moles per mole of water that dissolve; the alcohols mix freely. */
  maxRatio: number;
}

const MOLECULAR: MolecularSolute[] = [
  {
    name: 'etanól',
    formula: 'C₂H₅OH',
    weighed: 'C₂H₆O',
    dat: 'etanóli',
    gen: 'etanóls',
    maxRatio: 0.4,
  },
  {
    name: 'metanól',
    formula: 'CH₃OH',
    weighed: 'CH₄O',
    dat: 'metanóli',
    gen: 'metanóls',
    maxRatio: 0.4,
  },
  {
    name: 'glúkósi',
    formula: 'C₆H₁₂O₆',
    weighed: 'C₆H₁₂O₆',
    dat: 'glúkósa',
    gen: 'glúkósa',
    maxRatio: 0.08,
  },
  {
    name: 'glýseról',
    formula: 'C₃H₈O₃',
    weighed: 'C₃H₈O₃',
    dat: 'glýseróli',
    gen: 'glýseróls',
    maxRatio: 0.4,
  },
];

export function generateMoleFractionProblem(): Problem {
  const solute = MOLECULAR[Math.floor(Math.random() * MOLECULAR.length)];
  const molarMass = Number.parseFloat(molarMassOf(solute.weighed).toFixed(2));
  const water = Math.round(between(50, 200) / 10) * 10;
  const nWater = water / WATER_MOLAR_MASS;
  // Moles of solute at least 5 % of the water's, so that dividing by the
  // water's moles alone lands outside the tolerance, and no more than dissolves
  // (glucose, about 90 g in 100 g of water at room temperature).
  const ratio = between(0.05, solute.maxRatio);
  const mass = Math.max(1, Math.round(ratio * nWater * molarMass));
  const nSolute = mass / molarMass;
  const answer = nSolute / (nSolute + nWater);
  return {
    id: crypto.randomUUID(),
    type: 'moleFraction',
    description: 'Mólhlutfall',
    given: { mass, molarMass, water },
    question: `Lausn er búin til úr ${mass} g af ${solute.dat} (${solute.formula}, mólmassi ${n(molarMass)} g/mól) og ${water} g af vatni (mólmassi ${n(WATER_MOLAR_MASS)} g/mól). Hvert er mólhlutfall ${solute.gen}?`,
    answer,
    unit: '',
    difficulty: 'hard',
    hints: [
      'Mólhlutfall efnis = mól efnisins / mól allra efna í lausninni',
      `mól ${solute.gen} = ${mass} / ${n(molarMass)} = ${formatAnswer(nSolute)}; mól vatns = ${water} / ${n(WATER_MOLAR_MASS)} = ${formatAnswer(nWater)}`,
      `Mólhlutfall = ${formatAnswer(nSolute)} / (${formatAnswer(nSolute)} + ${formatAnswer(nWater)}) = ${formatAnswer(answer)}`,
    ],
    steps: [
      {
        title: 'Gefið:',
        lines: [
          `${mass} g af ${solute.dat}, ${n(molarMass)} g/mól`,
          `${water} g af vatni, ${n(WATER_MOLAR_MASS)} g/mól`,
        ],
      },
      {
        title: 'Skref 1: Mól hvors efnis',
        lines: [
          `mól ${solute.gen} = ${mass} g / ${n(molarMass)} g/mól = ${formatAnswer(nSolute)} mól`,
          `mól vatns = ${water} g / ${n(WATER_MOLAR_MASS)} g/mól = ${formatAnswer(nWater)} mól`,
        ],
      },
      {
        title: 'Skref 2: Deilt með heildarfjölda móla',
        lines: [
          `${formatAnswer(nSolute)} / (${formatAnswer(nSolute)} + ${formatAnswer(nWater)}) = ${formatAnswer(answer)}`,
          'Mólhlutfall hefur enga einingu, og mólhlutföll allra efna í lausninni eru samtals 1.',
        ],
      },
    ],
    wrongRoutes: [
      {
        value: mass / (mass + water),
        message:
          'Þú notaðir grömm. Mólhlutfall er reiknað úr mólum: breyttu hvorum massa í mól fyrst.',
      },
      {
        value: nSolute / nWater,
        message:
          'Þú deildir með mólum vatnsins. Mólhlutfall deilir með heildarfjölda móla, efnisins og vatnsins saman.',
      },
    ],
  };
}

export function generateUnitProblem(type: UnitProblemType): Problem {
  switch (type) {
    case 'massPercent':
      return generateMassPercentProblem();
    case 'ppm':
      return generatePpmProblem();
    case 'moleFraction':
      return generateMoleFractionProblem();
  }
}
