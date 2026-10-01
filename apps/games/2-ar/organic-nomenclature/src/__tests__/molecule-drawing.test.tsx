// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AnimatedMolecule } from '@shared/components';

import { molecules } from '../components/Level2';
import { organicToMolecule } from '../utils/organicConverter';

/**
 * Stig 2 draws every molecule it asks about. The September mobile pass recorded atoms
 * overlapping from four carbons up (docs/REVIEW-QUEUE.md D1), and the branched-molecule
 * positions added since were never checked against it. This draws each molecule exactly as
 * the level does and measures the atom circles: no two may overlap.
 */

afterEach(cleanup);

interface Circle {
  label: string;
  x: number;
  y: number;
  r: number;
}

function atoms(container: HTMLElement): Circle[] {
  return [...container.querySelectorAll('g.molecule-atom')].map((g) => {
    const c = g.querySelector('circle')!;
    return {
      label: g.querySelector('text')?.textContent ?? '?',
      x: Number(c.getAttribute('cx')),
      y: Number(c.getAttribute('cy')),
      r: Number(c.getAttribute('r')),
    };
  });
}

describe('Stig 2 molecule drawings', () => {
  it.each(molecules.map((m) => [m.correctName, m] as const))(
    '%s: no two atoms overlap',
    (_name, molecule) => {
      const { container } = render(
        <AnimatedMolecule
          molecule={organicToMolecule(molecule)}
          mode="organic"
          size="lg"
          animation="none"
          showAtomLabels={true}
          fit
        />
      );
      const drawn = atoms(container);
      expect(drawn.length).toBeGreaterThanOrEqual(molecule.carbons);
      const clashes: string[] = [];
      for (let i = 0; i < drawn.length; i++) {
        for (let j = i + 1; j < drawn.length; j++) {
          const [a, b] = [drawn[i], drawn[j]];
          const gap = Math.hypot(a.x - b.x, a.y - b.y) - a.r - b.r;
          if (gap < 0) clashes.push(`${a.label}#${i} and ${b.label}#${j} overlap by ${-gap}`);
        }
      }
      expect(clashes).toEqual([]);
    }
  );
});
