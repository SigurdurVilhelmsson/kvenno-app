import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { gradeScientific } from '@shared/utils';

import { AefaScreen } from '../components/AefaScreen';
import { BeitaScreen } from '../components/BeitaScreen';
import { toggleSign } from '../components/ScientificInput';
import { BEITA_PROBLEMS, KP_PROBLEMS } from '../data/problems';
import { revealBottom, revealTop } from '../utils/reveal';

/**
 * What it takes to play this game on a phone, beyond layout.
 *
 * **The sign button matters most.** Every scientific-notation answer here is
 * typed into two fields that
 * raise the decimal keypad, and on an iPhone that keypad has no minus key. Nine
 * of the ten Beita extents and five of the eight Kp answers have a negative
 * power of ten, so without the `±` button a student on an iPhone could type the
 * right digits and not the power the field asks for. These tests play an
 * answer through it.
 *
 * The reveal helpers keep the next problem's start and a checked answer's
 * feedback on screen. They are tested against faked geometry, because jsdom
 * lays nothing out.
 */

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const SIGN = 'Skipta um formerki á veldisvísi';

/** The typed exponent of `value`, e.g. `-1` for 0,135. */
function powerOf(value: number): number {
  return Math.floor(Math.log10(value));
}

describe('toggleSign', () => {
  it('flips the sign of a typed exponent both ways', () => {
    expect(toggleSign('5')).toBe('-5');
    expect(toggleSign('-5')).toBe('5');
    expect(toggleSign('12')).toBe('-12');
  });

  it('reads a typographic minus as a minus', () => {
    expect(toggleSign('−3')).toBe('3');
  });

  it('starts a negative number from an empty field', () => {
    expect(toggleSign('')).toBe('-');
    expect(toggleSign(toggleSign(''))).toBe('');
  });

  it('produces what the grader reads as a negative power', () => {
    const graded = gradeScientific({ mantissa: '1,35', exponent: toggleSign('1') }, 0.135, 0.03);
    expect(graded.outcome).toBe('rett');
  });
});

describe('a negative power can be entered without a minus key', () => {
  it('in Beita: digits, then the sign button, is marked right', () => {
    const problem = BEITA_PROBLEMS[0];
    const power = powerOf(problem.result.extent);
    expect(power, 'the first extent has a negative power, or this proves nothing').toBeLessThan(0);
    const mantissa = (problem.result.extent / 10 ** power).toFixed(3).replace('.', ',');

    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Áfram — myndefnin aukast'));
    fireEvent.change(screen.getByLabelText('Tala'), { target: { value: mantissa } });
    // Only digits, as the decimal keypad allows.
    fireEvent.change(screen.getByLabelText('Veldisvísir'), {
      target: { value: String(Math.abs(power)) },
    });
    fireEvent.click(screen.getByRole('button', { name: SIGN }));
    expect((screen.getByLabelText('Veldisvísir') as HTMLInputElement).value).toBe(String(power));

    fireEvent.click(screen.getByText('Athuga'));
    // A correct extent moves straight on to the five-per-cent question.
    expect(screen.getByText(/nálgunin hefði dugað/)).toBeTruthy();
  });

  it('in the Kc→Kp task: the sign button is there and flips the field', () => {
    const negative = KP_PROBLEMS.findIndex((p) => powerOf(p.kp) < 0);
    expect(negative, 'some Kp answer has a negative power').toBeGreaterThanOrEqual(0);

    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Kc yfir í Kp'));
    fireEvent.change(screen.getByLabelText('Veldisvísir'), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: SIGN }));
    expect((screen.getByLabelText('Veldisvísir') as HTMLInputElement).value).toBe('-4');
  });

  it('is locked with the fields once a Kp answer has been checked', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Kc yfir í Kp'));
    fireEvent.click(screen.getByText('Athuga'));
    expect(screen.getByRole('button', { name: SIGN }).hasAttribute('disabled')).toBe(true);
  });
});

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

  it('counts a top under the header as hidden', () => {
    stickyHeader(56);
    const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    const el = document.createElement('div');
    el.getBoundingClientRect = () => rect(30, 200);
    expect(revealTop(el)).toBe(true);
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ top: -34 }));
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
    // Taller than the screen: showing its foot would hide its top.
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

describe('the next problem opens at its start', () => {
  it('scrolls back up to "Dæmi n af N" after "Næsta dæmi" in Beita', () => {
    const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
    render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByText('Áfram — myndefnin aukast'));
    fireEvent.click(screen.getByText('Athuga'));
    fireEvent.click(screen.getByText('Sýna svarið og halda áfram'));
    fireEvent.click(screen.getByText(/nálgunin hefði dugað/));
    expect(scroll, 'nothing is laid out yet, so nothing should move').not.toHaveBeenCalled();

    // The student has scrolled down to "Næsta dæmi": the counter is far above.
    const counter = screen.getByText(/Dæmi 1 af/);
    counter.getBoundingClientRect = () => rect(-500, -480);
    fireEvent.click(screen.getByText('Næsta dæmi'));

    expect(screen.getByText(/Dæmi 2 af/)).toBe(counter);
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ top: -508 }));
  });
});
