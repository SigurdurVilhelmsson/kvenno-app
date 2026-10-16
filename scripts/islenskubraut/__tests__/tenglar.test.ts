import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';
import { parse } from 'yaml';

import { CATEGORY_ORDER } from '../load.mjs';
import { addresses, checkAddress, readTenglar } from '../tenglar.mjs';

const cats = ['dyr', 'matur'];
const link = (over: Record<string, unknown> = {}) => ({
  id: 'ordabok',
  name: 'Orðabók',
  description: 'Orð og beygingar.',
  audience: 'nemendur',
  levels: ['A1'],
  url: 'https://example.is/',
  ...over,
});
const read = (...links: Record<string, unknown>[]) => readTenglar({ links }, cats);

describe('reading tenglar.yaml', () => {
  it('gives a shared address to every category, and defaults approved to false', () => {
    expect(read(link())[0]).toEqual({
      id: 'ordabok',
      name: 'Orðabók',
      description: 'Orð og beygingar.',
      audience: 'nemendur',
      levels: ['A1'],
      urls: { dyr: 'https://example.is/', matur: 'https://example.is/' },
      approved: false,
    });
  });

  it('gives a per-category address only to the categories it names', () => {
    const [t] = read(link({ url: { matur: 'https://example.is/#/matur' } }));
    expect(t.urls).toEqual({ matur: 'https://example.is/#/matur' });
  });

  it('puts the levels in taught order, however they are written', () => {
    expect(read(link({ levels: ['B1', 'A1'] }))[0].levels).toEqual(['A1', 'B1']);
  });

  it('refuses what would break the panel or mislead a reader', () => {
    expect(() => read(link({ url: 'http://example.is/' }))).toThrow(/must be https/);
    expect(() => read(link({ url: 'ekki slóð' }))).toThrow(/not an address/);
    expect(() => read(link({ url: { hestar: 'https://example.is/' } }))).toThrow(
      /names no category: hestar/
    );
    expect(() => read(link({ url: {} }))).toThrow(/names no category/);
    expect(() => read(link({ levels: ['C1'] }))).toThrow(/levels must list/);
    expect(() => read(link({ levels: ['A1', 'A1'] }))).toThrow(/repeats a level/);
    expect(() => read(link({ audience: 'foreldrar' }))).toThrow(/audience/);
    expect(() => read(link({ name: ' ' }))).toThrow(/name must be text/);
    expect(() => read(link({ description: 'Ordafordi og beygingar.' }))).toThrow(/flattened/);
    expect(() => read(link({ approved: 'já' }))).toThrow(/approved must be true or false/);
    expect(() => read(link({ slod: 'x' }))).toThrow(/unknown keys: slod/);
    expect(() => read(link(), link())).toThrow(/used twice/);
  });

  it('lists each address once, with every link that uses it', () => {
    const tenglar = read(link(), link({ id: 'annad', url: { dyr: 'https://example.is/' } }));
    expect(addresses(tenglar)).toEqual([{ url: 'https://example.is/', ids: ['ordabok', 'annad'] }]);
  });
});

describe('checking an address', () => {
  it('passes a 2xx answer and fails anything else, naming why', async () => {
    const answer = (status: number) => vi.fn().mockResolvedValue({ status });
    expect(await checkAddress('https://example.is/', answer(200))).toEqual({
      ok: true,
      status: 200,
    });
    expect(await checkAddress('https://example.is/', answer(404))).toEqual({
      ok: false,
      status: 404,
    });
    const refused = vi
      .fn()
      .mockRejectedValue(
        Object.assign(new Error('fetch failed'), { cause: { code: 'ENOTFOUND' } })
      );
    expect(await checkAddress('https://example.is/', refused)).toEqual({
      ok: false,
      status: 'ENOTFOUND',
    });
  });
});

describe('the real file', () => {
  const tenglar = readTenglar(
    parse(
      readFileSync(
        resolve(__dirname, '../../../content/islenskubraut/tenglar/tenglar.yaml'),
        'utf8'
      )
    ),
    CATEGORY_ORDER
  );

  it('loads, and gives every card at least one link for students at every level', () => {
    for (const c of CATEGORY_ORDER) {
      for (const level of ['A1', 'A2', 'B1']) {
        expect(
          tenglar.some((t) => t.audience === 'nemendur' && t.levels.includes(level) && t.urls[c]),
          `${c} ${level}`
        ).toBe(true);
      }
    }
  });

  it('links each card to its own Bildetema theme, in the Icelandic edition', () => {
    const bildetema = tenglar.find((t) => t.id === 'bildetema')!;
    expect(Object.keys(bildetema.urls)).toEqual(CATEGORY_ORDER);
    for (const url of Object.values(bildetema.urls)) {
      expect(url).toMatch(/^https:\/\/nybildetema\.oslomet\.no\/is\/#\/isl\/[^/]+$/);
    }
  });
});
