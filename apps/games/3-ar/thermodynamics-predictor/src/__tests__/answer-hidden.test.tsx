import { cleanup, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { InteractiveGraphProps } from '@shared/components';

import { clockPastNextGuard } from './next-guard-clock';
import { answer, openProblem, VERDICT } from './play-helpers';

/**
 * The question's answer is not on screen while the question is open (mobile-pass decision
 * 109 (c), ruled 2026-10-23).
 *
 * **Why this exists.** Each problem asks for ΔG° at the slider's temperature and whether the
 * reaction is spontaneous there. Beside the answer card, the slider panel printed that ΔG°
 * and its verdict live, the graph's point carried the value as its label and the verdict as
 * its colour, and the T_cross box said in green or red which side of T_cross the slider stood.
 * A student could copy the answer in both modes, and in Keppnishamur slide to T_cross and
 * answer 0 / Jafnvægi. Now all four wait for "Athuga svar", and Keppnishamur's slider is fixed
 * at the problem's temperature. The substituted formula and the line stay: the first is the
 * scaffold, and reading a sign off the second is part of what is taught.
 */

const drawn: InteractiveGraphProps[] = [];

vi.mock('@shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/components')>();
  return {
    ...actual,
    InteractiveGraph: (props: InteractiveGraphProps) => {
      drawn.push(props);
      return null;
    },
  };
});

clockPastNextGuard();

beforeEach(() => {
  drawn.length = 0;
  localStorage.clear();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  Element.prototype.scrollIntoView = () => {};
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// Id 11, Haber at its 500 K: ΔG° = −91,8 − 500 × (−0,199) = 7,7 kJ/mol, not spontaneous,
// with a T_cross of 461 K inside the slider's range.
const HABER = 11;
const HABER_DELTA_G = '7,7 kJ/mól';
const slider = () => screen.getByRole('slider', { name: 'Hitastig í Kelvinum' });
/** The graph's point at the slider's temperature, the one labelled with its ΔG°. */
const temperaturePoint = () => drawn.at(-1)!.markers?.find((m) => m.x === 500);

describe.each([
  ['Æfingarhamur', /Æfingarhamur/],
  ['Keppnishamur', /Keppnishamur/],
] as const)('%s', (_name, mode) => {
  it('shows no ΔG°, verdict or point before "Athuga svar"', () => {
    openProblem(HABER, mode);
    const text = document.body.textContent ?? '';
    expect(text).not.toContain(HABER_DELTA_G);
    expect(text).not.toContain('Núverandi hitastig');
    // "✗ Ekki sjálfgengt" is also a radio's name; only the radio may carry it.
    expect(screen.getAllByText('✗ Ekki sjálfgengt')).toHaveLength(1);
    expect(temperaturePoint()).toBeUndefined();
    // The substituted formula and T_cross stay.
    expect(text).toContain('ΔG° = (-91,8) - (500)(-0,199)');
    expect(text).toContain('461 K');
  });

  it('shows them once the answer is checked', () => {
    openProblem(HABER, mode);
    answer('7,7', VERDICT['non-spontaneous']);
    const text = document.body.textContent ?? '';
    expect(text).toContain(HABER_DELTA_G);
    expect(text).toContain('Núverandi hitastig');
    expect(temperaturePoint()?.label).toBe('8 kJ/mól');
  });
});

describe('the temperature slider', () => {
  it('moves in Æfingarhamur', () => {
    openProblem(HABER);
    expect((slider() as HTMLInputElement).disabled).toBe(false);
  });

  it('is fixed at the problem’s temperature in Keppnishamur', () => {
    openProblem(HABER, /Keppnishamur/);
    expect((slider() as HTMLInputElement).disabled).toBe(true);
    expect((slider() as HTMLInputElement).value).toBe('500');
    expect(slider().getAttribute('aria-describedby')).toBe('thermo-temp-fixed');
  });
});
