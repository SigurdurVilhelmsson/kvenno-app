import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

/**
 * Enforce the Icelandic terminology ruling on shipped game and app source.
 *
 * This test exists because a one-time patch demonstrably does not hold: a game
 * written in April 2026 re-committed a term error that had been fixed in
 * February, because nothing checked. `packages/shared/i18n/ordabok.md` governs
 * (see `docs/README.md` and `docs/FEBRUARY-DECISIONS-RECOVERED.md`), and this is
 * what makes it govern rather than merely exist.
 *
 * Scope and limits, stated plainly:
 *
 *  - It covers the terms Phase 2 of the games roadmap ruled on, plus later rulings, not the whole
 *    glossary. Adding a row here is cheap; do it when a term is next disputed and
 *    settled.
 *  - It scans source text, so it catches a banned term wherever it appears —
 *    including in an `i18n.ts` block no game currently renders. That is
 *    deliberate: several games carry dead translation wiring, and a wrong term
 *    parked there ships the moment someone wires it up.
 *  - It cannot check grammatical agreement. Replacing a banned term is not just a
 *    string swap in Icelandic — `púffer` was treated as neuter in some strings and
 *    `stuðpúði` is masculine, so adjectives had to change with it. A future fix
 *    that only swaps the noun will pass this test and still read wrong.
 */

interface GovernedTerm {
  /** English headword, as it appears in ordabok.md. */
  english: string;
  /** The ruled Icelandic term. */
  correct: string;
  /**
   * Wrong forms, as regexes. Written to match any inflection, since Icelandic
   * inflects heavily and a bare-stem check would miss most real occurrences.
   */
  banned: RegExp[];
  /** Shown when the test fails, so the fixer knows which forms are wanted. */
  guidance: string;
}

const GOVERNED_TERMS: GovernedTerm[] = [
  {
    english: 'atomic number',
    correct: 'sætistala',
    banned: [/atómnúmer/i, /raðtal[ae]/i],
    guidance:
      'sætistala is feminine (nom sætistala, def. sætistalan, acc. def. sætistöluna, dat. sætistölu) where atómnúmer was neuter — determiners and adjectives change with it.',
  },
  {
    english: 'enthalpy',
    correct: 'vermi',
    banned: [/skammtavarm/i, /enþalpí/i],
    guidance: 'vermi is masculine, like skammtavarmi, so surrounding agreement is unaffected.',
  },
  {
    english: 'spontaneous / spontaneity',
    correct: 'sjálfgengur / sjálfgengi',
    banned: [/sjálfspyrjand/i, /sjálfviljug/i, /sjálfvilja\b/i],
    guidance:
      'Adjective: sjálfgengur (m) / sjálfgeng (f, and n.pl) / sjálfgengt (n). Noun for spontaneity: sjálfgengi (neuter) — sjálfviljugheit was being treated as feminine, so its adjectives change too.',
  },
  {
    english: 'anode / cathode',
    correct: 'anóða / katóða',
    banned: [/kaþóð/i, /\banoð/i, /katoð/i],
    guidance:
      'Two separate errors. kaþóða is the þ-for-t spelling; anoða and katoða are the ' +
      'accentless forms, which the original ruling did not ban and which therefore ' +
      'survived in an aria-label until 2026-08-27. Both vowels carry an acute: anóða, ' +
      'katóða, and compounds keep it (fórnaranóða).',
  },
  {
    english: 'stoichiometry',
    correct: 'hlutfallaefnafræði',
    banned: [/stökjómetr/i, /stökefnafræð/i, /stækifræð/i],
    guidance:
      "Siggi's ruling, 2026-08-27, where ordabok.md had been silent and the platform " +
      'shipped all three words. hlutfallaefnafræði is feminine and, like efnafræði, ' +
      'does not decline in the singular — so it substitutes cleanly in every case.',
  },
  {
    english: 'balanced equation',
    correct: 'stilla / stillt efnajafna',
    banned: [
      /jafnaðu\b/i,
      /ójafnað/i,
      /jafnaðri efnajöfn/i,
      /þú jafnaðir/i,
      /jafnað (helmingshvarf|hvarf)\b/i,
      /jafna (jöfnur|efnajöfnu|efnajöfnur|hleðslu|hleðslurnar|frumeindir|súrefni|vetni|rafeindir|rafeindirnar)/i,
    ],
    guidance:
      'The verb is stilla, not jafna: að stilla efnajöfnu, Stilltu jöfnuna, stillt efnajafna, óstillt efnajafna. Siggi ruled on this (authority 3) — ordabok.md had no entry, and the platform shipped both words. Note the noun jafna (an equation) and jafnvægi (equilibrium) are unrelated and correct; so is jafnast út (to cancel out) and þrýstijafnaður (pressurised).',
  },
  {
    english: 'carbon dioxide',
    correct: 'koldíoxíð',
    banned: [/koltvísýring/i],
    guidance:
      "Siggi's ruling, 2026-08-26 — ordabok.md was silent and the platform shipped both words. koldíoxíð is neuter where koltvísýringur was masculine, so the cases change with it: acc. koldíoxíð (not -ing), dat. koldíoxíði (not -ingi), gen. koldíoxíðs / def. koldíoxíðsins (not -ings / -ingsins). Unrelated and left alone: kolsýringur, which is CO, not CO₂.",
  },
  {
    english: 'atomic radius',
    correct: 'atómradíus',
    banned: [/atómgeisl/i],
    guidance:
      "Siggi's ruling, 2026-08-27, agreeing with ordabok.md (atomic radius;atómradíus) and the textbook corpus (23 hits for atómradíus, zero for atómgeisl-). Both are masculine, so agreement is unaffected. atómgeisli was an old-repo coinage that arrived with the periodic-trends harvest.",
  },
  {
    english: 'solubility',
    correct: 'leysni',
    banned: [/leysiget/i, /leysanleik/i],
    guidance:
      "Siggi's ruling, 2026-08-27, agreeing with ordabok.md (solubility;leysni) and the textbook corpus (260 hits for leysni, zero for leysigeta). leysni and leysigeta are both feminine and leysni does not decline in the singular oblique cases, so nothing around it moves. The adjective leysanlegur (soluble) is a different word and is not banned.",
  },
  {
    english: 'shell',
    correct: 'hvolf',
    banned: [/rafeindaskel/i, /undirskel/i, /\bd-skel/i, /\bskel(in|ina|inni|jar|jum|ja)?\b/i],
    guidance:
      "Siggi's ruling, 2026-08-27, agreeing with ordabok.md (shell;hvolf) and the textbook corpus (133 hits for hvolfi and 33 for gildishvolf, against 7 for skelja). hvolf is NEUTER where skel was feminine, so every adjective and determiner moves with it: fulla ystu skel becomes fullt ysta hvolf, í ystu skel becomes í ysta hvolfi, fullrar ystu skeljar becomes fulls ysta hvolfs, allar skeljar fylltar becomes öll hvolf fyllt. Declension: hvolf / hvolf / hvolfi / hvolfs, plural hvolf / hvolf / hvolfum / hvolfa. Unrelated and left alone: skeljabrot (seashell fragments) in nafnakerfid.",
  },
  {
    english: 'buffer',
    correct: 'stuðpúði',
    banned: [/púffer/i],
    guidance:
      'stuðpúði is masculine; compounds take the genitive stem stuðpúða- (stuðpúðalausn, stuðpúðageta, stuðpúðasvæði), plural stuðpúðar. púffer was neuter in some strings, so adjectives change with it.',
  },
];

/** Directories whose rendered strings a student can actually meet. */
const SCANNED_ROOTS = [
  'apps/games',
  'apps/landing/src',
  'apps/islenskubraut/src',
  'packages/shared/components',
];

// packages/shared/i18n/__tests__ -> four levels up is the repo root.
const repoRoot = join(__dirname, '..', '..', '..', '..');

function sourceFiles(dir: string): string[] {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') return [];
      return sourceFiles(full);
    }
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

const files = SCANNED_ROOTS.flatMap((root) => sourceFiles(join(repoRoot, root)));

describe('governed Icelandic terminology', () => {
  it('finds source files to scan, so it cannot silently cover nothing', () => {
    expect(files.length).toBeGreaterThan(100);
  });

  it.each(GOVERNED_TERMS.map((t) => [t.english, t] as const))(
    '%s is written as the glossary rules',
    (_english, term) => {
      const offences: string[] = [];

      for (const file of files) {
        const lines = readFileSync(file, 'utf8').split('\n');
        lines.forEach((line, i) => {
          for (const pattern of term.banned) {
            const match = pattern.exec(line);
            if (match) {
              offences.push(
                `${file.slice(repoRoot.length + 1)}:${i + 1} — "${match[0]}" in: ${line.trim().slice(0, 100)}`
              );
              break;
            }
          }
        });
      }

      expect(
        offences,
        `Banned term for "${term.english}". Use ${term.correct}.\n${term.guidance}\n\n` +
          `packages/shared/i18n/ordabok.md governs; see docs/FEBRUARY-DECISIONS-RECOVERED.md.\n\n` +
          offences.join('\n')
      ).toEqual([]);
    }
  );
});

describe('the ruling this test enforces', () => {
  const ordabok = readFileSync(join(repoRoot, 'packages/shared/i18n/ordabok.md'), 'utf8');

  it.each(GOVERNED_TERMS.map((t) => [t.english, t] as const))(
    'ordabok.md still rules on %s',
    (english, term) => {
      // If a headword is renamed or dropped from the glossary, this test's
      // authority disappears with it — fail here rather than keep enforcing a
      // ruling that no longer exists.
      const headword = english.split(' / ')[0];
      expect(ordabok, `no "${headword};" entry in ordabok.md`).toMatch(
        new RegExp(`^${headword};`, 'm')
      );
      const primary = term.correct.split(' / ')[0];
      expect(ordabok, `ordabok.md no longer gives ${primary}`).toContain(primary);
    }
  );
});
