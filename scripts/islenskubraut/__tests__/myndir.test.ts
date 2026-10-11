import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';
import { parse } from 'yaml';

import { loadCategories } from '../load.mjs';
import {
  allEntries,
  approvedPictures,
  checkCoverage,
  chipsByCategory,
  entryFor,
  fetchPicture,
  parseSearch,
  readMyndir,
  reviewSheet,
  searchPictograms,
} from '../myndir.mjs';

// A card shaped as the loader returns one, with only what the pictures read.
const card = (id: string, a1: string[], builderWords: string[] = []) => ({
  id,
  guidingQuestions: [
    {
      answers: [
        { level: 'A1', options: a1 },
        { level: 'A2', options: ['bara á A2'] },
      ],
    },
  ],
  builder: [{ level: 'A1', subject: { options: builderWords }, frames: [{ blank: null }] }],
});
const cards = [card('dyr', ['feldur', 'hátt']), card('stadir', ['hátt', 'heima'], ['sefur'])];

describe('reading myndir.yaml', () => {
  it('takes search, id and approved, and defaults the last two', () => {
    expect(readMyndir({ words: { feldur: { search: 'fur' } } }).words.feldur).toEqual({
      search: 'fur',
      id: null,
      approved: false,
    });
  });

  it('refuses an approval with no picture, a bad id, an empty search and unknown keys', () => {
    expect(() => readMyndir({ words: { a: { search: 'x', approved: true } } })).toThrow(
      /approved but has no picture/
    );
    expect(() => readMyndir({ words: { a: { search: 'x', id: 'tólf' } } })).toThrow(
      /ARASAAC number/
    );
    expect(() => readMyndir({ words: { a: { search: ' ' } } })).toThrow(/search must be a word/);
    expect(() => readMyndir({ words: { a: { search: 'x', mynd: 3 } } })).toThrow(/unknown keys/);
  });
});

describe('matching the map to the cards', () => {
  const myndir = readMyndir({
    words: {
      feldur: { search: 'fur', id: 11, approved: true },
      hátt: { search: 'loud', id: 12, approved: true },
      heima: { search: 'home', id: 13 },
      sefur: { search: 'sleep', id: 14, approved: true },
      gamalt: { search: 'old' },
    },
    categories: { stadir: { hátt: { search: 'tall', id: 15, approved: true } } },
  });

  it('collects the A1 answers and the sentence builder’s words, and nothing from A2', () => {
    expect([...chipsByCategory(cards).get('stadir')!]).toEqual(['hátt', 'heima', 'sefur']);
    expect([...chipsByCategory(cards).get('dyr')!]).not.toContain('bara á A2');
  });

  it('lets a card mean something else by the same chip', () => {
    expect(entryFor(myndir, 'dyr', 'hátt')?.search).toBe('loud');
    expect(entryFor(myndir, 'stadir', 'hátt')?.search).toBe('tall');
  });

  it('names a chip with no entry, and an entry for no chip', () => {
    const coverage = checkCoverage(
      readMyndir({ words: { feldur: { search: 'fur' }, gamalt: { search: 'old' } } }),
      cards
    );
    expect(coverage.missing).toEqual([
      'dyr: hátt',
      'stadir: hátt',
      'stadir: heima',
      'stadir: sefur',
    ]);
    expect(coverage.stale).toEqual(['gamalt']);
    expect(checkCoverage(myndir, cards).stale).toEqual(['gamalt']);
  });

  it('flags a card override for a chip that card does not have', () => {
    const odd = readMyndir({
      words: {
        feldur: { search: 'fur' },
        hátt: { search: 'loud' },
        heima: { search: 'h' },
        sefur: { search: 's' },
      },
      categories: { dyr: { heima: { search: 'home' } } },
    });
    expect(checkCoverage(odd, cards).stale).toEqual(['categories.dyr.heima']);
  });

  it('gives students only the approved pictures, per card', () => {
    expect(approvedPictures(myndir, cards)).toEqual({
      dyr: { feldur: 11, hátt: 12 },
      stadir: { hátt: 15, sefur: 14 },
    });
  });

  it('lists every entry with its place in the YAML, so --fetch can write the id back', () => {
    expect(allEntries(myndir).find((e) => e.category === 'stadir')?.path).toEqual([
      'categories',
      'stadir',
      'hátt',
    ]);
  });
});

describe('ARASAAC', () => {
  it('reads a search in its order, leaving out what it marks sexual or violent', () => {
    expect(
      parseSearch('dog', 200, [
        { _id: 3 },
        { _id: 4, violence: true },
        { _id: 5, sex: true },
        { _id: 6 },
      ])
    ).toEqual([3, 6]);
  });

  it('reads a 404 as nothing found, and throws on anything else unexpected', () => {
    expect(parseSearch('xyz', 404, null)).toEqual([]);
    expect(() => parseSearch('dog', 500, null)).toThrow(/500/);
    expect(() => parseSearch('dog', 200, { villa: 1 })).toThrow(/unexpected/);
    expect(() => parseSearch('dog', 200, [{ id: 3 }])).toThrow(/unexpected/);
  });

  it('searches in English, with the word URL-encoded', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ status: 200, text: async () => '[{"_id":7}]' });
    expect(await searchPictograms('fish scales', fetchImpl)).toEqual([7]);
    expect(fetchImpl.mock.calls[0][0]).toBe(
      'https://api.arasaac.org/v1/pictograms/en/search/fish%20scales'
    );
  });

  it('keeps a picture only if it is a PNG', async () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2]);
    const answer = (bytes: Uint8Array) =>
      vi.fn().mockResolvedValue({ status: 200, arrayBuffer: async () => bytes.buffer });
    expect(await fetchPicture(9, answer(png))).toEqual(png);
    await expect(fetchPicture(9, answer(new Uint8Array([60, 104])))).rejects.toThrow(/not a PNG/);
  });
});

describe('the review sheet', () => {
  it('shows each chip with its picture and the alternatives, numbered, and escapes the text', () => {
    const html = reviewSheet(
      [{ path: [], word: 'a<b', search: 'x', id: 2, approved: false }],
      { x: [2, 3, 4] },
      (id: number) => `myndir/${id}.png`
    );
    expect(html).toContain('a&lt;b');
    expect(html).toContain('src="myndir/2.png"');
    expect(html).toContain('pictograms/3/3_300.png');
    expect(html).not.toContain('pictograms/2/2_300.png');
    expect(html).toContain('ARASAAC');
  });
});

describe('the real map', () => {
  const myndir = readMyndir(
    parse(
      readFileSync(resolve(__dirname, '../../../content/islenskubraut/myndir/myndir.yaml'), 'utf8')
    )
  );

  it('has an entry for every A1 chip on every card, and none for a chip that is gone', () => {
    expect(checkCoverage(myndir, loadCategories())).toEqual({ missing: [], stale: [] });
  });
});
