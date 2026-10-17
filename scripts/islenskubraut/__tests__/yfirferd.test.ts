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

// Each recording's current audio; `gamalt` names audio since made again, `horfin` a deleted file.
const V: Record<string, string | null> = {
  gæludýr: 'v1',
  les: 'v2',
  hali: 'v3',
  feldur: 'v4',
  fugl: 'v5',
  horfin: null,
};
const version = (text: string) => (text in V ? V[text] : null);
const clip = (
  text: string,
  verdict: 'right' | 'wrong' | 'withdrawn',
  at: string,
  note?: string
) => ({
  text,
  verdict,
  v: V[text] ?? 'gamalt',
  at,
  ...(note ? { note } : {}),
});
const MON = '2026-10-19T10:00:00Z';
const TUE = '2026-10-20T10:00:00Z';
const THU = '2026-10-22T10:00:00Z';

const file = (over: Record<string, unknown> = {}) => ({
  format: SCRIPT_FORMAT,
  reviewer: 'Anna',
  date: '2026-10-19',
  saved: MON,
  notes: [
    { key: 'dyr/giskaleikur', label: 'Dýr — Hvað er þetta?', text: 'A2: lundi er ekki á bæ.' },
  ],
  clips: [clip('gæludýr', 'right', MON), clip('les', 'wrong', MON, 'heyrist sem „e“')],
  ...over,
});
// `horfið` is in hljod.yaml but no longer on the cards; `fugl` was heard as wrong before.
const manifest = readHljod({
  voice: 'Rödd',
  clips: {
    gæludýr: false,
    les: false,
    hali: false,
    feldur: true,
    horfið: false,
    fugl: 'rangt',
    horfin: false,
  },
});
// When each value was set: feldur approved, and fugl marked rangt, on Tuesday.
const state = {
  feldur: { v: 'v4', value: true, at: TUE },
  fugl: { v: 'v5', value: 'rangt', at: TUE },
};
const texts = new Map(['gæludýr', 'les', 'hali', 'feldur', 'fugl', 'horfin'].map((t) => [t, []]));
const run = (...files: Record<string, unknown>[]) =>
  approvals(
    files.map((f, i) => readReview(f, `f${i}.json`)),
    manifest,
    { texts, version, state }
  );
const textsOf = (list: { text: string }[]) => list.map((e) => e.text);

describe('a review file', () => {
  it('is the format the review page writes', () => {
    expect(PAGE_FORMAT).toBe(SCRIPT_FORMAT);
  });

  it('reads back as written, each verdict with its audio and when it was given', () => {
    expect(readReview(file())).toEqual({
      reviewer: 'Anna',
      date: '2026-10-19',
      saved: MON,
      notes: [
        { key: 'dyr/giskaleikur', label: 'Dýr — Hvað er þetta?', text: 'A2: lundi er ekki á bæ.' },
      ],
      clips: [
        { text: 'gæludýr', verdict: 'right', v: 'v1', at: MON },
        { text: 'les', verdict: 'wrong', v: 'v2', at: MON, note: 'heyrist sem „e“' },
      ],
    });
    // A verdict with no time of its own was given by the time the file was saved.
    expect(readReview(file({ clips: [{ text: 'les', verdict: 'right' }] })).clips[0].at).toBe(MON);
  });

  it('names an unnamed reviewer by the file', () => {
    expect(readReview(file({ reviewer: '' }), 'yfirferd-1.json').reviewer).toBe('yfirferd-1.json');
  });

  it('refuses a file it cannot read as a review', () => {
    expect(() => readReview(file({ format: 'annað' }))).toThrow(/not a islenskubraut-yfirferd\/1/);
    expect(() => readReview(file({ notes: {} }))).toThrow(/notes must be a list/);
    expect(() => readReview(file({ clips: [{ text: 'x', verdict: 'kannski' }] }))).toThrow(
      /verdict must be right, wrong or withdrawn/
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
        clips: [clip('gæludýr', 'right', MON), clip('hali', 'wrong', MON)],
      }),
      file({ reviewer: 'Gunna', notes: [], clips: [clip('hali', 'right', MON)] })
    );
    expect(textsOf(r.approve)).toEqual(['gæludýr']);
    // A clean "wrong" is written down as rangt, so a later run cannot approve it.
    expect(textsOf(r.reject)).toEqual(['les']);
    expect(textsOf(r.conflicts)).toEqual(['hali']);
  });

  it('revokes an approved recording heard as wrong since it was approved', () => {
    const r = run(file({ clips: [clip('feldur', 'wrong', THU, 'rangt orð')] }));
    expect(textsOf(r.revoke)).toEqual(['feldur']);
    expect(r.revoke[0].verdicts).toEqual([
      { reviewer: 'Anna', verdict: 'wrong', at: THU, note: 'rangt orð' },
    ]);
  });

  it('keeps a decision against every verdict given before it, so a settled conflict stays settled', () => {
    // Jón heard feldur as wrong on Monday; it was approved on Tuesday, over his verdict.
    const r = run(
      file({ reviewer: 'Jón', clips: [clip('feldur', 'wrong', MON)] }),
      file({ saved: THU, clips: [clip('hali', 'right', THU)] })
    );
    expect(r.revoke).toEqual([]);
    expect(textsOf(r.already)).toEqual(['feldur']);
    // The same for rangt: a "right" from before it was marked does not reopen it.
    expect(textsOf(run(file({ clips: [clip('fugl', 'right', MON)] })).already)).toEqual(['fugl']);
  });

  it('reopens a rangt recording only on a verdict given since, for a person to decide', () => {
    const r = run(file({ clips: [clip('fugl', 'right', THU)] }));
    expect(r.approve).toEqual([]);
    expect(textsOf(r.blocked)).toEqual(['fugl']);
  });

  it('ignores a verdict given to a recording since made again, or with no file now', () => {
    const r = run(file({ clips: [{ text: 'les', verdict: 'right', v: 'gamalt', at: MON }] }));
    expect(r.approve).toEqual([]);
    expect(textsOf(r.stale)).toEqual(['les']);
    // A verdict with no version cannot be tied to a recording either.
    expect(textsOf(run(file({ clips: [{ text: 'les', verdict: 'right' }] })).stale)).toEqual([
      'les',
    ]);
    const deleted = run(file({ clips: [{ text: 'horfin', verdict: 'right', v: 'x', at: MON }] }));
    expect(textsOf(deleted.noFile)).toEqual(['horfin']);
    expect(deleted.stale).toEqual([]);
  });

  it('approves nothing that is no longer on the cards', () => {
    const r = run(file({ clips: [{ text: 'horfið', verdict: 'right', v: 'x', at: MON }] }));
    expect(r.approve).toEqual([]);
    expect(textsOf(r.unknown)).toEqual(['horfið']);
  });

  it('takes a reviewer’s latest verdict on a recording, whatever the order of the files', () => {
    const monday = file({ clips: [clip('les', 'wrong', MON)] });
    const thursday = file({
      date: '2026-10-22',
      saved: THU,
      notes: [{ key: 'dyr/giskaleikur', label: 'Dýr — Hvað er þetta?', text: 'Lagað.' }],
      clips: [clip('les', 'right', THU)],
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
    expect(anna.dates).toEqual(['2026-10-19', '2026-10-22']);
    expect([...anna.notes.values()].map((n) => n.text)).toEqual(['Lagað.']);
  });

  it('lets a later file withdraw a verdict, and keeps one a later file merely leaves out', () => {
    const withdrawn = run(
      file({ clips: [clip('les', 'wrong', MON)] }),
      file({ saved: THU, clips: [clip('les', 'withdrawn', THU)] })
    );
    expect(withdrawn.reject).toEqual([]);
    expect(withdrawn.conflicts).toEqual([]);
    const omitted = run(
      file({ clips: [clip('les', 'wrong', MON)] }),
      file({ saved: THU, clips: [] })
    );
    expect(textsOf(omitted.reject)).toEqual(['les']);
  });

  it('takes one reviewer whatever the case or spaces of the name', () => {
    const r = run(
      file({ clips: [clip('les', 'wrong', MON)] }),
      file({ reviewer: ' anna ', saved: THU, clips: [clip('les', 'right', THU)] })
    );
    expect(textsOf(r.approve)).toEqual(['les']);
    expect(byReviewer([readReview(file()), readReview(file({ reviewer: 'ANNA' }))])).toHaveLength(
      1
    );
  });
});

describe('the report', () => {
  it('names each reviewer once with their dates, every note under its item, and the recordings', () => {
    const reviews = [readReview(file()), readReview(file({ date: '2026-10-20', saved: TUE }))];
    const text = report(reviews, approvals(reviews, manifest, { texts, version, state }));
    expect(text).toContain('2 skrá(r) frá 1: Anna (2026-10-19, 2026-10-20)');
    expect(text.match(/A2: lundi er ekki á bæ\./g)).toHaveLength(1);
    expect(text).toContain('Dýr — Hvað er þetta?\n  Anna: A2: lundi er ekki á bæ.');
    expect(text).toContain('réttar, --apply samþykkir: 1');
    expect(text).toContain('„les“ — Anna: rangt (heyrist sem „e“)');
  });

  it('puts first an approved recording heard as wrong since, and says until when students hear it', () => {
    const reviews = [readReview(file({ clips: [clip('feldur', 'wrong', THU, 'rangt orð')] }))];
    const text = report(reviews, approvals(reviews, manifest, { texts, version, state }));
    expect(text.split('\n')[2]).toMatch(/^SAMÞYKKTAR EN SÍÐAN HEYRÐAR RANGAR: 1\..*settur upp\.$/);
    expect(text).toContain('„feldur“ — Anna: rangt (rangt orð)');
  });
});
