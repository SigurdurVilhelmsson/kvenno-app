import { describe, expect, it } from 'vitest';

import { readHljod } from '../hljod.mjs';
import { FORMAT as SCRIPT_FORMAT, approvals, readReview, report } from '../yfirferd.mjs';
import { FORMAT as PAGE_FORMAT } from '../../../apps/islenskubraut/src/yfirferd/store';

const file = (over: Record<string, unknown> = {}) => ({
  format: SCRIPT_FORMAT,
  reviewer: 'Anna',
  date: '2026-10-17',
  notes: [
    { key: 'dyr/giskaleikur', label: 'Dýr — Hvað er þetta?', text: 'A2: lundi er ekki á bæ.' },
  ],
  clips: [
    { text: 'gæludýr', verdict: 'right' },
    { text: 'les', verdict: 'wrong', note: 'heyrist sem „e“' },
  ],
  ...over,
});
const manifest = readHljod({
  voice: 'Rödd',
  clips: { gæludýr: false, les: false, hali: false, feldur: true },
});

describe('a review file', () => {
  it('is the format the review page writes', () => {
    expect(PAGE_FORMAT).toBe(SCRIPT_FORMAT);
  });

  it('reads back as written', () => {
    expect(readReview(file())).toEqual({
      reviewer: 'Anna',
      date: '2026-10-17',
      notes: [
        { key: 'dyr/giskaleikur', label: 'Dýr — Hvað er þetta?', text: 'A2: lundi er ekki á bæ.' },
      ],
      clips: [
        { text: 'gæludýr', verdict: 'right' },
        { text: 'les', verdict: 'wrong', note: 'heyrist sem „e“' },
      ],
    });
  });

  it('names an unnamed reviewer by the file', () => {
    expect(readReview(file({ reviewer: '' }), 'yfirferd-1.json').reviewer).toBe('yfirferd-1.json');
  });

  it('refuses a file it cannot read as a review', () => {
    expect(() => readReview(file({ format: 'annað' }))).toThrow(/not a islenskubraut-yfirferd\/1/);
    expect(() => readReview(file({ notes: {} }))).toThrow(/notes must be a list/);
    expect(() => readReview(file({ clips: [{ text: 'x', verdict: 'kannski' }] }))).toThrow(
      /verdict must be right or wrong/
    );
    expect(() => readReview(file({ notes: [{ key: 'x' }] }))).toThrow(/needs a key and a text/);
  });
});

describe('approving recordings from reviews', () => {
  it('approves what someone heard as right and no one as wrong, and nothing else', () => {
    const anna = readReview(file());
    const jon = readReview(
      file({
        reviewer: 'Jón',
        notes: [],
        clips: [
          { text: 'gæludýr', verdict: 'right' },
          { text: 'hali', verdict: 'wrong' },
          { text: 'feldur', verdict: 'right' },
          { text: 'horfið', verdict: 'right' },
        ],
      })
    );
    const anna2 = readReview(file({ notes: [], clips: [{ text: 'hali', verdict: 'right' }] }));
    const result = approvals([anna, jon, anna2], manifest);
    expect(result.approve).toEqual(['gæludýr']);
    expect(result.wrong).toEqual([{ text: 'les', notes: ['heyrist sem „e“'] }]);
    expect(result.conflicts.map((c) => c.text)).toEqual(['hali']);
    expect(result.already).toEqual(['feldur']);
    expect(result.unknown).toEqual(['horfið']);
  });

  it('reports every note under its item, and the recordings', () => {
    const r = readReview(file());
    const text = report([r], approvals([r], manifest));
    expect(text).toContain('Dýr — Hvað er þetta?\n  Anna: A2: lundi er ekki á bæ.');
    expect(text).toContain('réttar, má samþykkja: 1');
    expect(text).toContain('„les“ — heyrist sem „e“');
  });
});
