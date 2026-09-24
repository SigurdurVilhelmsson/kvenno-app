// @vitest-environment jsdom
/**
 * Level 3 prints numbers the way the course writes them: with a decimal comma.
 *
 * 24 of the 41 prompts printed a full stop inside an Icelandic sentence
 * (`0.005 kg`, `50.0 mL … 2.50 g/mL`, `3.00 × 10⁸`), and so did worked
 * solutions, error analyses and the "Gefnar upplýsingar" card, which printed
 * the stored number itself — `2.5` for a prompt's `2,50`, dropping the trailing
 * zero the item's precision depends on. This is the printing half of the
 * B9/B10 decimal-comma pass, never audited in this game.
 *
 * Stored numbers did not change, and neither did the factor strings the data
 * tests multiply out (`1 míla / 1.609 km`): those are printed with a comma by
 * the component. So the data is scanned where it is prose, and every item is
 * rendered — before and after answering, hint open — to catch the rest.
 */

import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Level3 } from '../components/Level3';
import { level3Challenges, type Level3Challenge } from '../data/challenges';

const run = vi.hoisted(() => ({ current: [] as Level3Challenge[] }));
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

/** A full stop between two digits: `2.5`, `0.005`, `3.00`. */
const DECIMAL_POINT = /\d\.\d/;

afterEach(cleanup);

/**
 * Every string in a challenge, with where it sits — except the two factor
 * lists, which are machine-read (`applyFactorPath`) and printed through the
 * component.
 */
function proseOf(value: unknown, path: string): [string, string][] {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => proseOf(v, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, v]) => {
      if (key === 'factors') return [];
      if (key === 'steps' && path.includes('possiblePaths')) return [];
      return proseOf(v, `${path}.${key}`);
    });
  }
  return [];
}

describe('the challenge data', () => {
  const prose = level3Challenges.flatMap((c) => proseOf(c, c.id));

  it('is scanned in full, so an empty scan cannot pass', () => {
    expect(prose.length).toBeGreaterThan(150);
  });

  it('prints no decimal point between digits in any prompt', () => {
    const offenders = level3Challenges
      .filter((c) => DECIMAL_POINT.test(c.prompt))
      .map((c) => `${c.id}: ${c.prompt}`);
    expect(offenders).toEqual([]);
  });

  it('prints none in any other text a student reads', () => {
    const offenders = prose
      .filter(([, text]) => DECIMAL_POINT.test(text))
      .map(([at, text]) => `${at}: ${text}`);
    expect(offenders).toEqual([]);
  });
});

/** Render one item, open its hint, and read the screen; then answer it and read it again. */
function screensOf(item: Level3Challenge): string[] {
  run.current = [item];
  const { container, unmount } = render(
    <Level3 onComplete={vi.fn()} onBack={vi.fn()} initialProgress={{ ...STARTED }} />
  );
  const view = within(container);
  fireEvent.click(view.getByRole('button', { name: /Sýna vísbendingu/ }));
  const before = container.textContent ?? '';

  if (item.type === 'reverse') {
    fireEvent.click(view.getAllByRole('button', { name: /skref/ })[0]);
  } else if (item.type === 'derivation' && item.scientificNotation) {
    fireEvent.change(view.getByLabelText('Þitt svar'), { target: { value: '1' } });
    fireEvent.change(view.getByLabelText('Veldisvísir'), { target: { value: '1' } });
  } else {
    if (item.type === 'efficiency') {
      fireEvent.click(view.getAllByRole('button', { name: /Leið \d/ })[0]);
    }
    fireEvent.change(view.getByPlaceholderText('Sláðu inn svar'), { target: { value: '1' } });
  }
  fireEvent.change(view.getByLabelText(/Útskýring/), {
    target: { value: 'Ég umbreytti einingunum skref fyrir skref.' },
  });
  fireEvent.click(view.getByRole('button', { name: /Senda inn/ }));
  expect(view.getByText(/Svarið er/), `${item.id} did not reach its feedback`).toBeTruthy();
  const after = container.textContent ?? '';

  unmount();
  return [before, after];
}

describe('every Level 3 screen', () => {
  it.each(level3Challenges.map((c) => [c.id, c] as const))(
    '%s prints no decimal point, before or after the answer',
    (id, item) => {
      for (const text of screensOf(item)) {
        expect(text.match(new RegExp(`.{0,30}${DECIMAL_POINT.source}.{0,30}`))?.[0], id).toBe(
          undefined
        );
      }
    }
  );
});

describe('the "Gefnar upplýsingar" card', () => {
  function card(id: string): string {
    const item = level3Challenges.find((c) => c.id === id)!;
    run.current = [item];
    const { container } = render(
      <Level3 onComplete={vi.fn()} onBack={vi.fn()} initialProgress={{ ...STARTED }} />
    );
    return within(container).getByText(/Gefnar upplýsingar/).parentElement!.textContent ?? '';
  }

  it('gives the values as the prompt does, trailing zeros included', () => {
    // L3-4 asks for three significant figures from 50,0 mL and 2,50 g/mL. The
    // card said 50 and 2.5 — two figures and one, beside a tile saying 3.
    const text = card('L3-4');
    expect(text).toContain('50,0 mL');
    expect(text).toContain('2,50 g/mL');
  });

  it('writes a fractional value with a comma, on both kinds of card', () => {
    expect(card('L3-12')).toContain('58,5 g/mól'); // synthesis
    expect(card('L3-5')).toContain('2,0 L'); // real world
  });
});
