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
 * and the notes their latest file carries.
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
    // Each file holds every note its browser keeps, so the latest file's are the notes.
    person.notes = new Map(r.notes.map((n) => [n.key, n]));
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
      const ruling = matching.filter((p) => next.has(p.who)).length;
      errors.push(
        `--urskurdur "${name}": the files of ${matching.length} browsers carry that name${
          ruling > 0 ? ` (${ruling} of them already ${ruling === 1 ? 'rules' : 'rule'})` : ''
        }; a ruling must be one person. Pass only the files of the browser that should rule.`
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

const CLASH = Symbol('clash');

/**
 * One map merged three ways, key by key, as git merges lines: a key only one side changed since
 * the base takes that side, and one both changed alike takes it. One both changed differently is
 * a clash, left out of `merged` and listed. `same` compares two values; `undefined` is absent.
 */
export function mergeThreeWay(base, ours, theirs, same = (a, b) => a === b) {
  const merged = new Map();
  const clashes = [];
  for (const k of new Set([...base.keys(), ...ours.keys(), ...theirs.keys()])) {
    const b = base.get(k);
    const o = ours.get(k);
    const t = theirs.get(k);
    const value = same(o, t) ? o : same(o, b) ? t : same(t, b) ? o : CLASH;
    if (value === CLASH) clashes.push(k);
    else if (value !== undefined) merged.set(k, value);
  }
  return { merged, clashes: clashes.sort() };
}

/**
 * Two records as one, for a git merge that left a conflict in `mat.json`. The verdicts are every
 * entry from either side, the later where both hold one for the same recording, reviewer and
 * audio: a record only grows. The rulers are merged against the record both sides started from
 * (`base`), so a ruler one side removed stays removed and one either side added is kept.
 */
export function unionLedgers(a, b, base = { rulers: [], verdicts: {} }) {
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
    rulers: [...new Set([...a.rulers, ...b.rulers])]
      .filter((r) => (a.rulers.includes(r) && b.rulers.includes(r)) || !base.rulers.includes(r))
      .sort(),
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
 * A recording `hljod.yaml` approves with no approval in the record of its audio as it is now goes
 * back to `false` (`unbacked`): an approval carried in by a git merge, or across a remake, or
 * written by hand, is not one anybody gave to what students would hear.
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
 * `extra` is what the command does beside the verdicts: `reset`, `[{ text, from }]`, the
 * recordings set back to `false` because their audio changed or nothing recorded which audio was
 * approved; `stamped`, values written in hljod.yaml by hand that stada.json now records; and
 * `clashes`, recordings both sides of a git merge changed differently, set to `false`.
 */
export function report(people, result, rulers = [], extra = {}) {
  const { reset = [], stamped = [], clashes = [] } = extra;
  const lines = [];
  lines.push(
    people.length === 0
      ? 'Engar skrár: aðeins það sem mat.json geymir.'
      : `${people.length} yfirferð(ir) í skránum: ${people
          .map((p) => `${p.reviewer}${p.dates.length ? ` (${p.dates.join(', ')})` : ''}`)
          .join(', ')}`
  );
  const why = (o) =>
    o.unbacked
      ? 'ekkert samþykki í mat.json á upptökunni eins og hún er'
      : o.clash
        ? 'breytt á báða vegu í samruna í git'
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
    ...reset
      .filter((r) => r.from !== false)
      .map((r) => ({ ...r, to: false, ...(r.clash ? { clash: true } : { remade: true }) })),
  ].sort((a, b) => a.text.localeCompare(b.text, 'is'));
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
      `Úrskurða (í mat.json): ${rulers.map((r) => (named.has(r) ? `${named.get(r)} (${r})` : r)).join(', ')}`
    );
  }
  return `${lines.join('\n')}\n`;
}
