// @vitest-environment jsdom
import { fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { answerAngle, answerCount, check, next, POOL, startLevel2 } from './level2-play';
import { clockPastNextGuard } from './next-guard-clock';
import { explanationLongEnough, MIN_EXPLANATION_LENGTH, wholeCount } from '../components/Level2';

/**
 * Two grading slips in Stig 2, found 2026-11-02:
 *
 *  - the count step read each field with `parseInt`, so `2.5` bonding pairs graded as 2 and was
 *    marked right (Lewis-formúlur's Stig 1 had the same bug and fix);
 *  - Athuga turned on at 10 characters of explanation but the step passed only above 20, so an
 *    answer of 10–20 characters, which is never counted anyway, was told `Rangt`.
 *
 * Queries are scoped to the rendered container (the repo runs vitest with `retry: 2` and no RTL
 * auto-cleanup), and the level is unmounted afterwards.
 */

const WRONG = 'Rangt — Sjáðu rétt svar hér að ofan';

let unmount: (() => void) | null = null;
afterEach(() => {
  unmount?.();
  unmount = null;
});

// Næsta ignores a press within 400 ms of appearing; these tests press it at once.
clockPastNextGuard();

describe('wholeCount', () => {
  it('reads whole numbers and nothing else', () => {
    expect(wholeCount('2')).toBe(2);
    expect(wholeCount(' 0 ')).toBe(0);
    for (const text of ['', ' ', '2.5', '2,5', '2e0x', 'tveir']) {
      expect(wholeCount(text), JSON.stringify(text)).toBeNaN();
    }
  });
});

describe('explanationLongEnough', () => {
  it('accepts the length that turns Athuga on, ignoring surrounding spaces', () => {
    expect(explanationLongEnough('x'.repeat(MIN_EXPLANATION_LENGTH))).toBe(true);
    expect(explanationLongEnough('x'.repeat(MIN_EXPLANATION_LENGTH - 1))).toBe(false);
    expect(explanationLongEnough(`   ${'x'.repeat(MIN_EXPLANATION_LENGTH - 1)}   `)).toBe(false);
  });
});

describe('Stig 2 grading', () => {
  it('marks a non-whole count wrong', () => {
    const { ui, container, unmount: u } = startLevel2();
    unmount = u;
    const water = POOL[0];
    const [bonding, lone] = Array.from(container.querySelectorAll('input[type=number]'));
    fireEvent.change(bonding, { target: { value: `${water.bondingPairs}.5` } });
    fireEvent.change(lone, { target: { value: String(water.lonePairs) } });
    check(ui);

    expect(container.textContent).toContain(WRONG);
  });

  it('accepts a short explanation it let the student check', () => {
    const { ui, container, unmount: u } = startLevel2();
    unmount = u;
    const water = POOL[0];
    answerCount(ui, container, water.bondingPairs, water.lonePairs);
    next(ui);
    fireEvent.click(ui.getByRole('button', { name: water.shape }));
    check(ui);
    next(ui);
    answerAngle(ui, container, water.angle);
    next(ui);

    // 15 characters: enough to turn Athuga on, which used to end in Rangt.
    fireEvent.change(container.querySelector('textarea') as HTMLElement, {
      target: { value: 'Pörin hrindast.' },
    });
    expect(ui.getByRole('button', { name: 'Athuga svar' }).hasAttribute('disabled')).toBe(false);
    check(ui);

    expect(container.textContent).not.toContain(WRONG);
  });
});
