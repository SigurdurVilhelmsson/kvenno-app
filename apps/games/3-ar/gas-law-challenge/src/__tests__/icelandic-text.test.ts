import { describe, it, expect } from 'vitest';

import { questions } from '../data/questions';
import { GAS_LAW_INFO } from '../types';

/**
 * Every string a student reads in this game is Icelandic, with a decimal comma.
 *
 * **Why this exists.** Until 2026-09-22 all thirteen Stig 1 questions — the
 * level devoted to PV = nRT, and the one the menu selects by default — carried
 * English hints and English worked solutions ("Solve for V. Rearrange PV = nRT",
 * "Start with PV = nRT"), and every question in all three levels printed an
 * English copy of its scenario directly under the Icelandic one. Stig 2 and 3
 * had been written in Icelandic, so a first look at the game found nothing wrong.
 *
 * The English check is a word list, not a language detector: the formulas are
 * the same in both languages, so only the words around them can tell. It catches
 * the vocabulary the old strings actually used.
 */

/** Words that appeared in the English strings, none of which is Icelandic. */
const ENGLISH =
  /\b(the|use|solve|calculate|substitute|rearrange|start|with|at|pressure|volume|temperature|moles?|convert|notice|high|low)\b/i;

/** A decimal point between digits. Icelandic writes 0,08206, not 0.08206. */
const DECIMAL_POINT = /\d\.\d/;

function displayedStrings(): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];
  for (const q of questions) {
    const at = (field: string) => `question ${q.id} ${field}`;
    out.push({ where: at('scenario'), text: q.scenario_is });
    q.hints.forEach((h, i) => out.push({ where: at(`hint ${i + 1}`), text: h }));
    out.push({ where: at('formula'), text: q.solution.formula });
    out.push({ where: at('substitution'), text: q.solution.substitution });
    out.push({ where: at('calculation'), text: q.solution.calculation });
    q.solution.steps.forEach((s, i) => out.push({ where: at(`step ${i + 1}`), text: s }));
  }
  for (const info of Object.values(GAS_LAW_INFO)) {
    for (const field of ['nameIs', 'description', 'constants', 'principleIs'] as const) {
      out.push({ where: `${info.id} ${field}`, text: info[field] });
    }
  }
  return out;
}

describe('gas-law text a student reads', () => {
  const strings = displayedStrings();

  it('finds the strings it is meant to check', () => {
    // Every question has at least a scenario, hints and steps; a path or shape
    // change that emptied this list would pass every test below.
    expect(strings.length).toBeGreaterThan(questions.length * 8);
  });

  it('carries no English copy of the scenario', () => {
    for (const q of questions) {
      expect(Object.keys(q), `question ${q.id}`).not.toContain('scenario_en');
    }
  });

  it('is not English', () => {
    for (const { where, text } of strings) {
      expect(text, where).not.toMatch(ENGLISH);
    }
  });

  it('writes decimals with a comma', () => {
    for (const { where, text } of strings) {
      expect(text, where).not.toMatch(DECIMAL_POINT);
    }
  });

  it('names the ideal gas law as the glossary does', () => {
    expect(GAS_LAW_INFO.ideal.nameIs).toBe('Kjörgaslögmálið');
  });
});
