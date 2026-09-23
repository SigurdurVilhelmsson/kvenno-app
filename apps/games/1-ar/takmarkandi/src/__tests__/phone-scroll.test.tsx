import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

/**
 * On a phone a level screen is taller than the viewport, and the browser keeps
 * the old scroll offset when React swaps the content. Without help, a student
 * who taps "Næsta spurning" at the foot of the screen lands below the next
 * question's equation, and a verdict can appear entirely under the fold.
 *
 * So: a verdict is scrolled into view (`nearest`, which leaves it alone when
 * it is already visible), and each new screen starts at its top (`start`).
 * Moving between the three steps of one Stig 3 problem is deliberately NOT a
 * new screen — the given masses stay put and the student stays where they are.
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

describe('Stig 1', () => {
  it('reveals the verdict once answered, and opens the next question at the top', () => {
    render(<Level1 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText(/Byrja æfingar/));
    scrollIntoView.mockClear();

    const [card] = screen
      .getAllByRole('button')
      .filter((b) => /sameindur/.test(b.textContent ?? ''));
    fireEvent.click(card);
    const reveal = calls().filter((c) => c.options?.block === 'nearest');
    expect(reveal).toHaveLength(1);
    expect(reveal[0].options).toEqual(NEAREST);
    // The block revealed holds both the verdict and the way on.
    expect(reveal[0].el.textContent).toMatch(/Rétt|Rangt/);
    expect(reveal[0].el.textContent).toMatch(/Næsta spurning/);
    expect(calls().some((c) => c.options?.block === 'start')).toBe(false);

    scrollIntoView.mockClear();
    fireEvent.click(screen.getByText(/Næsta spurning/));
    expect(calls().map((c) => c.options)).toEqual([START]);
    expect(calls()[0].el.textContent).toMatch(/2\/8/);
  });
});

describe('Stig 2', () => {
  it('reveals the verdict and the worked solution, then opens the next question at the top', () => {
    const { container } = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    scrollIntoView.mockClear();

    fireEvent.change(container.querySelector('input')!, { target: { value: '9999' } });
    fireEvent.click(screen.getByText('Athuga'));
    const reveal = calls().filter((c) => c.options?.block === 'nearest');
    expect(reveal).toHaveLength(1);
    expect(reveal[0].el.textContent).toMatch(/Útreikningur/);
    expect(reveal[0].el.textContent).toMatch(/Næsta spurning/);

    scrollIntoView.mockClear();
    fireEvent.click(screen.getByText(/Næsta spurning/));
    expect(calls().map((c) => c.options)).toEqual([START]);
  });
});

describe('Stig 3', () => {
  it('reveals each verdict but keeps the student in place between the steps of one problem', () => {
    const { container } = render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    scrollIntoView.mockClear();

    // Step 1: pick either reactant; right or wrong, a verdict appears.
    const formulaButtons = Array.from(container.querySelectorAll('button.font-mono'));
    fireEvent.click(formulaButtons[0]);
    fireEvent.click(screen.getByText('Athuga'));
    expect(calls().map((c) => c.options)).toEqual([NEAREST]);
    expect(calls()[0].el.textContent).toMatch(/Áfram/);

    // Steps 2 and 3 are the same screen: no jump to the top.
    for (let step = 0; step < 2; step++) {
      scrollIntoView.mockClear();
      fireEvent.click(screen.getByText(/Áfram/));
      expect(calls()).toEqual([]);
      fireEvent.change(container.querySelector('input')!, { target: { value: '1' } });
      fireEvent.click(screen.getByText('Athuga'));
      expect(calls().map((c) => c.options)).toEqual([NEAREST]);
    }

    // The review is a new screen, and so is the next problem.
    scrollIntoView.mockClear();
    fireEvent.click(screen.getByText(/Áfram/));
    expect(calls().map((c) => c.options)).toEqual([START]);
    expect(calls()[0].el.textContent).toMatch(/Útreikningurinn/);

    scrollIntoView.mockClear();
    fireEvent.click(screen.getByText(/Næsta verkefni/));
    expect(calls().map((c) => c.options)).toEqual([START]);
    expect(calls()[0].el.textContent).toMatch(/2\/5/);
  });
});

describe('Valmynd', () => {
  it('opens at its top when a student comes back from a level', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Meistarapróf'));
    scrollIntoView.mockClear();

    fireEvent.click(screen.getByText('← Til baka'));
    const toTop = calls().filter((c) => c.options?.block === 'start');
    expect(toTop).toHaveLength(1);
    expect(toTop[0].el.textContent).toMatch(/Grunnhugtök/);
  });
});
