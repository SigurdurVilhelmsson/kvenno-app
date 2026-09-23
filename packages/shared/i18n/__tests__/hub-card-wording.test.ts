import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * The games-hub card descriptions are the first Icelandic a student reads about
 * a game, and nothing owned them.
 *
 * Every per-game wording pass in September 2026 stopped at its own directory,
 * so a card in `apps/landing/src/pages/GamesHub.tsx` kept a word the game itself
 * had just corrected: the kinetics card still said the old word for a mechanism,
 * the rafeindabygging card the old word for an electron configuration, and the
 * syrufastinn card the case error its game fixed in four places. The two term
 * swaps are held platform-wide by `governed-terms.test.ts`, which scans this
 * file too; what is here is the grammar and spelling that no glossary row can
 * express, each written so the pattern does not itself spell the wrong form.
 */

const repoRoot = join(__dirname, '..', '..', '..', '..');
const hub = readFileSync(join(repoRoot, 'apps/landing/src/pages/GamesHub.tsx'), 'utf8');
const descriptions = [...hub.matchAll(/description:\s*'([^']+)'/g)].map((m) => m[1]);

const WRONG: { pattern: RegExp; why: string }[] = [
  {
    pattern: /nálguni[n] má/,
    why: 'the object of "má nota" is accusative: "nálgunina má nota", as 3-ar/syrufastinn writes it',
  },
  {
    pattern: /fyrir alkan[a]r|alken[a]r og|alk[y]n/,
    why: '"fyrir" takes the accusative, and the triple bond is ý: "fyrir alkana, alkena og alkýna"',
  },
  { pattern: /rafeind[i]flutning/, why: 'misspelt: "rafeindaflutning"' },
  {
    pattern: /jafnvæg[i] redox/,
    why: 'balancing is "stilla" (ruled 2026-08-26), and "jafnvægi" is equilibrium',
  },
  {
    pattern: /sameindager[ð]/,
    why: '1-ar/lotukerfid counts the particles in atoms; its own subtitle says "atómbyggingu"',
  },
];

describe('games-hub card descriptions', () => {
  it('finds every card', () => {
    // 26 games, one description each, plus none elsewhere in the file.
    expect(descriptions.length).toBe(26);
  });

  it.each(WRONG.map((w) => [w.pattern.source, w] as const))(
    'do not say %s',
    (_s, { pattern, why }) => {
      const offences = descriptions.filter((d) => pattern.test(d));
      expect(offences, why).toEqual([]);
    }
  );
});
