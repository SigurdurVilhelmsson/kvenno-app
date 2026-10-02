// @vitest-environment jsdom
/**
 * Where the screen lands, and where focus goes, as the student moves through the game.
 *
 * Every screen here is taller than a phone. The game's own helper used to start each new
 * screen at the top below md and bring a revealed panel into view, and focus fell to <body>
 * each time the pressed button unmounted. The game now uses the shared helpers in
 * `@shared/utils` (`reveal.ts`, `armed.ts`), and these tests hold it to them:
 *
 * - On a phone a screen swap starts at the top and focuses its heading, or where the level
 *   starts when it has none; back on the menu, the first level not yet done is focused.
 * - After Athuga, focus moves to the feedback, not to Næsta, and Næsta ignores a press
 *   within 400 ms of appearing, so neither a second Enter nor a second tap skips it.
 * - Næsta brings the new item's top back on a phone and focuses its first line.
 * - Stig 1's explore widgets are tabs on a phone, under a radio-group shape picker.
 * - Between a phone and md the game keeps exactly what its old helper did there; from md
 *   up the page never moves, and only focus does.
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

type Width = 'phone' | 'tablet' | 'desktop';
let width: Width = 'phone';
let clock = 1000;
const scrollBy = vi.fn();
const scrollTo = vi.fn();

/** Every box's top is -300 (scrolled past), except Stig 2's revealed molecule, at -500. */
function topOf(el: Element): number {
  return el.hasAttribute('data-revealed') ? -500 : -300;
}

beforeEach(() => {
  localStorage.clear();
  width = 'phone';
  clock = 1000;
  scrollBy.mockClear();
  scrollTo.mockClear();
  window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
  window.matchMedia = vi.fn((query: string) => ({
    matches:
      (query === PHONE_QUERY && width === 'phone') ||
      (query === '(max-width: 47.99rem)' && width !== 'desktop'),
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
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const top = topOf(this);
    return {
      top,
      bottom: top + 100,
      left: 0,
      right: 100,
      width: 100,
      height: 100,
      x: 0,
      y: top,
      toJSON: () => ({}),
    } as DOMRect;
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const focused = () => document.activeElement as HTMLElement | null;

describe('the menu', () => {
  it('opens each level at the top on a phone, focused where it starts', () => {
    const { container } = render(<App />);
    const view = within(container);
    expect(scrollTo).not.toHaveBeenCalled();

    fireEvent.click(view.getByRole('button', { name: /Stig 1: VSEPR Kenning/ }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.textContent).toBe('Kannaðu mismunandi sameindarlögun');

    fireEvent.click(view.getByRole('button', { name: /Til baka/ }));
    fireEvent.click(view.getByRole('button', { name: /Stig 2: Spá fyrir um lögun/ }));
    // Stig 2 has no heading of its own: focus goes to the molecule's formula.
    expect(focused()?.textContent).toBe('H₂O');
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);

    fireEvent.click(view.getByRole('button', { name: /Til baka/ }));
    fireEvent.click(view.getByRole('button', { name: /Stig 3: Svigrúmablöndun og skautun/ }));
    expect(focused()?.textContent).toMatch(/^Hvaða svigrúmablöndun/);
  });

  it('on return, focuses the first level not yet done', () => {
    localStorage.setItem(
      'vsepr-geometry-progress',
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
    fireEvent.click(view.getByRole('button', { name: /Stig 3: Svigrúmablöndun og skautun/ }));
    fireEvent.click(view.getByRole('button', { name: /Til baka/ }));
    expect(focused()?.getAttribute('data-level-card')).toBe('2');
  });

  it('between a phone and md, jumps to the top as the old helper did', () => {
    width = 'tablet';
    const { container } = render(<App />);
    fireEvent.click(within(container).getByRole('button', { name: /Stig 3: Svigrúmablöndun/ }));
    // No site header on a level screen: the page's top goes to 0, in one jump.
    expect(scrollBy).toHaveBeenCalledWith({ top: -308, behavior: 'auto' });
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('from md up moves focus, never the page', () => {
    width = 'desktop';
    const { container } = render(<App />);
    fireEvent.click(within(container).getByRole('button', { name: /Stig 3: Svigrúmablöndun/ }));
    expect(scrollBy).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
    expect(focused()?.textContent).toMatch(/^Hvaða svigrúmablöndun/);
  });
});

describe('Stig 1, explore', () => {
  // The shape-transition animation loops on animation frames, which the stub above runs at
  // once; nothing on this screen waits for a frame, so frames never run here.
  beforeEach(() => {
    vi.mocked(window.requestAnimationFrame).mockImplementation(() => 0);
  });

  it('on a phone: the shape picker is a radio group, and the widgets are tabs under it', () => {
    const { container } = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);

    const picker = view.getByRole('radiogroup');
    const radios = within(picker).getAllByRole('radio');
    expect(radios).toHaveLength(8);
    expect(radios[0].getAttribute('tabindex')).toBe('0');

    const tabs = view.getAllByRole('tab').map((t) => t.textContent);
    expect(tabs).toEqual(['Fráhrinding', 'Lögunarbreyting', 'Tengihorn', 'Lýsing']);
    // One panel shows at a time, and every widget stays mounted.
    expect(container.querySelectorAll('[role=tabpanel]')).toHaveLength(4);
    expect(container.querySelectorAll('[role=tabpanel]:not([hidden])')).toHaveLength(1);
    expect(view.getByRole('tabpanel').textContent).toContain('Fráhrinding');

    // Arrow keys move along the tabs, and the tab they land on opens.
    fireEvent.keyDown(view.getByRole('tab', { name: 'Fráhrinding' }), { key: 'ArrowLeft' });
    expect(focused()?.textContent).toBe('Lýsing');
    expect(view.getByRole('tab', { name: 'Lýsing' }).getAttribute('aria-selected')).toBe('true');
    expect(view.getByRole('tabpanel').textContent).toContain('Smelltu á lögun');

    // A pick is shown in the open tab, and the tabs and that tab are brought into view.
    fireEvent.click(view.getByRole('radio', { name: /^Áttflötungur/ }));
    expect(view.getByRole('radio', { name: /Áttflötungur/ }).getAttribute('aria-checked')).toBe(
      'true'
    );
    expect(view.getByRole('tabpanel').textContent).toContain('Sex svæði rafeindaþéttleika');
    expect(scrollBy).toHaveBeenCalledWith({ top: -308, behavior: 'smooth' });

    // Arrow keys move the pick along the shapes, and focus with it.
    fireEvent.keyDown(focused()!, { key: 'ArrowRight' });
    fireEvent.keyDown(view.getByRole('radio', { name: /Áttflötungur/ }), { key: 'ArrowRight' });
    expect(focused()?.textContent).toContain('Línuleg');
    expect(focused()?.getAttribute('aria-checked')).toBe('true');
  });

  it('elsewhere keeps the widgets stacked and the grid of buttons', () => {
    width = 'desktop';
    const { container } = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    expect(view.queryByRole('tablist')).toBeNull();
    expect(view.queryByRole('radiogroup')).toBeNull();
    fireEvent.click(view.getByRole('button', { name: /^Línuleg/ }));
    expect(view.getByText('Rafeindalögun')).toBeTruthy();
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('between a phone and md, brings the details into view as the old helper did', () => {
    width = 'tablet';
    const { container } = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(within(container).getByRole('button', { name: /^Línuleg/ }));
    expect(scrollBy).toHaveBeenCalledWith({ top: -300, behavior: 'smooth' });
  });
});

describe('Stig 1, questions', () => {
  function toQuiz() {
    const { container } = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Hefja spurningar/ }));
    return { view, container };
  }

  it('opens at the top, with focus on the question', () => {
    toQuiz();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.textContent).toBe('Hvaða lögun hefur CO₂ (koldíoxíð)?');
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
  });

  it('after Athuga focuses the feedback, and drops a Næsta press within 400 ms', () => {
    const { view } = toQuiz();
    fireEvent.click(view.getByRole('button', { name: /Beygð/ }));
    fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));

    const feedback = focused();
    expect(feedback?.getAttribute('role')).toBe('group');
    expect(feedback?.textContent).toContain('Rangt');

    clock += 150;
    fireEvent.click(view.getByRole('button', { name: 'Næsta spurning' }));
    expect(view.getByText('Spurning 1 af 8')).toBeTruthy();

    clock += 400;
    scrollBy.mockClear();
    fireEvent.click(view.getByRole('button', { name: 'Næsta spurning' }));
    expect(view.getByText('Spurning 2 af 8')).toBeTruthy();
    // The card's top was above the screen: it comes back, and the question is focused.
    expect(scrollBy).toHaveBeenCalledWith({ top: -308, behavior: 'smooth' });
    expect(focused()?.textContent).toMatch(/^Hversu mörg svæði rafeindaþéttleika/);
  });

  it('opening the hint moves focus to it', () => {
    const { view } = toQuiz();
    fireEvent.click(view.getByRole('button', { name: 'Sýna vísbendingu' }));
    expect(focused()?.textContent).toMatch(/^Vísbending:/);
  });

  it('between a phone and md, jumps each new question to the top as the old helper did', () => {
    width = 'tablet';
    const { view } = toQuiz();
    expect(scrollBy).toHaveBeenCalledWith({ top: -308, behavior: 'auto' });
    fireEvent.click(view.getByRole('button', { name: /Beygð/ }));
    fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));
    clock += 500;
    scrollBy.mockClear();
    fireEvent.click(view.getByRole('button', { name: 'Næsta spurning' }));
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenCalledWith({ top: -308, behavior: 'auto' });
  });

  it('from md up moves focus, never the page', () => {
    width = 'desktop';
    const { view } = toQuiz();
    fireEvent.click(view.getByRole('button', { name: /Beygð/ }));
    fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));
    expect(focused()?.getAttribute('role')).toBe('group');
    clock += 500;
    fireEvent.click(view.getByRole('button', { name: 'Næsta spurning' }));
    expect(focused()?.textContent).toMatch(/^Hversu mörg svæði rafeindaþéttleika/);
    expect(scrollBy).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

describe('Stig 2', () => {
  function start() {
    const { container } = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    const check = () => fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));
    const next = () => {
      clock += 500;
      fireEvent.click(view.getByRole('button', { name: /Næsta skref|Næsta sameind/ }));
    };
    const count = (bonding: string, lone: string) => {
      const [b, l] = Array.from(container.querySelectorAll('input[type=number]'));
      fireEvent.change(b, { target: { value: bonding } });
      fireEvent.change(l, { target: { value: lone } });
      check();
    };
    return { view, container, check, next, count };
  }

  it('after Athuga focuses the verdict, and each step focuses its question', () => {
    const { view, count, next } = start();
    count('2', '2');
    expect(focused()?.getAttribute('role')).toBe('group');
    expect(focused()?.getAttribute('aria-labelledby')).toBe('vsepr-l2-verdict');
    expect(scrollBy).toHaveBeenCalledWith({ top: -308, behavior: 'smooth' });

    clock += 150;
    fireEvent.click(view.getByRole('button', { name: 'Næsta skref' }));
    expect(view.queryByText(/hvaða/)).toBeNull();

    next();
    expect(focused()?.textContent).toMatch(/^Með 2 stökum pörum, hvaða/);
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
  });

  it('a right shape shows the revealed molecule from its top on a phone', () => {
    const { view, count, next, check, container } = start();
    count('2', '2');
    next();
    // Mark the revealed molecule once it exists, so its box can be told apart.
    fireEvent.click(view.getByRole('button', { name: /Beygð/ }));
    scrollBy.mockClear();
    check();
    const molecule = container.querySelector('[data-revealed]');
    expect(molecule).not.toBeNull();
    expect(scrollBy).toHaveBeenCalledWith({ top: -508, behavior: 'smooth' });
    expect(focused()?.getAttribute('aria-labelledby')).toBe('vsepr-l2-verdict');
  });

  it('on a phone the repulsion animation follows Næsta, and is behind a button from the angle step', () => {
    const { view, count, next, check } = start();
    count('2', '2');
    next();
    fireEvent.click(view.getByRole('button', { name: /Beygð/ }));
    check();
    const nextButton = view.getByRole('button', { name: 'Næsta skref' });
    const why = view.getByText('Hvers vegna þessi lögun?');
    expect(nextButton.compareDocumentPosition(why) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    next();
    const disclosure = view.getByRole('button', { name: 'Hvers vegna þessi lögun?' });
    expect(disclosure.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(disclosure);
    expect(disclosure.getAttribute('aria-expanded')).toBe('true');
  });

  it('Enter in the angle field checks it', () => {
    const { view, count, next, check, container } = start();
    count('2', '2');
    next();
    fireEvent.click(view.getByRole('button', { name: /Beygð/ }));
    check();
    next();
    const field = container.querySelector('input[type=text]') as HTMLInputElement;
    fireEvent.change(field, { target: { value: '104,5' } });
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(view.getByText('Rétt! Tengihornið er 104,5°')).toBeTruthy();
  });

  it('between a phone and md, brings Næsta into view after a right shape, as the old helper did', () => {
    width = 'tablet';
    const { view, count, next, check } = start();
    count('2', '2');
    expect(scrollBy).not.toHaveBeenCalled();
    next();
    fireEvent.click(view.getByRole('button', { name: /Beygð/ }));
    check();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenCalledWith({ top: -300, behavior: 'smooth' });
  });

  it('from md up moves focus, never the page', () => {
    width = 'desktop';
    const { view, count, next, check } = start();
    count('2', '2');
    next();
    fireEvent.click(view.getByRole('button', { name: /Beygð/ }));
    check();
    expect(focused()?.getAttribute('aria-labelledby')).toBe('vsepr-l2-verdict');
    expect(scrollBy).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
    // The repulsion animation sits under the molecule, not behind a button.
    expect(view.queryByRole('button', { name: 'Hvers vegna þessi lögun?' })).toBeNull();
  });
});

describe('Stig 3', () => {
  it('after Athuga focuses the verdict, and Næsta focuses the next question', () => {
    const { container } = render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    fireEvent.click(container.querySelector('button:has(span.uppercase)')!);
    fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));
    expect(focused()?.getAttribute('aria-labelledby')).toBe('vsepr-l3-verdict');

    clock += 150;
    fireEvent.click(view.getByRole('button', { name: 'Næsta spurning' }));
    expect(view.getByText('Spurning 1 af 12')).toBeTruthy();

    clock += 400;
    fireEvent.click(view.getByRole('button', { name: 'Næsta spurning' }));
    expect(view.getByText('Spurning 2 af 12')).toBeTruthy();
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
  });

  it('on a phone the reference tables start closed behind their headings', () => {
    const { container } = render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    for (const name of [/Tafla um svigrúmablöndun/, /Skautun/]) {
      expect(view.getByRole('button', { name }).getAttribute('aria-expanded')).toBe('false');
    }
  });
});
