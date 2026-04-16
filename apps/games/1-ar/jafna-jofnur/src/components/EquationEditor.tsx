import type { KeyboardEvent } from 'react';

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

/** Single coefficient control with +/- buttons (44px touch targets + arrow-key support) */
function CoefficientControl({
  value,
  onChange,
  disabled,
  formula,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  formula: string;
}) {
  const increment = () => onChange(Math.min(9, value + 1));
  const decrement = () => onChange(Math.max(1, value - 1));

  const handleDisplayKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowUp' || e.key === '+') {
      e.preventDefault();
      increment();
    } else if (e.key === 'ArrowDown' || e.key === '-') {
      e.preventDefault();
      decrement();
    }
  };

  const buttonClass =
    'coeff-btn w-11 h-11 rounded-lg bg-blue-100 hover:bg-blue-200 disabled:opacity-30 disabled:cursor-not-allowed text-blue-700 font-bold text-lg flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1';

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={increment}
        disabled={disabled || value >= 9}
        className={buttonClass}
        aria-label={`Hækka stuðul ${formula}`}
      >
        +
      </button>
      <div
        role="spinbutton"
        aria-label={`Stuðull ${formula}`}
        aria-valuenow={value}
        aria-valuemin={1}
        aria-valuemax={9}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleDisplayKeyDown}
        className="w-11 h-11 rounded-lg bg-white border-2 border-warm-300 flex items-center justify-center text-xl font-bold text-warm-800 outline-none focus-visible:ring-2 focus-visible:ring-kvenno-orange focus-visible:ring-offset-1 select-none"
      >
        {value}
      </div>
      <button
        onClick={decrement}
        disabled={disabled || value <= 1}
        className={buttonClass}
        aria-label={`Lækka stuðul ${formula}`}
      >
        −
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
              formula={mol.formula}
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
              formula={mol.formula}
            />
            <FormulaDisplay formula={mol.formula} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default EquationEditor;
