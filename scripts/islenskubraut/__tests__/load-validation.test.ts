/**
 * Direct coverage for every `assert()` branch in `load.mjs`.
 *
 * Before this file, those branches were exercised only by manual scratch testing
 * during review, or implicitly by the fact that the real content happens to be
 * valid today. Fixtures live in a temp directory (never under `content/`) and are
 * passed via the optional `contentDir` parameter on `loadCategory`/`loadCategories`,
 * so this exercises the real entry points, not a parallel copy of the validation
 * logic.
 *
 * Any invisible or decomposed character in a fixture is built from a `\uXXXX`
 * escape, never typed as a literal character — see `text.test.ts` for the same
 * convention and its rationale.
 */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { CATEGORY_ORDER, loadCategories, loadCategory } from '../load.mjs';

let dir: string | undefined;

afterEach(() => {
  if (dir) {
    rmSync(dir, { recursive: true, force: true });
    dir = undefined;
  }
});

function makeDir(): string {
  dir = mkdtempSync(join(tmpdir(), 'islenskubraut-load-test-'));
  return dir;
}

function write(target: string, filename: string, content: string) {
  writeFileSync(join(target, filename), content, 'utf8');
}

describe('loadCategory validation', () => {
  it('throws when a string contains an invisible character', () => {
    const target = makeDir();
    // U+00AD soft hyphen wedged mid-word, built from an escape -- the exact
    // defect class that shipped "Orðaforði" as "Orda<U+00AD>fordi".
    const description = 'Or\u00ADðaforði um eitthvað';
    write(
      target,
      'prufa.yaml',
      `id: prufa
name: Prufa
description: "${description}"
color: "#123456"
icon: 🧪
`
    );

    expect(() => loadCategory('prufa', target)).toThrow(/prufa\.description contains U\+00AD/);
  });

  it('throws when a string looks ASCII-flattened', () => {
    const target = makeDir();
    write(
      target,
      'prufa.yaml',
      `id: prufa
name: Prufa
description: husdyr
color: "#123456"
icon: 🧪
`
    );

    expect(() => loadCategory('prufa', target)).toThrow(
      /prufa\.description looks ASCII-flattened — "husdyr"/
    );
  });

  it('throws when a sub-category option list is empty', () => {
    const target = makeDir();
    write(
      target,
      'prufa.yaml',
      `id: prufa
name: Prufa
description: Lýsing á prufuflokki.
color: "#123456"
icon: 🧪
subCategories:
  - id: s1
    name: Tegund
    options: []
`
    );

    expect(() => loadCategory('prufa', target)).toThrow(/prufa\.s1\.options is empty/);
  });

  it('throws on an unknown level key', () => {
    const target = makeDir();
    write(
      target,
      'prufa.yaml',
      `id: prufa
name: Prufa
description: Lýsing á prufuflokki.
color: "#123456"
icon: 🧪
sentenceFrames:
  - id: f1
    level: C1
    frames:
      - Þetta er ___.
`
    );

    expect(() => loadCategory('prufa', target)).toThrow(/prufa\.f1 has level "C1"/);
  });

  it('throws when the id field disagrees with the filename', () => {
    const target = makeDir();
    write(
      target,
      'mismatch.yaml',
      `id: annad
name: Nafn
description: Lýsing.
color: "#123456"
icon: 🧪
`
    );

    expect(() => loadCategory('mismatch', target)).toThrow(/mismatch\.yaml declares id "annad"/);
  });

  it('throws when a guiding question has no answers at any level', () => {
    const target = makeDir();
    write(
      target,
      'prufa.yaml',
      `id: prufa
name: Prufa
description: Lýsing á prufuflokki.
color: "#123456"
icon: 🧪
guidingQuestions:
  - id: q1
    question: Er þetta próf?
    icon: ❓
    answers: {}
`
    );

    expect(() => loadCategory('prufa', target)).toThrow(/prufa\.q1 has no answers at any level/);
  });

  it('does not throw for a valid fixture, and returns the expected shape', () => {
    const target = makeDir();
    write(
      target,
      'prufa.yaml',
      `id: prufa
name: Prufa
description: Lýsing á prufuflokki.
color: "#123456"
icon: 🧪
subCategories:
  - id: s1
    name: Tegund
    options:
      - fyrsti valkostur
      - annar valkostur
sentenceFrames:
  - id: f1
    level: A1
    frames:
      - Þetta er ___.
guidingQuestions:
  - id: q1
    question: Hvað er þetta?
    icon: ❓
    answers:
      A1:
        - svar eitt
        - svar tvö
`
    );

    let result;
    expect(() => {
      result = loadCategory('prufa', target);
    }).not.toThrow();
    expect(result).toEqual({
      id: 'prufa',
      name: 'Prufa',
      icon: '🧪',
      description: 'Lýsing á prufuflokki.',
      color: '#123456',
      subCategories: [{ name: 'Tegund', options: ['fyrsti valkostur', 'annar valkostur'] }],
      sentenceFrames: [{ level: 'A1', frames: ['Þetta er ___.'] }],
      guidingQuestions: [
        {
          question: 'Hvað er þetta?',
          icon: '❓',
          answers: [{ level: 'A1', options: ['svar eitt', 'svar tvö'] }],
        },
      ],
    });
  });
});

describe('loadCategories validation', () => {
  it('throws when a file on disk is not listed in CATEGORY_ORDER', () => {
    const target = makeDir();
    write(
      target,
      'okunnugt.yaml',
      `id: okunnugt
name: Óþekkt
description: Lýsing.
color: "#123456"
icon: 🧪
`
    );

    expect(() => loadCategories(target)).toThrow(/okunnugt not listed in CATEGORY_ORDER/);
  });

  it('does not throw for a valid fixture set, and returns categories in taught order', () => {
    const target = makeDir();
    for (const id of CATEGORY_ORDER) {
      write(
        target,
        `${id}.yaml`,
        `id: ${id}
name: ${id}
description: Lýsing fyrir ${id}.
color: "#123456"
icon: 🧪
`
      );
    }

    let result;
    expect(() => {
      result = loadCategories(target);
    }).not.toThrow();
    expect(result.map((c) => c.id)).toEqual(CATEGORY_ORDER);
  });
});
