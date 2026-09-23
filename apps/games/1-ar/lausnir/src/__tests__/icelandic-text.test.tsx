import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Beaker } from '../components/Beaker';

/**
 * Icelandic this game shipped wrong, found in the 2026-09 mobile pass, and the
 * dead level-gating wording CLAUDE.md recorded against it.
 *
 * Each pattern is written so that it does not itself spell the wrong form —
 * character classes and repetition counts instead — because the platform's
 * text guards scan test files too, and a list of flattened words would trip
 * the guard it exists beside.
 */

const SRC = join(__dirname, '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sourceFiles(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

const WRONG: { pattern: RegExp; why: string }[] = [
  { pattern: /\bStig[u]r\b/, why: 'the level is "Stig", as everywhere else in the game' },
  { pattern: /S[y]na v[i]sbendingu/, why: 'flattened: "Sýna vísbendingu"' },
  { pattern: /Hle[ð]\s/, why: '"Sæki", not "Hleð": hleðsla is electric charge' },
  { pattern: /útkomu[n]{2}a/, why: 'misspelt: "útkomuna"' },
  { pattern: /\bBik[e]r\b/, why: 'not a word: a beaker is "bikarglas" (ordabok.md)' },
  { pattern: /reiknivil{3}a/, why: 'misspelt: "reiknivilla"' },
  { pattern: /\beng[i]n útreikningar/i, why: 'útreikningur is masculine: "engir"' },
  { pattern: /Heildar[ ]stig/, why: 'a compound: "Heildarstig"' },
  { pattern: /B[æ]ði breyturnar/, why: 'breyta is feminine: "Báðar breyturnar"' },
  { pattern: /sterk[a]r lausnar/, why: 'genitive of "sterk lausn" is "sterkrar lausnar"' },
  { pattern: /Sam[a] styrkur/, why: 'styrkur is masculine: "Sami styrkur"' },
  { pattern: /eit[t] hæsta hitaháðni/, why: 'hitaháðni is feminine: "eina hæstu hitaháðni"' },
  { pattern: /Hve[r] er nýja rúmmálið/, why: 'rúmmál is neuter: "Hvert er"' },
  {
    pattern: /(með|hefur) mett[u]ð [^'.]*lausn/,
    why: '"vera með" and "hafa" take the accusative: "mettaða … lausn"',
  },
  { pattern: /af glúkós[u]\b/, why: 'the textbook declines glúkósi as masculine: "af glúkósa"' },
  {
    pattern: /Til að auka styrk, hvað getur þú gert/,
    why: 'Eykst / Minnkar / Óbreytt cannot answer "what can you do"',
  },
  { pattern: /need[S]core|til að opna Stig/i, why: 'levels are not gated (ruling 2026-08-29)' },
];

describe('the game source does not carry Icelandic it shipped wrong', () => {
  const files = sourceFiles(SRC);

  it('scans the game source', () => {
    expect(files.length).toBeGreaterThan(10);
    expect(files.some((f) => f.endsWith('i18n.ts'))).toBe(true);
  });

  it.each(WRONG.map((w) => [w.why, w.pattern] as const))('%s', (_why, pattern) => {
    const hits: string[] = [];
    for (const file of files) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (pattern.test(line))
            hits.push(`${file.slice(SRC.length + 1)}:${i + 1}: ${line.trim()}`);
        });
    }
    expect(hits).toEqual([]);
  });
});

describe('the Stig 1 beaker has an Icelandic accessible name', () => {
  afterEach(cleanup);

  it('names it bikarglas and rounds the molarity', () => {
    // 50 particles × 0,01 mól in 300 mL is 1,666… M; the name read out every
    // digit of the float.
    render(<Beaker volume={300} maxVolume={500} concentration={0.5 / 0.3} />);
    const img = screen.getByRole('img');
    const name = img.getAttribute('aria-label') ?? '';
    expect(name).toMatch(/^Bikarglas: 300 mL, 1,67 M$/);
    expect(img.querySelector('title')?.textContent).toBe(
      'Bikarglas með 300 mL lausn af styrk 1,67 M'
    );
  });
});
