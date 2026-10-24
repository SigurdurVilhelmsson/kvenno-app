// @vitest-environment jsdom
/**
 * C2's verdict under the fraction the student builds.
 *
 * The line printed `= {'1 ✓' or '≠ 1'}`, so every fraction that is not 1 read
 * `= ≠ 1` — "equals not-equal-to one" — directly under the fraction bar. It now
 * reads `≠ 1` for a fraction that is not 1, `= 1` in red for a block over
 * itself, which is 1 but no conversion, and `= 1 ✓` for a conversion factor.
 * Queries are scoped to this test's container (the repo runs
 * vitest with `retry: 2`).
 */

import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { FactorBuildingChallenge } from '../components/challenges/FactorBuildingChallenge';

afterEach(cleanup);

const noop = () => {};

describe('C2 states its verdict in well-formed notation', () => {
  it('writes ≠ 1, not = ≠ 1, under a fraction that is not a conversion factor', () => {
    const { container } = render(<FactorBuildingChallenge onComplete={noop} onAttempt={noop} />);
    const ui = within(container);
    const block = (name: RegExp) => fireEvent.click(ui.getByRole('button', { name }));

    block(/^1 L$/);
    block(/^0[.,]5 L$/);
    expect(ui.getByText('Sömu einingarnar!')).toBeTruthy();
    expect(ui.getByText('≠ 1')).toBeTruthy();
    expect(container.textContent).not.toMatch(/=\s*≠/);

    block(/^1000 mL$/); // a third tap starts a new fraction
    block(/^0[.,]5 L$/);
    expect(ui.getByText('Ekki sama rúmmálið!')).toBeTruthy();
    expect(ui.getByText('≠ 1')).toBeTruthy();
    expect(container.textContent).not.toMatch(/=\s*≠/);
  });

  // Decisions item 25 (a): one block over itself really is 1, just not a
  // conversion. The line read `≠ 1` directly above the error box's own
  // `1 L / 1 L = 1,0`, so the screen contradicted itself.
  it.each([/^1 L$/, /^1000 mL$/, /^0[.,]5 L$/])(
    'writes = 1, in red and without the tick, under %s over itself',
    (name) => {
      const { container } = render(<FactorBuildingChallenge onComplete={noop} onAttempt={noop} />);
      const ui = within(container);
      fireEvent.click(ui.getByRole('button', { name }));
      fireEvent.click(ui.getByRole('button', { name }));
      expect(ui.getByText('Sömu einingarnar!')).toBeTruthy();
      const verdict = ui.getByText('= 1');
      expect(verdict.className).toMatch(/text-red-600/);
      expect(ui.queryByText('≠ 1')).toBeNull();
      expect(ui.queryByText('= 1 ✓')).toBeNull();
    }
  );

  it('writes = 1 ✓ under a conversion factor', () => {
    const { container } = render(<FactorBuildingChallenge onComplete={noop} onAttempt={noop} />);
    const ui = within(container);
    fireEvent.click(ui.getByRole('button', { name: /^1000 mL$/ }));
    fireEvent.click(ui.getByRole('button', { name: /^1 L$/ }));
    expect(ui.getByText('= 1 ✓')).toBeTruthy();
  });
});
