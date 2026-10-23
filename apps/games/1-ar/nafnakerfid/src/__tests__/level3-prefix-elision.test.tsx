import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { COMPOUNDS } from '../data/compounds';

clockPastNextGuard();

/**
 * Decision 37. `data/naming.ts` makes `tetroxíð` one part, so Level 3's target
 * for N₂O₄ is `Díniturtetroxíð`. But the tray can offer `tetra` and `oxíð` as
 * distractors beside it, and the textbook (ch02/m68698) lets a student keep the
 * prefix vowel or drop it. A student who built `Díniturtetraoxíð` was told they
 * were close and shown the `a` in red. Level 2 already accepted both forms;
 * Level 3 now folds the vowel the same way.
 *
 * The compound and the tray are fixed here so the run is deterministic.
 */

const N2O4 = COMPOUNDS.find((c) => c.formula === 'N₂O₄')!;

vi.mock('../utils/nameParts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../utils/nameParts')>()),
  selectCompounds: () => [N2O4],
  generateParts: () => [
    { id: 'a', text: 'dí', kind: 'prefix' },
    { id: 'b', text: 'nitur', kind: 'root' },
    { id: 'c', text: 'tetroxíð', kind: 'root' },
    { id: 'd', text: 'tetra', kind: 'prefix' },
    { id: 'e', text: 'oxíð', kind: 'root' },
    { id: 'f', text: 'penta', kind: 'prefix' },
  ],
}));

const { Level3 } = await import('../components/Level3');

const t = (_key: string, fallback?: string) => fallback ?? '';

/** Build `parts` for N₂O₄, check, finish the one-question run, and report. */
function build(parts: string[]) {
  const onComplete = vi.fn();
  const { container } = render(<Level3 t={t} onComplete={onComplete} onBack={vi.fn()} />);
  const view = within(container);
  const tray = view.getByText('Tiltækir partar:').parentElement as HTMLElement;
  for (const text of parts) fireEvent.click(within(tray).getByRole('button', { name: text }));
  fireEvent.click(view.getByRole('button', { name: 'Athuga' }));
  const text = container.textContent ?? '';
  fireEvent.click(view.getByRole('button', { name: 'Sjá niðurstöður' }));
  return {
    wrong: text.includes('Rétt nafn:') || text.includes('Þú varst nálægt'),
    counted: onComplete.mock.calls[0]?.[0] === 1,
  };
}

describe('Level 3 on N₂O₄', () => {
  it('targets the elided name', () => {
    expect(N2O4.name).toBe('Díniturtetroxíð');
  });

  it('accepts the name built with the prefix vowel kept', () => {
    expect(build(['dí', 'nitur', 'tetra', 'oxíð'])).toEqual({ wrong: false, counted: true });
  });

  it('still accepts the elided name', () => {
    expect(build(['dí', 'nitur', 'tetroxíð'])).toEqual({ wrong: false, counted: true });
  });

  it('still rejects a wrong prefix, with or without its vowel', () => {
    expect(build(['dí', 'nitur', 'penta', 'oxíð'])).toEqual({ wrong: true, counted: false });
    expect(build(['nitur', 'tetra', 'oxíð'])).toEqual({ wrong: true, counted: false });
  });
});
