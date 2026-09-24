// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { parseStudentNumber } from '@shared/utils';

import App from '../App';
import Level1 from '../components/Level1';
import Level2 from '../components/Level2';
import Level3 from '../components/Level3';
import { LEVEL2_PUZZLES } from '../data/level2-puzzles';
import { LEVEL3_PUZZLES } from '../data/level3-puzzles';
import { BUFFER_PROBLEMS } from '../data/problems';
import { solveBuffer, solveStockRecipe } from '../engine/buffer';

/**
 * What the components themselves print, as a student sees it.
 *
 * **Why this exists.** `decimal-comma.test.ts` reads the data files and bans
 * `toFixed` in components, which left everything a component writes directly:
 * until 2026-09-23 Stig 1 printed its pKa raw as `4.74` beside "Markmiðs-pH
 * 4,74", the simulator's buttons read `+0.01 M` while their accessible names
 * said `0,01`, and the answer fields' placeholders were `t.d. 1.58`,
 * `t.d. 7.76` and `t.d. 12.24`. Those last were worse than a full stop: they
 * are the answers to the first puzzle of Stig 2 and of Stig 3, printed in the
 * box before the student has typed anything.
 */

beforeEach(() => {
  vi.useFakeTimers();
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const settle = () => act(() => void vi.advanceTimersByTime(400));
const comma = (n: number, dp: number) => n.toFixed(dp).replace('.', ',');

function lastButton(container: HTMLElement, name: string | RegExp) {
  const all = within(container).getAllByRole('button', { name });
  return all[all.length - 1];
}

function fillLast(container: HTMLElement, values: string[]) {
  const fields = Array.from(container.querySelectorAll('input[inputmode="decimal"]'));
  const mine = fields.slice(fields.length - values.length);
  mine.forEach((field, i) => fireEvent.change(field, { target: { value: values[i] } }));
}

/** Text nodes plus every attribute a student reads or hears. */
function printed(container: HTMLElement): string[] {
  // Stig 1 carries an inline <style> for its keyframes; CSS is not something a student reads.
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const out: string[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.parentElement?.closest('style')) out.push(node.textContent ?? '');
  }
  for (const el of Array.from(container.querySelectorAll('[placeholder],[aria-label],[title]'))) {
    for (const attr of ['placeholder', 'aria-label', 'title']) {
      const v = el.getAttribute(attr);
      if (v) out.push(v);
    }
  }
  return out;
}

/** Step through every screen of the game, collecting what it prints and its placeholders. */
function walk() {
  const seen: string[] = [];
  const placeholders = { level2: new Set<string>(), level3: new Set<string>() };
  const record = (container: HTMLElement, level?: 'level2' | 'level3') => {
    seen.push(...printed(container));
    if (!level) return;
    for (const el of Array.from(container.querySelectorAll('input[placeholder]'))) {
      placeholders[level].add(el.getAttribute('placeholder')!);
    }
  };

  record(render(<App />).container);
  cleanup();

  const one = render(<Level1 />).container;
  record(one);
  fireEvent.click(within(one).getByRole('button', { name: /Sýna samanburð/ }));
  fireEvent.click(within(one).getByRole('button', { name: 'Athuga stuðpúða' }));
  record(one);
  cleanup();

  const two = render(<Level2 onComplete={() => {}} onBack={() => {}} />).container;
  const p2 = BUFFER_PROBLEMS.find((p) => p.id === LEVEL2_PUZZLES[0].problemId)!;
  const r2 = solveBuffer(p2);
  record(two, 'level2');
  fireEvent.click(within(two).getByRole('button', { name: /Hærra/ }));
  fireEvent.click(lastButton(two, 'Athuga svar'));
  settle();
  record(two, 'level2');
  fillLast(two, [comma(r2.ratio, 3)]);
  fireEvent.click(lastButton(two, 'Athuga svar'));
  settle();
  record(two, 'level2');
  fillLast(two, [comma(r2.acidMass, 3), comma(r2.baseMass, 3)]);
  fireEvent.click(lastButton(two, 'Athuga svar'));
  settle();
  record(two, 'level2');
  cleanup();

  const three = render(<Level3 onComplete={() => {}} onBack={() => {}} />).container;
  const p3 = BUFFER_PROBLEMS.find((p) => p.id === LEVEL3_PUZZLES[0].problemId)!;
  const r3 = solveStockRecipe(p3, LEVEL3_PUZZLES[0]);
  record(three, 'level3');
  fireEvent.click(within(three).getByRole('button', { name: /Byrja/ }));
  record(three, 'level3');
  fillLast(three, [comma(r3.ratio, 3)]);
  fireEvent.click(lastButton(three, 'Athuga svar'));
  settle();
  record(three, 'level3');
  fillLast(three, [comma(r3.acidMoles, 6), comma(r3.baseMoles, 6)]);
  fireEvent.click(lastButton(three, 'Athuga svar'));
  settle();
  record(three, 'level3');
  fillLast(three, [comma(r3.acidVolume, 2), comma(r3.baseVolume, 2)]);
  fireEvent.click(lastButton(three, 'Athuga svar'));
  settle();
  record(three, 'level3');
  cleanup();
  return { seen, placeholders };
}

describe('every screen, stepped through', () => {
  it('prints no decimal point anywhere', () => {
    const { seen } = walk();
    expect(seen.join(' ').length).toBeGreaterThan(5000);
    for (const text of seen) {
      const hit = text.match(/.{0,30}\d\.\d.{0,30}/);
      expect(hit?.[0], 'a number printed with a full stop').toBeUndefined();
    }
  });

  it('shows no placeholder the level would accept as an answer', () => {
    const { placeholders } = walk();
    expect(placeholders.level2.size).toBeGreaterThanOrEqual(2);
    expect(placeholders.level3.size).toBeGreaterThanOrEqual(2);

    const answers2 = LEVEL2_PUZZLES.flatMap((pz) => {
      const r = solveBuffer(BUFFER_PROBLEMS.find((p) => p.id === pz.problemId)!);
      return [
        { value: r.ratio, tol: pz.ratioTolerance },
        { value: r.acidMass, tol: pz.massTolerance },
        { value: r.baseMass, tol: pz.massTolerance },
      ];
    });
    const answers3 = LEVEL3_PUZZLES.flatMap((pz) => {
      const r = solveStockRecipe(
        BUFFER_PROBLEMS.find((p) => p.id === pz.problemId)!,
        pz
      );
      return [
        { value: r.ratio, tol: 0.1 },
        { value: r.acidMoles, tol: 0.1 },
        { value: r.baseMoles, tol: 0.1 },
        { value: r.acidVolume, tol: pz.volumeTolerance },
        { value: r.baseVolume, tol: pz.volumeTolerance },
      ];
    });

    for (const [level, answers] of [
      ['level2', answers2],
      ['level3', answers3],
    ] as const) {
      for (const text of placeholders[level]) {
        const match = text.match(/\d+(?:[.,]\d+)?/);
        if (!match) continue; // a name, not a number
        const shown = parseStudentNumber(match[0].replace('.', ','));
        for (const { value, tol } of answers) {
          expect(
            Math.abs(shown - value) / value,
            `${level} placeholder "${text}" is an answer (${value})`
          ).toBeGreaterThan(tol);
        }
      }
    }
  });
});
