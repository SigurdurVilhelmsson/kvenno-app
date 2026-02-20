import { describe, it, expect } from 'vitest';

import { getDetailedFeedback } from '../utils/feedbackGenerator';
import type { Challenge, CompoundData } from '../utils/challengeGenerator';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------
const WATER: CompoundData = {
  formula: 'H₂O',
  name: 'Vatn',
  elements: [
    { symbol: 'H', count: 2 },
    { symbol: 'O', count: 1 },
  ],
  molarMass: 18.015,
};

const CO2: CompoundData = {
  formula: 'CO₂',
  name: 'Koltvísýringur',
  elements: [
    { symbol: 'C', count: 1 },
    { symbol: 'O', count: 2 },
  ],
  molarMass: 44.009,
};

const NACL: CompoundData = {
  formula: 'NaCl',
  name: 'Borðsalt',
  elements: [
    { symbol: 'Na', count: 1 },
    { symbol: 'Cl', count: 1 },
  ],
  molarMass: 58.44,
};

// ---------------------------------------------------------------------------
// count_atoms challenges
// ---------------------------------------------------------------------------
describe('getDetailedFeedback – count_atoms', () => {
  const challenge: Challenge = {
    type: 'count_atoms',
    compound: WATER,
    targetElement: 'H',
    correctCount: 2,
  };

  it('returns correct feedback with explanation, relatedConcepts, and nextSteps', () => {
    const fb = getDetailedFeedback(challenge, true);
    expect(fb.isCorrect).toBe(true);
    expect(fb.explanation).toContain('H₂O');
    expect(fb.explanation).toContain('2');
    expect(fb.relatedConcepts).toBeDefined();
    expect(fb.relatedConcepts!.length).toBeGreaterThan(0);
    expect(fb.nextSteps).toBeDefined();
  });

  it('returns incorrect feedback with misconception', () => {
    const fb = getDetailedFeedback(challenge, false);
    expect(fb.isCorrect).toBe(false);
    expect(fb.explanation).toContain('2');
    expect(fb.explanation).toContain('H');
    expect(fb.misconception).toBeDefined();
    expect(fb.misconception!.length).toBeGreaterThan(0);
    expect(fb.relatedConcepts).toBeDefined();
    expect(fb.nextSteps).toBeDefined();
  });

  it('uses Icelandic element name from ATOM_VISUALS when available', () => {
    const fb = getDetailedFeedback(challenge, true);
    // H → "Vetni" from ATOM_VISUALS
    expect(fb.explanation).toContain('Vetni');
  });

  it('falls back to element symbol when ATOM_VISUALS has no entry', () => {
    const unknownChallenge: Challenge = {
      type: 'count_atoms',
      compound: {
        formula: 'XeF₂',
        name: 'Xenon díflúoríð',
        elements: [
          { symbol: 'Xe', count: 1 },
          { symbol: 'F', count: 2 },
        ],
        molarMass: 169.29,
      },
      targetElement: 'Xe',
      correctCount: 1,
    };
    const fb = getDetailedFeedback(unknownChallenge, true);
    // Xe is not in ATOM_VISUALS, so falls back to 'Xe'
    expect(fb.explanation).toContain('Xe');
  });
});

// ---------------------------------------------------------------------------
// compare_mass challenges
// ---------------------------------------------------------------------------
describe('getDetailedFeedback – compare_mass', () => {
  const challenge: Challenge = {
    type: 'compare_mass',
    compound: CO2,       // 44.009 g/mol
    compareCompound: WATER, // 18.015 g/mol
  };

  it('returns correct feedback identifying the heavier compound', () => {
    const fb = getDetailedFeedback(challenge, true);
    expect(fb.isCorrect).toBe(true);
    // CO2 is heavier than H2O
    expect(fb.explanation).toContain('Koltvísýringur');
    expect(fb.explanation).toContain('44.0');
    expect(fb.explanation).toContain('Vatn');
    expect(fb.explanation).toContain('18.0');
    expect(fb.relatedConcepts).toContain('Mólmassi');
  });

  it('returns incorrect feedback with misconception about mass', () => {
    const fb = getDetailedFeedback(challenge, false);
    expect(fb.isCorrect).toBe(false);
    expect(fb.misconception).toBeDefined();
    expect(fb.explanation).toContain('þyngri');
    expect(fb.relatedConcepts).toContain('Mólmassi');
  });

  it('handles equal masses by treating compound as lighter-or-equal', () => {
    const equalChallenge: Challenge = {
      type: 'compare_mass',
      compound: WATER,
      compareCompound: { ...WATER, name: 'Vatn 2', formula: 'H₂O-2' },
    };
    // Should not throw
    const fb = getDetailedFeedback(equalChallenge, true);
    expect(fb.isCorrect).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// build_molecule challenges
// ---------------------------------------------------------------------------
describe('getDetailedFeedback – build_molecule', () => {
  const challenge: Challenge = {
    type: 'build_molecule',
    compound: WATER,
  };

  it('returns correct feedback listing element counts with × symbol', () => {
    const fb = getDetailedFeedback(challenge, true);
    expect(fb.isCorrect).toBe(true);
    expect(fb.explanation).toContain('Vatn');
    expect(fb.explanation).toContain('H₂O');
    // Should contain element counts like "2× Vetni"
    expect(fb.explanation).toContain('2\u00d7');
    expect(fb.relatedConcepts).toContain('Sameindir');
  });

  it('returns incorrect feedback with misconception about reading formulas', () => {
    const fb = getDetailedFeedback(challenge, false);
    expect(fb.isCorrect).toBe(false);
    expect(fb.explanation).toContain('inniheldur');
    expect(fb.misconception).toBeDefined();
    expect(fb.misconception!).toContain('subscript');
  });
});

// ---------------------------------------------------------------------------
// estimate_range challenges
// ---------------------------------------------------------------------------
describe('getDetailedFeedback – estimate_range', () => {
  const ranges = [
    { min: 0, max: 25, label: '0-25 g/mol' },
    { min: 25, max: 50, label: '25-50 g/mol' },
    { min: 50, max: 100, label: '50-100 g/mol' },
  ];

  const challenge: Challenge = {
    type: 'estimate_range',
    compound: NACL, // 58.44 g/mol → range index 2
    ranges,
    correctRangeIndex: 2,
  };

  it('returns correct feedback with calculation breakdown', () => {
    const fb = getDetailedFeedback(challenge, true);
    expect(fb.isCorrect).toBe(true);
    expect(fb.explanation).toContain('Borðsalt');
    expect(fb.explanation).toContain('58.4');
    expect(fb.explanation).toContain('50-100 g/mol');
    // Should show calculation like "1×23 + 1×35"
    expect(fb.explanation).toContain('\u00d7');
    expect(fb.relatedConcepts).toContain('Útreikningar');
  });

  it('returns incorrect feedback with atomic mass hints', () => {
    const fb = getDetailedFeedback(challenge, false);
    expect(fb.isCorrect).toBe(false);
    expect(fb.explanation).toContain('58.4');
    expect(fb.explanation).toContain('50-100 g/mol');
    expect(fb.misconception).toBeDefined();
    expect(fb.misconception!).toContain('H');
    expect(fb.misconception!).toContain('C');
    expect(fb.misconception!).toContain('O');
  });
});

// ---------------------------------------------------------------------------
// default / unknown challenge type
// ---------------------------------------------------------------------------
describe('getDetailedFeedback – default case', () => {
  // Use a runtime-only value to test the default branch without TS complaining
  const unknownType = 'unknown_type' as string;

  it('returns minimal correct feedback for unknown type', () => {
    const challenge = { type: unknownType, compound: WATER } as unknown as Challenge;
    const fb = getDetailedFeedback(challenge, true);
    expect(fb.isCorrect).toBe(true);
    expect(fb.explanation).toBe('Rétt svar!');
  });

  it('returns minimal incorrect feedback for unknown type', () => {
    const challenge = { type: unknownType, compound: WATER } as unknown as Challenge;
    const fb = getDetailedFeedback(challenge, false);
    expect(fb.isCorrect).toBe(false);
    expect(fb.explanation).toBe('Rangt svar.');
  });
});

// ---------------------------------------------------------------------------
// Return type compliance
// ---------------------------------------------------------------------------
describe('getDetailedFeedback – DetailedFeedback shape', () => {
  const allChallenges: Challenge[] = [
    { type: 'count_atoms', compound: WATER, targetElement: 'O', correctCount: 1 },
    { type: 'compare_mass', compound: CO2, compareCompound: WATER },
    { type: 'build_molecule', compound: NACL },
    {
      type: 'estimate_range',
      compound: WATER,
      ranges: [
        { min: 0, max: 25, label: '0-25 g/mol' },
        { min: 25, max: 50, label: '25-50 g/mol' },
      ],
      correctRangeIndex: 0,
    },
  ];

  for (const challenge of allChallenges) {
    for (const isCorrect of [true, false]) {
      it(`${challenge.type} (${isCorrect ? 'correct' : 'incorrect'}) has required fields`, () => {
        const fb = getDetailedFeedback(challenge, isCorrect);
        expect(typeof fb.isCorrect).toBe('boolean');
        expect(typeof fb.explanation).toBe('string');
        expect(fb.explanation.length).toBeGreaterThan(0);
        expect(fb.isCorrect).toBe(isCorrect);

        // incorrect answers should always have misconception for known types
        if (!isCorrect) {
          expect(fb.misconception).toBeDefined();
        }
      });
    }
  }
});
