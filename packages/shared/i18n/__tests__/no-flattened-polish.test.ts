import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * The games that keep a Polish translation keep its diacritics.
 *
 * Decisions item 4, Siggi's ruling of 2026-10-02: the language switcher stays only where a
 * game translates, and wherever Polish stays its diacritics are restored in one pass, with
 * this guard. Four games' Polish blocks had lost every one — `Uklad okresowy`, `stezenie`,
 * `Rownowaga` — the same defect `no-flattened-icelandic.test.ts` guards in the Icelandic.
 *
 * Like that test, it works from a list of words seen flattened, not a rule: nothing tells
 * `sie` from `się` by shape. Extend the list when a new one turns up.
 */

const repoRoot = join(__dirname, '..', '..', '..', '..');
const gamesRoot = join(repoRoot, 'apps', 'games');

const FLATTENED = [
  /\bsie\b/,
  /\bktor(a|e|y|ych|zy)\b/,
  /\buklad\w*/,
  /\bstezen\w*/,
  /\bpojec(ia|iach|ie)?\b/,
  /\bpojreci\w*/,
  /\bwspolczynnik\w*/,
  /\bsciezk\w*/,
  /\bpostep\b/i,
  /\bcalkowit\w*/i,
  /\bukonczon\w*/i,
  /\bukonczyl\w*/i,
  /\bdokladnos\w*/i,
  /\brownowag\w*/i,
  /\buzyj\b/i,
  /\busun\b/i,
  /\bzwieksz\b/i,
  /\bw przod\b/,
  /\bcisnien\w*/,
  /\bobliczen\b/i,
  /\bwzorow\b/,
  /\bpierwiastkow\b/,
  /\bdziala\w*/,
  /\brzedu\b/,
  /\brozcienczan\w*/,
  /\bnauczyl(es|as)\b/,
  /\bjesli\b/,
  /\bznajdz\b/i,
  /\bprzesuniec\w*/i,
  /\bporownaj\b/i,
  /\bokreslic\b/,
  /\bstala\b/i,
  /\bczasteczk\w*/,
  /\bobjetosc\w*/,
  /\bwplywaj\w*/,
  /\bpowrot\b/i,
  /\bsredni\b/i,
  /\bogolny\b/i,
  /\bpelne\b/i,
];

/**
 * `\b` and `\w` are ASCII-only, so `usun` would match inside the correct `usunąć`: the `ą`
 * counts as a word boundary. Each pattern is matched with letter-aware edges instead.
 */
function unicodeWords(pattern: RegExp): RegExp {
  const source = pattern.source
    .replace(/^\\b/, '(?<!\\p{L})')
    .replace(/\\b$/, '(?!\\p{L})')
    .replace(/\\w\*/g, '\\p{L}*');
  return new RegExp(source, `g${pattern.flags.includes('i') ? 'i' : ''}u`);
}

/** Each game's Polish block, the text from `  pl: {` to the end of its i18n.ts. */
function polishBlocks(): { game: string; text: string }[] {
  return readdirSync(gamesRoot, { withFileTypes: true })
    .filter((y) => y.isDirectory() && /^\d-ar$/.test(y.name))
    .flatMap((y) =>
      readdirSync(join(gamesRoot, y.name), { withFileTypes: true })
        .filter((g) => g.isDirectory())
        .map((g) => ({
          game: `${y.name}/${g.name}`,
          file: join(gamesRoot, y.name, g.name, 'src', 'i18n.ts'),
        }))
    )
    .filter(({ file }) => existsSync(file))
    .map(({ game, file }) => {
      const source = readFileSync(file, 'utf8');
      const start = source.indexOf('\n  pl: {');
      return { game, text: start === -1 ? '' : source.slice(start) };
    })
    .filter((b) => b.text !== '');
}

describe('Polish translations', () => {
  const blocks = polishBlocks();

  it('finds the Polish blocks it is meant to check', () => {
    expect(blocks.length).toBeGreaterThanOrEqual(8);
  });

  it('does not match inside a correctly accented word', () => {
    const sample = 'usunąć, Ukończone, stężenie, równowaga, się, które';
    expect(FLATTENED.flatMap((p) => sample.match(unicodeWords(p)) ?? [])).toEqual([]);
    expect('usun sie'.match(unicodeWords(/\busun\b/i))).toEqual(['usun']);
  });

  it.each(blocks.map((b) => [b.game, b] as const))('%s keeps its diacritics', (_game, block) => {
    const hits = FLATTENED.flatMap((pattern) => block.text.match(unicodeWords(pattern)) ?? []);
    expect(hits).toEqual([]);
  });
});
