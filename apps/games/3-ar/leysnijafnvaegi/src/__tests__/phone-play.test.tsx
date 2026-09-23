import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { AefaScreen } from '../components/AefaScreen';
import { BeitaScreen } from '../components/BeitaScreen';
import { toggleSign } from '../components/ScientificInput';
import { SOLUBILITY_PROBLEMS } from '../data/problems';
import { gradeScientific } from '../engine/ksp';
import { revealBottom, revealTop } from '../utils/reveal';

/**
 * What it takes to play this game on a phone, beyond layout.
 *
 * **The sign button matters most.** Æfa's answers are typed as a number and a
 * power of ten, in two fields that raise the decimal keypad — and on an iPhone
 * that keypad has no minus key, while every answer in Æfa has a negative power.
 * Without the `±` button a student on an iPhone could not enter a single
 * answer in the phase. These tests play one through it.
 *
 * The reveal helpers keep a new screen's start, the next problem's start and a
 * checked answer's feedback on screen. They are tested against faked geometry,
 * because jsdom lays nothing out.
 */

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  localStorage.clear();
});

const SIGN = 'Skipta um formerki á veldisvísi';

/** The typed exponent of `value`, e.g. `-5` for 1,34 × 10⁻⁵. */
function powerOf(value: number): number {
  return Math.floor(Math.log10(value));
}

/** A `DOMRect` with only the edges these helpers read. */
function rect(top: number, bottom: number): DOMRect {
  return { top, bottom, left: 0, right: 100, width: 100, height: bottom - top } as DOMRect;
}

/** A sticky game header, `height` px tall, at the top of the viewport. */
function stickyHeader(height: number) {
  const header = document.createElement('header');
  header.style.position = 'sticky';
  header.getBoundingClientRect = () => rect(0, height);
  document.body.appendChild(header);
}

describe('toggleSign', () => {
  it('flips the sign of a typed exponent both ways', () => {
    expect(toggleSign('5')).toBe('-5');
    expect(toggleSign('-5')).toBe('5');
    expect(toggleSign('17')).toBe('-17');
  });

  it('reads a typographic minus as a minus', () => {
    expect(toggleSign('−3')).toBe('3');
  });

  it('starts a negative number from an empty field', () => {
    expect(toggleSign('')).toBe('-');
    expect(toggleSign(toggleSign(''))).toBe('');
  });

  it('produces what the grader reads as a negative power', () => {
    expect(gradeScientific({ mantissa: '1,34', exponent: toggleSign('5') }, 1.34e-5).outcome).toBe(
      'rett'
    );
  });
});

describe('an Æfa answer can be entered without a minus key', () => {
  it('is needed on every problem: every answer has a negative power of ten', () => {
    for (const p of SOLUBILITY_PROBLEMS) expect(powerOf(p.answer), p.id).toBeLessThan(0);
  });

  it('digits, then the sign button, is marked right', () => {
    // Æfa runs the problems easiest first, in data order within a difficulty.
    const first = SOLUBILITY_PROBLEMS.find((p) => p.difficulty === 'ledd')!;
    const power = powerOf(first.answer);
    const mantissa = (first.answer / 10 ** power).toFixed(2).replace('.', ',');

    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    expect(screen.getAllByText(first.formula).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Tala'), { target: { value: mantissa } });
    // Only digits, as the decimal keypad allows.
    fireEvent.change(screen.getByLabelText('Veldisvísir'), {
      target: { value: String(Math.abs(power)) },
    });
    fireEvent.click(screen.getByRole('button', { name: SIGN }));
    expect((screen.getByLabelText('Veldisvísir') as HTMLInputElement).value).toBe(String(power));

    fireEvent.click(screen.getByText('Athuga'));
    expect(screen.getByText('Rétt.')).toBeTruthy();
  });

  it('is locked with the fields once the answer has been checked', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Athuga'));
    expect(screen.getByRole('button', { name: SIGN }).hasAttribute('disabled')).toBe(true);
  });
});

describe('revealTop', () => {
  it('brings an element hidden under the sticky header back below it', () => {
    stickyHeader(56);
    const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    const el = document.createElement('div');
    el.getBoundingClientRect = () => rect(-300, -100);

    expect(revealTop(el)).toBe(true);
    // 300 px above the viewport, plus the 56 px header, plus an 8 px gap.
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ top: -364 }));
  });

  it('leaves alone an element already on screen, and a static header covers nothing', () => {
    const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    const header = document.createElement('header');
    header.style.position = 'static';
    header.getBoundingClientRect = () => rect(0, 56);
    document.body.appendChild(header);
    const el = document.createElement('div');
    el.getBoundingClientRect = () => rect(10, 200);

    expect(revealTop(el)).toBe(false);
    expect(revealTop(null)).toBe(false);
    expect(scroll).not.toHaveBeenCalled();
  });
});

describe('revealBottom', () => {
  it('scrolls a panel that ends below the screen just far enough to show it', () => {
    const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    const el = document.createElement('div');
    el.getBoundingClientRect = () => rect(600, window.innerHeight + 100);

    expect(revealBottom(el)).toBe(true);
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ top: 108 }));
  });

  it('never pushes the panel’s own first line under the header', () => {
    stickyHeader(56);
    const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    const el = document.createElement('div');
    el.getBoundingClientRect = () => rect(300, window.innerHeight + 900);

    expect(revealBottom(el)).toBe(true);
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ top: 300 - 56 - 8 }));
  });

  it('does nothing when the panel is already fully on screen', () => {
    const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    const el = document.createElement('div');
    el.getBoundingClientRect = () => rect(100, 300);
    expect(revealBottom(el)).toBe(false);
    expect(scroll).not.toHaveBeenCalled();
  });
});

describe('what the student sees after a tap', () => {
  it('a phase opened from low on the menu starts at its top', () => {
    render(<App />);
    const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    // The student has scrolled down to the Beita card: the top of <main> is
    // far above the viewport.
    document.getElementById('main-content')!.getBoundingClientRect = () => rect(-700, 900);
    fireEvent.click(screen.getByRole('button', { name: /Beita/ }));

    expect(screen.getByText('Beita — myndast botnfall?')).toBeTruthy();
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ top: -708 }));
  });

  it('Beita’s revealed working is brought up when it ends below the screen', () => {
    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
      rect(600, window.innerHeight + 100)
    );
    fireEvent.click(screen.getByRole('button', { name: /Já, Q/ }));

    expect(screen.getByText('Næsta dæmi')).toBeTruthy();
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ top: 108 }));
  });

  it('the next Æfa problem opens at its start, not where "Næsta dæmi" was', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Athuga'));
    const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    // The card's top is scrolled far above the viewport by now.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect(-500, 100));
    fireEvent.click(screen.getByText('Næsta dæmi'));

    expect(screen.getByText(/Dæmi 2 af/)).toBeTruthy();
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ top: -508 }));
  });
});
