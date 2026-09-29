/**
 * Where the screen lands, and where focus goes, after the student acts.
 *
 * The game used to carry its own reveal helper (`src/utils/reveal.ts`). It now
 * uses the shared one in `@shared/utils`, and these tests hold the game to
 * what the old helper did plus what the vertical-scroll pass added:
 *
 * - On a desktop window the old triggers stand, at any width: feedback or a
 *   first table row that opened within 48 px of the bottom edge is brought in,
 *   and a Skilja step whose top has scrolled away comes back. Nothing else
 *   moves the page there.
 * - On a phone, a commit brings in as much as fits through the next button.
 * - Focus never falls to `<body>`: after a commit it goes to the feedback
 *   group, never to the next button; after a step or problem change, to the
 *   new heading; after a measurement, to the table; back on the menu, to the
 *   next phase not yet done.
 * - The next button ignores a press within 400 ms of appearing, so a double
 *   tap on Athuga cannot skip the feedback.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY } from '@shared/utils';

import App from '../App';
import { ApplyScreen } from '../components/ApplyScreen';
import { ExploreScreen } from '../components/ExploreScreen';
import { PracticeScreen } from '../components/PracticeScreen';
import { UnderstandScreen } from '../components/UnderstandScreen';

/** Where every element's top is, as far as the components can tell. */
let top = 100;
let phone = true;
let clock = 1000;
const scrollBy = vi.fn();

beforeEach(() => {
  top = 100;
  phone = true;
  clock = 1000;
  scrollBy.mockClear();
  localStorage.clear();
  window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
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
});

const focused = () => document.activeElement as HTMLElement | null;
const later = () => {
  clock += 500;
};

function answerPractice(value = '5') {
  fireEvent.change(screen.getByLabelText('Svar'), { target: { value } });
  fireEvent.click(screen.getByRole('button', { name: 'Athuga' }));
}

describe('Æfa', () => {
  it('moves focus to the feedback after Athuga, not to Áfram', () => {
    render(<PracticeScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    answerPractice();
    const group = focused();
    expect(group?.getAttribute('role')).toBe('group');
    expect(group?.textContent).toMatch(/Rangt/);
    expect(group?.contains(screen.getByRole('button', { name: 'Áfram' }))).toBe(false);
  });

  it('on a phone, brings the feedback through Áfram into view', () => {
    top = 600;
    render(<PracticeScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    scrollBy.mockClear();
    answerPractice();
    // Everything is 100 px tall at 600: its bottom (700) goes to 640 − 8.
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 68, behavior: 'smooth' });
  });

  it('on a desktop window, moves only feedback that opened at the bottom edge', () => {
    phone = false;
    render(<PracticeScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    answerPractice();
    expect(scrollBy).not.toHaveBeenCalled();

    cleanup();
    top = 600;
    render(<PracticeScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    answerPractice();
    expect(scrollBy).toHaveBeenCalledTimes(1);
  });

  it('ignores Áfram within 400 ms of it appearing', () => {
    render(<PracticeScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    answerPractice();
    fireEvent.click(screen.getByRole('button', { name: 'Áfram' }));
    expect(screen.getByText(/Skref 1 af 3/)).toBeTruthy();

    later();
    fireEvent.click(screen.getByRole('button', { name: 'Áfram' }));
    expect(screen.getByText(/Skref 2 af 3/)).toBeTruthy();
  });

  it('focuses the new step, and the new problem, as each opens', () => {
    render(<PracticeScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    answerPractice();
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Áfram' }));
    expect(focused()?.textContent).toMatch(/^Skref 2 af 3/);

    later();
    fireEvent.click(screen.getByRole('button', { name: 'Áfram' }));
    expect(focused()?.textContent).toMatch(/^Skref 3 af 3/);

    answerPractice('9');
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Áfram' }));
    // A new problem: focus on its statement, the first thing to read.
    expect(focused()?.textContent).toMatch(/lausn af/);
    expect(screen.getByText(/Dæmi 2 af/)).toBeTruthy();
  });

  it('puts focus back in the field after Reyna aftur', () => {
    render(<PracticeScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    answerPractice();
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Reyna aftur' }));
    expect(focused()).toBe(screen.getByLabelText('Svar'));
  });

  it('focuses the last hint once its button is gone', () => {
    render(<PracticeScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    for (let i = 1; i <= 3; i++) {
      fireEvent.click(screen.getByRole('button', { name: `Vísbending ${i} af 3` }));
    }
    expect(screen.queryByRole('button', { name: /Vísbending/ })).toBeNull();
    expect(focused()?.tagName).toBe('LI');
    expect(focused()?.textContent).toMatch(/Hér: x = √/);
  });
});

describe('Beita', () => {
  function answerApply() {
    fireEvent.change(screen.getByLabelText('Svar'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Svara' }));
  }

  it('moves focus to the feedback, and to the next question after Næsta dæmi', () => {
    render(<ApplyScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    answerApply();
    expect(focused()?.getAttribute('role')).toBe('group');
    expect(focused()?.textContent).toMatch(/Rangt/);

    const next = screen.getByRole('button', { name: 'Næsta dæmi' });
    fireEvent.click(next);
    expect(screen.getByText(/Dæmi 1 af/)).toBeTruthy();

    later();
    fireEvent.click(next);
    expect(screen.getByText(/Dæmi 2 af/)).toBeTruthy();
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
  });

  it('on a desktop window, moves only a verdict that opened at the bottom edge', () => {
    phone = false;
    render(<ApplyScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    answerApply();
    expect(scrollBy).not.toHaveBeenCalled();

    cleanup();
    top = 600;
    render(<ApplyScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    answerApply();
    expect(scrollBy).toHaveBeenCalledTimes(1);
  });
});

describe('Skilja', () => {
  it('brings a step whose top scrolled away back, at any width, and focuses it', () => {
    for (const width of ['phone', 'desktop'] as const) {
      phone = width === 'phone';
      top = -300;
      scrollBy.mockClear();
      render(<UnderstandScreen onComplete={vi.fn()} onBack={vi.fn()} />);
      later();
      fireEvent.click(screen.getByRole('button', { name: 'Næsta skref →' }));
      // No sticky header in jsdom: the top goes to 8 px, the helper's margin.
      expect(scrollBy, width).toHaveBeenLastCalledWith({ top: -308, behavior: 'smooth' });
      expect(focused()?.getAttribute('role')).toBe('group');
      expect(focused()?.getAttribute('aria-labelledby')).toBe('skilja-step');
      expect(document.getElementById('skilja-step')?.textContent).toMatch(/^ICE/);
      cleanup();
    }
  });

  it('does not move a step whose top is in view', () => {
    render(<UnderstandScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Næsta skref →' }));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('keeps each step named for a screen reader where a phone shows its number', () => {
    render(<UnderstandScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    for (const name of ['1. Efnajafnan', '2. ICE-taflan', '5. 5 % reglan']) {
      expect(screen.getByRole('button', { name })).toBeTruthy();
    }
    expect(screen.getByRole('button', { name: '1. Efnajafnan' }).getAttribute('aria-current')).toBe(
      'step'
    );
  });
});

describe('Kanna', () => {
  const measure = (i: number) =>
    fireEvent.click(
      screen.getAllByRole('button').filter((b) => / M$/.test(b.textContent ?? ''))[i]
    );

  it('moves focus to the table after a measurement, and to the question on the third', () => {
    render(<ExploreScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    measure(0);
    expect(focused()?.tagName).toBe('TABLE');
    measure(1);
    expect(focused()?.tagName).toBe('TABLE');
    measure(2);
    expect(focused()?.getAttribute('role')).toBe('group');
    expect(focused()?.textContent).toMatch(/^Áður en þú lest lengra/);
  });

  it('moves focus to the explanation after the guess', () => {
    render(<ExploreScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    [0, 1, 2].forEach(measure);
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Hann helst sá sami' }));
    expect(focused()?.textContent).toMatch(/^Ka er fasti/);
  });

  it('ignores an answer within 400 ms of the question appearing', () => {
    render(<ExploreScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    [0, 1, 2].forEach(measure);
    fireEvent.click(screen.getByRole('button', { name: 'Hann helst sá sami' }));
    expect(screen.queryByText(/^Ka er fasti/)).toBeNull();
  });

  it('on a desktop window, moves only a first row that opened at the bottom edge', () => {
    phone = false;
    render(<ExploreScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    measure(0);
    expect(scrollBy).not.toHaveBeenCalled();

    cleanup();
    top = 600;
    render(<ExploreScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    measure(0);
    expect(scrollBy).toHaveBeenCalledTimes(1);
  });
});

describe('the menu', () => {
  it('focuses the next phase not yet done on the way back', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Kanna/ }));
    expect(focused()?.textContent).toMatch(/^Kanna: hvaðan kemur Ka\?/);

    fireEvent.click(screen.getByRole('button', { name: '← Til baka' }));
    expect(focused()?.getAttribute('data-phase-card')).toBe('kanna');

    fireEvent.click(screen.getByRole('button', { name: /Kanna/ }));
    [0, 1, 2].forEach((i) =>
      fireEvent.click(
        screen.getAllByRole('button').filter((b) => / M$/.test(b.textContent ?? ''))[i]
      )
    );
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Hann helst sá sami' }));
    later();
    fireEvent.click(screen.getByRole('button', { name: 'Áfram í Skilja' }));
    expect(focused()?.getAttribute('data-phase-card')).toBe('skilja');
  });

  it('puts Til baka in the heading row on a phone, and above the card elsewhere', () => {
    const inRow = () =>
      screen
        .getByRole('heading', { name: 'Æfa' })
        .parentElement!.contains(screen.getByRole('button', { name: '← Til baka' }));
    render(<PracticeScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    expect(inRow()).toBe(true);
    cleanup();

    phone = false;
    render(<PracticeScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    expect(inRow()).toBe(false);
  });
});
