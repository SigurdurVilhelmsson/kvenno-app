import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { gameTranslations } from '../i18n';

/**
 * The redox game's Icelandic, held to the forms that were corrected on 2026-09-23.
 *
 * Every entry below shipped. Each is either not a word (`myndafnið`, `koparmal`, `tengisl`,
 * `Munaðu`), a word with its accents stripped (`Syna visbendingu`, `sulfat`), a compound built
 * three ways in one game (`rafeindiflutning`, `Rafeinduflutningur`, where the textbook writes
 * `rafeindaflutningur`), a term `ordabok.md` settles otherwise (`helmingshvarf` for
 * `half reaction;hálfhvarf`), a disagreement in gender or number (`Báðar hálfhvörf`, `Hvað er
 * hálfhvörf?`, `Ímyndað hleðsla`), or English in the Icelandic UI.
 */

const SRC = join(__dirname, '..');
/** The browser tab's `<title>` and the page's description live here, outside `src/`. */
const INDEX_HTML = join(SRC, '..', 'index.html');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

const FORBIDDEN: { wrong: RegExp; right: string }[] = [
  { wrong: /myndafn/i, right: 'myndefnið' },
  { wrong: /\bkoparmal\b/i, right: 'koparmálm' },
  { wrong: /\bSyna visbendingu\b/i, right: 'Sýna vísbendingu' },
  { wrong: /\bsulfat/i, right: 'súlfatjón' },
  { wrong: /rafeind[iu]flutning/i, right: 'rafeindaflutningur' },
  { wrong: /helmingshv/i, right: 'hálfhvarf' },
  { wrong: /hálf-hv/i, right: 'hálfhvarf (one word)' },
  { wrong: /Hálfhvarfaaðferð|hálfhvörf aðferð/i, right: 'hálfhvarfsaðferð (the textbook form)' },
  { wrong: /Báðar hálf/i, right: 'Bæði hálfhvörfin (neuter)' },
  { wrong: /Hvað er hálfhvörf/i, right: 'Hvað eru hálfhvörf?' },
  { wrong: /Ímyndað hleðsla/i, right: 'Ímynduð hleðsla (feminine)' },
  { wrong: /tengisl\b/i, right: 'tengi / jónatengi' },
  { wrong: /ávöxtun/i, right: 'rafeindir sem önnur öðlast' },
  // `öðlast` is deponent and transitive, never passive: "rafeindir sem öðlast" says the
  // electrons acquire something. The species that gains them is its subject, as in the Stig 3
  // intro's "fjölda sem önnur öðlast".
  { wrong: /rafeindir sem öðlast/i, right: 'rafeindir sem önnur öðlast' },
  { wrong: /\bMunaðu\b/, right: 'Mundu' },
  { wrong: /\bZink\b/, right: 'Sink' },
  { wrong: /kalíum bróm\b/i, right: 'kalíumbrómíð' },
  { wrong: /Permanganat jón/i, right: 'Permanganatjónin' },
  { wrong: /Heildar stig/i, right: 'Heildarstig' },
  { wrong: /Rafeindasamskipti/i, right: 'Rafeindaflutningur' },
  { wrong: /\(Electron Transfer\)|\b(Daniell|Mg-Cu|Fe-Cu|Zn-Ag) Cell\b/, right: 'Icelandic' },
  // An Icelandic compound is not written open; the game's own form is `redox-hvörf`.
  { wrong: /\bredox (hv|jöfn|efnafr)/i, right: 'redox-hvörf / redox-jöfnur (hyphenated)' },
  // `jafnvægi` is equilibrium; balancing an equation is `stilla` (CLAUDE.md).
  { wrong: /jafnvægi redox/i, right: 'stilla redox-jöfnur' },
];

describe('the redox game’s Icelandic', () => {
  const files = sourceFiles(SRC);

  it('finds the files it is meant to scan', () => {
    const names = files.map((f) => f.slice(SRC.length + 1));
    for (const expected of [
      'App.tsx',
      'i18n.ts',
      'data/half-reactions.ts',
      'components/HalfReactionBalancer.tsx',
      'components/OxidationStateDisplay.tsx',
    ]) {
      expect(names).toContain(expected);
    }
  });

  it('ships none of the corrected forms', () => {
    const offences: string[] = [];
    for (const file of [...files, INDEX_HTML]) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          for (const { wrong, right } of FORBIDDEN) {
            const hit = line.match(wrong);
            if (hit) offences.push(`${file.slice(SRC.length + 1)}:${i + 1} "${hit[0]}" → ${right}`);
          }
        });
    }
    expect(offences).toEqual([]);
  });

  it('prints each "what you learned" line once, not after its own label again', () => {
    // App.tsx renders `<strong>{concept}:</strong> {learnX}`, so a learnX that opened with its
    // own label read "Oxun: Oxun: Tapa rafeindum …" in all three languages.
    for (const [lang, tr] of Object.entries(gameTranslations)) {
      const { complete, concepts } = tr as {
        complete: Record<string, string>;
        concepts: Record<string, string>;
      };
      for (const [key, label] of [
        ['learnOxNum', concepts.oxidationNumber],
        ['learnOx', concepts.oxidation],
        ['learnRed', concepts.reduction],
        ['learnBalance', concepts.balancing],
      ]) {
        expect(complete[key], `${lang} ${key}`).not.toMatch(/^[^:]{2,30}: /);
        expect(complete[key].startsWith(label), `${lang} ${key}`).toBe(false);
      }
    }
  });

  it('gives "þarfnast" its genitive in the Stig 3 worked example', () => {
    // `þarfnast` governs the genitive: "afoxun þarfnast 2 rafeinda", not "2 rafeindir".
    const level3 = readFileSync(join(SRC, 'components/Level3.tsx'), 'utf8')
      .replace(/\{' '\}/g, ' ')
      .replace(/<\/?strong>/g, '')
      .replace(/\s+/g, ' ');
    expect(level3).toMatch(/þarfnast 2 rafeinda\b/);
    expect(level3).not.toMatch(/þarfnast \d+ rafeindir/);
  });

  it('names the game in its header exactly as the tab and the hub card do', () => {
    // App passes `menu.title` to the shared Header as `gameTitle`, which the platform's
    // game-titles-agree test cannot see (it reads only a literal `gameTitle="…"`).
    const tab = readFileSync(INDEX_HTML, 'utf8').match(/<title>(.*?) - Kvennaskólinn<\/title>/);
    expect(tab?.[1]).toBe('Oxun og afoxun');
    const menu = gameTranslations.is.menu as Record<string, string>;
    expect(menu.title).toBe(tab?.[1]);
  });

  it('writes a Stig 2 back button with the arrow the other levels have', () => {
    const level2 = readFileSync(join(SRC, 'components/Level2.tsx'), 'utf8');
    // The arrow was inside the fallback, and `common.back` exists, so it never showed.
    expect(level2).not.toMatch(/t\('common\.back', '←/);
    expect(level2.match(/← \{t\('common\.back', 'Til baka'\)\}/g)).toHaveLength(2);
  });
});
