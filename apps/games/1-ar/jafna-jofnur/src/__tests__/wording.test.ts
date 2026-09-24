import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

import { REACTIONS } from '../data/reactions';
import { gameTranslations } from '../i18n';

/**
 * Wording defects the platform-wide guards could not see in this game.
 *
 * `governed-terms.test.ts` bans the verb `jafna` only in the forms it lists,
 * so the conjugated question on Stig 1's intro and the bare infinitive at the
 * head of the menu's Stig 1 description both shipped past it — in the very game
 * whose title the `stilla` ruling renamed. The rest are one-off misspellings and
 * a coined word, each caught here by the shape it actually had.
 *
 * The scan skips `__tests__`, so this file can name what it bans. Word edges
 * are `\p{L}` lookarounds rather than `\b`, which is ASCII-only and treats
 * `ð` and `þ` as non-letters.
 */

const gameRoot = join(__dirname, '..', '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === 'node_modules' || entry.name === '__tests__' ? [] : sourceFiles(path);
    }
    return /\.(tsx?|html|json)$/.test(entry.name) ? [path] : [];
  });
}

const BANNED: { pattern: RegExp; why: string }[] = [
  {
    pattern: /(?<!\p{L})jöfnum við(?!\p{L})/iu,
    why: 'the verb is stilla (ruled 2026-08-26): "Af hverju stillum við efnajöfnur?"',
  },
  {
    pattern: /(?<!\p{L})jafna\s+(einfaldar|flóknar|þessar)(?!\p{L})/iu,
    why: 'the verb is stilla (ruled 2026-08-26): "Stilla einfaldar efnajöfnur"',
  },
  { pattern: /(?<!\p{L})að jafna efnajöfn/iu, why: 'the verb is stilla: "að stilla efnajöfnur"' },
  { pattern: /óstillð/i, why: 'not a word — the neuter participle is óstillt' },
  {
    pattern: /tvíbót/i,
    why: 'not a word; ordabok.md: single displacement;einfalt skiptihvarf',
  },
  {
    pattern: /viðbrögð/i,
    why: 'viðbrögð are responses; a chemical reaction is an efnahvarf',
  },
  {
    // ordabok.md: bare skiptihvarf is substitution; only the qualified forms
    // name the displacement reactions (Siggi, 2026-08-29).
    // Any inflection of the qualifier counts: einfalt, einföld, einfalds, einföldum, …
    pattern: /(?<!(?:einf|tvöf)\p{L}*\s)skiptihv/iu,
    why: 'displacement takes its qualifier: einfalt / tvöfalt skiptihvarf',
  },
  {
    pattern: /(?<!\p{L})þeir eru auðveldastir(?!\p{L})/iu,
    why: 'K and Cl (kalíum, klór) are neuter: "þau eru auðveldust"',
  },
];

describe('jafna-jofnur wording', () => {
  const files = sourceFiles(gameRoot);

  it('scans the source it means to', () => {
    const names = files.map((f) => relative(gameRoot, f));
    expect(names).toEqual(
      expect.arrayContaining([
        'index.html',
        'package.json',
        'src/i18n.ts',
        'src/components/levelConfigs.tsx',
        'src/components/Level.tsx',
        'src/data/reactions.ts',
      ])
    );
  });

  it.each(BANNED.map((b) => [b.pattern.source, b] as const))(
    'bans %s',
    (_source, { pattern, why }) => {
      const hits = files.flatMap((file) =>
        readFileSync(file, 'utf8')
          .split('\n')
          .map((line, i) => ({ line, at: `${relative(gameRoot, file)}:${i + 1}` }))
          .filter(({ line }) => pattern.test(line))
          .map(({ at, line }) => `${at}  ${line.trim()}`)
      );
      expect(hits, why).toEqual([]);
    }
  );
});

/** Read a translation by dotted path, e.g. `at('is', 'menu.level3.description')`. */
function at(lang: 'is' | 'en' | 'pl', path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], gameTranslations[lang]);
}

describe("the menu's Stig 3 description matches Stig 3", () => {
  // It said double displacement. No Stig 3 equation is one; two are single
  // displacements, an element taking another's place in a compound.
  const hard = REACTIONS.filter((r) => r.difficulty === 'hard');
  const isElement = (m: { elements: Record<string, number> }) =>
    Object.keys(m.elements).length === 1;

  const singleDisplacements = hard.filter(
    (r) =>
      r.reactants.length === 2 &&
      r.products.length === 2 &&
      r.reactants.filter(isElement).length === 1 &&
      r.products.filter(isElement).length === 1 &&
      Object.keys(r.reactants.find(isElement)!.elements)[0] !==
        Object.keys(r.products.find(isElement)!.elements)[0]
  );

  it('has single displacements to describe', () => {
    expect(singleDisplacements.map((r) => r.id).sort()).toEqual([17, 18]);
  });

  it('names them with the governed term', () => {
    expect(at('is', 'menu.level3.description')).toMatch(/einföld skiptihvörf/);
    expect(at('is', 'menu.level3.tags.displacement')).toBe('Einföld skiptihvörf');
  });

  // A double displacement swaps partners between two compounds, AB + CD → AD + CB,
  // so all four species are compounds. No Stig 3 equation has that shape, and no
  // language may say it does — the Polish block said "wymiana podwójna".
  const doubleDisplacements = hard.filter(
    (r) =>
      r.reactants.length === 2 &&
      r.products.length === 2 &&
      [...r.reactants, ...r.products].every((m) => !isElement(m))
  );

  it('does not claim a double displacement in any language', () => {
    expect(doubleDisplacements).toEqual([]);
    expect(at('is', 'menu.level3.description')).not.toMatch(/tvöf|tvíb/i);
    expect(at('en', 'menu.level3.description')).not.toMatch(/double/i);
    expect(at('pl', 'menu.level3.description')).not.toMatch(/podwójn/i);
  });
});

describe("the learning path's element counts match the levels", () => {
  // Step 1 said "með 2 frumefnum", and Li + H₂O → LiOH + H₂ has three.
  const elementCount = (r: (typeof REACTIONS)[number]) =>
    new Set([...r.reactants, ...r.products].flatMap((m) => Object.keys(m.elements))).size;
  const counts = (difficulty: string) =>
    REACTIONS.filter((r) => r.difficulty === difficulty).map(elementCount);

  it.each(['is', 'en', 'pl'] as const)('%s', (lang) => {
    const step1 = String(at(lang, 'menu.learningPath.step1.description'));
    const range = step1.match(/(\d+)(?:\s*[–-]\s*(\d+))?/);
    expect(range, step1).not.toBeNull();
    const lo = Number(range![1]);
    const hi = Number(range![2] ?? range![1]);
    for (const n of counts('easy')) {
      const why = `Stig 1 has a ${n}-element equation; step 1 says "${step1}"`;
      expect(n >= lo && n <= hi, why).toBe(true);
    }

    const step2 = String(at(lang, 'menu.learningPath.step2.description'));
    const floor = step2.match(/(\d+)\+/);
    expect(floor, step2).not.toBeNull();
    for (const n of counts('medium')) {
      const why = `Stig 2 has a ${n}-element equation; step 2 says "${step2}"`;
      expect(n >= Number(floor![1]), why).toBe(true);
    }
  });
});
