import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

/**
 * A game has one name, and all three places it appears say the same thing.
 *
 * The three places a student meets a game's name:
 *
 *  1. the **hub card** in `apps/landing/src/pages/GamesHub.tsx` — how they find it
 *  2. the **browser tab**, `<title>` in the game's `index.html` — what a bookmark keeps
 *  3. the **in-game header**, `gameTitle` on the shared `Header`
 *
 * **Why this exists.** On 2026-09-19, ten of the twenty-two games disagreed with
 * themselves across those three. `3-ar/gas-law-challenge` was called
 * `Gas Law Challenge` — in English, against CLAUDE.md's first rule — at four
 * student-facing sites while its hub card said `Gaslögmál`.
 * `3-ar/buffer-recipe-creator`'s tab read `Púfferuppskrift`, carrying a term
 * banned since August into the one string every browser tab shows. Two games
 * carried two different names outright: `1-ar/molmassi` was `Mólhugtakið` on the
 * hub and `Molmassi Leikur` in its tab, and `1-ar/nafnakerfid` was `Nafnakerfið`
 * against `Nafnapör - Efnanöfn`. The rest drifted on mid-title capitals that
 * Icelandic does not take, a missing accent in `pH Titrun`, and three tabs
 * suffixed `| Kvennaskólinn` where nineteen used `- Kvennaskólinn`.
 *
 * **Siggi ruled the two real name conflicts on 2026-09-19 — `Mólhugtakið` and
 * `Nafnakerfið`, the hub-card name in both cases** — which is what made this test
 * writable. Until then it could not be, because it needs to know which name is
 * right; a test cannot settle a naming question, only hold one that is settled.
 *
 * The hub card is the source of truth here, since it is the only one of the
 * three a student sees before choosing the game.
 */

const repoRoot = join(__dirname, '..', '..', '..', '..');
const gamesRoot = join(repoRoot, 'apps', 'games');

/** Every tab title ends this way. Nineteen of the original twenty-two already did. */
const TAB_SUFFIX = ' - Kvennaskólinn';

/**
 * `2-ar/rafeindabygging` sets `gameTitle` per screen — `Skammtatölur`,
 * `Rafeindasmíð`, `Lotukerfi og rafeindir` and their `— Kennsla` variants — so
 * the header names the sub-topic the student is in rather than the game. That is
 * deliberate and useful, and it is the only game built that way. Its hub card and
 * tab still have to agree; only the header check is waived.
 */
const HEADER_EXEMPT = new Set(['rafeindabygging']);

function hubCards(): Map<string, string> {
  const src = readFileSync(join(repoRoot, 'apps/landing/src/pages/GamesHub.tsx'), 'utf8');
  const cards = new Map<string, string>();
  const re = /title:\s*'([^']+)',\s*\n\s*description:[^\n]*\n\s*slug:\s*'([^']+)'/g;
  for (const m of src.matchAll(re)) cards.set(m[2], m[1]);
  return cards;
}

function tsxFiles(dir: string): string[] {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === 'dist') return [];
      return tsxFiles(full);
    }
    return /\.tsx$/.test(e.name) && !/\.test\.tsx$/.test(e.name) ? [full] : [];
  });
}

interface Game {
  slug: string;
  dir: string;
  tab: string | null;
  /** Header titles, literal or resolved from a `t()` call. */
  headers: string[];
  /** `gameTitle={t('key')}` calls still to be resolved against the game's i18n. */
  tCalls: { key: string; fallback?: string }[];
  /** `gameTitle={…}` expressions this test cannot read: a variable, a ternary. */
  opaque: string[];
}

/**
 * `gameTitle={t('game.title')}` — ten games pass their header title through the
 * translation hook instead of writing it literally. Until 2026-09-23 this test
 * read only `gameTitle="…"`, so those ten were never checked at all, which is
 * how `1-ar/takmarkandi` shipped `Takmarkandi Hvarfefni` in its header while its
 * hub card said `Takmarkandi hvarfefni`. The optional second argument is the
 * fallback `t()` returns when the key is missing.
 */
const T_CALL = /gameTitle=\{t\(\s*'([^']+)'\s*(?:,\s*'([^']*)'\s*)?\)\}/g;
/** Any other `gameTitle={…}`, so an unreadable one fails instead of being skipped. */
const OPAQUE = /gameTitle=\{(?!t\(\s*'[^']+'\s*(?:,\s*'[^']*'\s*)?\)\})([^}]*)\}/g;

type Dictionary = { [key: string]: string | Dictionary };

/** What `useGameI18n`'s `t()` shows an Icelandic student: the `is` value, else the fallback. */
function lookup(dictionary: Dictionary, key: string): string | undefined {
  let value: string | Dictionary | undefined = dictionary;
  for (const part of key.split('.')) {
    if (value === undefined || typeof value === 'string') return undefined;
    value = value[part];
  }
  return typeof value === 'string' ? value : undefined;
}

async function resolveTitles(game: Game): Promise<void> {
  if (game.tCalls.length === 0) return;
  const i18n = (await import(join(game.dir, 'src', 'i18n.ts'))) as {
    gameTranslations: { is: Dictionary };
  };
  for (const { key, fallback } of game.tCalls) {
    const title = lookup(i18n.gameTranslations.is, key) ?? fallback;
    // `t()` returns the key itself when both are missing, which is what the
    // student would then see in the header — so that is what gets compared.
    game.headers.push(title ?? key);
  }
}

/** A directory with no index.html is not a game, so it drops out rather than failing. */
function readTabTitle(dir: string): string | null {
  try {
    return (
      readFileSync(join(dir, 'index.html'), 'utf8').match(/<title>(.*?)<\/title>/)?.[1] ?? null
    );
  } catch {
    return null;
  }
}

function games(): Game[] {
  return readdirSync(gamesRoot, { withFileTypes: true })
    .filter((y) => y.isDirectory() && /^\d-ar$/.test(y.name))
    .flatMap((y) =>
      readdirSync(join(gamesRoot, y.name), { withFileTypes: true })
        .filter((g) => g.isDirectory())
        .map((g) => {
          const dir = join(gamesRoot, y.name, g.name);
          const tab = readTabTitle(dir);
          const headers = new Set<string>();
          const tCalls: Game['tCalls'] = [];
          const opaque: string[] = [];
          for (const f of tsxFiles(join(dir, 'src'))) {
            const text = readFileSync(f, 'utf8');
            for (const m of text.matchAll(/gameTitle="([^"]+)"/g)) headers.add(m[1]);
            for (const m of text.matchAll(T_CALL)) tCalls.push({ key: m[1], fallback: m[2] });
            for (const m of text.matchAll(OPAQUE)) opaque.push(m[1].trim());
          }
          return { slug: g.name, dir, tab, headers: [...headers], tCalls, opaque };
        })
        .filter((g) => g.tab !== null)
    );
}

const CARDS = hubCards();
const GAMES = games();
// Resolved before the `it.each` tables below are built, which is why this is a
// top-level await rather than a beforeAll.
await Promise.all(GAMES.map(resolveTitles));

describe('every game has one name', () => {
  it('finds every game and a hub card for each', () => {
    // 26 since `3-ar/jafnvaegisfasti` landed. The number is asserted rather
    // than derived so that a game which fails to register shows up here too.
    expect(GAMES.length).toBe(26);
    for (const g of GAMES) {
      expect(CARDS.get(g.slug), `${g.slug} has no card in GamesHub.tsx`).toBeDefined();
    }
  });

  it.each(GAMES.map((g) => [g.slug, g] as const))(
    '%s: the browser tab matches the hub card',
    (slug, game) => {
      const expected = `${CARDS.get(slug)}${TAB_SUFFIX}`;
      expect(
        game.tab,
        `${slug}/index.html's <title> disagrees with its hub card. The hub card wins — ` +
          'it is the only one of the three a student reads before choosing the game.'
      ).toBe(expected);
    }
  );

  it.each(
    GAMES.filter((g) => !HEADER_EXEMPT.has(g.slug) && g.headers.length > 0).map(
      (g) => [g.slug, g] as const
    )
  )('%s: the in-game header matches the hub card', (slug, game) => {
    expect(
      [...new Set(game.headers)],
      `${slug}'s Header gameTitle disagrees with its hub card`
    ).toEqual([CARDS.get(slug)]);
  });

  it('reads every header title, including the ones passed through t()', () => {
    // The guard on the guard: if the t() reader stopped matching, the header
    // check above would quietly shrink back to the literal-only games.
    const viaT = GAMES.filter((g) => g.tCalls.length > 0).map((g) => g.slug);
    expect(viaT.length, `games whose header title comes from t(): ${viaT.join(', ')}`).toBe(10);
    for (const g of GAMES.filter((x) => !HEADER_EXEMPT.has(x.slug))) {
      expect(g.opaque, `${g.slug} passes gameTitle an expression this test cannot read`).toEqual(
        []
      );
    }
  });

  it('the header exemption is real, and is only used where it is earned', () => {
    // If rafeindabygging ever collapses to a single gameTitle, delete it from
    // HEADER_EXEMPT rather than leaving a waiver nothing needs.
    for (const slug of HEADER_EXEMPT) {
      const game = GAMES.find((g) => g.slug === slug);
      expect(game, `${slug} is exempt but is not a game`).toBeDefined();
      expect(
        game!.headers.length,
        `${slug} no longer sets gameTitle per screen — remove it from HEADER_EXEMPT`
      ).toBeGreaterThan(1);
    }
  });

  it('no name is English, and none carries the other suffix', () => {
    // The two specific shapes this test was written after. `Gas Law Challenge`
    // shipped for months; `| Kvennaskólinn` and `| Kvennó` split three tabs from
    // the other nineteen.
    for (const g of GAMES) {
      expect(g.tab, `${g.slug} kept the English title`).not.toMatch(/Gas Law Challenge/);
      expect(g.tab, `${g.slug} uses "|" where the suffix is " - Kvennaskólinn"`).not.toContain('|');
    }
  });
});
