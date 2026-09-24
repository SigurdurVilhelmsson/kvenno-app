// @vitest-environment jsdom
/**
 * Where the screen lands, and where focus goes, as the student moves through the game.
 *
 * Every screen here is taller than a phone. The browser keeps the scroll offset when React
 * swaps the content, so the Stig 1 quiz used to open about 870 px down with the molecule above
 * the screen, and focus fell to <body> each time the button that was pressed unmounted. The
 * game now uses the shared helpers in `@shared/utils` (`reveal.ts`, `armed.ts`), and these
 * tests hold it to them:
 *
 * - A screen swap starts the new screen at the top on a phone and focuses its heading (the
 *   Stig 1 quiz has none, so its molecule's formula); back on the menu, the first level not
 *   yet done is focused.
 * - After Athuga, focus moves to the feedback, not to Næsta, so a second Enter lands on
 *   nothing; and Næsta ignores a press within 400 ms of appearing, so a second tap cannot
 *   skip the feedback either.
 * - Næsta brings the new item's top back on a phone and focuses its first line.
 *
 * jsdom has no layout, so every box is stubbed. Queries are scoped to the rendered container
 * (vitest `retry: 2`).
 */
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY } from '@shared/utils';

import App from '../App';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

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
  // Frames run at once, so the commit reveal can be read synchronously.
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(0);
    return 0;
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

describe('Stig 1', () => {
  function toQuiz() {
    const { container } = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Hefja æfingar/ }));
    return view;
  }

  it('opens the quiz at the top, with focus on the molecule', () => {
    toQuiz();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.textContent).toBe('H₂O');
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
  });

  it('after Athuga focuses the feedback, and drops a Næsta press within 400 ms', () => {
    const view = toQuiz();
    fireEvent.click(view.getByRole('button', { name: /London dreifikraftar/ }));
    fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));

    const feedback = focused();
    expect(feedback?.getAttribute('role')).toBe('group');
    expect(feedback?.textContent).toContain('Rangt');
    expect(view.getByRole('button', { name: 'Næsta sameind' })).not.toBe(feedback);

    clock += 150;
    fireEvent.click(view.getByRole('button', { name: 'Næsta sameind' }));
    expect(view.getByText('Sameind 1 af 10')).toBeTruthy();

    clock += 400;
    scrollBy.mockClear();
    fireEvent.click(view.getByRole('button', { name: 'Næsta sameind' }));
    expect(view.getByText('Sameind 2 af 10')).toBeTruthy();
    // The card's top was above the screen: it comes back under the (absent) header.
    expect(scrollBy).toHaveBeenCalledWith({ top: -308, behavior: 'smooth' });
    expect(focused()?.textContent).toBe('CH₄');
  });

  it('on desktop, moves focus but never the page', () => {
    phone = false;
    const view = toQuiz();
    expect(scrollTo).not.toHaveBeenCalled();
    fireEvent.click(view.getByRole('button', { name: /London dreifikraftar/ }));
    fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));
    clock += 500;
    fireEvent.click(view.getByRole('button', { name: 'Næsta sameind' }));
    expect(scrollBy).not.toHaveBeenCalled();
    expect(focused()?.textContent).toBe('CH₄');
  });
});

describe('Stig 2', () => {
  it('after Athuga focuses the verdict, and Næsta focuses the next question', () => {
    const { container } = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    const pool = () =>
      [...container.querySelectorAll<HTMLButtonElement>('button:not([aria-label])')].filter((b) =>
        /M = /.test(b.textContent ?? '')
      );
    while (pool().length) fireEvent.click(pool()[0]);
    fireEvent.click(view.getByRole('button', { name: 'Athuga röðun' }));

    const verdict = focused();
    expect(verdict?.getAttribute('role')).toBe('group');
    expect(verdict?.getAttribute('aria-labelledby')).toBe('imf-l2-verdict');

    clock += 500;
    fireEvent.click(view.getByRole('button', { name: 'Næsta verkefni' }));
    expect(focused()?.tagName).toBe('H2');
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
  });
});

describe('Stig 3', () => {
  it('after Athuga focuses the verdict, and Næsta focuses the next title', () => {
    const { container } = render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    fireEvent.click(container.querySelector('.space-y-3 > button')!);
    fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));

    expect(focused()?.getAttribute('aria-labelledby')).toBe('imf-l3-verdict');

    clock += 150;
    fireEvent.click(view.getByRole('button', { name: 'Næsta spurning' }));
    expect(view.getByText('Spurning 1 af 10')).toBeTruthy();

    clock += 400;
    fireEvent.click(view.getByRole('button', { name: 'Næsta spurning' }));
    expect(view.getByText('Spurning 2 af 10')).toBeTruthy();
    expect(focused()?.tagName).toBe('H2');
  });
});

describe('the menu', () => {
  it('on return, focuses the first level not yet done', () => {
    localStorage.setItem(
      'imf-progress',
      JSON.stringify({
        level1Completed: true,
        level1Score: 90,
        level2Completed: false,
        level2Score: 0,
        level3Completed: false,
        level3Score: 0,
        totalGamesPlayed: 1,
      })
    );
    const { container } = render(<App />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Stig 3: Flókin greining/ }));
    expect(focused()?.tagName).toBe('H2');
    fireEvent.click(view.getByRole('button', { name: /Til baka/ }));
    expect(focused()?.getAttribute('data-level-card')).toBe('2');
  });
});
