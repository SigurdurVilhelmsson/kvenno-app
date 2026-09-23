import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

/**
 * On a phone every screen of this game is taller than the viewport, and the
 * browser keeps the old scroll offset when React swaps the content. Without
 * help, a student who taps "Næsta spurning" at the foot of the screen lands
 * below the next question, and opening Stig 2 from the menu lands halfway
 * down its teaching text.
 *
 * So each new screen starts at the top of the page, with window.scrollTo. Not
 * scrollIntoView: Chrome moves the keyboard's Tab starting point to whatever
 * scrollIntoView scrolls to, so a student pressing Enter on "Sjáum dæmi" and
 * then Tab would land back on the header instead of on "Eitt dæmi til". The
 * tests below assert a screen change never calls it.
 *
 * In Stig 1 and Stig 2 the verdict is drawn below the option cards or the
 * orbital diagram, entirely under the fold on a 360x740 phone, so that block
 * is scrolled into view (`nearest`, which leaves it alone when it is already
 * visible). Stig 3's verdict replaces the "Athuga svar" button in place and is
 * already in view, so it gets none.
 */

type Call = { kind: 'top' } | { kind: 'reveal'; options: unknown; el: HTMLElement };
let log: Call[] = [];
/** What the page said when each scroll-to-top happened. */
let screens: string[] = [];

beforeEach(() => {
  log = [];
  screens = [];
  // jsdom implements neither; record what the components ask for.
  Element.prototype.scrollIntoView = vi.fn(function (this: HTMLElement, options?: unknown) {
    log.push({ kind: 'reveal', options, el: this });
  });
  vi.spyOn(window, 'scrollTo').mockImplementation(((...args: unknown[]) => {
    expect(args).toEqual([0, 0]);
    log.push({ kind: 'top' });
    screens.push(document.body.textContent ?? '');
  }) as typeof window.scrollTo);
});

afterEach(() => {
  cleanup();
  delete (Element.prototype as Partial<Element>).scrollIntoView;
  vi.restoreAllMocks();
  localStorage.clear();
});

const NEAREST = { block: 'nearest', behavior: 'smooth' };
const kinds = () => log.map((c) => c.kind);
const reveal = () => {
  const r = log.find((c) => c.kind === 'reveal');
  if (!r || r.kind !== 'reveal') throw new Error('no reveal');
  return r;
};
const reset = () => {
  log = [];
  screens = [];
};

describe('Stig 1', () => {
  it('opens every teaching step and question at the top, and reveals the verdict', () => {
    render(<Level1 onComplete={() => {}} onBack={() => {}} />);
    expect(kinds()).toEqual(['top']);

    for (const next of [/Sjáum dæmi/, /Eitt dæmi til/, /byrja æfingar/]) {
      reset();
      fireEvent.click(screen.getByRole('button', { name: next }));
      expect(kinds()).toEqual(['top']);
    }
    expect(screens[0]).toMatch(/Spurning 1 \/ 8/);

    reset();
    const [card] = document.querySelectorAll<HTMLButtonElement>('button.quantum-card');
    fireEvent.click(card);
    // Choosing an option is not a new screen.
    expect(kinds()).toEqual([]);

    fireEvent.click(screen.getByRole('button', { name: /Athuga svar/ }));
    expect(kinds()).toEqual(['reveal']);
    expect(reveal().options).toEqual(NEAREST);
    // The block revealed holds both the verdict and the way on.
    expect(reveal().el.textContent).toMatch(/Rétt!|Ekki rétt/);
    expect(reveal().el.textContent).toMatch(/Næsta spurning/);

    reset();
    fireEvent.click(screen.getByRole('button', { name: /Næsta spurning/ }));
    expect(kinds()).toEqual(['top']);
    expect(screens[0]).toMatch(/Spurning 2 \/ 8/);
  });
});

describe('Stig 2', () => {
  it('opens the exercises and each element at the top, and reveals the verdict', () => {
    render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    reset();

    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
    expect(kinds()).toEqual(['top']);
    expect(screens[0]).toMatch(/Frumefni 1 \/ 8/);

    reset();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '1s2' } });
    fireEvent.click(screen.getByRole('button', { name: /Athuga svar/ }));
    expect(kinds()).toEqual(['reveal']);
    expect(reveal().options).toEqual(NEAREST);
    expect(reveal().el.textContent).toMatch(/Ekki rétt/);
    expect(reveal().el.textContent).toMatch(/Næsta frumefni/);
    // The orbital diagram stays where it is, above the revealed block.
    expect(reveal().el.textContent).not.toMatch(/Svigrúmamynd/);

    reset();
    fireEvent.click(screen.getByRole('button', { name: /Næsta frumefni/ }));
    expect(kinds()).toEqual(['top']);
    expect(screens[0]).toMatch(/Frumefni 2 \/ 8/);
  });

  it('keeps phone keyboards from capitalising or correcting the configuration', () => {
    render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('autocapitalize')).toBe('none');
    expect(input.getAttribute('autocorrect')).toBe('off');
    expect(input.getAttribute('autocomplete')).toBe('off');
    expect(input.getAttribute('spellcheck')).toBe('false');
  });
});

describe('Stig 3', () => {
  it('opens the exercises and each element at the top, and leaves the verdict in place', () => {
    render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    reset();

    fireEvent.click(screen.getByRole('button', { name: /Byrja æfingar/ }));
    expect(kinds()).toEqual(['top']);

    reset();
    const [option] = document.querySelectorAll<HTMLButtonElement>('button.mc-option');
    fireEvent.click(option);
    fireEvent.click(screen.getByRole('button', { name: /Athuga svar/ }));
    expect(kinds()).toEqual([]);

    fireEvent.click(screen.getByRole('button', { name: /Næsta frumefni/ }));
    expect(kinds()).toEqual(['top']);
    expect(screens[0]).toMatch(/Frumefni 2 \/ 8/);
  });
});

describe('menu', () => {
  it('opens at the top when a student comes back from a level', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Stig 2: Rafeindasmíð/ }));
    reset();

    fireEvent.click(screen.getByRole('button', { name: /Til baka/ }));
    expect(kinds()).toEqual(['top']);
    expect(screens[0]).toMatch(/Hvað er rafeindabygging\?/);
  });
});
