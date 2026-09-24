import type { MouseEvent } from 'react';

import type { useArmedAfter } from '@shared/utils';

/**
 * A capture-phase click handler for a feedback region that stops any click
 * arriving while `guard` (from `useArmedAfter`) is not yet armed.
 *
 * On a phone the page moves to show the feedback the moment an answer is
 * committed, so the second tap of a double tap on the answer can land on the
 * feedback that has just slid under the finger — on 'Af hverju?', folding the
 * explanation shut before it was read. Within the guard's window such a tap is
 * dropped, exactly as a too-early "Næsta" press is. Nothing visible changes.
 */
export function dropEarlyClicks(guard: ReturnType<typeof useArmedAfter>) {
  return (event: MouseEvent) => {
    let armed = false;
    guard(() => {
      armed = true;
    })();
    if (!armed) event.stopPropagation();
  };
}
