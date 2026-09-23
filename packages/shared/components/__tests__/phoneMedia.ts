import { act } from '@testing-library/react';

import { PHONE_QUERY } from '../../utils/reveal';

/**
 * A `window.matchMedia` stub whose phone query can be flipped mid-test, firing `change`
 * the way a browser does when a phone is turned. jsdom has no `matchMedia` at all, which
 * is the desktop branch of every phone-gated component; `restore()` puts that back.
 */
export function stubPhoneMedia(initial: boolean) {
  let phone = initial;
  const listeners = new Set<() => void>();
  const original = window.matchMedia;

  window.matchMedia = ((query: string) => ({
    get matches() {
      return query === PHONE_QUERY && phone;
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, fn: () => void) => {
      if (query === PHONE_QUERY) listeners.add(fn);
    },
    removeEventListener: (_: string, fn: () => void) => {
      listeners.delete(fn);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;

  return {
    /** Change the answer and notify subscribers, inside act(). */
    set(next: boolean) {
      phone = next;
      act(() => {
        for (const fn of [...listeners]) fn();
      });
    },
    listenerCount: () => listeners.size,
    restore() {
      window.matchMedia = original;
    },
  };
}
