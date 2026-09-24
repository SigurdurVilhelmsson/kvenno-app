import { describe, it, expect } from 'vitest';

import {
  generateQuestions as level1Questions,
  hintFor as level1Hint,
  feedbackText as level1Feedback,
} from '../components/Level1';
import { generateQuestions as level2Questions } from '../components/Level2';
import { generateQuestions as level3Questions } from '../components/Level3';
import { CATEGORY_LABELS, ELEMENTS } from '../data/elements';

/**
 * An element's name is capitalised only where a sentence starts.
 *
 * Icelandic writes element and category names as common nouns — this game's
 * own hand-written intros say `leitar að kopar` and `þyngra en kalíum`. The
 * templates dropped the capitalised label form into the middle of a sentence
 * instead: `Hvar er Natríum (Na) í lotukerfinu?`, `Frumefnið er Alkalímálmur.`
 * Found and fixed 2026-09-23.
 *
 * Options are not checked: a button carrying a bare name is a label, not a
 * sentence.
 */

const NAMES = [...ELEMENTS.map((e) => e.name), ...Object.values(CATEGORY_LABELS)];

function midSentence(text: string): string[] {
  const offences: string[] = [];
  for (const name of NAMES) {
    const re = new RegExp(`(?<!\\p{L})${name}(?!\\p{L})`, 'gu');
    for (const match of text.matchAll(re)) {
      const before = text.slice(0, match.index);
      if (before.trim() === '' || /[.!?]\s*$/.test(before)) continue;
      offences.push(`"${name}" in: ${text}`);
    }
  }
  return offences;
}

const RUNS = 150;

describe('names inside sentences are lower-case', () => {
  it('can tell a sentence start from the middle of one', () => {
    expect(midSentence('Natríum er málmur.')).toEqual([]);
    expect(midSentence('Rétt! Natríum (Na) er í lotu 3.')).toEqual([]);
    expect(midSentence('Hvar er Natríum (Na)?')).toHaveLength(1);
    expect(midSentence('Frumefnið er Hliðarmálmur.')).toHaveLength(1);
  });

  it('Stig 1: questions, hints and feedback', () => {
    for (let run = 0; run < RUNS; run++) {
      for (const q of level1Questions()) {
        const texts = [q.text, level1Hint(q), level1Feedback(q, true), level1Feedback(q, false)];
        for (const text of texts) expect(midSentence(text)).toEqual([]);
      }
    }
  });

  it('Stig 2: questions and explanations', () => {
    for (let run = 0; run < RUNS; run++) {
      for (const q of level2Questions()) {
        for (const text of [q.text, q.explanation]) expect(midSentence(text)).toEqual([]);
      }
    }
  });

  it('Stig 3: questions and explanations', () => {
    for (let run = 0; run < RUNS; run++) {
      for (const q of level3Questions()) {
        for (const text of [q.text, q.explanation]) expect(midSentence(text)).toEqual([]);
      }
    }
  });
});
