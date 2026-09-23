// @vitest-environment jsdom
/**
 * Which keyboard a phone raises for each typed answer.
 *
 * Every answer in Levels 2 and 3 is a number, often with an Icelandic decimal
 * comma, so the fields ask for the decimal keypad (`inputMode="decimal"`) on a
 * `type="text"` field that keeps the comma. The one exception is the Level 3
 * item that asks for scientific notation (`t.d. 4.2e5`): a decimal keypad has
 * no `e`, so that field keeps the full keyboard, with autocorrect and
 * autocapitalisation off so a phone does not rewrite `4.2e5` as `4.2E5` or a
 * word.
 */

import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { level3Challenges, type Level3Challenge } from '../data/challenges';

const run = vi.hoisted(() => ({ current: [] as Level3Challenge[] }));
vi.mock('../utils/level3Run', () => ({
  LEVEL_3_RUN_LENGTH: 12,
  buildLevel3Run: () => run.current,
}));

const L3_STARTED = {
  problemsCompleted: 0,
  compositeScores: [],
  totalSteps: 0,
  achievements: [],
  mastered: false,
  hintsUsed: 0,
};

afterEach(cleanup);

describe('answer fields raise the right keyboard', () => {
  it('Level 2 asks for the decimal keypad', () => {
    render(
      <Level2
        onComplete={vi.fn()}
        onBack={vi.fn()}
        initialProgress={{ problemsCompleted: 0, finalAnswersCorrect: 0, mastered: false }}
      />
    );
    const field = screen.getByPlaceholderText('Sláðu inn svar');
    expect(field.getAttribute('type')).toBe('text');
    expect(field.getAttribute('inputmode')).toBe('decimal');
  });

  it('Level 3 asks for the decimal keypad on a plain numeric item', () => {
    run.current = [level3Challenges.find((c) => c.type === 'synthesis')!];
    render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} initialProgress={{ ...L3_STARTED }} />);
    const field = screen.getByPlaceholderText('Sláðu inn svar');
    expect(field.getAttribute('type')).toBe('text');
    expect(field.getAttribute('inputmode')).toBe('decimal');
  });

  it('Level 3 keeps the full keyboard where the answer is in scientific notation', () => {
    const sci = level3Challenges.find((c) => c.type === 'derivation' && c.scientificNotation);
    expect(sci, 'the pool still has a scientific-notation item').toBeDefined();
    run.current = [sci!];
    render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} initialProgress={{ ...L3_STARTED }} />);
    const field = screen.getByPlaceholderText('t.d. 4.2e5');
    expect(field.getAttribute('type')).toBe('text');
    expect(field.getAttribute('inputmode')).toBeNull();
    expect(field.getAttribute('autocapitalize')).toBe('none');
    expect(field.getAttribute('autocorrect')).toBe('off');
    expect(field.getAttribute('spellcheck')).toBe('false');
  });
});
