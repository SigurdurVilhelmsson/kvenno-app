// @vitest-environment jsdom
/**
 * The real-world challenge type, driven through the real component.
 *
 * Two things were wrong with it and neither is visible in the data:
 *
 * 1. Every `real_world` item has carried an authored `explanation` since the
 *    level shipped, and nothing rendered it. This is the one challenge type
 *    with no `correctMethod` and no `requiredSteps`, so a student who got one
 *    wrong was shown a score and no way to reach the answer.
 * 2. The grader read the typed answer with `parseInt`, which truncates a
 *    decimal and cannot read an Icelandic decimal comma — so a key like 24,5
 *    could never be matched, and `requireInteger` decided nothing.
 */

import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { Level3 } from '../components/Level3';
import type { Level3Challenge } from '../data/challenges';

const WHOLE_ITEM: Level3Challenge = {
  id: 'TEST-WHOLE',
  type: 'real_world',
  prompt: 'Þú átt 2 kg af hveiti og hvert deig þarf 500 g. Hversu mörg deig geturðu búið til?',
  startValue: 2,
  startUnit: 'kg',
  portionSize: 500,
  portionUnit: 'g',
  expectedAnswer: 4,
  requireInteger: true,
  explanation: 'TVÖ KÍLÓ ERU 2000 GRÖMM, OG 2000 ÷ 500 = 4 DEIG.',
};

const FRACTIONAL_ITEM: Level3Challenge = {
  id: 'TEST-FRACTION',
  type: 'real_world',
  prompt: 'Bíll eyðir 7 L á hverja 100 km. Ferðin er 350 km. Hversu marga lítra þarftu?',
  startValue: 350,
  startUnit: 'km',
  portionSize: 100,
  portionUnit: 'km',
  expectedAnswer: 24.5,
  requireInteger: false,
  explanation: '350 ÷ 100 × 7 L = 24,5 L.',
};

const run = vi.hoisted(() => ({ current: [] as Level3Challenge[] }));

// `vi.mock` is hoisted above the imports, so the component picks this up.
vi.mock('../utils/level3Run', () => ({
  LEVEL_3_RUN_LENGTH: 12,
  buildLevel3Run: () => run.current,
}));

const STARTED = {
  problemsCompleted: 0,
  compositeScores: [],
  totalSteps: 0,
  achievements: [],
  mastered: false,
  hintsUsed: 0,
};

function answer(value: string) {
  fireEvent.change(screen.getByPlaceholderText('Sláðu inn svar'), { target: { value } });
  fireEvent.change(screen.getByPlaceholderText(/Fyrst breytti ég/), {
    target: { value: 'Ég umbreytti einingunum og deildi svo með skammtastærðinni.' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Senda inn/ }));
}

describe('a real-world challenge', () => {
  beforeEach(() => {
    run.current = [WHOLE_ITEM];
  });

  // The root vitest config enables globals (and so auto-cleanup); running this
  // file directly from the game directory does not, and a leftover DOM makes
  // every `getByText` ambiguous. Clean up explicitly so both routes agree.
  afterEach(cleanup);

  it('shows the worked solution once the answer is in', () => {
    render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} initialProgress={{ ...STARTED }} />);

    expect(screen.queryByText(WHOLE_ITEM.explanation)).toBeNull();
    answer('4');
    expect(screen.getByText(WHOLE_ITEM.explanation)).toBeTruthy();
  });

  it('shows the worked solution to a student who got it wrong, too', () => {
    render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} initialProgress={{ ...STARTED }} />);

    answer('40');
    expect(screen.getByText(WHOLE_ITEM.explanation)).toBeTruthy();
  });

  it('reads an answer written with an Icelandic decimal comma', () => {
    run.current = [FRACTIONAL_ITEM];
    const onCorrect = vi.fn();
    render(
      <Level3
        onComplete={vi.fn()}
        onBack={vi.fn()}
        initialProgress={{ ...STARTED }}
        onCorrectAnswer={onCorrect}
      />
    );

    // `parseInt('24,5')` gave 24 and the item was ungradeable.
    answer('24,5');
    expect(onCorrect).toHaveBeenCalled();
  });

  it('still requires a whole number where the item asks for one', () => {
    const onIncorrect = vi.fn();
    render(
      <Level3
        onComplete={vi.fn()}
        onBack={vi.fn()}
        initialProgress={{ ...STARTED }}
        onIncorrectAnswer={onIncorrect}
      />
    );

    // You cannot bake 3,9 loaves. The old grader truncated this to 3 and simply
    // marked it wrong; the rule is now stated rather than implied by `parseInt`.
    answer('3,9');
    expect(onIncorrect).toHaveBeenCalled();
  });
});
