import type { ReactElement } from 'react';

import { useIsPhone } from '@shared/utils';

const CLASSES =
  'game-btn rounded-lg border border-warm-300 px-3 py-1.5 text-sm text-warm-700 hover:bg-warm-50 pointer-coarse:min-h-11';

/**
 * "← Aftur í valmynd" on Kanna and Skilja, and where it sits.
 *
 * On a wide screen it keeps its own line above the phase's first card, as it
 * always has. On a phone that line cost 60 px above the screen, so the button
 * joins the card's heading row instead (the header fold, design P4). It moves
 * in the DOM rather than by CSS `order`: it comes first in the row, so the
 * focus order is what is seen — the button, then the heading.
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
      className={`${CLASSES} ${phone ? 'shrink-0 whitespace-nowrap' : 'mb-4'}`}
    >
      ← Aftur í valmynd
    </button>
  );
  return phone ? { above: null, inRow: button } : { above: button, inRow: null };
}
