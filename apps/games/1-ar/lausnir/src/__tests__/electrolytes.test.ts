import { describe, it, expect } from 'vitest';

import { CLASSES, KIND_NAMES, SOLUTES, classOf, classify } from '../data/electrolytes';

/**
 * Stig 0's content, checked for the two defects its ancestor shipped.
 *
 * The old `jonir-i-lausn` leaked the answer in all fifteen of its Level-1
 * descriptions and stored the class independently of the reason. Both are
 * asserted here as properties over the whole set rather than as fixed
 * expectations, so a sixteenth substance cannot reintroduce either.
 */

describe('the class is derived, never declared', () => {
  it('maps every kind to exactly one class', () => {
    for (const kind of Object.keys(KIND_NAMES) as (keyof typeof KIND_NAMES)[]) {
      expect(CLASSES[classify(kind)], `${kind} maps to no class`).toBeDefined();
    }
  });

  it.each([
    ['jonaefni', 'sterkur'],
    ['sterk-syra', 'sterkur'],
    ['sterkur-basi', 'sterkur'],
    ['veik-syra', 'veikur'],
    ['veikur-basi', 'veikur'],
    ['sameindaefni', 'orafkleyft'],
  ] as const)('%s is %s', (kind, expected) => {
    expect(classify(kind)).toBe(expected);
  });

  it('every substance resolves to a class with a bulb state', () => {
    for (const s of SOLUTES) {
      expect(CLASSES[classOf(s)].bulb, s.id).toMatch(/^(bright|dim|off)$/);
    }
  });
});

describe('nothing on screen before the answer gives the answer away', () => {
  /**
   * The old game's exact defect, as a property. `ORPHANED_GAMES_ASSESSMENT.md:320`
   * found all fifteen descriptions naming the classifying property, eight of
   * them by literal stem-match. `observable` is the field that renders before
   * the student commits, so it is the one that has to stay clean.
   */
  const GIVEAWAYS = [
    /rafkleyf/i,
    /sterk/i,
    /veik/i,
    /jónaefni/i,
    /sameindaefni/i,
    /jónast/i,
    /klofna/i,
    /leiðir\s+(ekki\s+)?rafstraum/i,
    /leysist\s+algjörlega/i,
  ];

  it.each(SOLUTES.map((s) => [s.id, s] as const))('%s: the observable is clean', (_id, solute) => {
    for (const pattern of GIVEAWAYS) {
      expect(
        pattern.test(solute.observable),
        `${solute.id}'s observable matches ${pattern} — that is the leak the old game had`
      ).toBe(false);
    }
  });

  it('the name alone does not classify either', () => {
    // Icelandic acid names are suffix-transparent, so -sýra in the name says
    // "acid" but must not say "strong" or "weak". Check no name carries the
    // strength adjective.
    for (const s of SOLUTES) {
      expect(/^(sterk|veik)/i.test(s.name), `${s.id}'s name states its strength`).toBe(false);
    }
  });

  it('the dissociation arrow is only ever in the after-answer field', () => {
    // A full arrow means strong and a double arrow means weak, so an arrow in
    // the observable would resolve the question outright.
    for (const s of SOLUTES) {
      expect(/[→⇌]/.test(s.observable), `${s.id}'s observable shows an arrow`).toBe(false);
    }
  });
});

describe('the set is worth doing', () => {
  it('covers all three classes and is not lopsided', () => {
    const counts = { sterkur: 0, veikur: 0, orafkleyft: 0 };
    for (const s of SOLUTES) counts[classOf(s)]++;
    for (const [klass, n] of Object.entries(counts)) {
      expect(n, `only ${n} substances are ${klass}`).toBeGreaterThanOrEqual(4);
    }
  });

  it('covers every kind, so no branch of the rule goes untested', () => {
    const kinds = new Set(SOLUTES.map((s) => s.kind));
    expect(kinds.size).toBe(Object.keys(KIND_NAMES).length);
  });

  it('carries the two traps the teach phase names', () => {
    // Sugar: dissolves beautifully, conducts nothing. HF: dangerous, and weak.
    // The teach phase promises both, so the drill has to contain both.
    const sugar = SOLUTES.find((s) => s.id === 'c12h22o11')!;
    expect(classOf(sugar)).toBe('orafkleyft');
    const hf = SOLUTES.find((s) => s.id === 'hf')!;
    expect(classOf(hf)).toBe('veikur');
    expect(hf.name).toBe('Flússýra');
  });

  it('a strong acid and a weak one differ by one atom, and both are present', () => {
    // HNO₃ is strong, HNO₂ is weak. The nitrous acid entry says so, and this
    // asserts the pair the sentence relies on is really in the set.
    const hno2 = SOLUTES.find((s) => s.id === 'hno2')!;
    expect(hno2.name).toBe('Saltpéturssýrlingur');
    expect(classOf(hno2)).toBe('veikur');
    expect(hno2.why).toContain('HNO₃');
  });

  it('gives every substance an observable and a reason', () => {
    for (const s of SOLUTES) {
      expect(s.observable.length, `${s.id} observable`).toBeGreaterThan(15);
      expect(s.why.length, `${s.id} why`).toBeGreaterThan(30);
    }
  });

  it('gives a dissociation equation to every electrolyte and to no non-electrolyte', () => {
    for (const s of SOLUTES) {
      const expected = classOf(s) !== 'orafkleyft';
      expect(Boolean(s.dissociation), `${s.id}`).toBe(expected);
    }
  });

  it('uses the right arrow for the right strength', () => {
    // A strong electrolyte goes one way; a weak one is an equilibrium. Getting
    // this backwards would teach the opposite of the lesson.
    for (const s of SOLUTES) {
      if (!s.dissociation) continue;
      if (classOf(s) === 'sterkur') {
        expect(s.dissociation, s.id).toContain('→');
        expect(s.dissociation, s.id).not.toContain('⇌');
      } else {
        expect(s.dissociation, s.id).toContain('⇌');
      }
    }
  });

  it('has unique ids and formulas', () => {
    expect(new Set(SOLUTES.map((s) => s.id)).size).toBe(SOLUTES.length);
    expect(new Set(SOLUTES.map((s) => s.formula)).size).toBe(SOLUTES.length);
  });
});

describe('the terminology the old file got wrong', () => {
  it('names the classes with the masculine rafkleyfi', () => {
    // The old game said 'Sterkt rafkleyfi' and 'Veikt rafkleyfi' on every
    // answer button. The textbook is masculine, and governed-terms.test.ts now
    // bans the neuter forms platform-wide.
    expect(CLASSES.sterkur.name).toBe('Sterkur rafkleyfi');
    expect(CLASSES.veikur.name).toBe('Veikur rafkleyfi');
  });

  it('treats non-electrolyte as an adjective plus a noun', () => {
    // Not the noun 'Órafkleyfi', which the textbook never uses.
    expect(CLASSES.orafkleyft.name).toBe('Órafkleyft efni');
  });

  it('gives basi its masculine adjectives', () => {
    // 'sterk basi' and 'veik basi' were ungrammatical in the old data.
    expect(KIND_NAMES['sterkur-basi']).toBe('Sterkur basi');
    expect(KIND_NAMES['veikur-basi']).toBe('Veikur basi');
  });
});
