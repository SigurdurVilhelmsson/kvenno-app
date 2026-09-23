// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Level1 from '../components/Level1';
import { LEVEL1_CHALLENGES } from '../data/level1-challenges';

/**
 * Stig 1 played through its real buttons.
 *
 * **Why this exists.** Until 2026-09-23 Stig 1 disagreed with itself in several
 * places a student could reach in a minute:
 * - "Athuga stuðpúða" on a mixture already marked correct added its 100 stig
 *   and its tick again, so six taps on challenge 1 finished the level.
 * - The pH bar said "Fullkomið!" inside a ±0,1 pH window while the check graded
 *   the ratio band: 5 acid : 6 base on challenge 1 read "Fullkomið!" and was
 *   then marked "Næstum rétt".
 * - With one component removed the pH fell back to pKa, so a flask of acid
 *   alone read "4,74 — Fullkomið!" beside a check saying a buffer needs both.
 * - The "Algeng villa" box compared the ratio with 1, not with the challenge's
 *   band, and told a student with too little base that there was too much.
 * - Completing the last challenge jumped straight to the menu, so its
 *   explanation was never on screen.
 */

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function setup(onLevelComplete = vi.fn()) {
  const { container } = render(<Level1 onLevelComplete={onLevelComplete} />);
  const tap = (name: string, times = 1) => {
    for (let i = 0; i < times; i++) {
      fireEvent.click(within(container).getByRole('button', { name }));
    }
  };
  const stat = (label: string) =>
    within(container).getByText(label).previousElementSibling?.textContent;
  /** The label inside the coloured pH bar. */
  const verdict = () =>
    container.querySelector('.h-8.rounded-full .absolute')?.textContent ?? '(no bar)';
  const feedback = () => container.querySelector('[aria-live="polite"]')?.textContent ?? '';
  return { container, tap, stat, verdict, feedback, onLevelComplete };
}

// Base molecules to add (+) or remove (−) from the 5 : 5 start of each challenge.
const SOLVE = [0, 4, -2, 0, 3, 0];

function solve(tap: (name: string, times?: number) => void, index: number) {
  const change = SOLVE[index];
  if (change > 0) tap('Bæta við basasameind', change);
  if (change < 0) tap('Fjarlægja basasameind', -change);
  tap('Athuga stuðpúða');
}

describe('Stig 1 counts each challenge once', () => {
  it('does not award a solved challenge again when it is checked again', () => {
    const { tap, stat } = setup();
    tap('Athuga stuðpúða');
    tap('Athuga stuðpúða');
    expect(stat('Kláruð')).toBe('1');
    expect(stat('Stig')).toBe('100');
  });

  it('is not finished by tapping "Athuga" six times on challenge 1', () => {
    const { tap, onLevelComplete, container } = setup();
    tap('Athuga stuðpúða', 6);
    expect(onLevelComplete).not.toHaveBeenCalled();
    expect(within(container).getByText('Verkefni #1')).toBeTruthy();
  });

  it('shows the last explanation and ends on "Ljúka stigi"', () => {
    const { tap, onLevelComplete, container, feedback } = setup();
    SOLVE.forEach((_, i) => {
      solve(tap, i);
      if (i < SOLVE.length - 1) tap('Næsta verkefni →');
    });
    expect(onLevelComplete).not.toHaveBeenCalled();
    expect(feedback()).toContain(LEVEL1_CHALLENGES[LEVEL1_CHALLENGES.length - 1].explanation);
    expect(within(container).queryByRole('button', { name: 'Næsta verkefni →' })).toBeNull();
    tap('Ljúka stigi →');
    tap('Ljúka stigi →');
    expect(onLevelComplete).toHaveBeenCalledTimes(1);
    expect(onLevelComplete).toHaveBeenCalledWith(600);
  });

  it('separates the verdict from the explanation with a full stop', () => {
    const { tap, feedback } = setup();
    tap('Athuga stuðpúða');
    expect(feedback()).toContain('+100 stig. Þegar');
  });
});

describe('Stig 1 live readouts agree with the check', () => {
  it('does not call a mixture perfect that the check marks wrong', () => {
    const { tap, verdict, feedback } = setup();
    tap('Bæta við basasameind'); // 5 : 6, ratio 1,2 against a 0,9–1,1 band
    expect(verdict()).toBe('Of basískt');
    tap('Athuga stuðpúða');
    expect(feedback()).toContain('Næstum rétt');

    tap('Fjarlægja basasameind'); // back to 5 : 5
    expect(verdict()).toBe('Fullkomið!');
  });

  it('shows no pH for a mixture missing one component', () => {
    const { tap, verdict, container, feedback } = setup();
    tap('Fjarlægja basasameind', 5); // acid alone
    const reading = within(container).getByText('Núverandi pH:').nextElementSibling;
    expect(reading?.textContent).toBe('–');
    expect(verdict()).toBe('');
    tap('Athuga stuðpúða');
    expect(feedback()).toContain('þarf BÆÐI');
    // Neither "too much acid" nor "too much base": the diagnosis is that both are needed.
    expect(feedback()).toContain('samoka basinn');
    expect(feedback()).not.toContain('of mikið af');
  });

  it("diagnoses the ratio against the challenge's own band", () => {
    const { tap, feedback } = setup();
    solve(tap, 0);
    tap('Næsta verkefni →');
    // Challenge 2 wants 1,6–2,0. At 5 acid : 6 base the ratio 1,2 is above 1 but too low.
    tap('Bæta við basasameind');
    tap('Athuga stuðpúða');
    expect(feedback()).toContain('er of lágt, þá er of mikið af sýru');
    expect(feedback()).not.toContain('er of hátt, þá er of mikið af basa');
  });
});
