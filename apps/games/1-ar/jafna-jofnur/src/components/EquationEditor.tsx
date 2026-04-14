import type { Molecule } from '../data/reactions';

interface EquationEditorProps {
  reactants: Molecule[];
  products: Molecule[];
  reactantCoeffs: number[];
  productCoeffs: number[];
  onReactantCoeffChange: (index: number, value: number) => void;
  onProductCoeffChange: (index: number, value: number) => void;
  disabled?: boolean;
}

/**
 * Renders a chemical formula with subscript numbers.
 * Converts unicode subscript digits (₀-₉) into <sub> elements.
 */
function FormulaDisplay({ formula }: { formula: string }) {
  const subscriptMap: Record<string, string> = {
    '\u2080': '0',
    '\u2081': '1',
    '\u2082': '2',
    '\u2083': '3',
    '\u2084': '4',
    '\u2085': '5',
    '\u2086': '6',
    '\u2087': '7',
    '\u2088': '8',
    '\u2089': '9',
  };

  const parts: Array<{ text: string; isSub: boolean }> = [];
  let current = '';
  let isSub = false;

  for (const char of formula) {
    if (char in subscriptMap) {
      if (!isSub && current) {
        parts.push({ text: current, isSub: false });
        current = '';
      }
      isSub = true;
      current += subscriptMap[char];
    } else {
      if (isSub && current) {
        parts.push({ text: current, isSub: true });
        current = '';
      }
      isSub = false;
      current += char;
    }
  }
  if (current) {
    parts.push({ text: current, isSub });
  }

  return (
    <span className="formula-display text-lg sm:text-xl font-bold text-warm-800">
      {parts.map((part, i) =>
        part.isSub ? <sub key={i}>{part.text}</sub> : <span key={i}>{part.text}</span>
      )}
    </span>
  );
}

/** Single coefficient control with +/- buttons */
function CoefficientControl({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => onChange(Math.min(9, value + 1))}
        disabled={disabled || value >= 9}
        className="coeff-btn w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-100 hover:bg-blue-200 disabled:opacity-30 disabled:cursor-not-allowed text-blue-700 font-bold text-lg flex items-center justify-center"
        aria-label="Hækka stuðul"
      >
        +
      </button>
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white border-2 border-warm-300 flex items-center justify-center text-xl font-bold text-warm-800">
        {value}
      </div>
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={disabled || value <= 1}
        className="coeff-btn w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-100 hover:bg-blue-200 disabled:opacity-30 disabled:cursor-not-allowed text-blue-700 font-bold text-lg flex items-center justify-center"
        aria-label="Lækka stuðul"
      >
        -
      </button>
    </div>
  );
}

/**
 * EquationEditor - the core interactive component.
 * Shows each molecule with +/- buttons to adjust coefficients,
 * the arrow between reactants and products, and the current coefficients.
 */
export function EquationEditor({
  reactants,
  products,
  reactantCoeffs,
  productCoeffs,
  onReactantCoeffChange,
  onProductCoeffChange,
  disabled,
}: EquationEditorProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {/* Reactants */}
        {reactants.map((mol, i) => (
          <div key={`r-${i}`} className="flex items-center gap-1 sm:gap-2">
            {i > 0 && <span className="text-warm-400 text-xl font-bold mx-1">+</span>}
            <CoefficientControl
              value={reactantCoeffs[i]}
              onChange={(v) => onReactantCoeffChange(i, v)}
              disabled={disabled}
            />
            <FormulaDisplay formula={mol.formula} />
          </div>
        ))}

        {/* Arrow */}
        <span className="text-2xl sm:text-3xl text-warm-400 font-bold mx-2 sm:mx-4 select-none">
          →
        </span>

        {/* Products */}
        {products.map((mol, i) => (
          <div key={`p-${i}`} className="flex items-center gap-1 sm:gap-2">
            {i > 0 && <span className="text-warm-400 text-xl font-bold mx-1">+</span>}
            <CoefficientControl
              value={productCoeffs[i]}
              onChange={(v) => onProductCoeffChange(i, v)}
              disabled={disabled}
            />
            <FormulaDisplay formula={mol.formula} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default EquationEditor;
