// @vitest-environment jsdom
/**
 * No running score while a student practises — mobile-pass decision 1 (b).
 *
 * Level 3's header showed `Meðal: N%`, the run's average composite score so
 * far, beside the item counter, recoloured green or yellow at 75 % as the
 * student went. That is a running score, and it is gone. Mastery is still
 * judged on the whole run when it ends; whether Level 3 ends with a count,
 * and what it counts, waits on items 30 and 31 (how the composite grades).
 */

import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level3 } from '../components/Level3';
import type { Level3Challenge } from '../data/challenges';

clockPastNextGuard();

const run = vi.hoisted(() => ({ current: null as Level3Challenge[] | null }));

vi.mock('../utils/level3Run', async (importOriginal) => {
  const real = await importOriginal<typeof import('../utils/level3Run')>();
  return {
    ...real,
    buildLevel3Run: (...args: Parameters<typeof real.buildLevel3Run>) =>
      run.current ?? real.buildLevel3Run(...args),
  };
});

/** A real-world item, graded on the typed answer alone. */
function item(n: number): Level3Challenge {
  return {
    id: `TEST-${n}`,
    type: 'real_world',
    prompt: `Dæmi ${n}: Þú átt 2 kg af hveiti og hvert deig þarf 500 g. Hversu mörg deig?`,
    startValue: 2,
    startUnit: 'kg',
    portionSize: 500,
    portionUnit: 'g',
    expectedAnswer: 4,
    requireInteger: true,
    explanation: '2000 g ÷ 500 g = 4 deig.',
  };
}

const STARTED = {
  problemsCompleted: 0,
  compositeScores: [],
  totalSteps: 0,
  achievements: [],
  mastered: false,
  hintsUsed: 0,
};

/** A running score in the header: "Meðal: 75%", "Stig: 30", "30 stig". */
function expectNoRunningScore(root: HTMLElement) {
  const text = root.textContent ?? '';
  expect(text).not.toMatch(/Meðal/);
  expect(text).not.toMatch(/\bStig:\s*\d/);
  expect(text).not.toMatch(/\d+\s*stig\b/);
}

afterEach(cleanup);

describe('Level 3 shows no running score', () => {
  it('has no running average in its header, before or after an answer', () => {
    run.current = Array.from({ length: 3 }, (_, i) => item(i + 1));
    const { container } = render(
      <Level3 onComplete={vi.fn()} onBack={vi.fn()} initialProgress={{ ...STARTED }} />
    );
    const ui = within(container);
    for (let k = 0; k < 3; k++) {
      expectNoRunningScore(container);
      // One right, two wrong: the old average moved with each.
      fireEvent.change(ui.getByPlaceholderText('Sláðu inn svar'), {
        target: { value: k === 0 ? '4' : '7' },
      });
      fireEvent.change(ui.getByPlaceholderText(/Fyrst breytti ég/), {
        target: { value: 'Ég umbreytti kílóum í grömm og deildi svo með skammtastærðinni.' },
      });
      fireEvent.click(ui.getByRole('button', { name: /Senda inn/ }));
      expectNoRunningScore(container);
      fireEvent.click(ui.getByRole('button', { name: /Næsta áskorun|Ljúka stigi/ }));
    }
  });
});
