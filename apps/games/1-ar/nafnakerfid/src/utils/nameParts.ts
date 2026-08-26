import { shuffleArray } from '@shared/utils';

import { COMPOUNDS, type Compound, type Difficulty } from '../data/compounds';
import { MORPHEMES, segmentName, type Morpheme, type MorphemeKind } from '../data/naming';

/**
 * The clickable parts Level 3 offers, and the pool it draws its questions from.
 *
 * Both used to live inside the component, and both were wrong in the same way:
 * the parts were improvised from the compound's element symbols, so a name
 * needing a Roman numeral, a polyatomic ion, an unlisted metal or an elided
 * prefix could not be assembled at all. **33 of the 51 compounds in the pool
 * could never be marked correct** — about six of the ten questions in a run.
 *
 * The parts now come from `segmentName`, which decomposes the name into the
 * morphemes it is actually written from, so the target is always reachable and
 * the difficulty is entirely in choosing and ordering. `__tests__/name-builder`
 * and `__tests__/name-parts` hold both halves of that.
 */

export interface NamePart {
  id: string;
  text: string;
  kind: MorphemeKind;
}

/** How many wrong parts sit alongside the right ones, by difficulty. */
export const DISTRACTOR_COUNT: Record<Difficulty, number> = { easy: 2, medium: 3, hard: 4 };

/**
 * Wrong parts to offer, drawn from the same naming vocabulary as the right ones.
 *
 * Same-kind first, so the choice is a real one: on Kopar(II)súlfat the student is
 * offered other Roman numerals and other polyatomic ions, not a Greek prefix that
 * obviously does not belong on an ionic compound.
 */
export function pickDistractors(used: Morpheme[], count: number): Morpheme[] {
  const usedText = new Set(used.map((m) => m.text.toLowerCase()));
  const usedKinds = new Set(used.map((m) => m.kind));
  const pool = MORPHEMES.filter((m) => !usedText.has(m.text.toLowerCase()));
  const sameKind = shuffleArray(pool.filter((m) => usedKinds.has(m.kind)));
  const otherKind = shuffleArray(pool.filter((m) => !usedKinds.has(m.kind)));
  return [...sameKind, ...otherKind].slice(0, count);
}

/**
 * The parts for one compound: the morphemes its name is written from, plus
 * distractors, shuffled.
 */
export function generateParts(compound: Compound): NamePart[] {
  const segments = segmentName(compound.name) ?? [];
  const distractors = pickDistractors(segments, DISTRACTOR_COUNT[compound.difficulty]);
  const parts = [...segments, ...distractors].map((morpheme, i) => ({
    id: `m-${i}`,
    text: morpheme.text,
    kind: morpheme.kind,
  }));
  return shuffleArray(parts);
}

/**
 * The compounds Level 3 may ask about.
 *
 * Two filters, and both are deliberate. `excludeFromNameBuilder` is declared on
 * the compound and covers names that teach nothing about construction — the
 * trivial names (Vatn, Ammóníak, Metan) and the bare elements, each a single
 * indivisible word. It is declared rather than inferred from the name, because
 * inferring it once meant Fe₃O₄'s wrong name doubled as the filter flag and
 * could not be corrected without silently changing the question set.
 *
 * `segmentName` then drops anything the naming vocabulary cannot express. That
 * should never fire — `__tests__/name-builder.test.ts` fails if it would — but
 * dropping such a compound is the safe failure, where posing it as a question
 * nobody can answer is not.
 */
export function buildablePool(): Compound[] {
  return COMPOUNDS.filter((c) => !c.excludeFromNameBuilder && segmentName(c.name) !== null);
}

/** Ten compounds for one run through the level. */
export function selectCompounds(): Compound[] {
  return shuffleArray(buildablePool()).slice(0, 10);
}
