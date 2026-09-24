import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { AefaScreen } from '../components/AefaScreen';
import { BeitaScreen } from '../components/BeitaScreen';
import { KannaScreen } from '../components/KannaScreen';
import { SkiljaScreen } from '../components/SkiljaScreen';
import { PROBLEMS } from '../data/problems';
import { deriveEmpirical } from '../engine/empirical';
import { reveal, revealDelta, revealLastColumn } from '../utils/reveal';

/**
 * On a phone several taps in this game change something away from the finger:
 * "Næsta súla" adds a column to a table above the button — and from the third
 * column on, off the right-hand edge of a 360 px screen — "Svara" and "Athuga"
 * open a verdict under the input, and "Næsta efni" / "Næsta dæmi" swap in a new
 * compound at the top of a card the student has scrolled past. These tests hold
 * the scrolling that brings each change into view, and hold that nothing moves
 * when the change is already on screen, which is the desktop case.
 */

const HEADER = 56;
const VIEW = 740;

const box = (top: number, bottom: number) =>
  ({ top, bottom, left: 0, right: 100, width: 100, height: bottom - top }) as DOMRect;

describe('revealDelta', () => {
  it('does not move a box that is already on screen', () => {
    expect(revealDelta({ top: 100, bottom: 300 }, HEADER, VIEW)).toBe(0);
  });

  it('brings a box below the fold up by the least distance, plus a margin', () => {
    expect(revealDelta({ top: 900, bottom: 1000 }, HEADER, VIEW)).toBe(1000 - VIEW + 12);
  });

  it('counts a box under the sticky header as hidden and brings it down below it', () => {
    expect(revealDelta({ top: 20, bottom: 120 }, HEADER, VIEW)).toBe(20 - HEADER - 12);
  });

  it('shows the start of a box taller than the screen', () => {
    expect(revealDelta({ top: 900, bottom: 2000 }, HEADER, VIEW)).toBe(900 - HEADER - 12);
  });
});

describe('revealLastColumn', () => {
  const scroller = (scrollWidth: number, clientWidth: number) => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'scrollWidth', { value: scrollWidth });
    Object.defineProperty(el, 'clientWidth', { value: clientWidth });
    const scrollTo = vi.fn();
    el.scrollTo = scrollTo as unknown as typeof el.scrollTo;
    return { el, scrollTo };
  };

  it('scrolls a table wider than its box to its right-hand end', () => {
    const { el, scrollTo } = scroller(363, 294);
    revealLastColumn(el);
    expect(scrollTo).toHaveBeenCalledWith({ left: 363 - 294, behavior: 'smooth' });
  });

  it('leaves a table that fits alone', () => {
    const { el, scrollTo } = scroller(294, 294);
    revealLastColumn(el);
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

describe('reveal', () => {
  let scrollBy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollBy = vi.fn();
    window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
    window.innerHeight = VIEW;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('measures from the bottom of a sticky header', () => {
    const header = document.createElement('header');
    header.style.position = 'sticky';
    header.getBoundingClientRect = () => box(0, HEADER);
    document.body.appendChild(header);

    const el = document.createElement('div');
    el.getBoundingClientRect = () => box(10, 90);
    reveal(el);

    expect(scrollBy).toHaveBeenCalledWith({ top: 10 - HEADER - 12, behavior: 'smooth' });
  });

  it('ignores a header that scrolls away with the page, as on a landscape phone', () => {
    const header = document.createElement('header');
    header.style.position = 'static';
    header.getBoundingClientRect = () => box(0, HEADER);
    document.body.appendChild(header);

    const el = document.createElement('div');
    el.getBoundingClientRect = () => box(10, 90);
    reveal(el);

    expect(scrollBy).not.toHaveBeenCalled();
  });
});

/**
 * Render-level: lay the page out with getBoundingClientRect. Whatever `below`
 * matches sits under the fold, whatever `above` matches has scrolled off the
 * top, and everything else is on screen.
 */
function layOut(
  below: (el: Element) => boolean = () => false,
  above: (el: Element) => boolean = () => false
) {
  return vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: Element
  ) {
    if (below(this)) return box(900, 1000);
    if (above(this)) return box(-400, -300);
    return box(200, 300);
  });
}

const startsWith = (prefix: string) => (el: Element) =>
  (el.textContent ?? '').trimStart().startsWith(prefix);

/** The value a student would type for one cell of Æfa's first compound. */
function firstCompoundEntry(column: 'moles' | 'ratio' | 'subscript', element: string): string {
  const derived = deriveEmpirical(
    Object.fromEntries(PROBLEMS[0].percentages.map((p) => [p.element, p.percent]))
  );
  const row = derived.rows.find((r) => r.element === element)!;
  return String(row[column]).replace('.', ',');
}

describe('the game keeps each change on screen', () => {
  let scrollBy: ReturnType<typeof vi.fn>;
  let scrollTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollBy = vi.fn();
    scrollTo = vi.fn();
    window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
    window.innerHeight = VIEW;
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });

  it('opens a phase at the top of the page, not where the menu card was', () => {
    render(<App />);
    Object.defineProperty(window, 'scrollY', { value: 900, configurable: true });
    fireEvent.click(screen.getByRole('button', { name: /Beita/ }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });

  it('Kanna: choosing a compound brings the table below the list into view', () => {
    layOut((el) => el.tagName === 'TABLE' || el.querySelector(':scope > table') !== null);
    render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    expect(scrollBy, 'nothing moves on first render').not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Etanól' }));

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeGreaterThan(0);
  });

  it('Kanna: nothing moves when the table is already on screen', () => {
    layOut();
    render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Etanól' }));

    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('Skilja: "Næsta súla" scrolls a table wider than the screen to the column just added', () => {
    layOut();
    render(<SkiljaScreen onComplete={() => {}} onBack={() => {}} />);
    const scroller = screen.getByRole('table').parentElement!;
    let width = 294;
    Object.defineProperty(scroller, 'clientWidth', { value: 294 });
    Object.defineProperty(scroller, 'scrollWidth', { get: () => width });
    const sideways = vi.fn();
    scroller.scrollTo = sideways as unknown as typeof scroller.scrollTo;

    fireEvent.click(screen.getByRole('button', { name: 'Næsta súla' }));
    expect(sideways, 'two columns fit, so nothing scrolls sideways').not.toHaveBeenCalled();

    width = 363;
    fireEvent.click(screen.getByRole('button', { name: 'Næsta súla' }));
    expect(sideways).toHaveBeenCalledWith({ left: 363 - 294, behavior: 'smooth' });
    expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual([
      'Frumefni',
      'Prósenta',
      'Mól',
      'Hlutfall',
    ]);
  });

  it('Skilja: the table is brought back into view when it has scrolled off the top', () => {
    layOut(undefined, (el) => el.querySelector(':scope > table') !== null);
    render(<SkiljaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Næsta súla' }));

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeLessThan(0);
  });

  it('Æfa: "Athuga" brings a verdict that lands below the fold into view', () => {
    layOut(startsWith('Ekki alveg'));
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    for (const input of screen.getAllByRole('textbox')) {
      fireEvent.change(input, { target: { value: '0' } });
    }
    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));

    expect(screen.getByText(/Ekki alveg/)).toBeTruthy();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeGreaterThan(0);
  });

  it('Æfa: "Næsta súla" brings the compound back when it has scrolled off the top', () => {
    layOut(undefined, startsWith('Efni '));
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    for (const element of ['H', 'O']) {
      fireEvent.change(screen.getByLabelText(`Mól fyrir ${element}`), {
        target: { value: firstCompoundEntry('moles', element) },
      });
    }
    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
    expect(
      scrollBy,
      'a right answer opens no verdict box, so nothing moves'
    ).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Næsta súla' }));

    expect(screen.getByText(/súla Hlutfall/)).toBeTruthy();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeLessThan(0);
  });

  it('Beita: "Svara" brings the verdict into view, and "Næsta dæmi" the next problem', () => {
    layOut(startsWith('Ekki alveg'), startsWith('Dæmi 2'));
    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.change(screen.getByLabelText('n ='), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Svara' }));

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Næsta dæmi' }));

    expect(screen.getByText('Dæmi 2 af 3')).toBeTruthy();
    expect(scrollBy).toHaveBeenCalledTimes(2);
    expect(scrollBy.mock.calls[1][0].top).toBeLessThan(0);
  });

  it('Beita: nothing moves when the verdict is already on screen', () => {
    layOut();
    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.change(screen.getByLabelText('n ='), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Svara' }));
    fireEvent.click(screen.getByRole('button', { name: 'Næsta dæmi' }));

    expect(scrollBy).not.toHaveBeenCalled();
  });
});
