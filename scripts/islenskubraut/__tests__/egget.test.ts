import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

import { MAX_STATEMENTS, MIN_STATEMENTS, readEgget } from '../egget.mjs';
import { CATEGORY_ORDER } from '../load.mjs';

const three = ['Ég get sagt hvað þetta er.', 'Ég get spurt um það.', 'Ég get lýst því.'];
const ok = { A1: three, A2: three, B1: three };

describe('reading the can-do statements', () => {
  it('keeps every level, unconfirmed unless it says otherwise', () => {
    const e = readEgget(ok, 'dyr');
    expect(e.confirmed).toBe(false);
    expect(e.levels.B1).toEqual(three);
    expect(readEgget({ ...ok, confirmed: true }, 'dyr').confirmed).toBe(true);
  });

  it('refuses what would not make a strip a student can rate', () => {
    expect(() => readEgget({ ...ok, B1: undefined }, 'dyr')).toThrow(/B1 needs 3 to 4/);
    expect(() => readEgget({ ...ok, A1: three.slice(0, 2) }, 'dyr')).toThrow(/needs 3 to 4/);
    expect(() => readEgget({ ...ok, A1: [...three, ...three] }, 'dyr')).toThrow(/needs 3 to 4/);
    expect(() =>
      readEgget({ ...ok, A1: [...three.slice(0, 2), 'Ég kann að telja.'] }, 'dyr')
    ).toThrow(/must start "Ég get …"/);
    expect(() => readEgget({ ...ok, A1: [three[0], three[0], three[1]] }, 'dyr')).toThrow(
      /repeats a statement/
    );
    expect(() =>
      readEgget({ ...ok, A1: [...three.slice(0, 2), 'Eg get talad um husdyr.'] }, 'dyr')
    ).toThrow(/flattened/);
    expect(() => readEgget({ ...ok, C1: three }, 'dyr')).toThrow(/unknown keys: C1/);
  });
});

describe('the real files', () => {
  it(`give every card ${MIN_STATEMENTS} to ${MAX_STATEMENTS} statements at every level`, () => {
    for (const id of CATEGORY_ORDER) {
      const e = readEgget(
        parse(
          readFileSync(
            resolve(__dirname, `../../../content/islenskubraut/egget/${id}.yaml`),
            'utf8'
          )
        ),
        id
      );
      for (const level of ['A1', 'A2', 'B1']) {
        expect(e.levels[level].length, `${id} ${level}`).toBeGreaterThanOrEqual(MIN_STATEMENTS);
      }
    }
  });
});
