import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

import { allGames, gameAt, readGiskaleikur } from '../giskaleikur.mjs';
import { CATEGORY_ORDER, loadCategories } from '../load.mjs';

// A card shaped as the loader returns one, with only what the game reads: a main question with
// a label, a context question, and one more main question. As on the real cards, a level
// offers the chips of the level below and some more.
const q = (question: string, key: object, a1: string[], more: string[] = []) => ({
  question,
  ...key,
  answers: [
    { level: 'A1', options: a1 },
    { level: 'A2', options: [...a1, ...more] },
    { level: 'B1', options: [...a1, ...more] },
  ],
});
const card = {
  id: 'dyr',
  guidingQuestions: [
    q('Hvernig lítur það út?', { label: 'Útlit' }, ['stórt', 'lítið'], ['loðið']),
    q('Hvar býr það?', { context: { kind: 'hvar' } }, ['á sveitabæ', 'í sjónum']),
    q('Hvað segir það?', { label: 'Hljóð' }, ['voff', 'mjá', 'hnegg', 'me']),
  ],
};
const thing = (name: string, sound: string, over: Record<string, unknown> = {}) => ({
  name,
  from: 'A1',
  answers: { Útlit: ['stórt'], hvar: ['á sveitabæ'], Hljóð: [sound] },
  ...over,
});
const four = [thing('hundur', 'voff'), thing('köttur', 'mjá'), thing('hestur', 'hnegg')];
const read = (...items: object[]) => readGiskaleikur({ items }, card);

describe('reading a guessing game', () => {
  it('keeps the things as written, unconfirmed unless it says otherwise', () => {
    const game = read(...four, thing('kind', 'me'));
    expect(game.confirmed).toBe(false);
    expect(game.items).toHaveLength(4);
    expect(readGiskaleikur({ confirmed: true, items: [] }, card).confirmed).toBe(true);
  });

  it('refuses what the card cannot print or what would give the answer away', () => {
    expect(() => read(thing('hundur', 'urr'))).toThrow(/"urr" is not a chip on the card/);
    expect(() => read(thing('hundur', 'voff', { answers: { Litur: ['brúnn'] } }))).toThrow(
      /the card has no question Litur/
    );
    expect(() => read(thing('voff', 'voff'))).toThrow(/gives the answer away/);
    expect(() => read(thing('hundur', 'voff'), thing('hundur', 'mjá'))).toThrow(/listed twice/);
    expect(() => read(thing('hundur', 'voff', { from: 'C1' }))).toThrow(/from must be one of/);
    expect(() => read(thing('hundur', 'voff', { mynd: 'x' }))).toThrow(/unknown keys: mynd/);
    expect(() => read(thing('hundur', 'voff', { name: 'husdyr' }))).toThrow(/flattened/);
    expect(() => readGiskaleikur({ items: [], aukalega: 1 }, card)).toThrow(/unknown keys/);
  });
});

describe('a level’s game', () => {
  it('describes each thing only in words its level offers, in the card’s question order', () => {
    const game = read(
      ...four,
      thing('kind', 'me', {
        answers: { Hljóð: ['me'], Útlit: ['loðið', 'stórt'], hvar: ['á sveitabæ'] },
      })
    );
    const kind = (level: string) => gameAt(game, card, level).find((i) => i.name === 'kind')!;
    expect(kind('A2').answers).toEqual([
      { question: 'Hvernig lítur það út?', chips: ['loðið', 'stórt'] },
      { question: 'Hvar býr það?', chips: ['á sveitabæ'] },
      { question: 'Hvað segir það?', chips: ['me'] },
    ]);
  });

  it('leaves out a thing introduced at a later level', () => {
    const game = read(...four, thing('kind', 'me'), thing('lundi', 'me', { from: 'A2' }));
    // A thing from A2 with only A1 chips would read as kind at A1; it is not there to collide.
    expect(gameAt(game, card, 'A1').map((i) => i.name)).not.toContain('lundi');
  });

  it('refuses a game that cannot be played', () => {
    expect(() => gameAt(read(...four), card, 'A1')).toThrow(/has 3 things; it needs 4/);
    expect(() =>
      gameAt(read(...four, thing('kind', 'me', { answers: { Hljóð: ['me'] } })), card, 'A1')
    ).toThrow(/says 1 things about kind/);
    expect(() =>
      gameAt(read(...four, thing('kind', 'voff', { name: 'refur' })), card, 'A1')
    ).toThrow(/hundur and refur are described the same way/);
  });
});

describe('the real files', () => {
  const categories = loadCategories();
  const games = Object.fromEntries(
    CATEGORY_ORDER.map((id) => [
      id,
      readGiskaleikur(
        parse(
          readFileSync(
            resolve(__dirname, `../../../content/islenskubraut/giskaleikur/${id}.yaml`),
            'utf8'
          )
        ),
        categories.find((c) => c.id === id)
      ),
    ])
  );

  it('give every card a playable game at every level', () => {
    const all = allGames(games, categories);
    expect(Object.keys(all)).toEqual(CATEGORY_ORDER);
    for (const id of CATEGORY_ORDER) {
      for (const level of ['A1', 'A2', 'B1'])
        expect(all[id].levels[level].length).toBeGreaterThan(3);
    }
  });
});
