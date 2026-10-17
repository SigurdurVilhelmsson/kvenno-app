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
export const reviewerKey = (name) => name.trim().toLocaleLowerCase('is');

/**
 * What each reviewer says, once. Per recording, a reviewer's latest entry counts, by when it was
 * given: a verdict, or `withdrawn` for one taken back. Per item, the note in their latest file that
 * has one counts. An entry in an earlier file stands unless a later one replaces it: clearing the
 * review on the page withdraws nothing already sent. Returns
 * `[{ reviewer, key, dates, notes: Map(key → note), clips: Map(text → entry) }]`.
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
      out.set(key, { reviewer: r.reviewer, key, dates: [], notes: new Map(), clips: new Map() });
    }
    const who = out.get(key);
    if (r.date && !who.dates.includes(r.date)) who.dates.push(r.date);
    for (const n of r.notes) who.notes.set(n.key, n);
    for (const c of r.clips) {
      const before = who.clips.get(c.text);
      if (!before || before.at <= c.at) who.clips.set(c.text, c);
    }
  }
  return [...out.values()];
}

/** The value the verdicts on a recording give it: right only is `true`, wrong only `rangt`. */
function valueFrom(verdicts) {
  const right = verdicts.some((v) => v.verdict === 'right');
  const wrong = verdicts.some((v) => v.verdict === 'wrong');
  return right && !wrong ? true : wrong && !right ? 'rangt' : false;
}

/**
 * What the reviews make of the recordings. `manifest` is `hljod.yaml` (`readHljod`), `texts` the
 * texts on the cards (`textsToVoice`), `version(text)` the clip's current audio (`clipVersion`,
 * null with no file), and `rulers` the reviewers whose verdicts are rulings (`--urskurdur`).
 *
 * Every recording the files say anything about gets the value its verdicts give it, from all the
 * files together, whatever order they came in: heard as right and never as wrong is `true`, as
 * wrong and never as right `rangt`, and anything else `false`, whatever it was before. Only
 * verdicts on the audio as it is now count; one on audio since replaced, or a verdict taken back,
 * leaves the recording to be heard again (`false`). A ruler's verdict decides the recording
 * whatever the others say, and every verdict it overrules is listed. A recording the files do not
 * mention keeps its value.
 *
 * Returns `{ outcomes, unknown }`. Each outcome is `{ text, from, to, verdicts, ruling, overruled,
 * stale, noFile }`: `from` the value now, `to` the value the verdicts give, `verdicts` the current
 * ones `[{ reviewer, verdict, at, note? }]`, `ruling` the ruler's verdict if any, `overruled` the
 * verdicts against it, `stale` the reviewers who heard older audio, `noFile` true when the clip has
 * no file just now. `unknown` lists texts no longer on the cards, or never recorded.
 */
export function approvals(reviews, manifest, { texts, version, rulers = [] }) {
  const onCards = (text) => texts.has(text) && manifest.clips.has(text);
  const ruling = new Set(rulers.map(reviewerKey));
  const said = new Map();
  const unknown = new Set();
  for (const who of byReviewer(reviews)) {
    for (const c of who.clips.values()) {
      if (!onCards(c.text)) {
        unknown.add(c.text);
        continue;
      }
      if (!said.has(c.text)) said.set(c.text, []);
      said.get(c.text).push({ who, c });
    }
  }
  const outcomes = [];
  for (const [text, entries] of said) {
    const current = version(text);
    const verdicts = [];
    const stale = [];
    let ruled;
    for (const { who, c } of entries) {
      if (c.verdict === WITHDRAWN) continue;
      if (current === null || c.v !== current) {
        stale.push(who.reviewer);
        continue;
      }
      const v = {
        reviewer: who.reviewer,
        verdict: c.verdict,
        at: c.at,
        ...(c.note ? { note: c.note } : {}),
      };
      verdicts.push(v);
      if (ruling.has(who.key)) {
        ruled =
          ruled === undefined ? v : ruled !== null && ruled.verdict === v.verdict ? ruled : null;
      }
    }
    // Two rulers who disagree settle nothing.
    const rulingVerdict = ruled ?? undefined;
    const to = rulingVerdict
      ? rulingVerdict.verdict === 'right'
        ? true
        : 'rangt'
      : ruled === null
        ? false
        : valueFrom(verdicts);
    const overruled = rulingVerdict
      ? verdicts.filter((v) => v.verdict !== rulingVerdict.verdict)
      : [];
    outcomes.push({
      text,
      from: manifest.clips.get(text) ? true : manifest.rejected.has(text) ? 'rangt' : false,
      to,
      verdicts,
      ...(rulingVerdict ? { ruling: rulingVerdict } : {}),
      overruled,
      stale,
      noFile: current === null,
    });
  }
  outcomes.sort((a, b) => a.text.localeCompare(b.text, 'is'));
  return { outcomes, unknown: [...unknown].sort((a, b) => a.localeCompare(b, 'is')) };
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
 * Everything the reviews say, as text for a person: what changes, first any approved recording
 * that stops being approved; every recording heard both ways; every verdict a ruling overrules;
 * then the notes by item.
 */
export function report(reviews, result) {
  const people = byReviewer(reviews);
  const lines = [];
  lines.push(
    `${reviews.length} skrá(r) frá ${people.length}: ${people
      .map((p) => `${p.reviewer}${p.dates.length ? ` (${p.dates.join(', ')})` : ''}`)
      .join(', ')}`
  );
  const changes = result.outcomes.filter((o) => o.from !== o.to);
  const why = (o) =>
    [
      o.verdicts.length ? said(o.verdicts) : '',
      o.ruling ? `úrskurður ${o.ruling.reviewer}` : '',
      o.stale.length ? `eldri upptaka hjá ${o.stale.join(', ')}` : '',
      o.noFile ? 'engin skrá' : '',
      !o.verdicts.length && !o.stale.length && !o.noFile ? 'dregið til baka' : '',
    ]
      .filter(Boolean)
      .join('; ');
  const revoked = changes.filter((o) => o.from === true);
  if (revoked.length > 0) {
    lines.push(
      '',
      `SAMÞYKKTAR SEM HÆTTA AÐ VERA ÞAÐ: ${revoked.length}. Nemendur heyra þær þar til --apply hefur verið keyrt og vefurinn byggður og settur upp.`
    );
    for (const o of revoked) lines.push(`  ${quoted(o.text)}: true → ${shown(o.to)} — ${why(o)}`);
  }
  lines.push('', `Breytingar sem --apply gerir: ${changes.length}`);
  for (const o of changes.filter((c) => c.from !== true)) {
    lines.push(`  ${quoted(o.text)}: ${shown(o.from)} → ${shown(o.to)} — ${why(o)}`);
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
      `Rétt hjá einum, rangt hjá öðrum (verða false; skerðu úr með --urskurdur): ${both.length}`
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
  if (result.unknown.length > 0) {
    lines.push('', `Ekki á spjöldunum: ${result.unknown.map(quoted).join(', ')}`);
  }
  return `${lines.join('\n')}\n`;
}
