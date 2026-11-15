import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Siggi, 2026-11-15 (year-2 audit, decision 1): every game's menu cites the chapter of the
 * students' own book, the Icelandic `Efnafræði 2e`, beside the Námsleiðin line. Until then
 * sixteen menus cited Brown's English edition, whose chapter numbers differ (Lewis 8 for the
 * book's 7, kinetics 14 for 12), and ten cited nothing.
 */
const repoRoot = join(__dirname, '..', '..', '..', '..');
const gamesRoot = join(repoRoot, 'apps', 'games');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === '__tests__' || name === 'node_modules') return [];
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return name.endsWith('.tsx') ? [path] : [];
  });
}

const games = ['1-ar', '2-ar', '3-ar'].flatMap((year) =>
  readdirSync(join(gamesRoot, year))
    .filter((g) => existsSync(join(gamesRoot, year, g, 'src')))
    .map((g) => `${year}/${g}`)
);

const CITATION = /Kafl(?:i \d+|ar \d+(?:–\d+| og \d+)) — Efnafræði 2e/;

describe('every game menu cites the Icelandic book', () => {
  it('finds all the games', () => {
    expect(games.length).toBeGreaterThanOrEqual(26);
  });

  it.each(games)('%s cites a chapter of Efnafræði 2e beside its Námsleiðin', (game) => {
    const menu = sourceFiles(join(gamesRoot, game, 'src')).find((f) =>
      readFileSync(f, 'utf8').includes('Námsleiðin')
    );
    expect(menu, `${game} has no Námsleiðin line`).toBeDefined();
    const text = readFileSync(menu!, 'utf8');
    expect(text).toMatch(CITATION);
    expect(text).not.toMatch(/Central Science/);
  });
});
