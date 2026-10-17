#!/usr/bin/env node
/**
 * Recordings of the cards' words, frames and examples. See `hljod.mjs` for why, and
 * content/islenskubraut/hljod/README.md for the workflow.
 *
 *   pnpm islenskubraut:hljod            # check hljod.yaml against the cards and the files
 *   pnpm islenskubraut:hljod --jobs     # write hljod-verk.json: what the voice still has to say,
 *                                       # and what the recogniser has not heard
 *   pnpm islenskubraut:hljod --record   # list every new clip in hljod.yaml, not approved, and
 *                                       # bring stada.json up to date (see syncState)
 *
 * Every run writes `islenskubraut-hljod-yfirlit.html` (gitignored), the page a person listens
 * from. Exits 1 when an approved clip has no file or stada.json is out of date, and 2 when a text
 * on the cards has no clip yet, which is not an error for the build: that text simply has no play
 * button.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseDocument } from 'yaml';

import {
  clipName,
  clipVersion,
  compare,
  placeLabel,
  readHljod,
  readState,
  spoken,
  stateProblems,
  syncState,
  textsToVoice,
} from './hljod.mjs';
import { CONTENT_DIR, loadCategories } from './load.mjs';

const ROOT = resolve(CONTENT_DIR, '../..');
const MANIFEST = resolve(CONTENT_DIR, 'hljod/hljod.yaml');
const CLIP_DIR = resolve(ROOT, 'apps/islenskubraut/public/hljod');
const JOBS_FILE = resolve(ROOT, 'hljod-verk.json');
// Written by hljod/hlustun.py, when it has been run: what a speech recogniser heard in each clip.
const HEARD_FILE = resolve(CONTENT_DIR, 'hljod/hlustun.json');
const SHEET_FILE = resolve(ROOT, 'islenskubraut-hljod-yfirlit.html');
// The tools' record of each clip's audio and decision; written here and by `--apply`, not by hand.
const STATE_FILE = resolve(CONTENT_DIR, 'hljod/stada.json');

const hasFile = (name) => existsSync(resolve(CLIP_DIR, name));
const versions = new Map();
const version = (text) => {
  if (!versions.has(text)) {
    const file = resolve(CLIP_DIR, clipName(text));
    versions.set(text, existsSync(file) ? clipVersion(readFileSync(file)) : null);
  }
  return versions.get(text);
};
let state = existsSync(STATE_FILE) ? readState(JSON.parse(readFileSync(STATE_FILE, 'utf8'))) : {};
const texts = textsToVoice(loadCategories());
// The YAML is edited by hand, so it is rewritten as a document: comments and layout survive.
const doc = parseDocument(readFileSync(MANIFEST, 'utf8'));
let manifest = readHljod(doc.toJS());

if (process.argv.includes('--record')) {
  let added = 0;
  for (const text of texts.keys()) {
    if (manifest.clips.has(text) || !hasFile(clipName(text))) continue;
    doc.setIn(['clips', text], false);
    added += 1;
  }
  manifest = readHljod(doc.toJS());
  // A clip made again is a recording nobody has heard: its approval or rangt goes back to false.
  const synced = syncState(manifest, state, version, new Date().toISOString());
  for (const text of synced.reset) doc.setIn(['clips', text], false);
  if (added > 0 || synced.reset.length > 0) {
    // One clip per line, however the list started (`clips: {}` is written on one line).
    const clips = doc.get('clips', true);
    if (clips) clips.flow = false;
    writeFileSync(MANIFEST, doc.toString());
  }
  state = synced.state;
  writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
  manifest = readHljod(doc.toJS());
  console.log(`listed ${added} new clip(s) in hljod.yaml, not approved`);
  if (synced.reset.length > 0) {
    console.log(`${synced.reset.length} clip(s) made again, set back to false:`);
    for (const t of synced.reset) console.log(`  ${t}`);
  }
  console.log(`stada.json: ${synced.stamped.length} value(s) recorded`);
}

const { missing, stale, noFile } = compare(texts, manifest, hasFile);

const escape = (s) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const heard = existsSync(HEARD_FILE) ? JSON.parse(readFileSync(HEARD_FILE, 'utf8')) : {};
// What the recogniser heard in the clip as it is now; a reading of other audio is no guide.
const reading = (text) => (heard[text]?.v === version(text) ? heard[text] : undefined);

if (process.argv.includes('--jobs')) {
  // Every text with no file yet, whether or not it is listed: the voice says `say`
  // (`talgerving.py` makes only the files that are missing). And every clip the recogniser has not
  // heard as it is now, a recording made again by a person included, for `hlustun.py`.
  const jobs = [...texts.keys()]
    .filter((t) => !hasFile(clipName(t)) || !reading(t))
    .map((text) => ({ text, say: spoken(text), file: clipName(text) }));
  writeFileSync(JOBS_FILE, `${JSON.stringify(jobs, null, 2)}\n`);
  const toMake = jobs.filter((j) => !hasFile(j.file)).length;
  console.log(
    `wrote ${jobs.length} job(s) to ${JOBS_FILE.replace(`${ROOT}/`, '')}: ${toMake} to make, ${jobs.length - toMake} to hear`
  );
}
// The doubtful first: the clips a speech recogniser heard least like their text.
const ordered = [...texts.entries()].sort(
  ([a], [b]) => (reading(b)?.score ?? 0) - (reading(a)?.score ?? 0)
);
const rows = ordered.map(([text, places]) => {
  const file = clipName(text);
  const state = !manifest.clips.has(text)
    ? 'vantar'
    : manifest.clips.get(text)
      ? 'samþykkt'
      : manifest.rejected.has(text)
        ? 'rangt'
        : 'drög';
  const audio = hasFile(file)
    ? `<audio controls preload="none" src="apps/islenskubraut/public/hljod/${file}"></audio>`
    : '—';
  const h = reading(text);
  const check = h ? `${escape(h.heard)} (${Math.round(h.score * 100)} %)` : '';
  return `<tr><td>${escape(text)}</td><td>${audio}</td><td>${check}</td><td>${state}</td><td>${escape(
    placeLabel(places[0])
  )}${places.length > 1 ? ` (+${places.length - 1})` : ''}</td></tr>`;
});
writeFileSync(
  SHEET_FILE,
  `<!doctype html><meta charset="utf-8"><title>Hljóð — yfirlit</title>
<style>body{font:14px system-ui;margin:2em}td{padding:4px 8px;border-bottom:1px solid #ddd}</style>
<h1>Hljóð á spjöldunum</h1>
<p>Hlustaðu á hverja upptöku. Ef hún er rétt, skrifaðu <code>true</code> við textann í
<code>content/islenskubraut/hljod/hljod.yaml</code>, og <code>rangt</code> ef hún er röng.</p>
<p>„Talgreinir heyrði“ er það sem talgreinir skrifaði upp úr upptökunni og hve mikið það víkur frá
textanum. Upptökurnar sem víkja mest eru efstar. Þær eru ekki endilega rangar, en hlustaðu fyrst á
þær.</p>
<table><tr><th>Texti</th><th>Upptaka</th><th>Talgreinir heyrði</th><th>Staða</th><th>Hvar</th></tr>
${rows.join('\n')}
</table>\n`
);

const approved = [...manifest.clips.values()].filter(Boolean).length;
console.log(
  `${texts.size} texts on the cards: ${texts.size - missing.length} with a clip listed, ${approved} approved, ${missing.length} without a clip`
);
console.log(`review page: ${SHEET_FILE.replace(`${ROOT}/`, '')}`);
if (stale.length > 0) {
  console.log(
    `\n${stale.length} clip(s) for text no longer on the cards (remove from hljod.yaml):`
  );
  for (const t of stale) console.log(`  ${t}`);
}
if (manifest.rejected.size > 0) {
  console.log(
    `\n${manifest.rejected.size} clip(s) heard as wrong (rangt): make each again (delete the file, then --jobs and talgerving.py), then --record:`
  );
  for (const t of manifest.rejected) console.log(`  ${t} (${clipName(t)})`);
}
const problems = stateProblems(manifest, state, version);
if (problems.length > 0) {
  console.error(`\nstada.json is out of date; run pnpm islenskubraut:hljod --record:`);
  for (const p of problems) console.error(`  ${p}`);
}
const brokenApproved = noFile.filter((t) => manifest.clips.get(t));
if (brokenApproved.length > 0) {
  console.error(`\n${brokenApproved.length} approved clip(s) with no file:`);
  for (const t of brokenApproved) console.error(`  ${t} (${clipName(t)})`);
}
if (brokenApproved.length > 0 || problems.length > 0) process.exit(1);
if (missing.length > 0) process.exit(2);
