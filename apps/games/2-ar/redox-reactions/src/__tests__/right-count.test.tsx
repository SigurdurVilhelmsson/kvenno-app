// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { elementSymbol, playLevel3 } from './play-level3';
import App from '../App';
import { Level1, problems as level1 } from '../components/Level1';
import { Level2, reactions } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { problems as level3 } from '../data/half-reactions';

/**
 * No running score inside a level, and `N af M rétt` at its end (mobile-pass decision 1 (b),
 * ruled platform-wide). Each level showed `Stig: N` beside its counter; Stig 1 paid 10, 5 or 2
 * for a right answer by the try it came on, Stig 2 paid 10 a question and Stig 3 15, 10, 10 and
 * 20 for its four steps; the menu and the closing screen showed points and a `Heildarstig`.
 *
 * The counting rule: a right answer counts and a wrong one does not, and opening a hint never
 * changes that (decision 2 (b)). Stig 1's Reyna aftur comes after feedback that prints the right
 * answer, so a right answer on a retry is one the student has been shown, and is not counted.
 *
 * Each level is played through the real components with some answers wrong and every hint open.
 * Queries are scoped to the rendered container and every render is unmounted (vitest `retry: 2`,
 * no RTL auto-cleanup).
 */

const t = (key: string, fallback?: string) => fallback ?? key;

clockPastNextGuard();
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

type View = ReturnType<typeof within>;

/** A running score: `Stig: 30`, `30 stig`. */
const RUNNING_SCORE = [/\bStig:\s*\d/, /\d+\s*stig\b/];

function expectNoScore(container: HTMLElement) {
  for (const pattern of RUNNING_SCORE) expect(container.textContent).not.toMatch(pattern);
}

/** Wrong on every third item (0, 3, 6, …), right on the rest. */
const wrongAt = (i: number) => i % 3 === 0;
const rightOf = (n: number) =>
  Array.from({ length: n }, (_, i) => i).filter((i) => !wrongAt(i)).length;

describe('Stig 1', () => {
  /**
   * Every wrong answer here is followed by Reyna aftur and the right answer — the second try
   * Stig 1 used to pay 5 points for. On every sixth problem the student moves on instead.
   */
  function play() {
    const onComplete = vi.fn();
    const { container } = render(<Level1 t={t} onComplete={onComplete} onBack={vi.fn()} />);
    const view = within(container);
    for (let i = 0; i < 5; i++) fireEvent.click(view.getByRole('button', { name: /Næsta/ }));
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));

    level1.forEach((problem, i) => {
      expectNoScore(container);
      fireEvent.click(view.getByRole('button', { name: 'Vísbending' }));
      const answer = (value: number) => {
        fireEvent.change(view.getByRole('spinbutton', { name: 'Oxunartala' }), {
          target: { value: String(value) },
        });
        fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));
        expectNoScore(container);
      };
      if (wrongAt(i)) {
        answer(problem.correctAnswer + 1);
        if (i % 6 === 0) {
          fireEvent.click(view.getByRole('button', { name: 'Reyna aftur' }));
          answer(problem.correctAnswer);
          fireEvent.click(view.getByRole('button', { name: /Næsta spurning|Ljúka stigi/ }));
        } else {
          fireEvent.click(view.getByRole('button', { name: /Halda áfram/ }));
        }
      } else {
        answer(problem.correctAnswer);
        fireEvent.click(view.getByRole('button', { name: /Næsta spurning|Ljúka stigi/ }));
      }
    });
    return onComplete;
  }

  it('counts first answers only, shows no score, and pays a retry nothing', () => {
    expect(play()).toHaveBeenCalledWith(rightOf(level1.length), level1.length);
  });
});

describe('Stig 2', () => {
  const FIELDS = ['oxidized', 'reduced', 'oxidizingAgent', 'reducingAgent'] as const;
  const total = reactions.length * FIELDS.length;

  function play() {
    const onComplete = vi.fn();
    const { container } = render(<Level2 t={t} onComplete={onComplete} onBack={vi.fn()} />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));

    let item = 0;
    for (const reaction of reactions) {
      for (const field of FIELDS) {
        expectNoScore(container);
        fireEvent.click(view.getByRole('button', { name: /💡 Sýna vísbendingu/ }));
        const right = reaction[field];
        // The answer buttons sit in the grid right after the question box.
        const options = Array.from(
          container
            .querySelector('div.border-green-200')!
            .nextElementSibling!.querySelectorAll('.grid button')
        ) as HTMLButtonElement[];
        const pick = options.find((b) => (b.textContent === right) !== wrongAt(item))!;
        fireEvent.click(pick);
        expectNoScore(container);
        fireEvent.click(
          view.getByRole('button', { name: /Næsta spurning|Næsta hvarf|Ljúka stigi/ })
        );
        item++;
      }
    }
    return onComplete;
  }

  it('counts every right answer out of every question, and shows no score', () => {
    expect(play()).toHaveBeenCalledWith(rightOf(total), total);
  });

  it('does not label the answer to "Hvað afoxast?" above it', () => {
    const { container } = render(<Level2 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));
    fireEvent.click(view.getByRole('button', { name: reactions[0].oxidized }));
    fireEvent.click(view.getByRole('button', { name: /Næsta spurning/ }));
    expect(view.getByText('Hvað afoxast?')).toBeTruthy();
    expect(container.textContent).not.toMatch(/afoxast:|AFOXAST/);
  });
});

describe('Stig 3', () => {
  const STEPS = 4;
  const total = level3.length * STEPS;

  /** Plays every problem, wrong on every third step, opening the hint before each one. */
  function play() {
    const onComplete = vi.fn();
    const { container } = render(<Level3 t={t} onComplete={onComplete} onBack={vi.fn()} />);
    const view: View = within(container);
    fireEvent.click(view.getByRole('button', { name: /Byrja æfingar/ }));
    const stepOn = () =>
      fireEvent.click(view.getByRole('button', { name: /^(Halda áfram|Næsta) →$/ }));
    const hint = () => fireEvent.click(view.getByRole('button', { name: 'Sýna vísbendingu' }));

    let step = 0;
    const wrong = () => wrongAt(step++);
    for (const problem of level3) {
      expectNoScore(container);
      hint();
      fireEvent.change(view.getByLabelText('Hvað oxast?'), {
        target: { value: wrong() ? 'X' : elementSymbol(problem.oxidationHalf.species) },
      });
      fireEvent.change(view.getByLabelText('Hvað afoxast?'), {
        target: { value: elementSymbol(problem.reductionHalf.species) },
      });
      fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));
      stepOn();

      for (const electrons of [problem.oxidationHalf.electrons, problem.reductionHalf.electrons]) {
        hint();
        fireEvent.change(view.getByRole('spinbutton'), {
          target: { value: String(wrong() ? electrons + 1 : electrons) },
        });
        fireEvent.click(view.getByRole('button', { name: 'Athuga' }));
        expectNoScore(container);
        stepOn();
      }

      hint();
      const [ox, red] = view.getAllByRole('spinbutton');
      fireEvent.change(ox, {
        target: { value: String(wrong() ? problem.multiplierOx + 1 : problem.multiplierOx) },
      });
      fireEvent.change(red, { target: { value: String(problem.multiplierRed) } });
      fireEvent.click(view.getByRole('button', { name: /Athuga margfaldara/ }));
      expectNoScore(container);
      stepOn();
      fireEvent.click(view.getByRole('button', { name: /^(Næsta dæmi|Ljúka stigi) →$/ }));
    }
    return onComplete;
  }

  it('counts every right step out of four per problem, and shows no score', () => {
    expect(play()).toHaveBeenCalledWith(rightOf(total), total);
  });
});

describe('the menu and the closing screen', () => {
  const KEY = 'redox-reactions-progress';
  const noScore = (container: HTMLElement) => {
    expectNoScore(container);
    expect(container.textContent).not.toMatch(/Heildarstig|Leikir spilaðir/);
  };

  it('show each level as "N af M rétt", with no points and no total', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        level1Completed: true,
        level1Correct: 7,
        level1Total: 10,
        level2Completed: true,
        level2Correct: 30,
        level2Total: 32,
        level3Completed: false,
      })
    );
    const { container } = render(<App />);
    expect(container.textContent).toContain('✓ 7 af 10 rétt');
    expect(container.textContent).toContain('✓ 30 af 32 rétt');
    expect(container.textContent).toContain('Stigum lokið: 2 af 3');
    noScore(container);
  });

  it('show a level finished under the old points format as "Lokið", never as a count', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        level1Completed: true,
        level1Score: 90,
        level2Completed: false,
        level2Score: 0,
        level3Completed: false,
        level3Score: 0,
        totalGamesPlayed: 1,
      })
    );
    const { container } = render(<App />);
    expect(container.textContent).toContain('✓ Lokið');
    expect(container.textContent).not.toMatch(/90/);
    noScore(container);
  });

  it('the closing screen lists each level by its count', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        level1Completed: true,
        level1Correct: 7,
        level1Total: 10,
        level2Completed: true,
        level2Score: 320,
        level3Completed: false,
      })
    );
    const { container } = render(<App />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Stig 3/ }));
    playLevel3(view);
    expect(container.textContent).toContain('Þú hefur lokið öllum stigum!');
    expect(container.textContent).toContain('7 af 10 rétt');
    expect(container.textContent).toContain('Lokið');
    const total = level3.length * 4;
    expect(container.textContent).toContain(`${total} af ${total} rétt`);
    noScore(container);
  });
});
