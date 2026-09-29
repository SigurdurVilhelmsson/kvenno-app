/**
 * Where the screen lands, and where focus goes, after the student acts.
 *
 * The game used to carry its own reveal helper (`src/utils/reveal.ts`). It now
 * uses the shared one in `@shared/utils`, and these tests hold the game to what
 * the old helper did plus what the vertical-scroll pass added:
 *
 * - On a desktop window the old triggers stand, at any width: a new screen,
 *   task or problem whose top has scrolled away comes back, and feedback that
 *   ran past the bottom edge is brought up. Nothing else moves the page there.
 * - On a phone, a commit brings in as much as fits through the next button.
 * - Focus never falls to `<body>`: after a commit it goes to the feedback,
 *   never to the next button; after a problem change, to the new problem;
 *   after a Skilja step, to the new step; back on the menu, to the next phase
 *   not yet done. Where the next thing is a number to type, a phone focuses
 *   the field.
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
const button = (name: string) => screen.getByRole('button', { name });

/** The verdict that names a focused group, through its aria-labelledby. */
const groupName = (el: HTMLElement | null) =>
  document.getElementById(el?.getAttribute('aria-labelledby') ?? '')?.textContent;

describe('the menu', () => {
  it('opens a phase at its heading, and comes back to the next phase not yet done', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Kanna/ }));
    expect(focused()?.tagName).toBe('H2');
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });

    for (const name of ['Bara myndefni', 'Mikið af myndefnum', 'Tífalt þynnra']) {
      fireEvent.click(button(name));
    }
    later();
    fireEvent.click(button('Áfram'));
    expect(focused()?.getAttribute('data-phase-card')).toBe('skilja');
  });
});

describe('Kanna', () => {
  it('moves focus to the settled mixture after a pick', () => {
    render(<KannaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(button('Bara myndefni'));
    expect(focused()?.getAttribute('role')).toBe('group');
    expect(groupName(focused())).toBe('Í jafnvægi');
  });

  it('on a phone, brings a result that ends below the screen into view', () => {
    top = 600;
    render(<KannaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(button('Bara myndefni'));
    expect(scrollBy).toHaveBeenCalled();
  });

  it('ignores "Áfram" pressed at once after the fourth mixture', () => {
    const onComplete = vi.fn();
    render(<KannaScreen onComplete={onComplete} onBack={vi.fn()} />);
    for (const name of ['Bara myndefni', 'Mikið af myndefnum', 'Tífalt þynnra']) {
      fireEvent.click(button(name));
    }
    fireEvent.click(button('Áfram'));
    expect(onComplete).not.toHaveBeenCalled();
    later();
    fireEvent.click(button('Áfram'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe('Skilja', () => {
  it('moves focus to each new step, and a double press moves on only once', () => {
    render(<SkiljaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    later();
    fireEvent.click(button('Næsta'));
    fireEvent.click(button('Næsta'));
    expect(focused()?.tagName).toBe('SECTION');
    expect(focused()?.textContent).toContain('Fast efni og hreinn vökvi');
  });

  it('makes "Ljúka" a new element, not "Næsta" relabelled', () => {
    const onComplete = vi.fn();
    render(<SkiljaScreen onComplete={onComplete} onBack={vi.fn()} />);
    for (let i = 0; i < 3; i++) {
      later();
      fireEvent.click(button('Næsta'));
    }
    later();
    const lastNext = button('Næsta');
    fireEvent.click(lastNext);
    expect(lastNext.isConnected).toBe(false);
    fireEvent.click(button('Ljúka'));
    expect(onComplete).not.toHaveBeenCalled();
  });
});

describe('Æfa', () => {
  it('moves focus to the feedback after Athuga, not to "Næsta dæmi"', () => {
    render(<AefaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(button('Athuga'));
    const group = focused();
    expect(group?.getAttribute('role')).toBe('group');
    expect(groupName(group)).toMatch(/^(Rétt|Ekki alveg)\.$/);
    expect(group?.contains(button('Næsta dæmi'))).toBe(true);
    expect(group).not.toBe(button('Næsta dæmi'));
  });

  it('ignores "Næsta dæmi" pressed at once, then opens the next problem focused', () => {
    render(<AefaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(button('Athuga'));
    fireEvent.click(button('Næsta dæmi'));
    expect(screen.getByText(/Dæmi 1 af/)).toBeTruthy();
    later();
    fireEvent.click(button('Næsta dæmi'));
    expect(screen.getByText(/Dæmi 2 af/)).toBeTruthy();
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
  });

  it('on a phone, brings the feedback through "Næsta dæmi" into view', () => {
    top = 600;
    render(<AefaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(button('Athuga'));
    expect(scrollBy).toHaveBeenCalled();
  });

  it('in Spá fyrir um stefnu, moves focus to the feedback', () => {
    render(<AefaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(button('Spá fyrir um stefnu'));
    fireEvent.click(button('Þegar í jafnvægi'));
    expect(groupName(focused())).toMatch(/^(Rétt|Rangt)\.$/);
  });

  it('in Kc yfir í Kp, leaves focus in the fields after an empty check', () => {
    render(<AefaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(button('Kc yfir í Kp'));
    const field = screen.getByLabelText('Tala');
    field.focus();
    fireEvent.click(button('Athuga'));
    expect(screen.getByRole('alert').textContent).toContain('Fylltu í báða reitina');
    expect(focused()).toBe(field);
  });

  it('in Kc yfir í Kp, checks on Enter in the power of ten', () => {
    render(<AefaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(button('Kc yfir í Kp'));
    fireEvent.change(screen.getByLabelText('Tala'), { target: { value: '9,9' } });
    fireEvent.keyDown(screen.getByLabelText('Tala'), { key: 'Enter' });
    expect(focused()).toBe(screen.getByLabelText('Veldisvísir'));
    fireEvent.change(screen.getByLabelText('Veldisvísir'), { target: { value: '9' } });
    fireEvent.keyDown(screen.getByLabelText('Veldisvísir'), { key: 'Enter' });
    expect(groupName(focused())).toMatch(/stemm/);
  });

  describe('Tengd jafnvægi', () => {
    const open = () => {
      render(<AefaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
      fireEvent.click(button('Tengd jafnvægi'));
    };

    it('focuses the message when the equation is not the target yet', () => {
      open();
      fireEvent.click(button('Athuga jöfnuna'));
      expect(focused()?.textContent).toContain('ekki markjafnan enn');
    });

    it('on a phone, focuses the number field once the equation matches', () => {
      open();
      fireEvent.click(button('Snúa við'));
      fireEvent.click(button('Athuga jöfnuna'));
      expect(focused()).toBe(screen.getByLabelText('Tala'));
    });

    it('on a desktop window, focuses the verdict on the equation instead', () => {
      phone = false;
      open();
      fireEvent.click(button('Snúa við'));
      fireEvent.click(button('Athuga jöfnuna'));
      expect(focused()?.textContent).toMatch(/^Jafnan stemmir/);
    });

    it('on a phone, folds each given’s buttons into one line once they are locked', () => {
      open();
      fireEvent.click(button('Snúa við'));
      fireEvent.click(button('Athuga jöfnuna'));
      expect(screen.queryByRole('button', { name: 'Snúa við' })).toBeNull();
      expect(screen.getByText('Snúa við')).toBeTruthy();
    });

    it('ignores "Sýna svarið" pressed at once after a wrong constant', () => {
      open();
      fireEvent.click(button('Snúa við'));
      fireEvent.click(button('Athuga jöfnuna'));
      fireEvent.change(screen.getByLabelText('Tala'), { target: { value: '9,9' } });
      fireEvent.change(screen.getByLabelText('Veldisvísir'), { target: { value: '9' } });
      later();
      fireEvent.click(button('Athuga'));
      fireEvent.click(button('Sýna svarið og halda áfram'));
      expect(screen.queryByText('Næsta dæmi')).toBeNull();
      later();
      fireEvent.click(button('Sýna svarið og halda áfram'));
      expect(groupName(focused())).toMatch(/^K = /);
    });
  });
});

describe('Beita', () => {
  const toExtent = () => {
    render(<BeitaScreen onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(button('Áfram — myndefnin aukast'));
  };

  it('on a phone, focuses the field for x once the direction is chosen', () => {
    toExtent();
    expect(focused()).toBe(screen.getByLabelText('Tala'));
  });

  it('on a desktop window, focuses the Q-against-K line instead', () => {
    phone = false;
    toExtent();
    expect(focused()?.textContent).toMatch(/^Q = /);
  });

  it('moves focus through the steps and guards "Næsta dæmi"', () => {
    toExtent();
    later();
    fireEvent.click(button('Athuga'));
    expect(focused()?.textContent).toContain('Sýna svarið og halda áfram');
    later();
    fireEvent.click(button('Sýna svarið og halda áfram'));
    expect(focused()?.textContent).toMatch(/^x = /);
    later();
    fireEvent.click(button('Nei — það verður að leysa nákvæmlega'));
    expect(groupName(focused())).toMatch(/^(Rétt|Ekki rétt)\.$/);
    fireEvent.click(button('Næsta dæmi'));
    expect(screen.getByText(/Dæmi 1 af/)).toBeTruthy();
    later();
    fireEvent.click(button('Næsta dæmi'));
    expect(screen.getByText(/Dæmi 2 af/)).toBeTruthy();
    expect(focused()?.hasAttribute('data-item-start')).toBe(true);
  });

  it('on a desktop window, brings the next problem’s start back as the old helper did', () => {
    phone = false;
    toExtent();
    later();
    fireEvent.click(button('Athuga'));
    later();
    fireEvent.click(button('Sýna svarið og halda áfram'));
    later();
    fireEvent.click(button('Nei — það verður að leysa nákvæmlega'));
    scrollBy.mockClear();
    // The student has scrolled down to "Næsta dæmi": the problem is far above.
    top = -500;
    later();
    fireEvent.click(button('Næsta dæmi'));
    // 500 px above the viewport, plus the old helper's 8 px gap.
    expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ top: -508 }));
  });

  it('on a desktop window, does not scroll when the direction is chosen', () => {
    phone = false;
    top = 600;
    toExtent();
    expect(scrollBy).not.toHaveBeenCalled();
  });
});
