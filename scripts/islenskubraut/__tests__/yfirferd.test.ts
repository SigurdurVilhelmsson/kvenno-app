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
// `horfið` is in hljod.yaml but no longer on the cards; feldur is approved, fugl marked rangt.
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
const texts = new Map(['gæludýr', 'les', 'hali', 'feldur', 'fugl', 'horfin'].map((t) => [t, []]));
const run = (files: Record<string, unknown>[], rulers: string[] = []) =>
  approvals(
    files.map((f, i) => readReview(f, `f${i}.json`)),
    manifest,
    { texts, version, rulers }
  );
const to = (r: ReturnType<typeof run>) =>
  Object.fromEntries(r.outcomes.map((o: { text: string; to: unknown }) => [o.text, o.to]));

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

describe('what the reviews make of the recordings', () => {
  it('gives each recording the value all the verdicts on it give together', () => {
    const r = run([
      file(),
      file({
        reviewer: 'Jón',
        notes: [],
        clips: [clip('gæludýr', 'right', MON), clip('hali', 'wrong', MON)],
      }),
      file({ reviewer: 'Gunna', notes: [], clips: [clip('hali', 'right', MON)] }),
    ]);
    // Right only, wrong only, and both ways.
    expect(to(r)).toEqual({ gæludýr: true, hali: false, les: 'rangt' });
  });

  it('does not depend on the order the files came in, or on anyone’s clock', () => {
    // Anna's file came on Monday and was applied; Jón's, from earlier, came on Wednesday.
    const anna = file({ saved: TUE, clips: [clip('les', 'right', TUE)] });
    const jon = file({ reviewer: 'Jón', saved: MON, clips: [clip('les', 'wrong', MON, 'e')] });
    for (const order of [
      [anna, jon],
      [jon, anna],
    ]) {
      expect(to(run(order))).toEqual({ les: false });
    }
    // An approved recording someone heard as wrong stops being approved, whenever it was said.
    expect(to(run([file({ clips: [clip('feldur', 'wrong', MON)] })]))).toEqual({ feldur: 'rangt' });
  });

  it('lets a ruler settle a recording, and lists every verdict the ruling overrules', () => {
    const files = [
      file({ clips: [clip('les', 'right', MON)] }),
      file({ reviewer: 'Jón', clips: [clip('les', 'wrong', MON, 'óskýrt')] }),
      file({ reviewer: 'Siggi', clips: [clip('les', 'right', TUE)] }),
    ];
    const r = run(files, ['siggi']);
    expect(to(r)).toEqual({ les: true });
    const les = r.outcomes.find((o: { text: string }) => o.text === 'les');
    expect(les.overruled).toEqual([{ reviewer: 'Jón', verdict: 'wrong', at: MON, note: 'óskýrt' }]);
    // Two rulers who disagree settle nothing.
    const split = run(
      [...files, file({ reviewer: 'Gunna', clips: [clip('les', 'wrong', TUE)] })],
      ['Siggi', 'Gunna']
    );
    expect(to(split)).toEqual({ les: false });
  });

  it('leaves a recording to be heard again when its verdicts are for audio since replaced', () => {
    const r = run([file({ clips: [{ text: 'feldur', verdict: 'right', v: 'gamalt', at: MON }] })]);
    expect(to(r)).toEqual({ feldur: false });
    expect(r.outcomes[0].stale).toEqual(['Anna']);
    const deleted = run([file({ clips: [{ text: 'horfin', verdict: 'right', v: 'x', at: MON }] })]);
    expect(deleted.outcomes[0]).toMatchObject({ text: 'horfin', to: false, noFile: true });
  });

  it('takes a reviewer’s latest verdict on a recording, and a withdrawal takes it back', () => {
    const monday = file({ clips: [clip('les', 'wrong', MON)] });
    const thursday = file({ saved: THU, clips: [clip('les', 'right', THU)] });
    for (const order of [
      [monday, thursday],
      [thursday, monday],
    ]) {
      expect(to(run(order))).toEqual({ les: true });
    }
    const withdrawn = run([monday, file({ saved: THU, clips: [clip('les', 'withdrawn', THU)] })]);
    expect(to(withdrawn)).toEqual({ les: false });
    // An approved recording whose only verdict is taken back is no longer approved.
    expect(to(run([file({ clips: [clip('feldur', 'withdrawn', THU)] })]))).toEqual({
      feldur: false,
    });
    // A mark merely missing from a later file still stands.
    expect(to(run([monday, file({ saved: THU, clips: [] })]))).toEqual({ les: 'rangt' });
  });

  it('takes one reviewer whatever the case or spaces of the name', () => {
    const r = run([
      file({ clips: [clip('les', 'wrong', MON)] }),
      file({ reviewer: ' anna ', saved: THU, clips: [clip('les', 'right', THU)] }),
    ]);
    expect(to(r)).toEqual({ les: true });
    expect(byReviewer([readReview(file()), readReview(file({ reviewer: 'ANNA' }))])).toHaveLength(
      1
    );
  });

  it('touches nothing the files do not mention, and nothing no longer on the cards', () => {
    const r = run([file({ clips: [{ text: 'horfið', verdict: 'right', v: 'x', at: MON }] })]);
    expect(r.outcomes).toEqual([]);
    expect(r.unknown).toEqual(['horfið']);
  });
});

describe('the report', () => {
  it('names each reviewer once with their dates, every change with why, and the notes', () => {
    const reviews = [file(), file({ date: '2026-10-20', saved: TUE })].map((f) => readReview(f));
    const text = report(reviews, approvals(reviews, manifest, { texts, version }));
    expect(text).toContain('2 skrá(r) frá 1: Anna (2026-10-19, 2026-10-20)');
    expect(text.match(/A2: lundi er ekki á bæ\./g)).toHaveLength(1);
    expect(text).toContain('Dýr — Hvað er þetta?\n  Anna: A2: lundi er ekki á bæ.');
    expect(text).toContain('„les“: false → rangt — Anna: rangt (heyrist sem „e“)');
    expect(text).toContain('„gæludýr“: false → true — Anna: rétt');
  });

  it('puts first an approved recording that stops being approved, and says until when students hear it', () => {
    const reviews = [readReview(file({ clips: [clip('feldur', 'wrong', THU, 'rangt orð')] }))];
    const text = report(reviews, approvals(reviews, manifest, { texts, version }));
    expect(text.split('\n')[2]).toMatch(/^SAMÞYKKTAR SEM HÆTTA AÐ VERA ÞAÐ: 1\..*settur upp\.$/);
    expect(text).toContain('„feldur“: true → rangt — Anna: rangt (rangt orð)');
  });

  it('lists every recording heard both ways, and every verdict a ruling overrules, by name', () => {
    const reviews = [
      file({ clips: [clip('les', 'right', MON)] }),
      file({
        reviewer: 'Jón',
        clips: [clip('les', 'wrong', MON, 'óskýrt'), clip('hali', 'wrong', MON)],
      }),
      file({ reviewer: 'Siggi', clips: [clip('hali', 'right', MON)] }),
    ].map((f) => readReview(f));
    const text = report(
      reviews,
      approvals(reviews, manifest, { texts, version, rulers: ['Siggi'] })
    );
    expect(text).toContain('„les“ — Anna: rétt, Jón: rangt (óskýrt)');
    expect(text).toContain('„hali“ — Siggi: rétt; gegn: Jón: rangt');
  });
});
