import { describe, expect, it } from 'vitest';

import { readHljod } from '../hljod.mjs';
import {
  FORMAT as SCRIPT_FORMAT,
  approvals,
  byReviewer,
  readReview,
  report,
} from '../yfirferd.mjs';
import { FORMAT as PAGE_FORMAT } from '../../../apps/islenskubraut/src/yfirferd/store';

// Each recording's current audio; `gamalt` names one made again since a teacher heard it.
const V: Record<string, string> = {
  gæludýr: 'v1',
  les: 'v2',
  hali: 'v3',
  feldur: 'v4',
  fugl: 'v5',
};
const version = (text: string) => V[text] ?? null;
const clip = (text: string, verdict: 'right' | 'wrong', note?: string) => ({
  text,
  verdict,
  v: V[text] ?? 'gamalt',
  ...(note ? { note } : {}),
});

const file = (over: Record<string, unknown> = {}) => ({
  format: SCRIPT_FORMAT,
  reviewer: 'Anna',
  date: '2026-10-17',
  saved: '2026-10-17T10:00:00.000Z',
  notes: [
    { key: 'dyr/giskaleikur', label: 'Dýr — Hvað er þetta?', text: 'A2: lundi er ekki á bæ.' },
  ],
  clips: [clip('gæludýr', 'right'), clip('les', 'wrong', 'heyrist sem „e“')],
  ...over,
});
// `horfið` is in hljod.yaml but no longer on the cards; `fugl` was heard as wrong before.
const manifest = readHljod({
  voice: 'Rödd',
  clips: { gæludýr: false, les: false, hali: false, feldur: true, horfið: false, fugl: 'rangt' },
});
const texts = new Map(['gæludýr', 'les', 'hali', 'feldur', 'fugl'].map((t) => [t, []]));
const run = (...files: Record<string, unknown>[]) =>
  approvals(
    files.map((f, i) => readReview(f, `f${i}.json`)),
    manifest,
    { texts, version }
  );
const textsOf = (list: { text: string }[]) => list.map((e) => e.text);

describe('a review file', () => {
  it('is the format the review page writes', () => {
    expect(PAGE_FORMAT).toBe(SCRIPT_FORMAT);
  });

  it('reads back as written', () => {
    expect(readReview(file())).toEqual({
      reviewer: 'Anna',
      date: '2026-10-17',
      saved: '2026-10-17T10:00:00.000Z',
      notes: [
        { key: 'dyr/giskaleikur', label: 'Dýr — Hvað er þetta?', text: 'A2: lundi er ekki á bæ.' },
      ],
      clips: [
        { text: 'gæludýr', verdict: 'right', v: 'v1' },
        { text: 'les', verdict: 'wrong', v: 'v2', note: 'heyrist sem „e“' },
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
    expect(() => readReview(file({ clips: [{ text: '', verdict: 'right' }] }))).toThrow(
      /needs a text/
    );
    expect(() => readReview(file({ notes: [{ key: 'x' }] }))).toThrow(/needs a key and a text/);
  });
});

describe('what the reviews do to the recordings', () => {
  it('approves what someone heard as right and nobody as wrong, and marks the wrong ones', () => {
    const r = run(
      file(),
      file({
        reviewer: 'Jón',
        notes: [],
        clips: [clip('gæludýr', 'right'), clip('hali', 'wrong'), clip('hali', 'wrong')],
      }),
      file({ reviewer: 'Gunna', notes: [], clips: [clip('hali', 'right')] })
    );
    expect(textsOf(r.approve)).toEqual(['gæludýr']);
    // A clean "wrong" is written down as rangt, so a later run cannot approve it.
    expect(textsOf(r.reject)).toEqual(['les']);
    expect(textsOf(r.conflicts)).toEqual(['hali']);
  });

  it('revokes an approved recording that someone now hears as wrong', () => {
    const r = run(file({ clips: [clip('feldur', 'wrong', 'rangt orð')] }));
    expect(textsOf(r.revoke)).toEqual(['feldur']);
    expect(r.revoke[0].verdicts).toEqual([
      { reviewer: 'Anna', verdict: 'wrong', note: 'rangt orð' },
    ]);
    // Even when another reviewer heard it as right.
    const both = run(
      file({ clips: [clip('feldur', 'wrong')] }),
      file({ reviewer: 'Jón', clips: [clip('feldur', 'right')] })
    );
    expect(textsOf(both.revoke)).toEqual(['feldur']);
  });

  it('never approves a recording heard as wrong before, on a later reviewer’s word', () => {
    const r = run(file({ clips: [clip('fugl', 'right')] }));
    expect(r.approve).toEqual([]);
    expect(textsOf(r.blocked)).toEqual(['fugl']);
    expect(textsOf(run(file({ clips: [clip('fugl', 'wrong')] })).already)).toEqual(['fugl']);
  });

  it('ignores a verdict given to a recording since made again', () => {
    const r = run(file({ clips: [{ text: 'les', verdict: 'right', v: 'gamalt' }] }));
    expect(r.approve).toEqual([]);
    expect(textsOf(r.stale)).toEqual(['les']);
    // A verdict with no version cannot be tied to a recording either.
    expect(textsOf(run(file({ clips: [{ text: 'les', verdict: 'right' }] })).stale)).toEqual([
      'les',
    ]);
  });

  it('approves nothing that is no longer on the cards', () => {
    const r = run(file({ clips: [{ text: 'horfið', verdict: 'right', v: 'x' }] }));
    expect(r.approve).toEqual([]);
    expect(textsOf(r.stale)).toEqual([]);
    expect(textsOf(r.unknown)).toEqual(['horfið']);
    const known = approvals([readReview(file({ clips: [clip('hali', 'right')] }))], manifest, {
      texts: new Map(),
      version,
    });
    expect(textsOf(known.unknown)).toEqual(['hali']);
  });

  it('takes a reviewer’s later file over their earlier one, whatever the order given', () => {
    const monday = file({ saved: '2026-10-17T10:00:00Z', clips: [clip('les', 'wrong')] });
    const thursday = file({
      date: '2026-10-20',
      saved: '2026-10-20T09:00:00Z',
      notes: [{ key: 'dyr/giskaleikur', label: 'Dýr — Hvað er þetta?', text: 'Lagað.' }],
      clips: [clip('les', 'right')],
    });
    for (const order of [
      [monday, thursday],
      [thursday, monday],
    ]) {
      const r = run(...order);
      expect(textsOf(r.approve)).toEqual(['les']);
      expect(r.conflicts).toEqual([]);
    }
    const [anna] = byReviewer([readReview(thursday), readReview(monday)]);
    expect(anna.dates).toEqual(['2026-10-17', '2026-10-20']);
    expect([...anna.notes.values()].map((n) => n.text)).toEqual(['Lagað.']);
  });
});

describe('the report', () => {
  it('names each reviewer once with their dates, every note under its item, and the recordings', () => {
    const reviews = [
      readReview(file()),
      readReview(file({ date: '2026-10-18', saved: '2026-10-18T08:00:00Z' })),
    ];
    const text = report(reviews, approvals(reviews, manifest, { texts, version }));
    expect(text).toContain('2 skrá(r) frá 1: Anna (2026-10-17, 2026-10-18)');
    expect(text.match(/A2: lundi er ekki á bæ\./g)).toHaveLength(1);
    expect(text).toContain('Dýr — Hvað er þetta?\n  Anna: A2: lundi er ekki á bæ.');
    expect(text).toContain('réttar, --apply samþykkir: 1');
    expect(text).toContain('„les“ — Anna: rangt (heyrist sem „e“)');
  });

  it('puts first an approved recording now heard as wrong, which students still hear', () => {
    const reviews = [readReview(file({ clips: [clip('feldur', 'wrong', 'rangt orð')] }))];
    const text = report(reviews, approvals(reviews, manifest, { texts, version }));
    expect(text.split('\n')[2]).toMatch(/^SAMÞYKKTAR EN NÚ MERKTAR RANGAR/);
    expect(text).toContain('„feldur“ — Anna: rangt (rangt orð)');
  });
});
