import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { FRACTIONAL_PROBLEMS, MIXING_PROBLEMS } from '../data/problems';
import { SALTS, SALT_NOTES } from '../data/salts';

/**
 * Prose that states a number must agree with the number the engine derives.
 *
 * Nothing in this game stores an answer — but the sentences beside the
 * problems do make claims about them, and two of those had drifted from
 * Appendix D.3. The SrCO₃ mixing problem's reveal said `Ekkert botnfall
 * myndast.` (Q = 9,0 × 10⁻¹⁰ against Ksp = 9,3 × 10⁻¹⁰) and then, in the next
 * line, that Q lands just *above* Ksp. And SrCO₃'s Kanna note called its Ksp
 * nearly the same as silver carbonate's, which is 8,1 × 10⁻¹² — 115 times
 * smaller. Both read like a constant from another table.
 */

describe('the mixing problems say what the numbers say', () => {
  it('a stated multiple of Ksp is Q / Ksp, rounded', () => {
    let checked = 0;
    for (const p of MIXING_PROBLEMS) {
      const stated = p.context.match(/Q er (\d+)-falt Ksp/);
      if (!stated) continue;
      checked++;
      expect(Math.round(p.ratio), p.id).toBe(Number(stated[1]));
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('"just above" and "just below" Ksp agree with the verdict', () => {
    let checked = 0;
    for (const p of MIXING_PROBLEMS) {
      const stated = p.context.match(/rétt (yfir|undir) Ksp/);
      if (!stated) continue;
      checked++;
      if (stated[1] === 'yfir') {
        expect(p.precipitates, p.id).toBe(true);
        expect(p.ratio, p.id).toBeLessThan(1.5);
      } else {
        expect(p.precipitates, p.id).toBe(false);
        expect(p.ratio, p.id).toBeGreaterThan(1 / 1.5);
      }
    }
    // The close call is the point of one problem; this must not pass vacuously.
    expect(checked).toBeGreaterThan(0);
  });
});

describe('the salt notes say what the constants say', () => {
  it('a salt said to share a Ksp with another is within a factor of two of it', () => {
    for (const salt of SALTS) {
      const context = SALT_NOTES.get(salt.formula)!.context;
      const stated = context.match(/sama Ksp og (\S+?)[\s.,]/i);
      if (!stated) continue;
      const other = SALTS.find((s) => s.name.toLowerCase() === stated[1].toLowerCase());
      expect(other, `${salt.formula} names ${stated[1]}`).toBeDefined();
      const ratio = Math.max(salt.ksp, other!.ksp) / Math.min(salt.ksp, other!.ksp);
      expect(ratio, `${salt.formula} against ${other!.formula}`).toBeLessThan(2);
    }
  });
});

describe('Skilja points at a node that exists', () => {
  it('names the Le Chatelier node by its label in the Y3 chain', () => {
    const src = join(__dirname, '..');
    const app = readFileSync(join(src, 'App.tsx'), 'utf8');
    const chain = app
      .slice(app.indexOf('Námsleiðin:'))
      .split('</div>')[0]
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .split('→')
      .map((node) => node.replace('Námsleiðin:', '').trim());
    expect(chain).toContain('Hliðrun jafnvægis');

    const skilja = readFileSync(join(src, 'components/SkiljaScreen.tsx'), 'utf8').replace(
      /\s+/g,
      ' '
    );
    const named = skilja.match(/sams konar dæmi í ([^.]+)\./);
    expect(named).not.toBeNull();
    expect(chain).toContain(named![1].trim());
  });
});

describe('the Mohr problem names its indicator by the glossary term', () => {
  it('uses ordabok.md’s word for indicator', () => {
    // It said `ábendir`, which is in neither ordabok.md nor the textbook
    // corpus (zero hits); the glossary's word is read here, not restated.
    const ordabok = readFileSync(
      join(__dirname, '../../../../../../packages/shared/i18n/ordabok.md'),
      'utf8'
    );
    const term = ordabok.match(/^indicator;(.+)$/m)?.[1].trim();
    expect(term).toBeTruthy();
    const mohr = FRACTIONAL_PROBLEMS.find((p) => p.id === 'mohr')!;
    expect(mohr.context).toContain(term!);
  });
});

describe('the barium meal is safe because the salt is insoluble', () => {
  it('every sentence that calls something toxic names the barium ion', () => {
    // The menu said barium sulfate is a toxic substance — the one thing it is
    // not, and the reason it can be swallowed. The ion is toxic; the salt
    // releases too little of it to matter, which is what Ksp says.
    const src = join(__dirname, '..');
    const files = [
      join(src, 'App.tsx'),
      ...readdirSync(join(src, 'components')).map((f) => join(src, 'components', f)),
      ...readdirSync(join(src, 'data')).map((f) => join(src, 'data', f)),
    ];
    let checked = 0;
    for (const file of files) {
      const text = readFileSync(file, 'utf8')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ');
      for (const sentence of text.split(/(?<=[.!?])\s/)) {
        if (!/eitr/i.test(sentence)) continue;
        checked++;
        expect(sentence, file).toMatch(/baríumjón/i);
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
});
