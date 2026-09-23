// @vitest-environment jsdom
/**
 * Where the screen lands, and where focus goes, when the student moves on.
 *
 * Every level swaps its answer controls for the feedback in place, and back
 * again on "Næsta", "Halda áfram" or "Reyna aftur". The browser keeps the scroll
 * offset through the swap, so on a phone the next question, molecule or name to
 * build used to load above the screen, and the verdict could open below it.
 *
 * The game used to carry its own helper for this (`useRevealWhenShown`,
 * `useReturnToPrompt`). It now uses the shared one in `@shared/utils`
 * (`reveal.ts`), and these tests hold the game to what the vertical-scroll pass
 * asks of it:
 *
 * - On a phone, a screen swap (menu → level, a phase or mode change) starts the
 *   new screen at the top with its heading focused, and each new item comes
 *   back under the top edge with focus on it, not on `<body>`.
 * - After an answer, focus moves to the feedback, not to a button, so a second
 *   Enter lands on nothing; and the buttons after it ignore a press within
 *   400 ms of appearing, so a second tap cannot skip the feedback either.
 * - A desktop window keeps exactly what the old helper did there: a feedback
 *   opened above the screen, or near its foot, is brought to the top, and a
 *   prompt left above the screen is brought back (in Stig 2, only when more than
 *   half of the molecule is above it). Nothing on screen ever moves.
 *
 * jsdom has no layout: every element's box is faked at `top`, 100 px tall.
 */

import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY } from '@shared/utils';

import App from '../App';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

let top = -300;
let phone = true;
let clock = 1000;
const scrollBy = vi.fn();
const scrollTo = vi.fn();

beforeEach(() => {
  top = -300;
  phone = true;
  clock = 1000;
  scrollBy.mockClear();
  scrollTo.mockClear();
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
  Object.defineProperty(window, 'innerHeight', { value: 640, configurable: true });
  Object.defineProperty(window, 'visualViewport', { value: undefined, configurable: true });
  vi.spyOn(performance, 'now').mockImplementation(() => clock);
  // Frames run at once, so the commit reveal can be read synchronously.
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(0);
    return 0;
  });
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    () =>
      ({
        top,
        bottom: top + 100,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

const focused = () => document.activeElement as HTMLElement | null;
/** Past the 400 ms guard on the buttons that follow an answer. */
const later = () => (clock += 500);

/** Stig 2, name mode, first molecule answered wrongly in the typed mode. */
function answerLevel2Typed() {
  const rendered = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
  const ui = within(rendered.container);
  fireEvent.click(ui.getByRole('button', { name: /Nefna sameindir/ }));
  fireEvent.click(ui.getByRole('button', { name: /Skipta í skrifa-ham/ }));
  fireEvent.change(rendered.container.querySelector('input[type=text]')!, {
    target: { value: 'x' },
  });
  fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
  return ui;
}

describe('Stig 2, naming a molecule', () => {
  it('opens the mode at the top of the screen with its heading focused', () => {
    const rendered = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(within(rendered.container).getByRole('button', { name: /Nefna sameindir/ }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.tagName).toBe('H1');
    expect(focused()?.textContent).toMatch(/Nefndu sameindina/);
  });

  it('moves focus to the verdict after Athuga, not to a button', () => {
    const ui = answerLevel2Typed();
    const group = focused();
    expect(group?.getAttribute('role')).toBe('group');
    expect(group?.textContent).toMatch(/Rangt/);
    expect(group?.contains(ui.getByRole('button', { name: /Halda áfram/ }))).toBe(false);
  });

  it('ignores "Halda áfram" and "Reyna aftur" pressed within 400 ms of the verdict', () => {
    const ui = answerLevel2Typed();
    fireEvent.click(ui.getByRole('button', { name: /Halda áfram/ }));
    fireEvent.click(ui.getByRole('button', { name: 'Reyna aftur' }));
    expect(ui.getByText(/Sameind 1 af/)).toBeTruthy();
    expect(ui.getByRole('button', { name: /Halda áfram/ })).toBeTruthy();
  });

  it('on a phone, brings the next molecule back and focuses it', () => {
    const ui = answerLevel2Typed();
    scrollBy.mockClear();
    later();
    fireEvent.click(ui.getByRole('button', { name: /Halda áfram/ }));
    expect(ui.getByText(/Sameind 2 af/)).toBeTruthy();
    // No sticky header on a level screen: the top goes to 8 px, the helper's margin.
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -308, behavior: 'smooth' });
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
    expect(focused()?.textContent).toMatch(/Alkan \(eintengi\)/);
  });

  it('on a phone, does the same after "Reyna aftur"', () => {
    const ui = answerLevel2Typed();
    scrollBy.mockClear();
    later();
    fireEvent.click(ui.getByRole('button', { name: 'Reyna aftur' }));
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
  });

  it('leaves a molecule that is on screen where it is', () => {
    const ui = answerLevel2Typed();
    top = 20;
    scrollBy.mockClear();
    later();
    fireEvent.click(ui.getByRole('button', { name: /Halda áfram/ }));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('on desktop, brings a verdict opened above the screen to the top, as before', () => {
    phone = false;
    answerLevel2Typed();
    expect(scrollBy).toHaveBeenCalledTimes(1);
  });

  it('on desktop, leaves a verdict that opened on screen alone', () => {
    phone = false;
    top = 200;
    answerLevel2Typed();
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('on desktop, brings back a molecule more than half above the screen, as before', () => {
    phone = false;
    const ui = answerLevel2Typed();
    scrollBy.mockClear();
    later();
    fireEvent.click(ui.getByRole('button', { name: /Halda áfram/ }));
    expect(scrollBy).toHaveBeenCalledTimes(1);
  });

  it('on desktop, leaves a molecule less than half above the screen alone, as before', () => {
    phone = false;
    top = 200;
    const ui = answerLevel2Typed();
    top = -40;
    later();
    fireEvent.click(ui.getByRole('button', { name: /Halda áfram/ }));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('moves focus to the hint when "Vísbending" opens it', () => {
    const rendered = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(rendered.container);
    fireEvent.click(ui.getByRole('button', { name: /Nefna sameindir/ }));
    fireEvent.click(ui.getByRole('button', { name: /Vísbending/ }));
    expect(focused()?.textContent).toMatch(/2 kolefni \+ eintengi/);
  });
});

describe('Stig 2, building a molecule from its name', () => {
  function answerFirst() {
    const rendered = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(rendered.container);
    fireEvent.click(ui.getByRole('button', { name: /Byggja sameindir/ }));
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    return ui;
  }

  it('moves focus to the feedback after Athuga, not to Næsta', () => {
    const ui = answerFirst();
    expect(focused()?.getAttribute('role')).toBe('group');
    expect(focused()?.contains(ui.getByRole('button', { name: /Næsta áskorun/ }))).toBe(false);
  });

  it('on a phone, brings the next name back and focuses it', () => {
    const ui = answerFirst();
    scrollBy.mockClear();
    later();
    fireEvent.click(ui.getByRole('button', { name: /Næsta áskorun/ }));
    expect(ui.getByText(/Áskorun 2 af/)).toBeTruthy();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(focused()?.textContent).toMatch(/Byggðu þessa sameind:/);
  });

  it('on desktop, brings back a name left above the screen, and leaves one on screen', () => {
    phone = false;
    const ui = answerFirst();
    scrollBy.mockClear();
    later();
    fireEvent.click(ui.getByRole('button', { name: /Næsta áskorun/ }));
    expect(scrollBy).toHaveBeenCalledTimes(1);

    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    top = 40;
    scrollBy.mockClear();
    later();
    fireEvent.click(ui.getByRole('button', { name: /Næsta áskorun/ }));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  /** Build mode, first name, with "Sýna vísbendingu" pressed. */
  function openBuildHint() {
    const rendered = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(rendered.container);
    fireEvent.click(ui.getByRole('button', { name: /Byggja sameindir/ }));
    scrollBy.mockClear();
    fireEvent.click(ui.getByRole('button', { name: /Sýna vísbendingu/ }));
    return ui;
  }

  it('moves focus to the hint when "Sýna vísbendingu" opens it, not to <body>', () => {
    openBuildHint();
    expect(focused()?.textContent).toBe('prop = 3 kolefni, an = eintengi');
  });

  it('on a phone, brings the opened hint into view together with Athuga', () => {
    openBuildHint();
    // Every box is faked 100 px tall at the same top, so the hint-to-Athuga span
    // fits and its top, above the screen, is brought down to the 8 px margin.
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -308, behavior: 'smooth' });
  });

  it('on desktop, opening the hint moves focus but never the page', () => {
    phone = false;
    openBuildHint();
    expect(focused()?.textContent).toBe('prop = 3 kolefni, an = eintengi');
    expect(scrollBy).not.toHaveBeenCalled();
  });
});

describe('Stig 1 and 3 quizzes', () => {
  /** Stig 1 up to the builder's "Byrja próf", pressed. */
  function startLevel1Quiz() {
    const rendered = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(rendered.container);
    for (let i = 0; i < 12; i++) {
      fireEvent.click(ui.getAllByRole('button', { name: /Næsta →|Viðskeyti →/ })[0]);
    }
    fireEvent.click(ui.getByRole('button', { name: /Sameindasmiður →/ }));
    scrollBy.mockClear();
    scrollTo.mockClear();
    fireEvent.click(ui.getByRole('button', { name: /Byrja próf/ }));
    return { rendered, ui };
  }

  it('Stig 1: each teaching card is focused as it comes, and the quiz opens at its top', () => {
    const rendered = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(rendered.container);
    fireEvent.click(ui.getByRole('button', { name: 'Næsta →' }));
    expect(focused()?.textContent).toMatch(/eth-/);

    const { ui: quiz } = startLevel1Quiz();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.tagName).toBe('H1');
    expect(quiz.getByText(/Spurning 1 af/)).toBeTruthy();
  });

  it('Stig 1: focus goes to the feedback, then to the next question', () => {
    const { rendered, ui } = startLevel1Quiz();
    fireEvent.click(rendered.container.querySelector('.grid button')!);
    expect(focused()?.getAttribute('role')).toBe('group');
    expect(focused()?.querySelector('.feedback-panel')).toBeTruthy();

    // Too soon: the press is dropped.
    fireEvent.click(ui.getByRole('button', { name: /Næsta spurning/ }));
    expect(ui.getByText(/Spurning 1 af/)).toBeTruthy();

    scrollBy.mockClear();
    later();
    fireEvent.click(ui.getByRole('button', { name: /Næsta spurning/ }));
    expect(ui.getByText(/Spurning 2 af/)).toBeTruthy();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(focused()?.textContent).toMatch(/\?/);
  });

  it('Stig 1 on desktop: entering the quiz and each Næsta bring back a question above the screen', () => {
    phone = false;
    const { rendered, ui } = startLevel1Quiz();
    expect(scrollTo).not.toHaveBeenCalled();
    expect(scrollBy).toHaveBeenCalledTimes(1);

    fireEvent.click(rendered.container.querySelector('.grid button')!);
    top = 40;
    scrollBy.mockClear();
    later();
    fireEvent.click(ui.getByRole('button', { name: /Næsta spurning/ }));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('Stig 3: the challenges open at the top, and each Næsta brings the next back', () => {
    const rendered = render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(rendered.container);
    for (let i = 0; i < 3; i++) fireEvent.click(ui.getByRole('button', { name: /Næsta →/ }));
    scrollTo.mockClear();
    fireEvent.click(ui.getByRole('button', { name: /Byrja áskoranir/ }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.tagName).toBe('H1');

    fireEvent.click(rendered.container.querySelector('.grid button')!);
    expect(focused()?.getAttribute('role')).toBe('group');
    expect(focused()?.getAttribute('aria-labelledby')).toBe('organic-l3-verdict');

    scrollBy.mockClear();
    later();
    fireEvent.click(ui.getByRole('button', { name: /Næsta áskorun/ }));
    expect(ui.getByText(/Áskorun 2 af/)).toBeTruthy();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(focused()?.textContent).toMatch(/\?/);
  });

  it('Stig 3 on desktop: a question on screen never moves', () => {
    phone = false;
    top = 40;
    const rendered = render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(rendered.container);
    for (let i = 0; i < 3; i++) fireEvent.click(ui.getByRole('button', { name: /Næsta →/ }));
    fireEvent.click(ui.getByRole('button', { name: /Byrja áskoranir/ }));
    fireEvent.click(rendered.container.querySelector('.grid button')!);
    later();
    fireEvent.click(ui.getByRole('button', { name: /Næsta áskorun/ }));
    expect(scrollBy).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

describe('The menu', () => {
  it('opens a level at its top, and on the way back focuses the next level to play', () => {
    const rendered = render(<App />);
    const ui = within(rendered.container);
    fireEvent.click(ui.getByRole('button', { name: /Stig 1: Grunnreglur/ }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.tagName).toBe('H1');

    fireEvent.click(ui.getByRole('button', { name: /Til baka/ }));
    expect(focused()?.getAttribute('data-level-card')).toBe('level1');
  });
});
