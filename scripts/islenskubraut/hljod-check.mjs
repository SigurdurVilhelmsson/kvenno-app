#!/usr/bin/env node
/**
 * Recordings of the cards' words, frames and examples. See `hljod.mjs` for why, and
 * content/islenskubraut/hljod/README.md for the workflow.
 *
 *   pnpm islenskubraut:hljod            # check hljod.yaml against the cards and the files
 *   pnpm islenskubraut:hljod --jobs     # write hljod-verk.json: what the voice still has to say
 *   pnpm islenskubraut:hljod --record   # list every new clip in hljod.yaml, not approved
 *
 * Every run writes `islenskubraut-hljod-yfirlit.html` (gitignored), the page a person listens
 * from. Exits 1 when an approved clip has no file, and 2 when a text on the cards has no clip
 * yet, which is not an error for the build: that text simply has no play button.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseDocument } from 'yaml';

import { clipName, compare, placeLabel, readHljod, spoken, textsToVoice } from './hljod.mjs';
import { CONTENT_DIR, loadCategories } from './load.mjs';

const ROOT = resolve(CONTENT_DIR, '../..');
const MANIFEST = resolve(CONTENT_DIR, 'hljod/hljod.yaml');
const CLIP_DIR = resolve(ROOT, 'apps/islenskubraut/public/hljod');
const JOBS_FILE = resolve(ROOT, 'hljod-verk.json');
// Written by hljod/hlustun.py, when it has been run: what a speech recogniser heard in each clip.
const HEARD_FILE = resolve(CONTENT_DIR, 'hljod/hlustun.json');
const SHEET_FILE = resolve(ROOT, 'islenskubraut-hljod-yfirlit.html');

const hasFile = (name) => existsSync(resolve(CLIP_DIR, name));
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
  if (added > 0) {
    // One clip per line, however the list started (`clips: {}` is written on one line).
    const clips = doc.get('clips', true);
    if (clips) clips.flow = false;
    writeFileSync(MANIFEST, doc.toString());
  }
  manifest = readHljod(doc.toJS());
  console.log(`listed ${added} new clip(s) in hljod.yaml, not approved`);
}

const { missing, stale, noFile } = compare(texts, manifest, hasFile);

if (process.argv.includes('--jobs')) {
  // Every text with no file yet, whether or not it is listed: the voice says `say`.
  const jobs = [...texts.keys()]
    .filter((t) => !hasFile(clipName(t)))
    .map((text) => ({ text, say: spoken(text), file: clipName(text) }));
  writeFileSync(JOBS_FILE, `${JSON.stringify(jobs, null, 2)}\n`);
  console.log(`wrote ${jobs.length} job(s) to ${JOBS_FILE.replace(`${ROOT}/`, '')}`);
}

const escape = (s) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const heard = existsSync(HEARD_FILE) ? JSON.parse(readFileSync(HEARD_FILE, 'utf8')) : {};
// The doubtful first: the clips a speech recogniser heard least like their text.
const ordered = [...texts.entries()].sort(
  ([a], [b]) => (heard[b]?.score ?? 0) - (heard[a]?.score ?? 0)
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
  const h = heard[text];
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
    `\n${manifest.rejected.size} clip(s) heard as wrong (rangt): make each again, then write false:`
  );
  for (const t of manifest.rejected) console.log(`  ${t} (${clipName(t)})`);
}
const brokenApproved = noFile.filter((t) => manifest.clips.get(t));
if (brokenApproved.length > 0) {
  console.error(`\n${brokenApproved.length} approved clip(s) with no file:`);
  for (const t of brokenApproved) console.error(`  ${t} (${clipName(t)})`);
  process.exit(1);
}
if (missing.length > 0) process.exit(2);
