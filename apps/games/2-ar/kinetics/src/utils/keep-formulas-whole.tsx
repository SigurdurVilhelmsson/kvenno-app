import type { ReactNode } from 'react';

/**
 * Wrap every space-separated token that carries a square bracket in a no-wrap span.
 *
 * Unicode allows a line break between a closing and an opening bracket, so on a phone a rate
 * law such as `k[NO][Br₂]` was split as `k[NO]` / `[Br₂]` — one formula across two lines.
 * Holding each bracketed token together fixes that; everything else, including the spaces
 * around `=` and `→`, still wraps as before, and the text itself is unchanged.
 */
export function keepFormulasWhole(text: string): ReactNode[] {
  return text.split(/(\s+)/).map((part, i) =>
    /[[\]]/.test(part) ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    )
  );
}
