import { describe, expect, it } from 'vitest';

import { challenges } from '../components/Level3';

/**
 * Stig 3, challenge 3 (why water is viscous): the distractor `Vatn er þyngra` was answered
 * with `Vatn er í raun léttara en margir lífrænir leysar.` That is true of one molecule and
 * false of a litre: water (1,00 g/mL) is denser than acetone (0,79 g/mL) and petrol, the two
 * liquids the scenario names. Decision 73, third part (2026-10-23): the explanation talks
 * about the mass of a molecule.
 */
describe('Stig 3 challenge 3, the "water is heavier" distractor', () => {
  const challenge = challenges.find((c) => c.id === 3)!;
  const distractor = challenge.options.find((o) => o.text === 'Vatn er þyngra')!;

  it('finds the distractor', () => {
    expect(challenge.title).toBe('Af hverju er vatn seigt?');
    expect(distractor.correct).toBe(false);
  });

  it('says the molecule is lighter, not the liquid', () => {
    expect(distractor.explanation).not.toMatch(/^Vatn er í raun léttara/);
    expect(distractor.explanation).toMatch(/^Vatnssameind er í raun léttari/);
    expect(distractor.explanation).toContain('18 g/mól');
  });
});
