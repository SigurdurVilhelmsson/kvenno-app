// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { Level2 } from '../components/Level2';

/**
 * Every molecule Stig 2 offers in the drag builder must be buildable from the parts it offers.
 *
 * The builder concatenated the chip labels, so `eth-` + `-an` built `ethan`, and the grader,
 * comparing against `etan`, marked it wrong — etan, eten and etýn had no correct build at all,
 * and a student who did everything right on three of the first eight molecules was told
 * "Rangt". The chips still read `eth-`; the built name now takes the stem the answer is
 * spelled with, which is how the textbook and this level's own answer key write it.
 *
 * The parts for each molecule are written out here rather than derived, so the test does not
 * grade itself. Molecules 13–15 are branched and open in typing mode only, so the walk stops
 * at 12. Queries are scoped to the rendered container: the repo runs vitest with retries and
 * no RTL auto-cleanup.
 */

const BUILDS: { name: string; parts: [label: string, zone: string][] }[] = [
  {
    name: 'etan',
    parts: [
      ['eth-', 'zone-prefix'],
      ['-an', 'zone-suffix'],
    ],
  },
  {
    name: 'bútan',
    parts: [
      ['but-', 'zone-prefix'],
      ['-an', 'zone-suffix'],
    ],
  },
  {
    name: 'hexan',
    parts: [
      ['hex-', 'zone-prefix'],
      ['-an', 'zone-suffix'],
    ],
  },
  {
    name: 'eten',
    parts: [
      ['eth-', 'zone-prefix'],
      ['-en', 'zone-suffix'],
    ],
  },
  {
    name: 'própen',
    parts: [
      ['prop-', 'zone-prefix'],
      ['-en', 'zone-suffix'],
    ],
  },
  {
    name: '1-búten',
    parts: [
      ['1-', 'zone-position'],
      ['but-', 'zone-prefix'],
      ['-en', 'zone-suffix'],
    ],
  },
  {
    name: '2-búten',
    parts: [
      ['2-', 'zone-position'],
      ['but-', 'zone-prefix'],
      ['-en', 'zone-suffix'],
    ],
  },
  {
    name: 'etýn',
    parts: [
      ['eth-', 'zone-prefix'],
      ['-ýn', 'zone-suffix'],
    ],
  },
  {
    name: 'própýn',
    parts: [
      ['prop-', 'zone-prefix'],
      ['-ýn', 'zone-suffix'],
    ],
  },
  {
    name: '1-bútýn',
    parts: [
      ['1-', 'zone-position'],
      ['but-', 'zone-prefix'],
      ['-ýn', 'zone-suffix'],
    ],
  },
  {
    name: '2-pentýn',
    parts: [
      ['2-', 'zone-position'],
      ['pent-', 'zone-prefix'],
      ['-ýn', 'zone-suffix'],
    ],
  },
  {
    name: '1-penten',
    parts: [
      ['1-', 'zone-position'],
      ['pent-', 'zone-prefix'],
      ['-en', 'zone-suffix'],
    ],
  },
];

describe('Stig 2 drag builder: every unbranched molecule can be built correctly', () => {
  it('accepts the right parts for all twelve, and shows the name they spell', () => {
    const rendered = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(rendered.container);
    fireEvent.click(ui.getByRole('button', { name: /Nefna sameindir/ }));

    const zone = (id: string) =>
      rendered.container.querySelector(`[data-zone-id="${id}"]`) as HTMLElement;
    const pool = () => rendered.container.querySelector('[data-drop-pool]') as HTMLElement;
    const builtName = () =>
      ui.getByText('Nafnið sem þú byggir:').nextElementSibling!.textContent!.trim();

    for (const [index, build] of BUILDS.entries()) {
      expect(ui.getByText(new RegExp(`Sameind ${index + 1} af`))).toBeTruthy();
      for (const [label, zoneId] of build.parts) {
        fireEvent.click(within(pool()).getByRole('button', { name: label }));
        fireEvent.click(zone(zoneId));
      }
      expect(builtName(), `molecule ${index + 1}`).toBe(build.name);

      fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));
      // "Næsta sameind" is offered only after a correct answer
      fireEvent.click(ui.getByRole('button', { name: /Næsta sameind/ }));
    }
  });
});
