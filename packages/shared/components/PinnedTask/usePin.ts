import { useLayoutEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';

import {
  hasTextInput,
  isPinned,
  newPinId,
  register,
  subscribe,
  unregister,
  update,
  type PinEdge,
} from './pinStore';

/**
 * Registers a pinned region with the shared store and returns its ref and
 * whether it is pinned right now. False wherever `matchMedia` is missing, so
 * jsdom and a desktop window never render the pinned form.
 *
 * On every render it checks the screen for a text input. Pinning over one is a
 * bug in the game, not a layout choice, so in development and in tests it
 * throws; in production the region simply stays in the flow.
 */
export function usePin(
  edge: PinEdge,
  component: string
): { ref: RefObject<HTMLDivElement | null>; pinned: boolean } {
  const ref = useRef<HTMLDivElement>(null);
  const [id] = useState(newPinId);

  useLayoutEffect(() => {
    register(id, edge);
    return () => unregister(id);
  }, [id, edge]);

  useLayoutEffect(() => {
    const el = ref.current;
    const blocked = !!el && hasTextInput(el);
    if (blocked && !import.meta.env.PROD) {
      throw new Error(
        `${component}: this screen has a text input. Nothing may be pinned on a typed ` +
          'screen: the soft keyboard covers a pinned bar (design P8, condition 2).'
      );
    }
    update(id, el, blocked);
  });

  const pinned = useSyncExternalStore(
    subscribe,
    () => isPinned(id),
    () => false
  );
  return { ref, pinned };
}
