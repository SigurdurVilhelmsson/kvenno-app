import { describe, it, expect } from 'vitest';

import { configPuzzles } from '../data/electron-configs';
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

const NOBLE_GASES: Record<string, number> = { He: 2, Ne: 10, Ar: 18, Kr: 36, Xe: 54, Rn: 86 };
const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const CAPACITY: Record<string, number> = { s: 2, p: 6, d: 10, f: 14 };

/** `3d¹⁰` → { n: 3, type: 'd', electrons: 10 }. */
function parse(subshell: string) {
  const electrons = Number(Array.from(subshell.slice(2), (c) => SUPERSCRIPT.indexOf(c)).join(''));
  return { n: Number(subshell[0]), type: subshell[1], electrons };
}

describe('level 3 shorthand is the one the intro teaches', () => {
  it('builds each answer on the noble gas immediately before the element', () => {
    const wrong = periodicPuzzles.filter((p) => {
      const before = Object.entries(NOBLE_GASES)
        .filter(([, z]) => z < p.atomicNumber)
        .sort((a, b) => b[1] - a[1])[0][0];
      return p.nobleGasCore !== `[${before}]` || !p.fullShorthand.startsWith(`[${before}] `);
    });
    expect(wrong.map((p) => p.element)).toEqual([]);
  });

  it('accounts for every electron of the element', () => {
    const wrong = periodicPuzzles.filter((p) => {
      const [core, ...rest] = p.fullShorthand.split(' ');
      const total = rest.map(parse).reduce((sum, s) => sum + s.electrons, 0);
      return NOBLE_GASES[core.slice(1, -1)] + total !== p.atomicNumber;
    });
    expect(wrong.map((p) => p.element)).toEqual([]);
  });
});

describe('level 2 puzzle data', () => {
  it('writes each answer from its own orbital counts, and counts every electron', () => {
    const bad = configPuzzles.filter((p) => {
      const written = p.orbitalOrder
        .map(
          (o, i) =>
            `${o}${Array.from(String(p.electronCounts[i]), (d) => SUPERSCRIPT[Number(d)]).join('')}`
        )
        .join(' ');
      const total = p.electronCounts.reduce((a, b) => a + b, 0);
      return written !== p.correctConfig || total !== p.atomicNumber;
    });
    expect(bad.map((p) => p.element)).toEqual([]);
  });

  it('never overfills a subshell, and sizes the diagram by the subshell type', () => {
    const bad = configPuzzles.filter((p) =>
      p.orbitalOrder.some(
        (o, i) => p.maxElectrons[i] !== CAPACITY[o[1]] || p.electronCounts[i] > p.maxElectrons[i]
      )
    );
    expect(bad.map((p) => p.element)).toEqual([]);
  });
});
