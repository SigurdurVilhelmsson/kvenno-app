/**
 * Teachers' reviews, as the review page sends them (`/islenskubraut/yfirferd`, "Sækja skrá"): a
 * note per item and a verdict per recording. This module reads one, sums several up, and works out
 * what `yfirferd-check.mjs --apply` writes to `hljod.yaml`.
 *
 * Pure: the command does the reading and writing.
 */

export const FORMAT = 'islenskubraut-yfirferd/1';

function assert(condition, message) {
  if (!condition) throw new Error(`yfirferd: ${message}`);
}

/**
 * One review file, checked. Returns `{ reviewer, date, saved, notes, clips }`. A file with no
 * reviewer's name is named by `where`, its file name.
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
      c.verdict === 'right' || c.verdict === 'wrong',
      `${where}: clips[${i}].verdict must be right or wrong`
    );
    return {
      text: c.text,
      verdict: c.verdict,
      ...(typeof c.v === 'string' ? { v: c.v } : {}),
      ...(c.note ? { note: String(c.note) } : {}),
    };
  });
  return { reviewer: reviewer || where, date, saved, notes, clips };
}

/**
 * What each reviewer says, once: a reviewer's later file replaces what an earlier one said about
 * the same note or recording, since the page keeps the review and each file carries all of it.
 * Files are ordered by when they were saved, then as given. Returns
 * `[{ reviewer, dates, notes: Map(key → note), clips: Map(text → verdict) }]`.
 */
export function byReviewer(reviews) {
  const ordered = reviews
    .map((r, i) => ({ r, i }))
    .sort((a, b) => a.r.saved.localeCompare(b.r.saved) || a.i - b.i)
    .map(({ r }) => r);
  const out = new Map();
  for (const r of ordered) {
    if (!out.has(r.reviewer)) {
      out.set(r.reviewer, { reviewer: r.reviewer, dates: [], notes: new Map(), clips: new Map() });
    }
    const who = out.get(r.reviewer);
    if (r.date && !who.dates.includes(r.date)) who.dates.push(r.date);
    for (const n of r.notes) who.notes.set(n.key, n);
    for (const c of r.clips) who.clips.set(c.text, c);
  }
  return [...out.values()];
}

/**
 * What the reviews mean for the recordings, against `hljod.yaml` (`manifest`, from `readHljod`),
 * the texts on the cards (`texts`, from `textsToVoice`) and each clip's current audio
 * (`version(text)`, from `clipVersion`, or null for a clip with no file).
 *
 * - `approve`: someone heard it as right, nobody as wrong, and it is still a draft.
 * - `reject`: someone heard it as wrong, nobody as right, and it is a draft. `--apply` writes
 *   `rangt`, so a later run cannot approve it on another reviewer's word.
 * - `revoke`: approved, and now heard as wrong by someone. It plays for students until `--apply`
 *   writes `rangt`.
 * - `conflicts`: a draft heard both ways, for a person to settle.
 * - `blocked`: marked `rangt` before, now heard as right. Make it again, then write `false`.
 * - `already`: approved and heard as right, or `rangt` and heard as wrong.
 * - `stale`: every verdict was given to a recording since made again; listen again.
 * - `unknown`: no longer on the cards, or never recorded.
 *
 * Each entry is `{ text, verdicts: [{ reviewer, verdict, note? }] }`.
 */
export function approvals(reviews, manifest, { texts, version }) {
  const onCards = (text) => texts.has(text) && manifest.clips.has(text);
  const verdicts = new Map();
  const stale = new Map();
  const unknown = new Map();
  for (const who of byReviewer(reviews)) {
    for (const c of who.clips.values()) {
      const current = onCards(c.text) ? version(c.text) : null;
      const target = !onCards(c.text)
        ? unknown
        : current !== null && c.v === current
          ? verdicts
          : stale;
      if (!target.has(c.text)) target.set(c.text, []);
      target.get(c.text).push({
        reviewer: who.reviewer,
        verdict: c.verdict,
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
    unknown: [],
  };
  for (const [text, vs] of unknown) result.unknown.push({ text, verdicts: vs });
  for (const [text, vs] of stale) {
    if (!verdicts.has(text)) result.stale.push({ text, verdicts: vs });
  }
  for (const [text, vs] of verdicts) {
    const entry = { text, verdicts: vs };
    const right = vs.some((v) => v.verdict === 'right');
    const wrong = vs.some((v) => v.verdict === 'wrong');
    const approved = manifest.clips.get(text);
    const rejected = manifest.rejected.has(text);
    if (approved) result[wrong ? 'revoke' : 'already'].push(entry);
    else if (rejected) result[right ? 'blocked' : 'already'].push(entry);
    else if (right && wrong) result.conflicts.push(entry);
    else result[right ? 'approve' : 'reject'].push(entry);
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
      `SAMÞYKKTAR EN NÚ MERKTAR RANGAR, heyrast nemendum þar til --apply: ${result.revoke.length}`
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
  section('rétt hjá einum, rangt hjá öðrum', result.conflicts, true);
  section(
    'merktar rangt áður en nú réttar (búðu þær til aftur, skrifaðu svo false)',
    result.blocked,
    true
  );
  section('hlustað á eldri upptöku, sem hefur verið búin til aftur', result.stale, true);
  section('þegar samþykktar eða merktar rangt', result.already);
  if (result.unknown.length > 0) {
    lines.push(`  ekki á spjöldunum: ${result.unknown.map((e) => quoted(e.text)).join(', ')}`);
  }
  return `${lines.join('\n')}\n`;
}
