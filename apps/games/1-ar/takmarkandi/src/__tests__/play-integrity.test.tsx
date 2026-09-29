import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import App from '../App';
import { clockPastNextGuard } from './next-guard-clock';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { YIELD_PROBLEMS } from '../data/yieldProblems';

clockPastNextGuard();

/**
 * A score has to come from reading the question.
 *
 * Every test here plays the real components through their buttons, as the
 * option-order tests in `2-ar/kinetics` do, and scopes its queries to the
 * rendered container: vitest runs with `retry: 2` and no RTL auto-cleanup.
 */

afterEach(() => {
  cleanup();
  localStorage.clear();
});

/** The two reactant cards on a Stig 1 question, left then right. */
const reactantCards = (root: HTMLElement) =>
  within(root)
    .getAllByRole('button')
    .filter((b) => /sameind/.test(b.textContent ?? ''));

/** 0 if the left reactant runs out first, 1 if the right one does — read off the cards. */
function limitingSide(root: HTMLElement): 0 | 1 {
  const [left, right] = reactantCards(root).map((card) => {
    const text = card.textContent ?? '';
    const count = Number(text.match(/(\d+) sameind/)![1]);
    const coeff = Number(text.match(/Stu.ull: (\d+)/)![1]);
    return count / coeff;
  });
  return left <= right ? 0 : 1;
}

/** Play a whole Stig 1 run correctly; returns which side was right, and what was asked. */
function playLevel1(root: HTMLElement): { sides: string; asked: string[] } {
  let sides = '';
  const asked: string[] = [];
  for (let q = 0; q < 8; q++) {
    const side = limitingSide(root);
    sides += side;
    asked.push(
      reactantCards(root)
        .map((c) => c.textContent)
        .join(' | ')
    );
    fireEvent.click(reactantCards(root)[side]);
    expect(
      within(root).queryByText(/^Rétt! /),
      `question ${q + 1} was not marked right`
    ).not.toBeNull();
    fireEvent.click(within(root).getByText(/Næsta spurning|Sjá niðurstöður/));
  }
  return { sides, asked };
}

describe('Stig 1', () => {
  it('does not put the answer on a predictable side', () => {
    // It alternated left, right, left, … on every run, so "alternate" scored
    // 80 of 80 without reading a question (CURRICULUM_REVIEW.md:198).
    const patterns = new Set<string>();
    for (let run = 0; run < 12; run++) {
      const { container } = render(<Level1 onComplete={() => {}} onBack={() => {}} />);
      fireEvent.click(within(container).getByText(/Byrja æfingar/));
      const { sides } = playLevel1(container);
      // Both sides, equally often: a run that was all one side would leak too.
      expect(sides.split('').filter((s) => s === '0')).toHaveLength(4);
      patterns.add(sides);
      cleanup();
    }
    expect(patterns.size, `the same sides every run: ${[...patterns]}`).toBeGreaterThan(1);
  });

  it('draws a new set when the student tries again', () => {
    const { container } = render(<Level1 onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(within(container).getByText(/Byrja æfingar/));
    const first = playLevel1(container).asked;
    fireEvent.click(within(container).getByText('Reyna aftur'));
    const second = playLevel1(container).asked;
    expect(second, 'the retry replayed the questions whose answers were just shown').not.toEqual(
      first
    );
  });
});

describe('Stig 2', () => {
  /** Answer every question with a number (right or wrong); returns what was asked. */
  function playLevel2(root: HTMLElement): string[] {
    const asked: string[] = [];
    for (let q = 0; q < 8; q++) {
      asked.push(
        [
          ...within(root)
            .getAllByText(/sameind/)
            .map((e) => e.textContent),
          within(root).getByRole('heading', { level: 2 }).textContent,
        ].join(' | ')
      );
      fireEvent.change(root.querySelector('input')!, { target: { value: '1' } });
      fireEvent.click(within(root).getByText('Athuga'));
      fireEvent.click(within(root).getByText(/Næsta spurning|Sjá niðurstöður/));
    }
    return asked;
  }

  it('draws a new set when the student tries again', () => {
    const { container } = render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    const first = playLevel2(container);
    fireEvent.click(within(container).getByText('Reyna aftur'));
    const second = playLevel2(container);
    expect(second, 'the retry replayed the questions whose solutions were just shown').not.toEqual(
      first
    );
  });
});

describe('Stig 3', () => {
  /** Which shipped problem is on screen, read off its equation. */
  const showing = (root: HTMLElement) =>
    YIELD_PROBLEMS.find((p) => within(root).queryByText(p.reaction.equation) !== null)!;

  const athuga = (root: HTMLElement) =>
    within(root).getByText('Athuga').closest('button') as HTMLButtonElement;

  it('does not grade a step before the student has answered it', () => {
    // An empty "Athuga" was graded wrong and printed the answer, and
    // "Reyna aftur" then took the answer it had just been shown.
    const { container } = render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    const problem = showing(container);

    expect(athuga(container).disabled, 'Athuga with no reactant chosen').toBe(true);
    fireEvent.click(athuga(container));
    expect(within(container).queryByText(/Rétt svar/)).toBeNull();
    expect(within(container).queryByText('Áfram →')).toBeNull();

    fireEvent.click(
      within(container)
        .getAllByRole('button')
        .find((b) => b.textContent?.trim() === problem.result.limitingFormula)!
    );
    expect(athuga(container).disabled).toBe(false);
    fireEvent.click(athuga(container));
    fireEvent.click(within(container).getByText('Áfram →'));

    const field = within(container).getByLabelText('Fræðilegar heimtur í grömmum');
    expect(athuga(container).disabled, 'Athuga with an empty field').toBe(true);
    fireEvent.change(field, { target: { value: '   ' } });
    expect(athuga(container).disabled, 'Athuga with only spaces').toBe(true);
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(within(container).queryByText(/Rétt svar/)).toBeNull();
  });

  it('submits a typed answer on Enter, the Go key of a phone keyboard', () => {
    const { container } = render(<Level3 onComplete={() => {}} onBack={() => {}} />);
    const { result } = showing(container);
    fireEvent.click(
      within(container)
        .getAllByRole('button')
        .find((b) => b.textContent?.trim() === result.limitingFormula)!
    );
    fireEvent.click(athuga(container));
    fireEvent.click(within(container).getByText('Áfram →'));

    const theoretical = within(container).getByLabelText('Fræðilegar heimtur í grömmum');
    fireEvent.change(theoretical, {
      target: { value: result.theoreticalGrams.toFixed(2).replace('.', ',') },
    });
    fireEvent.keyDown(theoretical, { key: 'Enter' });
    expect(within(container).getByText(/^Rétt! /)).toBeTruthy();
    fireEvent.click(within(container).getByText('Áfram →'));

    const percent = within(container).getByLabelText('Prósentuheimtur');
    fireEvent.change(percent, { target: { value: result.percent.toFixed(1).replace('.', ',') } });
    fireEvent.keyDown(percent, { key: 'Enter' });
    expect(within(container).getByText(/^Rétt! /)).toBeTruthy();
  });
});

describe('Framvinda', () => {
  it('counts Stig 3 as finished even when it scored nothing', () => {
    localStorage.setItem(
      'takmarkandi-levels-progress',
      JSON.stringify({
        level1Completed: true,
        level1Score: 80,
        level2Completed: true,
        level2Score: 80,
        level3BestScore: 0,
        totalGamesPlayed: 2,
      })
    );
    const { container } = render(<App />);
    const counter = () => within(container).getByText('Stig lokið').previousElementSibling!;
    expect(counter().textContent).toBe('2/3');

    fireEvent.click(within(container).getByText('Meistarapróf'));
    for (let p = 0; p < YIELD_PROBLEMS.length; p++) {
      const { reaction, result } = showing(container);
      const wrong =
        result.limitingFormula === reaction.reactant1.formula
          ? reaction.reactant2.formula
          : reaction.reactant1.formula;
      fireEvent.click(
        within(container)
          .getAllByRole('button')
          .find((b) => b.textContent?.trim() === wrong)!
      );
      fireEvent.click(within(container).getByText('Athuga'));
      fireEvent.click(within(container).getByText('Áfram →'));
      for (let step = 0; step < 2; step++) {
        fireEvent.change(container.querySelector('input')!, { target: { value: '1' } });
        fireEvent.click(within(container).getByText('Athuga'));
        fireEvent.click(within(container).getByText('Áfram →'));
      }
      fireEvent.click(within(container).getByText(/Næsta verkefni|Sjá niðurstöður/));
    }
    expect(within(container).getByText(/^0$/)).toBeTruthy();
    fireEvent.click(within(container).getByText('Ljúka stigi'));

    expect(counter().textContent, 'finished all three, yet the counter disagrees').toBe('3/3');
  });

  /** Which shipped problem is on screen, read off its equation. */
  function showing(root: HTMLElement) {
    return YIELD_PROBLEMS.find((p) => within(root).queryByText(p.reaction.equation) !== null)!;
  }
});
