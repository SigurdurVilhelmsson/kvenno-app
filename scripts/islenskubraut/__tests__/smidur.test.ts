import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { loadCategories } from '../load.mjs';
import {
  allSentences,
  buildSentence,
  buildWords,
  markChanges,
  pageData,
  paradigmsNeeded,
  subjectsOf,
  wordTable,
} from '../smidur.mjs';

// Small tables shaped as BÍN sends them (`ord/<guid>`), holding only the forms these tests read.
const table = (guid: string, ord: string, ofl: string, kyn: string, forms: [string, string][]) => ({
  guid,
  ord,
  ofl,
  kyn,
  bmyndir: forms.map(([g, b]) => ({ g, b })),
});
const adjective = (guid: string, ord: string, f: Record<string, string>) =>
  table(
    guid,
    ord,
    'lo',
    '',
    Object.entries(f).map(([k, v]) => [`FSB-${k}`, v])
  );

const paradigms = {
  avoxtur: table('avoxtur', 'ávöxtur', 'no', 'kk', [['NFET', 'ávöxtur']]),
  kjot: table('kjot', 'kjöt', 'no', 'hk', [
    ['NFET', 'kjöt'],
    ['NFFT', 'kjöt'],
  ]),
  buxur: table('buxur', 'buxur', 'no', 'kvk', [
    ['NFFT', 'buxur'],
    ['ÞFFT', 'buxur'],
  ]),
  skor: table('skor', 'skór', 'no', 'kk', [
    ['NFET', 'skór'],
    ['NFFT', 'skór'],
  ]),
  feldur: table('feldur', 'feldur', 'no', 'kk', [
    ['NFET', 'feldur'],
    ['ÞFET', 'feld'],
  ]),
  fjodur: table('fjodur', 'fjöður', 'no', 'kvk', [
    ['NFFT', 'fjaðrir'],
    ['ÞFFT', 'fjaðrir'],
  ]),
  dyr: table('dyr', 'dýr', 'no', 'hk', [['NFET', 'dýr']]),
  saetur: adjective('saetur', 'sætur', {
    'KK-NFET': 'sætur',
    'KVK-NFET': 'sæt',
    'HK-NFET': 'sætt',
    'KVK-NFFT': 'sætar',
  }),
  blar: adjective('blar', 'blár', {
    'KK-NFET': 'blár',
    'KVK-NFFT': 'bláar',
    'KK-NFFT': 'bláir',
  }),
  har: adjective('har', 'hár', { 'KK-NFET': 'hár', 'KVK-NFET': 'há' }),
};

// The saved lookups (`ordmyndir.json`): each form with the BÍN words it can be.
const lemma = (guid: string, ord: string, ofl: string) => ({ guid, ord, ofl, kyn: '' });
const lookups: Record<string, unknown> = {
  ávöxtur: { found: true, lemmas: [lemma('avoxtur', 'ávöxtur', 'no')] },
  kjöt: { found: true, lemmas: [lemma('kjot', 'kjöt', 'no')] },
  buxur: { found: true, lemmas: [lemma('buxur', 'buxur', 'no')] },
  skór: { found: true, lemmas: [lemma('skor', 'skór', 'no')] },
  feldur: { found: true, lemmas: [lemma('feldur', 'feldur', 'no')] },
  fjaðrir: { found: true, lemmas: [lemma('x', 'fjaðra', 'so'), lemma('fjodur', 'fjöður', 'no')] },
  dýr: { found: true, lemmas: [lemma('dyr', 'dýr', 'no'), lemma('y', 'dýr', 'lo')] },
  sætt: { found: true, lemmas: [lemma('saer', 'sær', 'lo'), lemma('saetur', 'sætur', 'lo')] },
  blátt: { found: true, lemmas: [lemma('blar', 'blár', 'lo')] },
  há: { found: true, lemmas: [lemma('har', 'hár', 'lo')] },
  með: { found: true, lemmas: [lemma('z', 'með', 'fs')] },
  hjólum: { found: true, lemmas: [lemma('w', 'hjól', 'no')] },
};

const frame = (text: string, agree: Record<string, string>, blank: unknown = null) => ({
  frame: text,
  agree: Object.entries(agree).map(([word, role]) => ({ word, role })),
  blank,
});
const words = (options: string[], form = 'as-is') => ({ words: 'x', options, form });

describe('the subject decides the rest of the sentence', () => {
  const builder = {
    level: 'A1',
    subject: {
      kind: 'words',
      words: 'x',
      options: ['ávöxtur', 'kjöt', 'buxur', 'skór'],
      plural: ['skór'],
    },
    lemmas: { sætt: 'sætur' },
    frames: [],
  };
  const [avoxtur, kjot, buxur, skor] = subjectsOf(builder, lookups, paradigms);

  it('reads gender and number from BÍN, singular where both read the same', () => {
    expect(avoxtur).toMatchObject({ gender: 'kk', number: 'ET' });
    expect(kjot).toMatchObject({ gender: 'hk', number: 'ET' });
    expect(buxur).toMatchObject({ gender: 'kvk', number: 'FT' });
    // `skór` is singular and plural alike; the card lists it as plural.
    expect(skor).toMatchObject({ gender: 'kk', number: 'FT' });
  });

  it('agrees the pronoun, the verb and an adjective with it', () => {
    const f = frame('Það er ___.', { Það: 'NF', er: 'sögn' }, words(['sætt'], 'agree'));
    const say = (s: unknown) => buildSentence(f, s, 'sætt', lookups, paradigms, builder.lemmas);
    expect(say(avoxtur)).toBe('Hann er sætur.');
    expect(say(kjot)).toBe('Það er sætt.');
    expect(say(buxur)).toBe('Þær eru sætar.');
  });

  it('names the subject with the verb in its number', () => {
    const f = frame('Þetta er ___.', { er: 'sögn' }, { subject: true });
    expect(buildSentence(f, avoxtur, null, lookups, paradigms)).toBe('Þetta er ávöxtur.');
    expect(buildSentence(f, skor, null, lookups, paradigms)).toBe('Þetta eru skór.');
  });

  it('puts an object pronoun in the accusative', () => {
    const f = frame('Maður notar það ___.', { það: 'ÞF' }, words(['úti']));
    expect(buildSentence(f, buxur, 'úti', lookups, paradigms)).toBe('Maður notar þær úti.');
    expect(buildSentence(f, avoxtur, 'úti', lookups, paradigms)).toBe('Maður notar hann úti.');
  });
});

describe('the blank', () => {
  const dyr = { text: 'dýr', gender: 'hk', number: 'ET' };

  it('puts a noun after hefur in the accusative, keeping its number', () => {
    const f = frame('Það hefur ___.', { Það: 'NF' }, words(['feldur', 'fjaðrir'], 'ÞF'));
    expect(buildSentence(f, dyr, 'feldur', lookups, paradigms)).toBe('Það hefur feld.');
    expect(buildSentence(f, dyr, 'fjaðrir', lookups, paradigms)).toBe('Það hefur fjaðrir.');
  });

  it('inflects only the adjectives in a chip and leaves the rest as written', () => {
    const f = frame('Það er ___.', { Það: 'NF' }, words(['með hjólum'], 'agree'));
    const kk = { text: 'bíll', gender: 'kk', number: 'ET' };
    expect(buildSentence(f, kk, 'með hjólum', lookups, paradigms)).toBe('Hann er með hjólum.');
  });

  it('reads a chip written in two genders as one word', () => {
    const f = frame('Hún/Hann er ___.', { 'Hún/Hann': 'NF' }, words(['há/hár'], 'agree'));
    const [hun, hann] = subjectsOf(
      { level: 'A1', subject: { kind: 'person' }, frames: [] },
      lookups,
      paradigms
    );
    expect(buildSentence(f, hun, 'há/hár', lookups, paradigms)).toBe('Hún er há.');
    expect(buildSentence(f, hann, 'há/hár', lookups, paradigms)).toBe('Hann er hár.');
  });
});

describe('nothing is guessed', () => {
  const kk = { text: 'ávöxtur', gender: 'kk', number: 'ET' };
  const f = frame('Það er ___.', { Það: 'NF' }, words(['sætt'], 'agree'));

  it('refuses a word BÍN reads as two words of the needed class, naming both', () => {
    expect(() => buildSentence(f, kk, 'sætt', lookups, paradigms)).toThrow(/sær, sætur.*lemmas/);
    expect(buildSentence(f, kk, 'sætt', lookups, paradigms, { sætt: 'sætur' })).toBe(
      'Hann er sætur.'
    );
  });

  it('refuses a headword that is not one of BÍN’s readings', () => {
    expect(() => buildSentence(f, kk, 'sætt', lookups, paradigms, { sætt: 'súr' })).toThrow(
      /not a form of "súr"/
    );
  });

  it('asks for a fetch when a table or a lookup is missing', () => {
    expect(() =>
      buildSentence(f, kk, 'sætt', lookups, { ...paradigms, saetur: undefined }, { sætt: 'sætur' })
    ).toThrow(/--fetch/);
    expect(() => buildSentence(f, kk, 'súrt', lookups, paradigms)).toThrow(/--fetch/);
  });

  it('refuses a form BÍN does not have', () => {
    const fem = { text: 'x', gender: 'kvk', number: 'ET' };
    const g = frame('Það er ___.', { Það: 'NF' }, words(['blátt'], 'agree'));
    expect(() => buildSentence(g, fem, 'blátt', lookups, paradigms)).toThrow(
      /no FSB-KVK-NFET form of "blár"/
    );
  });
});

describe('paradigmsNeeded and allSentences', () => {
  const category = {
    id: 'prufa',
    builder: [
      {
        level: 'A1',
        subject: { kind: 'word', word: 'dýr' },
        frames: [
          frame('Þetta er dýr.', {}),
          frame('Það hefur ___.', { Það: 'NF' }, words(['feldur', 'fjaðrir'], 'ÞF')),
        ],
      },
    ],
  };

  it('asks for the tables of the subject and of every word it inflects', () => {
    expect(paradigmsNeeded([category], lookups)).toEqual({
      guids: ['dyr', 'feldur', 'fjodur'],
      problems: [],
    });
  });

  it('lists every sentence for a person to read', () => {
    expect(allSentences(category, lookups, paradigms).map((s) => s.sentence)).toEqual([
      'Þetta er dýr.',
      'Það hefur feld.',
      'Það hefur fjaðrir.',
    ]);
  });
});

// The saved BÍN files against the real content. A tag or a word added without
// `pnpm islenskubraut:bin --fetch` fails here, naming the sentence BÍN cannot complete.
describe('the content, with the saved BÍN files', () => {
  const bin = (file: string) =>
    JSON.parse(
      readFileSync(resolve(__dirname, '../../../content/islenskubraut/bin', file), 'utf8')
    );
  const saved = bin('ordmyndir.json').ordmyndir;
  const tables = bin('beygingar.json').beygingar;
  const categories = loadCategories();

  it('has every inflection table the builder needs', () => {
    const { guids, problems } = paradigmsNeeded(categories, saved);
    expect(problems).toEqual([]);
    expect(guids.filter((g: string) => !tables[g])).toEqual([]);
  });

  it('builds every sentence, with no problem left for a person', () => {
    const problems = categories.flatMap((c) =>
      allSentences(c, saved, tables)
        .filter((s) => s.problem)
        .map((s) => `${c.id} ${s.subject ?? ''} "${s.frame ?? ''}" ${s.option ?? ''}: ${s.problem}`)
    );
    expect(problems).toEqual([]);
  });

  it('agrees a plural subject and puts a noun in the accusative from the real tables', () => {
    const say = (id: string) =>
      allSentences(
        categories.find((c) => c.id === id),
        saved,
        tables
      ).map((s) => s.sentence);
    expect(say('klaednadur')).toEqual(
      expect.arrayContaining(['Þær eru rauðar.', 'Þeir eru rauðir.', 'Maður notar þá úti.'])
    );
    expect(say('dyr')).toEqual(expect.arrayContaining(['Það hefur hala.', 'Það hefur feld.']));
  });
});

// Visible grammar (item 7): each word the grammar decides says why, and an inflected one names its
// BÍN word and the forms it could have been, for the page's reasons, tables and drill.
describe('why a word changed', () => {
  const avoxtur = { text: 'ávöxtur', gender: 'kk', number: 'ET' };
  const buxur = { text: 'buxur', gender: 'kvk', number: 'FT' };
  const dyr = { text: 'dýr', gender: 'hk', number: 'ET' };
  const chosen = { sætt: 'sætur' };

  it('gives the pronoun, the verb and an agreeing adjective their reasons', () => {
    const f = frame('Það er ___.', { Það: 'NF', er: 'sögn' }, words(['sætt'], 'agree'));
    const built = buildWords(f, buxur, 'sætt', lookups, paradigms, chosen);
    expect(built.map((w) => w.word)).toEqual(['Þær', 'eru', 'sætar.']);
    expect(built[0].why).toEqual({ kind: 'fornafn', case: 'NF', from: 'það', to: 'þær' });
    expect(built[1].why).toEqual({ kind: 'sögn', from: 'er', to: 'eru' });
    expect(built[2]).toMatchObject({
      why: { kind: 'samræmi', from: 'sætt', to: 'sætar' },
      lemma: 'saetur',
    });
  });

  it('names the verb a noun in the accusative follows, and its four cases to choose from', () => {
    const f = frame('Það hefur ___.', { Það: 'NF' }, words(['feldur'], 'ÞF'));
    const [, , feld] = buildWords(f, dyr, 'feldur', lookups, paradigms);
    expect(feld).toEqual({
      word: 'feld.',
      why: { kind: 'þolfall', from: 'feldur', to: 'feld', verb: 'hefur' },
      lemma: 'feldur',
      choices: ['feldur', 'feld'],
    });
  });

  it('offers an adjective in each gender of the subject’s number', () => {
    const f = frame('Það er ___.', { Það: 'NF' }, words(['sætt'], 'agree'));
    const [, , saetur] = buildWords(f, avoxtur, 'sætt', lookups, paradigms, chosen);
    expect(saetur.choices).toEqual(['sætur', 'sæt', 'sætt']);
  });

  it('keeps a reason only on a word that differs from the card', () => {
    const f = frame('Það er ___.', { Það: 'NF', er: 'sögn' }, words(['sætt'], 'agree'));
    const kjot = { text: 'kjöt', gender: 'hk', number: 'ET' };
    const marked = markChanges(
      'Það er sætt.',
      buildWords(f, kjot, 'sætt', lookups, paradigms, chosen)
    );
    expect(marked).toEqual([
      { word: 'Það', changed: false },
      { word: 'er', changed: false },
      { word: 'sætt.', changed: false },
    ]);
    const changed = markChanges(
      'Það er sætt.',
      buildWords(f, avoxtur, 'sætt', lookups, paradigms, chosen)
    );
    expect(changed.map((w) => w.changed)).toEqual([true, false, true]);
    expect(changed[2]).toHaveProperty('choices');
  });

  it('splits a chip of several words, so the sentence still lines up with the card', () => {
    const f = frame('Maður notar það ___.', { það: 'ÞF' }, words(['á morgnana']));
    const marked = markChanges(
      'Maður notar það á morgnana.',
      buildWords(f, avoxtur, 'á morgnana', lookups, paradigms)
    );
    expect(marked.map((w) => [w.word, w.changed])).toEqual([
      ['Maður', false],
      ['notar', false],
      ['hann', true],
      ['á', false],
      ['morgnana.', false],
    ]);
  });
});

describe('a word’s table', () => {
  it('lays a noun out by case and number, every form BÍN gives in its cell', () => {
    const hali = table('hali', 'hali', 'no', 'kk', [
      ['NFET', 'hali'],
      ['ÞFET', 'hala'],
      ['ÞGFET', 'hala'],
      ['EFET', 'hala'],
      ['NFFT', 'halar'],
      ['ÞFFT', 'hala'],
      ['ÞGFFT', 'hölum'],
      ['EFFT', 'hala'],
      ['NFETgr', 'halinn'],
    ]);
    expect(wordTable(hali)).toEqual({
      ord: 'hali',
      columns: ['eintala', 'fleirtala'],
      rows: [
        { case: 'NF', forms: ['hali', 'halar'] },
        { case: 'ÞF', forms: ['hala', 'hala'] },
        { case: 'ÞGF', forms: ['hala', 'hölum'] },
        { case: 'EF', forms: ['hala', 'hala'] },
      ],
    });
  });

  it('lays an adjective out by case and gender, singular', () => {
    const t = wordTable(paradigms.saetur);
    expect(t.columns).toEqual(['karlkyn', 'kvenkyn', 'hvorugkyn']);
    expect(t.rows[0]).toEqual({ case: 'NF', forms: ['sætur', 'sæt', 'sætt'] });
  });
});

// REVIEW-QUEUE C9's two drafted fixes: a frame not offered with some subjects, and one word of a
// blank in another form than the rest.
describe('exceptions in the tags', () => {
  const builder = {
    level: 'A1',
    confirmed: false,
    subject: { kind: 'words', words: 'x', options: ['ávöxtur', 'kjöt'] },
    lemmas: { sætt: 'sætur' },
    frames: [
      {
        ...frame(
          'Það er ___.',
          { Það: 'NF' },
          { ...words(['sætt', 'úti']), forms: { sætt: 'agree' } }
        ),
      },
      { ...frame('Maður notar það ___.', { það: 'ÞF' }, words(['úti'])), except: ['kjöt'] },
    ],
  };
  const category = { id: 'prufa', builder: [builder] };

  it('puts one word of a blank in its own form and leaves the rest as written', () => {
    const [avoxtur] = subjectsOf(builder, lookups, paradigms);
    const f = builder.frames[0];
    expect(buildSentence(f, avoxtur, 'sætt', lookups, paradigms, builder.lemmas)).toBe(
      'Hann er sætur.'
    );
    expect(buildSentence(f, avoxtur, 'úti', lookups, paradigms, builder.lemmas)).toBe(
      'Hann er úti.'
    );
  });

  it('builds no sentence for a subject the frame does not fit, and tells the page so', () => {
    const sentences = allSentences(category, lookups, paradigms);
    expect(
      sentences.filter((e) => e.frame === 'Maður notar það ___.').map((e) => e.subject)
    ).toEqual(['ávöxtur']);
    const [level] = pageData(category, lookups, paradigms);
    expect(level.frames[1].except).toEqual(['kjöt']);
    expect(level.frames[1].sentences[1]).toEqual([]);
    expect(level.frames[1].sentences[0]).toHaveLength(1);
  });

  it('fetches a table only for the words a blank inflects', () => {
    const { guids } = paradigmsNeeded([category], lookups);
    expect(guids).toContain('saetur');
  });
});
