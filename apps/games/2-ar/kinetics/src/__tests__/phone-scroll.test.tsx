// @vitest-environment jsdom
/**
 * Where the screen lands, and where focus goes, as the student moves through the game.
 *
 * Every screen here is taller than a phone. The browser keeps the scroll offset when React
 * swaps the content, so a level used to open part-way down (Stig 3's practice about 170 px
 * past its title), and focus fell to <body> each time the pressed button unmounted: Athuga,
 * Næsta, 'Byrja æfingar', 'Sýna vísbendingu'. The game now uses the shared helpers in
 * `@shared/utils` (`reveal.ts`, `armed.ts`), and these tests hold it to them:
 *
 * - A screen swap starts the new screen at the top on a phone and focuses its heading; back
 *   on the menu, the first level not yet done is focused.
 * - After Athuga, focus moves to the feedback, not to Næsta, so a second Enter lands on
 *   nothing; and Næsta ignores a press within 400 ms of appearing, so a second tap cannot
 *   skip the feedback either.
 * - Næsta brings the new item's top back on a phone and focuses its title.
 * - Opening the hint focuses the hint.
 *
 * jsdom has no layout, so every box is stubbed. Queries are scoped to the rendered container
 * (vitest `retry: 2`).
 */
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY } from '@shared/utils';

import App from '../App';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { challenges as level3 } from '../data/level3-questions';

/**
 * jsdom has no ResizeObserver, and Stig 1's collision demo sizes itself with one. A no-op is
 * enough: nothing here reads the drawings.
 */
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

/**
 * Animation frames wait in a queue until `frame()` runs the ones already asked for. Running
 * them at once would spin Stig 1's particle simulation, which asks for the next frame from
 * inside each one, forever.
 */
let frames = new Map<number, FrameRequestCallback>();
let lastFrame = 0;
function frame() {
  const due = [...frames.values()];
  frames = new Map();
  act(() => due.forEach((cb) => cb(0)));
}

/** A click, then the frame in which the game reveals and focuses what it opened. */
function press(el: Element) {
  fireEvent.click(el);
  frame();
}

/** Where every element's top is, as far as the components can tell. */
let top = -300;
let phone = true;
let clock = 1000;
const scrollBy = vi.fn();
const scrollTo = vi.fn();

beforeEach(() => {
  localStorage.clear();
  top = -300;
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
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    () =>
      ({
        top,
        bottom: top + 100,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const focused = () => document.activeElement as HTMLElement | null;

/** The answer option whose own text is exactly `text` (the letter prefix aside). */
function option(container: HTMLElement, text: string): HTMLElement {
  const found = [...container.querySelectorAll<HTMLElement>('button.text-left')].find(
    (b) => b.querySelector('span.flex-1')?.textContent === text
  );
  if (!found) throw new Error(`no option "${text}"`);
  return found;
}

describe('Stig 1', () => {
  function toLevel() {
    const { container } = render(<App />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Stig 1: Hraðahugtök/ }));
    return { container, view };
  }

  it('opens at the top, with focus on the question title', () => {
    toLevel();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.tagName).toBe('H2');
    expect(focused()?.textContent).toBe('Hvað er hvarfhraði?');
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
  });

  it('after Athuga focuses the feedback, and drops a Næsta press within 400 ms', () => {
    const { container, view } = toLevel();
    fireEvent.click(option(container, '0,5 M/s'));
    const check = view.getByRole('button', { name: 'Athuga svar' });
    press(check);

    const feedback = focused();
    expect(feedback?.getAttribute('role')).toBe('group');
    expect(feedback?.textContent).toContain('Rangt');
    // Athuga is gone, not relabelled: Næsta is a different element.
    expect(check.isConnected).toBe(false);
    const next = view.getByRole('button', { name: 'Næsta þraut' });
    expect(next).not.toBe(feedback);

    clock += 150;
    fireEvent.click(next);
    expect(view.getByText('Stig 1 / Þraut 1 af 6')).toBeTruthy();

    clock += 400;
    scrollBy.mockClear();
    fireEvent.click(view.getByRole('button', { name: 'Næsta þraut' }));
    expect(view.getByText('Stig 1 / Þraut 2 af 6')).toBeTruthy();
    // The card's top was above the screen: it comes back to the top of the screen.
    expect(scrollBy).toHaveBeenCalledWith({ top: -308, behavior: 'smooth' });
    expect(focused()?.textContent).toBe('Áhrif styrks');
  });

  it('opening the hint focuses the hint, not <body>', () => {
    const { view } = toLevel();
    press(view.getByRole('button', { name: 'Sýna vísbendingu' }));
    expect(focused()).not.toBe(document.body);
    expect(focused()?.textContent?.startsWith('Vísbending:')).toBe(true);
  });

  it('on desktop, moves focus but never the page', () => {
    phone = false;
    const { container, view } = toLevel();
    expect(scrollTo).not.toHaveBeenCalled();
    fireEvent.click(option(container, '0,5 M/s'));
    press(view.getByRole('button', { name: 'Athuga svar' }));
    expect(focused()?.getAttribute('role')).toBe('group');
    clock += 500;
    fireEvent.click(view.getByRole('button', { name: 'Næsta þraut' }));
    expect(scrollBy).not.toHaveBeenCalled();
    expect(focused()?.textContent).toBe('Áhrif styrks');
  });
});

describe('Stig 2', () => {
  it('opens the practice at the top, and after Athuga focuses the verdict', () => {
    const { container } = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.textContent).toBe('Einföld hvörf');

    // Every "Röð í" row: order 0.
    for (const row of container.querySelectorAll('.space-y-4 > div')) {
      fireEvent.click(row.querySelector('button')!);
    }
    press(view.getByRole('button', { name: 'Athuga svar' }));
    const verdict = focused();
    expect(verdict?.getAttribute('role')).toBe('group');
    expect(verdict?.getAttribute('aria-labelledby')).toBe('kinetics-l2-verdict');
    expect(container.querySelector('#kinetics-l2-verdict')?.textContent).toBe('Rangt');

    clock += 150;
    fireEvent.click(view.getByRole('button', { name: 'Næsta þraut' }));
    expect(view.getByText('Stig 2 / Þraut 1 af 6')).toBeTruthy();

    clock += 400;
    fireEvent.click(view.getByRole('button', { name: 'Næsta þraut' }));
    expect(focused()?.textContent).toBe('Núllta stigs hvörf');
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
  });
});

describe('Stig 3', () => {
  function toPractice() {
    const { container } = render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));
    return { container, view };
  }

  it('after Athuga focuses the concept note, and Næsta focuses the next title', () => {
    const { container, view } = toPractice();
    expect(focused()?.textContent).toBe('Milliefni');
    fireEvent.click(option(container, 'NO₂'));
    press(view.getByRole('button', { name: 'Athuga svar' }));

    const note = focused();
    expect(note?.getAttribute('role')).toBe('group');
    expect(note?.textContent).toContain(level3[0].conceptExplanation);
    // The level has no verdict line, so the region is named by the chosen option's mark and
    // described by its explanation: a screen reader hears right or wrong, and why.
    const label = container.querySelector(`#${note?.getAttribute('aria-labelledby')}`);
    expect(label?.getAttribute('aria-label')).toBe('Rangt svar');
    expect(option(container, 'NO₂').contains(label)).toBe(true);
    const why = container.querySelector(`#${note?.getAttribute('aria-describedby')}`);
    expect(why?.textContent).toBe(level3[0].options.find((o) => o.text === 'NO₂')?.explanation);

    clock += 150;
    fireEvent.click(view.getByRole('button', { name: 'Næsta þraut' }));
    expect(view.getByText('Stig 3 / Þraut 1 af 6')).toBeTruthy();

    clock += 400;
    fireEvent.click(view.getByRole('button', { name: 'Næsta þraut' }));
    expect(focused()?.textContent).toBe(level3[1].title);
  });

  it('sets short options two by two on a phone, only while the student is choosing', () => {
    const { container, view } = toPractice();
    const grid = () => container.querySelector('button.text-left')!.parentElement!;
    const next = () => {
      fireEvent.click(container.querySelector<HTMLElement>('button.text-left')!);
      press(view.getByRole('button', { name: 'Athuga svar' }));
      clock += 500;
      fireEvent.click(view.getByRole('button', { name: /Næsta þraut/ }));
    };
    const twoByTwo: string[] = [];
    for (const [i, challenge] of level3.entries()) {
      if (grid().classList.contains('phone:grid-cols-2')) {
        twoByTwo.push(challenge.title);
        // The grid's gap is the only spacing: a phone:space-y-2 would win over phone:space-y-0.
        expect(grid().classList.contains('phone:space-y-2')).toBe(false);
      }
      if (i === level3.length - 1) break;
      next();
    }
    // 'F (flúoratóm)' and every rate law are too long for half a 320 px card.
    expect(twoByTwo).toEqual([level3[3].title, level3[5].title]);

    // Once the verdict shows, the chosen option carries its explanation on a full row.
    fireEvent.click(container.querySelector<HTMLElement>('button.text-left')!);
    press(view.getByRole('button', { name: 'Athuga svar' }));
    expect(grid().classList.contains('phone:grid-cols-2')).toBe(false);
  });
});

describe('the menu', () => {
  it('on return, focuses the first level not yet done', () => {
    localStorage.setItem(
      'kinetics-progress',
      JSON.stringify({
        level1Completed: true,
        level1Score: 60,
        level2Completed: false,
        level2Score: 0,
        level3Completed: false,
        level3Score: 0,
        totalGamesPlayed: 1,
      })
    );
    const { container } = render(<App />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Stig 3: Hvarfgangur/ }));
    expect(focused()?.tagName).toBe('H1');
    fireEvent.click(view.getByRole('button', { name: /Til baka/ }));
    expect(focused()?.getAttribute('data-level-card')).toBe('2');
  });
});
