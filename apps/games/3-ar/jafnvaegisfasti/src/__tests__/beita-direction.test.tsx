import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { BeitaScreen } from '../components/BeitaScreen';
import { BEITA_PROBLEMS, DIRECTION_PROBLEMS } from '../data/problems';

/**
 * Beita's first step is graded, and its answer is not always forward.
 *
 * **Why this exists** (mobile-pass decision 96, ruled 2026-10-23: (a), and (b)
 * because ch. 13 has the example). Both direction buttons moved on with no
 * verdict, and all ten problems started with no products, so Q = 0 and the
 * answer was `Áfram` every time: a student could learn to press the first
 * button. Now the Q-against-K line opens with `Rétt.` or `Ekki rétt.`, and the
 * book's Tilraun 2 — the water-gas mixture its worked example says runs
 * backwards — is a Beita problem, with x asked for as a size and the signs in
 * the change column turned round.
 */

// "Næsta" ignores a press within 400 ms of appearing; these tests press at once.
clockPastNextGuard();

afterEach(cleanup);

const FORWARD = 'Áfram — myndefnin aukast';
const BACKWARD = 'Afturábak — hvarfefnin aukast';

/** Walk the screen to `index` by playing each earlier problem to the end. */
function openProblem(index: number) {
  render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
  for (let i = 0; i < index; i += 1) {
    fireEvent.click(screen.getByText(FORWARD));
    fireEvent.click(screen.getByText('Athuga'));
    fireEvent.click(screen.getByText('Sýna svarið og halda áfram'));
    // NH₄Cl skips the five per cent question (decision 97 (a)), so it is answered only where
    // it is asked.
    const rule = screen.queryByText(/nálgunin hefði dugað/i);
    if (rule) fireEvent.click(rule);
    fireEvent.click(screen.getByText(/Næsta dæmi|Ljúka/));
  }
}

/** The change-column cell of the table row for `formula`. */
function changeOf(formula: string): string {
  const row = within(screen.getByRole('table'))
    .getAllByRole('row')
    .find((r) => r.querySelector('td')?.textContent === formula);
  expect(row, `no row for ${formula}`).toBeTruthy();
  return row!.querySelectorAll('td')[2].textContent ?? '';
}

describe('the direction step', () => {
  it('says Rétt. for the direction Q gives', () => {
    expect(BEITA_PROBLEMS[0].result.direction).toBe('afram');
    openProblem(0);
    fireEvent.click(screen.getByText(FORWARD));
    expect(screen.getByText('Rétt.')).toBeTruthy();
  });

  it('says Ekki rétt. for the other one, and still moves on', () => {
    openProblem(0);
    fireEvent.click(screen.getByText(BACKWARD));
    expect(screen.getByText('Ekki rétt.')).toBeTruthy();
    expect(screen.getByLabelText('Tala')).toBeTruthy();
  });
});

describe('the problem that runs backwards', () => {
  const index = BEITA_PROBLEMS.findIndex((p) => p.result.direction === 'afturabak');

  it('exists, and is the book’s Tilraun 2 that Æfa serves', () => {
    expect(index, 'every Beita problem runs forwards').toBeGreaterThanOrEqual(0);
    const problem = BEITA_PROBLEMS[index];
    expect(problem.reaction.id).toBe('vatnsgas');
    expect(
      DIRECTION_PROBLEMS.some(
        (d) =>
          d.reaction.id === 'vatnsgas' &&
          d.direction === 'afturabak' &&
          JSON.stringify(d.amounts) === JSON.stringify(problem.initial)
      )
    ).toBe(true);
  });

  it('marks Afturábak right and turns the signs in the change column round', () => {
    openProblem(index);
    fireEvent.click(screen.getByText(BACKWARD));
    expect(screen.getByText('Rétt.')).toBeTruthy();
    expect(changeOf('CO')).toBe('+x');
    expect(changeOf('H₂O')).toBe('+x');
    expect(changeOf('CO₂')).toBe('−x');
    expect(changeOf('H₂')).toBe('−x');
  });

  it('asks for x as a size, and accepts it', () => {
    const x = Math.abs(BEITA_PROBLEMS[index].result.extent);
    const power = Math.floor(Math.log10(x));
    openProblem(index);
    fireEvent.click(screen.getByText(BACKWARD));
    fireEvent.change(screen.getByLabelText('Tala'), {
      target: { value: (x / 10 ** power).toFixed(3).replace('.', ',') },
    });
    fireEvent.change(screen.getByLabelText('Veldisvísir'), { target: { value: String(power) } });
    fireEvent.click(screen.getByText('Athuga'));
    // A correct x moves straight on to the five per cent question.
    expect(screen.getByText(/nálgunin hefði dugað/)).toBeTruthy();
  });
});
