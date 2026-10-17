import { describe, expect, it } from 'vitest';

import { readHljod } from '../hljod.mjs';
import {
  FORMAT as SCRIPT_FORMAT,
  approvals,
  mergeReviews,
  readLedger,
  readReview,
  report,
  reviewerOf,
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
) => ({ text, verdict, v: V[text] ?? 'gamalt', at, ...(note ? { note } : {}) });
const MON = '2026-10-19T10:00:00Z';
const TUE = '2026-10-20T10:00:00Z';
const THU = '2026-10-22T10:00:00Z';

const file = (over: Record<string, unknown> = {}) => ({
  format: SCRIPT_FORMAT,
  reviewer: 'Anna',
  id: 'anna-vafri',
  date: '2026-10-19',
  saved: MON,
  notes: [
    { key: 'dyr/giskaleikur', label: 'Dýr — Hvað er þetta?', text: 'A2: lundi er ekki á bæ.' },
  ],
  clips: [clip('gæludýr', 'right', MON), clip('les', 'wrong', MON, 'heyrist sem „e“')],
  ...over,
});
const jon = (over: Record<string, unknown> = {}) =>
  file({ reviewer: 'Jón', id: 'jon-vafri', notes: [], ...over });
const siggi = (over: Record<string, unknown> = {}) =>
  file({ reviewer: 'Siggi', id: 'siggi-vafri', notes: [], ...over });
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
const EMPTY = readLedger(undefined);
const merge = (ledger: ReturnType<typeof readLedger>, files: object[], rulers: string[] = []) =>
  mergeReviews(
    ledger,
    files.map((f, i) => readReview(f, `f${i}.json`)),
    rulers
  );
const run = (files: object[], rulers: string[] = [], ledger = EMPTY) => {
  const merged = merge(ledger, files, rulers);
  expect(merged.errors).toEqual([]);
  return approvals(merged.ledger, manifest, { texts, version, names: merged.names });
};
const to = (r: ReturnType<typeof run>) =>
  Object.fromEntries(r.outcomes.map((o: { text: string; to: unknown }) => [o.text, o.to]));

describe('a review file', () => {
  it('is the format the review page writes', () => {
    expect(PAGE_FORMAT).toBe(SCRIPT_FORMAT);
  });

  it('reads back as written, each verdict with its audio and when it was given', () => {
    expect(readReview(file())).toEqual({
      reviewer: 'Anna',
      id: 'anna-vafri',
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
    expect(readReview(file({ clips: [{ text: 'les', verdict: 'right' }] })).clips[0].at).toBe(MON);
  });

  it('refuses a file it cannot read as a review', () => {
    expect(() => readReview(file({ format: 'annað' }))).toThrow(/not a islenskubraut-yfirferd\/1/);
    expect(() => readReview(file({ notes: {} }))).toThrow(/notes must be a list/);
    expect(() => readReview(file({ clips: [{ text: 'x', verdict: 'kannski' }] }))).toThrow(
      /verdict must be right, wrong or withdrawn/
    );
    expect(() => readReview(file({ notes: [{ key: 'x' }] }))).toThrow(/needs a key and a text/);
    expect(() => readReview(file({ id: undefined }), 'gomul.json')).toThrow(
      /gomul\.json has no id/
    );
  });

  it('is from the browser that sent it, not from the name typed, and names no one', () => {
    const a = readReview(file());
    expect(reviewerOf(a)).toMatch(/^[0-9a-f]{12}$/);
    expect(reviewerOf(readReview(file({ reviewer: 'Önnur' })))).toBe(reviewerOf(a));
    expect(reviewerOf(readReview(file({ id: 'annar-vafri' })))).not.toBe(reviewerOf(a));
    const { ledger } = merge(EMPTY, [file()]);
    expect(JSON.stringify(ledger)).not.toMatch(/Anna|anna-vafri/);
  });
});

describe('what the record makes of the recordings', () => {
  it('gives each recording the value all the verdicts on it give together', () => {
    const r = run([
      file(),
      jon({ clips: [clip('gæludýr', 'right', MON), clip('hali', 'wrong', MON)] }),
      file({ reviewer: 'Gunna', id: 'gunna', notes: [], clips: [clip('hali', 'right', MON)] }),
    ]);
    expect(to(r)).toEqual({ gæludýr: true, hali: false, les: 'rangt' });
  });

  it('remembers every verdict, so a file not given again cannot be forgotten', () => {
    // Anna's "wrong" was applied on one machine; Jón's "right" is applied later on another.
    const { ledger } = merge(EMPTY, [file({ clips: [clip('les', 'wrong', MON)] })]);
    const later = run([jon({ clips: [clip('les', 'right', TUE)] })], [], readLedger(ledger));
    expect(to(later)).toEqual({ les: false });
    // And a file applied twice changes nothing.
    const again = merge(readLedger(ledger), [file({ clips: [clip('les', 'wrong', MON)] })]);
    expect(again.ledger).toEqual(ledger);
  });

  it('does not depend on the order the files came in', () => {
    const anna = file({ saved: TUE, clips: [clip('les', 'right', TUE)] });
    const j = jon({ saved: MON, clips: [clip('les', 'wrong', MON, 'e')] });
    expect(to(run([anna, j]))).toEqual({ les: false });
    expect(to(run([j, anna]))).toEqual({ les: false });
    expect(to(run([file({ clips: [clip('feldur', 'wrong', MON)] })]))).toEqual({ feldur: 'rangt' });
  });

  it('lets a ruler settle a recording, keeps the ruling, and lists what it overrules', () => {
    const files = [
      file({ clips: [clip('les', 'right', MON)] }),
      jon({ clips: [clip('les', 'wrong', MON, 'óskýrt')] }),
      siggi({ clips: [clip('les', 'right', TUE)] }),
    ];
    const first = merge(EMPTY, files, ['siggi']);
    const r = approvals(first.ledger, manifest, { texts, version, names: first.names });
    expect(to(r)).toEqual({ les: true });
    expect(r.outcomes[0].overruled.map((v: { reviewer: string }) => v.reviewer)).toEqual(['Jón']);
    // A later run without --urskurdur still has the ruling.
    const next = run(
      [file({ reviewer: 'Gunna', id: 'gunna', notes: [], clips: [clip('hali', 'right', THU)] })],
      [],
      readLedger(first.ledger)
    );
    expect(to(next)).toMatchObject({ les: true, hali: true });
  });

  it('refuses a ruling by a name two people go by, or no one does', () => {
    const two = merge(EMPTY, [siggi(), siggi({ id: 'annar-siggi' }), file()], ['Siggi']);
    expect(two.errors).toEqual([
      '--urskurdur "Siggi": 2 reviewers go by that name; a ruling must be one person',
    ]);
    expect(merge(EMPTY, [file()], ['Siggi']).errors[0]).toMatch(/no file from a reviewer/);
  });

  it('keeps two teachers who type the same name apart', () => {
    const r = run([
      file({ clips: [clip('les', 'wrong', MON)] }),
      file({ id: 'onnur-anna', saved: TUE, clips: [clip('les', 'right', TUE)] }),
    ]);
    expect(to(r)).toEqual({ les: false });
  });

  it('takes a reviewer’s latest verdict, and a withdrawal leaves nobody vouching', () => {
    const monday = file({ clips: [clip('les', 'wrong', MON)] });
    const thursday = file({ saved: THU, clips: [clip('les', 'right', THU)] });
    expect(to(run([monday, thursday]))).toEqual({ les: true });
    expect(to(run([thursday, monday]))).toEqual({ les: true });
    expect(to(run([monday, file({ saved: THU, clips: [clip('les', 'withdrawn', THU)] })]))).toEqual(
      { les: false }
    );
    expect(to(run([file({ clips: [clip('feldur', 'withdrawn', THU)] })]))).toEqual({
      feldur: false,
    });
    expect(to(run([monday, file({ saved: THU, clips: [] })]))).toEqual({ les: 'rangt' });
  });

  it('leaves a recording heard only on audio since replaced as it is', () => {
    // syncState already set it back to false when the audio changed; an approval made since for
    // the new audio must not be undone by the old verdicts.
    const r = run([file({ clips: [{ text: 'feldur', verdict: 'wrong', v: 'gamalt', at: MON }] })]);
    expect(r.outcomes).toEqual([]);
    const deleted = run([file({ clips: [{ text: 'horfin', verdict: 'right', v: 'x', at: MON }] })]);
    expect(deleted.outcomes).toEqual([]);
  });

  it('lists what the record holds for texts no longer on the cards', () => {
    expect(
      run([file({ clips: [{ text: 'horfið', verdict: 'right', v: 'x', at: MON }] })]).unknown
    ).toEqual(['horfið']);
  });
});

describe('the report', () => {
  const reportOf = (files: object[], rulers: string[] = []) => {
    const merged = merge(EMPTY, files, rulers);
    return report(
      merged.people,
      approvals(merged.ledger, manifest, { texts, version, names: merged.names })
    );
  };

  it('names each reviewer once with their dates, every change with why, and the notes', () => {
    const text = reportOf([file(), file({ date: '2026-10-20', saved: TUE })]);
    expect(text).toContain('1 yfirferð(ir) í skránum: Anna (2026-10-19, 2026-10-20)');
    expect(text.match(/A2: lundi er ekki á bæ\./g)).toHaveLength(1);
    expect(text).toContain('Breytingar sem --apply gerir: 2');
    expect(text).toContain('„les“: false → rangt — Anna: rangt (heyrist sem „e“)');
    expect(text).toContain('„gæludýr“: false → true — Anna: rétt');
  });

  it('puts first an approved recording that stops being approved, and counts it once', () => {
    const text = reportOf([file({ clips: [clip('feldur', 'wrong', THU, 'rangt orð')] })]);
    expect(text.split('\n')[2]).toMatch(/^SAMÞYKKTAR SEM HÆTTA AÐ VERA ÞAÐ: 1\..*settur upp\.$/);
    expect(text).toContain('Breytingar sem --apply gerir: 1\n  „feldur“: true → rangt');
  });

  it('lists every recording heard both ways, every overruled verdict, and every wrong note', () => {
    const text = reportOf(
      [
        file({ clips: [clip('les', 'right', MON), clip('fugl', 'wrong', MON, 'gok')] }),
        jon({
          clips: [
            clip('les', 'wrong', MON, 'óskýrt'),
            clip('hali', 'wrong', MON),
            clip('fugl', 'wrong', MON, 'vantar g'),
          ],
        }),
        siggi({ clips: [clip('hali', 'right', MON)] }),
      ],
      ['Siggi']
    );
    expect(text).toContain('„les“ — Anna: rétt, Jón: rangt (óskýrt)');
    expect(text).toContain('„hali“ — Siggi: rétt; gegn: Jón: rangt');
    // A recording already rangt that stays rangt: what both said about it, for remaking it.
    expect(text).toContain('„fugl“ — Anna: rangt (gok), Jón: rangt (vantar g)');
  });
});
