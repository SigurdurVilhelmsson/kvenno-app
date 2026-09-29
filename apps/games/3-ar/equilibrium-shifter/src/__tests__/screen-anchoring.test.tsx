import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';

/**
 * Where the page and focus go when the game moves on.
 *
 * On a phone every screen of this game is taller than the screen, and the
 * buttons that move on sit at the bottom of what they replace. The browser
 * kept the scroll position, so the next equilibrium opened with its equation,
 * its ΔH and — in Keppnishamur — the running timer already scrolled past. The
 * game has always brought the top of a new screen or a new equilibrium back
 * when it had gone above the viewport, at every width; that is kept, now
 * through the shared `@shared/utils` helpers. jsdom has no `matchMedia`, so
 * these tests see the desktop layout: the phone-only reveals (the card after a
 * stress, the verdict after an answer) do not scroll here, while focus moves
 * at every width.
 */

function rectWithTop(top: number): DOMRect {
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
}

let now = 0;

describe('the game keeps its place and its focus', () => {
  let top = 0;
  let scrollBy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    top = 0;
    now = 0;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => rectWithTop(top));
    // jsdom implements neither scrollBy nor scrollTo, nor a canvas.
    scrollBy = vi.fn();
    window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    // The Næsta guard reads this clock; each read is half a second later.
    vi.spyOn(performance, 'now').mockImplementation(() => (now += 500));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  const equation = () => document.querySelector<HTMLElement>('[data-item-start]');

  async function openLearning() {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Lærdómshamur/ }));
    await screen.findByText('Veldu álag sem þú vilt beita:');
    // Let the menu finish fading, so the screen swap has run.
    await new Promise((r) => setTimeout(r, 300));
  }

  it('opening Lærdómshamur focuses the equation and leaves a page that fits alone', async () => {
    await openLearning();
    expect(scrollBy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(equation());
  });

  it('choosing a stress focuses the question, and answering focuses the feedback', async () => {
    await openLearning();
    fireEvent.click(document.querySelector('.stress-btn')!);
    await waitFor(() =>
      expect(document.activeElement?.textContent).toBe('Hvert mun jafnvægið hliðrast?')
    );

    fireEvent.click(screen.getByRole('button', { name: /Engin hliðrun/ }));
    const feedback = await screen.findByRole('group', { name: /Rétt!|Rangt/ });
    // It waits for the prediction buttons to fade out before it moves.
    await waitFor(() => expect(document.activeElement).toBe(feedback));
    // Not on Næsta: a second Enter lands on nothing.
    expect(document.activeElement?.tagName).not.toBe('BUTTON');
    // Desktop: the phone-only reveal does not scroll.
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('«Næsta jafnvægi →» brings the new equation back into view and focuses it', async () => {
    await openLearning();
    fireEvent.click(document.querySelector('.stress-btn')!);
    fireEvent.click(screen.getByRole('button', { name: /Engin hliðrun/ }));
    const next = await screen.findByRole('button', { name: /Næsta jafnvægi/ });
    expect(scrollBy).not.toHaveBeenCalled();

    // The student has read down to the button; the top of the game is gone.
    top = -900;
    fireEvent.click(next);

    await waitFor(() => expect(scrollBy).toHaveBeenCalledTimes(1));
    expect(scrollBy.mock.calls[0][0].top).toBeLessThan(0);
    expect(document.activeElement).toBe(equation());
  });

  it('«Prófa annað álag» keeps the same equilibrium where it is, and focuses the stress list', async () => {
    await openLearning();
    fireEvent.click(document.querySelector('.stress-btn')!);
    fireEvent.click(screen.getByRole('button', { name: /Engin hliðrun/ }));
    const again = await screen.findByRole('button', { name: /Prófa annað álag/ });

    top = -900;
    fireEvent.click(again);
    await screen.findByText('Veldu álag sem þú vilt beita:');
    await new Promise((r) => setTimeout(r, 300));
    expect(scrollBy).not.toHaveBeenCalled();
    expect(document.activeElement?.textContent).toBe('Veldu álag sem þú vilt beita:');
  });

  it('a press on Næsta within 400 ms of the feedback appearing is dropped', async () => {
    await openLearning();
    fireEvent.click(document.querySelector('.stress-btn')!);
    // A frozen clock: the second tap of a double tap arrives at once.
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    fireEvent.click(screen.getByRole('button', { name: /Engin hliðrun/ }));
    const eq = equation()?.textContent;
    fireEvent.click(await screen.findByRole('button', { name: /Næsta jafnvægi/ }));
    fireEvent.click(screen.getByRole('button', { name: /Prófa annað álag/ }));
    expect(screen.getByRole('group', { name: /Rétt!|Rangt/ })).toBeTruthy();
    expect(equation()?.textContent).toBe(eq);

    now += 450;
    fireEvent.click(screen.getByRole('button', { name: /Prófa annað álag/ }));
    await screen.findByText('Veldu álag sem þú vilt beita:');
  });

  it('Keppnishamur: «Næsta strax →» brings the timer and the next equation into view', async () => {
    localStorage.setItem(
      'kvenno-chemistry-equilibrium-shifter',
      JSON.stringify({
        currentLevel: 0,
        problemsCompleted: 5,
        lastPlayedDate: '2026-01-01T00:00:00.000Z',
        totalTimeSpent: 0,
        levelProgress: {},
      })
    );
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Keppnishamur/ }));
    await new Promise((r) => setTimeout(r, 300));
    fireEvent.click(await screen.findByRole('button', { name: /Engin hliðrun/ }));
    const next = await screen.findByRole('button', { name: /Næsta strax/ });

    top = -700;
    fireEvent.click(next);

    await waitFor(() => expect(scrollBy).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Spurning 2 / 10')).toBeTruthy();
    expect(document.activeElement).toBe(equation());
  });

  it('opening a mode from a scrolled-down menu starts the game at its top', async () => {
    render(<App />);
    // On a phone the mode cards are below the fold of the menu.
    top = -600;
    fireEvent.click(screen.getByRole('button', { name: /Lærdómshamur/ }));

    // It waits for the menu to fade out before it measures.
    expect(scrollBy).not.toHaveBeenCalled();
    await waitFor(() => expect(scrollBy).toHaveBeenCalledTimes(1));
    expect(scrollBy.mock.calls[0][0].top).toBeLessThan(0);
  });

  it('back on the menu, Lærdómshamur is focused', async () => {
    await openLearning();
    fireEvent.click(screen.getByRole('button', { name: /Til baka/ }));
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /Lærdómshamur/ }))
    );
  });
});
