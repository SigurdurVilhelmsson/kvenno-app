// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { Level2, molecules } from '../components/Level2';

/**
 * Stig 2's `Útskýring` built a name from the chain length and the bond type only, so for the
 * three branched molecules it explained a different, unbranched one: 2-metýlprópan read
 * `prop (3 kolefni) + an` (decisions item 92). It now adds each branch and its position, and
 * says the prefix counts the longest chain rather than every carbon. Queries are scoped to the
 * rendered container (vitest `retry: 2`, no RTL auto-cleanup).
 */

clockPastNextGuard();
afterEach(cleanup);

const BRANCHED: [name: string, branch: string, chain: number, total: number][] = [
  ['2-metýlprópan', '+ metýlgrein á kolefni 2', 3, 4],
  ['2-metýlbútan', '+ metýlgrein á kolefni 2', 4, 5],
  ['3-metýlpentan', '+ metýlgrein á kolefni 3', 5, 6],
];

function explanation(container: HTMLElement): string {
  const heading = [...container.querySelectorAll('div')].find(
    (d) => d.textContent === 'Útskýring:'
  );
  return (heading?.parentElement?.textContent ?? '').replace(/\s+/g, ' ');
}

describe('Stig 2 explains a branched name with its branch', () => {
  it('names the branch, its carbon, and which chain the prefix counts', () => {
    const { container } = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(container);
    fireEvent.click(ui.getByRole('button', { name: /Nefna sameindir/ }));

    const seen: string[] = [];
    for (const molecule of molecules) {
      const field = container.querySelector<HTMLInputElement>('input[type=text]');
      if (field) {
        fireEvent.change(field, { target: { value: molecule.correctName } });
        fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
      } else {
        // Unbranched molecules start in the drag builder; any build reaches the feedback.
        const pool = container.querySelector('[data-drop-pool]') as HTMLElement;
        for (const [label, zone] of [
          ['meth-', 'zone-prefix'],
          ['-an', 'zone-suffix'],
        ]) {
          fireEvent.click(within(pool).getByRole('button', { name: label }));
          fireEvent.click(container.querySelector(`[data-zone-id="${zone}"]`) as HTMLElement);
        }
        fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
      }
      const text = explanation(container);
      expect(text, molecule.correctName).not.toBe('');
      const branched = BRANCHED.find(([name]) => name === molecule.correctName);
      if (branched) {
        const [name, branch, chain, total] = branched;
        expect(text, name).toContain(branch);
        expect(text, name).toContain(
          `Forskeytið telur kolefnin í lengstu keðjunni, ${chain}, ekki öll ${total} kolefnin í sameindinni.`
        );
        seen.push(name);
      } else {
        expect(text, molecule.correctName).not.toMatch(/grein|lengstu/);
      }
      const next = ui.queryByRole('button', { name: /Næsta sameind|Halda áfram|Ljúka stigi/ });
      if (next) fireEvent.click(next);
    }
    expect(seen).toEqual(BRANCHED.map(([name]) => name));
  });
});
