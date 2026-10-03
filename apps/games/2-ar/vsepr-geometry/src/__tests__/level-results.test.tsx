// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { POOL, answerCount, check, next, playMolecule, startLevel2 } from './level2-play';
import { clockPastNextGuard } from './next-guard-clock';
import { Level1 } from '../components/Level1';
import { Level3 } from '../components/Level3';

/**
 * No running score (mobile-pass decision 1, ruled (b)). Every level showed
 * `{score} stig` beside the question counter, Stig 1 paid 15 × a hint
 * multiplier, and the menu and the end screen added the levels up into
 * `Heildarstig`. Now a level counts its right answers, one try each, and
 * reports `N af M rétt` to the menu and the end screen; opening a hint never
 * changes the count (decision 2 (b)). Stig 2 counts its three graded steps per
 * molecule and not the written explanation, which is checked only for length.
 *
 * Queries are scoped to each rendered container (the repo runs vitest with
 * `retry: 2` and no RTL auto-cleanup).
 */

const RUNNING_SCORE = [/\bStig:\s*\d/, /\d+\s*stig\b/];
const STORAGE_KEY = 'vsepr-geometry-progress';
let unmount: (() => void) | null = null;

clockPastNextGuard();

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  unmount?.();
  unmount = null;
  localStorage.clear();
});

function expectNoScore(container: HTMLElement) {
  for (const pattern of RUNNING_SCORE) expect(container.textContent).not.toMatch(pattern);
}

const optionButtons = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('button')).filter((b) =>
    /^[a-d]\./.test(b.textContent?.trim() ?? '')
  );

/**
 * Answer every multiple-choice question at a rotating position, opening the
 * hint first when asked, and return how many the screen marked right.
 */
function playChoices(
  ui: ReturnType<typeof within>,
  container: HTMLElement,
  questions: number,
  finish: RegExp,
  openHint: boolean
) {
  let right = 0;
  for (let q = 0; q < questions; q++) {
    if (openHint) fireEvent.click(ui.getByRole('button', { name: 'Sýna vísbendingu' }));
    expectNoScore(container);
    const position = q % 4;
    fireEvent.click(optionButtons(container)[position]);
    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
    const correctAt = optionButtons(container).findIndex((b) =>
      b.className.includes('border-green-500')
    );
    if (correctAt === position) right++;
    expectNoScore(container);
    fireEvent.click(ui.getByRole('button', { name: finish }));
  }
  return right;
}

describe('Stig 1', () => {
  for (const openHint of [false, true]) {
    it(`reports right answers of 8, ${openHint ? 'with' : 'without'} the hint open`, () => {
      const onComplete = vi.fn();
      const rendered = render(<Level1 onComplete={onComplete} onBack={vi.fn()} />);
      unmount = rendered.unmount;
      const ui = within(rendered.container);
      fireEvent.click(ui.getByRole('button', { name: /Hefja spurningar/ }));
      const right = playChoices(
        ui,
        rendered.container,
        8,
        /Næsta spurning|Ljúka stigi 1/,
        openHint
      );
      expect(onComplete).toHaveBeenCalledWith(right, 8);
    });
  }
});

describe('Stig 2', () => {
  it('reports 30 of 30 for ten molecules right, and shows no score on the way', () => {
    const { ui, container, unmount: done, onComplete } = startLevel2();
    unmount = done;
    for (const m of POOL) {
      expectNoScore(container);
      playMolecule(ui, container, m);
    }
    expect(onComplete).toHaveBeenCalledWith(30, 30);
  });

  it('does not count a wrong step, and does not count the explanation', () => {
    const { ui, container, unmount: done, onComplete } = startLevel2();
    unmount = done;
    const [first, ...rest] = POOL;
    // A wrong count, then the rest of the molecule right, with a short explanation.
    answerCount(ui, container, first.bondingPairs + 1, first.lonePairs);
    expect(ui.getByText(/^Rangt/)).toBeTruthy();
    next(ui);
    fireEvent.click(ui.getByRole('button', { name: first.shape }));
    check(ui);
    next(ui);
    fireEvent.change(container.querySelector('input[type=text]') as HTMLElement, {
      target: { value: first.angle },
    });
    check(ui);
    next(ui);
    fireEvent.change(container.querySelector('textarea') as HTMLElement, {
      target: { value: 'Fjögur svæði.' },
    });
    check(ui);
    next(ui);
    for (const m of rest) playMolecule(ui, container, m);
    expect(onComplete).toHaveBeenCalledWith(29, 30);
  });
});

describe('Stig 3', () => {
  for (const openHint of [false, true]) {
    it(`reports right answers of 12, ${openHint ? 'with' : 'without'} the hint open`, () => {
      const onComplete = vi.fn();
      const rendered = render(<Level3 onComplete={onComplete} onBack={vi.fn()} />);
      unmount = rendered.unmount;
      const right = playChoices(
        within(rendered.container),
        rendered.container,
        12,
        /Næsta spurning|Ljúka stigi 3/,
        openHint
      );
      expect(onComplete).toHaveBeenCalledWith(right, 12);
    });
  }
});

function startApp() {
  const rendered = render(<App />);
  unmount = rendered.unmount;
  return { ui: within(rendered.container), container: rendered.container };
}

describe('the menu and the end screen', () => {
  it('show "N af M rétt" per level and no total', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ level1Completed: true, level1Correct: 6, level1Total: 8 })
    );
    const { container } = startApp();
    expect(container.textContent).toContain('✓ 6 af 8 rétt');
    expectNoScore(container);
    expect(container.textContent).not.toMatch(/Heildar ?stig/);
  });

  it('show a level saved in points as done, with no count', () => {
    localStorage.setItem(
      STORAGE_KEY,
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
    const { container } = startApp();
    expect(container.textContent).toContain('✓ Lokið');
    expect(container.textContent).not.toContain('90');
  });

  it('end with each level as a count once the set is done', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        level1Completed: true,
        level1Correct: 7,
        level1Total: 8,
        level2Completed: true,
        level2Score: 300,
      })
    );
    const { ui, container } = startApp();
    fireEvent.click(ui.getByRole('button', { name: /Stig 3: Svigrúmablöndun og skautun/ }));
    const right = playChoices(ui, container, 12, /Næsta spurning|Ljúka stigi 3/, false);
    expect(container.textContent).toContain('Þú hefur lokið öllum stigum!');
    expect(container.textContent).toContain('7 af 8 rétt');
    expect(container.textContent).toContain('Lokið');
    expect(container.textContent).toContain(`${right} af 12 rétt`);
    expect(container.textContent).not.toMatch(/Heildar ?stig/);
    expect(container.textContent).not.toContain('300');
  });
});
