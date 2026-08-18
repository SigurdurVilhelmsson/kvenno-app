import { describe, it, expect } from 'vitest';

import { periodicPuzzles } from '../data/periodic-configs';

describe('level 3 puzzle data', () => {
  it('every puzzle offers its own correct answer among the options', () => {
    const broken = periodicPuzzles.filter((p) => !p.options.includes(p.fullShorthand));
    expect(broken.map((p) => p.element)).toEqual([]);
  });

  it('the correct answer is not always in the same slot', () => {
    const positions = periodicPuzzles.map((p) => p.options.indexOf(p.fullShorthand));
    expect(new Set(positions).size).toBeGreaterThan(1);
  });

  it('every puzzle offers four distinct options', () => {
    const bad = periodicPuzzles.filter(
      (p) => p.options.length !== 4 || new Set(p.options).size !== 4
    );
    expect(bad.map((p) => p.element)).toEqual([]);
  });
});
