// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Level2 } from '../components/Level2';

/**
 * After a boiling-point ranking, Level 2 draws one bar per compound and printed its
 * temperature inside the bar, right-aligned. The bar's track clips its contents, and on a
 * phone the track is ~170 px wide, so a cold compound's bar is a dozen pixels: CH₄'s
 * '-161°C' showed as 'C' and HCl's '-85°C' as '85°C' — the minus sign cut off, turning a
 * temperature below zero into one above it.
 *
 * On phones the temperature now sits in its own grid column beside the bar. This test holds
 * the structural half of that (jsdom has no layout, so it cannot see the clipping itself):
 * every temperature must also be printed somewhere no clipping track can cut it.
 */
describe('Level 2 boiling-point bars', () => {
  it('prints each temperature outside the clipping bar track', () => {
    const { container } = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);

    // Problem 1: place the three compounds in any order and check.
    const pool = () =>
      [
        ...view.getByText('Tiltæk efni:').parentElement!.querySelectorAll('button'),
      ] as HTMLElement[];
    while (pool().length > 0) fireEvent.click(pool()[0]);
    fireEvent.click(view.getByRole('button', { name: 'Athuga röðun' }));

    for (const temp of ['-161°C', '-85°C', '100°C']) {
      const hits = view.getAllByText(temp);
      const unclipped = hits.filter((el) => !el.closest('.overflow-hidden'));
      expect(unclipped, temp).toHaveLength(1);
    }
  });
});
