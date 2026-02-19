export function isValidInteger(value: string): boolean {
  if (value === '') return false;
  const num = parseInt(value);
  return !isNaN(num) && num >= 0 && num.toString() === value.trim();
}

export function validateAnswer(
  userAnswer: {
    limitingReactant: string;
    productsFormed: Record<string, string>;
    excessRemaining: string;
  },
  correctAnswer: {
    limitingReactant: string;
    productsFormed: Record<string, number>;
    excessRemaining: number;
  },
  products: { formula: string }[]
): {
  isLimitingCorrect: boolean;
  isProductsCorrect: boolean;
  isExcessCorrect: boolean;
  allCorrect: boolean;
} {
  const isLimitingCorrect =
    userAnswer.limitingReactant === correctAnswer.limitingReactant;

  let isProductsCorrect = true;
  products.forEach((product) => {
    if (
      parseInt(userAnswer.productsFormed[product.formula]) !==
      correctAnswer.productsFormed[product.formula]
    ) {
      isProductsCorrect = false;
    }
  });

  const isExcessCorrect =
    parseInt(userAnswer.excessRemaining) === correctAnswer.excessRemaining;

  const allCorrect = isLimitingCorrect && isProductsCorrect && isExcessCorrect;

  return {
    isLimitingCorrect,
    isProductsCorrect,
    isExcessCorrect,
    allCorrect
  };
}
