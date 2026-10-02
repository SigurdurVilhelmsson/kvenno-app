import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { formatDecimal } from '@shared/utils';

import { questions } from '../data/questions';
import { givenLabel } from '../utils/given';

/**
 * `Gefnar upplýsingar` prints each given with the figures the question states it to
 * (decisions item 10). A JS number drops trailing zeros, so the panel printed `V: 2 L`
 * beside a worked substitution that writes `2,0 L`. A given may carry the label it prints;
 * this holds every printed given to the question's own working, and every label to its value.
 */

const VARS = ['P', 'V', 'T', 'n'] as const;

describe('the givens panel', () => {
  for (const q of questions) {
    for (const v of VARS) {
      const g = q.given[v];
      if (!g) continue;
      it(`question ${q.id}: ${v} prints as the worked substitution writes it`, () => {
        const printed = givenLabel(g);
        expect(q.solution.substitution, `${printed} ${g.unit}`).toContain(`${printed} ${g.unit}`);
      });
      if (g.label) {
        it(`question ${q.id}: ${v}'s label is its value`, () => {
          expect(Number(g.label!.replace(',', '.'))).toBe(g.value);
          expect(formatDecimal(g.value)).not.toBe(g.label);
        });
      }
    }
  }
});

describe('the givens panel reads the labels', () => {
  it('prints every given through givenLabel, never the bare number', () => {
    const screen = readFileSync(join(__dirname, '..', 'components', 'GameScreen.tsx'), 'utf8');
    expect(screen).not.toMatch(/formatDecimal\(currentQuestion\.given/);
    expect(screen.match(/givenLabel\(currentQuestion\.given\.[PVTn]\)/g)?.length).toBe(8);
  });
});
