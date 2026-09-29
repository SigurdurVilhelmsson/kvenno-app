// @vitest-environment jsdom
/**
 * Where focus goes and when the page moves, as a student plays on a phone.
 *
 * - A screen swap focuses the new screen's heading: a teaching step its own
 *   heading, a typed practice its answer field (which it has always
 *   autofocused). Back on the menu, the next level not yet done is focused.
 * - A new question focuses its start: the answer field in Stig 1 and 2, the
 *   question in Stig 3.
 * - An answer focuses the feedback, never Næsta, and Næsta ignores a press
 *   within 400 ms of appearing, so a double tap cannot skip the feedback. In
 *   Stig 3, Næsta takes Svara's place and is its own element, not Svara
 *   relabelled.
 * - The page moves only on a phone; on a desktop it never does.
 *
 * jsdom has no layout, so every box is stubbed at one place, below the fold.
 */
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY } from '@shared/utils';

import App from '../App';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

let phone = true;
let clock = 1000;
const scrollBy = vi.fn();
const scrollTo = vi.fn();

let frames = new Map<number, FrameRequestCallback>();
let lastFrame = 0;
/** Runs the animation frames asked for so far: where the game reveals and focuses after a commit. */
function frame() {
  const due = [...frames.values()];
  frames = new Map();
  act(() => due.forEach((cb) => cb(0)));
}

function press(el: Element) {
  fireEvent.click(el);
  frame();
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

function startStig1() {
  const { container } = render(<Level1 onBack={vi.fn()} onComplete={vi.fn()} />);
  const ui = within(container);
  press(ui.getByRole('button', { name: /Sjáum dæmi/ }));
  press(ui.getByRole('button', { name: /Eitt dæmi til/ }));
  press(ui.getByRole('button', { name: /byrja æfingar/ }));
  return ui;
}

describe('screen swaps', () => {
  it('focuses each teaching step’s own heading, then the answer field', () => {
    const { container } = render(<Level1 onBack={vi.fn()} onComplete={vi.fn()} />);
    const ui = within(container);
    press(ui.getByRole('button', { name: /Sjáum dæmi/ }));
    expect(focused()?.textContent).toBe('Dæmi: H₂O (Vatn)');
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    press(ui.getByRole('button', { name: /Eitt dæmi til/ }));
    expect(focused()?.textContent).toBe('Dæmi: CO₂ (Koldíoxíð)');
    press(ui.getByRole('button', { name: /byrja æfingar/ }));
    expect(focused()).toBe(ui.getByRole('textbox'));
  });

  it('opens a level at its heading, and returns to the next level not yet done', () => {
    const { container } = render(<App />);
    const ui = within(container);
    press(ui.getByRole('button', { name: /Stig 3/ }));
    expect(focused()?.textContent).toBe('Samþætt æfing — Stig 3');
    press(ui.getByRole('button', { name: 'Til baka' }));
    expect(focused()).toBe(ui.getByRole('button', { name: /Stig 1: Mólmassi/ }));
  });

  it('keeps the answer field Stig 2 autofocuses when a replay opens straight on a question', () => {
    localStorage.setItem(
      'molhugtakidProgress',
      JSON.stringify({ level1Completed: true, level2Completed: true, level3Completed: false })
    );
    const { container } = render(<App />);
    const ui = within(container);
    press(ui.getByRole('button', { name: /Stig 2/ }));
    expect(focused()).toBe(ui.getByRole('textbox'));
    press(ui.getByRole('button', { name: /Til baka í valmynd/ }));
    expect(focused()).toBe(ui.getByRole('button', { name: /Stig 3: Samþætt/ }));
  });
});

describe('Stig 1', () => {
  it('focuses the feedback after Athuga, drops an early Næsta, and focuses the next answer field', () => {
    const ui = startStig1();
    const first = ui.getByText('Reiknaðu mólmassa:').nextElementSibling?.textContent;
    fireEvent.change(ui.getByRole('textbox'), { target: { value: '1' } });
    press(ui.getByRole('button', { name: 'Athuga' }));
    expectFeedbackFocused();
    expect(scrollBy).toHaveBeenCalled();

    clock += 150;
    fireEvent.click(ui.getByRole('button', { name: /Næsta dæmi/ }));
    expect(ui.getByText('Reiknaðu mólmassa:').nextElementSibling?.textContent).toBe(first);

    clock += 400;
    press(ui.getByRole('button', { name: /Næsta dæmi/ }));
    expect(ui.getByText('Reiknaðu mólmassa:').nextElementSibling?.textContent).not.toBe(first);
    expect(focused()).toBe(ui.getByRole('textbox'));
  });

  it('focuses the hint it opens, since the button that opened it is gone', () => {
    const ui = startStig1();
    press(ui.getByRole('button', { name: 'Vísbending' }));
    expect(focused()?.textContent).toMatch(/^Vísbending:/);
  });

  it('never moves the page on a desktop, and still moves focus', () => {
    phone = false;
    const ui = startStig1();
    fireEvent.change(ui.getByRole('textbox'), { target: { value: '1' } });
    press(ui.getByRole('button', { name: 'Athuga' }));
    expectFeedbackFocused();
    expect(scrollBy).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

describe('Stig 2', () => {
  it('focuses the feedback after Svara, drops an early Næsta, and focuses the next answer field', () => {
    const { container } = render(<Level2 onBack={vi.fn()} onComplete={vi.fn()} initialProgress />);
    const ui = within(container);
    const first = container.querySelector('#molmassi-l2-question')?.textContent;
    fireEvent.change(ui.getByRole('textbox'), { target: { value: '1' } });
    press(ui.getByRole('button', { name: 'Svara' }));
    expectFeedbackFocused();

    clock += 150;
    fireEvent.click(ui.getByRole('button', { name: /Næsta dæmi/ }));
    expect(container.querySelector('#molmassi-l2-question')?.textContent).toBe(first);

    clock += 400;
    press(ui.getByRole('button', { name: /Næsta dæmi/ }));
    expect(container.querySelector('#molmassi-l2-question')?.textContent).not.toBe(first);
    expect(focused()).toBe(ui.getByRole('textbox'));
  });
});

describe('Stig 3', () => {
  it('shows Næsta as its own element in Svara’s place, and drops a press on it within 400 ms', () => {
    const { container } = render(<Level3 onBack={vi.fn()} onComplete={vi.fn()} />);
    const ui = within(container);
    fireEvent.change(ui.getByRole('textbox'), { target: { value: '1' } });
    const svara = ui.getByRole('button', { name: 'Svara' });
    press(svara);
    const naesta = ui.getByRole('button', { name: /Næsta/ });
    expect(naesta).not.toBe(svara);
    expect(svara.isConnected).toBe(false);
    expectFeedbackFocused();

    // The second tap of a double tap on Svara lands on Næsta.
    clock += 150;
    fireEvent.click(naesta);
    expect(ui.getByText('Spurning 1 af 8')).toBeTruthy();

    clock += 400;
    press(ui.getByRole('button', { name: /Næsta/ }));
    expect(ui.getByText('Spurning 2 af 8')).toBeTruthy();
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
    expect(focused()?.tagName).toBe('P');
  });
});
