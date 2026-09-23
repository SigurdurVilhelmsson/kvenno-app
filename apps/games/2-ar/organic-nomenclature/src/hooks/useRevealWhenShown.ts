import { useEffect, type RefObject } from 'react';

/**
 * Scroll `ref` to the top of the viewport when `shown` turns true, but only if it is off
 * screen (or only its first few lines would be showing).
 *
 * Every level swaps the answer controls for the feedback in place. On a phone that can
 * leave the verdict out of view: in Stig 2's drag mode the pool and drop zones collapse and
 * the browser clamps the scroll position below it, and elsewhere the browser's scroll
 * anchoring keeps the content below still while the taller feedback grows upward past the
 * top of a short (landscape) screen. The student taps an answer and sees only the bottom of
 * the panel. Where the verdict is already visible — every desktop layout — nothing moves.
 */
export function useRevealWhenShown(ref: RefObject<HTMLElement | null>, shown: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!shown || !el) return;
    const { top } = el.getBoundingClientRect();
    if (top < 0 || top > window.innerHeight - 120) {
      el.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
    }
  }, [ref, shown]);
}

/**
 * Scroll `ref` back to the top of the viewport when the next item loads (`item` changes) or the
 * feedback is dismissed (`answering` turns true), but only if it is off the top of the screen:
 * any of it for a short question card (`hiddenFraction` 0), or more than that fraction of it
 * for a tall one whose content sits in the middle.
 *
 * Moving on swaps the feedback back for the answer controls in place, so on a phone the page is
 * left scrolled below the prompt: the next question, molecule to name or name to build loads
 * off screen above the student, who sees only the answer buttons. Where the prompt is on screen
 * — every desktop layout — nothing moves.
 */
export function useReturnToPrompt(
  ref: RefObject<HTMLElement | null>,
  answering: boolean,
  item: unknown,
  hiddenFraction = 0
) {
  useEffect(() => {
    const el = ref.current;
    if (!answering || !el) return;
    const { top, height } = el.getBoundingClientRect();
    if (top < -height * hiddenFraction) el.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
  }, [ref, answering, item, hiddenFraction]);
}
