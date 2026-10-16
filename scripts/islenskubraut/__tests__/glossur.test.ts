import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

import { readGlossur } from '../glossur.mjs';
import { loadCategories } from '../load.mjs';

// Two cards that share a chip meaning different things, as `hátt` does on Dýr and Staðir.
const q = (a1: string[], a2: string[] = []) => ({
  question: 'x',
  answers: [
    { level: 'A1', options: a1 },
    { level: 'A2', options: [...a1, ...a2] },
  ],
});
const cards = [
  { id: 'dyr', guidingQuestions: [q(['hátt', 'feldur'], ['goggur'])] },
  { id: 'stadir', guidingQuestions: [q(['hátt', 'hús'])] },
];
const lang = (over: Record<string, unknown> = {}) => ({
  name: 'Polski',
  words: { hátt: 'głośno', feldur: 'futro', hús: 'dom' },
  categories: { stadir: { hátt: 'wysokie' } },
  ...over,
});
const read = (over: Record<string, unknown> = {}) => readGlossur(lang(over), 'pl', cards);

describe('a language file', () => {
  it('resolves each card’s glosses, a card’s own reading over the shared one', () => {
    const g = read();
    expect(g.words).toEqual({
      dyr: { hátt: 'głośno', feldur: 'futro' },
      stadir: { hátt: 'wysokie', hús: 'dom' },
    });
    expect(g).toMatchObject({ code: 'pl', dir: 'ltr', approved: false, dictionary: null });
  });

  it('approves only with a speaker named and every A1 chip glossed', () => {
    expect(() => read({ approved: true })).toThrow(/names who approved it/);
    expect(read({ approved: true, approvedBy: 'Anna' }).approved).toBe(true);
    expect(() =>
      read({ approved: true, approvedBy: 'Anna', words: { hátt: 'głośno', hús: 'dom' } })
    ).toThrow(/no gloss for dyr: feldur/);
  });

  it('may be a dictionary alone, which covers every word without glosses', () => {
    const g = read({
      words: {},
      categories: {},
      dictionary: 'https://polska.arnastofnun.is/pl/leit/{word}',
      approved: true,
      approvedBy: 'Árnastofnun',
    });
    expect(g.words).toEqual({ dyr: {}, stadir: {} });
    expect(() => read({ words: {}, categories: {} })).toThrow(/neither glosses nor a dictionary/);
  });

  it('refuses what would show a student the wrong thing', () => {
    expect(() => read({ words: { köttur: 'kot' } })).toThrow(/"köttur" is not a chip on any card/);
    expect(() => read({ categories: { stadir: { feldur: 'futro' } } })).toThrow(
      /"feldur" is not a chip on stadir/
    );
    expect(() => read({ categories: { matur: {} } })).toThrow(/names no card matur/);
    expect(() => read({ dir: 'down' })).toThrow(/ltr or rtl/);
    expect(() => read({ dictionary: 'http://x.is/{word}' })).toThrow(/https/);
    expect(() => read({ dictionary: 'https://x.is/' })).toThrow(/\{word\}/);
    expect(() => read({ words: { hátt: '' } })).toThrow(/must be text/);
    expect(() => read({ tungumal: 'pl' })).toThrow(/unknown keys: tungumal/);
    expect(() => readGlossur(lang(), 'polski', cards)).toThrow(/language code/);
  });
});

describe('the real files', () => {
  const dir = resolve(__dirname, '../../../content/islenskubraut/glossur');
  const categories = loadCategories();
  const files = readdirSync(dir).filter((f) => f.endsWith('.yaml'));

  it('load, and none is approved without a named speaker', () => {
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const g = readGlossur(
        parse(readFileSync(resolve(dir, f), 'utf8')),
        f.slice(0, -5),
        categories
      );
      if (g.approved) expect(g.approvedBy, f).toBeTruthy();
    }
  });

  it('gloss every A1 chip in Polish, ready for a speaker to check', () => {
    const pl = readGlossur(parse(readFileSync(resolve(dir, 'pl.yaml'), 'utf8')), 'pl', categories);
    for (const c of categories) {
      const a1 = c.guidingQuestions.flatMap(
        (q: { answers: { level: string; options: string[] }[] }) =>
          q.answers.find((a) => a.level === 'A1')?.options ?? []
      );
      for (const chip of a1) expect(pl.words[c.id][chip], `${c.id}: ${chip}`).toBeTruthy();
    }
    expect(pl.words.stadir['hátt']).not.toBe(pl.words.dyr['hátt']);
  });
});
