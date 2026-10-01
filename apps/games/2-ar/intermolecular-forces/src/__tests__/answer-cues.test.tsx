// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level1 } from '../components/Level1';

/**
 * Stig 1 asks which forces act in a molecule, and polarity plus an H–F/O/N bond decide the
 * answer completely. The card used to print both beside the question: a `⚡ Skautuð` /
 * `○ Óskautuð` badge, a `🔗 H-F/O/N tengi` badge only where there was one, and δ labels only
 * on polar molecules. The hint named the polarity too, and mentioned H–F/O/N only where it
 * applied (decisions item 72).
 *
 * Now the badges wait for the check, and the hint is the same for every molecule. The
 * molecule's shape stays on screen in 2D and 3D, which is the route to the answer.
 */

clockPastNextGuard();

const BADGES = ['⚡ Skautuð', '○ Óskautuð', '🔗 H-F/O/N tengi'];

describe('Stig 1 shows nothing that decides the answer before it is checked', () => {
  it('on every molecule: no polarity or H-bond badge, and one hint for all', () => {
    const { container } = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    fireEvent.click(view.getByRole('button', { name: /Hefja æfingar/ }));

    const hints = new Set<string>();
    let polarSeen = 0;
    let hBondSeen = 0;
    for (let i = 0; i < 10; i++) {
      const formula = container.querySelector('.text-4xl')!.textContent!;
      for (const badge of BADGES) {
        expect(view.queryByText(badge), `${formula}: ${badge} before the check`).toBeNull();
      }

      fireEvent.click(view.getByRole('button', { name: 'Sýna vísbendingu' }));
      hints.add(view.getByText('Vísbending:').parentElement!.textContent!);

      fireEvent.click(view.getByRole('button', { name: /London dreifikraftar/ }));
      fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));
      // After the check the badges come back, so the corrected answer still says why.
      const shown = BADGES.filter((badge) => view.queryByText(badge));
      expect(shown.length, `${formula}: badges after the check`).toBeGreaterThan(0);
      if (shown.includes('⚡ Skautuð')) polarSeen++;
      if (shown.includes('🔗 H-F/O/N tengi')) hBondSeen++;

      if (i < 9) fireEvent.click(view.getByRole('button', { name: 'Næsta sameind' }));
    }

    expect(hints.size).toBe(1);
    // Holds the test to a pool that has both kinds, so the checks above are not vacuous.
    expect(polarSeen).toBeGreaterThan(0);
    expect(polarSeen).toBeLessThan(10);
    expect(hBondSeen).toBeGreaterThan(0);
  });
});
