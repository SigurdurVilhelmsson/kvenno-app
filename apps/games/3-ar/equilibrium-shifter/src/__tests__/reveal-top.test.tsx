import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { revealTop } from '../utils/reveal';

/**
 * On a phone every screen of this game is two or three screens tall, and the
 * buttons that move on sit at the bottom of what they replace. The browser
 * kept the scroll position, so the next equilibrium opened with its equation,
 * its ΔH and — in Keppnishamur — the running timer already scrolled past.
 * `revealTop` brings the top of the new screen back, and only when it is
 * above the viewport, so a layout that fits never moves.
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

describe('revealTop', () => {
  it('scrolls an element whose top is above the viewport', () => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => rectWithTop(-250);
    el.scrollIntoView = vi.fn();

    expect(revealTop(el)).toBe(true);
    expect(el.scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' });
  });

  it('jumps rather than glides when less motion is wanted', () => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => rectWithTop(-250);
    el.scrollIntoView = vi.fn();

    revealTop(el, false);
    expect(el.scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'auto' });
  });

  it('leaves an element alone when its top is on screen', () => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => rectWithTop(0);
    el.scrollIntoView = vi.fn();

    expect(revealTop(el)).toBe(false);
    expect(el.scrollIntoView).not.toHaveBeenCalled();
  });

  it('does nothing without an element', () => {
    expect(revealTop(null)).toBe(false);
    expect(revealTop(undefined)).toBe(false);
  });
});

describe('a new equilibrium opens at its top', () => {
  let top = 0;
  const scrolled: Element[] = [];

  beforeEach(() => {
    localStorage.clear();
    top = 0;
    scrolled.length = 0;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => rectWithTop(top));
    // jsdom implements neither scrollIntoView nor scrollTo.
    Element.prototype.scrollIntoView = vi.fn(function (this: Element) {
      scrolled.push(this);
    });
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    // The particle picture draws on a canvas jsdom does not have.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  /** The stats bar ("← Til baka" and, in Keppnishamur, the timer) heads the game screen. */
  const isGameTop = (el: Element) => el.textContent?.includes('← Til baka') ?? false;

  it('Lærdómshamur: «Næsta jafnvægi →» brings the new equation back into view', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Lærdómshamur/ }));
    await screen.findByText('Veldu álag sem þú vilt beita:');
    // Everything on screen: opening the mode must not move the page.
    await new Promise((r) => setTimeout(r, 300));
    expect(scrolled).toHaveLength(0);

    fireEvent.click(document.querySelector('.stress-btn')!);
    fireEvent.click(screen.getByRole('button', { name: /Engin hliðrun/ }));
    const next = await screen.findByRole('button', { name: /Næsta jafnvægi/ });
    expect(scrolled).toHaveLength(0);

    // The student has read down to the button; the top of the game is gone.
    top = -900;
    fireEvent.click(next);

    await waitFor(() => expect(scrolled).toHaveLength(1));
    expect(isGameTop(scrolled[0])).toBe(true);
  });

  it('Lærdómshamur: «Prófa annað álag» keeps the same equilibrium where it is', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Lærdómshamur/ }));
    await screen.findByText('Veldu álag sem þú vilt beita:');
    // Let the menu finish fading, so its own check has run.
    await new Promise((r) => setTimeout(r, 300));

    fireEvent.click(document.querySelector('.stress-btn')!);
    fireEvent.click(screen.getByRole('button', { name: /Engin hliðrun/ }));
    const again = await screen.findByRole('button', { name: /Prófa annað álag/ });

    top = -900;
    fireEvent.click(again);
    await screen.findByText('Veldu álag sem þú vilt beita:');
    await new Promise((r) => setTimeout(r, 300));
    expect(scrolled).toHaveLength(0);
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

    await waitFor(() => expect(scrolled).toHaveLength(1));
    expect(isGameTop(scrolled[0])).toBe(true);
    expect(scrolled[0].textContent).toContain('Spurning 2 / 10');
  });

  it('opening a mode from a scrolled-down menu starts the game at its top', async () => {
    render(<App />);
    // On a phone the mode cards are below the fold of the menu.
    top = -600;
    fireEvent.click(screen.getByRole('button', { name: /Lærdómshamur/ }));

    // It waits for the menu to fade out before it measures.
    expect(scrolled).toHaveLength(0);
    await waitFor(() => expect(scrolled).toHaveLength(1));
    expect(isGameTop(scrolled[0])).toBe(true);
  });
});
