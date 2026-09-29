/**
 * Where the screen lands, and where focus goes, after the student acts.
 *
 * The game used to carry its own reveal helper (`src/utils/reveal.ts`). It now
 * uses the shared one in `@shared/utils`, and these tests hold the game to what
 * the old helper did plus what the vertical-scroll pass added:
 *
 * - On a desktop window the old triggers stand, at any width: a new screen or a
 *   new problem whose top has scrolled away comes back, and feedback that ran
 *   past the bottom edge is brought up. Nothing else moves the page there.
 * - On a phone, a commit brings in as much as fits through the next button; a
 *   picked salt comes on screen with the list; letting go of the slider brings
 *   in the bars through "Áfram í Skilja"; a new Skilja rung comes in down to
 *   its button.
 * - Focus never falls to `<body>`: after a commit it goes to the feedback
 *   group, never to the next button; after a problem change, to the new
 *   question; after a Skilja step, to the new rung; back on the menu, to the
 *   next phase not yet done.
 * - Each next button ignores a press within 400 ms of appearing, so a double
 *   tap on the commit cannot skip the feedback.
 *
 * jsdom lays nothing out, so every element reports the same box: `top` to
 * `top + 100`, in a 640 px tall window with no sticky header.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY } from '@shared/utils';

import App from '../App';
import { AefaScreen } from '../components/AefaScreen';
import { BeitaScreen } from '../components/BeitaScreen';
import { KannaScreen } from '../components/KannaScreen';
import { SkiljaScreen } from '../components/SkiljaScreen';

let top = 100;
let phone = true;
let clock = 1000;
const scrollBy = vi.fn();
const scrollTo = vi.fn();

beforeEach(() => {
  top = 100;
  phone = true;
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
  Object.defineProperty(window, 'innerHeight', { value: 640, configurable: true });
  Object.defineProperty(window, 'visualViewport', { value: undefined, configurable: true });
  vi.spyOn(performance, 'now').mockImplementation(() => clock);
  // Frames run at once, so the reveals can be read synchronously.
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
});

const focused = () => document.activeElement as HTMLElement | null;
const later = () => {
  clock += 500;
};

/** A readable answer that is wrong for every problem. */
function answerAefa() {
  fireEvent.change(screen.getByLabelText('Tala'), { target: { value: '9,9' } });
  fireEvent.change(screen.getByLabelText('Veldisvísir'), { target: { value: '-30' } });
  fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
}

/** The verdict that names a focused group, through its aria-labelledby. */
const groupName = (el: HTMLElement | null) =>
  document.getElementById(el?.getAttribute('aria-labelledby') ?? '')?.textContent;

describe('Æfa', () => {
  it('moves focus to the feedback after Athuga, not to Næsta dæmi', () => {
    render(<AefaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    answerAefa();
    const group = focused();
    expect(group?.getAttribute('role')).toBe('group');
    expect(groupName(group)).toBe('Hvorki tölustafirnir né veldisvísirinn stemma.');
    expect(group?.contains(screen.getByRole('button', { name: 'Næsta dæmi' }))).toBe(true);
    expect(group).not.toBe(screen.getByRole('button', { name: 'Næsta dæmi' }));
  });

  it('on a phone, brings the feedback through Næsta dæmi into view', () => {
    top = 600;
    render(<AefaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    answerAefa();
    // Everything is 100 px tall at 600: its bottom (700) goes to 640 − 8.
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 68, behavior: 'smooth' });
  });

  it('on a desktop window, moves only feedback that ran past the bottom edge', () => {
    phone = false;
    render(<AefaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    answerAefa();
    expect(scrollBy).not.toHaveBeenCalled();

    cleanup();
    top = 600;
    render(<AefaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    answerAefa();
    // As the old helper: the bottom 8 px above the edge, and only once.
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 68, behavior: 'smooth' });
  });

  it('ignores Næsta dæmi within 400 ms of it appearing', () => {
    render(<AefaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    answerAefa();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta dæmi' }));
    expect(screen.getByText(/Dæmi 1 af/)).toBeTruthy();

    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta dæmi' }));
    expect(screen.getByText(/Dæmi 2 af/)).toBeTruthy();
  });

  it('brings the next problem back at any width, and focuses its question', () => {
    for (const width of ['phone', 'desktop'] as const) {
      phone = width === 'phone';
      render(<AefaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
      answerAefa();
      top = -300;
      scrollBy.mockClear();
      later();
      fireEvent.click(screen.getByRole('button', { name: 'Næsta dæmi' }));
      // No sticky header in jsdom: the card's top goes to 8 px.
      expect(scrollBy, width).toHaveBeenLastCalledWith({ top: -308, behavior: 'smooth' });
      expect(focused()?.hasAttribute('data-item-start'), width).toBe(true);
      expect(focused()?.textContent, width).toMatch(/^Hver er mólarleysni BaSO₄/);
      cleanup();
      top = 100;
    }
  });

  it('moves from the number to the power of ten on Enter, and checks on Enter there', () => {
    render(<AefaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Tala'), { target: { value: '9,9' } });
    fireEvent.keyDown(screen.getByLabelText('Tala'), { key: 'Enter' });
    expect(focused()).toBe(screen.getByLabelText('Veldisvísir'));
    fireEvent.change(screen.getByLabelText('Veldisvísir'), { target: { value: '-30' } });
    fireEvent.keyDown(screen.getByLabelText('Veldisvísir'), { key: 'Enter' });
    expect(screen.getByText('Hvorki tölustafirnir né veldisvísirinn stemma.')).toBeTruthy();
    expect(screen.getByLabelText('Tala').getAttribute('enterkeyhint')).toBe('next');
    expect(screen.getByLabelText('Veldisvísir').getAttribute('enterkeyhint')).toBe('done');
  });
});

describe('Beita', () => {
  const predict = () => fireEvent.click(screen.getByRole('button', { name: /^Nei, Q/ }));

  it('moves focus to the working after the prediction, named by the verdict', () => {
    render(<BeitaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    predict();
    const group = focused();
    expect(group?.getAttribute('role')).toBe('group');
    expect(groupName(group)).toMatch(/^(Ekki rétt|Rétt)\.$/);
    expect(group).not.toBe(screen.getByRole('button', { name: 'Næsta dæmi' }));
  });

  it('ignores Næsta dæmi within 400 ms, then focuses the next question', () => {
    render(<BeitaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    predict();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta dæmi' }));
    expect(screen.getByText(/Dæmi 1 af/)).toBeTruthy();

    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta dæmi' }));
    expect(screen.getByText(/Dæmi 2 af/)).toBeTruthy();
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
    expect(focused()?.textContent).toMatch(/látið falla út\?$/);
  });

  it('on a phone, brings the working through Næsta dæmi into view', () => {
    top = 600;
    render(<BeitaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    predict();
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 68, behavior: 'smooth' });
  });

  it('on a desktop window, moves only working that ran past the bottom edge', () => {
    phone = false;
    render(<BeitaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    predict();
    expect(scrollBy).not.toHaveBeenCalled();

    cleanup();
    top = 600;
    render(<BeitaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    predict();
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 68, behavior: 'smooth' });
  });

  it('on a desktop window, working taller than the window comes up to its first line', () => {
    phone = false;
    top = 300;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
      () => ({ top, bottom: top + 900, left: 0, right: 100, width: 100, height: 900 }) as DOMRect
    );
    render(<BeitaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    predict();
    // As the old helper: never further than its top, 8 px under the edge.
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 292, behavior: 'smooth' });
  });
});

describe('Skilja', () => {
  it('focuses each new rung, and brings it in with its button on a phone only', () => {
    for (const width of ['phone', 'desktop'] as const) {
      phone = width === 'phone';
      top = 600;
      scrollBy.mockClear();
      render(<SkiljaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
      later();
      fireEvent.click(screen.getByRole('button', { name: 'Næsta skref' }));
      expect(focused()?.getAttribute('role'), width).toBe('group');
      expect(groupName(focused()), width).toBe('2. Skrifaðu leysnimargfeldið');
      if (phone) expect(scrollBy).toHaveBeenLastCalledWith({ top: 68, behavior: 'smooth' });
      else expect(scrollBy).not.toHaveBeenCalled();
      cleanup();
    }
  });

  it('ignores a second press within 400 ms, on Næsta skref and on Áfram í Æfa', () => {
    const onComplete = vi.fn();
    render(<SkiljaScreen onComplete={onComplete} onBack={vi.fn()} />);
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta skref' }));
    fireEvent.click(screen.getByRole('button', { name: 'Næsta skref' }));
    expect(groupName(focused())).toBe('2. Skrifaðu leysnimargfeldið');
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta skref' }));
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta skref' }));
    // The last rung: the button is now a different one, and not yet live.
    fireEvent.click(screen.getByRole('button', { name: 'Áfram í Æfa' }));
    expect(onComplete).not.toHaveBeenCalled();
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Áfram í Æfa' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe('Kanna', () => {
  it('on a phone, brings a picked salt on screen with the list; not on a desktop', () => {
    top = 600;
    render(<KannaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'AgBr' }));
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 68, behavior: 'smooth' });
    cleanup();

    phone = false;
    scrollBy.mockClear();
    render(<KannaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'AgBr' }));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('on a phone, letting go of the slider brings in the bars through Áfram í Skilja', () => {
    top = 600;
    render(<KannaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    const slider = screen.getByRole('slider');
    // Dragging fires `input`, which moves nothing; the release fires `change`.
    fireEvent.input(slider, { target: { value: '3' } });
    expect(screen.getByRole('button', { name: 'Áfram í Skilja' }).hasAttribute('disabled')).toBe(
      false
    );
    expect(scrollBy).not.toHaveBeenCalled();
    fireEvent.change(slider, { target: { value: '3' } });
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 68, behavior: 'smooth' });
  });
});

describe('the menu', () => {
  it('opens each phase at its heading, and focuses the next phase on the way back', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Kanna/ }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.textContent).toMatch(/^Kanna — hvað þýðir/);

    fireEvent.click(screen.getByRole('button', { name: 'Til baka' }));
    expect(focused()?.getAttribute('data-phase-card')).toBe('kanna');

    fireEvent.click(screen.getByRole('button', { name: /Kanna/ }));
    fireEvent.change(screen.getByRole('slider'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Áfram í Skilja' }));
    expect(focused()?.getAttribute('data-phase-card')).toBe('skilja');
  });

  it('on a desktop window, brings <main> back only when its top scrolled away', () => {
    phone = false;
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Beita/ }));
    expect(scrollBy).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();

    top = -700;
    fireEvent.click(screen.getByRole('button', { name: 'Til baka' }));
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -708, behavior: 'smooth' });
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
