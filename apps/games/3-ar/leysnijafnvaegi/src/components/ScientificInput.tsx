import { DECIMAL_INPUT_PROPS } from '@shared/utils';

/**
 * An answer in scientific notation: a number, `× 10`, and a power of ten.
 *
 * **The sign button is the reason this is a component.** Both fields raise the
 * decimal keypad, which is right for the digits and wrong for the power: on an
 * iPhone that keypad has no minus key at all, and every answer in Æfa has a
 * negative power of ten — they run from 10⁻⁵ to 10⁻¹⁷. So a student on an
 * iPhone could type the right digits and never the power the field asks for.
 * The `±` button flips the sign of whatever is in the exponent field. It shows
 * only on a touch screen; a desktop keyboard has a minus key, and the desktop
 * row is left exactly as it was.
 *
 * The same row, and the same button label, as `3-ar/jafnvaegisfasti`'s
 * `ScientificInput`, so a student moving along the Y3 chain meets one control.
 *
 * Below `sm` the two fields may shrink and the labels may not, so the row fits
 * a 320 px screen without `× 10` breaking onto two lines.
 */

interface Props {
  mantissa: string;
  exponent: string;
  onMantissaChange: (value: string) => void;
  onExponentChange: (value: string) => void;
  mantissaPlaceholder: string;
  exponentPlaceholder: string;
  disabled?: boolean;
}

/** Flip the sign of a typed exponent: `5` → `-5`, `-5` → `5`, empty → `-`. */
export function toggleSign(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('-') || trimmed.startsWith('−')) return trimmed.slice(1);
  return `-${trimmed}`;
}

export function ScientificInput({
  mantissa,
  exponent,
  onMantissaChange,
  onExponentChange,
  mantissaPlaceholder,
  exponentPlaceholder,
  disabled = false,
}: Props) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <input
        {...DECIMAL_INPUT_PROPS}
        autoComplete="off"
        value={mantissa}
        onChange={(e) => onMantissaChange(e.target.value)}
        disabled={disabled}
        placeholder={mantissaPlaceholder}
        aria-label="Tala"
        className="w-28 min-w-0 rounded-lg border-2 border-warm-300 px-2 py-2 text-center font-mono text-lg disabled:bg-warm-100 sm:px-3"
      />
      <span className="shrink-0 whitespace-nowrap font-mono text-lg text-warm-700">× 10</span>
      <input
        {...DECIMAL_INPUT_PROPS}
        autoComplete="off"
        value={exponent}
        onChange={(e) => onExponentChange(e.target.value)}
        disabled={disabled}
        placeholder={exponentPlaceholder}
        aria-label="Veldisvísir"
        className="w-20 min-w-0 rounded-lg border-2 border-warm-300 px-1 py-2 text-center font-mono text-lg disabled:bg-warm-100 sm:px-3"
      />
      <button
        type="button"
        onClick={() => onExponentChange(toggleSign(exponent))}
        disabled={disabled}
        aria-label="Skipta um formerki á veldisvísi"
        className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-warm-300 bg-white font-mono text-lg text-warm-700 disabled:opacity-60 pointer-coarse:inline-flex"
      >
        ±
      </button>
    </div>
  );
}
