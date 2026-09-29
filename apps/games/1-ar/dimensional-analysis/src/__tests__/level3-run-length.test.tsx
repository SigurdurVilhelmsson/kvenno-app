// @vitest-environment jsdom
/**
 * Level 3's header, progress bar, completion and mastery check all count the
 * same run.
 *
 * The level was written for a ten-item pool and hardcoded `10` in three places:
 * the header, the bar and the mastery threshold. The pool then grew — to 18 in
 * the old repo in January, to 41 with the February harvest — and the harvest
 * bounded a run at `LEVEL_3_RUN_LENGTH`, twelve. The loop bound and the maximum
 * score followed the run; those three did not. So a student read `Áskorun 11 / 10`
 * and `Áskorun 12 / 10`; the bar was set to 110 % of its track, which overflowed
 * it on the shipped build and, once the mobile pass clipped the track, read as
 * full with two problems still to go; and a run shorter than ten could never be
 * mastered at all.
 */

import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level3 } from '../components/Level3';
import { level3Challenges, type Level3Challenge } from '../data/challenges';
import { LEVEL_3_RUN_LENGTH } from '../utils/level3Run';

clockPastNextGuard();

// `null` draws the real run, so the first test sees exactly what a student sees.
const run = vi.hoisted(() => ({ current: null as Level3Challenge[] | null }));

vi.mock('../utils/level3Run', async (importOriginal) => {
  const real = await importOriginal<typeof import('../utils/level3Run')>();
  return {
    ...real,
    buildLevel3Run: (...args: Parameters<typeof real.buildLevel3Run>) =>
      run.current ?? real.buildLevel3Run(...args),
  };
});

/** A real-world item, the one type graded on the typed answer alone. */
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

const items = (count: number) => Array.from({ length: count }, (_, i) => item(i + 1));

const STARTED = {
  problemsCompleted: 0,
  compositeScores: [],
  totalSteps: 0,
  achievements: [],
  mastered: false,
  hintsUsed: 0,
};

function headerText() {
  return screen.getByText(/^Áskorun \d+ \/ \d+$/).textContent;
}

// Found by its classes: no game in the repo has a progressbar role or test id
// yet, so a restyle of the bar has to update this selector.
function barPercent(container: HTMLElement) {
  const bar = container.querySelector<HTMLElement>('.bg-purple-500.h-2');
  if (!bar) throw new Error('progress bar not found');
  return Number.parseFloat(bar.style.width);
}

/** Answer the problem on screen, then move on. */
function answerAndContinue(value: string) {
  fireEvent.change(screen.getByPlaceholderText('Sláðu inn svar'), { target: { value } });
  fireEvent.change(screen.getByPlaceholderText(/Fyrst breytti ég/), {
    target: { value: 'Ég umbreytti kílóum í grömm og deildi svo með skammtastærðinni.' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Senda inn/ }));
  fireEvent.click(screen.getByRole('button', { name: /Næsta áskorun|Ljúka stigi/ }));
}

function renderLevel(onComplete = vi.fn()) {
  const view = render(
    <Level3 onComplete={onComplete} onBack={vi.fn()} initialProgress={{ ...STARTED }} />
  );
  return { ...view, onComplete };
}

describe('Level 3 counts the run it draws', () => {
  beforeEach(() => {
    run.current = null;
  });

  // Running this file from the game directory does not enable globals, so
  // clean up explicitly (see level3-realworld.test.tsx).
  afterEach(cleanup);

  it('tells the student how long a drawn run is', () => {
    renderLevel();
    // A pool no bigger than a run is played whole, so the run is the smaller.
    const length = Math.min(LEVEL_3_RUN_LENGTH, level3Challenges.length);
    expect(headerText()).toBe(`Áskorun 1 / ${length}`);
  });

  it('agrees with itself on every problem: header, bar and the last button', () => {
    run.current = items(12);
    const { container, onComplete } = renderLevel();

    for (let k = 1; k <= 12; k++) {
      expect(headerText()).toBe(`Áskorun ${k} / 12`);
      const percent = barPercent(container);
      expect(percent).toBeLessThanOrEqual(100);
      expect(percent).toBeCloseTo(((k - 1) / 12) * 100, 5);

      fireEvent.change(screen.getByPlaceholderText('Sláðu inn svar'), { target: { value: '4' } });
      fireEvent.change(screen.getByPlaceholderText(/Fyrst breytti ég/), {
        target: { value: 'Ég umbreytti kílóum í grömm og deildi svo með skammtastærðinni.' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Senda inn/ }));
      const next = screen.getByRole('button', { name: /Næsta áskorun|Ljúka stigi/ });
      expect(next.textContent).toBe(k < 12 ? 'Næsta áskorun →' : 'Ljúka stigi');
      expect(onComplete).not.toHaveBeenCalled();
      fireEvent.click(next);
    }

    expect(onComplete).toHaveBeenCalledTimes(1);
    const [progress] = onComplete.mock.calls[0];
    expect(progress.problemsCompleted).toBe(12);
    expect(progress.compositeScores).toHaveLength(12);
    expect(progress.mastered).toBe(true);
  });

  it('can master a run shorter than ten', () => {
    // A pool no bigger than a run is played whole (`buildLevel3Run`), so a
    // short run is a supported shape, not a hypothetical one.
    run.current = items(8);
    const { onComplete } = renderLevel();
    for (let k = 1; k <= 8; k++) answerAndContinue('4');

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][0].mastered).toBe(true);
  });

  it('judges mastery over the whole run, not its first ten', () => {
    // Nine right and three wrong averages 0,725 over twelve, under the 0,75
    // line, though the first ten alone average 0,83.
    run.current = items(12);
    const { onComplete } = renderLevel();
    for (let k = 1; k <= 12; k++) answerAndContinue(k <= 9 ? '4' : '40');

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][0].mastered).toBe(false);
  });

  it('does not master a run answered wrongly', () => {
    run.current = items(12);
    const { onComplete } = renderLevel();
    for (let k = 1; k <= 12; k++) answerAndContinue('40');

    expect(onComplete.mock.calls[0][0].mastered).toBe(false);
  });
});
