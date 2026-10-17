import { describe, expect, it } from 'vitest';

import { readHljod } from '../hljod.mjs';
import {
  DATA_END as SCRIPT_END,
  DATA_START as SCRIPT_START,
  FORMAT as SCRIPT_FORMAT,
  UNKNOWN,
  agreedBase,
  approvals,
  browserOf,
  CONFLICT,
  foldRecord,
  INNER_CONFLICT,
  mergeReviews,
  oursHunks,
  readLedger,
  readRecordFile,
  mergeThreeWay,
  readReview,
  report,
  reviewData,
  reviewerOf,
} from '../yfirferd.mjs';
import {
  DATA_END as PAGE_END,
  DATA_START as PAGE_START,
  FORMAT as PAGE_FORMAT,
  reviewFile,
  reviewText,
} from '../../../apps/islenskubraut/src/yfirferd/store';

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
// feldur is approved because Anna heard it as right before these tests begin: a recording plays
// only with an approval of its audio in the record.
const EARLIER = '2026-10-01T10:00:00Z';
const EMPTY = mergeReviews(readLedger(undefined), [
  readReview(file({ saved: EARLIER, notes: [], clips: [clip('feldur', 'right', EARLIER)] })),
]).ledger;
const merge = (
  ledger: ReturnType<typeof readLedger>,
  files: object[],
  rulers: string[] = [],
  options: { unrule?: string[]; now?: string } = {}
) =>
  mergeReviews(
    ledger,
    files.map((f, i) => readReview(f, `f${i}.json`)),
    rulers,
    options
  );
const run = (files: object[], rulers: string[] = [], ledger = EMPTY) => {
  const merged = merge(ledger, files, rulers);
  expect(merged.errors).toEqual([]);
  return approvals(merged.ledger, manifest, { texts, version, names: merged.names });
};
// Every recording the record decides, but feldur, approved before the tests, only once it moves.
type Outcome = { text: string; from: unknown; to: unknown };
const to = (r: ReturnType<typeof run>) =>
  Object.fromEntries(
    r.outcomes
      .filter((o: Outcome) => o.text !== 'feldur' || o.from !== o.to)
      .map((o: Outcome) => [o.text, o.to])
  );
const of = (r: ReturnType<typeof run>, text = 'les') =>
  r.outcomes.find((o: { text: string }) => o.text === text);

describe('a review file', () => {
  it('is the format the review page writes', () => {
    expect(PAGE_FORMAT).toBe(SCRIPT_FORMAT);
    expect([PAGE_START, PAGE_END]).toEqual([SCRIPT_START, SCRIPT_END]);
  });

  it('reads the copied text, saved from an email, as it reads the file', () => {
    const review = {
      reviewer: 'Anna',
      id: 'anna-vafri',
      notes: { 'dyr/spjald': 'x' },
      clips: { les: { verdict: 'wrong' as const, v: 'v2', at: MON, note: 'e' } },
    };
    const file = reviewFile(review, '2026-10-19', MON);
    const text = reviewText(review, '2026-10-19', MON);
    const email = `Sæll Siggi,\n\n${text}\nKveðja, Anna\n`;
    expect(reviewData(email, 'anna.txt')).toEqual([file]);
    expect(reviewData(JSON.stringify(file))).toEqual([file]);
    // An email client may wrap it short, quote it, or put non-breaking spaces in it.
    const mangled = email
      .split('\n')
      .flatMap((l) => (l.length > 40 ? [l.slice(0, 40), l.slice(40)] : [l]))
      .map((l) => `> ${l}`.replace(/ /g, '\u00a0'))
      .join('\r\n');
    expect(reviewData(mangled, 'svar.txt')).toEqual([file]);
    // Every copy in a thread is read, so a correction pasted below is not lost.
    expect(reviewData(`${email}\nLeiðrétting:\n${email}`, 'thread.txt')).toEqual([file, file]);
    // A review of the cards alone carries its data too.
    const notesOnly = { ...review, clips: {} };
    expect(reviewData(reviewText(notesOnly, '2026-10-19', MON))).toEqual([
      reviewFile(notesOnly, '2026-10-19', MON),
    ]);
    // Text with no data, and data that lost some of itself, are refused.
    expect(() => reviewData('Röng: „les“', 'a.txt')).toThrow(/neither a review file nor/);
    const lines = text.split('\n');
    const cut = lines.filter((_, i) => i !== lines.indexOf(SCRIPT_START) + 2).join('\n');
    expect(() => reviewData(cut, 'a.txt')).toThrow(/changed on its way.*ask for the file/);
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

  it('is from the browser that sent it and the name typed on it, and names no one', () => {
    const a = readReview(file());
    expect(reviewerOf(a)).toMatch(/^[0-9a-f]{12}$/);
    expect(reviewerOf(readReview(file({ reviewer: ' anna ' })))).toBe(reviewerOf(a));
    // Another name on the same browser is another teacher sharing it.
    expect(reviewerOf(readReview(file({ reviewer: 'Önnur' })))).not.toBe(reviewerOf(a));
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
    expect(of(r)!.overruled.map((v: { reviewer: string }) => v.reviewer)).toEqual(['Jón']);
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
      '--urskurdur "Siggi": the files of 2 browsers carry that name; a ruling must be one person. Pass only the files of the browser meant.',
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
    expect(to(r)).toEqual({});
    const deleted = run([file({ clips: [{ text: 'horfin', verdict: 'right', v: 'x', at: MON }] })]);
    expect(to(deleted)).toEqual({});
  });

  it('takes back an approval nobody gave the recording as it is now', () => {
    // feldur was made again since Anna approved it, and a merge or a hand edit kept `true`.
    const remade = (t: string) => (t === 'feldur' ? 'v4b' : version(t));
    const r = approvals(EMPTY, manifest, { texts, version: remade });
    expect(to(r)).toEqual({ feldur: false });
    expect(of(r, 'feldur')!.unbacked).toBe(true);
    expect(report([], r)).toMatch(
      /SAMÞYKKTAR[^\n]*\n  „feldur“[\s\S]*„feldur“: true → false — ekkert samþykki í matinu/
    );
  });

  it('counts rulings at one moment that disagree as a tie, in whatever order they are kept', () => {
    const at = MON;
    const entry = (verdict: string) => ({ v2: { verdict, at } });
    const ledger = (order: string[]) =>
      readLedger({
        rulers: ['r1', 'r2', 'r3'],
        verdicts: {
          les: Object.fromEntries(order.map((r) => [r, entry(r === 'r3' ? 'wrong' : 'right')])),
        },
      });
    for (const order of [
      ['r1', 'r2', 'r3'],
      ['r3', 'r1', 'r2'],
    ]) {
      expect(of(approvals(ledger(order), manifest, { texts, version }))!.to).toBe(false);
    }
  });

  it('lists what the record holds for texts no longer on the cards', () => {
    expect(
      run([file({ clips: [{ text: 'horfið', verdict: 'right', v: 'x', at: MON }] })]).unknown
    ).toEqual(['horfið']);
  });
});

describe('the record over time', () => {
  it('keeps a verdict on each recording of a text, so audio that comes back finds its own', () => {
    // Anna heard v1 as wrong; the audio was remade as v2 and she heard that as right.
    const first = merge(EMPTY, [
      file({ clips: [{ text: 'les', verdict: 'wrong', v: 'v1', at: MON }] }),
    ]);
    const second = merge(readLedger(first.ledger), [
      file({ saved: TUE, clips: [{ text: 'les', verdict: 'right', v: 'v2', at: TUE }] }),
    ]);
    const on = (v: string) =>
      approvals(second.ledger, manifest, { texts, version: () => v, names: second.names });
    expect(of(on('v2'))!.to).toBe(true);
    // Back to v1, by a revert: her "wrong" on exactly that audio is still there. Her "right" on
    // v2, given later, is shown as given to other audio, for a person to look at.
    expect(of(on('v1'))!.to).toBe('rangt');
    expect(of(on('v1'))!.late.map((v: { verdict: string }) => v.verdict)).toEqual(['right']);
  });

  it('keeps the latest note on a recording, whichever file is applied last', () => {
    // The page gives a note its own time, so the file with the note is the later one.
    const without = file({ clips: [clip('les', 'wrong', MON)] });
    const withNote = file({ saved: TUE, clips: [clip('les', 'wrong', TUE, 'heyrist sem e')] });
    const one = merge(readLedger(merge(EMPTY, [withNote]).ledger), [without]);
    expect(Object.values(one.ledger.verdicts.les)[0]).toEqual({
      v2: { verdict: 'wrong', at: TUE, b: browserOf(readReview(file())), note: 'heyrist sem e' },
    });
    // Older, newer, older again: the record is as it was after the newer.
    const a = merge(EMPTY, [without]);
    const b = merge(readLedger(a.ledger), [withNote]);
    const c = merge(readLedger(b.ledger), [without]);
    expect(c.ledger).toEqual(b.ledger);
  });

  it('lets the latest ruling decide, so a ruler can change their mind from another browser', () => {
    const first = merge(EMPTY, [siggi({ clips: [clip('les', 'right', MON)] })], ['Siggi']);
    // After Hreinsa allt the same person is a new browser, and rules again.
    const again = merge(
      readLedger(first.ledger),
      [siggi({ id: 'siggi-nyr', saved: TUE, clips: [clip('les', 'wrong', TUE, 'e')] })],
      ['Siggi']
    );
    const r = approvals(again.ledger, manifest, { texts, version, names: again.names });
    expect(to(r)).toEqual({ les: 'rangt' });
    expect(of(r)!.overruled.map((v: { verdict: string }) => v.verdict)).toEqual(['right']);
    // Two rulings given at the same moment that disagree settle nothing.
    const tie = merge(
      EMPTY,
      [siggi({ clips: [clip('les', 'right', MON)] }), jon({ clips: [clip('les', 'wrong', MON)] })],
      ['Siggi', 'Jón']
    );
    expect(to(approvals(tie.ledger, manifest, { texts, version, names: tie.names }))).toEqual({
      les: false,
    });
  });

  it('keeps two teachers on one browser apart, so neither’s verdicts replace the other’s', () => {
    // Anna marks it wrong and sends; Gunna types her own name over Anna's and marks it right.
    const anna = file({ id: 'skolatolva', clips: [clip('les', 'wrong', MON)] });
    const gunna = file({
      id: 'skolatolva',
      reviewer: 'Gunna',
      saved: TUE,
      date: '2026-10-20',
      clips: [clip('les', 'right', TUE)],
    });
    expect(to(run([anna, gunna]))).toMatchObject({ les: false });
    expect(to(run([gunna], [], merge(EMPTY, [anna]).ledger))).toMatchObject({ les: false });
    const both = merge(EMPTY, [anna, gunna]);
    expect(both.people.map((p: { reviewer: string }) => p.reviewer)).toEqual(['Anna', 'Gunna']);
    expect(both.shared).toEqual([['Anna', 'Gunna']]);
    expect(report(both.people, run([anna, gunna]), [], { shared: both.shared })).toContain(
      'Úr sama vafra undir fleiri en einu nafni: Anna, Gunna. Hvert nafn er talið sér'
    );
    // A ruling is by one of them, not by the browser.
    const ruled = merge(EMPTY, [anna, gunna], ['Gunna']);
    expect(ruled.errors).toEqual([]);
    expect(
      approvals(ruled.ledger, manifest, { texts, version, names: ruled.names }).outcomes.find(
        (o: { text: string }) => o.text === 'les'
      )
    ).toMatchObject({ to: true, overruled: [expect.objectContaining({ reviewer: 'Anna' })] });
  });

  it('takes a ruling by a name typed in any case, and shows a reviewer’s latest name', () => {
    const files = [
      siggi({ reviewer: 'siggi ', clips: [clip('les', 'right', MON)] }),
      siggi({ saved: TUE, date: '2026-10-20', clips: [] }),
    ];
    for (const name of ['Siggi', 'SIGGI']) expect(merge(EMPTY, files, [name]).errors).toEqual([]);
    expect(merge(EMPTY, files).people.map((p: { reviewer: string }) => p.reviewer)).toEqual([
      'Siggi',
    ]);
    // A name on two browsers' files, once or since, is not one person.
    const two = merge(EMPTY, [...files, jon({ reviewer: 'Siggi' })], ['Siggi']);
    expect(two.errors[0]).toMatch(/the files of 2 browsers carry that name/);
  });

  it('shows, without counting, a verdict on older audio given after the new one was heard', () => {
    // Anna's page was open from before the remake: it names the old audio, on Thursday.
    const r = run([
      jon({ clips: [clip('les', 'right', TUE)] }),
      file({
        saved: THU,
        clips: [{ text: 'les', verdict: 'wrong', v: 'gamalt', at: THU, note: 'e' }],
      }),
    ]);
    expect(to(r)).toEqual({ les: true });
    expect(of(r)!.late.map((v: { reviewer: string }) => v.reviewer)).toEqual(['Anna']);
    // Given before anyone heard the new audio, it is just a verdict on the old one.
    const before = run([
      file({ clips: [{ text: 'les', verdict: 'wrong', v: 'gamalt', at: MON }] }),
      jon({ saved: TUE, clips: [clip('les', 'right', TUE)] }),
    ]);
    expect(of(before)!.late).toEqual([]);
  });

  it('is its files folded together, in any order, as applying the review files gave it', () => {
    // Two machines apply different files; each run's additions are one file of the record.
    const monday = merge(EMPTY, [file({ clips: [clip('les', 'wrong', MON)] })]);
    const ours = merge(
      readLedger(monday.ledger),
      [jon({ clips: [clip('les', 'right', TUE)] })],
      ['Jón'],
      { now: TUE }
    );
    const theirs = merge(readLedger(monday.ledger), [
      file({ saved: THU, clips: [clip('les', 'wrong', THU, 'e'), clip('hali', 'right', THU)] }),
    ]);
    const both = merge(
      readLedger(monday.ledger),
      [
        jon({ clips: [clip('les', 'right', TUE)] }),
        file({ saved: THU, clips: [clip('les', 'wrong', THU, 'e'), clip('hali', 'right', THU)] }),
      ],
      ['Jón'],
      { now: TUE }
    );
    const start = merge(readLedger(undefined), [
      file({ saved: EARLIER, notes: [], clips: [clip('feldur', 'right', EARLIER)] }),
      file({ clips: [clip('les', 'wrong', MON)] }),
    ]).added;
    for (const files of [
      [start, ours.added, theirs.added],
      [theirs.added, start, ours.added],
    ]) {
      expect(foldRecord(files.map((f) => readRecordFile(f)))).toEqual(both.ledger);
    }
    // A file already in the record adds nothing.
    expect(
      merge(readLedger(both.ledger), [jon({ clips: [clip('les', 'right', TUE)] })]).added
    ).toEqual({
      verdicts: [],
      rulings: [],
    });
  });

  it('keeps the latest entry, and at one moment the one that approves least', () => {
    const e = (verdict: string, at: string, note?: string) => ({
      text: 'les',
      who: 'aaaaaaaaaaaa',
      b: 'bbbbbbbbbbbb',
      v: 'v2',
      verdict,
      at,
      ...(note ? { note } : {}),
    });
    const fold = (...entries: object[]) =>
      foldRecord(entries.map((x) => readRecordFile({ verdicts: [x] }))).verdicts.les.aaaaaaaaaaaa
        .v2;
    expect(fold(e('right', TUE), e('wrong', MON)).verdict).toBe('right');
    expect(fold(e('right', MON), e('wrong', MON)).verdict).toBe('wrong');
    expect(fold(e('wrong', MON), e('right', MON)).verdict).toBe('wrong');
    expect(fold(e('right', MON), e('withdrawn', MON)).verdict).toBe('withdrawn');
    expect(fold(e('wrong', MON, 'a'), e('wrong', MON, 'b'))).toEqual(
      fold(e('wrong', MON, 'b'), e('wrong', MON, 'a'))
    );
  });

  it('rules by the latest ruling, a stop winning at one moment, and takes one back by name or hash', () => {
    const s = (who: string, rules: boolean, at: string) =>
      readRecordFile({ rulings: [{ who, rules, at }] });
    const R = 'aaaaaaaaaaaa';
    expect(foldRecord([s(R, true, MON), s(R, false, TUE)]).rulers).toEqual([]);
    expect(foldRecord([s(R, false, TUE), s(R, true, THU)]).rulers).toEqual([R]);
    expect(foldRecord([s(R, true, MON), s(R, false, MON)]).rulers).toEqual([]);
    const ruled = merge(EMPTY, [siggi({ clips: [clip('les', 'right', MON)] })], ['Siggi'], {
      now: MON,
    });
    const who = ruled.ledger.rulers[0];
    expect(ruled.added.rulings).toEqual([{ who, rules: true, at: MON }]);
    for (const name of ['Siggi', who]) {
      const back = mergeReviews(
        readLedger(ruled.ledger),
        name === who ? [] : [readReview(siggi())],
        [],
        { unrule: [name], now: TUE }
      );
      expect(back.errors).toEqual([]);
      expect(back.ledger.rulers).toEqual([]);
      expect(back.added.rulings).toEqual([{ who, rules: false, at: TUE }]);
    }
    expect(mergeReviews(EMPTY, [], [], { unrule: [who], now: TUE }).errors[0]).toMatch(
      /does not rule/
    );
    // A ruling given again is recorded, so it outweighs a take-back given before it elsewhere.
    const takenBack = mergeReviews(readLedger(ruled.ledger), [], [], { unrule: [who], now: TUE });
    const again = merge(readLedger(ruled.ledger), [siggi()], ['Siggi'], { now: THU });
    expect(again.added.rulings).toEqual([{ who, rules: true, at: THU }]);
    const files = (...runs: { added: object }[]) => runs.map((r) => readRecordFile(r.added));
    expect(foldRecord(files(ruled, takenBack, again)).rulers).toEqual([who]);
    expect(foldRecord(files(again, takenBack, ruled)).rulers).toEqual([who]);
  });

  it('stamps a ruling, or one taken back, after the latest in the record, whatever the clock', () => {
    // Given on a machine whose clock ran two days ahead, taken back on one that is right.
    const ahead = '2026-10-21T10:00:00.000Z';
    const ruled = merge(EMPTY, [siggi({ clips: [clip('les', 'right', MON)] })], ['Siggi'], {
      now: ahead,
    });
    const who = ruled.ledger.rulers[0];
    const back = mergeReviews(readLedger(ruled.ledger), [], [], { unrule: [who], now: MON });
    expect(back.added.rulings).toEqual([{ who, rules: false, at: '2026-10-21T10:00:00.001Z' }]);
    // What the run works from is what every machine folds from the files.
    expect(back.ledger.rulers).toEqual([]);
    expect(foldRecord([readRecordFile(ruled.added), readRecordFile(back.added)]).rulers).toEqual(
      []
    );
  });

  it('refuses a file of the record it cannot read', () => {
    expect(() => readRecordFile({ verdicts: [{ text: 'les' }] }, 'x.json')).toThrow(/x\.json/);
    expect(() => readRecordFile({ rulers: [] }, 'x.json')).toThrow(/unknown keys/);
    expect(() => readRecordFile({ rulings: [{ who: 'Siggi', rules: true, at: MON }] })).toThrow(
      /rulings\[0\]/
    );
  });

  it('counts a browser’s later withdrawal under another name against its earlier approval', () => {
    // Anna approves, retypes her name on the same browser, and takes the mark back.
    const before = file({ clips: [clip('les', 'right', MON)] });
    const after = file({
      reviewer: 'Anna Jónsdóttir',
      saved: TUE,
      clips: [clip('les', 'withdrawn', TUE)],
    });
    expect(to(run([before, after]))).toEqual({ les: false });
    expect(to(run([after], [], merge(EMPTY, [before]).ledger))).toEqual({ les: false });
    // Or says wrong under the new name: rangt, not heard both ways.
    const wrong = file({
      reviewer: 'Anna Jónsdóttir',
      saved: TUE,
      clips: [clip('les', 'wrong', TUE)],
    });
    expect(to(run([before, wrong]))).toEqual({ les: 'rangt' });
    // A later approval under another name does not cancel a wrong: that may be a colleague.
    const colleague = file({ reviewer: 'Gunna', saved: TUE, clips: [clip('les', 'right', TUE)] });
    expect(to(run([file({ clips: [clip('les', 'wrong', MON)] }), colleague]))).toEqual({
      les: false,
    });
    // And the report says the browser carries two names, when its later file is applied alone,
    // and from the record alone, with no files.
    const later = merge(merge(EMPTY, [before]).ledger, [after]);
    expect(later.shared).toEqual([
      ['Anna Jónsdóttir', expect.stringMatching(/^kennari [0-9a-f]{6}$/)],
    ]);
    expect(merge(later.ledger, []).shared).toEqual([
      [expect.stringMatching(/^kennari /), expect.stringMatching(/^kennari /)],
    ]);
  });

  it('merges hljod.yaml and stada.json recording by recording, as git merges lines', () => {
    const m = (o: Record<string, unknown>) => new Map(Object.entries(o));
    const { merged, clashes } = mergeThreeWay(
      m({ a: false, b: false, c: false, d: true }),
      m({ a: true, b: false, c: 'rangt', d: true, nytt: false }),
      m({ a: false, b: true, c: true })
    );
    // a and nytt changed on our side only, b and d (removed) on theirs, c on both.
    expect(Object.fromEntries(merged)).toEqual({ a: true, b: true, nytt: false });
    expect(clashes).toEqual(['c']);
  });

  it('merges a recording only one side changed in a criss-cross history as that side has it', () => {
    const m = (o: Record<string, unknown>) => new Map(Object.entries(o));
    // The merge bases agree on a and b and disagree on c.
    const base = agreedBase(
      [m({ a: false, b: true, c: false }), m({ a: false, b: true, c: true })],
      ['a', 'b', 'c']
    );
    expect(base.get('c')).toBe(UNKNOWN);
    const { merged, clashes } = mergeThreeWay(
      base,
      m({ a: true, b: true, c: true }),
      m({ a: false, b: false, c: false })
    );
    expect(Object.fromEntries(merged)).toEqual({ a: true, b: false });
    expect(clashes).toEqual(['c']);
    // git's own base there holds longer markers of its own.
    expect(INNER_CONFLICT.test('{\n<<<<<<<<< Temporary merge branch 1\n')).toBe(true);
    expect(CONFLICT.test('{\n<<<<<<<<< Temporary merge branch 1\n')).toBe(false);
    // A clip one base lists as false and the other does not list was approved in neither, so a
    // side that marks it rangt takes it; one no base lists stays new.
    const listed = agreedBase([m({ h: false }), m({})], ['h', 'n'], undefined, false);
    expect(listed.get('h')).toBe(false);
    expect(listed.has('n')).toBe(false);
    expect(
      Object.fromEntries(mergeThreeWay(listed, m({ h: 'rangt' }), m({ h: false, n: false })).merged)
    ).toEqual({ h: 'rangt', n: false });
    // With no base to read, only what both sides agree on is taken.
    const none = agreedBase([], ['a', 'b']);
    expect(
      Object.fromEntries(mergeThreeWay(none, m({ a: true, b: 1 }), m({ a: true, b: 2 })).merged)
    ).toEqual({
      a: true,
    });
  });

  it('takes this side of a conflict in hljod.yaml, with the line ends of any checkout', () => {
    const lf =
      'voice: R\nclips:\n<<<<<<< HEAD\n  a: true\n=======\n  a: rangt\n>>>>>>> other\n  b: false\n';
    expect(oursHunks(lf)).toBe('voice: R\nclips:\n  a: true\n  b: false\n');
    expect(oursHunks(lf.replace(/\n/g, '\r\n'))).toBe(oursHunks(lf));
    expect(CONFLICT.test(lf.replace(/\n/g, '\r\n'))).toBe(true);
    // As git writes it with merge.conflictStyle diff3, and at the end of a file with no newline.
    const diff3 =
      'clips:\n<<<<<<< ours\n  a: true\n||||||| base\n  a: false\n=======\n  a: rangt\n>>>>>>> theirs';
    expect(oursHunks(diff3)).toBe('clips:\n  a: true\n');
  });

  it('does not ask a person to look at late verdicts a later ruling has since decided', () => {
    const stale = (at: string) =>
      file({ saved: at, clips: [{ text: 'les', verdict: 'wrong', v: 'gamalt', at }] });
    const ruled = (late: object) =>
      run(
        [
          jon({ clips: [clip('les', 'right', MON)] }),
          siggi({ clips: [clip('les', 'right', TUE)] }),
          late,
        ],
        ['Siggi']
      );
    // Given before the ruling: the ruler has heard the recording since, and decided.
    expect(of(ruled(stale(MON.replace('10:', '11:'))))!.late).toEqual([]);
    // Given after it: the ruler has not heard what this teacher said, so it is shown.
    expect(of(ruled(stale(THU)))!.late.map((v: { reviewer: string }) => v.reviewer)).toEqual([
      'Anna',
    ]);
  });

  it('keeps apart a text not on the cards and one hljod.yaml does not list yet', () => {
    const more = new Map([...texts, ['nýtt', []]]);
    const merged = merge(EMPTY, [
      file({
        clips: [
          { text: 'nýtt', verdict: 'right', v: 'x', at: MON },
          { text: 'horfið', verdict: 'right', v: 'x', at: MON },
        ],
      }),
    ]);
    const r = approvals(merged.ledger, manifest, { texts: more, version, names: merged.names });
    expect([r.unknown, r.unlisted]).toEqual([['horfið'], ['nýtt']]);
    expect(report(merged.people, r)).toContain('Metnar en ekki í hljod.yaml (keyrðu');
  });

  it('refuses a record in the shape it had before verdicts were kept per recording', () => {
    expect(() =>
      readLedger({ rulers: [], verdicts: { les: { abc: { verdict: 'right', v: 'v2', at: MON } } } })
    ).toThrow(/needs verdict and at/);
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

  it('counts what --apply does beside the verdicts: resets, recorded edits, merge clashes', () => {
    const text = report([], { outcomes: [], unknown: [], unlisted: [] }, [], {
      reset: [
        { text: 'feldur', from: true },
        { text: 'hali', from: false },
      ],
      stamped: ['fugl'],
      clashes: ['les'],
    });
    expect(text).toMatch(/SAMÞYKKTAR SEM HÆTTA AÐ VERA ÞAÐ: 1\.[^\n]*\n  „feldur“/);
    expect(text).toContain(
      'Breytingar sem --apply gerir: 1\n  „feldur“: true → false — upptakan er ný'
    );
    expect(text).toContain('skráð í stada.json eins og það stendur: „fugl“');
    expect(text).toContain('sett á false nema matið ráði: „les“');
  });

  it('counts a recording a merge clash takes from approved to false, and says why', () => {
    const text = report([], { outcomes: [], unknown: [], unlisted: [] }, [], {
      reset: [{ text: 'feldur', from: true, clash: true }],
      clashes: ['feldur'],
    });
    expect(text).toMatch(/SAMÞYKKTAR SEM HÆTTA AÐ VERA ÞAÐ: 1\./);
    expect(text).toContain('„feldur“: true → false — breytt á báða vegu í samruna í git');
  });

  it('lists what a merge takes from the other side, from what this side has', () => {
    const text = report([], { outcomes: [], unknown: [], unlisted: [] }, [], {
      reset: [
        { text: 'feldur', from: true, to: false, merged: true },
        { text: 'fugl', from: false, to: 'rangt', merged: true },
        { text: 'hali', from: false, to: false, merged: true },
      ],
    });
    expect(text).toMatch(/SAMÞYKKTAR SEM HÆTTA AÐ VERA ÞAÐ: 1\.[^\n]*\n  „feldur“\n/);
    expect(text).toContain('Breytingar sem --apply gerir: 2\n');
    expect(text).toContain('„feldur“: true → false — tekið af hinni hlið samrunans');
    expect(text).toContain('„fugl“: false → rangt — tekið af hinni hlið samrunans');
  });

  it('shows a reviewer’s notes from their latest file, so a note deleted since is gone', () => {
    const text = report(merge(EMPTY, [file(), file({ saved: TUE, notes: [] })]).people, {
      outcomes: [],
      unknown: [],
      unlisted: [],
    });
    expect(text).not.toContain('lundi er ekki á bæ');
  });

  it('names who rules, by the hash the record keeps, and lists late verdicts on other audio', () => {
    const merged = merge(
      EMPTY,
      [
        siggi({ clips: [clip('hali', 'right', MON)] }),
        jon({ clips: [clip('les', 'right', TUE)] }),
        file({
          saved: THU,
          clips: [{ text: 'les', verdict: 'wrong', v: 'gamalt', at: THU, note: 'e' }],
        }),
      ],
      ['Siggi']
    );
    const text = report(
      merged.people,
      approvals(merged.ledger, manifest, { texts, version, names: merged.names }),
      merged.ledger.rulers
    );
    expect(text).toContain(`Úrskurða (í matinu): Siggi (${merged.ledger.rulers[0]})`);
    expect(text).toMatch(/Metnar á annarri upptöku[^\n]*: 1\n  „les“ — Anna: rangt \(e\)/);
  });
});
