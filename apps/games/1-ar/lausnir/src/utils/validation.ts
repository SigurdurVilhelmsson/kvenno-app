import { formatDecimal, parseStudentNumber } from '@shared/utils';

export interface ValidationResult {
  valid: boolean;
  error: string | null;
  value?: number;
}

export function validateInput(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { valid: false, error: null };
  }

  // Handle scientific notation
  let numValue: number;
  try {
    numValue = parseStudentNumber(value);
  } catch {
    return { valid: false, error: 'Ógilt snið' };
  }

  // Check if it's a valid number
  if (isNaN(numValue)) {
    return { valid: false, error: 'Sláðu inn tölu' };
  }

  // Check if positive
  if (numValue <= 0) {
    return { valid: false, error: 'Sláðu inn jákvæða tölu' };
  }

  // Check reasonable bounds
  if (numValue >= 1000) {
    return { valid: false, error: 'Talan er of há (< 1000)' };
  }

  return { valid: true, error: null, value: numValue };
}

/**
 * Print an answer to three significant figures, with the decimal comma.
 *
 * Every place the game shows a student the answer — the last hint, the worked
 * solution, the "Rétt svar" line — goes through this, so that what it shows is
 * itself accepted by `checkAnswer`. Three significant figures is at most 0,5 %
 * from the value, well inside the 2 % tolerance; three *decimals* is not, and
 * printed 0,0154 M as 0,015 M, which grades wrong.
 */
export function formatAnswer(value: number): string {
  return formatDecimal(Number.parseFloat(value.toPrecision(3)));
}

export function checkAnswer(
  userValue: number,
  correctAnswer: number,
  tolerancePercent: number = 2
): boolean {
  const tolerance = Math.abs(correctAnswer * (tolerancePercent / 100)) || 0.01;
  return Math.abs(userValue - correctAnswer) <= tolerance;
}

export function getContextualFeedback(userValue: number, correctAnswer: number): string {
  const percentError = Math.abs((userValue - correctAnswer) / correctAnswer) * 100;

  if (percentError > 50) {
    return 'Mjög langt frá! Athugaðu hvort þú valdir rétta formúlu';
  } else if (percentError > 20) {
    return 'Ekki rétt. Athugaðu hvort þú breyttir mL í L';
  } else if (percentError > 5) {
    return 'Nálægt! Kannski reiknivilla eða aukastafavilla';
  } else {
    return 'Mjög nálægt en utan vikmarka. Athugaðu nákvæmni';
  }
}
