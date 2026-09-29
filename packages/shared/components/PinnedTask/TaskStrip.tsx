import type { ReactNode } from 'react';

import { usePin } from './usePin';

export interface TaskStripProps {
  /**
   * The game's **existing** target element, in its compact form — the target
   * equation, the chain built so far, the pH and its markmið. Wrapped, never
   * copied, so a screen reader reads it once.
   */
  children: ReactNode;
  /**
   * Extra classes for the strip while it is pinned, e.g. a background matching
   * a coloured card. Prefix them with `pin:` so turning the phone removes them
   * before React re-renders.
   */
  pinnedClassName?: string;
}

/**
 * A target that stays in view while the student builds toward it (design P7).
 *
 * **Only for loops where the student compares a running result with a
 * target** (hess L2, einingakedjan's 'Keðjan þín', jafnvaegisfasti Tengd
 * jafnvægi, buffer L1's pH + markmið, leysnijafnvaegi Kanna). Never wrap a
 * verdict: a pinned strip shows values only. Budget: 120 px, einingakedjan's
 * chain the one accepted exception.
 *
 * On a portrait phone (`pin:`) it sticks under the site header with an opaque
 * background, carries `data-pinned-top` (so `usableArea()` in `@shared/utils`
 * subtracts it) and publishes `--pin-strip-h`. Everywhere else — desktop,
 * landscape, jsdom, a screen with a text input, or when it and any
 * `PinnedActions` would together cover more than 28 % of the visual viewport —
 * its wrapper is `display: contents`, so the layout is exactly what it was
 * without it.
 */
export function TaskStrip({ children, pinnedClassName = '' }: TaskStripProps) {
  const { ref, pinned } = usePin('top', 'TaskStrip');
  return (
    <div
      ref={ref}
      data-pinned-top={pinned ? '' : undefined}
      className={
        pinned
          ? `contents pin:block pin:sticky pin:top-[var(--pin-header-h,0px)] pin:z-20 pin:bg-white pin:shadow-sm ${pinnedClassName}`.trim()
          : 'contents'
      }
    >
      {children}
    </div>
  );
}

export default TaskStrip;
