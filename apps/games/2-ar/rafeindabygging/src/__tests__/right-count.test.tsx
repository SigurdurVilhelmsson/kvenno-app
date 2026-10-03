// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { clockPastNextGuard } from './next-guard-clock';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';
import { Level3 } from '../components/Level3';
import { configPuzzles } from '../data/electron-configs';
import { periodicPuzzles } from '../data/periodic-configs';
import { puzzles } from '../data/quantum-numbers';

/**
 * No running score inside a level, and `N af M rétt` at its end (mobile-pass
 * decision 1 (b), ruled platform-wide). Every level used to carry
 * `Spurning x / y • Stig: N` above the question, and the menu and the summary
 * showed points and a `Heildarstig` total.
 *
 * Each level is played through the real component with some answers wrong, and
 * must report exactly the right answers out of the questions posed. No level
 * here offers a retry, so a right answer is simply a right first answer.
 *
 * Queries are scoped to each render's container: vitest runs with `retry: 2`
 * and no RTL auto-cleanup, so a failed attempt leaves its DOM behind.
 */

clockPastNextGuard();

beforeEach(() => {
  localStorage.clear();
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
});

afterEach(() => {
  delete (Element.prototype as Partial<Element>).scrollIntoView;
  vi.restoreAllMocks();
  localStorage.clear();
  document.body.innerHTML = '';
});

const RUNNING_SCORE = [/\bStig:\s*\d/, /\d+\s*stig\b/i, /Heildarstig/];

function expectNoScore(container: HTMLElement) {
  for (const pattern of RUNNING_SCORE) expect(container.textContent).not.toMatch(pattern);
}

/** Wrong on every third question (0, 3, 6, …), right on the rest. */
const wrongAt = (i: number) => i % 3 === 0;
const expectedRight = (n: number) =>
  Array.from({ length: n }, (_, i) => i).filter((i) => !wrongAt(i)).length;

describe('Stig 1', () => {
  it('shows no score while playing and reports the right answers out of eight', () => {
    const onComplete = vi.fn();
    const { container } = render(<Level1 onComplete={onComplete} onBack={vi.fn()} />);
    const ui = within(container);
    for (const step of [/Sjáum dæmi/, /Eitt dæmi til/, /byrja æfingar/]) {
      fireEvent.click(ui.getByRole('button', { name: step }));
    }
    puzzles.forEach((puzzle, i) => {
      expectNoScore(container);
      const cards = Array.from(
        container.querySelectorAll<HTMLButtonElement>('button.quantum-card')
      );
      // Right: tick exactly the valid cards. Wrong: tick exactly the invalid ones.
      const valid = new Set(
        puzzle.options.filter((o) => o.isValid).map((o) => `${o.l}|${o.ml}|${o.ms}`)
      );
      for (const card of cards) {
        const key = cardKey(card);
        if (valid.has(key) !== wrongAt(i)) fireEvent.click(card);
      }
      fireEvent.click(ui.getByRole('button', { name: /Athuga svar/ }));
      expectNoScore(container);
      fireEvent.click(ui.getByRole('button', { name: /Næsta spurning|Ljúka stigi/ }));
    });
    expect(onComplete).toHaveBeenCalledWith(expectedRight(puzzles.length), puzzles.length);
  });
});

/** The quantum numbers printed on a Stig 1 card, as `l|ml|ms`. */
function cardKey(card: HTMLElement): string {
  const text = card.textContent!.replace(/−/g, '-');
  const m = /l = (-?\d+),\s*mₗ = (-?\d+),\s*mₛ = ([+-]?)(½|[\d.]+)/.exec(text);
  if (!m) throw new Error(`unreadable card: ${card.textContent}`);
  const magnitude = m[4] === '½' ? 0.5 : Number(m[4]);
  return `${m[1]}|${m[2]}|${m[3] === '-' ? -magnitude : magnitude}`;
}

describe('Stig 2', () => {
  it('shows no score while playing and reports the right answers out of the elements posed', () => {
    const onComplete = vi.fn();
    const { container } = render(<Level2 onComplete={onComplete} onBack={vi.fn()} />);
    const ui = within(container);
    fireEvent.click(ui.getByRole('button', { name: /Byrja æfingar/ }));
    configPuzzles.forEach((_, i) => {
      expectNoScore(container);
      const symbol = container.querySelector('.text-4xl')!.textContent!;
      const puzzle = configPuzzles.find((p) => p.element === symbol)!;
      fireEvent.change(ui.getByRole('textbox'), {
        target: { value: wrongAt(i) ? '1s2 2s9' : puzzle.correctConfig },
      });
      fireEvent.click(ui.getByRole('button', { name: /Athuga svar/ }));
      expectNoScore(container);
      fireEvent.click(ui.getByRole('button', { name: /Næsta frumefni|Ljúka stigi/ }));
    });
    expect(onComplete).toHaveBeenCalledWith(
      expectedRight(configPuzzles.length),
      configPuzzles.length
    );
  });
});

describe('Stig 3', () => {
  it('shows no score while playing and reports the right answers out of the elements posed', () => {
    const onComplete = vi.fn();
    const { container } = render(<Level3 onComplete={onComplete} onBack={vi.fn()} />);
    const ui = within(container);
    fireEvent.click(ui.getByRole('button', { name: /Byrja æfingar/ }));
    periodicPuzzles.forEach((puzzle, i) => {
      expectNoScore(container);
      const options = Array.from(container.querySelectorAll<HTMLButtonElement>('button.mc-option'));
      const pick = wrongAt(i)
        ? options.find((b) => b.textContent !== puzzle.fullShorthand)!
        : options.find((b) => b.textContent === puzzle.fullShorthand)!;
      fireEvent.click(pick);
      fireEvent.click(ui.getByRole('button', { name: /Athuga svar/ }));
      expectNoScore(container);
      fireEvent.click(ui.getByRole('button', { name: /Næsta frumefni|Ljúka stigi/ }));
    });
    expect(onComplete).toHaveBeenCalledWith(
      expectedRight(periodicPuzzles.length),
      periodicPuzzles.length
    );
  });
});

describe('the menu and the summary', () => {
  const KEY = 'rafeindabygging-progress';

  it('show each level as "N af M rétt", with no points and no total', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        level1Completed: true,
        level1Correct: 6,
        level1Total: 8,
        level2Completed: true,
        level2Correct: 7,
        level2Total: 10,
        level3Completed: false,
      })
    );
    const { container } = render(<App />);
    expect(container.textContent).toContain('✓ 6 af 8 rétt');
    expect(container.textContent).toContain('✓ 7 af 10 rétt');
    expect(container.textContent).toContain('2 af 3 stigum lokið');
    expectNoScore(container);
  });

  it('show a level finished under the old points format as "Lokið", never as a count', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        level1Completed: true,
        level1Score: 5,
        level2Completed: false,
        level2Score: 0,
        level3Completed: false,
        level3Score: 0,
        totalGamesPlayed: 1,
      })
    );
    const { container } = render(<App />);
    expect(container.textContent).toContain('✓ Lokið');
    expect(container.textContent).not.toMatch(/5 af/);
    expectNoScore(container);
  });

  it("the summary lists each level's count after the set is finished", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        level1Completed: true,
        level1Correct: 6,
        level1Total: 8,
        level2Completed: true,
        level2Score: 4,
        level3Completed: false,
      })
    );
    const { container } = render(<App />);
    const ui = within(container);
    fireEvent.click(ui.getByRole('button', { name: /Stig 3: Lotukerfi og rafeindir/ }));
    fireEvent.click(ui.getByRole('button', { name: /Byrja æfingar/ }));
    for (const puzzle of periodicPuzzles) {
      const option = Array.from(
        container.querySelectorAll<HTMLButtonElement>('button.mc-option')
      ).find((b) => b.textContent === puzzle.fullShorthand)!;
      fireEvent.click(option);
      fireEvent.click(ui.getByRole('button', { name: /Athuga svar/ }));
      fireEvent.click(ui.getByRole('button', { name: /Næsta frumefni|Ljúka stigi/ }));
    }
    expect(container.textContent).toMatch(/Þú hefur lokið öllum stigum/);
    expect(container.textContent).toContain('6 af 8 rétt');
    expect(container.textContent).toContain('Lokið');
    const n = periodicPuzzles.length;
    expect(container.textContent).toContain(`${n} af ${n} rétt`);
    expectNoScore(container);
  });
});
