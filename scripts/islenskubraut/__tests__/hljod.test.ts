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
  readState,
  spoken,
  stateProblems,
  syncState,
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
    // A reading of the clip as it is now counts; one of other audio is no guide to this one.
    const heard = readHeard({
      hali: { heard: 'hala', score: 0.25, v: version(clipName('hali')) },
      feldur: { heard: 'veldur', score: 0.4, v: 'gamalt' },
    });
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
    // The listening page hashes what it plays the same way (`versionOf` in Hlusta.tsx), and its
    // test holds it to this same value.
    expect(clipVersion(Buffer.from([1, 2, 3]))).toBe('039058c6f2c0');
  });

  it('refuses a recogniser entry without what it heard, a score and the audio it heard', () => {
    expect(() => readHeard({ hali: { heard: 'hala', score: 0 } })).toThrow(
      /needs heard, score and v/
    );
    expect(() => readHeard([])).toThrow(/must be a map/);
  });
});

describe('the record of each clip’s audio and value', () => {
  const manifest = readHljod({
    voice: 'Rödd',
    clips: { feldur: true, hali: 'rangt', gæludýr: false, horfin: false },
  });
  const V: Record<string, string | null> = { feldur: 'a', hali: 'b', gæludýr: 'c', horfin: null };
  const version = (t: string) => V[t] ?? null;
  const state = readState({
    feldur: { v: 'a', value: true },
    hali: { v: 'b', value: 'rangt' },
    gæludýr: { v: 'c', value: false },
  });

  it('is in line when every clip with a file is recorded with its audio and value', () => {
    expect(stateProblems(manifest, state, version)).toEqual([]);
    expect(syncState(manifest, state, version)).toEqual({ state, reset: [], stamped: [] });
  });

  it('sets a clip made again back to false: the approval was for the old audio', () => {
    const remade = (t: string) => (t === 'feldur' || t === 'hali' ? 'new' : version(t));
    expect(stateProblems(manifest, state, remade)).toEqual([
      '"feldur": its audio has changed since it was recorded',
      '"hali": its audio has changed since it was recorded',
    ]);
    const synced = syncState(manifest, state, remade);
    expect(synced.reset).toEqual(['feldur', 'hali']);
    expect(synced.state.feldur).toEqual({ v: 'new', value: false });
  });

  it('records a value changed by hand for the audio it was changed on', () => {
    const edited = readHljod({
      voice: 'Rödd',
      clips: { feldur: true, hali: true, gæludýr: false },
    });
    expect(stateProblems(edited, state, version)).toEqual([
      '"hali": hljod.yaml says true, recorded rangt',
    ]);
    const synced = syncState(edited, state, version);
    expect(synced.stamped).toEqual(['hali']);
    expect(synced.reset).toEqual([]);
    expect(synced.state.hali).toEqual({ v: 'b', value: true });
  });

  it('sets a true with no record back to false, since nothing says which audio was approved', () => {
    const synced = syncState(manifest, {}, version);
    expect(synced.reset).toEqual(['feldur']);
    expect(synced.state.feldur).toEqual({ v: 'a', value: false });
    // A false or a rangt with no record is recorded as it stands: neither plays for students.
    expect(synced.stamped).toEqual(['gæludýr', 'hali']);
  });

  it('refuses a record entry it cannot read', () => {
    expect(() => readState({ feldur: { v: 'a', value: 'já' } })).toThrow(/needs v and value/);
  });
});

describe('the real manifest', () => {
  const manifest = readHljod(
    parse(readFileSync(resolve(ROOT, 'content/islenskubraut/hljod/hljod.yaml'), 'utf8'))
  );
  const texts = textsToVoice(loadCategories());
  const hasFile = (f: string) => existsSync(resolve(ROOT, 'apps/islenskubraut/public/hljod', f));

  // A text edited on a card has no clip until the voice says it again, which needs the Python
  // setup on a teacher's machine (README.md): it just has no play button meanwhile, so neither
  // that nor the old text's clip, now playing nowhere, fails here. A clip for a text on the cards
  // listed with no file does, since an approved one breaks the build.
  it('gives every clip it lists for a text on the cards a file', () => {
    expect(compare(texts, manifest, hasFile).noFile.filter((t) => texts.has(t))).toEqual([]);
  });

  it('is recorded in stada.json, audio and value, so no approval is for audio since replaced', () => {
    const dir = resolve(ROOT, 'apps/islenskubraut/public/hljod');
    const state = readState(
      JSON.parse(readFileSync(resolve(ROOT, 'content/islenskubraut/hljod/stada.json'), 'utf8'))
    );
    const version = (t: string) =>
      existsSync(resolve(dir, clipName(t)))
        ? clipVersion(readFileSync(resolve(dir, clipName(t))))
        : null;
    expect(stateProblems(manifest, state, version)).toEqual([]);
  });

  it('credits the voice by name and licence', () => {
    expect(manifest.voice).toMatch(/Talrómur/);
    expect(manifest.voice).toMatch(/CC BY 4\.0/);
  });
});
