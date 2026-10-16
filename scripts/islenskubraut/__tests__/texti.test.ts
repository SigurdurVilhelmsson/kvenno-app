import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

import { CATEGORY_ORDER, loadCategories } from '../load.mjs';
import { MIN_GAPS, allTexts, gapText, readTexti } from '../texti.mjs';

// The saved BÍN lookups, shaped as `bin/ordmyndir.json` stores them: each form, the lemmas it is
// a form of, by id and word class. `feld` is a form of the noun `feldur`, `fer` of the verb
// `fara`, and `þyrla` both a noun and a verb, as BÍN has it.
const lemma = (guid: string, ofl: string) => ({ ord: guid, guid, ofl, kyn: '' });
const cache: Record<string, { found: boolean; lemmas?: object[] }> = {
  þetta: { found: true, lemmas: [lemma('þessi', 'fn')] },
  er: { found: true, lemmas: [lemma('vera', 'so')] },
  hundur: { found: true, lemmas: [lemma('hundur', 'no')] },
  hann: { found: true, lemmas: [lemma('hann', 'pfn')] },
  hefur: { found: true, lemmas: [lemma('hafa', 'so')] },
  feldur: { found: true, lemmas: [lemma('feldur', 'no')] },
  feld: { found: true, lemmas: [lemma('feldur', 'no')] },
  feldinn: { found: true, lemmas: [lemma('feldur', 'no')] },
  og: { found: true, lemmas: [lemma('og', 'st')] },
  hala: { found: true, lemmas: [lemma('hali', 'no')] },
  hali: { found: true, lemmas: [lemma('hali', 'no')] },
  mjúkt: { found: true, lemmas: [lemma('mjúkur', 'lo')] },
  mjúkur: { found: true, lemmas: [lemma('mjúkur', 'lo')] },
  heima: { found: true, lemmas: [lemma('heima', 'ao')] },
  fer: { found: true, lemmas: [lemma('fara', 'so')] },
  út: { found: true, lemmas: [lemma('út', 'ao')] },
  á: { found: true, lemmas: [lemma('á', 'fs')] },
  morgnana: { found: true, lemmas: [lemma('morgunn', 'no')] },
  þyrla: { found: true, lemmas: [lemma('þyrla', 'no'), lemma('þyrla-so', 'so')] },
  þyrlan: { found: true, lemmas: [lemma('þyrla', 'no')] },
  sívalningslaga: { found: false },
};

// A card with one main question and one context question, as the loader returns it.
const card = {
  id: 'dyr',
  guidingQuestions: [
    {
      question: 'Hvernig lítur það út?',
      label: 'Útlit',
      answers: [
        { level: 'A1', options: ['feldur', 'hali', 'mjúkt', 'heima', 'þyrla'] },
        { level: 'A2', options: ['feldur', 'hali', 'mjúkt', 'heima', 'þyrla', 'sívalningslaga'] },
        { level: 'B1', options: ['feldur'] },
      ],
    },
    {
      question: 'Hvenær sést þetta?',
      context: { kind: 'hvenaer' },
      answers: [{ level: 'A1', options: ['á morgnana'] }],
    },
  ],
};
const sheet = (...texts: string[]) => ({
  genre: 'Lýsing',
  stages: texts.map((text, i) => ({ name: `Hluti ${i + 1}`, text })),
});
const show = (r: ReturnType<typeof gapText>) =>
  r.stages.map((s) => s.parts.map((p) => ('gap' in p ? `[${p.gap}]` : p.text)).join(''));

describe('reading a model text', () => {
  const stage = { name: 'Hvað?', text: 'Þetta er hundur.' };
  const two = { genre: 'Lýsing', stages: [stage, stage] };
  const ok = { A1: two, A2: two, B1: two };

  it('keeps every level, unconfirmed unless it says otherwise', () => {
    const t = readTexti(ok, 'dyr');
    expect(t.confirmed).toBe(false);
    expect(Object.keys(t.levels)).toEqual(['A1', 'A2', 'B1']);
    expect(readTexti({ ...ok, confirmed: true }, 'dyr').confirmed).toBe(true);
  });

  it('refuses a file that is not a text a student can read in stages', () => {
    expect(() => readTexti({ ...ok, B1: undefined }, 'dyr')).toThrow(/B1 is missing/);
    expect(() => readTexti({ ...ok, C1: two }, 'dyr')).toThrow(/unknown keys: C1/);
    expect(() => readTexti({ ...ok, A1: { ...two, stages: [stage] } }, 'dyr')).toThrow(
      /at least 2 stages/
    );
    expect(() => readTexti({ ...ok, A1: { ...two, genre: '' } }, 'dyr')).toThrow(/genre must be/);
    expect(() =>
      readTexti({ ...ok, A1: { ...two, stages: [stage, { name: 'x', text: 'husdyr' }] } }, 'dyr')
    ).toThrow(/flattened/);
    expect(() => readTexti({ ...ok, confirmed: 'já' }, 'dyr')).toThrow(/true or false/);
  });
});

describe('the gaps', () => {
  it('takes out every form of a word the card offers, and a phrase as printed', () => {
    const r = gapText(
      sheet('Þetta er hundur. Hann hefur feld og hala.', 'Hann er mjúkur. Hann fer út á morgnana.'),
      card,
      'A1',
      cache
    );
    expect(show(r)).toEqual([
      'Þetta er hundur. Hann hefur [feld] og [hala].',
      'Hann er [mjúkur]. Hann fer út [á morgnana].',
    ]);
    expect(r.bank).toEqual(['á morgnana', 'feld', 'hala', 'mjúkur']);
  });

  it('takes a word out once, however many forms of it follow', () => {
    const r = gapText(
      sheet('Hann hefur feld. Feldur og feldinn og hala.', 'Hali. Mjúkur á morgnana.'),
      card,
      'A1',
      cache
    );
    expect(show(r)).toEqual([
      'Hann hefur [feld]. Feldur og feldinn og [hala].',
      'Hali. [Mjúkur] [á morgnana].',
    ]);
  });

  it('counts a word BÍN reads two ways as one word', () => {
    const r = gapText(
      sheet('Þyrla er feld og hala.', 'Þyrlan er mjúkur. Þyrla.'),
      card,
      'A1',
      cache
    );
    expect(show(r)).toEqual(['[Þyrla] er [feld] og [hala].', 'Þyrlan er [mjúkur]. Þyrla.']);
    // The box gives nothing away by a capital.
    expect(r.bank).toContain('þyrla');
  });

  it('leaves adverbs and other small words in place, chips or not', () => {
    const r = gapText(
      sheet('Hann er heima og hefur feld.', 'Hann hefur hala og er mjúkur. Þyrla.'),
      card,
      'A1',
      cache
    );
    expect(r.bank).not.toContain('heima');
  });

  it('matches a chip BÍN does not know as it is written', () => {
    const r = gapText(
      sheet('Hann er sívalningslaga.', 'Feld og hala og mjúkur.'),
      card,
      'A2',
      cache
    );
    expect(r.bank).toContain('sívalningslaga');
  });

  it('uses only the words the card offers at the level', () => {
    expect(() =>
      gapText(sheet('Hann hefur feld og hala.', 'Hann er mjúkur. Þyrla.'), card, 'B1', cache)
    ).toThrow(new RegExp(`has 1 words from the card; it needs ${MIN_GAPS}`));
  });

  it('refuses a word never looked up in BÍN, rather than miss a gap', () => {
    expect(() => gapText(sheet('Hann hefur loðinn feld.', 'Hala.'), card, 'A1', cache)).toThrow(
      /"loðinn" is not in the saved BÍN lookups/
    );
  });
});

describe('the real files', () => {
  const categories = loadCategories();
  const lookups = JSON.parse(
    readFileSync(resolve(__dirname, '../../../content/islenskubraut/bin/ordmyndir.json'), 'utf8')
  ).ordmyndir;
  const texts = Object.fromEntries(
    CATEGORY_ORDER.map((id) => [
      id,
      readTexti(
        parse(
          readFileSync(
            resolve(__dirname, `../../../content/islenskubraut/texti/${id}.yaml`),
            'utf8'
          )
        ),
        id
      ),
    ])
  );

  it('give every card a text at every level, each gap a word from the card', () => {
    const all = allTexts(texts, categories, lookups);
    expect(Object.keys(all)).toEqual(CATEGORY_ORDER);
    for (const id of CATEGORY_ORDER) {
      for (const level of ['A1', 'A2', 'B1']) {
        const t = all[id].levels[level];
        const gaps = t.stages.flatMap((s) => s.parts.filter((p) => 'gap' in p));
        expect(gaps.length, `${id} ${level}`).toBe(t.bank.length);
        expect(t.bank.length, `${id} ${level}`).toBeGreaterThanOrEqual(MIN_GAPS);
      }
    }
  });

  it('grow longer from level to level', () => {
    const words = (id: string, level: string) =>
      texts[id].levels[level].stages
        .map((s) => s.text)
        .join(' ')
        .split(/\s+/).length;
    for (const id of CATEGORY_ORDER) {
      expect(words(id, 'B1'), id).toBeGreaterThan(words(id, 'A1'));
    }
  });
});
