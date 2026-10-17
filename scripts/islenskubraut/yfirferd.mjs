/**
 * Teachers' reviews, as the review page sends them (`/islenskubraut/yfirferd`, "Sækja skrá"): a
 * note per item and a verdict per recording. This module reads one, sums several up, and works out
 * what `yfirferd-check.mjs --apply` writes to `hljod.yaml`.
 *
 * Pure: the command does the reading and writing.
 */

export const FORMAT = 'islenskubraut-yfirferd/1';

/** A verdict the reviewer took back by pressing the pressed button again. */
export const WITHDRAWN = 'withdrawn';

function assert(condition, message) {
  if (!condition) throw new Error(`yfirferd: ${message}`);
}

/**
 * One review file, checked. Returns `{ reviewer, date, saved, notes, clips }`. A file with no
 * reviewer's name is named by `where`, its file name. Each verdict carries the version of the
 * audio it was given to (`v`) and when it was given (`at`, else when the file was saved).
 */
export function readReview(raw, where = 'review') {
  assert(raw && typeof raw === 'object', `${where} is not a review file`);
  assert(raw.format === FORMAT, `${where} is not a ${FORMAT} file (format: ${raw.format})`);
  const reviewer = typeof raw.reviewer === 'string' ? raw.reviewer.trim() : '';
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
  return { reviewer: reviewer || where, date, saved, notes, clips };
}

/** Two files are from one reviewer when the names match, ignoring case and spaces at the ends. */
const reviewerKey = (name) => name.trim().toLocaleLowerCase('is');

/**
 * What each reviewer says, once. Per recording, a reviewer's latest verdict counts, by when it
 * was given, and a withdrawn one leaves that reviewer with none. Per item, the note in their
 * latest file that has one counts. A verdict or note in an earlier file stands unless a later
 * one replaces or withdraws it: clearing the review on the page withdraws nothing already sent.
 * Returns `[{ reviewer, dates, notes: Map(key → note), clips: Map(text → verdict) }]`.
 */
export function byReviewer(reviews) {
  const ordered = reviews
    .map((r, i) => ({ r, i }))
    .sort((a, b) => a.r.saved.localeCompare(b.r.saved) || a.i - b.i)
    .map(({ r }) => r);
  const out = new Map();
  for (const r of ordered) {
    const key = reviewerKey(r.reviewer);
    if (!out.has(key)) {
      out.set(key, { reviewer: r.reviewer, dates: [], notes: new Map(), clips: new Map() });
    }
    const who = out.get(key);
    if (r.date && !who.dates.includes(r.date)) who.dates.push(r.date);
    for (const n of r.notes) who.notes.set(n.key, n);
    for (const c of r.clips) {
      const before = who.clips.get(c.text);
      if (!before || before.at <= c.at) who.clips.set(c.text, c);
    }
  }
  for (const who of out.values()) {
    for (const [text, c] of who.clips) if (c.verdict === WITHDRAWN) who.clips.delete(text);
  }
  return [...out.values()];
}

/**
 * What the reviews mean for the recordings. `manifest` is `hljod.yaml` (`readHljod`), `texts` the
 * texts on the cards (`textsToVoice`), `version(text)` the clip's current audio (`clipVersion`,
 * null with no file), and `state` the record of when each value was set (`stada.json`, brought up
 * to date with `syncState`). A verdict counts only for the audio it was given to.
 *
 * A draft (`false`) goes by every verdict on it. A decision (`true` or `rangt`), whether by a
 * person or by an earlier `--apply`, stands against every verdict given before it, so a conflict
 * a person has settled stays settled; only a verdict given since can reopen it.
 *
 * - `approve`: a draft someone heard as right and nobody as wrong. `--apply` writes `true`.
 * - `reject`: a draft someone heard as wrong and nobody as right. `--apply` writes `rangt`, so a
 *   later run cannot approve it on another reviewer's word.
 * - `revoke`: approved, and heard as wrong since. Students hear it until `--apply` has written
 *   `rangt` and the site has been built and deployed.
 * - `conflicts`: a draft heard both ways, for a person to settle by writing `true` or `rangt`.
 * - `blocked`: `rangt`, and heard as right since. A person decides: `true`, or make it again.
 * - `already`: nothing new since the decision.
 * - `stale`: every verdict was given to a recording since made again; listen again.
 * - `noFile`: the clip has no file just now (deleted to be made again).
 * - `unknown`: no longer on the cards, or never recorded.
 *
 * Each entry is `{ text, verdicts: [{ reviewer, verdict, at, note? }] }`.
 */
export function approvals(reviews, manifest, { texts, version, state = {} }) {
  const onCards = (text) => texts.has(text) && manifest.clips.has(text);
  const sorted = { current: new Map(), stale: new Map(), noFile: new Map(), unknown: new Map() };
  for (const who of byReviewer(reviews)) {
    for (const c of who.clips.values()) {
      const current = onCards(c.text) ? version(c.text) : undefined;
      const bucket = !onCards(c.text)
        ? 'unknown'
        : current === null
          ? 'noFile'
          : c.v === current
            ? 'current'
            : 'stale';
      const list = sorted[bucket];
      if (!list.has(c.text)) list.set(c.text, []);
      list.get(c.text).push({
        reviewer: who.reviewer,
        verdict: c.verdict,
        at: c.at,
        ...(c.note ? { note: c.note } : {}),
      });
    }
  }
  const result = {
    approve: [],
    reject: [],
    revoke: [],
    conflicts: [],
    blocked: [],
    already: [],
    stale: [],
    noFile: [],
    unknown: [],
  };
  for (const [text, vs] of sorted.unknown) result.unknown.push({ text, verdicts: vs });
  for (const [text, vs] of sorted.noFile) result.noFile.push({ text, verdicts: vs });
  for (const [text, vs] of sorted.stale) {
    if (!sorted.current.has(text)) result.stale.push({ text, verdicts: vs });
  }
  for (const [text, vs] of sorted.current) {
    const entry = { text, verdicts: vs };
    const decided = state[text]?.v === version(text) ? state[text].at : '';
    const since = vs.filter((v) => v.at > decided);
    const right = (list) => list.some((v) => v.verdict === 'right');
    const wrong = (list) => list.some((v) => v.verdict === 'wrong');
    if (manifest.clips.get(text)) result[wrong(since) ? 'revoke' : 'already'].push(entry);
    else if (manifest.rejected.has(text)) result[right(since) ? 'blocked' : 'already'].push(entry);
    else if (right(vs) && wrong(vs)) result.conflicts.push(entry);
    else result[right(vs) ? 'approve' : 'reject'].push(entry);
  }
  for (const list of Object.values(result)) list.sort((a, b) => a.text.localeCompare(b.text, 'is'));
  return result;
}

const quoted = (t) => `„${t}“`;
const said = (vs) =>
  vs
    .map(
      (v) =>
        `${v.reviewer}: ${v.verdict === 'right' ? 'rétt' : 'rangt'}${v.note ? ` (${v.note})` : ''}`
    )
    .join(', ');

/** Everything the reviews say, as text for a person: the notes by item, then the recordings. */
export function report(reviews, result) {
  const people = byReviewer(reviews);
  const lines = [];
  lines.push(
    `${reviews.length} skrá(r) frá ${people.length}: ${people
      .map((p) => `${p.reviewer}${p.dates.length ? ` (${p.dates.join(', ')})` : ''}`)
      .join(', ')}`
  );
  if (result.revoke.length > 0) {
    lines.push(
      '',
      `SAMÞYKKTAR EN SÍÐAN HEYRÐAR RANGAR: ${result.revoke.length}. Nemendur heyra þær þar til --apply hefur verið keyrt og vefurinn byggður og settur upp.`
    );
    for (const e of result.revoke) lines.push(`  ${quoted(e.text)} — ${said(e.verdicts)}`);
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
  const section = (title, list, detail = false) => {
    lines.push(`  ${title}: ${list.length}`);
    if (detail) for (const e of list) lines.push(`    ${quoted(e.text)} — ${said(e.verdicts)}`);
  };
  lines.push('', 'Upptökur');
  section('réttar, --apply samþykkir', result.approve);
  section('rangar, --apply merkir rangt', result.reject, true);
  section('rétt hjá einum, rangt hjá öðrum (skrifaðu true eða rangt)', result.conflicts, true);
  section(
    'heyrðar réttar eftir að þær voru merktar rangt (skrifaðu true, eða búðu þær til aftur)',
    result.blocked,
    true
  );
  section('hlustað á eldri upptöku, sem hefur verið gerð aftur', result.stale, true);
  section('engin skrá núna (búðu hana til, keyrðu svo --record)', result.noFile, true);
  section('ekkert nýtt síðan ákveðið var', result.already);
  if (result.unknown.length > 0) {
    lines.push(`  ekki á spjöldunum: ${result.unknown.map((e) => quoted(e.text)).join(', ')}`);
  }
  return `${lines.join('\n')}\n`;
}
