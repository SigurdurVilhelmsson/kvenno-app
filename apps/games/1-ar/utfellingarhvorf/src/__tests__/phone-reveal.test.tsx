import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { AefaScreen } from '../components/AefaScreen';
import { BeitaScreen } from '../components/BeitaScreen';
import { KannaScreen } from '../components/KannaScreen';
import { SkiljaScreen } from '../components/SkiljaScreen';
import { reveal, revealDelta } from '../utils/reveal';

/**
 * On a 360 × 740 phone most taps in this game change something away from the
 * finger: a bottle pair relabels the beakers below the list of pairs, a pour
 * puts the result under the button, and "Næsta" / "Næsta dæmi" swap in a new
 * compound or scenario at the top of a card the student has scrolled past.
 * These tests hold the scrolling that brings each change into view, and hold
 * that nothing moves when the change is already on screen, which is the
 * desktop case.
 */

const HEADER = 56;
const VIEW = 740;

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
    expect(revealDelta({ top: -500, bottom: 900 }, HEADER, VIEW)).toBe(-500 - HEADER - 12);
  });

  it('leaves a tall box alone while its start is in the upper half of the screen', () => {
    expect(revealDelta({ top: 150, bottom: 1500 }, HEADER, VIEW)).toBe(0);
  });
});

const box = (top: number, bottom: number) =>
  ({ top, bottom, left: 0, right: 100, width: 100, height: bottom - top }) as DOMRect;

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

  it('reveals through to a second element', () => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => box(600, 700);
    const through = document.createElement('div');
    through.getBoundingClientRect = () => box(710, 800);
    reveal(el, through);

    expect(scrollBy).toHaveBeenCalledWith({ top: 800 - VIEW + 12, behavior: 'smooth' });
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

  it('Kanna: choosing a pair brings the beakers and the pour button into view', () => {
    // The beaker row is the only three-column grid on the screen.
    layOut((el) => el.classList.contains('grid-cols-3'));
    render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    expect(scrollBy, 'nothing moves on first render').not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'NaCl + KNO₃' }));

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeGreaterThan(0);
  });

  it('Kanna: a pour brings the result into view, and nothing moves when it is on screen', () => {
    layOut(startsWith('Botnfall myndast'));
    const { unmount } = render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Helltu saman' }));

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeGreaterThan(0);

    unmount();
    vi.restoreAllMocks();
    window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
    scrollBy.mockClear();
    layOut();
    render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'NaCl + KNO₃' }));
    fireEvent.click(screen.getByRole('button', { name: 'Helltu saman' }));

    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('Skilja: "Næsta skref" brings the rung it opens into view', () => {
    layOut(startsWith('2. Heildarjónajafna'));
    render(<SkiljaScreen onComplete={() => {}} onBack={() => {}} />);
    expect(scrollBy, 'nothing moves on first render').not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Næsta skref' }));

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeGreaterThan(0);
  });

  it('Æfa: "Næsta" brings the new compound back when it has scrolled off the top', () => {
    layOut(undefined, startsWith('Efni '));
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Leysanlegt' }));
    fireEvent.click(screen.getByRole('button', { name: 'Öll nítröt (NO₃⁻) eru leysanleg.' }));
    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
    expect(scrollBy, 'the verdict is on screen, so "Athuga" moves nothing').not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Næsta' }));

    expect(screen.getByText(/Efni 2 af/)).toBeTruthy();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeLessThan(0);
  });

  it('Æfa: "Athuga" brings a verdict that lands below the fold into view', () => {
    layOut((el) => startsWith('Rétt')(el) || startsWith('Ekki rétt')(el));
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Óleysanlegt' }));
    fireEvent.click(screen.getByRole('button', { name: 'Hýdroxíð (OH⁻) eru óleysanleg.' }));
    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeGreaterThan(0);
  });

  it('Beita: each committed answer brings the next question into view', () => {
    layOut(startsWith('Hvort efnið fellur út?'));
    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    expect(scrollBy, 'nothing moves on first render').not.toHaveBeenCalled();

    // The run opens on AgNO₃ + NaCl in a fixed order, so this is always right.
    fireEvent.click(screen.getByRole('button', { name: 'Já, botnfall myndast' }));

    expect(screen.getByText('Hvort efnið fellur út?')).toBeTruthy();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeGreaterThan(0);
  });

  it('Beita: "Næsta dæmi" brings the new scenario back when it has scrolled off the top', () => {
    layOut(undefined, startsWith('Dæmi '));
    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Nei, ekkert gerist' }));
    scrollBy.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'Næsta dæmi' }));

    expect(screen.getByText(/Dæmi 2 af/)).toBeTruthy();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeLessThan(0);
  });
});
