import { describe, expect, it, vi } from 'vitest';

import {
  candidateForms,
  classify,
  collectWords,
  fetchForm,
  formatNotFound,
  formsToFetch,
  parseBinResponse,
  validateAccepted,
} from '../bin.mjs';
import { loadCategories } from '../load.mjs';

// Shaped after the examples on https://bin.arnastofnun.is/binkjarni/forritaskil/ — the only
// description of the API this was written against. Not yet checked against a live response.
const HESTUR = [
  {
    ord: 'hestur',
    guid: '77be2a7ce3867a94536ce574e8b0c5d4',
    ofl: 'no',
    ofl_heiti: 'Nafnorð',
    kyn: 'kk',
    bmyndir: [
      { g: 'NFET', b: 'hestur' },
      { g: 'ÞFET', b: 'hest' },
      { g: 'ÞGFET', b: 'hesti' },
      { g: 'EFET', b: 'hests' },
    ],
  },
];
const KOMA = [
  {
    ord: 'koma',
    guid: '243124e0f0d5f5c5aaec1952540026bc',
    ofl_heiti: 'Sagnorð',
    ofl: 'so',
    kyn: '',
    hluti: 'Almennt mál',
  },
  {
    ord: 'koma',
    guid: 'cd60a51478845e435b55b75cf659786a',
    ofl_heiti: 'Nafnorð',
    ofl: 'no',
    kyn: 'kvk',
    hluti: 'Almennt mál',
  },
];

const category = (frames: string[], options: string[]) => ({
  id: 'dyr',
  name: 'Dýr',
  description: 'Orðaforði um dýr',
  subCategories: [],
  sentenceFrames: [{ level: 'A1', frames }],
  guidingQuestions: [
    { question: 'Hvernig lítur það út?', icon: '👁️', answers: [{ level: 'A1', options }] },
  ],
});

describe('collectWords', () => {
  it('splits on blanks, punctuation and parentheses and keeps where each word appears', () => {
    const words = collectWords([category(['Það hefur ___.'], ['étur plöntur (grasæta)'])]);
    expect([...words.keys()]).toEqual(
      expect.arrayContaining(['Það', 'hefur', 'étur', 'plöntur', 'grasæta', 'Hvernig'])
    );
    expect(words.has('___')).toBe(false);
    expect(words.get('grasæta')).toEqual([
      { category: 'dyr', place: 'Hvernig lítur það út? A1', text: 'étur plöntur (grasæta)' },
    ]);
  });

  it('skips icons and keeps compound letters whole', () => {
    const words = collectWords([category([], ['sporöskjulaga'])]);
    expect(words.has('sporöskjulaga')).toBe(true);
    expect([...words.keys()].some((w) => /\p{Extended_Pictographic}/u.test(w))).toBe(false);
  });

  it('reads all six real categories', () => {
    const words = collectWords(loadCategories());
    // A floor, not an exact count, so ordinary content edits do not break it.
    expect(words.size).toBeGreaterThan(400);
    expect(words.has('feldur')).toBe(true);
  });
});

describe('candidateForms', () => {
  it('tries a sentence-initial capital lower-case first', () => {
    expect(candidateForms('Það')).toEqual(['það', 'Það']);
    expect(candidateForms('feldur')).toEqual(['feldur']);
  });
});

describe('parseBinResponse', () => {
  it('reads a single match, with the tags under which the form appears', () => {
    expect(parseBinResponse('hest', 200, HESTUR)).toEqual({
      found: true,
      lemmas: [
        {
          ord: 'hestur',
          guid: '77be2a7ce3867a94536ce574e8b0c5d4',
          ofl: 'no',
          kyn: 'kk',
          tags: ['ÞFET'],
        },
      ],
    });
  });

  it('reads the forms field under the name the documentation prose uses too', () => {
    const renamed = [{ ...HESTUR[0], bmyndir: undefined, beygingarmyndir: HESTUR[0].bmyndir }];
    expect(parseBinResponse('hesti', 200, renamed).lemmas[0].tags).toEqual(['ÞGFET']);
  });

  it('reads a list of several matches, which carries no forms', () => {
    const r = parseBinResponse('koma', 200, KOMA);
    expect(r.found).toBe(true);
    expect(r.lemmas.map((l: { ofl: string }) => l.ofl)).toEqual(['so', 'no']);
    expect(r.lemmas[0]).not.toHaveProperty('tags');
  });

  it('reads a 404, an empty array and an empty object as not found', () => {
    expect(parseBinResponse('endurunnru', 404, null)).toEqual({ found: false });
    expect(parseBinResponse('endurunnru', 200, [])).toEqual({ found: false });
    expect(parseBinResponse('endurunnru', 200, {})).toEqual({ found: false });
  });

  it('throws on a server error rather than recording the word as unknown', () => {
    expect(() => parseBinResponse('hestur', 500, null)).toThrow(/500/);
  });

  it('throws on a shape it does not recognise rather than guessing', () => {
    expect(() => parseBinResponse('hestur', 200, { villa: 'eitthvað' })).toThrow(/unexpected/);
  });
});

describe('fetchForm', () => {
  const respond = (status: number, body: string) =>
    vi.fn().mockResolvedValue({ status, text: () => Promise.resolve(body) });

  it('asks the beygingarmynd endpoint with the form URL-encoded', async () => {
    const fetchImpl = respond(200, JSON.stringify(HESTUR));
    await fetchForm('hest', fetchImpl);
    expect(fetchImpl.mock.calls[0][0]).toBe('https://bin.arnastofnun.is/api/beygingarmynd/hest');
    await fetchForm('fætur', fetchImpl);
    expect(fetchImpl.mock.calls[1][0]).toBe(
      'https://bin.arnastofnun.is/api/beygingarmynd/f%C3%A6tur'
    );
  });

  it('reads an empty body as not found', async () => {
    expect(await fetchForm('endurunnru', respond(200, ''))).toEqual({ found: false });
    expect(await fetchForm('endurunnru', respond(404, 'Not found'))).toEqual({ found: false });
  });

  it('throws on a body that is not JSON', async () => {
    await expect(fetchForm('hestur', respond(200, '<html>'))).rejects.toThrow(/JSON/);
  });
});

describe('classify and formsToFetch', () => {
  const words = collectWords([category(['Það hefur ___.'], ['feldur', 'endurunnru', 'grasæta'])]);
  const all = [...words.keys()];
  const found = { found: true, lemmas: [] };

  it('asks for every word first, lower-case', () => {
    const batch = formsToFetch(words, {});
    expect(batch).toContain('það');
    expect(batch).not.toContain('Það');
    // `Dýr` and `dýr`, `Það` and `það` share one lookup.
    expect(batch).toEqual([...new Set(all.map((w) => w.toLocaleLowerCase('is')))]);
  });

  it('tries a capital as written only after its lower-case form came back empty', () => {
    const cache = Object.fromEntries(all.map((w) => [w.toLocaleLowerCase('is'), found]));
    cache['það'] = { found: false };
    expect(formsToFetch(words, cache)).toEqual(['Það']);
    cache['Það'] = { found: false };
    expect(formsToFetch(words, cache)).toEqual([]);
  });

  it('sorts words into found, not found and never looked up', () => {
    const cache: Record<string, unknown> = { feldur: found, endurunnru: { found: false } };
    const r = classify(words, cache, { grasæta: 'Samsett orð.' });
    expect(r.found).toEqual(expect.arrayContaining(['feldur', 'grasæta']));
    expect(r.notFound).toEqual(['endurunnru']);
    expect(r.uncached).toContain('hefur');
  });

  it('formats a not-found word with the phrase it appears in', () => {
    expect(formatNotFound(words, ['endurunnru'])).toBe('  endurunnru\n      dyr: endurunnru');
  });
});

describe('validateAccepted', () => {
  it('requires a reason and a lower-case word', () => {
    expect(validateAccepted(null)).toEqual({});
    expect(validateAccepted({ grasæta: 'Samsett orð.' })).toEqual({ grasæta: 'Samsett orð.' });
    expect(() => validateAccepted({ grasæta: '' })).toThrow(/reason/);
    expect(() => validateAccepted({ Grasæta: 'x' })).toThrow(/lower case/);
    expect(() => validateAccepted(['grasæta'])).toThrow(/map/);
  });
});
