import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { formatScientific } from '@shared/utils';

import { AefaScreen } from '../components/AefaScreen';
import { COUPLED_PROBLEMS } from '../data/coupled';

/**
 * Every coupled problem must be answerable with the controls on the screen.
 *
 * **This is the `1-ar/nafnakerfid` defect, which is the reason the test
 * exists.** That game shipped 33 compounds its own answer tray could not
 * spell, so they could never be marked correct — roughly six unanswerable
 * questions per run. The shape here is identical: `findCoupledRoute` searches
 * factors up to six while the screen offers 1, 2 and 3, so a problem needing a
 * factor of four would be found solvable by the data and be unanswerable by a
 * student. Nothing but playing it catches that.
 *
 * So this plays each problem to a correct answer through the real buttons and
 * the real inputs, and asserts it reaches the end.
 */

afterEach(cleanup);

function openCoupledTask() {
  render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
  fireEvent.click(screen.getByText('Tengd jafnvægi'));
}

/** The card for the given equation at `index`, by its position on screen. */
function givenCards() {
  return screen
    .getAllByText('Snúa við')
    .map((button) => button.closest('div.rounded-xl') as HTMLElement);
}

function playCurrentProblem(problem: (typeof COUPLED_PROBLEMS)[number]) {
  const cards = givenCards();
  expect(cards, `${problem.id}: wrong number of given equations on screen`).toHaveLength(
    problem.givens.length
  );

  problem.route.forEach((step, i) => {
    const card = cards[i];
    // Read the offered factors off the card rather than assuming them: the
    // whole point is to catch a route the screen cannot express.
    const offered = within(card)
      .getAllByRole('button')
      .map((b) => Number(b.textContent))
      .filter((n) => Number.isFinite(n) && n > 0);
    expect(
      offered,
      `${problem.id}: step ${i} needs factor ${step.factor}, which the screen does not offer`
    ).toContain(step.factor);
    if (step.reversed) fireEvent.click(within(card).getByText('Snúa við'));
    if (step.factor !== 1) fireEvent.click(within(card).getByText(String(step.factor)));
  });

  fireEvent.click(screen.getByText('Athuga jöfnuna'));
  // Stage two only opens if the composed equation really is the target.
  expect(screen.queryByText(/Jafnan stemmir/), `${problem.id}: operations rejected`).not.toBeNull();

  const printed = formatScientific(problem.result.constant!.value, 2);
  const [digits, power] = printed.split(' × 10');
  fireEvent.change(screen.getByLabelText('Tala'), { target: { value: digits } });
  fireEvent.change(screen.getByLabelText('Veldisvísir'), {
    target: {
      value: power
        .replace('⁻', '-')
        .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c).toString()),
    },
  });
  fireEvent.click(screen.getByText('Athuga'));
}

describe('the coupled-equilibria task', () => {
  it('can be played to the end with the controls it shows', () => {
    openCoupledTask();
    for (let i = 0; i < COUPLED_PROBLEMS.length; i += 1) {
      const problem = COUPLED_PROBLEMS[i];
      playCurrentProblem(problem);
      // A correct constant reveals the answer panel and the next-problem button.
      const advance = i + 1 >= COUPLED_PROBLEMS.length ? 'Ljúka' : 'Næsta dæmi';
      expect(screen.queryByText(advance), `${problem.id}: answer not accepted`).not.toBeNull();
      fireEvent.click(screen.getByText(advance));
    }
  });

  it('refuses a wrong set of operations instead of letting it through', () => {
    // The guard on the guard: if stage one accepted anything, the test above
    // would pass without proving a thing.
    openCoupledTask();
    const problem = COUPLED_PROBLEMS[0];
    expect(problem.route[0].reversed).toBe(true);
    // Leave it unreversed — the default — and check.
    fireEvent.click(screen.getByText('Athuga jöfnuna'));
    expect(screen.queryByText(/Jafnan stemmir/)).toBeNull();
    expect(screen.getByText(/er ekki markjafnan enn/)).toBeTruthy();
  });

  it('shows the composed equation changing as the student works', () => {
    // The point of the panel: a student sees what their operations produce
    // before committing, which is what makes stage one a construction rather
    // than a guess.
    openCoupledTask();
    const before = screen.getByText(/Jafnan eins og þú stilltir hana/).parentElement!.textContent;
    fireEvent.click(within(givenCards()[0]).getByText('Snúa við'));
    const after = screen.getByText(/Jafnan eins og þú stilltir hana/).parentElement!.textContent;
    expect(after).not.toBe(before);
  });
});
