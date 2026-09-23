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
