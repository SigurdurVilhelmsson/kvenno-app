import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ALL_PROBLEMS, answer, openProblem, VERDICT } from './play-helpers';
import App from '../App';

/**
 * Every number a student reads in this game is written with the Icelandic decimal comma.
 *
 * **Why this exists.** The answer field reads a comma (`parseStudentNumber`), but everything
 * the game printed wrote a full stop: its own placeholder (`t.d. -33.5`), the stored ΔH° and
 * ΔS° (`-1.9 kJ/mol`), the live ΔG° panel, the worked solution, the feedback, `R = 8.314`
 * and `E° = 1.10 V`. Rounding also printed `-0` (`273 K (-0°C)` for freezing water), and the
 * solution printed a negative TΔS bare, as `-283 - -25.9`. And ΔS° = 3,3 J/(mol·K) was
 * converted to `0.003` kJ/(mol·K), a figure short, so the steps did not add up to their own
 * total.
 *
 * Every problem is played to its worked solution and the whole screen is read.
 */

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  Element.prototype.scrollIntoView = () => {};
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** A digit, a full stop, a digit: a number printed with a decimal point. */
const DECIMAL_POINT = /\d\.\d/;
/** `-0` or `-0,0` standing alone: a rounded negative zero. */
const NEGATIVE_ZERO = /(^|[^\d,])-0(,0+)?(?![\d,])/;
/** A minus sign straight after a binary minus. */
const DOUBLE_MINUS = /[-−]\s*[-−]/;

function readScreen(where: string) {
  const text = document.body.textContent ?? '';
  expect(text, `${where}: decimal point in "${text.match(DECIMAL_POINT)?.[0]}"`).not.toMatch(
    DECIMAL_POINT
  );
  expect(text, `${where}: negative zero`).not.toMatch(NEGATIVE_ZERO);
  expect(text, `${where}: double minus`).not.toMatch(DOUBLE_MINUS);
  for (const input of document.querySelectorAll('input[placeholder]')) {
    expect(input.getAttribute('placeholder'), where).not.toMatch(DECIMAL_POINT);
  }
}

describe('decimal comma on screen', () => {
  it('on every problem, before and after a wrong answer', () => {
    expect(ALL_PROBLEMS.length).toBe(30);
    for (const { problem } of ALL_PROBLEMS) {
      openProblem(problem.id);
      readScreen(`id ${problem.id}, question`);
      // A wrong verdict brings the scenario reasoning with its TΔS figure; on the three
      // equilibrium problems it is the right one, which shows the ΔG° it should have been.
      answer('99999', VERDICT.equilibrium);
      readScreen(`id ${problem.id}, solution`);
      cleanup();
    }
  });

  it('prints the stored ΔH° and ΔS° with a comma', () => {
    openProblem(15);
    expect(screen.getByText(/-1,9 kJ\/mol/)).toBeTruthy();
    expect(screen.getByText(/3,3 J\/\(mol·K\)/)).toBeTruthy();
  });

  it('converts 3,3 J/(mol·K) to 0,0033 kJ/(mol·K), not 0,003', () => {
    openProblem(15);
    answer('99999', VERDICT.equilibrium);
    expect(screen.getByText(/× \(1 kJ \/ 1000 J\) = 0,0033 kJ/)).toBeTruthy();
  });

  it('puts a negative TΔS in brackets', () => {
    // Id 10, CO + ½O₂: TΔS = 298 × (−0,087) = −25,9 at 298 K.
    openProblem(10);
    answer('99999', VERDICT.equilibrium);
    expect(document.body.textContent).toContain('ΔG° = (-283) - (-25,9)');
  });

  it('prints the crossover for freezing water as 0 °C, not -0 °C', () => {
    openProblem(2);
    expect(document.body.textContent).toContain('273 K(0°C)');
  });

  it('in Könnun', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Könnun/ }));
    for (const T of ['200', '499', '500', '501', '1200']) {
      fireEvent.change(screen.getByLabelText(/Hitastig:/), { target: { value: T } });
      readScreen(`Könnun at ${T} K`);
    }
  });

  it('on the menu', () => {
    render(<App />);
    readScreen('menu');
  });
});

describe('decimal comma in the source', () => {
  const SRC = join(__dirname, '..');
  const files = ['App.tsx', 'components/EntropyVisualization.tsx'];

  it('nothing formats a number with toFixed', () => {
    // `toFixed` writes a full stop; `formatDecimal` and `formatRounded` are the route.
    for (const file of files) {
      readFileSync(join(SRC, file), 'utf8')
        .split('\n')
        .forEach((line, i) => {
          expect(line, `${file}:${i + 1}`).not.toContain('.toFixed(');
        });
    }
  });

  it('the stored ΔH° and ΔS° are not interpolated raw', () => {
    // `{currentProblem.deltaH}` renders −1,9 as `-1.9`. A prop (`deltaS={…}`) is not text.
    for (const file of files) {
      readFileSync(join(SRC, file), 'utf8')
        .split('\n')
        .forEach((line, i) => {
          expect(line, `${file}:${i + 1}`).not.toMatch(/(?<!=)\{currentProblem\.delta[HS]\}/);
        });
    }
  });
});
