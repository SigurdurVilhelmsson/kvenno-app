import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * K and Q are neuter, as the symbols are read (mobile-pass decision 99, Siggi's ruling
 * 2026-10-23: `K er stórt`, `Q er minna`). The game said both: Skilja and `coupled.ts` agreed K
 * as a masculine (after `fasti`), the problem contexts as a neuter, and a pass the same day had
 * made them all masculine before the ruling settled it the other way.
 */

const SRC = join(__dirname, '..');

function sources(dir = SRC): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === '__tests__') return [];
    if (statSync(path).isDirectory()) return sources(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

/** A masculine adjective or pronoun agreeing with K, Kp, Kc or Q. */
const MASCULINE = [
  /\b(?:K|Kp|Kc|Q)\b (?:er|verður|var|sé)(?: (?:svo|mjög|einfaldlega|þá))? (?:háður|lítill|stór|smár|örsmár|marklaus|mikill|óháður|fastur)\b/,
  // No leading \b: JavaScript's \b does not count Ö as a letter.
  /(?:Stór|Lítill|Örsmár) (?:K|Kp|Kc|Q)\b/,
  /\bstór (?:K|Kp|Kc|Q)\b/,
  /\b(?:K|Kp) (?:örsmár|stór)[,.]/,
];

describe('K and Q are neuter', () => {
  const files = sources();

  it('finds the source it scans', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it('agrees no K or Q as a masculine', () => {
    const hits = files.flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .flatMap((line, i) =>
          MASCULINE.some((form) => form.test(line)) ? [`${relative(SRC, file)}:${i + 1}`] : []
        )
    );
    expect(hits).toEqual([]);
  });

  it('says the neuter where the game used to say both', () => {
    const all = files.map((file) => readFileSync(file, 'utf8')).join('\n');
    for (const form of ['K er háð', 'K örsmátt', 'K stórt', 'Stórt Kp', 'Kp er örsmátt']) {
      expect(all).toContain(form);
    }
  });
});
