import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, it, expect } from 'vitest';

import { indicators } from '../data/indicators';

/**
 * Wrong forms this game shipped until 2026-09-23. None is a governed term, so
 * no platform guard caught them. Each is settled by
 * `packages/shared/i18n/ordabok.md`, the textbook corpus, the February
 * terminology ruling, or this game's own spelling of the same word elsewhere —
 * no new ruling was needed.
 *
 * The scan reads the game's source, comments included, so an explanation of
 * one of these must be written without the string itself.
 */

const GAME = join(__dirname, '..', '..');
const SRC = join(GAME, 'src');

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
    form: /samþjöppu/i,
    why: 'conjugate is samoka (ordabok conjugate base;samoka basi; February ruling, which listed this game)',
  },
  {
    form: /\bsamok{1,2}i\b/i,
    why: 'samoka does not decline: samoka basinn (corpus 3, the i-forms 0)',
  },
  {
    form: /\b(?:sterk|veik) basi\b|\bsterkr(?:i|ar) basa\b/i,
    why: 'basi is masculine: sterkur basi, sterkum basa, sterks basa',
  },
  { form: /kúrf/i, why: 'ordabok titration curve;títrunarferill (corpus 7 to 0)' },
  {
    form: /(?:fjöl|tví|þrí)prótón/i,
    why: 'ordabok polyprotic acid;fjölvirk sýra; corpus tvívirk, þrívirk',
  },
  { form: /Büretta/, why: 'ordabok burette;búretta' },
  {
    form: /Brómtýmol|\bTýmolbl/,
    why: 'the textbook spells both Brómþýmólblátt and Þýmólblátt',
  },
  {
    form: /metýl (?:appels|rau)|brómþýmól bl/i,
    why: 'a split compound: the textbook writes metýlappelsínugult, metýlrautt, brómþýmólblátt',
  },
  {
    form: /\b(?:Asetat|Ammóníum|Flúoríð|Formiat) jón/i,
    why: 'a split compound: asetatjón, ammóníumjón (the corpus and the rest of the platform)',
  },
  { form: /molfjöld/i, why: 'flattened: mólfjöldi' },
  {
    form: /sundurgrein/i,
    why: 'sundurgreina means to analyse; a strong acid jónast að fullu (corpus 9)',
  },
  { form: /mótstöðist/, why: 'not a word' },
  { form: /hlutlausast/, why: 'not a word: the verb is hlutleysast, 3rd person hlutleysist' },
  { form: /\bheildar stig/i, why: 'a split compound: heildarstig' },
  {
    form: /\b(?:Margar|Mörg) jafngildispunkt/,
    why: 'jafngildispunktur is masculine: margir jafngildispunktar',
  },
  { form: /efnahvörfin er\b/, why: 'number agreement: efnahvarfinu er lokið' },
  { form: /upphaf-pH/, why: 'the genitive link, as everywhere else here: upphafs-pH' },
  { form: /súrri formi/, why: 'form is neuter: á súru formi' },
  { form: /fenólftaleín (?:er )?LITLAUS\b/, why: 'fenólftaleín is neuter: litlaust' },
  { form: /á litlu rúmmálsviðbót/, why: 'viðbót is feminine: á lítilli rúmmálsviðbót' },
  { form: /mólfjöldi sýru og basa jafnt/, why: 'mólfjöldi is masculine: jafn' },
  { form: /titleIs: 'Styrk /, why: 'a title stands in the nominative: Styrkur' },
  { form: /Brennisteinssýrling'/, why: 'a name stands in the nominative: brennisteinssýrlingur' },
  { form: /\((?:equivalence point|methyl orange)\)/, why: 'an English gloss in Icelandic text' },
  { form: /Títrant:/, why: 'ordabok titrant;títrantur — the label is nominative' },
  { form: /sýrri/, why: 'súr declines súrri: í súrri lausn (corpus 18 to 0)' },
  {
    form: /halógen sýr/i,
    why: 'the textbook names HF, HCl, HBr and HI halógenvetnissýrur, one word (6 to 0)',
  },
  {
    form: /(?:\(|hella |Bættu við |mL )títrant\b/,
    why: 'títrantur declines: hella/bæta við títranti, 5 mL títrants, (títrantur)',
  },
];

describe('Icelandic text in this game', () => {
  const files = [...sources(), join(GAME, 'index.html')];

  it('finds the source it is meant to scan', () => {
    expect(files.length).toBeGreaterThan(15);
  });

  for (const { form, why } of WRONG) {
    it(`never writes ${form}`, () => {
      for (const file of files) {
        const lines = readFileSync(file, 'utf8').split('\n');
        lines.forEach((line, i) => {
          expect(line, `${relative(GAME, file)}:${i + 1} — ${why}`).not.toMatch(form);
        });
      }
    });
  }

  it('describes every indicator in Icelandic', () => {
    // Shown under each indicator in the Level 2 selector. (`best` is left out
    // of the list: Icelandic writes it too.)
    for (const { id, description } of indicators) {
      expect(description, id).not.toMatch(
        /\b(?:good|ideal|alternative|for|titrations?|strong|weak|acid|base)\b/i
      );
    }
  });

  it('gives the page an Icelandic description', () => {
    const html = readFileSync(join(GAME, 'index.html'), 'utf8');
    expect(html).toMatch(/<meta name="description" content="[^"]*(?:títrun|sýr)[^"]*"\s*\/?>/);
  });
});
