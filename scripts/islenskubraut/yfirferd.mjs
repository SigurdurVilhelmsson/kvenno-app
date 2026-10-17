/**
 * Teachers' reviews, as the review page sends them (`/islenskubraut/yfirferd`, "Sækja skrá"): a
 * note per item and a verdict per recording. This module reads a file, adds its verdicts to the
 * committed record of every verdict given (the files in `hljod/mat/`), and works out from that
 * record what `yfirferd-check.mjs --apply` writes to `hljod.yaml`.
 *
 * The record, not the files, is what the values come from, so a file can be deleted once it has
 * been applied, and every machine works from the same verdicts. It names no one: each reviewer is
 * a hash of the id their browser stamps into every file it sends and the name typed there.
 *
 * Pure: the command does the reading and writing.
 */
import { createHash } from 'node:crypto';

import { valueOf } from './hljod.mjs';

export const FORMAT = 'islenskubraut-yfirferd/1';

/**
 * Where a review copied as text (`Afrita sem texta`) carries the same data as the file, so the
 * script can read an email as it reads a file. Between the markers is the file's JSON as base64
 * in short lines: an email may wrap long lines, quote them with `> ` or turn spaces into
 * non-breaking ones, and none of that touches base64's letters. The page writes them
 * (`store.ts`), and a test holds the two copies equal.
 */
export const DATA_START = '-----YFIRFERÐ, EKKI BREYTA-----';
export const DATA_END = '-----YFIRFERÐ LÝKUR-----';

/**
 * The reviews in a file the page saved, or in the text it copied, pasted or saved from an email:
 * a list, since an email thread can hold several copies. Returns the parsed data for `readReview`.
 */
export function reviewData(raw, where = 'review') {
  try {
    return [JSON.parse(raw)];
  } catch {
    // Not a file: text, with the data between the markers.
  }
  // An email client may have turned the markers' spaces into non-breaking ones.
  const text = raw.replace(/\u00a0/g, ' ');
  const out = [];
  for (let at = text.indexOf(DATA_START); at >= 0; at = text.indexOf(DATA_START, at + 1)) {
    const end = text.indexOf(DATA_END, at);
    assert(end > at, `${where}: a review's data has no end (${DATA_END}); ask for the file`);
    const letters = text.slice(at + DATA_START.length, end).replace(/[^A-Za-z0-9+/=]/g, '');
    try {
      out.push(JSON.parse(Buffer.from(letters, 'base64').toString('utf8')));
    } catch (e) {
      throw new Error(
        `yfirferd: ${where}: a review's data was changed on its way (${e.message}); ask for the file`
      );
    }
  }
  assert(
    out.length > 0,
    `${where} is neither a review file nor a review's text with its data (${DATA_START})`
  );
  return out;
}

/** A verdict the reviewer took back by pressing the pressed button again. */
export const WITHDRAWN = 'withdrawn';

function assert(condition, message) {
  if (!condition) throw new Error(`yfirferd: ${message}`);
}

/**
 * One review file, checked. Returns `{ reviewer, id, date, saved, notes, clips }`. `id` is the
 * random id the sending browser stamps into its files; a file without one was not made by the
 * review page, and is refused. A file with no reviewer's name is named by `where`, its file name.
 * Each verdict carries the version of the audio it was given to (`v`) and when it was given (`at`,
 * else when the file was saved).
 */
export function readReview(raw, where = 'review') {
  assert(raw && typeof raw === 'object', `${where} is not a review file`);
  assert(raw.format === FORMAT, `${where} is not a ${FORMAT} file (format: ${raw.format})`);
  const reviewer = typeof raw.reviewer === 'string' ? raw.reviewer.trim() : '';
  const id = typeof raw.id === 'string' ? raw.id.trim() : '';
  assert(id !== '', `${where} has no id, so it was not sent by the review page`);
  const date = typeof raw.date === 'string' ? raw.date : '';
  const saved = typeof raw.saved === 'string' ? raw.saved : date;
  assert(Array.isArray(raw.notes), `${where}: notes must be a list`);
  assert(Array.isArray(raw.clips), `${where}: clips must be a list`);
  const notes = raw.notes.map((n, i) => {
    assert(
      n && typeof n.key === 'string' && typeof n.text === 'string',
      `${where}: notes[${i}] needs a key and a text`
    );
    return { key: n.key, label: typeof n.label === 'string' ? n.label : n.key, text: n.text };
  });
  const clips = raw.clips.map((c, i) => {
    assert(c && typeof c.text === 'string' && c.text !== '', `${where}: clips[${i}] needs a text`);
    assert(
      c.verdict === 'right' || c.verdict === 'wrong' || c.verdict === WITHDRAWN,
      `${where}: clips[${i}].verdict must be right, wrong or ${WITHDRAWN}`
    );
    return {
      text: c.text,
      verdict: c.verdict,
      at: typeof c.at === 'string' ? c.at : saved,
      ...(typeof c.v === 'string' ? { v: c.v } : {}),
      ...(c.note ? { note: String(c.note) } : {}),
    };
  });
  return { reviewer: reviewer || where, id, date, saved, notes, clips };
}

/**
 * A name as an `--urskurdur` ruling is matched against the names in the files: ignoring case and
 * spaces at the ends. Files are told apart by their browser's id and that name (`reviewerOf`).
 */
export const reviewerKey = (name) => name.trim().toLocaleLowerCase('is');

/**
 * Who a file is from, as the record keeps it: a hash of the sending browser's random id and the
 * name typed on it, which cannot be traced back to either. Two teachers who type the same name are
 * still two, and so are two who share one browser, each under her own name: neither's verdicts
 * replace the other's. A teacher on two browsers, or who types her name another way, is two
 * reviewers, whose verdicts are weighed side by side.
 */
export function reviewerOf(review) {
  return createHash('sha256')
    .update(`id:${review.id}\nnafn:${reviewerKey(review.reviewer)}`, 'utf8')
    .digest('hex')
    .slice(0, 12);
}

/**
 * The browser a file is from, whatever name was typed: a hash of its id alone. The page keeps one
 * mark per recording per browser, so a later withdrawal or "wrong" from a browser, under any name,
 * is what that browser now says (`approvals`).
 */
export function browserOf(review) {
  return createHash('sha256').update(`vafri:${review.id}`, 'utf8').digest('hex').slice(0, 12);
}

const HASH = /^[0-9a-f]{12}$/;
const VERDICTS = ['right', 'wrong', WITHDRAWN];
// Of two entries given at the same moment, the one that approves least counts.
const RANK = { right: 0, [WITHDRAWN]: 1, wrong: 2 };

/** Whether entry `a` outranks `b` for one recording, reviewer and audio: the later, then the one
 * that approves least, then the note, so every machine keeps the same one. */
const outranks = (a, b) =>
  a.at !== b.at
    ? a.at > b.at
    : RANK[a.verdict] !== RANK[b.verdict]
      ? RANK[a.verdict] > RANK[b.verdict]
      : (a.note ?? '') > (b.note ?? '');

/**
 * The record in memory, checked: `{ rulers: [who], verdicts: { text: { who: { v: entry } } } }`,
 * per recording, per reviewer and per version of its audio the entry that counts
 * (`{ verdict, at, b?, note? }`, `b` the browser). A verdict on one recording of a text is kept
 * beside one on another, so audio that comes back (a revert, a remake that comes out the same)
 * finds its verdicts again.
 */
export function readLedger(raw) {
  if (raw === undefined) return { rulers: [], verdicts: {} };
  assert(raw && typeof raw === 'object', 'the record must be a map');
  const rulers = raw.rulers ?? [];
  const verdicts = raw.verdicts ?? {};
  assert(Array.isArray(rulers) && rulers.every((r) => typeof r === 'string'), 'record: rulers');
  for (const [text, byWho] of Object.entries(verdicts)) {
    for (const [who, byV] of Object.entries(byWho)) {
      assert(byV && typeof byV === 'object', `record: "${text}" from ${who} must be a map`);
      for (const [v, e] of Object.entries(byV)) {
        assert(
          e &&
            VERDICTS.includes(e.verdict) &&
            typeof e.at === 'string' &&
            (e.note === undefined || typeof e.note === 'string'),
          `record: "${text}" from ${who} on ${v} needs verdict and at`
        );
      }
    }
  }
  return { rulers, verdicts };
}

/**
 * One file of the record (`hljod/mat/*.json`), checked. Each holds what one `--apply` added:
 * `verdicts`, `[{ text, who, b, v, verdict, at, note? }]`, and `rulings`, `[{ who, rules, at }]`,
 * a reviewer starting (`rules: true`) or stopping to rule at `at`. A file is never changed once
 * written, so git never has two versions of one to merge.
 */
export function readRecordFile(raw, where = 'record file') {
  assert(raw && typeof raw === 'object' && !Array.isArray(raw), `${where} must be a map`);
  const { verdicts = [], rulings = [], ...rest } = raw;
  assert(Object.keys(rest).length === 0, `${where} has unknown keys: ${Object.keys(rest)}`);
  assert(
    Array.isArray(verdicts) && Array.isArray(rulings),
    `${where}: verdicts and rulings are lists`
  );
  for (const [i, e] of verdicts.entries()) {
    assert(
      e &&
        typeof e.text === 'string' &&
        HASH.test(e.who) &&
        HASH.test(e.b) &&
        typeof e.v === 'string' &&
        VERDICTS.includes(e.verdict) &&
        typeof e.at === 'string' &&
        (e.note === undefined || typeof e.note === 'string'),
      `${where}: verdicts[${i}] needs text, who, b, v, verdict and at`
    );
  }
  for (const [i, r] of rulings.entries()) {
    assert(
      r && HASH.test(r.who) && typeof r.rules === 'boolean' && typeof r.at === 'string',
      `${where}: rulings[${i}] needs who, rules and at`
    );
  }
  return { verdicts, rulings };
}

const sortedBy = (entries) =>
  Object.fromEntries(entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));

const sortedLedger = (rulers, verdicts) => ({
  rulers: [...rulers].sort(),
  verdicts: sortedBy(
    Object.entries(verdicts).map(([t, byWho]) => [
      t,
      sortedBy(Object.entries(byWho).map(([who, byV]) => [who, sortedBy(Object.entries(byV))])),
    ])
  ),
});

/**
 * The record from its files, in any order: per recording, reviewer and audio the entry that
 * outranks the rest (the latest; at one moment the one that approves least), and as rulers every
 * reviewer whose latest ruling says so (at one moment, stopping wins). Files only ever add, so
 * the same files give the same record on every machine, whatever git did to bring them together.
 */
export function foldRecord(files) {
  const verdicts = {};
  const rulings = new Map();
  for (const f of files) {
    for (const { text, who, v, ...e } of f.verdicts) {
      const byV = ((verdicts[text] ??= {})[who] ??= {});
      if (!byV[v] || outranks(e, byV[v])) byV[v] = e;
    }
    for (const r of f.rulings) {
      const was = rulings.get(r.who);
      if (!was || r.at > was.at || (r.at === was.at && !r.rules)) rulings.set(r.who, r);
    }
  }
  const rulers = [...rulings.values()].filter((r) => r.rules).map((r) => r.who);
  return sortedLedger(rulers, verdicts);
}

/**
 * Add files to the record. Per recording, reviewer and audio, the entry given latest counts, by
 * the time it was given: a verdict, or `withdrawn` for one taken back. A mark merely missing from
 * a later file stands; clearing the review on the page withdraws nothing already sent.
 *
 * `rulers` are names whose verdicts are to rule (`--urskurdur`), `unrule` names or hashes to stop
 * ruling: each name must be among the names one browser's files carry, and no other's. `now` is
 * when the rulings are given. Returns `{ ledger, added, names, people, shared, errors }`: `added`
 * is what the record lacked (`{ verdicts, rulings }`, the next file of the record, empty when the
 * files add nothing), `names` maps each reviewer hash in the files to the name on their latest
 * file, `people` lists each reviewer once with that name, the dates of their files and the notes
 * their latest file carries, and `shared` the names of each browser whose files carry more than
 * one.
 */
export function mergeReviews(ledger, reviews, rulers = [], { unrule = [], now = '' } = {}) {
  const verdicts = {};
  for (const [t, byWho] of Object.entries(ledger.verdicts)) {
    verdicts[t] = {};
    for (const [who, byV] of Object.entries(byWho)) verdicts[t][who] = { ...byV };
  }
  const added = { verdicts: [], rulings: [] };
  const names = new Map();
  const people = new Map();
  const ordered = reviews
    .map((r, i) => ({ r, i }))
    .sort((a, b) => a.r.saved.localeCompare(b.r.saved) || a.i - b.i)
    .map(({ r }) => r);
  for (const r of ordered) {
    const who = reviewerOf(r);
    const b = browserOf(r);
    names.set(who, r.reviewer);
    if (!people.has(who)) {
      people.set(who, {
        who,
        b,
        reviewer: r.reviewer,
        keys: new Set(),
        dates: [],
        notes: new Map(),
      });
    }
    const person = people.get(who);
    person.reviewer = r.reviewer;
    person.keys.add(reviewerKey(r.reviewer));
    if (r.date && !person.dates.includes(r.date)) person.dates.push(r.date);
    // Each file holds every note its browser keeps, so the latest file's are the notes.
    person.notes = new Map(r.notes.map((n) => [n.key, n]));
    for (const c of r.clips) {
      if (!c.v) continue;
      const e = { verdict: c.verdict, at: c.at, b, ...(c.note ? { note: c.note } : {}) };
      const byV = ((verdicts[c.text] ??= {})[who] ??= {});
      if (byV[c.v] && !outranks(e, byV[c.v])) continue;
      byV[c.v] = e;
      added.verdicts = added.verdicts.filter(
        (a) => !(a.text === c.text && a.who === who && a.v === c.v)
      );
      added.verdicts.push({ text: c.text, who, v: c.v, ...e });
    }
  }
  const errors = [];
  const ruling = new Set(ledger.rulers);
  const one = (name, flag) => {
    if (HASH.test(name) && flag === '--afturkalla') return name;
    const matching = [...people.values()].filter((p) => p.keys.has(reviewerKey(name)));
    if (matching.length === 1) return matching[0].who;
    if (matching.length === 0)
      errors.push(`${flag} "${name}": no file from a reviewer of that name`);
    else {
      const already = matching.filter((p) => ruling.has(p.who)).length;
      errors.push(
        `${flag} "${name}": the files of ${matching.length} browsers carry that name${
          already > 0 ? ` (${already} of them already ${already === 1 ? 'rules' : 'rule'})` : ''
        }; a ruling must be one person. Pass only the files of the browser meant.`
      );
    }
    return undefined;
  };
  for (const name of rulers) {
    const who = one(name, '--urskurdur');
    if (who && !ruling.has(who)) {
      ruling.add(who);
      added.rulings.push({ who, rules: true, at: now });
    }
  }
  for (const name of unrule) {
    const who = one(name, '--afturkalla');
    if (who === undefined) continue;
    if (!ruling.has(who)) errors.push(`--afturkalla "${name}": ${who} does not rule`);
    else {
      ruling.delete(who);
      added.rulings.push({ who, rules: false, at: now });
    }
  }
  added.verdicts.sort((x, y) =>
    x.text < y.text
      ? -1
      : x.text > y.text
        ? 1
        : x.who < y.who
          ? -1
          : x.who > y.who
            ? 1
            : x.v < y.v
              ? -1
              : 1
  );
  // A browser of the files whose verdicts, in these files or the record, carry two names: two
  // people sharing it, or one who retyped hers.
  const whosOf = new Map();
  const note = (b, who) => (whosOf.get(b) ?? whosOf.set(b, new Set()).get(b)).add(who);
  for (const byWho of Object.values(verdicts)) {
    for (const [who, byV] of Object.entries(byWho)) {
      for (const e of Object.values(byV)) if (e.b) note(e.b, who);
    }
  }
  for (const p of people.values()) note(p.b, p.who);
  const label = (who) => names.get(who) ?? `kennari ${who.slice(0, 6)}`;
  const shared = [...new Set([...people.values()].map((p) => p.b))]
    .map((b) => [...whosOf.get(b)])
    .filter((whos) => whos.length > 1)
    .map((whos) => whos.map(label).sort((a, b) => a.localeCompare(b, 'is')));
  return {
    ledger: sortedLedger(ruling, verdicts),
    added,
    names,
    people: [...people.values()],
    shared,
    errors,
  };
}

const CLASH = Symbol('clash');

/** A base value nobody can name: the merge bases of a criss-cross history disagree on it. */
export const UNKNOWN = Symbol('unknown');

/**
 * One map merged three ways, key by key, as git merges lines: a key only one side changed since
 * the base takes that side, and one both changed alike takes it. One both changed differently is
 * a clash, left out of `merged` and listed, and so is one whose base is `UNKNOWN` unless both
 * sides agree. `same` compares two values; `undefined` is absent.
 */
export function mergeThreeWay(base, ours, theirs, same = (a, b) => a === b) {
  const merged = new Map();
  const clashes = [];
  for (const k of new Set([...base.keys(), ...ours.keys(), ...theirs.keys()])) {
    const b = base.get(k);
    const o = ours.get(k);
    const t = theirs.get(k);
    const value = same(o, t) ? o : b === UNKNOWN ? CLASH : same(o, b) ? t : same(t, b) ? o : CLASH;
    if (value === CLASH) clashes.push(k);
    else if (value !== undefined) merged.set(k, value);
  }
  return { merged, clashes: clashes.sort() };
}

/**
 * The base of a three-way merge where git's own (`:1:`) is no use: in a criss-cross history it is
 * a merge of several bases, with conflict markers of its own. Here each key the real merge bases
 * (`maps`) all give alike has that value, and one they disagree on is `UNKNOWN`, so only a change
 * both sides agree on is taken. With no base to read, every key is `UNKNOWN`. `absent` is what a
 * base that lacks a key some other base has counts as (`false` for a clip `hljod.yaml` does not
 * list: nobody had approved it); a key no base has stays absent.
 */
export function agreedBase(maps, keys, same = (a, b) => a === b, absent = undefined) {
  const out = new Map();
  for (const k of keys) {
    if (maps.length === 0) {
      out.set(k, UNKNOWN);
      continue;
    }
    if (!maps.some((m) => m.has(k))) continue;
    const values = maps.map((m) => (m.has(k) ? m.get(k) : absent));
    if (values.every((v) => same(v, values[0]))) {
      if (values[0] !== undefined) out.set(k, values[0]);
    } else out.set(k, UNKNOWN);
  }
  return out;
}

/**
 * A file git left conflicted, each conflicted hunk taken from this side ("ours"), so what git
 * merged cleanly (in `hljod.yaml`, the voice and the comments) is kept. Its line ends are made
 * `\n` first: git writes the markers with the checkout's own, `\r\n` on Windows.
 */
export const oursHunks = (raw) =>
  raw
    .replace(/\r\n/g, '\n')
    .replace(
      /^<{7}[^\n]*\n([\s\S]*?)(?:^\|{7}[^\n]*\n[\s\S]*?)?^={7}\n[\s\S]*?^>{7}[^\n]*(?:\n|$(?![\s\S]))/gm,
      '$1'
    );

/** Conflict markers as git writes them, and as a criss-cross merge base holds them (longer). */
export const CONFLICT = /^(<{7}|={7}|>{7})( |\r?$)/m;
export const INNER_CONFLICT = /^(<{7,}|={7,}|>{7,})( |\r?$)/m;

/** The value the verdicts on a recording give it: right only is `true`, wrong only `rangt`. */
function valueFrom(verdicts) {
  const right = verdicts.some((v) => v.verdict === 'right');
  const wrong = verdicts.some((v) => v.verdict === 'wrong');
  return right && !wrong ? true : wrong && !right ? 'rangt' : false;
}

/**
 * What the record makes of the recordings. `manifest` is `hljod.yaml` (`readHljod`), `texts` the
 * texts on the cards (`textsToVoice`), `version(text)` the clip's current audio (`clipVersion`,
 * null with no file), `names` the reviewers' names where the files give them.
 *
 * Every recording with a verdict on its current audio gets the value all those verdicts give it
 * together: heard as right and never as wrong is `true`, as wrong and never as right `rangt`, and
 * anything else `false`, whatever it was before. One whose verdicts on its current audio were all
 * taken back is `false`: nobody vouches for it. A recording with verdicts only on other audio, or
 * none, keeps a `false` or `rangt` (`syncState` already set it back to `false` when the audio
 * changed); a `true` goes back to `false`, below.
 *
 * A recording `hljod.yaml` approves with no approval in the record of its audio as it is now goes
 * back to `false` (`unbacked`): an approval carried in by a git merge, or across a remake, or
 * written by hand, is not one anybody gave to what students would hear.
 *
 * A "right" is not counted where the same browser later withdrew it, or said "wrong", under
 * another name (`b`): the page keeps one mark per recording, so that is what the browser now says.
 * A "wrong" stands whatever another name on the browser says later, since two names may be two
 * teachers sharing it.
 *
 * A ruler's verdict decides a recording whatever the others say, and every verdict it overrules
 * is listed. Of several rulers' verdicts the latest decides, so a ruler who changes their mind,
 * from another browser too, can rule again; two given at the same moment that disagree settle
 * nothing.
 *
 * `late` lists verdicts on other audio given after a verdict on the current audio. Most are from
 * a page left open since before the recording was made again; one on audio since replaced by a
 * revert is another. The record cannot tell which, so they do not count and are shown, unless a
 * ruling given after them decides the recording.
 *
 * Returns `{ outcomes, unknown, unlisted }`. Each outcome is `{ text, from, to, verdicts,
 * ruling, overruled, late }`, the verdicts `[{ who, reviewer, verdict, at, note? }]`. `unknown`
 * lists texts in the record no longer on the cards, `unlisted` texts on the cards the record holds
 * verdicts for that `hljod.yaml` does not list (`pnpm islenskubraut:hljod --record` lists them).
 */
export function approvals(ledger, manifest, { texts, version, names = new Map() }) {
  const rulers = new Set(ledger.rulers);
  const outcomes = [];
  const unknown = [];
  const unlisted = [];
  const label = (who) => names.get(who) ?? `kennari ${who.slice(0, 6)}`;
  for (const [text, byWho] of Object.entries(ledger.verdicts)) {
    if (!texts.has(text)) {
      unknown.push(text);
      continue;
    }
    if (!manifest.clips.has(text)) {
      unlisted.push(text);
      continue;
    }
    const current = version(text);
    if (current === null) continue;
    const onCurrent = Object.entries(byWho).flatMap(([who, byV]) =>
      byV[current] ? [{ who, ...byV[current] }] : []
    );
    if (onCurrent.length === 0) continue;
    // The page keeps one mark per recording per browser: a later withdrawal or "wrong" from a
    // browser, under another name, is what it now says, so its earlier "right" no longer counts.
    const superseded = (e) =>
      e.verdict === 'right' &&
      e.b !== undefined &&
      onCurrent.some((o) => o.b === e.b && o.who !== e.who && o.at > e.at && o.verdict !== 'right');
    const verdicts = onCurrent
      .filter((e) => e.verdict !== WITHDRAWN && !superseded(e))
      .map((e) => ({
        who: e.who,
        reviewer: label(e.who),
        verdict: e.verdict,
        at: e.at,
        ...(e.note ? { note: e.note } : {}),
      }));
    const ruling = verdicts
      .filter((v) => rulers.has(v.who))
      .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
    const tied = ruling.some((v) => v.at === ruling[0].at && v.verdict !== ruling[0].verdict);
    const ruled = ruling.length === 0 ? undefined : tied ? null : ruling[0];
    const to = ruled
      ? ruled.verdict === 'right'
        ? true
        : 'rangt'
      : ruled === null
        ? false
        : valueFrom(verdicts);
    const first = onCurrent.map((e) => e.at).sort()[0];
    const late = Object.entries(byWho).flatMap(([who, byV]) =>
      Object.entries(byV)
        .filter(([v, e]) => v !== current && e.verdict !== WITHDRAWN && e.at > first)
        .map(([, e]) => ({
          who,
          reviewer: label(who),
          verdict: e.verdict,
          at: e.at,
          ...(e.note ? { note: e.note } : {}),
        }))
    );
    outcomes.push({
      text,
      from: valueOf(manifest, text),
      to,
      verdicts,
      ...(ruled ? { ruling: ruled } : {}),
      overruled: ruled ? verdicts.filter((v) => v.verdict !== ruled.verdict) : [],
      late: ruled ? late.filter((v) => v.at > ruled.at) : late,
    });
  }
  // Approved in hljod.yaml with no approval of the audio as it is now: back to false.
  for (const text of manifest.clips.keys()) {
    if (manifest.clips.get(text) !== true || !texts.has(text)) continue;
    if (outcomes.some((o) => o.text === text)) continue;
    outcomes.push({
      text,
      from: true,
      to: false,
      verdicts: [],
      overruled: [],
      late: [],
      unbacked: true,
    });
  }
  outcomes.sort((a, b) => a.text.localeCompare(b.text, 'is'));
  const byIs = (a, b) => a.localeCompare(b, 'is');
  return { outcomes, unknown: unknown.sort(byIs), unlisted: unlisted.sort(byIs) };
}

const quoted = (t) => `„${t}“`;
const said = (vs) =>
  vs
    .map(
      (v) =>
        `${v.reviewer}: ${v.verdict === 'right' ? 'rétt' : 'rangt'}${v.note ? ` (${v.note})` : ''}`
    )
    .join(', ');
const shown = (value) => (value === true ? 'true' : value === false ? 'false' : 'rangt');

/**
 * Everything the record and the files say, as text for a person: first any approved recording
 * that stops being approved, then every change, every recording heard both ways, every verdict a
 * ruling overrules, every verdict on other audio that came late, every recording heard as wrong
 * with what was said about it, the notes by item from the files given, and who rules.
 *
 * `extra` is what the command does beside the verdicts: `reset`, `[{ text, from, to?, clash?,
 * merged? }]`, the recordings whose value changes with no verdict deciding it (to `false` unless
 * `to` says otherwise): their audio changed or nothing recorded which audio was approved, both
 * sides of a git merge changed them differently (`clash`), or the merge took the other side's
 * value (`merged`); `stamped`, values written in hljod.yaml by hand that stada.json now records;
 * `clashes`, recordings both sides of a git merge changed differently, set to `false`; `shared`,
 * the names of each browser whose files carry more than one; and `inMerge`, that the changes are
 * measured from HEAD within a merge, so git's own share of them is counted with --apply's.
 */
export function report(people, result, rulers = [], extra = {}) {
  const { reset = [], stamped = [], clashes = [], shared = [], inMerge = false } = extra;
  const lines = [];
  lines.push(
    people.length === 0
      ? 'Engar skrár: aðeins það sem matið í hljod/mat/ geymir.'
      : `${people.length} yfirferð(ir) í skránum: ${people
          .map((p) => `${p.reviewer}${p.dates.length ? ` (${p.dates.join(', ')})` : ''}`)
          .join(', ')}`
  );
  for (const names of shared) {
    lines.push(
      `Úr sama vafra undir fleiri en einu nafni: ${names.join(', ')}. Hvert nafn er talið sér, en ef vafrinn dró „rétt“ síðar til baka eða sagði „rangt“ undir öðru nafni fellur það „rétt“ niður. Ef vafrinn var ekki hreinsaður á milli, ber síðari skráin líka mat hins fyrra.`
    );
  }
  const why = (o) =>
    o.unbacked
      ? 'ekkert samþykki í matinu (hljod/mat/) á upptökunni eins og hún er'
      : o.clash
        ? 'breytt á báða vegu í samruna í git'
        : o.merged
          ? 'tekið af hinni hlið samrunans'
          : o.remade
            ? 'upptakan er ný, eða ekki skráð hvaða upptaka var samþykkt'
            : [
                o.verdicts.length ? said(o.verdicts) : 'dregið til baka',
                o.ruling ? `úrskurður ${o.ruling.reviewer}` : '',
              ]
                .filter(Boolean)
                .join('; ');
  const changes = [
    ...result.outcomes.filter((o) => o.from !== o.to),
    // Set without a verdict: by a remake (`remade`, the default), a clash in a merge (`clash`) or
    // taken from the other side of one (`merged`). Going to false, unless `to` says otherwise.
    ...reset
      .map((r) => ({ to: false, ...r, ...(r.clash || r.merged ? {} : { remade: true }) }))
      .filter((r) => r.from !== r.to),
  ].sort((a, b) => a.text.localeCompare(b.text, 'is'));
  const revoked = changes.filter((o) => o.from === true);
  if (revoked.length > 0) {
    lines.push(
      '',
      `SAMÞYKKTAR SEM HÆTTA AÐ VERA ÞAÐ: ${revoked.length}. Nemendur heyra þær þar til ${inMerge ? 'samruninn hefur verið kláraður' : '--apply hefur verið keyrt'} og vefurinn byggður og settur upp.`
    );
    for (const o of revoked) lines.push(`  ${quoted(o.text)}`);
  }
  lines.push(
    '',
    inMerge
      ? `Breytingar frá því sem nemendur heyra nú (HEAD), samruninn og --apply saman: ${changes.length}`
      : `Breytingar sem --apply gerir: ${changes.length}`
  );
  for (const o of changes)
    lines.push(`  ${quoted(o.text)}: ${shown(o.from)} → ${shown(o.to)} — ${why(o)}`);
  if (clashes.length > 0) {
    lines.push(
      '',
      `Breytt á báða vegu í samruna í git, og því sett á false nema matið ráði: ${clashes.map(quoted).join(', ')}`
    );
  }
  if (stamped.length > 0) {
    lines.push(
      '',
      `Breytt í hljod.yaml í höndunum, skráð í stada.json eins og það stendur: ${stamped.map(quoted).join(', ')}`
    );
  }
  const both = result.outcomes.filter(
    (o) =>
      !o.ruling &&
      o.verdicts.some((v) => v.verdict === 'right') &&
      o.verdicts.some((v) => v.verdict === 'wrong')
  );
  if (both.length > 0) {
    lines.push(
      '',
      `Rétt hjá einum, rangt hjá öðrum (false; skerðu úr með --urskurdur): ${both.length}`
    );
    for (const o of both) lines.push(`  ${quoted(o.text)} — ${said(o.verdicts)}`);
  }
  const overruled = result.outcomes.filter((o) => o.overruled.length > 0);
  if (overruled.length > 0) {
    lines.push('', `Úrskurður gegn öðrum: ${overruled.length}`);
    for (const o of overruled) {
      lines.push(
        `  ${quoted(o.text)} — ${o.ruling.reviewer}: ${o.ruling.verdict === 'right' ? 'rétt' : 'rangt'}; gegn: ${said(o.overruled)}`
      );
    }
  }
  const late = result.outcomes.filter((o) => o.late.length > 0);
  if (late.length > 0) {
    lines.push(
      '',
      `Metnar á annarri upptöku en þeirri sem nú er, eftir að hún hafði verið metin (á síðu sem var opin frá því fyrir uppfærslu, eða á upptöku sem síðan var horfið frá); ekki taldar, hlustaðu sjálf/ur og skerðu úr: ${late.length}`
    );
    for (const o of late) lines.push(`  ${quoted(o.text)} — ${said(o.late)}`);
  }
  const wrong = result.outcomes.filter((o) => o.to === 'rangt');
  if (wrong.length > 0) {
    lines.push('', `Rangar, og hvað var sagt um þær (til að gera þær aftur): ${wrong.length}`);
    for (const o of wrong) {
      lines.push(`  ${quoted(o.text)} — ${said(o.verdicts.filter((v) => v.verdict === 'wrong'))}`);
    }
  }
  const byItem = new Map();
  for (const p of people) {
    for (const n of p.notes.values()) {
      if (!byItem.has(n.key)) byItem.set(n.key, { label: n.label, notes: [] });
      byItem.get(n.key).notes.push({ reviewer: p.reviewer, text: n.text });
    }
  }
  for (const { label, notes } of [...byItem.values()].sort((a, b) =>
    a.label.localeCompare(b.label, 'is')
  )) {
    lines.push('', label);
    for (const n of notes) lines.push(`  ${n.reviewer}: ${n.text.replace(/\n+/g, ' / ')}`);
  }
  if (result.unlisted?.length > 0) {
    lines.push(
      '',
      `Metnar en ekki í hljod.yaml (keyrðu pnpm islenskubraut:hljod --record og svo --apply): ${result.unlisted.map(quoted).join(', ')}`
    );
  }
  if (result.unknown.length > 0) {
    lines.push('', `Í skránni en ekki á spjöldunum: ${result.unknown.map(quoted).join(', ')}`);
  }
  if (rulers.length > 0) {
    const named = new Map(people.map((p) => [p.who, p.reviewer]));
    lines.push(
      '',
      `Úrskurða (í matinu): ${rulers.map((r) => (named.has(r) ? `${named.get(r)} (${r})` : r)).join(', ')}`
    );
  }
  return `${lines.join('\n')}\n`;
}
