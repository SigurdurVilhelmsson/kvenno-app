import type { ReactNode } from 'react';

import { usePin } from './usePin';

export interface PinnedActionsProps {
  /** The game's **own** existing action buttons, never a copy. */
  children: ReactNode;
  /**
   * The one running quantity the student compares with the target, e.g.
   * `<>Heildar-ΔH: {sum}</>`. **Values only, never a verdict before the
   * check.** Rendered only while pinned, and `aria-hidden`: it is a visual copy
   * of an in-flow readout, which stays the one a screen reader hears.
   */
  status?: ReactNode;
  /**
   * Extra classes for the bar while it is pinned. Prefix them with `pin:` so
   * turning the phone removes them before React re-renders.
   */
  pinnedClassName?: string;
}

/**
 * The action row kept in reach on a portrait phone (design P8). A fallback,
 * for measured need only.
 *
 * **Allowed only when all of these hold:** after compaction and anchoring the
 * primary action is still more than one screen from its question (measured on
 * a touch build); the screen has no text input; and the feedback is short —
 * never pin a Næsta over unread teaching feedback.
 *
 * Place it **inside the task card**, where the buttons already are: on a
 * portrait phone (`pin:`) it is `position: sticky; bottom: 0`, so it keeps its
 * DOM order and the card bounds it. It carries `data-pinned-bottom` (so
 * `usableArea()` subtracts it) and publishes `--pin-bar-h`, which becomes the
 * page's `scroll-padding-bottom` so Tab never lands a control under it.
 *
 * It stays in the flow — its wrapper `display: contents`, the layout exactly
 * what it was — on desktop, in landscape, in jsdom, and when it and any
 * `TaskStrip` would together cover more than 28 % of the visual viewport
 * (large text, a short screen, the keyboard, pinch-zoom).
 *
 * **A screen with a text input may not use it.** It checks on every render and
 * throws in development and tests; in production it stays in the flow.
 *
 * The primary button inside should use `kvenno-orange-700`: `#f36b22` on white
 * fails AA.
 */
export function PinnedActions({ children, status, pinnedClassName = '' }: PinnedActionsProps) {
  const { ref, pinned } = usePin('bottom', 'PinnedActions');
  return (
    <div
      ref={ref}
      data-pinned-bottom={pinned ? '' : undefined}
      className={
        pinned
          ? 'contents pin:block pin:sticky pin:bottom-0 pin:z-20 pin:bg-white/95 ' +
            'pin:pt-2 pin:pb-[max(0.5rem,env(safe-area-inset-bottom))] ' +
            `pin:shadow-[0_-4px_12px_rgba(0,0,0,0.08)] ${pinnedClassName}`.trim()
          : 'contents'
      }
    >
      {pinned && status != null && (
        <div
          aria-hidden="true"
          className="hidden pin:mb-1 pin:block text-sm font-semibold tabular-nums text-warm-700"
        >
          {status}
        </div>
      )}
      {children}
    </div>
  );
}

export default PinnedActions;
