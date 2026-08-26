import { describe, it, expect } from 'vitest';

import { COMPOUNDS, type Compound } from '../data/compounds';
import { segmentName } from '../data/naming';
import {
  buildablePool,
  DISTRACTOR_COUNT,
  generateParts,
  pickDistractors,
  selectCompounds,
} from '../utils/nameParts';

/**
 * The tray a student is shown must be able to spell the answer.
 *
 * `name-builder.test.ts` proves each name *decomposes*; this proves the parts
 * actually offered contain that decomposition, and that the wrong ones are wrong.
 * Both matter: the old builder failed the first, and a plausible fix that only
 * added morphemes to the inventory could still have failed the second.
 */

const byFormula = (formula: string): Compound => {
  const compound = COMPOUNDS.find((c) => c.formula === formula);
  expect(compound, formula).toBeDefined();
  return compound!;
};

/** Can `parts` be arranged to spell `name`? Multiset containment is enough. */
function trayCanSpell(parts: { text: string }[], name: string): boolean {
  const segments = segmentName(name);
  if (!segments) return false;
  const available = parts.map((p) => p.text);
  for (const segment of segments) {
    const at = available.indexOf(segment.text);
    if (at === -1) return false;
    available.splice(at, 1);
  }
  return true;
}

describe('generateParts offers the answer', () => {
  const pool = buildablePool();

  it('draws from a pool that is nearly the whole compound table', () => {
    expect(pool.length).toBe(52);
  });

  it.each(pool.map((c) => [c.formula, c] as const))('%s', (_formula, compound) => {
    // Run it more than once: the distractors are shuffled, and a tray that only
    // usually contains the answer is the same defect in a quieter form.
    for (let attempt = 0; attempt < 20; attempt++) {
      const parts = generateParts(compound);
      expect(
        trayCanSpell(parts, compound.name),
        `attempt ${attempt}: "${compound.name}" is not spellable from [${parts.map((p) => p.text).join(', ')}]`
      ).toBe(true);
    }
  });

  it('never repeats a part id, which the click handlers key on', () => {
    for (const compound of pool) {
      const parts = generateParts(compound);
      expect(new Set(parts.map((p) => p.id)).size, compound.formula).toBe(parts.length);
    }
  });

  it('offers as many distractors as the difficulty asks for', () => {
    for (const compound of pool) {
      const real = segmentName(compound.name)!.length;
      expect(generateParts(compound).length, compound.formula).toBe(
        real + DISTRACTOR_COUNT[compound.difficulty]
      );
    }
  });
});

describe('distractors are wrong on purpose', () => {
  it('never duplicates a part the answer needs', () => {
    // This is the trap the old builder fell into from the other side: it kept
    // `súlfat` and `nítrat` as distractors only, so the compounds that genuinely
    // needed them could not be built. Offering one as both is the mirror bug —
    // a duplicate token that makes the tray misleading rather than unsolvable.
    for (const compound of buildablePool()) {
      const segments = segmentName(compound.name)!;
      for (let attempt = 0; attempt < 20; attempt++) {
        const distractors = pickDistractors(segments, DISTRACTOR_COUNT[compound.difficulty]);
        const real = new Set(segments.map((m) => m.text.toLowerCase()));
        for (const distractor of distractors) {
          expect(real.has(distractor.text.toLowerCase()), `${compound.formula}`).toBe(false);
        }
      }
    }
  });

  it('prefers the same kind of part, so the choice is a real one', () => {
    // Kopar(II)súlfat uses a root, a Roman numeral and an ion; its distractors
    // should be other Roman numerals and other ions, not Greek prefixes that
    // obviously do not belong on an ionic compound.
    const segments = segmentName(byFormula('CuSO₄').name)!;
    for (let attempt = 0; attempt < 20; attempt++) {
      const distractors = pickDistractors(segments, 3);
      expect(distractors.length).toBe(3);
      for (const distractor of distractors) {
        expect(['root', 'charge', 'ion']).toContain(distractor.kind);
      }
    }
  });

  it('still fills the tray when the same-kind pool runs dry', () => {
    // Ammóníumsúlfat is two ions, and there are only eight ions in all, so a
    // request for more than seven has to fall through to another kind rather
    // than return short.
    const segments = segmentName(byFormula('(NH₄)₂SO₄').name)!;
    expect(pickDistractors(segments, 12).length).toBe(12);
  });
});

describe('selectCompounds', () => {
  it('asks ten questions', () => {
    expect(selectCompounds().length).toBe(10);
  });

  it('never picks an excluded compound', () => {
    for (let attempt = 0; attempt < 50; attempt++) {
      for (const compound of selectCompounds()) {
        expect(compound.excludeFromNameBuilder, compound.formula).toBeFalsy();
      }
    }
  });

  it('never picks the same compound twice in one run', () => {
    for (let attempt = 0; attempt < 50; attempt++) {
      const picked = selectCompounds().map((c) => c.formula);
      expect(new Set(picked).size).toBe(picked.length);
    }
  });
});
