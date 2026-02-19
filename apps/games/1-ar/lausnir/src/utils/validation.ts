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
    numValue = parseFloat(value);
  } catch (e) {
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
    return 'Nálægt! Kannski reiknivillla eða aukastafavilla';
  } else {
    return 'Mjög nálægt en utan vikmarka. Athugaðu nákvæmni';
  }
}
