import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { COMPOUNDS } from '../data/compounds';

/**
 * "Þú varst nálægt" marks in red the letters of the student's name that differ
 * from the right one. It compared the two strings position by position, so one
 * missing or extra character shifted everything after it: building
 * Járn(II)nítrat for Járn(III)nítrat painted `)nítrat` red — seven letters the
 * student got right — under a note saying red shows the letters that differ.
 * In this level a near miss is almost always a part too many or too few, so
 * the shift was the usual case rather than the edge case.
 *
 * The compound and the tray are fixed here so the run is deterministic.
 */

const IRON_NITRATE = COMPOUNDS.find((c) => c.formula === 'Fe(NO₃)₃')!;

vi.mock('../utils/nameParts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../utils/nameParts')>()),
  selectCompounds: () => [IRON_NITRATE],
  generateParts: () => [
    { id: 'a', text: 'járn', kind: 'root' },
    { id: 'b', text: '(II)', kind: 'charge' },
    { id: 'c', text: 'nítrat', kind: 'ion' },
    { id: 'd', text: '(III)', kind: 'charge' },
    { id: 'e', text: 'nítrít', kind: 'ion' },
  ],
}));

const { Level3, alignNames } = await import('../components/Level3');
const { buildablePool } = await import('../utils/nameParts');

const t = (_key: string, fallback?: string) => fallback ?? '';

function build(parts: string[]) {
  const { container } = render(<Level3 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
  const tray = within(container).getByText('Tiltækir partar:').parentElement as HTMLElement;
  for (const text of parts) fireEvent.click(within(tray).getByRole('button', { name: text }));
  fireEvent.click(within(container).getByRole('button', { name: 'Athuga' }));
  const line = within(container).getByText('Þú skrifaðir:', { exact: false });
  const red = Array.from(line.querySelectorAll('span.text-red-700'))
    .map((s) => s.textContent)
    .join('');
  const shown = line.querySelector('span')?.textContent ?? '';
  return { red, shown };
}

describe('Level 3 near-miss highlighting', () => {
  it('a missing character marks only the gap, not everything after it', () => {
    expect(IRON_NITRATE.name).toBe('Járn(III)nítrat');
    const { red, shown } = build(['járn', '(II)', 'nítrat']);
    expect(red).toBe('·');
    // Every letter the student built is still shown, plus the one marker.
    expect(shown.replace('·', '')).toBe('Járn(II)nítrat');
  });

  it('a wrong character marks only that character', () => {
    // Same length, so position-by-position happened to get this one right.
    const { red, shown } = build(['járn', '(III)', 'nítrít']);
    expect(red).toBe('í');
    expect(shown).toBe('Járn(III)nítrít');
  });

  it('over every name in the pool, a single edit marks exactly one character', () => {
    for (const { name } of buildablePool()) {
      for (let k = 0; k < name.length; k++) {
        const edits = [
          name.slice(0, k) + name.slice(k + 1), // a character missing
          name.slice(0, k) + '#' + name.slice(k), // a character extra
          name.slice(0, k) + '#' + name.slice(k + 1), // one wrong
        ];
        for (const built of edits) {
          const aligned = alignNames(built, name);
          expect(
            aligned.filter((c) => !c.ok),
            `${built} for ${name}`
          ).toHaveLength(1);
          // What is shown is the student's own name, plus at most the marker.
          expect(
            aligned
              .map((c) => c.ch)
              .join('')
              .replace('·', '')
          ).toBe(built);
        }
      }
    }
  });
});
