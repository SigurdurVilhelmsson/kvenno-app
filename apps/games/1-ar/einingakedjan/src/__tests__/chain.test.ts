import { describe, it, expect } from 'vitest';

import { allRatios } from '../data/ratios';
import { correctionPrompt, predictionOptions, solveChain, type ChainSlot } from '../engine/chain';
import { formatSignature, quantity, signature } from '../engine/units';

const slot = (
  equivalenceId: string,
  orientation: 'forward' | 'flipped' = 'flipped'
): ChainSlot => ({
  equivalenceId,
  orientation,
});

const gramsOfMg = quantity(5.0, 'g', 'Mg');
const gramsOfOxide = signature('g', 'MgO');

/** The mass-to-mass bridge: g Mg -> mol Mg -> mol MgO -> g MgO. */
const correctChain: ChainSlot[] = [
  // g Mg / mol Mg, flipped so g Mg lands in the denominator and cancels.
  slot('mm-Mg', 'flipped'),
  // mol Mg / mol MgO, flipped so mol Mg lands in the denominator and cancels.
  slot('jafna-Mg-MgO', 'flipped'),
  // g MgO / mol MgO, as written: mol MgO in the denominator.
  slot('mm-MgO', 'forward'),
];

describe('solveChain', () => {
  it('solves a correct chain and computes the value', () => {
    const result = solveChain(gramsOfMg, correctChain, allRatios, gramsOfOxide);
    expect(result.status).toBe('solved');
    expect(result.final.value).toBeCloseTo(8.28877, 4);
    expect(formatSignature(result.final)).toBe('g MgO');
    expect(result.steps).toHaveLength(3);
  });

  it('flags an inverted ratio and stops there', () => {
    const chain = [slot('mm-Mg', 'forward'), ...correctChain.slice(1)];
    const result = solveChain(gramsOfMg, chain, allRatios, gramsOfOxide);
    expect(result.status).toBe('inverted');
    expect(result.failedSlot).toBe(0);
    // The failing step is still executed so the student can see the nonsense it makes.
    expect(result.steps).toHaveLength(1);
    expect(formatSignature(result.final)).toBe('g Mg·g Mg / mol Mg');
  });

  it('flags a ratio that cannot help in either orientation', () => {
    const result = solveChain(gramsOfMg, [slot('mm-O2', 'flipped')], allRatios, gramsOfOxide);
    expect(result.status).toBe('irrelevant');
    expect(result.failedSlot).toBe(0);
  });

  it('flags a clean chain that stops short of the target', () => {
    const result = solveChain(gramsOfMg, correctChain.slice(0, 2), allRatios, gramsOfOxide);
    expect(result.status).toBe('wrong-unit');
    expect(result.failedSlot).toBeUndefined();
    expect(formatSignature(result.final)).toBe('mol MgO');
  });

  it('accepts either order for two genuinely commutative ratios', () => {
    // On a compound unit the numerator and denominator can be converted in either
    // order and both are correct. The older dimensional-analysis game compares the
    // chain against a stored `correctPath` array, so it marks one of the two wrong
    // and then misattributes it to an inverted factor (CURRICULUM_REVIEW.md B11).
    // Deriving correctness from the units instead makes that class of false
    // negative impossible rather than merely absent.
    const density = {
      value: 1.0,
      num: [{ unit: 'g', species: 'H₂O' }],
      den: [{ unit: 'mL', species: 'H₂O' }],
    };
    const target = {
      num: [{ unit: 'kg', species: 'H₂O' }],
      den: [{ unit: 'L', species: 'H₂O' }],
    };

    const massFirst = solveChain(
      density,
      [slot('metric-g-kg', 'flipped'), slot('metric-mL-L', 'forward')],
      allRatios,
      target
    );
    const volumeFirst = solveChain(
      density,
      [slot('metric-mL-L', 'forward'), slot('metric-g-kg', 'flipped')],
      allRatios,
      target
    );

    expect(massFirst.status).toBe('solved');
    expect(volumeFirst.status).toBe('solved');
    expect(massFirst.final.value).toBeCloseTo(1.0, 12);
    expect(volumeFirst.final.value).toBeCloseTo(massFirst.final.value, 12);
  });

  it('requires mL to become L before molarity applies', () => {
    // Not every pair commutes: molarity is stated per litre, so the metric step is
    // genuinely forced first, and reaching for molarity too early cancels nothing.
    const result = solveChain(
      quantity(250, 'mL', 'NaOH(aq)'),
      [slot('molstyrkur-NaOH-0100', 'forward')],
      allRatios,
      signature('mol', 'NaOH')
    );
    expect(result.status).toBe('irrelevant');
  });

  it('refuses the molarity of a different solution', () => {
    const result = solveChain(
      quantity(250, 'mL', 'NaOH(aq)'),
      [slot('metric-mL-L', 'flipped'), slot('molstyrkur-HCl-0100', 'forward')],
      allRatios,
      signature('mol', 'NaOH')
    );
    expect(result.status).toBe('irrelevant');
    expect(result.failedSlot).toBe(1);
  });
});

describe('correctionPrompt', () => {
  it('returns nothing for a solved chain', () => {
    const result = solveChain(gramsOfMg, correctChain, allRatios, gramsOfOxide);
    expect(correctionPrompt(result, gramsOfOxide)).toBeNull();
  });

  it('offers flipping as the correct fix for an inverted ratio', () => {
    const chain = [slot('mm-Mg', 'forward')];
    const prompt = correctionPrompt(
      solveChain(gramsOfMg, chain, allRatios, gramsOfOxide),
      gramsOfOxide
    );
    const correct = prompt?.options.filter((o) => o.correct) ?? [];
    expect(correct).toHaveLength(1);
    expect(correct[0].id).toBe('flip');
    // The wording names the units actually on screen.
    expect(prompt?.problem).toContain('g Mg');
  });

  it('offers removal as the correct fix for an irrelevant ratio', () => {
    const prompt = correctionPrompt(
      solveChain(gramsOfMg, [slot('mm-O2', 'flipped')], allRatios, gramsOfOxide),
      gramsOfOxide
    );
    expect(prompt?.options.find((o) => o.correct)?.id).toBe('remove');
  });

  it('offers adding a step as the correct fix for a chain that stops short', () => {
    const prompt = correctionPrompt(
      solveChain(gramsOfMg, correctChain.slice(0, 2), allRatios, gramsOfOxide),
      gramsOfOxide
    );
    expect(prompt?.options.find((o) => o.correct)?.id).toBe('addStep');
    expect(prompt?.problem).toContain('mol MgO');
  });

  it('always offers exactly one correct option', () => {
    const chains: ChainSlot[][] = [
      [slot('mm-Mg', 'forward')],
      [slot('mm-O2', 'flipped')],
      correctChain.slice(0, 2),
    ];
    for (const chain of chains) {
      const prompt = correctionPrompt(
        solveChain(gramsOfMg, chain, allRatios, gramsOfOxide),
        gramsOfOxide
      );
      expect(prompt?.options.filter((o) => o.correct)).toHaveLength(1);
      expect(prompt?.options.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('predictionOptions', () => {
  it('marks the unit the chain actually produces as correct', () => {
    const options = predictionOptions(gramsOfMg, correctChain, allRatios, gramsOfOxide);
    expect(options.find((o) => o.correct)?.label).toBe('g MgO');
  });

  it('credits predicting the outcome of a broken chain', () => {
    // The skill is predicting your own chain, not guessing the target.
    const options = predictionOptions(gramsOfMg, correctChain.slice(0, 2), allRatios, gramsOfOxide);
    expect(options.find((o) => o.correct)?.label).toBe('mol MgO');
    expect(options.some((o) => o.label === 'g MgO' && !o.correct)).toBe(true);
  });

  it('produces distinct options and exactly one correct one', () => {
    const options = predictionOptions(gramsOfMg, correctChain, allRatios, gramsOfOxide);
    expect(new Set(options.map((o) => o.label)).size).toBe(options.length);
    expect(options.filter((o) => o.correct)).toHaveLength(1);
    expect(options.length).toBeGreaterThanOrEqual(2);
  });
});
