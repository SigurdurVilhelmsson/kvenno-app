// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

import { PeriodicTable } from '../components/PeriodicTable';

/**
 * The element detail panel's close button was a bare `×`, so a screen reader
 * announced it as "times" (or "multiplication sign"). The modal's own close
 * button already carried `Loka lotukerfinu`.
 */

afterEach(cleanup);

describe('periodic table detail panel', () => {
  it('has a close button with an Icelandic name', () => {
    const onClose = vi.fn();
    const { container } = render(<PeriodicTable onClose={onClose} />);
    const ui = within(container);

    fireEvent.click(ui.getAllByRole('button', { name: /Súrefni|^8\s*O/ })[0]);
    const close = ui.getByRole('button', { name: 'Loka nánari upplýsingum' });

    fireEvent.click(close);
    expect(ui.queryByRole('button', { name: 'Loka nánari upplýsingum' })).toBeNull();
    // Closing the panel is not closing the table.
    expect(onClose).not.toHaveBeenCalled();
  });
});

/**
 * The legend's words, ruled 2026-10-02 (decisions items 21 and 35): post-transition metals are
 * `tregir málmar`, not the coined `P-málmar`, and the plain-nonmetal swatch reads
 * `Aðrir málmleysingjar`, because the halogens and noble gases beside it are málmleysingjar too.
 */
describe('periodic table legend', () => {
  it('names the categories as ruled', () => {
    const { container } = render(<PeriodicTable onClose={() => {}} />);
    const text = container.textContent ?? '';
    expect(text).toContain('Tregir málmar');
    expect(text).toContain('Aðrir málmleysingjar');
    expect(text).not.toMatch(/P-málm/);
  });
});
