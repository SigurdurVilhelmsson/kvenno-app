import { formatDecimal, parseStudentNumber } from '@shared/utils';

import { Variable, GasValue, GasLawQuestion, R } from '../types';

/**
 * Solve ideal gas law PV = nRT for any variable
 */
export function solveGasLaw(
  given: { P?: GasValue; V?: GasValue; T?: GasValue; n?: GasValue },
  find: Variable
): number {
  const P = given.P?.value;
  const V = given.V?.value;
  const T = given.T?.value;
  const n = given.n?.value;

  switch (find) {
    case 'P':
      if (n && T && V) return (n * R * T) / V;
      break;
    case 'V':
      if (n && T && P) return (n * R * T) / P;
      break;
    case 'T':
      if (P && V && n) return (P * V) / (n * R);
      break;
    case 'n':
      if (P && V && T) return (P * V) / (R * T);
      break;
  }

  throw new Error(`Cannot solve for ${find} with given values`);
}

/**
 * Check if answer is within tolerance
 */
export function checkAnswer(userAnswer: number, correctAnswer: number, tolerance: number): boolean {
  return Math.abs(userAnswer - correctAnswer) <= tolerance;
}

/**
 * Calculate percentage error
 */
export function calculateError(userAnswer: number, correctAnswer: number): number {
  return Math.abs((userAnswer - correctAnswer) / correctAnswer) * 100;
}

/**
 * Get the formula rearranged for the given variable
 */
export function getFormula(find: Variable): string {
  const formulas = {
    P: 'P = nRT/V',
    V: 'V = nRT/P',
    T: 'T = PV/nR',
    n: 'n = PV/RT',
  };
  return formulas[find];
}

/**
 * Get unit label for variable
 */
export function getUnit(variable: Variable): string {
  const units = {
    P: 'atm',
    V: 'L',
    T: 'K',
    n: 'mol',
  };
  return units[variable];
}

/**
 * The unit a question states a variable in, falling back to the default.
 *
 * In the two-state laws the answer is the same quantity as one the question
 * gives — V₂ beside V₁ — so it takes the unit the question gives it in. Question
 * 14 states its syringe in mL and stores the answer in mL; labelling the answer
 * field with `getUnit('V')` put `L` beside it, and a student who converted to
 * match the label (0,004) was marked wrong.
 */
export function unitFor(question: GasLawQuestion, variable: Variable): string {
  return question.given[variable]?.unit ?? getUnit(variable);
}

/** The unit the question's answer is stored — and graded — in. */
export function answerUnit(question: GasLawQuestion): string {
  return unitFor(question, question.find);
}

/**
 * The answer as the worked solution writes it: the number `solution.calculation` ends on,
 * with its own significant figures (`4,0` mL, not `4`).
 *
 * The screens used to print `formatDecimal(answer, 2)`, which showed question 9's
 * 0,083 mol as `0,08` — a number the grader then rejected. The calculation's number is
 * checked against the stored answer here, and `answer-display.test.tsx` asserts the
 * fallback is never needed.
 */
export function answerText(question: GasLawQuestion): string {
  const numbers = question.solution.calculation.match(/\d+(?:,\d+)?/g);
  const last = numbers?.[numbers.length - 1];
  return last !== undefined && parseStudentNumber(last) === question.answer
    ? last
    : formatDecimal(question.answer);
}

/** Decimal places in a number as JavaScript writes it (`0.0805` → 4). */
function decimalPlaces(value: number): number {
  const text = String(value);
  if (text.includes('e')) return 6;
  return text.split('.')[1]?.length ?? 0;
}

/**
 * The gap between the student's answer and the correct one, written exactly: to as many
 * decimals as the more precise of the two, so float noise never shows and a near miss
 * never rounds to `0,00`.
 */
export function formatDifference(userAnswer: number, correctAnswer: number): string {
  const decimals = Math.max(decimalPlaces(userAnswer), decimalPlaces(correctAnswer));
  return formatDecimal(Math.abs(userAnswer - correctAnswer), decimals);
}

/**
 * Get variable name in Icelandic. Temperature is `hitastig`, as `ordabok.md` has it
 * (`temperature;hitastig`), not the everyday `hiti`.
 */
export function getVariableName(variable: Variable): string {
  const names = {
    P: 'Þrýstingur',
    V: 'Rúmmál',
    T: 'Hitastig',
    n: 'Mólfjöldi',
  };
  return names[variable];
}

/**
 * The variable's name in the accusative, for the middle of a sentence: `Finndu {name}`
 * and `Svar fyrir {name}` both govern the accusative. The label used to put the
 * nominative there (`Finndu Þrýstingur (P)`), and named temperature with the everyday
 * `hiti` where `ordabok.md` has `hitastig` — the word the game's own hints use.
 */
export function getVariableNameAccusative(variable: Variable): string {
  const names = {
    P: 'þrýsting',
    V: 'rúmmál',
    T: 'hitastig',
    n: 'mólfjölda',
  };
  return names[variable];
}
