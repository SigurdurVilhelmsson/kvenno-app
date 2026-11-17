import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import App from '../App';
import { PROBLEMS } from '../data';
import type { Difficulty, Problem } from '../types';

/** Every problem, with where it sits: the pool it is drawn from and its index there. */
export const ALL_PROBLEMS: { problem: Problem; difficulty: Difficulty; index: number }[] = (
  ['beginner', 'intermediate', 'advanced'] as const
).flatMap((difficulty) =>
  PROBLEMS[difficulty].map((problem, index) => ({ problem, difficulty, index }))
);

const DIFFICULTY_BUTTON: Record<Difficulty, RegExp> = {
  beginner: /Stig 1: Auðvelt/,
  intermediate: /Stig 2: Miðlungs/,
  advanced: /Stig 3: Erfitt/,
};

/** The problem with this id, and where it sits. */
export function problemById(id: number) {
  const found = ALL_PROBLEMS.find((p) => p.problem.id === id);
  if (!found) throw new Error(`No problem with id ${id}`);
  return found;
}

/**
 * Render the game and open `mode` on problem `id`. `startNewProblem` draws with
 * `Math.random`, so it is pinned to the problem's slot for the rest of the test.
 */
export function openProblem(id: number, mode: RegExp = /Æfingarhamur/) {
  const { difficulty, index } = problemById(id);
  vi.spyOn(Math, 'random').mockReturnValue((index + 0.5) / PROBLEMS[difficulty].length);
  const view = render(<App />);
  // A level card starts Æfingarhamur; Keppnishamur has a button per level.
  const level = ['beginner', 'intermediate', 'advanced'].indexOf(difficulty) + 1;
  fireEvent.click(
    screen.getByRole(
      'button',
      mode.source.includes('Keppni')
        ? { name: `Byrja keppni: Stig ${level}` }
        : { name: DIFFICULTY_BUTTON[difficulty] }
    )
  );
  return view;
}

/** Type a ΔG°, pick a verdict and check the answer. */
export function answer(value: string, verdict: RegExp) {
  fireEvent.change(screen.getByLabelText(/ΔG° við/), { target: { value } });
  fireEvent.click(screen.getByRole('radio', { name: verdict }));
  fireEvent.click(screen.getByRole('button', { name: 'Athuga svar' }));
}

/** Move the problem's temperature slider. */
export function setTemperature(kelvin: number) {
  fireEvent.change(screen.getByRole('slider', { name: 'Hitastig í Kelvinum' }), {
    target: { value: String(kelvin) },
  });
}

/** The radio name for each verdict. */
export const VERDICT = {
  spontaneous: /^✓ Sjálfgengt/,
  equilibrium: /Jafnvægi/,
  'non-spontaneous': /Ekki sjálfgengt/,
} as const;
