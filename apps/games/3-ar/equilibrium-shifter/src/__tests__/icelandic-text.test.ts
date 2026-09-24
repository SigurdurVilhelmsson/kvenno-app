import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { equilibria } from '../data/equilibria';
import { calculateShift } from '../utils/le-chatelier';

/**
 * The Icelandic this game shows, held to what was fixed on 2026-09-23.
 *
 * The feedback strings are checked by running every stress on every
 * equilibrium, because they are built from templates. The fixed strings are
 * checked by scanning the game's own source, comments included — so a comment
 * explaining a ban must not spell the banned form.
 */

/** Words that only an English sentence would contain. */
const ENGLISH =
  /\b(the|system|shifts?|stress|reactants?|products?|molecules?|favou?red|pressure|increased?|decreased?|catalyst|equilibrium|reaction|moles|heat|energy|temperature|faster|same|side)\b/i;

const everyShift = equilibria.flatMap((eq) =>
  eq.possibleStresses.map((stress) => ({
    label: `${eq.id} ${stress.type} ${stress.target ?? ''}`,
    shift: calculateShift(eq, stress),
  }))
);

describe('the feedback a student reads is Icelandic', () => {
  it('covers every stress on every equilibrium', () => {
    expect(everyShift.length).toBeGreaterThan(90);
  });

  it.each(everyShift)('$label', ({ shift }) => {
    const shown = [shift.explanationIs, ...shift.reasoningIs, shift.molecularViewIs];
    expect(shift.reasoningIs.length).toBeGreaterThan(0);
    expect(shift.molecularViewIs.length).toBeGreaterThan(0);
    for (const text of shown) {
      expect(text).not.toMatch(ENGLISH);
      // ΔH in the Icelandic strings: decimal comma, and the unit as the
      // numbers panel writes it.
      expect(text).not.toMatch(/\d\.\d/);
      expect(text).not.toMatch(/kJ\/mol\b/);
    }
  });
});

describe('ΔH and its label agree', () => {
  it.each(equilibria.map((eq) => [eq.id, eq] as const))('id %i', (_id, eq) => {
    const { deltaH, type } = eq.thermodynamics;
    if (deltaH !== 0) {
      expect(type).toBe(deltaH < 0 ? 'exothermic' : 'endothermic');
    } else {
      // A ΔH of zero has no direction, so no temperature question may be
      // answered from its stored label.
      expect(eq.possibleStresses.some((s) => s.type.includes('temp'))).toBe(false);
    }
  });
});

const SRC = join(__dirname, '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

/** Each pattern is a form that shipped here, with what replaced it. */
const BANNED: Array<{ pattern: RegExp; why: string }> = [
  // Terms settled by ordabok.md (and the textbook corpus).
  { pattern: /varmalosand|varmabindand/i, why: 'útvermið / innvermið (ordabok)' },
  { pattern: /hiti er (hvarfefni|myndefni)|neyta hitans/i, why: 'varmi (ordabok: heat;varmi)' },
  { pattern: /virkniork/i, why: 'virkjunarorka (ordabok)' },
  { pattern: /mólekúl/i, why: 'sameind (ordabok)' },
  { pattern: /hvarfastuðl/i, why: 'hvarfstuðull (ordabok)' },
  { pattern: /\bfram hvarf|\baftur hvarf/i, why: 'framhvarf / bakhvarf (ordabok)' },
  { pattern: /sjálfjafnvægi/i, why: 'sjálfjónun (ordabok: autoionization)' },
  { pattern: /sundrun/i, why: 'klofnun / niðurbrot (ordabok)' },
  { pattern: /úrfelling/i, why: 'útfelling (ordabok)' },
  { pattern: /puffer/i, why: 'stuðpúði — the accentless loanword escapes the platform ban' },
  { pattern: /fjölyfirborð/i, why: 'misleit hvötun (ordabok: heterogeneous, catalysis)' },
  { pattern: /þynningarefna/i, why: 'flókajón (ordabok: complex ion)' },
  { pattern: /vetisbrenn/i, why: 'brennisteinsvetni (corpus)' },
  { pattern: /vetniframleið/i, why: 'vetnisframleiðsla' },
  // Grammar and spelling.
  { pattern: /enginn tímatakmörkun/i, why: 'takmörkun is feminine: engin' },
  { pattern: /\btrufum\b/i, why: 'truflum' },
  { pattern: /heildar stig/i, why: 'Heildarstig' },
  { pattern: /réttar svör/i, why: 'svar is neuter: rétt svör' },
  { pattern: /sameinda sjónarhorn/i, why: 'Sameindasjónarhorn' },
  { pattern: /BURTfrá/, why: 'BURT frá' },
  { pattern: /mólefna/i, why: 'not a word: mól' },
  { pattern: /viðbættu varman/i, why: 'weak masculine: viðbætta varmann / varmanum' },
  { pattern: /\b(meira|minna) varma\b/i, why: 'varmi is masculine: meiri / minni varmi' },
  { pattern: /\b(færri|fleiri) móla\b/i, why: 'með + dative: færri / fleiri mólum' },
  { pattern: /við (hærra|lægra) hita\b/i, why: 'hærra hitastig, or hærri hiti' },
  { pattern: /leitast við að jafnvægi/i, why: 'leitast við að ná jafnvægi' },
  { pattern: /hitastig háð K/i, why: 'K háð hitastigi — the other way round means something else' },
  { pattern: /þrýstings háð/i, why: 'Þrýstingsháð' },
  { pattern: /boudouard hvarf/i, why: 'Boudouard-hvarf' },
  { pattern: /há hitasmíði/i, why: 'háhitaofnum' },
  { pattern: /deprotonun/i, why: 'klofnun' },
  { pattern: /hemóglóbín binding/i, why: 'binding súrefnis við blóðrauða' },
  { pattern: /hvítur fellur út/i, why: 'hvítt botnfall' },
  { pattern: /mótsögnum/i, why: 'trade-offs are málamiðlanir' },
  // English inside the Icelandic UI.
  { pattern: /Dynamic equilibrium simulation/, why: 'the particle picture’s accessible name' },
];

describe('fixed forms stay fixed', () => {
  const files = sourceFiles(SRC);

  it('scans the game source', () => {
    expect(files.length).toBeGreaterThan(8);
  });

  it.each(BANNED)('$pattern ($why)', ({ pattern }) => {
    const hits = files.flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .map((line, i) => ({ line, at: `${file.slice(SRC.length + 1)}:${i + 1}` }))
        .filter(({ line }) => pattern.test(line))
        .map(({ at, line }) => `${at}: ${line.trim()}`)
    );
    expect(hits).toEqual([]);
  });
});
