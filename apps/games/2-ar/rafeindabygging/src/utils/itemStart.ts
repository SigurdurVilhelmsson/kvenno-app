/**
 * The focus target for `useScreenTop` when a level's exercises open: the first
 * item's own start (`[data-item-start]`, its n value or its element), which
 * reads before the question. A teaching step has none, so `useScreenTop` falls
 * back to the screen's heading.
 */
export const ITEM_START = {
  get current() {
    return document.querySelector<HTMLElement>('[data-item-start]');
  },
};
