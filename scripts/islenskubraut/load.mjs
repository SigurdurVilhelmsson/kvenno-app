import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from 'yaml';

import { findInvisible, isFlattened } from './text.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const CONTENT_DIR = resolve(ROOT, 'content/islenskubraut');
export const LEVELS = ['A1', 'A2', 'B1'];

/** Category order as the SPA presents it. Not alphabetical — this is the taught order. */
export const CATEGORY_ORDER = ['dyr', 'matur', 'farartaeki', 'manneskja', 'stadir', 'klaednadur'];

function assert(condition, message) {
  if (!condition) throw new Error(`islenskubraut content: ${message}`);
}

function checkString(value, where) {
  assert(typeof value === 'string' && value.length > 0, `${where} must be a non-empty string`);
  const invisible = findInvisible(value);
  assert(invisible.length === 0, `${where} contains ${invisible.join(', ')} — "${value}"`);
  assert(!isFlattened(value), `${where} looks ASCII-flattened — "${value}"`);
}

/** Parse and validate one category file into the Category shape. */
export function loadCategory(id, contentDir = CONTENT_DIR) {
  const doc = parse(readFileSync(resolve(contentDir, `${id}.yaml`), 'utf8'));
  assert(doc.id === id, `${id}.yaml declares id "${doc.id}"`);
  for (const field of ['name', 'description', 'color', 'icon'])
    checkString(doc[field], `${id}.${field}`);

  const subCategories = (doc.subCategories ?? []).map((s) => {
    checkString(s.name, `${id}.${s.id}.name`);
    assert(Array.isArray(s.options) && s.options.length > 0, `${id}.${s.id}.options is empty`);
    s.options.forEach((o, i) => checkString(o, `${id}.${s.id}.options[${i}]`));
    return { name: s.name, options: s.options };
  });

  const sentenceFrames = (doc.sentenceFrames ?? []).map((f) => {
    assert(LEVELS.includes(f.level), `${id}.${f.id} has level "${f.level}"`);
    assert(Array.isArray(f.frames) && f.frames.length > 0, `${id}.${f.id}.frames is empty`);
    f.frames.forEach((x, i) => checkString(x, `${id}.${f.id}.frames[${i}]`));
    return { level: f.level, frames: f.frames };
  });

  const guidingQuestions = (doc.guidingQuestions ?? []).map((q) => {
    checkString(q.question, `${id}.${q.id}.question`);
    checkString(q.icon, `${id}.${q.id}.icon`);
    const answers = LEVELS.filter((l) => q.answers?.[l]).map((level) => {
      const options = q.answers[level];
      assert(Array.isArray(options) && options.length > 0, `${id}.${q.id}.${level} is empty`);
      options.forEach((o, i) => checkString(o, `${id}.${q.id}.${level}[${i}]`));
      return { level, options };
    });
    assert(answers.length > 0, `${id}.${q.id} has no answers at any level`);
    return { question: q.question, icon: q.icon, answers };
  });

  return {
    id: doc.id,
    name: doc.name,
    icon: doc.icon,
    description: doc.description,
    color: doc.color,
    subCategories,
    sentenceFrames,
    guidingQuestions,
  };
}

/** All categories, in taught order. Throws if a file on disk is not in CATEGORY_ORDER. */
export function loadCategories(contentDir = CONTENT_DIR) {
  const onDisk = readdirSync(contentDir)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => f.replace(/\.yaml$/, ''));
  const unknown = onDisk.filter((id) => !CATEGORY_ORDER.includes(id));
  assert(unknown.length === 0, `${unknown.join(', ')} not listed in CATEGORY_ORDER`);
  return CATEGORY_ORDER.map((id) => loadCategory(id, contentDir));
}
