import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App';
import { clockPastNextGuard } from './next-guard-clock';
import { BeitaScreen } from '../components/BeitaScreen';
import { SCENARIOS } from '../data/problems';

clockPastNextGuard();

/**
 * No running tally in Beita — mobile-pass decision 1 (b). The counter read
 * `Dæmi 3 af 12 · 2 leyst` as the student went; it now reads `Dæmi 3 af 12`,
 * the run ends with `N af M rétt`, and the menu's Beita card shows that count.
 *
 * A wrong step ends a scenario with the answer shown and nothing is retried,
 * so every scenario solved counts. Queries are scoped to the rendered
 * container (vitest runs with `retry: 2` and no RTL auto-cleanup).
 */

beforeEach(() => {
  localStorage.clear();
  window.scrollBy = vi.fn() as unknown as typeof window.scrollBy;
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

function currentScenario(container: HTMLElement) {
  const line = container.querySelector('p.text-xl')!.textContent!;
  return SCENARIOS.find(
    (s) =>
      line === `${s.reaction.reactants[0].formula}(aq) + ${s.reaction.reactants[1].formula}(aq)`
  )!;
}

/** Play the run, answering the prediction wrong on the first `wrong` scenarios. */
function play(root: HTMLElement, wrong: number) {
  const ui = within(root);
  for (let n = 0; n < SCENARIOS.length; n++) {
    expect(root.textContent).not.toMatch(/\d+ leyst/);
    const { reaction } = currentScenario(root);
    const says = n < wrong ? !reaction.formsPrecipitate : reaction.formsPrecipitate;
    fireEvent.click(
      ui.getByRole('button', { name: says ? 'Já, botnfall myndast' : 'Nei, ekkert gerist' })
    );
    if (says && n >= wrong) {
      fireEvent.click(ui.getByRole('button', { name: reaction.precipitates[0].formula }));
      for (const term of reaction.net.left) {
        for (let k = 0; k < term.coefficient; k++) {
          fireEvent.click(ui.getByRole('button', { name: `Fjölga ${term.species}` }));
        }
      }
      fireEvent.click(ui.getByRole('button', { name: 'Athuga jöfnuna' }));
    }
    expect(root.textContent).not.toMatch(/\d+ leyst/);
    if (n + 1 < SCENARIOS.length) {
      expect(root.textContent).not.toMatch(/\d+ af \d+ rétt/);
      fireEvent.click(ui.getByRole('button', { name: 'Næsta dæmi' }));
    }
  }
}

describe('Beita reports a count at the end, not as it goes', () => {
  it('ends with "N af M rétt" and reports it', () => {
    const onComplete = vi.fn();
    const { container, unmount } = render(
      <BeitaScreen onComplete={onComplete} onBack={() => {}} />
    );
    play(container, 3);
    const right = SCENARIOS.length - 3;
    expect(container.textContent).toContain(`${right} af ${SCENARIOS.length} rétt`);
    fireEvent.click(within(container).getByRole('button', { name: 'Ljúka' }));
    expect(onComplete).toHaveBeenCalledWith(right, SCENARIOS.length);
    unmount();
  });

  it('shows the count on the menu’s Beita card', () => {
    const { container, unmount } = render(<App />);
    const ui = within(container);
    fireEvent.click(ui.getByRole('button', { name: /Beita/ }));
    play(container, 2);
    fireEvent.click(ui.getByRole('button', { name: 'Ljúka' }));
    const card = container.querySelector('[data-phase-card="beita"]')!;
    expect(card.textContent).toContain(`${SCENARIOS.length - 2} af ${SCENARIOS.length} rétt`);
    unmount();
  }, 30_000);

  it('shows "Lokið" for a run finished before counts were kept', () => {
    localStorage.setItem('utfellingarhvorf-progress', JSON.stringify({ completed: ['beita'] }));
    const { container, unmount } = render(<App />);
    const card = container.querySelector('[data-phase-card="beita"]')!;
    expect(card.textContent).toContain('Lokið');
    expect(card.textContent).not.toMatch(/af \d+ rétt/);
    unmount();
  });
});
