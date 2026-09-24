import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY } from '@shared/utils';

import App from '../App';
import { AefaScreen } from '../components/AefaScreen';
import { BeitaScreen } from '../components/BeitaScreen';
import { KannaScreen } from '../components/KannaScreen';
import { SkiljaScreen } from '../components/SkiljaScreen';
import { PROBLEMS } from '../data/problems';
import { deriveEmpirical } from '../engine/empirical';
import { revealOnDesktop } from '../utils/desktopReveal';

/**
 * Where the page lands, and where focus goes, after the student acts.
 *
 * Several taps in this game change something away from the finger: "Næsta
 * súla" adds a column to a table above the button — and from the third column
 * on, off the right-hand edge of a 360 px screen — "Svara" and "Athuga" open a
 * verdict under the input, and "Næsta efni" / "Næsta dæmi" swap in a new
 * compound at the top of a card the student has scrolled past.
 *
 * The game used to carry its own reveal helper (`src/utils/reveal.ts`). It now
 * scrolls through the shared helpers in `@shared/utils`, and these tests hold:
 *
 * - on a desktop window, exactly what the old helper did, at any width
 *   (`revealOnDesktop`): the same trigger and the same landing, and nothing
 *   moves when the change is already on screen;
 * - on a phone, the loops the vertical-scroll pass fitted to one screen;
 * - focus, at every width: never on `<body>` after a tap, on the feedback after
 *   a commit and never on the button that follows it, on the new step or
 *   problem after a Næsta, on the next phase not yet done back on the menu;
 * - the button that follows a commit ignores a press within 400 ms of
 *   appearing, so a double tap cannot skip the feedback.
 */

const HEADER = 56;
const VIEW = 740;

const box = (top: number, bottom: number) =>
  ({
    top,
    bottom,
    left: 0,
    right: 100,
    width: 100,
    height: bottom - top,
    x: 0,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

/** Rects by element; anything not listed sits on screen at 200–300. */
let rects = new Map<Element, DOMRect>();
let phone = false;
let clock = 1000;
const scrollBy = vi.fn();
const scrollTo = vi.fn();

beforeEach(() => {
  rects = new Map();
  phone = false;
  clock = 1000;
  scrollBy.mockClear();
  scrollTo.mockClear();
  localStorage.clear();
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
  Object.defineProperty(window, 'innerHeight', { value: VIEW, configurable: true });
  Object.defineProperty(window, 'visualViewport', { value: undefined, configurable: true });
  vi.spyOn(performance, 'now').mockImplementation(() => clock);
  // Frames run at once, so a commit reveal can be read synchronously.
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(0);
    return 0;
  });
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    return rects.get(this) ?? box(200, 300);
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const focused = () => document.activeElement as HTMLElement | null;
/** Half a second on, past the 400 ms guard on the button that follows a commit. */
const later = () => {
  clock += 500;
};

/** A sticky site header covering the top 56 px, as the shared Header is. */
function stickyHeader(position = 'sticky') {
  const header = document.createElement('header');
  header.style.position = position;
  document.body.appendChild(header);
  rects.set(header, box(0, HEADER));
}

/** The value a student would type for one cell of Æfa's first compound. */
function firstCompoundEntry(column: 'moles' | 'ratio' | 'subscript', element: string): string {
  const derived = deriveEmpirical(
    Object.fromEntries(PROBLEMS[0].percentages.map((p) => [p.element, p.percent]))
  );
  const row = derived.rows.find((r) => r.element === element)!;
  return String(row[column]).replace('.', ',');
}

function fillColumn(label: 'Mól' | 'Hlutfall' | 'Vísitala', h: string, o: string) {
  fireEvent.change(screen.getByLabelText(`${label} fyrir H`), { target: { value: h } });
  fireEvent.change(screen.getByLabelText(`${label} fyrir O`), { target: { value: o } });
}

describe('revealOnDesktop: what the old helper did, on a desktop window', () => {
  function el(top: number, bottom: number) {
    const e = document.createElement('div');
    document.body.appendChild(e);
    rects.set(e, box(top, bottom));
    return e;
  }

  beforeEach(() => stickyHeader());

  it('does not move a box that is already on screen', () => {
    revealOnDesktop(el(100, 300));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('brings a box below the fold up by the least distance, plus a margin', () => {
    revealOnDesktop(el(900, 1000));
    expect(scrollBy).toHaveBeenCalledWith({ top: 1000 - VIEW + 12, behavior: 'smooth' });
  });

  it('counts a box under the sticky header as hidden and brings it down below it', () => {
    revealOnDesktop(el(20, 120));
    expect(scrollBy).toHaveBeenCalledWith({ top: 20 - HEADER - 12, behavior: 'smooth' });
  });

  it('shows the start of a box taller than the screen', () => {
    revealOnDesktop(el(900, 2000));
    expect(scrollBy).toHaveBeenCalledWith({ top: 900 - HEADER - 12, behavior: 'smooth' });
  });

  it('leaves a box taller than the screen alone while its start is in the upper half', () => {
    revealOnDesktop(el(120, 2000));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('reveals from the top of one element through the bottom of another', () => {
    revealOnDesktop(el(300, 400), el(700, 800));
    expect(scrollBy).toHaveBeenCalledWith({ top: 800 - VIEW + 12, behavior: 'smooth' });
  });

  it('ignores a header that scrolls away with the page, as on a landscape phone', () => {
    document.body.innerHTML = '';
    stickyHeader('static');
    revealOnDesktop(el(10, 90));
    expect(scrollBy).not.toHaveBeenCalled();
  });
});

describe('the menu and the phases', () => {
  it('opens a phase at the top of the page, at any width, with its heading focused', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Beita/ }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()).toBe(screen.getByRole('heading', { name: 'Beita — frá reynslu að sameind' }));
  });

  it('back on the menu, focuses the next phase not yet done', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Kanna/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Áfram í Skilja' }));
    fireEvent.click(screen.getByRole('button', { name: 'Til baka' }));

    expect(focused()?.getAttribute('data-phase-card')).toBe('skilja');
  });
});

describe('Kanna', () => {
  const note = () => screen.getByText(/hlutann af massanum/).closest('div')!;

  it('on a desktop window, brings the table and its sentence into view when they are below', () => {
    stickyHeader();
    render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    rects.set(screen.getByRole('table').parentElement!, box(900, 1100));
    rects.set(note(), box(1124, 1230));
    fireEvent.click(screen.getByRole('button', { name: 'Etanól' }));

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenCalledWith({ top: 1230 - VIEW + 12, behavior: 'smooth' });
  });

  it('nothing moves when the table is already on screen, and focus goes to the sentence', () => {
    render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Etanól' }));

    expect(scrollBy).not.toHaveBeenCalled();
    expect(focused()).toBe(note());
    expect(focused()?.textContent).toMatch(/á flestar frumeindirnar/);
  });

  it('on a phone, shows the list through the sentence, so the next compound needs no scroll', () => {
    phone = true;
    stickyHeader();
    render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    const chips = screen.getByRole('button', { name: 'Etanól' }).parentElement!;
    const reading = screen.getByRole('table').parentElement!.parentElement!;
    rects.set(chips, box(300, 500));
    rects.set(reading, box(512, 800));
    fireEvent.click(screen.getByRole('button', { name: 'Etanól' }));

    // The list's top to the sentence's foot is 500 px; it fits the 684 px band.
    expect(scrollBy).toHaveBeenCalledWith({ top: 800 - (VIEW - 8), behavior: 'smooth' });
  });

  it('on a phone, falls back to the table and the sentence when the list does not fit too', () => {
    phone = true;
    stickyHeader();
    render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    const chips = screen.getByRole('button', { name: 'Etanól' }).parentElement!;
    const table = screen.getByRole('table').parentElement!;
    rects.set(chips, box(100, 600));
    rects.set(table, box(612, 800));
    rects.set(table.parentElement!, box(612, 1000));
    fireEvent.click(screen.getByRole('button', { name: 'Etanól' }));

    expect(scrollBy).toHaveBeenCalledWith({ top: 1000 - (VIEW - 8), behavior: 'smooth' });
  });
});

describe('Skilja', () => {
  const next = () => screen.getByRole('button', { name: 'Næsta súla' });

  function sideways() {
    const scroller = screen.getByRole('table').parentElement!;
    scroller.style.overflowX = 'auto';
    let width = 294;
    Object.defineProperty(scroller, 'clientWidth', { value: 294, configurable: true });
    Object.defineProperty(scroller, 'scrollWidth', { get: () => width, configurable: true });
    const to = vi.fn();
    scroller.scrollTo = to as unknown as typeof scroller.scrollTo;
    rects.set(scroller, { ...box(200, 300), left: 0, right: 294 } as DOMRect);
    return {
      to,
      widen(w: number) {
        width = w;
        // The new last column ends at the table's right-hand edge.
        vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
          this: Element
        ) {
          if (this === scroller.querySelector('thead th:last-child')) {
            return { ...box(200, 230), left: w - 80, right: w } as DOMRect;
          }
          return rects.get(this) ?? box(200, 300);
        });
      },
    };
  }

  it('"Næsta súla" scrolls a table wider than its box to the column just added', () => {
    render(<SkiljaScreen onComplete={() => {}} onBack={() => {}} />);
    const { to, widen } = sideways();

    later();
    fireEvent.click(next());
    expect(to, 'two columns fit, so nothing scrolls sideways').not.toHaveBeenCalled();

    widen(363);
    later();
    fireEvent.click(next());
    expect(to).toHaveBeenCalledWith({ left: 363 - 294, behavior: 'smooth' });
    expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual([
      'Frumefni',
      'Prósenta',
      'Mól',
      'Hlutfall',
    ]);
  });

  it('on a desktop window, the table is brought back when it has scrolled off the top', () => {
    stickyHeader();
    render(<SkiljaScreen onComplete={() => {}} onBack={() => {}} />);
    rects.set(screen.getByRole('table').parentElement!, box(-400, -300));
    later();
    fireEvent.click(next());

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeLessThan(0);
  });

  it('on a phone, shows the new column down to the button', () => {
    phone = true;
    stickyHeader();
    render(<SkiljaScreen onComplete={() => {}} onBack={() => {}} />);
    rects.set(screen.getByRole('table').parentElement!, box(300, 420));
    rects.set(next().parentElement!, box(700, 750));
    later();
    fireEvent.click(next());

    expect(scrollBy).toHaveBeenCalledWith({ top: 750 - (VIEW - 8), behavior: 'smooth' });
  });

  it('moves focus to the caption of the column just added', () => {
    render(<SkiljaScreen onComplete={() => {}} onBack={() => {}} />);
    later();
    fireEvent.click(next());
    expect(focused()?.textContent).toMatch(/^Deildu massanum með mólmassa/);
  });

  it('ignores a second press within 400 ms, so a double tap opens one column', () => {
    render(<SkiljaScreen onComplete={() => {}} onBack={() => {}} />);
    later();
    fireEvent.click(next());
    fireEvent.click(next());
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
  });

  it('"Áfram í Æfa" is a new button, which a double tap on the last "Næsta súla" cannot press', () => {
    const onComplete = vi.fn();
    render(<SkiljaScreen onComplete={onComplete} onBack={() => {}} />);
    for (let i = 0; i < 2; i++) {
      later();
      fireEvent.click(next());
    }
    later();
    const pressed = next();
    fireEvent.click(pressed);
    const onward = screen.getByRole('button', { name: 'Áfram í Æfa' });
    expect(onward).not.toBe(pressed);
    fireEvent.click(onward);
    expect(onComplete).not.toHaveBeenCalled();
    later();
    fireEvent.click(onward);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe('Æfa', () => {
  const verdictBox = () => screen.getByText(/^Ekki alveg/).closest('[role="group"]');

  it('on a desktop window, "Athuga" brings a verdict that lands below the fold into view', () => {
    stickyHeader();
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fillColumn('Mól', '0', '0');
    const athuga = screen.getByRole('button', { name: 'Athuga' });
    rects.set(athuga.parentElement!, box(1016, 1066));
    // The verdict box opens between the fields and the buttons, below the fold.
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element
    ) {
      if ((this.textContent ?? '').startsWith('Ekki alveg')) return box(900, 1000);
      return rects.get(this) ?? box(200, 300);
    });
    fireEvent.click(athuga);

    expect(verdictBox()).toBeTruthy();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeGreaterThan(0);
  });

  it('moves focus to the verdict after a wrong column, and "Reyna aftur" back to the field', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fillColumn('Mól', firstCompoundEntry('moles', 'H'), '0');
    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));

    expect(focused()).toBe(verdictBox());
    expect(focused()?.getAttribute('aria-labelledby')).toBe('aefa-verdict');

    later();
    fireEvent.click(screen.getByRole('button', { name: 'Reyna aftur' }));
    expect(focused()).toBe(screen.getByLabelText('Mól fyrir O'));
  });

  it('a right column opens no box: nothing moves, and focus goes to the ticked fields', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fillColumn('Mól', firstCompoundEntry('moles', 'H'), firstCompoundEntry('moles', 'O'));
    const athuga = screen.getByRole('button', { name: 'Athuga' });
    fireEvent.click(athuga);

    expect(scrollBy).not.toHaveBeenCalled();
    expect(focused()?.getAttribute('aria-labelledby')).toBe('aefa-prompt');
    expect(focused()?.textContent).toContain('✓');
    // "Næsta súla" is a new button, not "Athuga" relabelled.
    expect(screen.getByRole('button', { name: 'Næsta súla' })).not.toBe(athuga);
  });

  it('ignores "Næsta súla" within 400 ms of it appearing', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fillColumn('Mól', firstCompoundEntry('moles', 'H'), firstCompoundEntry('moles', 'O'));
    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
    fireEvent.click(screen.getByRole('button', { name: 'Næsta súla' }));
    expect(screen.getByText(/súla Mól/)).toBeTruthy();

    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta súla' }));
    expect(screen.getByText(/súla Hlutfall/)).toBeTruthy();
  });

  it('on a desktop window, "Næsta súla" brings the compound back when it has scrolled off the top', () => {
    stickyHeader();
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fillColumn('Mól', firstCompoundEntry('moles', 'H'), firstCompoundEntry('moles', 'O'));
    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
    expect(
      scrollBy,
      'a right answer opens no verdict box, so nothing moves'
    ).not.toHaveBeenCalled();

    rects.set(screen.getByText(/^Efni 1 af/).parentElement!, box(-400, -300));
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta súla' }));

    expect(screen.getByText(/súla Hlutfall/)).toBeTruthy();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeLessThan(0);
  });

  it('after "Næsta súla", focus goes to the new step, which names the column', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fillColumn('Mól', firstCompoundEntry('moles', 'H'), firstCompoundEntry('moles', 'O'));
    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta súla' }));

    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
    expect(focused()?.textContent).toMatch(/súla Hlutfall/);
  });

  it('on a phone, "Athuga" shows the compound through the buttons when it fits', () => {
    phone = true;
    stickyHeader();
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fillColumn('Mól', '0', '0');
    const athuga = screen.getByRole('button', { name: 'Athuga' });
    rects.set(screen.getByText(/^Efni 1 af/).parentElement!, box(120, 260));
    rects.set(athuga.parentElement!, box(700, 750));
    fireEvent.click(athuga);

    expect(scrollBy).toHaveBeenCalledWith({ top: 750 - (VIEW - 8), behavior: 'smooth' });
  });

  it('Enter moves to the next field, and in the last one checks the column', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fillColumn('Mól', '0', '0');
    const h = screen.getByLabelText('Mól fyrir H');
    const o = screen.getByLabelText('Mól fyrir O');
    expect(h.getAttribute('enterkeyhint')).toBe('next');
    expect(o.getAttribute('enterkeyhint')).toBe('done');

    fireEvent.keyDown(h, { key: 'Enter' });
    expect(focused()).toBe(o);
    expect(screen.queryByText(/^Ekki alveg/)).toBeNull();

    fireEvent.keyDown(o, { key: 'Enter' });
    expect(verdictBox()).toBeTruthy();
  });

  it('Enter does not check while a field is empty', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.change(screen.getByLabelText('Mól fyrir H'), { target: { value: '0' } });
    fireEvent.keyDown(screen.getByLabelText('Mól fyrir O'), { key: 'Enter' });
    expect(screen.queryByText(/^Ekki alveg/)).toBeNull();
  });
});

describe('Beita', () => {
  const answer = (value: string) => {
    fireEvent.change(screen.getByLabelText('n ='), { target: { value } });
    fireEvent.click(screen.getByRole('button', { name: 'Svara' }));
  };

  it('on a desktop window, "Svara" brings the verdict into view, and "Næsta dæmi" the next problem', () => {
    stickyHeader();
    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.change(screen.getByLabelText('n ='), { target: { value: '3' } });
    // The verdict opens under the input, below the fold; the next problem's
    // counter is above the top once the student has scrolled down to it.
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element
    ) {
      const text = (this.textContent ?? '').trimStart();
      if (text.startsWith('Ekki alveg')) return box(900, 1000);
      if (text === 'Næsta dæmi') return box(1016, 1064);
      if (text.startsWith('Dæmi 2')) return box(-400, -300);
      return rects.get(this) ?? box(200, 300);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Svara' }));

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeGreaterThan(0);

    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta dæmi' }));

    expect(screen.getByText('Dæmi 2 af 3')).toBeTruthy();
    expect(scrollBy).toHaveBeenCalledTimes(2);
    expect(scrollBy.mock.calls[1][0].top).toBeLessThan(0);
  });

  it('nothing moves when the verdict is already on screen', () => {
    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    answer('2');
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta dæmi' }));

    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('focus goes to the feedback after "Svara", and to the new problem after "Næsta dæmi"', () => {
    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    answer('3');
    expect(focused()?.getAttribute('role')).toBe('group');
    expect(focused()?.getAttribute('aria-labelledby')).toBe('beita-verdict');
    expect(focused()?.contains(screen.getByRole('button', { name: 'Næsta dæmi' }))).toBe(false);

    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta dæmi' }));
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
    expect(focused()?.textContent).toMatch(/Reynsluformúla efnisins er CH₂O/);
  });

  it('ignores "Næsta dæmi" within 400 ms of it appearing', () => {
    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    answer('3');
    fireEvent.click(screen.getByRole('button', { name: 'Næsta dæmi' }));
    expect(screen.getByText('Dæmi 1 af 3')).toBeTruthy();
  });

  it('Enter in the field answers, as "Svara" does', () => {
    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    const input = screen.getByLabelText('n =');
    expect(input.getAttribute('enterkeyhint')).toBe('done');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.queryByText('Ekki alveg')).toBeNull();

    fireEvent.change(input, { target: { value: '3' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('Ekki alveg')).toBeTruthy();
  });

  it('on a phone, "Svara" shows the most that fits, from the problem down to "Næsta dæmi"', () => {
    phone = true;
    stickyHeader();
    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.change(screen.getByLabelText('n ='), { target: { value: '3' } });
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element
    ) {
      if (this.hasAttribute('data-item-start')) return box(170, 340);
      if (this.textContent === 'Næsta dæmi') return box(760, 810);
      return rects.get(this) ?? box(200, 300);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Svara' }));

    expect(scrollBy).toHaveBeenCalledWith({ top: 810 - (VIEW - 8), behavior: 'smooth' });
  });
});
