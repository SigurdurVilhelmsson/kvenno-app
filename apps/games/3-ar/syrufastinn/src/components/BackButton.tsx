import type { ReactElement } from 'react';

import { useIsPhone } from '@shared/utils';

/**
 * "← Til baka" from a phase to the menu, and where it sits.
 *
 * On a wide screen it keeps its own line above the phase card, as it always
 * has. On a phone that line cost 40 px above every screen, so the button joins
 * the card's heading row instead (the header fold, design P4). It moves in the
 * DOM rather than by CSS `order`: it comes first in the row, so the focus order
 * is what is seen — Til baka, the heading, then the counter.
 *
 * `useBackButton` returns both placements; a screen renders `above` before its
 * card and `inRow` first in its heading row. Exactly one of them is non-null.
 */
export function useBackButton(onBack: () => void): {
  above: ReactElement | null;
  inRow: ReactElement | null;
} {
  const phone = useIsPhone();
  const button = (
    <button
      type="button"
      onClick={onBack}
      className={`text-warm-600 hover:text-warm-800 pointer-coarse:-my-2.5 pointer-coarse:py-2.5 ${
        phone ? 'shrink-0 whitespace-nowrap' : 'mb-4'
      }`}
    >
      ← Til baka
    </button>
  );
  return phone ? { above: null, inRow: button } : { above: button, inRow: null };
}
