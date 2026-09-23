/**
 * Two keys a phone's decimal keypad does not have: `e` and the minus sign.
 *
 * The answer fields keep `inputMode="decimal"` so a phone raises the number
 * keypad, and `parseStudentNumber` reads scientific notation as `1,84e-5` — the
 * format the placeholder and the answer hints show. But the decimal keypad has
 * no `e` anywhere, and on an iPhone no minus either, so a Ka or Kb could only be
 * entered by typing out every leading zero (Kb here is 0,00000000056). These two
 * keys sit beside the field on touch screens and insert at the caret. On a
 * mouse-and-keyboard screen they are hidden, since the keyboard has both.
 *
 * `onMouseDown` is prevented so a tap does not take focus from the field — the
 * keypad stays up and the student keeps typing the exponent.
 */

import type { RefObject } from 'react';

/** Insert `text` over the selection, returning the new value and caret position. */
export function insertAtCaret(
  value: string,
  selectionStart: number | null,
  selectionEnd: number | null,
  text: string
): { value: string; caret: number } {
  const start = selectionStart ?? value.length;
  const end = Math.max(selectionEnd ?? start, start);
  return { value: value.slice(0, start) + text + value.slice(end), caret: start + text.length };
}

const KEYS = [
  { insert: 'e', label: 'e', ariaLabel: 'Bæta e við svarið' },
  // The key shows a typographic minus; the field gets an ASCII hyphen, which
  // is what `parseStudentNumber` reads as a sign.
  { insert: '-', label: '−', ariaLabel: 'Bæta mínus við svarið' },
] as const;

interface ScientificKeysProps {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (next: string) => void;
}

export function ScientificKeys({ inputRef, value, onChange }: ScientificKeysProps) {
  const press = (insert: string) => {
    const input = inputRef.current;
    const next = insertAtCaret(
      value,
      input?.selectionStart ?? null,
      input?.selectionEnd ?? null,
      insert
    );
    onChange(next.value);
    // Focus inside the tap itself as well: a phone only raises its keypad for
    // a focus made during the gesture, so this is what brings it back if the
    // tap blurred the field. After React has written the new value, put the
    // caret after the insert.
    input?.focus();
    requestAnimationFrame(() => {
      if (!input) return;
      input.focus();
      input.setSelectionRange(next.caret, next.caret);
    });
  };

  return (
    <span className="hidden gap-2 pointer-coarse:inline-flex">
      {KEYS.map((key) => (
        <button
          key={key.insert}
          type="button"
          aria-label={key.ariaLabel}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => press(key.insert)}
          className="h-11 w-11 rounded-lg border border-warm-300 bg-white font-mono text-lg text-warm-800 active:bg-warm-100"
        >
          {key.label}
        </button>
      ))}
    </span>
  );
}
