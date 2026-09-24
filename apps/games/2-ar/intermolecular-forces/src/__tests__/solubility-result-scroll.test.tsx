// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY } from '@shared/utils';

import { SolubilityPrediction } from '../components/SolubilityPrediction';

/**
 * The solubility tool reveals its verdict 1,5 s after the prediction, below the Já/Nei
 * buttons. On a 360×740 phone those buttons sit at the bottom of the screen when tapped, so
 * the verdict appeared entirely below the fold — the student saw only the rim of a beaker.
 * The result now scrolls itself into view through the shared helper in `@shared/utils`, by
 * the least move that shows it whole, and nothing moves when it is already visible.
 *
 * It did this with `scrollIntoView({ block: 'nearest' })` at every width before the shared
 * helper existed, so it still does on desktop (`anyWidth`), and it lands flush with the edge
 * as that did (`gap: 0`). Focus moves to the verdict, because the Já/Nei button that was
 * pressed is gone.
 *
 * jsdom has no layout, so every box is stubbed; the viewport is 640 px tall.
 * Queries are scoped to the rendered container (vitest `retry: 2`).
 */

/** Where every element's box is, as far as the component can tell. */
let top = 400;
let height = 500;
let phone = true;
const scrollBy = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  top = 400;
  height = 500;
  phone = true;
  scrollBy.mockClear();
  window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
  window.matchMedia = vi.fn((query: string) => ({
    matches: query === PHONE_QUERY && phone,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
  Object.defineProperty(window, 'innerHeight', { value: 640, configurable: true });
  Object.defineProperty(window, 'visualViewport', { value: undefined, configurable: true });
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    () =>
      ({
        top,
        bottom: top + height,
        left: 0,
        right: 300,
        width: 300,
        height,
        x: 0,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect
  );
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function predict() {
  const { container } = render(<SolubilityPrediction />);
  const view = within(container);
  fireEvent.click(view.getByRole('button', { name: /NaCl/ }));
  fireEvent.click(view.getByRole('button', { name: /Vatn/ }));
  fireEvent.click(view.getByRole('button', { name: /Nei, leysist ekki/ }));
  return view;
}

/** The 1,5 s mixing animation, then the frame the reveal waits for. */
function finishMixing() {
  act(() => {
    vi.advanceTimersByTime(1500);
  });
  act(() => {
    vi.advanceTimersByTime(50);
  });
}

describe('SolubilityPrediction result', () => {
  it('brings the whole result into view once it appears, and not before', () => {
    const view = predict();
    expect(scrollBy).not.toHaveBeenCalled();

    finishMixing();

    view.getByText('✗ Ekki rétt');
    // The result block ends at 900 in a 640 px viewport: its bottom goes to the edge.
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenCalledWith({ top: 260, behavior: 'smooth' });
  });

  it('still does so on desktop, as it did before the shared helper', () => {
    phone = false;
    predict();
    finishMixing();
    expect(scrollBy).toHaveBeenCalledWith({ top: 260, behavior: 'smooth' });
  });

  it('does not move a result that is already on screen', () => {
    top = 100;
    predict();
    finishMixing();
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('moves focus to the verdict, not to <body>', () => {
    const view = predict();
    finishMixing();
    const group = view.getByRole('group', { name: '✗ Ekki rétt' });
    expect(document.activeElement).toBe(group);
  });
});
