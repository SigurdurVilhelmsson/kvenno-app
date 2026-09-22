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
 * Get variable name in Icelandic
 */
export function getVariableName(variable: Variable): string {
  const names = {
    P: 'Þrýstingur',
    V: 'Rúmmál',
    T: 'Hiti',
    n: 'Mólfjöldi',
  };
  return names[variable];
}
