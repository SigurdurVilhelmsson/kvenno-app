import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

/**
 * No game ships the scaffold template as its README.
 *
 * **Why this exists.** On 2026-09-22 eight games carried a byte-identical copy
 * of one generic README, headed "Kvennaskólinn Chemistry Game Template". It told
 * the reader to run a `create-game.sh` from `/home/user/ChemistryGames/tools` —
 * neither exists in this repository — and said nothing about the game it sat in.
 * `1-ar/takmarkandi` was replaced first; the other seven the same day.
 *
 * A README that is plainly a template is worse than none: it looks like
 * documentation, so nobody writes the real one. This asserts the markers of that
 * one template are gone. It does not require a README to exist — thirteen games
 * have none — only that the ones that do are about their game.
 */

const repoRoot = join(__dirname, '..', '..', '..', '..');
const gamesRoot = join(repoRoot, 'apps', 'games');

/**
 * Lines only the template ever contained, anchored to the start of a line. A real
 * README may *mention* the template — takmarkandi's says it replaced one that
 * "documented a `create-game.sh`" — and a bare substring match cannot tell that
 * mention from the thing itself. The template's own heading, its setup command
 * and its placeholder step are never written that way in prose.
 */
const TEMPLATE_MARKERS = [
  /^# Kvennaskólinn Chemistry Game Template/m,
  /^\s*(cd \S*ChemistryGames\/tools|\.\/create-game\.sh)/m,
  /^\d+\. \*\*Replace placeholders\*\*/m,
];

function gameReadmes(): { game: string; text: string }[] {
  return readdirSync(gamesRoot, { withFileTypes: true })
    .filter((y) => y.isDirectory() && /^\d-ar$/.test(y.name))
    .flatMap((y) =>
      readdirSync(join(gamesRoot, y.name), { withFileTypes: true })
        .filter((g) => g.isDirectory())
        .map((g) => ({
          game: `${y.name}/${g.name}`,
          file: join(gamesRoot, y.name, g.name, 'README.md'),
        }))
    )
    .filter(({ file }) => existsSync(file))
    .map(({ game, file }) => ({ game, text: readFileSync(file, 'utf8') }));
}

describe('game READMEs', () => {
  const readmes = gameReadmes();

  it('finds the READMEs it is meant to check', () => {
    // Guards against a path change turning every assertion below vacuous.
    expect(readmes.length).toBeGreaterThanOrEqual(10);
  });

  it('none is the scaffold template', () => {
    for (const { game, text } of readmes) {
      for (const marker of TEMPLATE_MARKERS) {
        expect(text, `${game}/README.md matches ${marker}`).not.toMatch(marker);
      }
    }
  });
});
