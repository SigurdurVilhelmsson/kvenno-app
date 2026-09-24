// @vitest-environment jsdom
/**
 * Where focus goes and when the page moves, as a student plays.
 *
 * - Every screen swap (menu ↔ level, intro → questions, a level ↔ its results,
 *   a Stig 3 problem ↔ its review) and every new question opens at the top of
 *   the page, at every width, as the scrollIntoView it replaces always did.
 *   Focus goes to the new screen's heading, or to the new question's equation;
 *   back on the menu, to the next level not yet done.
 * - An answer focuses the feedback, never Næsta, and Næsta ignores a press
 *   within 400 ms of appearing, so a double tap cannot skip the feedback.
 * - A phone then brings Næsta into view with as much of the question as fits.
 *   Wider than a phone the verdict is revealed as it always was.
 * - Moving between the three steps of one Stig 3 problem keeps the given
 *   masses in place: a phone brings the new step into view, wider than a phone
 *   nothing moves; focus goes to the new step's question either way.
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

const reactantCards = (root: HTMLElement) =>
  Array.from(root.querySelectorAll('button')).filter((b) => /sameindir/.test(b.textContent ?? ''));

describe('Stig 1', () => {
  function start() {
    const { container } = render(<Level1 onBack={vi.fn()} onComplete={vi.fn()} />);
    press(within(container).getByRole('button', { name: /Byrja æfingar/ }));
    return container;
  }

  it('opens the questions at the top with the level heading focused', () => {
    start();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.tagName).toBe('H1');
    expect(focused()?.textContent).toMatch(/Sjónræn greining/);
  });

  it('focuses the feedback after an answer, and reveals Næsta on a phone', () => {
    const container = start();
    scrollBy.mockClear();
    press(reactantCards(container)[0]);
    expectFeedbackFocused();
    expect(scrollBy).toHaveBeenCalled();
  });

  it('drops a press on Næsta within 400 ms, then opens the next equation focused', () => {
    const container = start();
    press(reactantCards(container)[0]);
    const next = within(container).getByRole('button', { name: /Næsta spurning/ });
    press(next);
    expect(within(container).getByText('1/8')).toBeTruthy();

    later();
    scrollBy.mockClear();
    press(next);
    expect(within(container).getByText('2/8')).toBeTruthy();
    expect(focused()?.id).toBe('takmarkandi-l1-equation');
    // It was below the fold, so it came back to the top, at once.
    expect(scrollBy).toHaveBeenCalledWith({ top: 900, behavior: 'auto' });
  });

  it('wider than a phone reveals the verdict as it always did, and still moves focus', () => {
    phone = false;
    const container = start();
    scrollBy.mockClear();
    press(reactantCards(container)[0]);
    expectFeedbackFocused();
    // The feedback block (verdict and Næsta) is brought up to the bottom edge.
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenCalledWith({ top: 360, behavior: 'smooth' });
  });
});

describe('Stig 2', () => {
  it('focuses the feedback after Athuga, and Athuga and Næsta are separate buttons', () => {
    const { container } = render(<Level2 onBack={vi.fn()} onComplete={vi.fn()} />);
    const ui = within(container);
    fireEvent.change(container.querySelector('input')!, { target: { value: '9999' } });
    const check = ui.getByRole('button', { name: 'Athuga' });
    press(check);
    expectFeedbackFocused();
    expect(check.isConnected).toBe(false);
    expect(ui.getByText(/Útreikningur/)).toBeTruthy();

    const next = ui.getByRole('button', { name: /Næsta spurning/ });
    press(next);
    expect(ui.getByText('1/8')).toBeTruthy();
    later();
    press(next);
    expect(ui.getByText('2/8')).toBeTruthy();
    expect(focused()?.id).toBe('takmarkandi-l2-equation');
  });

  it('checks the answer on Enter', () => {
    const { container } = render(<Level2 onBack={vi.fn()} onComplete={vi.fn()} />);
    const input = container.querySelector('input')!;
    expect(input.getAttribute('enterkeyhint')).toBe('done');
    fireEvent.change(input, { target: { value: '9999' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    frame();
    expectFeedbackFocused();
  });
});

describe('Stig 3', () => {
  function checkLimiting(container: HTMLElement) {
    fireEvent.click(container.querySelector('button.font-mono')!);
    press(within(container).getByRole('button', { name: 'Athuga' }));
  }

  it('moves between the steps of a problem without leaving the masses, then reviews', () => {
    const { container } = render(<Level3 onBack={vi.fn()} onComplete={vi.fn()} />);
    const ui = within(container);
    checkLimiting(container);
    expectFeedbackFocused();

    // The next step: focus on its question; a phone brings it into view, but
    // nothing jumps to the top of the page.
    later();
    scrollTo.mockClear();
    scrollBy.mockClear();
    press(ui.getByRole('button', { name: /Áfram/ }));
    expect(focused()?.textContent).toMatch(/fræðilegar heimtur/);
    expect(scrollTo).not.toHaveBeenCalled();
    expect(scrollBy).toHaveBeenCalled();

    for (const name of [/prósentuheimturnar/, /Verkefni lokið|Fullkomið/]) {
      fireEvent.change(container.querySelector('input')!, { target: { value: '1' } });
      press(ui.getByRole('button', { name: 'Athuga' }));
      expectFeedbackFocused();
      later();
      press(ui.getByRole('button', { name: /Áfram/ }));
      expect(focused()?.textContent).toMatch(name);
    }
    // The review is a new screen: it opens at the top.
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });

    later();
    press(ui.getByRole('button', { name: /Næsta verkefni/ }));
    expect(ui.getByText('2/5')).toBeTruthy();
    expect(focused()?.id).toBe('takmarkandi-l3-equation');
  });

  it('wider than a phone, a new step does not move the page', () => {
    phone = false;
    const { container } = render(<Level3 onBack={vi.fn()} onComplete={vi.fn()} />);
    checkLimiting(container);
    later();
    scrollBy.mockClear();
    scrollTo.mockClear();
    press(within(container).getByRole('button', { name: /Áfram/ }));
    expect(scrollBy).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
    expect(focused()?.textContent).toMatch(/fræðilegar heimtur/);
  });

  it('after "Reyna aftur" focus returns to the answer, not to <body>', () => {
    const { container } = render(<Level3 onBack={vi.fn()} onComplete={vi.fn()} />);
    const ui = within(container);
    checkLimiting(container);
    later();
    press(ui.getByRole('button', { name: /Áfram/ }));
    fireEvent.change(container.querySelector('input')!, { target: { value: '1' } });
    press(ui.getByRole('button', { name: 'Athuga' }));
    later();
    press(ui.getByRole('button', { name: 'Reyna aftur' }));
    expect(focused()).toBe(container.querySelector('input'));
  });

  it('drops a press on Áfram within 400 ms of the verdict', () => {
    const { container } = render(<Level3 onBack={vi.fn()} onComplete={vi.fn()} />);
    checkLimiting(container);
    press(within(container).getByRole('button', { name: /Áfram/ }));
    expect(within(container).getByText('Skref 1 af 3')).toBeTruthy();
  });
});

describe('Valmynd', () => {
  it('back from a level, focuses the first level not yet done', () => {
    const { container } = render(<App />);
    const ui = within(container);
    press(ui.getByText('Meistarapróf'));
    scrollTo.mockClear();
    press(ui.getByText('← Til baka'));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.getAttribute('data-level-card')).toBe('1');
  });

  it('once Stig 1 is done, focuses Stig 2', () => {
    localStorage.setItem(
      'takmarkandi-levels-progress',
      JSON.stringify({ level1Completed: true, level1Score: 50, totalGamesPlayed: 1 })
    );
    const { container } = render(<App />);
    const ui = within(container);
    press(ui.getByText('Grunnhugtök'));
    press(ui.getByText('← Til baka í valmynd'));
    expect(focused()?.getAttribute('data-level-card')).toBe('2');
  });

  it('wider than a phone still opens the menu at the top, as it always did', () => {
    phone = false;
    const { container } = render(<App />);
    const ui = within(container);
    press(ui.getByText('Leiðbeind æfing'));
    scrollTo.mockClear();
    scrollBy.mockClear();
    press(ui.getByText('← Til baka'));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    // Only a phone brings the level card into view.
    expect(scrollBy).not.toHaveBeenCalled();
    expect(focused()?.getAttribute('data-level-card')).toBe('1');
  });
});
