// Input validation utilities
export interface ValidationResult {
  valid: boolean;
  error: string;
}

export function validateInput(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { valid: true, error: '' };
  }

  const num = parseFloat(value);

  if (isNaN(num)) {
    return { valid: false, error: 'Sláðu inn gilda tölu' };
  }

  if (num <= 0) {
    return { valid: false, error: 'Sláðu inn jákvæða tölu' };
  }

  if (num >= 1000) {
    return { valid: false, error: 'Sláðu inn tölu á milli 0 og 1000' };
  }

  return { valid: true, error: '' };
}
