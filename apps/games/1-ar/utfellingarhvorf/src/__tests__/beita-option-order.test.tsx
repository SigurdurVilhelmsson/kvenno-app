import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { BeitaScreen } from '../components/BeitaScreen';
import { PRECIPITATING, SCENARIOS } from '../data/problems';

clockPastNextGuard();

/**
 * "Hvort efnið fellur út?" offered the two possible products in data order,
 * and every precipitating scenario is written with the precipitating cation in
 * the first bottle — so the precipitate was the left-hand button on all twelve,
 * and "tap the left one" passed the question without reading a rule. The
 * buttons now shuffle per scenario, the idiom `docs/README.md` records for
 * `2-ar/kinetics` and `2-ar/organic-nomenclature`.
 *
 * Grading compares formulas, not positions, so no answer key moved. These tests
 * play the real component through every scenario and click by formula.
 *
 * Queries are scoped to the rendered container rather than `screen`: the repo
 * runs vitest with `retry: 2` and no RTL auto-cleanup, so a failed attempt
 * leaves its DOM behind.
 */

beforeEach(() => {
  window.scrollBy = vi.fn() as unknown as typeof window.scrollBy;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** The scenario on screen, identified by the reactant line on its card. */
function currentScenario(container: HTMLElement) {
  const line = container.querySelector('p.text-xl')!.textContent!;
  const found = SCENARIOS.find(
    (s) =>
      line === `${s.reaction.reactants[0].formula}(aq) + ${s.reaction.reactants[1].formula}(aq)`
  );
  if (!found) throw new Error(`no scenario matches the card "${line}"`);
  return found;
}

/**
 * Play every scenario correctly, clicking by formula, and return where the
 * precipitate sat among the two identify buttons each time.
 */
function playRun(): number[] {
  const { container, unmount } = render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
  const ui = within(container);
  const positions: number[] = [];

  for (let n = 0; n < SCENARIOS.length; n++) {
    const { reaction, id } = currentScenario(container);

    if (!reaction.formsPrecipitate) {
      fireEvent.click(ui.getByRole('button', { name: 'Nei, ekkert gerist' }));
    } else {
      fireEvent.click(ui.getByRole('button', { name: 'Já, botnfall myndast' }));

      const offered = reaction.products.map((p) => p.formula);
      const buttons = ui
        .getAllByRole('button')
        .filter((b) => offered.includes(b.textContent!.trim()));
      expect(buttons.map((b) => b.textContent!.trim()).sort(), id).toEqual([...offered].sort());

      const answer = reaction.precipitates[0].formula;
      positions.push(buttons.findIndex((b) => b.textContent!.trim() === answer));
      fireEvent.click(ui.getByRole('button', { name: answer }));
      expect(ui.getByText('Byggðu nettójónajöfnuna.'), id).toBeTruthy();

      for (const term of reaction.net.left) {
        for (let k = 0; k < term.coefficient; k++) {
          fireEvent.click(ui.getByRole('button', { name: `Fjölga ${term.species}` }));
        }
      }
      fireEvent.click(ui.getByRole('button', { name: 'Athuga jöfnuna' }));
    }

    expect(ui.getByText('Rétt.'), `${id} was answered correctly and not marked so`).toBeTruthy();
    const next = n + 1 < SCENARIOS.length ? 'Næsta dæmi' : 'Ljúka';
    fireEvent.click(ui.getByRole('button', { name: next }));
  }

  unmount();
  return positions;
}

describe('the data the identify step draws from', () => {
  it('still lists the precipitate first in every scenario', () => {
    // Not a defect in itself — it is why the rendering must shuffle. If the data
    // is ever reordered instead, this says so rather than going vacuous.
    for (const s of PRECIPITATING) {
      expect(
        s.reaction.precipitates.map((p) => p.formula),
        s.id
      ).toEqual([s.reaction.products[0].formula]);
    }
  });
});

describe('Beita: which product precipitates is not given away by position', () => {
  it('does not always put the precipitate on the same button', () => {
    // Twelve precipitating scenarios, played twice: without a shuffle every
    // position is 0; with one, all 24 landing on the same side is 2^-23.
    // Two full runs through the real component take about 10 s on their own,
    // which is the suite's default timeout, hence the explicit one below.
    const positions = [...playRun(), ...playRun()];
    expect(positions.length).toBe(2 * PRECIPITATING.length);
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect(new Set(positions).size, 'the precipitate is always the same button').toBe(2);
  }, 60_000);

  it('grades by formula, so the other product is wrong wherever it is shown', () => {
    for (let mount = 0; mount < 6; mount++) {
      const { container, unmount } = render(
        <BeitaScreen onComplete={() => {}} onBack={() => {}} />
      );
      const ui = within(container);
      const { reaction } = currentScenario(container);
      fireEvent.click(ui.getByRole('button', { name: 'Já, botnfall myndast' }));
      const other = reaction.products.find((p) => !reaction.precipitates.includes(p))!;
      fireEvent.click(ui.getByRole('button', { name: other.formula }));
      expect(ui.getByText('Það er hitt efnið sem fellur út.')).toBeTruthy();
      unmount();
    }
  });
});
