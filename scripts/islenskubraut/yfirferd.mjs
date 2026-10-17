/**
 * Teachers' reviews, as the review page sends them (`/islenskubraut/yfirferd`, "Sækja skrá"): a
 * note per item and a verdict per recording. This module reads a file, merges its verdicts into
 * the committed record of every verdict given (`mat.json`), and works out from that record what
 * `yfirferd-check.mjs --apply` writes to `hljod.yaml`.
 *
 * The record, not the files, is what the values come from, so a file can be deleted once it has
 * been applied, and every machine works from the same verdicts. It names no one: each reviewer is
 * a hash of the id their browser stamps into every file it sends.
 *
 * Pure: the command does the reading and writing.
 */
import { createHash } from 'node:crypto';

import { valueOf } from './hljod.mjs';

export const FORMAT = 'islenskubraut-yfirferd/1';

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
 * spaces at the ends. Files are told apart by their browser's id (`reviewerOf`), never by name.
 */
export const reviewerKey = (name) => name.trim().toLocaleLowerCase('is');

/**
 * Who a file is from, as the record keeps it: a hash of the sending browser's random id, which
 * cannot be traced back to a name. Two teachers who type the same name are still two; a teacher
 * on two browsers is two reviewers, whose verdicts are weighed side by side.
 */
export function reviewerOf(review) {
  return createHash('sha256').update(`id:${review.id}`, 'utf8').digest('hex').slice(0, 12);
}

/**
 * `mat.json`, checked. Returns `{ rulers: [who], verdicts: { text: { who: { v: entry } } } }`:
 * per recording, per reviewer and per version of its audio, the latest entry
 * (`{ verdict, at, note? }`). A verdict on one recording of a text is kept beside one on another,
 * so audio that comes back (a revert, a remake that comes out the same) finds its verdicts again.
 */
export function readLedger(raw) {
  if (raw === undefined) return { rulers: [], verdicts: {} };
  assert(raw && typeof raw === 'object', 'mat.json must be a map');
  const rulers = raw.rulers ?? [];
  const verdicts = raw.verdicts ?? {};
  assert(Array.isArray(rulers) && rulers.every((r) => typeof r === 'string'), 'mat.json: rulers');
  for (const [text, byWho] of Object.entries(verdicts)) {
    for (const [who, byV] of Object.entries(byWho)) {
      assert(byV && typeof byV === 'object', `mat.json: "${text}" from ${who} must be a map`);
      for (const [v, e] of Object.entries(byV)) {
        assert(
          e &&
            ['right', 'wrong', WITHDRAWN].includes(e.verdict) &&
            typeof e.at === 'string' &&
            (e.note === undefined || typeof e.note === 'string'),
          `mat.json: "${text}" from ${who} on ${v} needs verdict and at`
        );
      }
    }
  }
  return { rulers, verdicts };
}

const sortedBy = (entries) =>
  Object.fromEntries(entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));

/**
 * Merge files into the record. Per recording, reviewer and audio, the entry given latest counts,
 * by the time it was given: a verdict, or `withdrawn` for one taken back. A mark merely missing
 * from a later file stands; clearing the review on the page withdraws nothing already sent.
 * `rulers` are names whose verdicts rule (`--urskurdur`): each must be among the names one
 * browser's files carry, and no other's, and is kept in the record, so a ruling lasts. Returns
 * `{ ledger, names, people, errors }`: `names` maps each reviewer hash in the files to the name
 * on their latest file, `people` lists each reviewer once with that name, the dates of their files
 * and their latest note per item.
 */
export function mergeReviews(ledger, reviews, rulers = []) {
  const verdicts = {};
  for (const [t, byWho] of Object.entries(ledger.verdicts)) {
    verdicts[t] = {};
    for (const [who, byV] of Object.entries(byWho)) verdicts[t][who] = { ...byV };
  }
  const names = new Map();
  const people = new Map();
  const ordered = reviews
    .map((r, i) => ({ r, i }))
    .sort((a, b) => a.r.saved.localeCompare(b.r.saved) || a.i - b.i)
    .map(({ r }) => r);
  for (const r of ordered) {
    const who = reviewerOf(r);
    names.set(who, r.reviewer);
    if (!people.has(who)) {
      people.set(who, { who, reviewer: r.reviewer, keys: new Set(), dates: [], notes: new Map() });
    }
    const person = people.get(who);
    person.reviewer = r.reviewer;
    person.keys.add(reviewerKey(r.reviewer));
    if (r.date && !person.dates.includes(r.date)) person.dates.push(r.date);
    for (const n of r.notes) person.notes.set(n.key, n);
    for (const c of r.clips) {
      if (!c.v) continue;
      const byV = ((verdicts[c.text] ??= {})[who] ??= {});
      const before = byV[c.v];
      if (!before || before.at <= c.at) {
        byV[c.v] = { verdict: c.verdict, at: c.at, ...(c.note ? { note: c.note } : {}) };
      }
    }
  }
  const errors = [];
  const next = new Set(ledger.rulers);
  for (const name of rulers) {
    const matching = [...people.values()].filter((p) => p.keys.has(reviewerKey(name)));
    if (matching.length === 0)
      errors.push(`--urskurdur "${name}": no file from a reviewer of that name`);
    else if (matching.length > 1) {
      errors.push(
        `--urskurdur "${name}": ${matching.length} reviewers go by that name; a ruling must be one person`
      );
    } else next.add(matching[0].who);
  }
  const out = {
    rulers: [...next].sort(),
    verdicts: sortedBy(
      Object.entries(verdicts).map(([t, byWho]) => [
        t,
        sortedBy(Object.entries(byWho).map(([who, byV]) => [who, sortedBy(Object.entries(byV))])),
      ])
    ),
  };
  return { ledger: out, names, people: [...people.values()], errors };
}

/**
 * Two records as one, for a git merge in which both sides added verdicts: every entry from
 * either, the later where both hold one for the same recording, reviewer and audio, and every
 * ruler of either. It is what applying both sides' files on one machine would have made.
 */
export function unionLedgers(a, b) {
  const verdicts = {};
  for (const ledger of [a, b]) {
    for (const [t, byWho] of Object.entries(ledger.verdicts)) {
      for (const [who, byV] of Object.entries(byWho)) {
        for (const [v, e] of Object.entries(byV)) {
          const into = ((verdicts[t] ??= {})[who] ??= {});
          if (!into[v] || into[v].at < e.at) into[v] = e;
        }
      }
    }
  }
  return {
    rulers: [...new Set([...a.rulers, ...b.rulers])].sort(),
    verdicts: sortedBy(
      Object.entries(verdicts).map(([t, byWho]) => [
        t,
        sortedBy(Object.entries(byWho).map(([who, byV]) => [who, sortedBy(Object.entries(byV))])),
      ])
    ),
  };
}

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
 * taken back is `false`: nobody vouches for it. A recording with verdicts only on other audio
 * keeps its value, which `syncState` already set back to `false` when the audio changed.
 *
 * A ruler's verdict decides a recording whatever the others say, and every verdict it overrules
 * is listed. Of several rulers' verdicts the latest decides, so a ruler who changes their mind,
 * from another browser too, can rule again; two given at the same moment that disagree settle
 * nothing.
 *
 * `late` lists verdicts on other audio given after a verdict on the current audio: given, most
 * likely, from a page left open since before the recording was made again, so to the old audio
 * as the page knew it but perhaps to the new as it played. They do not count, and are shown.
 *
 * Returns `{ outcomes, unknown }`. Each outcome is `{ text, from, to, verdicts, ruling,
 * overruled, late }`, the verdicts `[{ who, reviewer, verdict, at, note? }]`. `unknown` lists
 * texts in the record no longer on the cards.
 */
export function approvals(ledger, manifest, { texts, version, names = new Map() }) {
  const rulers = new Set(ledger.rulers);
  const outcomes = [];
  const unknown = [];
  const label = (who) => names.get(who) ?? `kennari ${who.slice(0, 6)}`;
  for (const [text, byWho] of Object.entries(ledger.verdicts)) {
    if (!texts.has(text) || !manifest.clips.has(text)) {
      unknown.push(text);
      continue;
    }
    const current = version(text);
    if (current === null) continue;
    const onCurrent = Object.entries(byWho).flatMap(([who, byV]) =>
      byV[current] ? [{ who, ...byV[current] }] : []
    );
    if (onCurrent.length === 0) continue;
    const verdicts = onCurrent
      .filter((e) => e.verdict !== WITHDRAWN)
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
    const tied =
      ruling.length > 1 && ruling[1].at === ruling[0].at && ruling[1].verdict !== ruling[0].verdict;
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
      late,
    });
  }
  outcomes.sort((a, b) => a.text.localeCompare(b.text, 'is'));
  return { outcomes, unknown: unknown.sort((a, b) => a.localeCompare(b, 'is')) };
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
 * ruling overrules, every verdict that came late on older audio, every recording heard as wrong
 * with what was said about it, the notes by item from the files given, and who rules.
 */
export function report(people, result, rulers = []) {
  const lines = [];
  lines.push(
    people.length === 0
      ? 'Engar skrár: aðeins það sem mat.json geymir.'
      : `${people.length} yfirferð(ir) í skránum: ${people
          .map((p) => `${p.reviewer}${p.dates.length ? ` (${p.dates.join(', ')})` : ''}`)
          .join(', ')}`
  );
  const changes = result.outcomes.filter((o) => o.from !== o.to);
  const why = (o) =>
    [
      o.verdicts.length ? said(o.verdicts) : 'dregið til baka',
      o.ruling ? `úrskurður ${o.ruling.reviewer}` : '',
    ]
      .filter(Boolean)
      .join('; ');
  const revoked = changes.filter((o) => o.from === true);
  if (revoked.length > 0) {
    lines.push(
      '',
      `SAMÞYKKTAR SEM HÆTTA AÐ VERA ÞAÐ: ${revoked.length}. Nemendur heyra þær þar til --apply hefur verið keyrt og vefurinn byggður og settur upp.`
    );
    for (const o of revoked) lines.push(`  ${quoted(o.text)}`);
  }
  lines.push('', `Breytingar sem --apply gerir: ${changes.length}`);
  for (const o of changes)
    lines.push(`  ${quoted(o.text)}: ${shown(o.from)} → ${shown(o.to)} — ${why(o)}`);
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
      `Metnar á eldri upptöku eftir að sú nýja var komin, líklega á síðu sem var opin frá því fyrir uppfærslu; ekki taldar, hlustaðu sjálf/ur: ${late.length}`
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
  if (result.unknown.length > 0) {
    lines.push('', `Í skránni en ekki á spjöldunum: ${result.unknown.map(quoted).join(', ')}`);
  }
  if (rulers.length > 0) {
    const named = new Map(people.map((p) => [p.who, p.reviewer]));
    lines.push(
      '',
      `Úrskurða (í mat.json): ${rulers.map((r) => (named.has(r) ? `${named.get(r)} (${r})` : r)).join(', ')}`
    );
  }
  return `${lines.join('\n')}\n`;
}
