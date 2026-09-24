// @vitest-environment jsdom
/**
 * C2's verdict under the fraction the student builds.
 *
 * The line printed `= {'1 ✓' or '≠ 1'}`, so every fraction that is not 1 read
 * `= ≠ 1` — "equals not-equal-to one" — directly under the fraction bar. It now
 * reads `≠ 1` for a fraction that is not a conversion factor and `= 1 ✓` for
 * one that is. Queries are scoped to this test's container (the repo runs
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

  it('writes = 1 ✓ under a conversion factor', () => {
    const { container } = render(<FactorBuildingChallenge onComplete={noop} onAttempt={noop} />);
    const ui = within(container);
    fireEvent.click(ui.getByRole('button', { name: /^1000 mL$/ }));
    fireEvent.click(ui.getByRole('button', { name: /^1 L$/ }));
    expect(ui.getByText('= 1 ✓')).toBeTruthy();
  });
});
