import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

import {
  clipName,
  clipVersion,
  clipsForApp,
  clipsForReview,
  compare,
  placeLabel,
  readHeard,
  readHljod,
  spoken,
  textsToVoice,
} from '../hljod.mjs';
import { loadCategories } from '../load.mjs';

const ROOT = resolve(__dirname, '../../..');

// A card with a vocabulary word, one question at two levels, a frame and an example.
const card = {
  id: 'dyr',
  subCategories: [{ name: 'Flokkar', options: ['gæludýr'] }],
  guidingQuestions: [
    {
      question: 'Hvernig lítur það út?',
      answers: [
        { level: 'A1', options: ['feldur'] },
        { level: 'A2', options: ['feldur', 'hali'] },
      ],
    },
  ],
  sentenceFrames: [{ level: 'A1', frames: ['Það hefur ___.'] }],
  examples: [{ level: 'A1', text: 'Þetta er dýr.' }],
};

describe('what has a recording', () => {
  it('is every word, frame and example on the card, once each, with where it appears', () => {
    const texts = textsToVoice([card]);
    expect([...texts.keys()]).toEqual([
      'gæludýr',
      'feldur',
      'hali',
      'Það hefur ___.',
      'Þetta er dýr.',
    ]);
    expect(texts.get('feldur')).toEqual([
      { category: 'dyr', level: 'A1', where: 'Hvernig lítur það út?' },
      { category: 'dyr', level: 'A2', where: 'Hvernig lítur það út?' },
    ]);
    // The vocabulary page is the same at every level, so its words carry none.
    expect(texts.get('gæludýr')).toEqual([{ category: 'dyr', level: null, where: 'Flokkar' }]);
    expect(placeLabel(texts.get('feldur')![0])).toBe('dyr A1: Hvernig lítur það út?');
    expect(placeLabel(texts.get('gæludýr')![0])).toBe('dyr: Flokkar');
  });

  it('names a clip by its text, so an edited text needs a new one', () => {
    expect(clipName('feldur')).toMatch(/^[0-9a-f]{16}\.mp3$/);
    expect(clipName('feldur')).toBe(clipName('feldur'));
    expect(clipName('feldur')).not.toBe(clipName('feld'));
  });
});

describe('what the voice says', () => {
  it('pauses at a blank, says a slash as a choice, and a bracket after a pause', () => {
    expect(spoken('Það hefur ___ og ___.')).toBe('Það hefur … og ….');
    expect(spoken('Hún/Hann er ___.')).toBe('Hún eða Hann er ….');
    expect(spoken('rauður/rauð/rautt')).toBe('rauður eða rauð eða rautt');
    expect(spoken('húsdýr (búfénaður)')).toBe('húsdýr, búfénaður');
    expect(spoken('feldur')).toBe('feldur');
  });
});

describe('the manifest', () => {
  const texts = textsToVoice([card]);
  const manifest = readHljod({
    voice: 'Rödd',
    clips: { feldur: true, hali: false, 'Það hefur ___.': false, horfið: false },
  });
  const files = new Set([clipName('feldur'), clipName('hali'), clipName('horfið')]);
  const hasFile = (f: string) => files.has(f);

  it('says what has no clip, what is no longer on the card, and what has no file', () => {
    expect(compare(texts, manifest, hasFile)).toEqual({
      missing: ['gæludýr', 'Þetta er dýr.'],
      stale: ['horfið'],
      noFile: ['Það hefur ___.'],
    });
  });

  it('gives the app every clip on the card with a file, approved or not', () => {
    expect(clipsForApp(texts, manifest, hasFile)).toEqual({
      feldur: { file: clipName('feldur'), approved: true },
      hali: { file: clipName('hali'), approved: false },
    });
  });

  it('refuses an approved clip with no file, which would be a dead button', () => {
    expect(() => clipsForApp(texts, manifest, (f: string) => f !== clipName('feldur'))).toThrow(
      /"feldur" is approved but .* is missing/
    );
  });

  it('reads `rangt` as heard and wrong: not approved, and kept apart from a draft', () => {
    const m = readHljod({ voice: 'Rödd', clips: { feldur: 'rangt', hali: false } });
    expect(m.clips.get('feldur')).toBe(false);
    expect([...m.rejected]).toEqual(['feldur']);
    expect(clipsForApp(texts, m, hasFile).feldur).toEqual({
      file: clipName('feldur'),
      approved: false,
    });
  });

  it('refuses a manifest that does not say true, false or rangt, or names no voice', () => {
    expect(() => readHljod({ voice: 'Rödd', clips: { feldur: 'já' } })).toThrow(
      /true, false or rangt/
    );
    expect(() => readHljod({ clips: {} })).toThrow(/voice/);
    expect(() => readHljod({ voice: 'Rödd', rodd: 1 })).toThrow(/unknown keys: rodd/);
  });
});

describe('the listening page’s data', () => {
  const texts = textsToVoice([card]);
  const manifest = readHljod({
    voice: 'Rödd',
    clips: { feldur: true, hali: 'rangt', gæludýr: false, 'Það hefur ___.': false },
  });
  const hasFile = (f: string) => f !== clipName('gæludýr');
  const version = (f: string) => `v-${f.slice(0, 4)}`;

  it('lists each clip with a file, its places, its audio version, and what was heard', () => {
    const heard = readHeard({ hali: { heard: 'hala', score: 0.25 } });
    expect(clipsForReview(texts, manifest, hasFile, heard, version)).toEqual([
      {
        text: 'feldur',
        file: clipName('feldur'),
        v: version(clipName('feldur')),
        approved: true,
        places: texts.get('feldur'),
      },
      {
        text: 'hali',
        file: clipName('hali'),
        v: version(clipName('hali')),
        approved: false,
        rejected: true,
        places: texts.get('hali'),
        heard: 'hala',
        score: 0.25,
      },
      // What the voice was told to say, where the text as printed is not it.
      {
        text: 'Það hefur ___.',
        file: clipName('Það hefur ___.'),
        v: version(clipName('Það hefur ___.')),
        approved: false,
        places: texts.get('Það hefur ___.'),
        say: 'Það hefur ….',
      },
    ]);
  });

  it('versions a clip by its audio, so a remade clip is told from the old one', () => {
    expect(clipVersion(Buffer.from('a'))).toMatch(/^[0-9a-f]{12}$/);
    expect(clipVersion(Buffer.from('a'))).not.toBe(clipVersion(Buffer.from('b')));
  });

  it('refuses a recogniser entry without what it heard and a score', () => {
    expect(() => readHeard({ hali: { heard: 'hala' } })).toThrow(/needs heard and score/);
    expect(() => readHeard([])).toThrow(/must be a map/);
  });
});

describe('the real manifest', () => {
  const manifest = readHljod(
    parse(readFileSync(resolve(ROOT, 'content/islenskubraut/hljod/hljod.yaml'), 'utf8'))
  );
  const texts = textsToVoice(loadCategories());
  const hasFile = (f: string) => existsSync(resolve(ROOT, 'apps/islenskubraut/public/hljod', f));

  it('lists a clip with a file for every text on the cards, and nothing else', () => {
    expect(compare(texts, manifest, hasFile)).toEqual({ missing: [], stale: [], noFile: [] });
  });

  it('credits the voice by name and licence', () => {
    expect(manifest.voice).toMatch(/Talrómur/);
    expect(manifest.voice).toMatch(/CC BY 4\.0/);
  });
});
