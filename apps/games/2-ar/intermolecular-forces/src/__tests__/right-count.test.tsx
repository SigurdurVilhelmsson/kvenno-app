// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { clockPastNextGuard } from './next-guard-clock';
import { Level1, molecules } from '../components/Level1';
import { Level2, problems } from '../components/Level2';
import { Level3, challenges } from '../components/Level3';

/**
 * No running score inside a level, and `N af M rétt` at its end (mobile-pass
 * decision 1 (b), ruled platform-wide). Every level used to show `N stig` beside
 * its question counter, and the menu and the closing screen showed points and a
 * `Heildarstig` total.
 *
 * Each level is played through the real component with some answers wrong, once
 * without the hint and once opening it on every question, and must report the
 * same count of right answers both times (decision 2 (b)). No level offers a
 * retry, so a right answer is a right first answer.
 *
 * Buttons are found by their text rather than `getByRole`, which rebuilds the
 * accessibility tree on every call. Queries are scoped to the rendered container
 * because the repo runs vitest with `retry: 2` and no RTL auto-cleanup.
 */

clockPastNextGuard();

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
});

const RUNNING_SCORE = [/\bStig:\s*\d/, /\d+\s*stig\b/i, /Heildarstig/];

function expectNoScore(container: HTMLElement) {
  for (const pattern of RUNNING_SCORE) expect(container.textContent).not.toMatch(pattern);
}

function button(container: HTMLElement, text: RegExp): HTMLElement {
  const found = [...container.querySelectorAll('button')].find((b) =>
    text.test(b.textContent?.trim() ?? '')
  );
  if (!found) throw new Error(`no button matching ${text}`);
  return found;
}

/** Wrong on every third question (0, 3, 6, …), right on the rest. */
const wrongAt = (i: number) => i % 3 === 0;
const expectedRight = (n: number) =>
  Array.from({ length: n }, (_, i) => i).filter((i) => !wrongAt(i)).length;

const FORCE_BUTTON = { london: /Veikastur$/, dipole: /Meðal$/, hydrogen: /Sterkastur$/ };

function playLevel1(openHints: boolean) {
  const onComplete = vi.fn();
  const { container } = render(<Level1 onComplete={onComplete} onBack={vi.fn()} />);
  fireEvent.click(button(container, /Hefja æfingar/));
  molecules.forEach((molecule, i) => {
    expect(container.querySelector('.text-4xl')!.textContent).toBe(molecule.formula);
    expectNoScore(container);
    if (openHints) fireEvent.click(button(container, /^Sýna vísbendingu$/));
    // Wrong: London alone where more is present, all three where London is all.
    const chosen = !wrongAt(i)
      ? molecule.correctIMFs
      : molecule.correctIMFs.length === 1
        ? (['london', 'dipole', 'hydrogen'] as const)
        : (['london'] as const);
    for (const force of chosen) fireEvent.click(button(container, FORCE_BUTTON[force]));
    fireEvent.click(button(container, /^Athuga svar$/));
    expectNoScore(container);
    fireEvent.click(button(container, /^(Næsta sameind|Ljúka stigi 1)$/));
  });
  return onComplete;
}

function playLevel2(openHints: boolean) {
  const onComplete = vi.fn();
  const { container } = render(<Level2 onComplete={onComplete} onBack={vi.fn()} />);
  problems.forEach((problem, i) => {
    expectNoScore(container);
    if (openHints) fireEvent.click(button(container, /^Sýna vísbendingu$/));
    const order = wrongAt(i) ? [...problem.correctOrder].reverse() : problem.correctOrder;
    for (const id of order) {
      const formula = problem.compounds.find((c) => c.id === id)!.formula;
      const pool = within(container).getByText('Tiltæk efni:').parentElement!;
      const pick = [...pool.querySelectorAll('button')].find(
        (b) => b.querySelector('.font-bold')!.firstChild!.textContent!.trim() === formula
      )!;
      fireEvent.click(pick);
    }
    fireEvent.click(button(container, /^Athuga röðun$/));
    expectNoScore(container);
    fireEvent.click(button(container, /^(Næsta verkefni|Ljúka stigi 2)$/));
  });
  return onComplete;
}

function playLevel3(openHints: boolean) {
  const onComplete = vi.fn();
  const { container } = render(<Level3 onComplete={onComplete} onBack={vi.fn()} />);
  challenges.forEach((challenge, i) => {
    expectNoScore(container);
    if (openHints) fireEvent.click(button(container, /^Sýna vísbendingu$/));
    const option = challenge.options.find((o) => o.correct === !wrongAt(i))!;
    const pick = [...container.querySelectorAll('button')].find(
      (b) => b.querySelector('span.flex-1')?.textContent === option.text
    )!;
    fireEvent.click(pick);
    fireEvent.click(button(container, /^Athuga svar$/));
    expectNoScore(container);
    fireEvent.click(button(container, /^(Næsta spurning|Ljúka stigi 3)$/));
  });
  return onComplete;
}

describe('each level counts right answers, shows no score, and a hint changes nothing', () => {
  it('Stig 1', () => {
    const want = [expectedRight(molecules.length), molecules.length];
    expect(playLevel1(false)).toHaveBeenCalledWith(...want);
    document.body.innerHTML = '';
    expect(playLevel1(true)).toHaveBeenCalledWith(...want);
  });

  it('Stig 2', () => {
    const want = [expectedRight(problems.length), problems.length];
    expect(playLevel2(false)).toHaveBeenCalledWith(...want);
    document.body.innerHTML = '';
    expect(playLevel2(true)).toHaveBeenCalledWith(...want);
  }, 20_000);

  it('Stig 3', () => {
    const want = [expectedRight(challenges.length), challenges.length];
    expect(playLevel3(false)).toHaveBeenCalledWith(...want);
    document.body.innerHTML = '';
    expect(playLevel3(true)).toHaveBeenCalledWith(...want);
  });
});

describe('the menu and the closing screen', () => {
  const KEY = 'imf-progress';

  it('show each level as "N af M rétt", with no points and no total', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        level1Completed: true,
        level1Correct: 7,
        level1Total: 10,
        level2Completed: true,
        level2Correct: 9,
        level2Total: 10,
        level3Completed: false,
      })
    );
    const { container } = render(<App />);
    expect(container.textContent).toContain('✓ 7 af 10 rétt');
    expect(container.textContent).toContain('✓ 9 af 10 rétt');
    expect(container.textContent).toContain('2 af 3 stigum lokið');
    expectNoScore(container);
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
    expectNoScore(container);
  });

  it('the closing screen lists each level by its count', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        level1Completed: true,
        level1Correct: 7,
        level1Total: 10,
        level2Completed: true,
        level2Score: 150,
        level3Completed: false,
      })
    );
    const { container } = render(<App />);
    fireEvent.click(button(container, /Stig 3: Flókin greining/));
    challenges.forEach((challenge) => {
      const option = challenge.options.find((o) => o.correct)!;
      fireEvent.click(
        [...container.querySelectorAll('button')].find(
          (b) => b.querySelector('span.flex-1')?.textContent === option.text
        )!
      );
      fireEvent.click(button(container, /^Athuga svar$/));
      fireEvent.click(button(container, /^(Næsta spurning|Ljúka stigi 3)$/));
    });
    expect(container.textContent).toContain('Þú hefur lokið öllum stigum!');
    expect(container.textContent).toContain('7 af 10 rétt');
    expect(container.textContent).toContain('Lokið');
    expect(container.textContent).toContain(`${challenges.length} af ${challenges.length} rétt`);
    expectNoScore(container);
  });
});
