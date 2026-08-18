# Íslenskubraut Content Authoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every student-visible Íslenskubraut string editable by an Icelandic teacher — in YAML in the repo, or in Excel without git — with both TypeScript consumers generated from that one source.

**Architecture:** `content/islenskubraut/*.yaml` becomes canonical. A generator emits the SPA modules and the server module from it, so the two cannot diverge. Export/import scripts move the same content through `.xlsx` for reviewers who do not use git, normalising Unicode on the way back in.

**Tech Stack:** Node ESM (`.mjs`) scripts, `yaml@2`, `exceljs`, Vitest (`globals: true`, jsdom), TypeScript.

**Spec:** `docs/superpowers/specs/2026-08-17-islenskubraut-content-authoring-design.md`

**Status (2026-08-18): all seven tasks complete.** The Excel round-trip is whole — `pnpm
islenskubraut:export` (PR #20) and `pnpm islenskubraut:import` (PR #21) — and
`content/islenskubraut/README.md` is written. Tasks 5, 6 and 7 each shipped with deliberate
deviations from the code listed below; the note under each task says what and why. What remains is
not code: see "Unfinished — required before the first real review cycle" at the end.

## Prerequisite

**PR #16 must be merged first.** This plan modifies `scripts/generate-islenskubraut-data.mjs`, the `generate:islenskubraut-data` package script, the `categoryIds` export in `server/src/lib/islenskubraut-data.ts`, and `apps/islenskubraut/src/data/__tests__/server-copy-in-sync.test.ts` — none of which exist on `main` yet. Branch from `main` after #16 lands.

## Global Constraints

- **All student-visible text is Icelandic.** Script output, CLI messages and code comments may be English. Reviewer-facing text in the spreadsheet is Icelandic.
- **All Icelandic reviewer-facing copy in this plan is placeholder.** Instruction blocks, column headers and the Leiðbeiningar tab must be reviewed by Siggi before the first export goes to a colleague. Do not treat the strings below as final.
- **Never hand-edit a generated file.** `apps/islenskubraut/src/data/categories/*.ts` and `server/src/lib/islenskubraut-data.ts` are output.
- **Commit subjects must be lower-case** (commitlint `subject-case`), including after `fix(scope):`.
- **Do not change what the SPA or the PDF renders.** The `Category` interface in `apps/islenskubraut/src/data/types.ts` is unchanged; only how the data reaches it changes.
- **`pnpm` may not be on PATH.** Use `/home/siggi/.nvm/versions/node/v24.13.0/bin/pnpm`.
- Vitest config: `globals: true`, `environment: 'jsdom'`, `include: ['**/*.test.ts', …]`, `exclude: [… 'server/**']`. Tests placed under `scripts/` are picked up.

## Correction to the spec

The spec says the migration is proven by generating TypeScript back from YAML and asserting **byte-identity** with the committed files. That is wrong and must not be implemented: the current SPA files are hand-formatted, so byte-identity would require the generator to reproduce hand-formatting rather than to be correct. The honest proof, used below, is **semantic identity** — evaluate the data before migration, snapshot it, and assert deep equality against the data the generated modules export. Amend the spec's Rollout §1 and Validation table to say so.

## File Structure

| File                                    | Responsibility                                                       |
| --------------------------------------- | -------------------------------------------------------------------- |
| `content/islenskubraut/{6}.yaml`        | Canonical content. Hand-edited.                                      |
| `content/islenskubraut/README.md`       | How to edit, for a human.                                            |
| `scripts/islenskubraut/text.mjs`        | Unicode normalisation and the invisible/flattening checks. Pure.     |
| `scripts/islenskubraut/load.mjs`        | Read + parse + validate YAML → in-memory categories.                 |
| `scripts/islenskubraut/render.mjs`      | Categories → TypeScript source strings.                              |
| `scripts/islenskubraut/build.mjs`       | CLI: YAML → both TS modules. `--check`.                              |
| `scripts/islenskubraut/rows.mjs`        | Category ↔ flat spreadsheet rows. Shared by export and import. Pure. |
| `scripts/islenskubraut/review.mjs`      | Reviewed sheet → rows, category → YAML text, diff summary. Pure.     |
| `scripts/islenskubraut/export-xlsx.mjs` | CLI: YAML → `.xlsx`.                                                 |
| `scripts/islenskubraut/import-xlsx.mjs` | CLI: `.xlsx` → YAML.                                                 |
| `scripts/islenskubraut/migrate.mjs`     | One-time TS → YAML. Deleted after Task 3.                            |

`text.mjs` and `rows.mjs` are pure and carry the logic worth testing; the CLIs stay thin.

---

### Task 1: Text normalisation module

**Files:**

- Create: `scripts/islenskubraut/text.mjs`
- Test: `scripts/islenskubraut/__tests__/text.test.ts`
- Modify: `package.json` (devDependencies)

**Interfaces:**

- Produces: `normalizeText(s: string): string`, `findInvisible(s: string): string[]`, `isFlattened(s: string): boolean`, `ICELANDIC_RE: RegExp`.

- [ ] **Step 1: Add the dependencies**

```bash
/home/siggi/.nvm/versions/node/v24.13.0/bin/pnpm add -Dw yaml exceljs
```

Both are `devDependencies` at the workspace root. Neither is imported by app or server source, so neither reaches a bundle.

- [ ] **Step 2: Write the failing test**

Create `scripts/islenskubraut/__tests__/text.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';

import { findInvisible, isFlattened, normalizeText } from '../text.mjs';

describe('normalizeText', () => {
  it('composes decomposed Icelandic to NFC', () => {
    // "á" as a + U+0301 combining acute — what Word and macOS can produce.
    const decomposed = 'áferð';
    expect(decomposed).not.toBe('áferð');
    expect(normalizeText(decomposed)).toBe('áferð');
  });

  it('strips a soft hyphen wedged mid-word', () => {
    expect(normalizeText('Orda­fordi')).toBe('Ordafordi');
  });

  it('replaces a non-breaking space with a normal space', () => {
    expect(normalizeText('til að vinna')).toBe('til að vinna');
  });

  it('collapses runs of whitespace and trims', () => {
    expect(normalizeText('  til   að  vinna ')).toBe('til að vinna');
  });

  it('leaves clean Icelandic untouched', () => {
    expect(normalizeText('húsdýr (búfénaður)')).toBe('húsdýr (búfénaður)');
  });
});

describe('findInvisible', () => {
  it('names the invisible codepoints it found', () => {
    expect(findInvisible('Orda­fordi')).toEqual(['U+00AD']);
    expect(findInvisible('a​b⁠c')).toEqual(['U+200B', 'U+2060']);
  });

  it('returns an empty array for clean text', () => {
    expect(findInvisible('Orðaforði')).toEqual([]);
  });
});

describe('isFlattened', () => {
  it('flags text that lost its Icelandic characters', () => {
    expect(isFlattened('husdyr')).toBe(true);
    expect(isFlattened('Ordafordi')).toBe(true);
    expect(isFlattened('gaeludyr')).toBe(true);
  });

  it('does not flag the correct spelling', () => {
    expect(isFlattened('húsdýr')).toBe(false);
    expect(isFlattened('Orðaforði')).toBe(false);
  });

  it('does not flag ordinary Icelandic-free text', () => {
    expect(isFlattened('A1')).toBe(false);
    expect(isFlattened('#7B2CBF')).toBe(false);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `/home/siggi/.nvm/versions/node/v24.13.0/bin/pnpm vitest run scripts/islenskubraut`
Expected: FAIL — cannot resolve `../text.mjs`.

- [ ] **Step 4: Write the implementation**

Create `scripts/islenskubraut/text.mjs`:

```javascript
/**
 * Text hygiene for Íslenskubraut content.
 *
 * Reviewers paste from Word, email and existing worksheets, which drags in soft
 * hyphens, non-breaking spaces and decomposed accents. That is the exact character
 * class behind the August 2026 corruption, where "Orðaforði" reached students as
 * "Orda<U+00AD>fordi" — invisible in an editor and in the rendered PDF.
 */

/** Characters that render as nothing (or as a space) and must never enter the data. */
const INVISIBLE = /[­​‌‍⁠﻿]/g;

export const ICELANDIC_RE = /[áéíóúýðþæöÁÉÍÓÚÝÐÞÆÖ]/;

/** Stems that only occur in words which must carry an Icelandic character. */
const FLATTENED_RE =
  /\b(husdyr|gaeludyr|ordafordi|dyrid|liffraedilegur|bufenadur|hlyja|rannsoka|afer[dt]|thekkt|stordyr)\b/i;

/**
 * NFC-normalise, drop invisibles, turn non-breaking spaces into ordinary ones,
 * collapse whitespace runs and trim.
 */
export function normalizeText(value) {
  return value
    .normalize('NFC')
    .replace(INVISIBLE, '')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Returns the invisible codepoints present, as U+XXXX strings, in order of appearance. */
export function findInvisible(value) {
  const found = [];
  for (const match of value.matchAll(INVISIBLE)) {
    found.push(`U+${match[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
  }
  return found;
}

/** True when a string looks like Icelandic that has been flattened to ASCII. */
export function isFlattened(value) {
  return FLATTENED_RE.test(value) && !ICELANDIC_RE.test(value);
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `/home/siggi/.nvm/versions/node/v24.13.0/bin/pnpm vitest run scripts/islenskubraut`
Expected: PASS, 11 cases.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml scripts/islenskubraut/text.mjs scripts/islenskubraut/__tests__/text.test.ts
git commit -m "feat(islenskubraut): add text normalisation for imported content

NFC-normalises, strips soft hyphens and zero-width characters, and flags
strings that have lost their Icelandic. Reviewers will paste from Word, and
that is the character class that corrupted the teaching-card data."
```

---

### Task 2: Migrate the TypeScript content to YAML

**Files:**

- Create: `scripts/islenskubraut/migrate.mjs`
- Create: `content/islenskubraut/{dyr,matur,farartaeki,manneskja,stadir,klaednadur}.yaml`
- Test: `scripts/islenskubraut/__tests__/migration-lossless.test.ts`

**Interfaces:**

- Consumes: the existing SPA data at `apps/islenskubraut/src/data/index.ts`.
- Produces: the YAML files, and the node-id convention `s1..sN`, `f1..fN`, `q1..qN` assigned in source order.

**Background.** The SPA data is TypeScript with extensionless imports, so it cannot be loaded by plain Node. Load it through Vite's SSR loader, as `scripts/generate-islenskubraut-data.mjs` already does. This script runs once; Task 3 deletes it.

- [ ] **Step 1: Write the migration script**

Create `scripts/islenskubraut/migrate.mjs`:

```javascript
#!/usr/bin/env node
/**
 * One-time migration: apps/islenskubraut/src/data/ -> content/islenskubraut/*.yaml
 *
 * Mechanical on purpose. Retyping 1,737 strings by hand would itself be a
 * corruption risk, which is the thing this whole change exists to prevent.
 * Deleted once Task 3's generator proves the YAML reproduces the data.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { stringify } from 'yaml';
import { createServer } from 'vite';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'content/islenskubraut');

const HEADER = `# Efni fyrir Íslenskubraut — þessi skrá er UPPRUNINN (source of truth).
#
# Breyttu þessari skrá beint, eða notaðu Excel-yfirferð:
#   pnpm islenskubraut:export          # býr til .xlsx til yfirlestrar
#   pnpm islenskubraut:import <skrá>   # les leiðréttingar til baka
#
# Keyrðu ALLTAF eftir breytingu:
#   pnpm islenskubraut:build
# Hún býr til TypeScript-skrárnar sem vefurinn og PDF-þjónninn nota.
# Ekki breyta þeim skrám handvirkt.
`;

async function loadCategories() {
  const server = await createServer({
    root: ROOT,
    logLevel: 'error',
    server: { middlewareMode: true },
    appType: 'custom',
  });
  try {
    const mod = await server.ssrLoadModule('/apps/islenskubraut/src/data/index.ts');
    return mod.categories;
  } finally {
    await server.close();
  }
}

/** Convert one Category into the human-facing YAML shape. */
function toYamlShape(category) {
  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    description: category.description,
    color: category.color,
    subCategories: category.subCategories.map((s, i) => ({
      id: `s${i + 1}`,
      name: s.name,
      options: s.options,
    })),
    sentenceFrames: category.sentenceFrames.map((f, i) => ({
      id: `f${i + 1}`,
      level: f.level,
      frames: f.frames,
    })),
    guidingQuestions: category.guidingQuestions.map((q, i) => ({
      id: `q${i + 1}`,
      question: q.question,
      icon: q.icon,
      // Level-keyed map: how a human reads it. render.mjs converts back to the
      // { level, options }[] the Category interface requires.
      answers: Object.fromEntries(q.answers.map((a) => [a.level, a.options])),
    })),
  };
}

const categories = await loadCategories();
mkdirSync(OUT, { recursive: true });

for (const category of categories) {
  const body = stringify(toYamlShape(category), { lineWidth: 0, defaultStringType: 'PLAIN' });
  writeFileSync(resolve(OUT, `${category.id}.yaml`), `${HEADER}\n${body}`, 'utf8');
  console.log(`wrote content/islenskubraut/${category.id}.yaml`);
}
```

- [ ] **Step 2: Run it**

Run: `/home/siggi/.nvm/versions/node/v24.13.0/bin/node scripts/islenskubraut/migrate.mjs`
Expected: six `wrote content/islenskubraut/*.yaml` lines.

Then open `content/islenskubraut/manneskja.yaml` and read it. It should be legible Icelandic with no `\u` escapes and no stray quoting. If strings came out quoted with escapes, the `defaultStringType` option is wrong — fix it before continuing, because legibility is the entire point.

- [ ] **Step 3: Write the losslessness test**

Create `scripts/islenskubraut/__tests__/migration-lossless.test.ts`:

```typescript
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';

import { categories as tsCategories } from '../../../apps/islenskubraut/src/data/index';

const CONTENT = resolve(__dirname, '../../../content/islenskubraut');

/** Rebuild the Category shape from the YAML shape, exactly as render.mjs will. */
function fromYamlShape(doc: Record<string, unknown>) {
  const qs = doc.guidingQuestions as {
    question: string;
    icon: string;
    answers: Record<string, string[]>;
  }[];
  const subs = doc.subCategories as { name: string; options: string[] }[];
  const frames = doc.sentenceFrames as { level: string; frames: string[] }[];
  return {
    id: doc.id,
    name: doc.name,
    icon: doc.icon,
    description: doc.description,
    color: doc.color,
    subCategories: subs.map((s) => ({ name: s.name, options: s.options })),
    sentenceFrames: frames.map((f) => ({ level: f.level, frames: f.frames })),
    guidingQuestions: qs.map((q) => ({
      question: q.question,
      icon: q.icon,
      answers: Object.entries(q.answers).map(([level, options]) => ({ level, options })),
    })),
  };
}

describe('migration to YAML', () => {
  it('reproduces every category exactly', () => {
    for (const expected of tsCategories) {
      const raw = readFileSync(resolve(CONTENT, `${expected.id}.yaml`), 'utf8');
      const actual = fromYamlShape(parse(raw));
      expect(actual, `category ${expected.id}`).toEqual(expected);
    }
  });

  it('covers every category, with none invented', () => {
    expect(tsCategories.map((c) => c.id).sort()).toEqual(
      ['dyr', 'farartaeki', 'klaednadur', 'manneskja', 'matur', 'stadir'].sort()
    );
  });
});
```

- [ ] **Step 4: Run it**

Run: `/home/siggi/.nvm/versions/node/v24.13.0/bin/pnpm vitest run scripts/islenskubraut`
Expected: PASS. A failure here means the migration dropped or altered content — fix the script and re-run it; never edit the YAML to make the test pass.

- [ ] **Step 5: Commit**

```bash
git add content/islenskubraut scripts/islenskubraut/migrate.mjs scripts/islenskubraut/__tests__/migration-lossless.test.ts
git commit -m "feat(islenskubraut): migrate content to yaml as the source of truth

Mechanical conversion of all six categories, proven by a test that rebuilds
the Category shape from the YAML and deep-compares it against the shipped
TypeScript. Nothing is deleted yet - the TypeScript is still what builds."
```

---

### Task 3: Generate both TypeScript modules from YAML

**Files:**

- Create: `scripts/islenskubraut/load.mjs`, `scripts/islenskubraut/render.mjs`, `scripts/islenskubraut/build.mjs`
- Delete: `scripts/generate-islenskubraut-data.mjs`, `scripts/islenskubraut/migrate.mjs`
- Modify: `package.json` (scripts), `.github/workflows/ci.yml`
- Modify: `apps/islenskubraut/src/data/__tests__/server-copy-in-sync.test.ts` (header note only)
- Test: `scripts/islenskubraut/__tests__/generated-matches-yaml.test.ts`

**Interfaces:**

- Consumes: `normalizeText` from `./text.mjs`.
- Produces: `loadCategories(): Category[]` from `load.mjs`; `renderSpaCategory(category): string` and `renderServerModule(categories): string` from `render.mjs`.

**Background.** The generator from PR #16 boots Vite to load TypeScript. Reading YAML instead makes it a parse and a render, so Vite is no longer needed.

- [ ] **Step 1: Write the loader**

Create `scripts/islenskubraut/load.mjs`:

```javascript
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
export function loadCategory(id) {
  const doc = parse(readFileSync(resolve(CONTENT_DIR, `${id}.yaml`), 'utf8'));
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
export function loadCategories() {
  const onDisk = readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => f.replace(/\.yaml$/, ''));
  const unknown = onDisk.filter((id) => !CATEGORY_ORDER.includes(id));
  assert(unknown.length === 0, `${unknown.join(', ')} not listed in CATEGORY_ORDER`);
  return CATEGORY_ORDER.map(loadCategory);
}
```

- [ ] **Step 2: Write the renderer**

Create `scripts/islenskubraut/render.mjs`:

```javascript
import { format, resolveConfig } from 'prettier';

const WARNING = `// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     content/islenskubraut/
// Regenerate: pnpm islenskubraut:build
//
// Edit the YAML, not this file. A test fails if this file drifts from it.`;

/** JSON.stringify, not hand-rolled quoting: an escaping bug is what corrupted this data. */
const literal = (value) => JSON.stringify(value, null, 2);

export function renderSpaCategory(category) {
  return `${WARNING}

import { Category } from '../types';

export const ${category.id}: Category = ${literal(category)};
`;
}

export function renderServerModule(categories) {
  return `${WARNING}

import type { Category } from '../types/index.js';

export const categories: Category[] = ${literal(categories)};

export const categoryIds: string[] = categories.map((c) => c.id);

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
`;
}

/**
 * Format with the repo's prettier config.
 *
 * lint-staged runs `prettier --write` on commit, so unformatted output would be
 * rewritten the moment it was staged and `--check` would then report STALE
 * forever against identical content. A permanently red check is worse than none.
 */
export async function prettify(source, filepath) {
  const options = (await resolveConfig(filepath)) ?? {};
  return format(source, { ...options, filepath });
}
```

- [ ] **Step 3: Write the build CLI**

Create `scripts/islenskubraut/build.mjs`:

```javascript
#!/usr/bin/env node
/** YAML -> both TypeScript consumers. `--check` exits 1 if anything is stale. */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadCategories } from './load.mjs';
import { prettify, renderServerModule, renderSpaCategory } from './render.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SPA_DIR = resolve(ROOT, 'apps/islenskubraut/src/data/categories');
const SERVER_FILE = resolve(ROOT, 'server/src/lib/islenskubraut-data.ts');

const check = process.argv.includes('--check');
const categories = loadCategories();

const outputs = [
  ...categories.map((c) => [resolve(SPA_DIR, `${c.id}.ts`), renderSpaCategory(c)]),
  [SERVER_FILE, renderServerModule(categories)],
];

let stale = 0;
for (const [file, source] of outputs) {
  const next = await prettify(source, file);
  let current = null;
  try {
    current = readFileSync(file, 'utf8');
  } catch {
    /* not generated yet */
  }
  if (current === next) continue;
  stale += 1;
  if (check) {
    console.error(`STALE: ${file.replace(`${ROOT}/`, '')}`);
  } else {
    writeFileSync(file, next, 'utf8');
    console.log(`wrote ${file.replace(`${ROOT}/`, '')}`);
  }
}

if (check && stale > 0) {
  console.error(`\n${stale} generated file(s) do not match content/islenskubraut/.`);
  console.error('Run: pnpm islenskubraut:build');
  process.exit(1);
}
if (stale === 0) console.log('islenskubraut: generated files are up to date.');
```

- [ ] **Step 4: Generate**

```bash
cd /home/siggi/dev/repos/kvenno-app
/home/siggi/.nvm/versions/node/v24.13.0/bin/node scripts/islenskubraut/build.mjs
```

Expected: seven `wrote …` lines (six SPA categories plus the server module).

No snapshot is needed here: `migration-lossless.test.ts` from Task 2 is still in place and still
compares the YAML against the committed TypeScript, so it fails if this step changed any value.
That test is the safety net for this step, which is why Task 2 landed first and why the deletion
in Step 8 comes only after Step 6 has passed.

- [ ] **Step 5: Write the equivalence test**

Create `scripts/islenskubraut/__tests__/generated-matches-yaml.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';

import { categories as serverCategories } from '../../../server/src/lib/islenskubraut-data';
import { categories as spaCategories } from '../../../apps/islenskubraut/src/data/index';

describe('generated modules', () => {
  it('agree with each other', () => {
    expect(serverCategories).toEqual(spaCategories);
  });

  it('still ship all six categories in taught order', () => {
    expect(spaCategories.map((c) => c.id)).toEqual([
      'dyr',
      'matur',
      'farartaeki',
      'manneskja',
      'stadir',
      'klaednadur',
    ]);
  });

  it('carry the corrected strings from the August fix', () => {
    const manneskja = spaCategories.find((c) => c.id === 'manneskja');
    expect(manneskja?.guidingQuestions.map((q) => q.question)).toContain(
      'Fyrir hvað er manneskjan þekkt?'
    );
    const dyr = spaCategories.find((c) => c.id === 'dyr');
    expect(dyr?.description).toBe('Orðaforði um dýr — gæludýr, villt dýr og húsdýr');
  });
});
```

- [ ] **Step 6: Run the whole suite**

Run: `/home/siggi/.nvm/versions/node/v24.13.0/bin/pnpm test`
Expected: PASS, including `migration-lossless` and the retargeted `server-copy-in-sync`. Then confirm nothing about the shipped data moved:

```bash
git diff --stat apps/islenskubraut/src/data/categories/
```

The diff should be formatting and the new header only. If any _string value_ changed, stop — the loader or renderer is altering content.

- [ ] **Step 7: Wire the scripts and CI**

In `package.json`, replace the `generate:islenskubraut-data` line with:

```json
    "islenskubraut:build": "node scripts/islenskubraut/build.mjs",
```

In `.github/workflows/ci.yml`, in the `lint-and-typecheck` job, add after the `Install dependencies` step:

```yaml
- name: Check generated Íslenskubraut data
  run: pnpm islenskubraut:build --check
```

- [ ] **Step 8: Delete the superseded scripts**

```bash
git rm scripts/generate-islenskubraut-data.mjs scripts/islenskubraut/migrate.mjs
```

The migration is proven and committed; keeping a second generator invites someone to run the wrong one.

`migration-lossless.test.ts` also goes — but for a subtler reason worth understanding rather than
obeying. It compares the YAML against the TypeScript. Until Step 4 the TypeScript was
independent evidence, so the comparison was meaningful. From Step 4 onward the TypeScript is
_generated from_ the YAML, so the test compares the YAML to itself and would pass no matter how
wrong both were. A tautological test is worse than no test, because it reads like coverage.

```bash
git rm scripts/islenskubraut/__tests__/migration-lossless.test.ts
```

Its real replacement is `generated-matches-yaml.test.ts` from Step 5, which pins specific known
strings rather than comparing derived artifacts to each other.

- [ ] **Step 9: Run the suite once more, then commit**

Run: `/home/siggi/.nvm/versions/node/v24.13.0/bin/pnpm test && /home/siggi/.nvm/versions/node/v24.13.0/bin/pnpm type-check && /home/siggi/.nvm/versions/node/v24.13.0/bin/pnpm lint`
Expected: all three exit 0.

```bash
git add -A
git commit -m "feat(islenskubraut): generate both consumers from the yaml

The SPA modules and the server module are now emitted from
content/islenskubraut/, so they cannot disagree. The Vite-based generator and
the one-time migration script are deleted; CI fails if a generated file is
hand-edited."
```

---

### Task 4: Rows module — the shared spreadsheet mapping

**Files:**

- Create: `scripts/islenskubraut/rows.mjs`
- Test: `scripts/islenskubraut/__tests__/rows.test.ts`

**Interfaces:**

- Produces: `toRows(category): Row[]` and `fromRows(categoryId, rows): Category`, where `Row = { lykill, gerd, stig, samhengi, islenska, athugasemd }`.

**Background.** Export and import both need this mapping, and it is where the add/remove/reorder semantics live. Keeping it pure means those semantics are unit-tested without touching Excel.

- [ ] **Step 1: Write the failing test**

Create `scripts/islenskubraut/__tests__/rows.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';

import { fromRows, toRows } from '../rows.mjs';

const category = {
  id: 'manneskja',
  name: 'Manneskja',
  icon: '🧑',
  description: 'Orðaforði um fólk',
  color: '#7B2CBF',
  subCategories: [{ name: 'Aldur', options: ['barn', 'unglingur'] }],
  sentenceFrames: [{ level: 'A1', frames: ['Þetta er ___.'] }],
  guidingQuestions: [
    {
      question: 'Fyrir hvað er manneskjan þekkt?',
      icon: '🎯',
      answers: [{ level: 'A1', options: ['til að vinna', 'til að læra'] }],
    },
  ],
};

describe('toRows', () => {
  it('emits one row per editable string', () => {
    const rows = toRows(category);
    expect(rows.map((r) => r.islenska)).toEqual([
      'Orðaforði um fólk',
      'Aldur',
      'barn',
      'unglingur',
      'Þetta er ___.',
      'Fyrir hvað er manneskjan þekkt?',
      'til að vinna',
      'til að læra',
    ]);
  });

  it('repeats the group key on every row of a group', () => {
    const answers = toRows(category).filter((r) => r.gerd === 'Svar');
    expect(answers.map((r) => r.lykill)).toEqual(['manneskja.q1.A1', 'manneskja.q1.A1']);
  });

  it('repeats the parent question as context on answer rows', () => {
    const answers = toRows(category).filter((r) => r.gerd === 'Svar');
    expect(answers.every((r) => r.samhengi === 'Fyrir hvað er manneskjan þekkt?')).toBe(true);
  });
});

describe('fromRows', () => {
  it('round-trips a category unchanged', () => {
    expect(fromRows('manneskja', toRows(category))).toEqual(category);
  });

  it('applies an edit to a single keyed string', () => {
    const rows = toRows(category);
    rows.find((r) => r.lykill === 'manneskja.q1')!.islenska = 'Fyrir hvað er hún þekkt?';
    expect(fromRows('manneskja', rows).guidingQuestions[0].question).toBe(
      'Fyrir hvað er hún þekkt?'
    );
  });

  it('appends an option when a row is added to the group', () => {
    const rows = toRows(category);
    const i = rows.findIndex((r) => r.islenska === 'til að læra');
    rows.splice(i + 1, 0, { ...rows[i], islenska: 'til að kenna' });
    expect(fromRows('manneskja', rows).guidingQuestions[0].answers[0].options).toEqual([
      'til að vinna',
      'til að læra',
      'til að kenna',
    ]);
  });

  it('removes an option when its row is deleted', () => {
    const rows = toRows(category).filter((r) => r.islenska !== 'til að vinna');
    expect(fromRows('manneskja', rows).guidingQuestions[0].answers[0].options).toEqual([
      'til að læra',
    ]);
  });

  it('reorders options to match sheet order', () => {
    const rows = toRows(category);
    const a = rows.findIndex((r) => r.islenska === 'til að vinna');
    const [moved] = rows.splice(a, 1);
    rows.push(moved);
    expect(fromRows('manneskja', rows).guidingQuestions[0].answers[0].options).toEqual([
      'til að læra',
      'til að vinna',
    ]);
  });

  it('throws when a group is emptied entirely', () => {
    const rows = toRows(category).filter((r) => r.gerd !== 'Svar');
    expect(() => fromRows('manneskja', rows)).toThrow(/manneskja\.q1/);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `/home/siggi/.nvm/versions/node/v24.13.0/bin/pnpm vitest run scripts/islenskubraut/__tests__/rows.test.ts`
Expected: FAIL — cannot resolve `../rows.mjs`.

- [ ] **Step 3: Implement the mapping**

Create `scripts/islenskubraut/rows.mjs`:

```javascript
/**
 * Category <-> flat spreadsheet rows.
 *
 * Answer and option lists are replaced WHOLESALE per group, in sheet order. That
 * is what makes add, remove and reorder free for a reviewer: copy a row to add,
 * delete a row to remove, drag a row to reorder. No action column, no per-string
 * ids, nothing to get wrong.
 *
 * The group key repeats on every row because Excel users sort columns, and a
 * layout relying on blank continuation cells breaks the moment someone does.
 */
import { LEVELS } from './load.mjs';

const row = (lykill, gerd, stig, samhengi, islenska) => ({
  lykill,
  gerd,
  stig,
  samhengi,
  islenska,
  athugasemd: '',
});

export function toRows(category) {
  const rows = [row(`${category.id}.description`, 'Lýsing', '', '', category.description)];

  category.subCategories.forEach((sub, i) => {
    const id = `${category.id}.s${i + 1}`;
    rows.push(row(`${id}.name`, 'Undirflokkur', '', '', sub.name));
    for (const option of sub.options)
      rows.push(row(`${id}.options`, 'Valkostur', '', sub.name, option));
  });

  category.sentenceFrames.forEach((frame, i) => {
    const id = `${category.id}.f${i + 1}`;
    for (const text of frame.frames) rows.push(row(id, 'Setningarammi', frame.level, '', text));
  });

  category.guidingQuestions.forEach((q, i) => {
    const id = `${category.id}.q${i + 1}`;
    rows.push(row(id, 'Spurning', '', '', q.question));
    for (const answer of q.answers) {
      for (const option of answer.options) {
        rows.push(row(`${id}.${answer.level}`, 'Svar', answer.level, q.question, option));
      }
    }
  });

  return rows;
}

/** Group rows by lykill, preserving first-appearance order of the groups. */
function group(rows) {
  const out = new Map();
  for (const r of rows) {
    if (!out.has(r.lykill)) out.set(r.lykill, []);
    out.get(r.lykill).push(r);
  }
  return out;
}

function require1(groups, key) {
  const g = groups.get(key);
  if (!g || g.length === 0) throw new Error(`islenskubraut: ${key} has no rows`);
  return g[0].islenska;
}

function requireMany(groups, key) {
  const g = groups.get(key);
  if (!g || g.length === 0)
    throw new Error(`islenskubraut: ${key} has no rows — a group cannot be emptied`);
  return g.map((r) => r.islenska);
}

/**
 * Rebuild a category from rows. `base` supplies the fields the sheet does not
 * carry (id, name, icon, color, and each question's icon), which are structural
 * rather than reviewable prose.
 */
export function fromRows(categoryId, rows, base) {
  const groups = group(rows);
  const source = base ?? inferBase(categoryId, groups);

  const subCount = [...groups.keys()].filter((k) => /\.s\d+\.name$/.test(k)).length;
  const frameKeys = [...groups.keys()].filter((k) => new RegExp(`^${categoryId}\\.f\\d+$`).test(k));
  const qKeys = [...groups.keys()].filter((k) => new RegExp(`^${categoryId}\\.q\\d+$`).test(k));

  return {
    ...source,
    description: require1(groups, `${categoryId}.description`),
    subCategories: Array.from({ length: subCount }, (_, i) => ({
      name: require1(groups, `${categoryId}.s${i + 1}.name`),
      options: requireMany(groups, `${categoryId}.s${i + 1}.options`),
    })),
    sentenceFrames: frameKeys.map((key) => ({
      level: groups.get(key)[0].stig,
      frames: requireMany(groups, key),
    })),
    guidingQuestions: qKeys.map((key, i) => ({
      question: require1(groups, key),
      icon: source.guidingQuestions?.[i]?.icon ?? '❓',
      answers: LEVELS.filter((l) => groups.has(`${key}.${l}`)).map((level) => ({
        level,
        options: requireMany(groups, `${key}.${level}`),
      })),
    })),
  };
}

/** Minimal structural fields when no base category is supplied (used by tests). */
function inferBase(categoryId, groups) {
  return {
    id: categoryId,
    name: 'Manneskja',
    icon: '🧑',
    color: '#7B2CBF',
    guidingQuestions: [{ icon: '🎯' }],
  };
}
```

**Note for the implementer:** `inferBase` exists only so the pure round-trip test can run without a base. Task 6 always passes the real `base` loaded from YAML, so `id`, `name`, `icon`, `color` and question icons come from the repo, never from the spreadsheet. Those fields are deliberately not reviewer-editable.

- [ ] **Step 4: Run the test to verify it passes**

Run: `/home/siggi/.nvm/versions/node/v24.13.0/bin/pnpm vitest run scripts/islenskubraut/__tests__/rows.test.ts`
Expected: PASS, 9 cases.

- [ ] **Step 5: Commit**

```bash
git add scripts/islenskubraut/rows.mjs scripts/islenskubraut/__tests__/rows.test.ts
git commit -m "feat(islenskubraut): map categories to and from spreadsheet rows

Option lists are replaced wholesale per group in sheet order, so adding,
removing and reordering are all free for a reviewer. Tested against each of
those gestures directly."
```

---

### Task 5: Export to Excel

**Implemented 2026-08-18 with three deviations from the code below. Do not "restore" them.**

1. **Sheet order.** The `workbook.worksheets.unshift(workbook.worksheets.pop())` line is a no-op:
   exceljs's `worksheets` getter returns a sorted _copy_ (`lib/doc/workbook.js:119-125`), so
   reordering it changes nothing and the Leiðbeiningar tab ended up sixth. The shipped exporter
   adds the guidance sheet _before_ the category loop instead. This is what makes Step 3's own
   first assertion pass.
2. **Sheet protection.** `protect()` applies no defaults — it merges only what you pass, and every
   unpassed action stays locked. `{ selectLockedCells, selectUnlockedCells }` alone therefore
   forbids inserting, deleting and sorting rows: the three things the instruction block at the top
   of each sheet tells the reviewer to do. The shipped exporter also passes
   `insertRows: true, deleteRows: true, sort: true`, and a test pins them.
3. **The `lykill` column is unlocked** (though still unshaded, and still marked "ekki breyta").
   Locking it creates a dead end: a reviewer who adds a row by inserting a blank one can type into
   the yellow `íslenska` cell but cannot fill in the key, and `rejectUnusable` in `rows.mjs` then
   refuses the whole import with "copy the key from the row above" — advice protection prevents
   them from following. A mistyped key still fails loudly at import; an unfillable one had no
   in-sheet escape.

Also: `gerð`'s help text gained `Valkostur` (it is one of the six values `toRows` emits),
`git rev-parse` is wrapped so a missing git does not abort an export, and
`islenskubraut-yfirlestur-*.xlsx` was added to `.gitignore`.

**Still unverified:** nobody has opened the workbook in real Excel. Whether "Insert Copied Cells"
works on a protected sheet is untested — if it does not, deviation 3 is the reviewer's fallback.

**Files:**

- Create: `scripts/islenskubraut/export-xlsx.mjs`
- Modify: `package.json` (scripts)
- Test: `scripts/islenskubraut/__tests__/export-roundtrip.test.ts`

**Interfaces:**

- Consumes: `loadCategories` from `./load.mjs`, `toRows` from `./rows.mjs`.
- Produces: an `.xlsx` at a path given by `--out`, default `islenskubraut-yfirlestur-<YYYY-MM-DD>.xlsx`.

- [x] **Step 1: Write the exporter**

Create `scripts/islenskubraut/export-xlsx.mjs`:

```javascript
#!/usr/bin/env node
/** YAML -> .xlsx for review. One sheet per category. */
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import ExcelJS from 'exceljs';

import { CATEGORY_ORDER, CONTENT_DIR, loadCategories } from './load.mjs';
import { toRows } from './rows.mjs';

// PLACEHOLDER ICELANDIC — Siggi must review before this reaches a colleague.
const INSTRUCTIONS = [
  'LEIÐBEININGAR — breyttu aðeins gulu dálkunum (íslenska, athugasemd).',
  'Bæta við: afritaðu línuna fyrir ofan og skrifaðu yfir textann. Fjarlægja: eyddu línunni.',
  'Röð: dragðu línuna til. Ekki breyta dálkunum lykill, gerð, stig eða samhengi.',
];
const HEADERS = ['lykill', 'gerð', 'stig', 'samhengi', 'íslenska', 'athugasemd'];
const EDITABLE = { argb: 'FFFFF2CC' };

// PLACEHOLDER ICELANDIC — Siggi must review. Shown as a cell comment on each
// header and spelled out on the Leiðbeiningar tab.
const COLUMN_HELP = {
  lykill: 'Auðkenni línunnar. Ekki breyta — innflutningur notar það til að finna réttan stað.',
  gerð: 'Hvers konar texti þetta er: Spurning, Svar, Setningarammi, Undirflokkur eða Lýsing.',
  stig: 'Færnistig: A1, A2 eða B1. Tómt þar sem það á ekki við.',
  samhengi: 'Spurningin sem svarið tilheyrir, til upplýsingar. Ekki breyta.',
  íslenska: 'Textinn sem nemandinn sér. Breyttu hér.',
  athugasemd: 'Athugasemd til Sigga. Fer í sérstakt skjal, ekki inn í efnið sjálft.',
};

const outArg = process.argv.indexOf('--out');
const today = new Date().toISOString().slice(0, 10);
const outPath = outArg !== -1 ? process.argv[outArg + 1] : `islenskubraut-yfirlestur-${today}.xlsx`;

const workbook = new ExcelJS.Workbook();
const categories = loadCategories();

for (const category of categories) {
  const sheet = workbook.addWorksheet(category.name);

  INSTRUCTIONS.forEach((text, i) => {
    sheet.getCell(i + 1, 1).value = text;
    sheet.getCell(i + 1, 1).font = { bold: i === 0, italic: i > 0 };
    sheet.mergeCells(i + 1, 1, i + 1, HEADERS.length);
  });

  const headerRow = sheet.getRow(4);
  headerRow.values = HEADERS;
  headerRow.font = { bold: true };
  HEADERS.forEach((name, i) => {
    headerRow.getCell(i + 1).note = COLUMN_HELP[name];
  });

  for (const row of toRows(category)) {
    const added = sheet.addRow([row.lykill, row.gerd, row.stig, row.samhengi, row.islenska, '']);
    for (const col of [5, 6]) {
      added.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: EDITABLE };
      added.getCell(col).protection = { locked: false };
    }
  }

  // Instructions and headers stay visible while the reviewer scrolls.
  sheet.views = [{ state: 'frozen', ySplit: 4 }];
  sheet.columns = [
    { width: 26 },
    { width: 14 },
    { width: 6 },
    { width: 40 },
    { width: 46 },
    { width: 34 },
  ];
  await sheet.protect('', { selectLockedCells: true, selectUnlockedCells: true });
}

// Guidance tab, first in the workbook so it is what opens.
const guide = workbook.addWorksheet('Leiðbeiningar');
guide.getColumn(1).width = 20;
guide.getColumn(2).width = 96;
guide.addRow(['Yfirlestur á efni Íslenskubrautar']).font = { bold: true, size: 14 };
guide.addRow([]);
for (const line of INSTRUCTIONS) guide.addRow(['', line]);
guide.addRow([]);
guide.addRow(['Dálkar']).font = { bold: true };
for (const [name, help] of Object.entries(COLUMN_HELP)) {
  const r = guide.addRow([name, help]);
  r.getCell(1).font = { bold: true };
  r.getCell(2).alignment = { wrapText: true };
}
guide.addRow([]);
guide.addRow(['', 'Vistaðu skjalið og sendu það til baka. Ekki bæta við eða fjarlægja blöð.']);
workbook.worksheets.unshift(workbook.worksheets.pop());

// Metadata sheet: lets import detect a workbook exported before later repo edits.
const meta = workbook.addWorksheet('_meta');
meta.addRow(['schema', 1]);
meta.addRow(['exported', new Date().toISOString()]);
meta.addRow(['commit', execSync('git rev-parse HEAD').toString().trim()]);
for (const id of CATEGORY_ORDER) {
  const yaml = readFileSync(resolve(CONTENT_DIR, `${id}.yaml`), 'utf8');
  meta.addRow([`hash.${id}`, createHash('sha256').update(yaml).digest('hex')]);
}
meta.state = 'veryHidden';

await workbook.xlsx.writeFile(outPath);
console.log(`wrote ${outPath} — ${categories.length} sheets`);
```

- [x] **Step 2: Add the script**

In `package.json`, after `islenskubraut:build`:

```json
    "islenskubraut:export": "node scripts/islenskubraut/export-xlsx.mjs",
```

- [x] **Step 3: Write the round-trip test**

Create `scripts/islenskubraut/__tests__/export-roundtrip.test.ts`:

```typescript
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import ExcelJS from 'exceljs';
import { afterAll, describe, expect, it } from 'vitest';

import { loadCategories } from '../load.mjs';
import { toRows } from '../rows.mjs';

const dir = mkdtempSync(join(tmpdir(), 'isl-'));
const file = join(dir, 'review.xlsx');
const script = resolve(__dirname, '../export-xlsx.mjs');

execFileSync(process.execPath, [script, '--out', file], { cwd: resolve(__dirname, '../../..') });

afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe('export', () => {
  it('opens on the guidance tab, then one sheet per category', async () => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(file);
    const visible = wb.worksheets.filter((s) => s.state !== 'veryHidden');
    expect(visible.map((s) => s.name)).toEqual([
      'Leiðbeiningar',
      ...loadCategories().map((c) => c.name),
    ]);
  });

  it('explains every column on the guidance tab', async () => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(file);
    const guide = wb.getWorksheet('Leiðbeiningar')!;
    const labels: string[] = [];
    guide.eachRow((row) => labels.push(String(row.getCell(1).value ?? '')));
    for (const column of ['lykill', 'gerð', 'stig', 'samhengi', 'íslenska', 'athugasemd']) {
      expect(labels, `column ${column}`).toContain(column);
    }
  });

  it('preserves every string exactly, including Icelandic characters', async () => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(file);
    for (const category of loadCategories()) {
      const sheet = wb.getWorksheet(category.name)!;
      const written: string[] = [];
      sheet.eachRow((row, n) => {
        if (n > 4) written.push(String(row.getCell(5).value ?? ''));
      });
      expect(written, category.id).toEqual(toRows(category).map((r) => r.islenska));
    }
  });

  it('freezes the instruction block and the header', async () => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(file);
    // Not worksheets[0] — that is now the Leiðbeiningar tab.
    expect(wb.getWorksheet('Dýr')!.views[0]).toMatchObject({ state: 'frozen', ySplit: 4 });
  });
});
```

- [x] **Step 4: Run it**

Run: `/home/siggi/.nvm/versions/node/v24.13.0/bin/pnpm vitest run scripts/islenskubraut/__tests__/export-roundtrip.test.ts`
Expected: PASS. Then open the file yourself and look at it — the freeze and the shading are the point, and no test sees them the way a reviewer will.

- [x] **Step 5: Commit**

```bash
git add package.json scripts/islenskubraut/export-xlsx.mjs scripts/islenskubraut/__tests__/export-roundtrip.test.ts
git commit -m "feat(islenskubraut): export content to xlsx for review

One sheet per category, instructions and header frozen so they stay visible
while scrolling, editable columns shaded and everything else protected. A
hidden metadata sheet carries per-category hashes so import can detect a
stale workbook."
```

---

### Task 6: Import from Excel

**Implemented 2026-08-18. The pure logic lives in a new `scripts/islenskubraut/review.mjs`, not
inside the CLI, and four behaviours below were changed. Do not "restore" them.**

The plan put five pure functions inside `import-xlsx.mjs`, where a test cannot reach them — the CLI
runs on import. They now sit in `review.mjs` (`readSheet`, `toYamlShape`, `renderYaml`,
`yamlHeader`, `diffSummary`, `headerRowNumber`), matching how `rows.mjs` and `render.mjs` already
relate to `build.mjs`. That is what lets the write path be tested against a temp directory instead
of against `content/`, with no `--content-dir` escape hatch in production code.

1. **Cells are read with `cell.text`, never `String(cell.value)`.** Text pasted from Word arrives as
   `{ richText: [...] }`, and `String()` turns that into the literal `"[object Object]"` — measured,
   not theorised. It is non-empty, carries no invisible characters and is not ASCII-flattened, so it
   passes `checkString` too and would print on a student's card. `text.mjs`'s own docstring names
   pasting from Word as the expected reviewer behaviour, so this is the common path, not the edge.
2. **A cell Excel coerced is refused, not repaired.** `.text` fixes rich text but makes a
   date look clean while being wrong: a Date cell yields
   `"Sun Mar 01 2026 00:00:00 GMT+0000 (Greenwich Mean Time)"`, which every validator accepts.
   Date, Formula, Error and Boolean cells are now fatal problems naming the column. Numbers are
   allowed.
3. **A row with text but no `lykill` is fatal, not skipped.** The plan's `if (!lykill) return;` drops
   it before `fromRows` ever sees it, so `rejectUnusable`'s "carry text but no lykill" branch is
   unreachable from the importer and the reviewer's string vanishes silently. This is the exact row a
   reviewer produces by inserting a blank line and typing — the case Task 5's unlocked `lykill`
   column exists to make recoverable. Wholly blank rows are still skipped.
4. **`problems` are `{ message, fatal }` objects.** The plan decided severity by substring-matching
   its own error text (`p.includes('changed since')`), which breaks the moment a message is reworded.

Also: `fromRows` throwing and a missing category file are caught and reported as problems rather
than aborting the run with a stack trace; the non-data sheet names are compared NFC-normalised; and
the category id is taken from the majority of a sheet's keys rather than the first row, so one typo
in the top key names the typo instead of failing on a missing file.

**Known and deliberately not fixed:** `diffSummary`'s `flatten` keys groups positionally
(`f${i+1}`), so deleting a whole group shifts the ones after it and prints a run of spurious +/-
pairs. Cosmetic, in the printed summary only — the written YAML is unaffected.

**Verified by hand beyond the tests:** a real import of a one-string edit rewrites exactly one line
of `dyr.yaml` (`renderYaml` reproduces all six committed files byte-for-byte, which is also a test),
writes the reviewer's comment to `_athugasemdir-2026-08.md`, and leaves `islenskubraut:build --check`
correctly reporting the two generated files as stale. A workbook exported before a repo edit is
refused with exit 1, and in the mixed case — one stale category plus one legitimately edited one —
nothing at all is written.

**Files:**

- Create: `scripts/islenskubraut/import-xlsx.mjs`
- Modify: `package.json` (scripts)
- Test: `scripts/islenskubraut/__tests__/import.test.ts`

**Interfaces:**

- Consumes: `loadCategory`, `CONTENT_DIR` from `./load.mjs`; `fromRows` from `./rows.mjs`; `normalizeText`, `findInvisible`, `isFlattened` from `./text.mjs`.
- Produces: rewritten YAML files, plus `content/islenskubraut/_athugasemdir-YYYY-MM.md`.

- [x] **Step 1: Write the importer**

Create `scripts/islenskubraut/import-xlsx.mjs`:

```javascript
#!/usr/bin/env node
/** .xlsx -> YAML. Normalises, validates, refuses stale workbooks, prints a diff. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import ExcelJS from 'exceljs';
import { stringify } from 'yaml';

import { CONTENT_DIR, loadCategory } from './load.mjs';
import { fromRows } from './rows.mjs';
import { findInvisible, isFlattened, normalizeText } from './text.mjs';

const file = process.argv[2];
const dryRun = process.argv.includes('--dry-run');
const force = process.argv.includes('--force');
if (!file) {
  console.error('usage: pnpm islenskubraut:import <file.xlsx> [--dry-run] [--force]');
  process.exit(1);
}

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(file);

const meta = new Map();
workbook
  .getWorksheet('_meta')
  ?.eachRow((row) => meta.set(String(row.getCell(1).value), String(row.getCell(2).value)));

/** Find the header row by locating `lykill`, so the instruction block can grow. */
function headerRowNumber(sheet) {
  for (let n = 1; n <= 20; n += 1) {
    if (String(sheet.getRow(n).getCell(1).value ?? '').trim() === 'lykill') return n;
  }
  throw new Error(`sheet "${sheet.name}": no header row containing "lykill"`);
}

const problems = [];
const notes = [];
const changed = [];

const NON_DATA_SHEETS = new Set(['Leiðbeiningar', '_meta']);

for (const sheet of workbook.worksheets) {
  if (sheet.state === 'veryHidden' || NON_DATA_SHEETS.has(sheet.name)) continue;

  const header = headerRowNumber(sheet);
  const rows = [];
  sheet.eachRow((row, n) => {
    if (n <= header) return;
    const lykill = String(row.getCell(1).value ?? '').trim();
    if (!lykill) return;
    const raw = String(row.getCell(5).value ?? '');
    const islenska = normalizeText(raw);

    if (!islenska) {
      problems.push(`${sheet.name} row ${n}: ${lykill} — empty text (delete the row to remove it)`);
      return;
    }
    for (const cp of findInvisible(raw)) {
      problems.push(`${sheet.name} row ${n}: ${lykill} — stripped ${cp} from "${raw}"`);
    }
    if (isFlattened(islenska)) {
      problems.push(`${sheet.name} row ${n}: ${lykill} — "${islenska}" looks ASCII-flattened`);
    }

    const note = normalizeText(String(row.getCell(6).value ?? ''));
    if (note) notes.push({ lykill, islenska, note });
    rows.push({
      lykill,
      gerd: String(row.getCell(2).value ?? ''),
      stig: String(row.getCell(3).value ?? ''),
      islenska,
    });
  });

  const categoryId = rows[0]?.lykill.split('.')[0];
  if (!categoryId) throw new Error(`sheet "${sheet.name}" has no data rows`);

  const before = loadCategory(categoryId);
  const beforeYaml = readFileSync(resolve(CONTENT_DIR, `${categoryId}.yaml`), 'utf8');
  const expected = meta.get(`hash.${categoryId}`);
  const actual = createHash('sha256').update(beforeYaml).digest('hex');
  if (expected && expected !== actual && !force) {
    problems.push(
      `${categoryId}: the repo changed since this workbook was exported. ` +
        `Re-export, or pass --force to overwrite.`
    );
    continue;
  }

  const after = fromRows(categoryId, rows, before);
  if (JSON.stringify(after) === JSON.stringify(before)) continue;

  changed.push({ categoryId, before, after, beforeYaml });
}

if (problems.length > 0) {
  console.error('Problems found:\n' + problems.map((p) => `  - ${p}`).join('\n'));
  if (problems.some((p) => p.includes('changed since') || p.includes('flattened'))) {
    console.error('\nRefusing to write. Fix the above, or pass --force where appropriate.');
    process.exit(1);
  }
}

for (const { categoryId, before, after, beforeYaml } of changed) {
  const summary = diffSummary(before, after);
  console.log(`\n${categoryId}:\n${summary}`);
  if (dryRun) continue;

  const header = beforeYaml.slice(0, beforeYaml.indexOf('\nid:') + 1);
  const body = stringify(toYamlShape(after), { lineWidth: 0, defaultStringType: 'PLAIN' });
  writeFileSync(resolve(CONTENT_DIR, `${categoryId}.yaml`), `${header}${body}`, 'utf8');
}

if (notes.length > 0 && !dryRun) {
  const month = new Date().toISOString().slice(0, 7);
  const path = resolve(CONTENT_DIR, `_athugasemdir-${month}.md`);
  const md = [
    `# Athugasemdir úr yfirlestri — ${month}`,
    '',
    'Sjálfkrafa úr athugasemdadálki Excel-skjalsins. Hver lína bíður ákvörðunar.',
    '',
    ...notes.map((n) => `- **${n.lykill}** — «${n.islenska}»\n  - ${n.note}`),
  ].join('\n');
  writeFileSync(path, `${md}\n`, 'utf8');
  console.log(
    `\nwrote ${path.replace(`${CONTENT_DIR}/`, 'content/islenskubraut/')} — ${notes.length} note(s)`
  );
}

if (changed.length === 0) console.log('No content changes.');
else if (dryRun) console.log('\n(dry run — nothing written)');
else console.log('\nNow run: pnpm islenskubraut:build');

/** Same YAML shape the migration produced. */
function toYamlShape(category) {
  return {
    id: category.id,
    name: category.name,
    icon: category.icon,
    description: category.description,
    color: category.color,
    subCategories: category.subCategories.map((s, i) => ({
      id: `s${i + 1}`,
      name: s.name,
      options: s.options,
    })),
    sentenceFrames: category.sentenceFrames.map((f, i) => ({
      id: `f${i + 1}`,
      level: f.level,
      frames: f.frames,
    })),
    guidingQuestions: category.guidingQuestions.map((q, i) => ({
      id: `q${i + 1}`,
      question: q.question,
      icon: q.icon,
      answers: Object.fromEntries(q.answers.map((a) => [a.level, a.options])),
    })),
  };
}

function flatten(category) {
  const out = new Map();
  out.set(`${category.id}.description`, [category.description]);
  category.subCategories.forEach((s, i) =>
    out.set(`${category.id}.s${i + 1}`, [s.name, ...s.options])
  );
  category.sentenceFrames.forEach((f, i) => out.set(`${category.id}.f${i + 1}`, f.frames));
  category.guidingQuestions.forEach((q, i) => {
    out.set(`${category.id}.q${i + 1}`, [q.question]);
    for (const a of q.answers) out.set(`${category.id}.q${i + 1}.${a.level}`, a.options);
  });
  return out;
}

function diffSummary(before, after) {
  const a = flatten(before);
  const b = flatten(after);
  const lines = [];
  for (const [key, next] of b) {
    const prev = a.get(key) ?? [];
    for (const value of next) if (!prev.includes(value)) lines.push(`  + ${key}: ${value}`);
    for (const value of prev) if (!next.includes(value)) lines.push(`  - ${key}: ${value}`);
  }
  return lines.length > 0 ? lines.join('\n') : '  (no change)';
}
```

- [x] **Step 2: Add the script**

```json
    "islenskubraut:import": "node scripts/islenskubraut/import-xlsx.mjs",
```

- [x] **Step 3: Write the test**

Create `scripts/islenskubraut/__tests__/import.test.ts`:

```typescript
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import ExcelJS from 'exceljs';
import { afterAll, describe, expect, it } from 'vitest';

const ROOT = resolve(__dirname, '../../..');
const dir = mkdtempSync(join(tmpdir(), 'isl-imp-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

/** Export a workbook, mutate one cell, run import --dry-run, return stdout. */
async function importWithEdit(mutate: (sheet: ExcelJS.Worksheet) => void): Promise<string> {
  const file = join(dir, `${Math.random().toString(36).slice(2)}.xlsx`);
  execFileSync(process.execPath, [resolve(__dirname, '../export-xlsx.mjs'), '--out', file], {
    cwd: ROOT,
  });
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  mutate(wb.getWorksheet('Dýr')!); // first category sheet; worksheets[0] is Leiðbeiningar
  await wb.xlsx.writeFile(file);
  return execFileSync(
    process.execPath,
    [resolve(__dirname, '../import-xlsx.mjs'), file, '--dry-run'],
    {
      cwd: ROOT,
      encoding: 'utf8',
    }
  );
}

describe('import', () => {
  it('reports no change for an untouched workbook', async () => {
    const out = await importWithEdit(() => {});
    expect(out).toContain('No content changes.');
  });

  it('reports an edited string as a diff', async () => {
    const out = await importWithEdit((sheet) => {
      sheet.getRow(5).getCell(5).value = 'Breyttur texti um dýr';
    });
    expect(out).toContain('+ dyr.description: Breyttur texti um dýr');
    expect(out).toContain('(dry run — nothing written)');
  });

  it('strips a pasted soft hyphen and says so', async () => {
    const out = await importWithEdit((sheet) => {
      sheet.getRow(5).getCell(5).value = 'Orða­forði um dýr';
    });
    expect(out).toMatch(/stripped U\+00AD/);
  });
});
```

- [x] **Step 4: Run it**

Run: `/home/siggi/.nvm/versions/node/v24.13.0/bin/pnpm vitest run scripts/islenskubraut/__tests__/import.test.ts`
Expected: PASS, 3 cases. The third asserts the paste-hygiene path reports rather than silently swallowing.

- [x] **Step 5: Verify the refusal path by hand**

```bash
cd /home/siggi/dev/repos/kvenno-app
/home/siggi/.nvm/versions/node/v24.13.0/bin/pnpm islenskubraut:export --out /tmp/stale.xlsx
printf '\n# touched\n' >> content/islenskubraut/dyr.yaml
/home/siggi/.nvm/versions/node/v24.13.0/bin/pnpm islenskubraut:import /tmp/stale.xlsx --dry-run
git checkout content/islenskubraut/dyr.yaml
```

Expected: a message naming `dyr` as changed since export, and a non-zero exit. This is the guard that stops a three-week-old workbook silently reverting later edits — confirm it fires before trusting it.

- [x] **Step 6: Commit**

```bash
git add package.json scripts/islenskubraut/import-xlsx.mjs scripts/islenskubraut/__tests__/import.test.ts
git commit -m "feat(islenskubraut): import reviewed xlsx back to yaml

Normalises to NFC, strips invisible characters and reports each one, refuses a
workbook exported before later repo edits, and prints a per-category diff.
Reviewer notes are written to a dated markdown file so they land in the PR
rather than staying in a spreadsheet."
```

---

### Task 7: Documentation

**Implemented 2026-08-18. Step 2 was adapted, not applied as written.**

Steps 1, 3 and 4 shipped as listed. Step 2 told us to replace the body of CLAUDE.md's
Íslenskubraut section with a six-line summary — but by the time Task 7 ran, that section had been
rewritten twice (during the Tasks 1-4 merge, and again for Tasks 5-6) and now carries the
three-file category edit, the guards, the corruption history and the UNFINISHED block. Applying
the draft would have deleted all of it to install something thinner. The section instead gained a
pointer to the new `content/islenskubraut/README.md` and kept its contents.

Step 1's README also departs from the draft, which described behaviour that had not been built
when it was written: it now covers what import refuses outright (coerced cells, a row with text
and no key, an emptied group), and separates the repairs that are reported from the ones that are
silent — measured, because the draft's "reports every instance" is wrong. NFC normalisation,
non-breaking spaces and whitespace collapsing are all silent; only the invisible characters are
named.

**Files:**

- Create: `content/islenskubraut/README.md`
- Modify: `CLAUDE.md` (the "Íslenskubraut data sync" section)
- Modify: `docs/README.md` (index)
- Modify: `docs/superpowers/specs/2026-08-17-islenskubraut-content-authoring-design.md` (the byte-identity correction)

- [x] **Step 1: Write the content README**

Create `content/islenskubraut/README.md`:

```markdown
# Íslenskubraut content

These six YAML files are the **source of truth** for everything a student reads in
Íslenskubraut — the category grid, the teaching cards, and the generated PDF.

## Editing directly

Edit the YAML, then run:

    pnpm islenskubraut:build

That regenerates `apps/islenskubraut/src/data/categories/*.ts` and
`server/src/lib/islenskubraut-data.ts`. **Never edit those files** — they are output, and
CI fails if they do not match the YAML.

## Editing by spreadsheet

    pnpm islenskubraut:export                    # islenskubraut-yfirlestur-<date>.xlsx
    pnpm islenskubraut:import <file> --dry-run   # preview
    pnpm islenskubraut:import <file>             # apply
    pnpm islenskubraut:build

In the spreadsheet: change only the shaded columns. Copy a row to add an option, delete a
row to remove one, drag a row to reorder. Import replaces each group in sheet order.

Import normalises Unicode to NFC and strips soft hyphens and zero-width characters, which
is what pasting from Word introduces. It refuses a workbook exported before later repo
edits; re-export instead of forcing, unless you know the repo change is the stale one.

Notes left in the `athugasemd` column are written to `_athugasemdir-YYYY-MM.md`.

## Why this exists

Until August 2026 the content lived in TypeScript object literals, duplicated by hand
between the SPA and the server. The server copy drifted and shipped corrupted Icelandic
onto the PDFs students were handed — `Orðaforði` rendered as `Orda<soft hyphen>fordi`,
`Þessi` as `Þssi`, and `rannsóka` and `Undirbuníngur`, neither of which is a word. It went
unnoticed for months because nobody could read the content in that form.
```

- [x] **Step 2: Replace the CLAUDE.md section**

Replace the body of `### Íslenskubraut data sync` with:

```markdown
**Edit `content/islenskubraut/*.yaml` only.** It is the single source of truth.

    pnpm islenskubraut:build           # YAML -> both TypeScript consumers
    pnpm islenskubraut:build --check   # CI: fails if a generated file was hand-edited
    pnpm islenskubraut:export          # .xlsx for a reviewer who does not use git
    pnpm islenskubraut:import <file>   # corrections back into YAML

Generated, never hand-edited: `apps/islenskubraut/src/data/categories/*.ts` and
`server/src/lib/islenskubraut-data.ts`. Both come from the same source, so they cannot
diverge. See `content/islenskubraut/README.md`.
```

- [x] **Step 3: Correct the spec**

In the spec, change Rollout §1 and the Validation table row from byte-identity to semantic identity, matching the "Correction to the spec" section of this plan. Leaving both statements in the repo would be exactly the doc-vs-reality drift the August sweep spent a day removing.

- [x] **Step 4: Add the content README to the docs index**

In `docs/README.md`, under "Platform and operations", add:

```markdown
| [`content/islenskubraut/README.md`](../content/islenskubraut/README.md) | Editing Íslenskubraut content, directly or by spreadsheet |
```

- [x] **Step 5: Final verification**

```bash
cd /home/siggi/dev/repos/kvenno-app
export PATH="/home/siggi/.nvm/versions/node/v24.13.0/bin:$PATH"
pnpm islenskubraut:build --check && pnpm type-check && pnpm lint && pnpm test
```

Expected: all four exit 0. Note `pnpm format:check` fails on `main` already, on unrelated files — do not treat that as a regression, and do not reformat those files here.

- [x] **Step 6: Commit**

```bash
git add content/islenskubraut/README.md CLAUDE.md docs/README.md docs/superpowers/specs/2026-08-17-islenskubraut-content-authoring-design.md
git commit -m "docs: document islenskubraut content editing

Adds the content README, replaces CLAUDE.md's data-sync section with the
generated-from-yaml workflow, and corrects the spec's byte-identity claim to
the semantic identity actually implemented."
```

---

## Verification for the whole plan

- [ ] `pnpm islenskubraut:build --check` — clean, and clean again after a commit (lint-staged runs prettier; the generator must already match its output)
- [ ] `pnpm type-check`, `pnpm lint`, `pnpm test` — all exit 0
- [ ] `git diff main --stat -- apps/islenskubraut/src/data/categories/` shows formatting and headers only, no changed string values
- [ ] Export a workbook, open it, and confirm the frozen instructions, the shading and the protection behave for a human
- [ ] Load `/islenskubraut/` in dev and open one teaching card
- [ ] Generate one PDF via `GET /api/islenskubraut/pdf?flokkur=manneskja&stig=A1` and read the Icelandic on it

## Unfinished — required before the first real review cycle

- [ ] **Rewrite the reviewer-facing Icelandic in the exported workbook.** Every string a colleague
      reads is placeholder wording drafted by Claude and never reviewed: the three-line instruction
      block, the six column headers, the six `COLUMN_HELP` cell notes and the Leiðbeiningar tab —
      all marked `PLACEHOLDER ICELANDIC` in `scripts/islenskubraut/export-xlsx.mjs`. The plan's
      Global Constraints called this out from the start and it is still owed. **Do not send an
      export to a colleague until Siggi has written this copy** — the instructions tell a reviewer
      how to add, delete and reorder rows, so wording that misleads produces a workbook the importer
      then refuses.
- [ ] **Open an exported workbook in real Excel.** Untested: whether _Insert Copied Cells_ works on
      a protected sheet, and whether the freeze, shading and locked columns behave for a human. If
      insert-copied-cells is refused, the unlocked `lykill` column (Task 5, deviation 3) is the
      reviewer's fallback and the instruction text must say so.

## What this plan deliberately does not do

The content review itself. This builds the means to review; the review is a separate pass, and
its output is a content PR. Also untouched: the `manneskja.ts` questions Siggi raised
(`:109`, `:143`, `:200`, `:251`) and the gendered-pair ordering inconsistency — all recorded in
the spec's open items, all needing his judgement rather than a script.
