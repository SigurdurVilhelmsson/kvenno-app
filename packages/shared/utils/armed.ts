/**
 * The anti-skip guard for a post-commit Næsta (vertical-scroll pass, P3).
 *
 * After Athuga, focus moves to the feedback, not to Næsta, so a second Enter
 * lands on a non-button and does nothing. A touch double-tap does not go
 * through focus: when Næsta renders where Athuga was, the second tap of a
 * double-tap presses it and skips the feedback unread. This guard ignores an
 * activation that arrives within `ms` of Næsta appearing or changing meaning.
 *
 * It is not a timer the student sees and it grades nothing, so it sits outside
 * the no-timers rule. It changes nothing visible either: the button is never
 * disabled, a too-early press is simply dropped.
 */
import { useCallback, useLayoutEffect, useRef } from 'react';

const now = () =>
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();

/**
 * Returns `guard`: wrap Næsta's handler in it — `onClick={guard(next)}`. The
 * clock restarts when the component mounts and whenever `key` changes, so pass
 * whatever makes the button mean something new (the item index, the phase).
 */
export function useArmedAfter(
  ms = 400,
  key?: unknown
): <A extends unknown[]>(fn: (...args: A) => void) => (...args: A) => void {
  // Set on mount and on every key change, by the layout effect below.
  const since = useRef(0);
  useLayoutEffect(() => {
    since.current = now();
  }, [key]);
  return useCallback(
    <A extends unknown[]>(fn: (...args: A) => void) =>
      (...args: A) => {
        if (now() - since.current < ms) return;
        fn(...args);
      },
    [ms]
  );
}
