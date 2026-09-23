import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { Level } from '../components/Level';
import { LEVEL1_CONFIG, LEVEL3_CONFIG } from '../components/levelConfigs';

/**
 * On a phone a level screen is taller than the viewport, and the browser keeps
 * the old scroll offset when React swaps the content. Without help, a student
 * who taps "Næsta efnajafna" at the foot of the page lands below the next
 * equation's coefficient buttons, and the verdict opens at the fold with the
 * way on beneath it.
 *
 * So: the verdict block is scrolled into view (`nearest`, which leaves it alone
 * when it is already visible), and each new screen starts at its top (`start`).
 * Stepping a coefficient is deliberately NOT a new screen — the student stays
 * where they are while the atom table updates.
 */

const scrollIntoView = vi.fn();

beforeEach(() => {
  scrollIntoView.mockClear();
  // jsdom does not implement it; the components call it optionally.
  Element.prototype.scrollIntoView = scrollIntoView;
});

afterEach(() => {
  cleanup();
  delete (Element.prototype as Partial<Element>).scrollIntoView;
  localStorage.clear();
});

const NEAREST = { block: 'nearest', behavior: 'smooth' };
const START = { block: 'start' };

/** The options of every call so far, and the elements they were called on. */
const calls = () =>
  scrollIntoView.mock.calls.map((args, i) => ({
    options: args[0],
    el: scrollIntoView.mock.contexts[i] as HTMLElement,
  }));

describe('a level', () => {
  it('reveals the verdict with the way on, and opens the next equation at the top', () => {
    render(<Level config={LEVEL3_CONFIG} onBack={() => {}} onComplete={() => {}} />);
    expect(calls().map((c) => c.options)).toEqual([START]);

    // Stepping a coefficient does not move the page.
    scrollIntoView.mockClear();
    fireEvent.click(screen.getAllByRole('button', { name: /^Hækka stuðul/ })[0]);
    expect(calls()).toEqual([]);

    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
    const reveal = calls();
    expect(reveal.map((c) => c.options)).toEqual([NEAREST]);
    // The block revealed holds both the verdict and the button that moves on.
    expect(reveal[0].el.textContent).toMatch(/Rétt|Rangt/);
    expect(reveal[0].el.textContent).toMatch(/Næsta efnajafna/);

    scrollIntoView.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /Næsta efnajafna/ }));
    expect(calls().map((c) => c.options)).toEqual([START]);
    // The element scrolled to is the whole screen, header and editor included.
    expect(calls()[0].el.textContent).toMatch(/2\/6/);
    expect(calls()[0].el.querySelector('[role="spinbutton"]')).not.toBeNull();
  });

  it('opens the exercises and the summary at their top', () => {
    render(<Level config={LEVEL1_CONFIG} onBack={() => {}} onComplete={() => {}} />);
    scrollIntoView.mockClear();

    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
    expect(calls().map((c) => c.options)).toEqual([START]);
    expect(calls()[0].el.textContent).toMatch(/1\/7/);

    for (let i = 0; i < 7; i++) {
      fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
      scrollIntoView.mockClear();
      fireEvent.click(screen.getByRole('button', { name: /Næsta efnajafna|Sjá niðurstöður/ }));
    }
    expect(screen.getByText('Niðurstöður')).toBeTruthy();
    expect(calls().map((c) => c.options)).toEqual([START]);
    expect(calls()[0].el.textContent).toMatch(/Niðurstöður/);
  });
});

describe('the menu', () => {
  it('opens at its top when the student comes back from a level', () => {
    render(<App />);
    fireEvent.click(screen.getByText(/Stig 3/));
    scrollIntoView.mockClear();

    fireEvent.click(screen.getByRole('button', { name: /Til baka/ }));
    const menu = calls().filter((c) => c.el.textContent?.includes('Námsleiðin'));
    expect(menu.map((c) => c.options)).toEqual([START]);
  });
});
