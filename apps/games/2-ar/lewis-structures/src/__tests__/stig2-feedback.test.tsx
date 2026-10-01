// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { pastExample } from './past-example';
import { Level2 } from '../components/Level2';
import { LewisDrawingCanvas } from '../components/LewisDrawingCanvas';

/**
 * Stig 2 after the 2026-09-30 design review.
 *
 *  - A wrong drawing is answered by the rule it breaks, not by the key. The key
 *    ("… → ætti að vera …") is offered only after a second wrong check, behind
 *    "Sýna lausn".
 *  - There is no running score. The level reports how many molecules were drawn
 *    right without opening the solution; the walkthrough is worth nothing.
 *
 * Queries are scoped to each rendered container, since the suite runs with retries.
 */

afterEach(cleanup);
clockPastNextGuard();

const WATER = {
  centralAtom: 'O',
  surroundingAtoms: [
    { symbol: 'H', bondType: 'single' as const, lonePairs: 0 },
    { symbol: 'H', bondType: 'single' as const, lonePairs: 0 },
  ],
  centralLonePairs: 2,
};

describe('the drawing board’s feedback', () => {
  const renderWater = () => {
    const onSolutionShown = vi.fn();
    const { container } = render(
      <LewisDrawingCanvas
        molecule="H₂O"
        totalElectrons={8}
        correctStructure={WATER}
        onComplete={vi.fn()}
        onSolutionShown={onSolutionShown}
      />
    );
    const ui = within(container);
    // Both bonds single, no pairs yet: O is four electrons short.
    for (const bond of ui.getAllByRole('button', { name: /^Tengi \d af 2/ })) fireEvent.click(bond);
    return { ui, container, onSolutionShown };
  };

  it('diagnoses a wrong drawing without giving the answer', () => {
    const { ui, container } = renderWater();
    fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
    expect(container.textContent).toContain(
      'O hefur 4 rafeindir í kringum sig — áttureglan krefst 8.'
    );
    // Before: "• O: 0 pör → ætti að vera 2".
    expect(container.textContent).not.toContain('ætti að vera');
    expect(ui.queryByRole('button', { name: 'Sýna lausn' })).toBeNull();
  });

  it('offers the solution after a second miss, and reports that it was opened', () => {
    const { ui, onSolutionShown } = renderWater();
    fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
    fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
    fireEvent.click(ui.getByRole('button', { name: 'Sýna lausn' }));
    expect(onSolutionShown).toHaveBeenCalledOnce();
    const solution = ui.getByRole('group', { name: 'Lausn' });
    expect(solution.textContent).toContain('O: 0 pör → ætti að vera 2');
  });
});

/** Each molecule's drawing: clicks per bond (1 single, 2 double), then pairs. */
const DRAWINGS: { bonds: number[]; central: number; outer: Record<string, number> }[] = [
  { bonds: [1, 1], central: 2, outer: {} }, // H₂O
  { bonds: [1, 1, 1], central: 1, outer: {} }, // NH₃
  { bonds: [2, 2], central: 0, outer: { 'O₁': 2, 'O₂': 2 } }, // CO₂
  { bonds: [1, 1, 1, 1], central: 0, outer: {} }, // CH₄
  { bonds: [2], central: 1, outer: { O: 2 } }, // NO
  { bonds: [1], central: 3, outer: {} }, // HCl
  { bonds: [1, 1, 1], central: 0, outer: { 'F₁': 3, 'F₂': 3, 'F₃': 3 } }, // BF₃
  {
    bonds: [1, 1, 1, 1, 1],
    central: 0,
    outer: { 'Cl₁': 3, 'Cl₂': 3, 'Cl₃': 3, 'Cl₄': 3, 'Cl₅': 3 },
  }, // PCl₅
  {
    bonds: [1, 1, 1, 1, 1, 1],
    central: 0,
    outer: { 'F₁': 3, 'F₂': 3, 'F₃': 3, 'F₄': 3, 'F₅': 3, 'F₆': 3 },
  }, // SF₆
];

describe('Stig 2 counts molecules, not points', () => {
  const play = (openSolutionOnFirst: boolean) => {
    const onComplete = vi.fn();
    const { container } = render(<Level2 onComplete={onComplete} onBack={vi.fn()} />);
    pastExample(container);
    const ui = within(container);
    // No running score anywhere on the level.
    expect(container.textContent).not.toMatch(/\d+ stig\b/);

    DRAWINGS.forEach((d, m) => {
      if (m === 0 && openSolutionOnFirst) {
        fireEvent.click(ui.getAllByRole('button', { name: /^Tengi 1 af/ })[0]);
        fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
        fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
        fireEvent.click(ui.getByRole('button', { name: 'Sýna lausn' }));
        fireEvent.click(ui.getByRole('button', { name: 'Hreinsa' }));
      }
      d.bonds.forEach((clicks, i) => {
        const bond = ui.getByRole('button', { name: new RegExp(`^Tengi ${i + 1} af`) });
        for (let c = 0; c < clicks; c++) fireEvent.click(bond);
      });
      const centralPlus = ui.getByRole('button', { name: /^Bæta stöku pari við .* \(miðatóm\)$/ });
      for (let c = 0; c < d.central; c++) fireEvent.click(centralPlus);
      for (const [atom, pairs] of Object.entries(d.outer)) {
        const plus = ui.getByRole('button', { name: `Bæta stöku pari við ${atom} (ytri)` });
        for (let c = 0; c < pairs; c++) fireEvent.click(plus);
      }
      fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
      expect(ui.getByText('Rétt!'), `molecule ${m + 1}`).toBeTruthy();
      expect(container.textContent).not.toMatch(/\+\d+ stig/);
      fireEvent.click(ui.getByRole('button', { name: /Næsta sameind|Ljúka stigi 2/ }));
    });
    return onComplete;
  };

  it('reports every molecule drawn unaided', () => {
    expect(play(false)).toHaveBeenCalledWith(9, 9);
  });

  it('does not count a molecule solved with the solution open', () => {
    expect(play(true)).toHaveBeenCalledWith(8, 9);
  });
});
