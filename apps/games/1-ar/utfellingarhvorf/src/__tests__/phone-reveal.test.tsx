import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY } from '@shared/utils';

import App from '../App';
import { AefaScreen } from '../components/AefaScreen';
import { BeitaScreen } from '../components/BeitaScreen';
import { KannaScreen } from '../components/KannaScreen';
import { SkiljaScreen } from '../components/SkiljaScreen';
import { revealOnDesktop } from '../utils/desktopReveal';

/**
 * Where the page lands, and where focus goes, after the student acts.
 *
 * Most taps in this game change something away from the finger: a bottle pair
 * relabels the beakers below the list of pairs, a pour puts the result under
 * the button, "Næsta skref" opens a rung above the button, "Athuga" opens a
 * verdict under the rules, and "Næsta" / "Næsta dæmi" swap in a new compound
 * or scenario at the top of a card the student has scrolled past.
 *
 * The game used to carry its own reveal helper (`src/utils/reveal.ts`). It now
 * scrolls through the shared helpers in `@shared/utils`, and these tests hold:
 *
 * - on a desktop window, exactly what the old helper did, at any width
 *   (`revealOnDesktop`): the same trigger and the same landing, and nothing
 *   moves when the change is already on screen;
 * - on a phone, the loops the vertical-scroll pass fitted to one screen;
 * - focus, at every width: never on `<body>` after a tap, on the feedback after
 *   a commit and never on the button that follows it, on the new compound or
 *   scenario after a Næsta, on the next phase not yet done back on the menu;
 * - a button that appears where the last one was ignores a press within
 *   400 ms, so a double tap cannot skip the feedback or answer unread.
 */

const HEADER = 56;
const VIEW = 740;
/** The shared helpers' gap between a revealed span and the edge of the screen. */
const GAP = 8;

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

/**
 * Rects by element, or by a test on the element for one that does not exist
 * until the tap renders it. Anything not matched sits on screen at 200–300.
 */
let rects = new Map<Element, DOMRect>();
let rules: [(el: Element) => boolean, DOMRect][] = [];
let phone = false;
let clock = 1000;
const scrollBy = vi.fn();
const scrollTo = vi.fn();

beforeEach(() => {
  rects = new Map();
  rules = [];
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
    const set = rects.get(this);
    if (set) return set;
    for (const [test, r] of rules) if (test(this)) return r;
    return box(200, 300);
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const focused = () => document.activeElement as HTMLElement | null;
/** Half a second on, past the 400 ms guard on a button that has just appeared. */
const later = () => {
  clock += 500;
};
const startsWith = (prefix: string) => (el: Element) =>
  (el.textContent ?? '').trimStart().startsWith(prefix);

/** A sticky site header covering the top 56 px, as the shared Header is. */
function stickyHeader(position = 'sticky') {
  const header = document.createElement('header');
  header.style.position = position;
  document.body.appendChild(header);
  rects.set(header, box(0, HEADER));
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
    revealOnDesktop(el(150, 1500));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('reveals from the top of one element through the bottom of another', () => {
    revealOnDesktop(el(600, 700), el(710, 800));
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
    expect(focused()).toBe(screen.getByRole('heading', { name: 'Beita — spáðu fyrir um hvarfið' }));
  });

  it('back on the menu, focuses the next phase not yet done', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Kanna/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Til baka' }));
    expect(focused()?.getAttribute('data-phase-card')).toBe('kanna');

    fireEvent.click(screen.getByRole('button', { name: /Skilja/ }));
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta skref' }));
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta skref' }));
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Áfram í Æfa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Til baka' }));
    expect(focused()?.getAttribute('data-phase-card')).toBe('kanna');
  });
});

describe('Kanna', () => {
  const pair = () => screen.getByRole('button', { name: 'NaCl + KNO₃' });
  const beakers = (c: HTMLElement) => c.querySelector('.items-end')!;
  const pourBox = () => screen.getByRole('button', { name: 'Helltu saman' }).parentElement!;

  it('on a desktop window, a pick brings the beakers and the pour button into view', () => {
    stickyHeader();
    const { container } = render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    rects.set(beakers(container), box(900, 988));
    rects.set(pourBox(), box(1000, 1048));
    fireEvent.click(pair());

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenCalledWith({ top: 1048 - VIEW + 12, behavior: 'smooth' });
  });

  it('on a desktop window, a pour brings the result into view, and focus goes to it', () => {
    stickyHeader();
    render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    rects.set(pourBox(), box(900, 1100));
    fireEvent.click(screen.getByRole('button', { name: 'Helltu saman' }));

    expect(scrollBy).toHaveBeenCalledWith({ top: 1100 - VIEW + 12, behavior: 'smooth' });
    expect(focused()).toBe(screen.getByRole('group', { name: /^Botnfall myndast: AgCl/ }));
  });

  it('nothing moves when the result is already on screen', () => {
    render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(pair());
    fireEvent.click(screen.getByRole('button', { name: 'Helltu saman' }));

    expect(scrollBy).not.toHaveBeenCalled();
    expect(focused()?.textContent).toMatch(/^Ekkert botnfall/);
  });

  it('on a phone, shows the pairs through the result, so the next pair needs no scroll', () => {
    phone = true;
    stickyHeader();
    const { container } = render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    rects.set(pair().parentElement!, box(300, 600));
    rects.set(beakers(container), box(612, 700));
    rects.set(pourBox(), box(712, 760));
    fireEvent.click(pair());

    // The list's top to the button's foot is 460 px; it fits the 668 px band.
    expect(scrollBy).toHaveBeenCalledWith({ top: 760 - (VIEW - GAP), behavior: 'smooth' });
  });

  it('on a phone, falls back to the beakers and the result when the list does not fit too', () => {
    phone = true;
    stickyHeader();
    const { container } = render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    rects.set(pair().parentElement!, box(100, 600));
    rects.set(beakers(container), box(612, 700));
    rects.set(pourBox(), box(712, 1000));
    fireEvent.click(pair());

    expect(scrollBy).toHaveBeenCalledWith({ top: 1000 - (VIEW - GAP), behavior: 'smooth' });
  });
});

describe('Skilja', () => {
  const next = () => screen.getByRole('button', { name: 'Næsta skref' });
  const rung = (name: string) => screen.getByRole('group', { name });

  it('on a desktop window, brings the rung it opens into view', () => {
    stickyHeader();
    render(<SkiljaScreen onComplete={() => {}} onBack={() => {}} />);
    rects.set(rung('2. Heildarjónajafna'), box(900, 1100));
    later();
    fireEvent.click(next());

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenCalledWith({ top: 1100 - VIEW + 12, behavior: 'smooth' });
  });

  it('on a phone, shows the rung just opened down to the button', () => {
    phone = true;
    stickyHeader();
    render(<SkiljaScreen onComplete={() => {}} onBack={() => {}} />);
    rects.set(rung('2. Heildarjónajafna'), box(500, 700));
    rects.set(next().parentElement!, box(800, 860));
    later();
    fireEvent.click(next());

    expect(scrollBy).toHaveBeenCalledWith({ top: 860 - (VIEW - GAP), behavior: 'smooth' });
  });

  it('moves focus to the rung just opened', () => {
    render(<SkiljaScreen onComplete={() => {}} onBack={() => {}} />);
    later();
    fireEvent.click(next());
    expect(focused()).toBe(rung('2. Heildarjónajafna'));
  });

  it('ignores a second press within 400 ms, so a double tap opens one rung', () => {
    render(<SkiljaScreen onComplete={() => {}} onBack={() => {}} />);
    later();
    fireEvent.click(next());
    fireEvent.click(next());
    expect(screen.queryByText(/Þær heita áhorfendajónir/)).toBeNull();
  });

  it('"Áfram í Æfa" is its own button, and ignores a press as it appears', () => {
    const onComplete = vi.fn();
    render(<SkiljaScreen onComplete={onComplete} onBack={() => {}} />);
    later();
    fireEvent.click(next());
    later();
    const last = next();
    fireEvent.click(last);
    const afram = screen.getByRole('button', { name: 'Áfram í Æfa' });
    expect(afram).not.toBe(last);
    fireEvent.click(afram);
    expect(onComplete).not.toHaveBeenCalled();
    later();
    fireEvent.click(afram);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe('Æfa', () => {
  const answer = () => {
    fireEvent.click(screen.getByRole('button', { name: 'Óleysanlegt' }));
    fireEvent.click(screen.getByRole('button', { name: 'Hýdroxíð (OH⁻) eru óleysanleg.' }));
    fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
  };
  const isFeedback = (el: Element) => el.getAttribute('aria-labelledby') === 'aefa-verdict';

  it('on a desktop window, "Athuga" brings a verdict below the fold into view', () => {
    stickyHeader();
    rules.push([isFeedback, box(900, 1100)]);
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    answer();

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenCalledWith({ top: 1100 - VIEW + 12, behavior: 'smooth' });
  });

  it('on a phone, shows the chosen rule through the verdict and "Næsta"', () => {
    phone = true;
    stickyHeader();
    rules.push([isFeedback, box(500, 800)]);
    const { container } = render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    rects.set(container.querySelector('[data-item-start]')!, box(-300, -200));
    rects.set(
      screen.getByRole('button', { name: 'Hýdroxíð (OH⁻) eru óleysanleg.' }),
      box(400, 450)
    );
    answer();

    // The compound is too far up to come too; the rule to the foot of the
    // feedback is 400 px, and fits.
    expect(scrollBy).toHaveBeenCalledWith({ top: 800 - (VIEW - GAP), behavior: 'smooth' });
  });

  it('moves focus to the feedback after "Athuga", not to "Næsta"', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    answer();

    expect(screen.queryByRole('button', { name: 'Athuga' })).toBeNull();
    expect(focused()).toBe(screen.getByRole('group', { name: /^(Rétt|Ekki rétt)/ }));
  });

  it('"Næsta" ignores a press within 400 ms, so a double tap cannot skip the verdict', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    answer();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta' }));
    expect(screen.getByText(/^Efni 1 af/)).toBeTruthy();

    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta' }));
    expect(screen.getByText(/^Efni 2 af/)).toBeTruthy();
  });

  it('after "Næsta", focus moves to the new compound', () => {
    const { container } = render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    answer();
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta' }));

    expect(focused()).toBe(container.querySelector('[data-item-start]'));
  });

  it('on a desktop window, "Næsta" brings the new compound back when it has scrolled off', () => {
    stickyHeader();
    rules.push([startsWith('Efni '), box(-400, -380)]);
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    answer();
    scrollBy.mockClear();
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta' }));

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeLessThan(0);
  });

  it('on a phone, "Næsta" brings the card back under the header', () => {
    phone = true;
    stickyHeader();
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    const card = screen.getByRole('heading', { level: 2 }).parentElement!.parentElement!;
    answer();
    scrollBy.mockClear();
    rects.set(card, box(-500, 400));
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta' }));

    expect(scrollBy).toHaveBeenCalledWith({ top: -500 - (HEADER + GAP), behavior: 'smooth' });
  });
});

describe('Beita', () => {
  // The run opens on AgNO₃ + NaCl in a fixed order, so "Já" is always right.
  const ja = () => screen.getByRole('button', { name: 'Já, botnfall myndast' });
  const nei = () => screen.getByRole('button', { name: 'Nei, ekkert gerist' });

  it('moves focus to each new question, and to the feedback once the scenario is done', () => {
    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    later();
    fireEvent.click(ja());
    expect(focused()?.textContent).toBe('Hvort efnið fellur út?');

    later();
    fireEvent.click(screen.getByRole('button', { name: 'NaNO₃' }));
    expect(focused()).toBe(screen.getByRole('group', { name: 'Það er hitt efnið sem fellur út.' }));
  });

  it('a double tap cannot answer the next question unread', () => {
    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    later();
    fireEvent.click(ja());
    fireEvent.click(screen.getByRole('button', { name: 'AgCl' }));
    expect(screen.getByText('Hvort efnið fellur út?')).toBeTruthy();
  });

  it('"Næsta dæmi" ignores a press within 400 ms, then focuses the new scenario', () => {
    const { container } = render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    later();
    fireEvent.click(nei());
    expect(focused()).toBe(screen.getByRole('group', { name: 'Það myndast botnfall hér.' }));

    fireEvent.click(screen.getByRole('button', { name: 'Næsta dæmi' }));
    expect(screen.getByText(/^Dæmi 1 af/)).toBeTruthy();

    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta dæmi' }));
    expect(screen.getByText(/^Dæmi 2 af/)).toBeTruthy();
    expect(focused()).toBe(container.querySelector('[data-item-start]'));
  });

  it('on a desktop window, each committed answer brings the next question into view', () => {
    stickyHeader();
    rules.push([startsWith('Hvort efnið fellur út?'), box(900, 1000)]);
    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    later();
    fireEvent.click(ja());

    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenCalledWith({ top: 1000 - VIEW + 12, behavior: 'smooth' });
  });

  it('on a phone, shows the new question with its buttons, under the scenario if it fits', () => {
    phone = true;
    stickyHeader();
    rules.push([(el) => el.textContent === 'Hvort efnið fellur út?', box(600, 630)]);
    rules.push([startsWith('Hvort efnið fellur út?'), box(600, 800)]);
    const { container } = render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    rects.set(container.querySelector('[data-item-start]')!, box(100, 200));
    later();
    fireEvent.click(ja());

    // Scenario to the buttons' foot is 700 px, too tall; the question fits.
    expect(scrollBy).toHaveBeenCalledWith({ top: 800 - (VIEW - GAP), behavior: 'smooth' });
  });

  it('on a desktop window, "Næsta dæmi" brings the new scenario back when it has scrolled off', () => {
    stickyHeader();
    rules.push([startsWith('Dæmi '), box(-400, -380)]);
    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    later();
    fireEvent.click(nei());
    scrollBy.mockClear();
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta dæmi' }));

    expect(screen.getByText(/^Dæmi 2 af/)).toBeTruthy();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy.mock.calls[0][0].top).toBeLessThan(0);
  });
});
