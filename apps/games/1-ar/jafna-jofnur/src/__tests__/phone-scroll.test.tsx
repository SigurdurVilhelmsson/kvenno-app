// @vitest-environment jsdom
/**
 * Where focus goes and when the page moves, as a student plays.
 *
 * - A screen swap (menu → level, the Stig 1 intro → the exercises, the last
 *   equation → the summary, a new run) starts the new screen at the top of the
 *   page, at every width as it always has, and focuses its heading. Back on the
 *   menu, the next level not yet done is focused.
 * - A new equation starts at the top too, and focus moves to the equation.
 * - Athuga focuses the feedback, never Næsta, and Næsta ignores a press within
 *   400 ms of appearing, so a double tap cannot skip the feedback. On a phone
 *   the verdict and Næsta are brought into view; stepping a coefficient never
 *   moves the page.
 * - Opening the hint focuses it (the Vísbending button that opened it is gone).
 *
 * jsdom has no layout, so every box is stubbed at one place, below the fold.
 */
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY } from '@shared/utils';

import App from '../App';
import { Level } from '../components/Level';
import { LEVEL1_CONFIG, LEVEL3_CONFIG } from '../components/levelConfigs';

let phone = true;
let clock = 1000;
const scrollBy = vi.fn();
const scrollTo = vi.fn();

let frames = new Map<number, FrameRequestCallback>();
let lastFrame = 0;
/** Runs the animation frames asked for so far: where the level reveals and focuses after a commit. */
function frame() {
  const due = [...frames.values()];
  frames = new Map();
  act(() => due.forEach((cb) => cb(0)));
}

function press(el: Element) {
  fireEvent.click(el);
  frame();
}

/** Lets the Næsta guard's 400 ms pass. */
function later() {
  clock += 500;
}

const focused = () => document.activeElement as HTMLElement | null;

beforeEach(() => {
  localStorage.clear();
  phone = true;
  clock = 1000;
  scrollBy.mockClear();
  scrollTo.mockClear();
  window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
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
  vi.spyOn(performance, 'now').mockImplementation(() => clock);
  frames = new Map();
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    frames.set(++lastFrame, cb);
    return lastFrame;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id);
  });
  // Everything sits below the fold, so every reveal has somewhere to go.
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    () =>
      ({
        top: 900,
        bottom: 1000,
        height: 100,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: 900,
        toJSON: () => ({}),
      }) as DOMRect
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** The focused element is the feedback group: a role=group holding the verdict. */
function expectFeedbackFocused() {
  const f = focused();
  expect(f?.getAttribute('role')).toBe('group');
  expect(f?.querySelector('.feedback-panel')).toBeTruthy();
}

/** The focused element is the equation: the item's start, holding its steppers. */
function expectEquationFocused() {
  const f = focused();
  expect(f?.hasAttribute('data-item-start')).toBe(true);
  expect(f?.querySelector('[role="spinbutton"]')).toBeTruthy();
}

describe('an equation', () => {
  it('focuses the feedback after Athuga and the next equation after Næsta', () => {
    const { container } = render(
      <Level config={LEVEL3_CONFIG} onBack={() => {}} onComplete={() => {}} />
    );
    const ui = within(container);

    // Stepping a coefficient does not move the page.
    press(ui.getAllByRole('button', { name: /^Hækka stuðul/ })[0]);
    expect(scrollBy).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();

    press(ui.getByRole('button', { name: 'Athuga' }));
    expectFeedbackFocused();
    expect(focused()?.textContent).toMatch(/Rétt|Rangt/);
    // On a phone the verdict and Næsta are brought into view.
    expect(scrollBy).toHaveBeenCalled();

    // A press at once — the second tap of a double tap — is dropped.
    const next = ui.getByRole('button', { name: /Næsta efnajafna/ });
    press(next);
    expect(ui.getByText('1/6')).toBeTruthy();
    expectFeedbackFocused();

    later();
    press(next);
    expect(ui.getByText('2/6')).toBeTruthy();
    expectEquationFocused();
  });

  it('keeps Athuga and Næsta as separate elements', () => {
    const { container } = render(
      <Level config={LEVEL3_CONFIG} onBack={() => {}} onComplete={() => {}} />
    );
    const ui = within(container);
    const check = ui.getByRole('button', { name: 'Athuga' });
    press(check);
    expect(check.isConnected).toBe(false);
    expect(ui.getByRole('button', { name: /Næsta efnajafna/ })).not.toBe(check);
  });

  it('focuses the hint when it opens', () => {
    const { container } = render(
      <Level config={LEVEL3_CONFIG} onBack={() => {}} onComplete={() => {}} />
    );
    const ui = within(container);
    press(ui.getByRole('button', { name: 'Vísbending' }));
    expect(focused()?.textContent).toMatch(/^Vísbending:/);
    expect(ui.getByRole('button', { name: 'Athuga' })).toBeTruthy();
  });

  it('on a desktop, still focuses the feedback and brings it into view as before', () => {
    phone = false;
    const { container } = render(
      <Level config={LEVEL3_CONFIG} onBack={() => {}} onComplete={() => {}} />
    );
    const ui = within(container);
    press(ui.getAllByRole('button', { name: /^Hækka stuðul/ })[0]);
    expect(scrollBy).not.toHaveBeenCalled();
    press(ui.getByRole('button', { name: 'Athuga' }));
    expectFeedbackFocused();
    // The old helper's `scrollIntoView({ block: 'nearest' })`, at every width.
    expect(scrollBy).toHaveBeenCalledTimes(1);
  });
});

describe('screen swaps', () => {
  it('opens the exercises and the summary at their top, with the heading focused', () => {
    const { container } = render(
      <Level config={LEVEL1_CONFIG} onBack={() => {}} onComplete={() => {}} />
    );
    const ui = within(container);

    press(ui.getByRole('button', { name: /Byrja æfingar/ }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.tagName).toBe('H1');
    expect(ui.getByText('1/7')).toBeTruthy();

    for (let i = 0; i < 7; i++) {
      press(ui.getByRole('button', { name: 'Athuga' }));
      later();
      scrollTo.mockClear();
      press(ui.getByRole('button', { name: /Næsta efnajafna|Sjá niðurstöður/ }));
    }
    expect(ui.getByText('Niðurstöður')).toBeTruthy();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.textContent).toBe('Niðurstöður');

    // A new run is a screen swap too: back to the top, the heading focused.
    later();
    scrollTo.mockClear();
    press(ui.getByRole('button', { name: 'Reyna aftur' }));
    expect(ui.getByText('1/7')).toBeTruthy();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.tagName).toBe('H1');
  });

  it('starts a new screen at the top on a desktop too, as it always has', () => {
    phone = false;
    const { container } = render(
      <Level config={LEVEL1_CONFIG} onBack={() => {}} onComplete={() => {}} />
    );
    press(within(container).getByRole('button', { name: /Byrja æfingar/ }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });
});

describe('the menu', () => {
  it('focuses the first level not yet done when the student comes back', () => {
    const { container } = render(<App />);
    const ui = within(container);
    press(ui.getByText(/Stig 3/));
    expect(focused()?.tagName).toBe('H1');

    press(ui.getByRole('button', { name: /Til baka/ }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.getAttribute('data-level-card')).toBe('1');
  });

  it('skips a level already done', () => {
    localStorage.setItem(
      'jafnaJofnurProgress',
      JSON.stringify({ level1Completed: true, level2Completed: false, level3Completed: false })
    );
    const { container } = render(<App />);
    const ui = within(container);
    press(ui.getByText(/Stig 3/));
    press(ui.getByRole('button', { name: /Til baka/ }));
    expect(focused()?.getAttribute('data-level-card')).toBe('2');
  });
});
