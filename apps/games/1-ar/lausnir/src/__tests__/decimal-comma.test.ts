import { createElement } from 'react';

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, render } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import { SCENARIOS } from '../components/Level2';
import { StepBySolution } from '../components/StepBySolution';
import { formatSolubility } from '../components/TemperatureSolubility';
import { CHEMICALS, CHEMISTRY_FACTS } from '../data';
import type { Difficulty, Problem } from '../types';
import { generateProblem } from '../utils/problem-generator';

/**
 * Every number a student reads in this game is written with the Icelandic
 * decimal comma.
 *
 * **Why this exists.** Stig 3's answer field has read a comma since the Aug 2026
 * B9/B10 pass, but until 2026-09-22 the generated question printed its numbers
 * with a full stop — `Þú leysir 0.00079 mól …` — as did the hints, the worked
 * solution, the "Rétt svar" line, and every molarity the Stig 1 and Stig 2
 * beakers labelled. A student was taught one format and asked for another.
 *
 * Nothing in this game has English data fields; the `en` block of `i18n.ts`
 * carries no decimals.
 */

const DECIMAL_POINT = /\d\.\d/;
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const RUNS_PER_DIFFICULTY = 400;

function generateBatch(): Problem[] {
  return DIFFICULTIES.flatMap((d) =>
    Array.from({ length: RUNS_PER_DIFFICULTY }, () => generateProblem(d))
  );
}

/** Every string value in an object. */
function strings(value: unknown, path = ''): { path: string; text: string }[] {
  if (typeof value === 'string') return [{ path, text: value }];
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, v]) => strings(v, path ? `${path}.${key}` : key));
  }
  return [];
}

afterEach(cleanup);

describe('decimal comma — Stig 3 generated problems', () => {
  const batch = generateBatch();

  it('generates problems that actually carry decimals', () => {
    // Without this the test below could pass on a batch of integers.
    const withComma = batch.filter((p) => /\d,\d/.test(p.question));
    expect(withComma.length).toBeGreaterThan(batch.length / 2);
  });

  it('no question or hint writes a decimal point', () => {
    for (const p of batch) {
      expect(p.question, `${p.type}: ${p.question}`).not.toMatch(DECIMAL_POINT);
      for (const hint of p.hints) {
        expect(hint, `${p.type} hint: ${hint}`).not.toMatch(DECIMAL_POINT);
      }
    }
  });

  it('no worked solution writes a decimal point', () => {
    // A smaller slice — rendering is slower than string checks — but it still
    // covers every problem type many times over.
    for (const p of batch.filter((_, i) => i % 6 === 0)) {
      const { container, unmount } = render(createElement(StepBySolution, { problem: p }));
      const text = container.textContent ?? '';
      expect(text.length, p.type).toBeGreaterThan(0);
      expect(text, `${p.type}: ${text}`).not.toMatch(DECIMAL_POINT);
      unmount();
    }
  });
});

describe('decimal comma — authored text', () => {
  it('no Stig 2 scenario writes a decimal point', () => {
    for (const s of SCENARIOS) {
      for (const { path, text } of strings(s)) {
        expect(text, `scenario ${s.id} ${path}`).not.toMatch(DECIMAL_POINT);
      }
    }
  });

  it('no chemical or fact writes a decimal point', () => {
    const all = [...CHEMICALS.simple, ...CHEMICALS.medium, ...CHEMICALS.hard];
    for (const { path, text } of strings([...all, ...CHEMISTRY_FACTS])) {
      expect(text, path).not.toMatch(DECIMAL_POINT);
    }
  });

  it('no quoted string in a component writes a decimal point', () => {
    // Stig 1's CHALLENGES are not exported, so read the source. Only string
    // literals are checked: numbers in code are values, not text.
    const dir = join(__dirname, '..', 'components');
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.tsx'))) {
      const source = readFileSync(join(dir, file), 'utf8');
      for (const literal of source.match(/'(?:[^'\\\n]|\\.)*'/g) ?? []) {
        expect(literal, file).not.toMatch(DECIMAL_POINT);
      }
    }
  });

  it('formatSolubility writes a comma', () => {
    expect(formatSolubility(0.0069)).toBe('0,0069');
    expect(formatSolubility(35.7)).toBe('35,7');
  });
});

describe('decimal comma — components', () => {
  it('components format numbers through formatDecimal, not toFixed', () => {
    // `toFixed` writes a full stop. No component in this game has a
    // legitimate display use for it, so there is no allow-list.
    const dir = join(__dirname, '..', 'components');
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.tsx'))) {
      const lines = readFileSync(join(dir, file), 'utf8').split('\n');
      lines.forEach((line, i) => {
        expect(line, `${file}:${i + 1} formats a number with toFixed`).not.toContain('.toFixed(');
      });
    }
  });
});
