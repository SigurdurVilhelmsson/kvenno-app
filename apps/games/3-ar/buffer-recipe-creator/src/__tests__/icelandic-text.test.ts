import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, it, expect } from 'vitest';

/**
 * Wrong forms this game shipped until 2026-09-23, none of them caught by the
 * platform guards because none is a governed term. Each is settled by
 * `packages/shared/i18n/ordabok.md`, the textbook corpus, or this game's own
 * spelling of the same word elsewhere — no ruling was needed.
 *
 * The scan reads the game's source, comments included, so an explanation of
 * one of these must be written without the string itself.
 */

const SRC = join(__dirname, '..');

function sources(dir = SRC): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (name === '__tests__') return [];
    if (statSync(path).isDirectory()) return sources(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

const WRONG: { form: RegExp; why: string }[] = [
  {
    form: /stuðpúðargeta/i,
    why: 'compounds take the stem stuðpúða- (CLAUDE.md; corpus stuðpúðageta 4, the r-form 0)',
  },
  {
    form: /mólarmass/i,
    why: 'ordabok.md molar mass;mólmassi (corpus 167 to 0)',
  },
  {
    form: /samoki basi/i,
    why: 'ordabok.md conjugate base;samoka basi (corpus samoka basinn 3, the i-form 0)',
  },
  { form: /\(Buffer Capacity\)/, why: 'an English gloss inside the Icelandic heading' },
  {
    form: /\bheildar (stig|mól)/i,
    why: 'a split compound: heildarstig, heildarmól',
  },
  {
    form: /\b(upphafs|markmið|blóð) pH/i,
    why: 'this game writes the compound with a hyphen everywhere else: markmiðs-pH, blóð-pH',
  },
  {
    form: /í jafnvægi \(1:1\)/,
    why: 'a 1:1 mixture has equal amounts; the pair is in equilibrium at every ratio',
  },
  { form: /meira sýra en basi/, why: 'ungrammatical: meira af sýru en basa' },
  // The four below were in the problem contexts that Stig 2 and Stig 3 print above each task,
  // so a student read the acetate and phosphate buffers spelt two ways on one screen.
  {
    form: /fosfát/i,
    why: 'fosfat, as the rest of this game writes it (corpus fosfat 74, the accented form 0)',
  },
  {
    form: /asetát/i,
    why: 'asetat, as the rest of this game writes it (corpus asetat 62, the accented form 0)',
  },
  { form: /sýrleg/i, why: 'not a word (corpus 0); the adjective is súr, súrari' },
  { form: /hliðarsýru/i, why: 'not a word; the phosphate context meant the acidic side of pKa' },
  {
    form: /stuðpúði (basískari|súrari)/i,
    why: 'an attributive adjective goes before its noun: Basískari ammóníustuðpúði',
  },
];

describe('Icelandic text in this game', () => {
  const files = sources();

  it('finds the source it is meant to scan', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  for (const { form, why } of WRONG) {
    it(`never writes ${form}`, () => {
      for (const file of files) {
        const lines = readFileSync(file, 'utf8').split('\n');
        lines.forEach((line, i) => {
          expect(line, `${relative(SRC, file)}:${i + 1} — ${why}`).not.toMatch(form);
        });
      }
    });
  }
});
