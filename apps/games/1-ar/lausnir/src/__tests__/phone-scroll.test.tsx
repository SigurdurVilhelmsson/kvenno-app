// @vitest-environment jsdom
/**
 * Where focus goes and when the page moves, as a student plays.
 *
 * - A screen swap (menu → level, and back) starts the new screen at the top of
 *   the page, at every width as it always has, and focuses its heading. Back
 *   on the menu, the first level not yet done is focused.
 * - A new item (Næsta, and Stig 1's prediction → task) brings the card's top
 *   back when it has scrolled above the screen, at every width as the old
 *   helper did, and focuses the new item.
 * - A commit focuses the feedback, never Næsta, and Næsta ignores a press
 *   within 400 ms of appearing, so a double tap cannot skip the feedback.
 *   Stig 1's "Athuga spá" and "Áfram í verkefni" are two elements.
 * - On a phone the feedback and the next action are brought into view; on a
 *   desktop the page does not move after a commit.
 *
 * jsdom has no layout, so every box is stubbed at one place (`top`).
 */
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_QUERY } from '@shared/utils';

import App from '../App';
import { Level0Electrolytes } from '../components/Level0Electrolytes';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';

let phone = true;
let clock = 1000;
let top = 900;
const scrollBy = vi.fn();
const scrollTo = vi.fn();

let frames = new Map<number, FrameRequestCallback>();
let lastFrame = 0;
/** Runs the animation frames asked for so far: where a level reveals and focuses after a commit. */
function frame() {
  const due = [...frames.values()];
  frames = new Map();
  act(() => due.forEach((cb) => cb(0)));
}

function press(el: Element) {
  fireEvent.click(el);
  frame();
}

/** Lets the Næsta guard's 400 ms pass. */
function later() {
  clock += 500;
}

const focused = () => document.activeElement as HTMLElement | null;

beforeEach(() => {
  localStorage.clear();
  phone = true;
  clock = 1000;
  top = 900;
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
  frames = new Map();
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    frames.set(++lastFrame, cb);
    return lastFrame;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id);
  });
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    () =>
      ({
        top,
        bottom: top + 100,
        height: 100,
        left: 0,
        right: 100,
        width: 100,
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

/** The focused element is a feedback group: role=group, not a button. */
function expectFeedbackFocused(text: RegExp) {
  const f = focused();
  expect(f?.getAttribute('role')).toBe('group');
  expect(f?.textContent).toMatch(text);
}

describe('the menu', () => {
  it('starts a level at the top, on a desktop too, and not on first load', () => {
    phone = false;
    const { container } = render(<App />);
    expect(scrollTo).not.toHaveBeenCalled();

    // The menu scroll position used to carry over into the level: on a phone
    // Stig 2 opened in the middle of its answer options.
    press(within(container).getByRole('button', { name: /Stig 2: Rökstuðningur/ }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(within(container).getByText('Atburðarás 1: Útþynning með vatni')).toBeTruthy();
    expect(focused()?.tagName).toBe('H1');
  });

  it('keeps Stig 3 on its answer field when it opens', () => {
    const { container } = render(<App />);
    press(within(container).getByRole('button', { name: /Stig 3: Útreikningar/ }));
    expect(focused()?.tagName).toBe('INPUT');
  });

  it('focuses the first level not yet done when the student comes back', () => {
    localStorage.setItem(
      'lausnirProgress',
      JSON.stringify({ level0Completed: true, level0Score: 10, totalGamesPlayed: 1 })
    );
    const { container } = render(<App />);
    const ui = within(container);
    press(ui.getByRole('button', { name: /Stig 3: Útreikningar/ }));
    scrollTo.mockClear();
    press(ui.getAllByRole('button', { name: /Til baka í valmynd/ })[0]);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(focused()?.getAttribute('data-level-card')).toBe('1');
  });
});

describe('Stig 0', () => {
  it('focuses the verdict after a choice and the next solute after Næsta', () => {
    const { container } = render(<Level0Electrolytes onComplete={() => {}} onBack={() => {}} />);
    const ui = within(container);
    press(ui.getByRole('button', { name: 'Byrja að flokka' }));
    expect(focused()?.tagName).toBe('H2');

    press(ui.getByRole('button', { name: 'Veikur rafkleyfi' }));
    expectFeedbackFocused(/^(Rétt\.|Nei —)/);
    expect(focused()?.getAttribute('aria-labelledby')).toBe('lausnir-l0-verdict');
    // On a phone the verdict and Næsta are brought into view.
    expect(scrollBy).toHaveBeenCalled();

    // A press at once — the second tap of a double tap — is dropped.
    const next = ui.getByRole('button', { name: 'Næsta' });
    press(next);
    expect(ui.getByText(/^Efni 1 af/)).toBeTruthy();

    later();
    press(next);
    expect(ui.getByText(/^Efni 2 af/)).toBeTruthy();
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
  });
});

describe('Stig 1', () => {
  it('keeps "Athuga spá" and "Áfram í verkefni" apart and focuses the feedback', () => {
    const { container } = render(<Level1 onComplete={() => {}} onBack={() => {}} />);
    const ui = within(container);

    press(ui.getByRole('button', { name: /Eykst/ }));
    press(ui.getByRole('button', { name: 'Athuga spá' }));
    expectFeedbackFocused(/Rangt/);

    const check = ui.getByRole('button', { name: 'Athuga spá' });
    press(ui.getByRole('button', { name: /Minnkar/ }));
    press(check);
    expectFeedbackFocused(/Rétt/);
    expect(check.isConnected).toBe(false);

    // The second tap of a double tap is dropped.
    const onward = ui.getByRole('button', { name: /Áfram í verkefni/ });
    press(onward);
    expect(ui.getByRole('heading', { name: 'Hugsaðu fyrst!' })).toBeTruthy();

    later();
    press(onward);
    expect(ui.queryByRole('heading', { name: 'Hugsaðu fyrst!' })).toBeNull();
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
    expect(focused()?.textContent).toMatch(/^Verkefni 1:/);
  });

  it('focuses the concept panel after a right "Athuga lausn"', () => {
    const { container } = render(<Level1 onComplete={() => {}} onBack={() => {}} />);
    const ui = within(container);
    press(ui.getByRole('button', { name: '2' }));
    press(ui.getByRole('button', { name: /Eykst/ }));
    press(ui.getByRole('button', { name: 'Athuga spá' }));
    later();
    press(ui.getByRole('button', { name: /Áfram í verkefni/ }));

    // 20 → 30 sameindir in 200 mL is the 1,5 M asked for.
    press(ui.getByRole('button', { name: '+10' }));
    press(ui.getByRole('button', { name: /Athuga lausn/ }));
    expectFeedbackFocused(/Rétt/);
  });

  it('focuses the hint when it opens', () => {
    const { container } = render(<Level1 onComplete={() => {}} onBack={() => {}} />);
    const ui = within(container);
    press(ui.getByRole('button', { name: /Minnkar/ }));
    press(ui.getByRole('button', { name: 'Athuga spá' }));
    later();
    press(ui.getByRole('button', { name: /Áfram í verkefni/ }));
    press(ui.getByRole('button', { name: 'Sýna vísbendingu' }));
    expect(focused()?.textContent).toMatch(/Vísbending:/);
  });
});

describe('Stig 2', () => {
  it('focuses the result after "Staðfesta svar" and the next scenario after Næsta', () => {
    const { container } = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    const ui = within(container);
    const options = ui
      .getAllByRole('button')
      .filter((b) => b.className.includes('rounded-xl border-2'));
    press(options[0]);
    press(ui.getByRole('button', { name: 'Staðfesta svar' }));
    expectFeedbackFocused(/Rétt|Ekki alveg rétt/);
    expect(focused()?.getAttribute('aria-labelledby')).toBe('lausnir-l2-verdict');
    expect(scrollBy).toHaveBeenCalled();

    const next = ui.getByRole('button', { name: /Næsta spurning/ });
    press(next);
    expect(ui.getByText(/^Atburðarás 1:/)).toBeTruthy();

    later();
    press(next);
    expect(focused()?.textContent).toMatch(/^Atburðarás 2:/);
  });

  it('on a desktop, does not move the page after a commit, but still brings back a card scrolled above', () => {
    phone = false;
    top = 0;
    const { container } = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    const ui = within(container);
    const options = ui
      .getAllByRole('button')
      .filter((b) => b.className.includes('rounded-xl border-2'));
    press(options[0]);
    press(ui.getByRole('button', { name: 'Staðfesta svar' }));
    expect(scrollBy).not.toHaveBeenCalled();
    expectFeedbackFocused(/Rétt|Ekki alveg rétt/);

    // The student has scrolled down to Næsta; the card's top is gone.
    top = -600;
    later();
    press(ui.getByRole('button', { name: /Næsta spurning/ }));
    expect(scrollBy).toHaveBeenCalledWith({ top: -600, behavior: 'smooth' });
  });
});

describe('Stig 3', () => {
  it('focuses the feedback after Athuga and the answer field after Næsta', () => {
    const { container } = render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    const ui = within(container);
    fireEvent.change(ui.getByPlaceholderText('0,000'), { target: { value: '1' } });
    press(ui.getByRole('button', { name: 'Athuga' }));
    expectFeedbackFocused(/Rétt svar/);

    const next = ui.getByRole('button', { name: /Næsta dæmi/ });
    press(next);
    expect(ui.getByText('Dæmi 1/8')).toBeTruthy();

    later();
    press(next);
    expect(ui.getByText('Dæmi 2/8')).toBeTruthy();
    expect(focused()?.tagName).toBe('INPUT');
  });

  it('brings the next problem back into view on a desktop too, as it always has', () => {
    phone = false;
    top = 0;
    const { container } = render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    const ui = within(container);
    fireEvent.change(ui.getByPlaceholderText('0,000'), { target: { value: '1' } });
    press(ui.getByRole('button', { name: 'Athuga' }));
    expect(scrollBy).not.toHaveBeenCalled();

    top = -800;
    later();
    press(ui.getByRole('button', { name: /Næsta dæmi/ }));
    expect(scrollBy).toHaveBeenCalledWith({ top: -800, behavior: 'smooth' });
  });
});
