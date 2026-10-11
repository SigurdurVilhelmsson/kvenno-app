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

/** The per-level fields every category must carry, for fixtures that should load. */
const PER_LEVEL = `examples:
  A1: Dæmi eitt.
  A2: Dæmi tvö.
  B1: Dæmi þrjú.
teacherNotes:
  A1: Athugasemd eitt.
  A2: Athugasemd tvö.
  B1: Athugasemd þrjú.
`;

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

  it('throws when a required string field is an empty string', () => {
    const target = makeDir();
    write(
      target,
      'prufa.yaml',
      `id: prufa
name: Prufa
description: ""
color: "#123456"
icon: 🧪
`
    );

    expect(() => loadCategory('prufa', target)).toThrow(
      /prufa\.description must be a non-empty string/
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

  it('throws when a sentence frame has an empty frames list', () => {
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
    level: A1
    frames: []
`
    );

    expect(() => loadCategory('prufa', target)).toThrow(/prufa\.f1\.frames is empty/);
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
    label: Próf
    answers: {}
`
    );

    expect(() => loadCategory('prufa', target)).toThrow(/prufa\.q1 has no answers at any level/);
  });

  it('throws when a guiding question level has an empty answer list', () => {
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
    label: Próf
    answers:
      A1: []
`
    );

    expect(() => loadCategory('prufa', target)).toThrow(/prufa\.q1\.A1 is empty/);
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
examples:
  A1: Dæmi eitt.
  A2: Dæmi tvö.
  B1: Dæmi þrjú.
teacherNotes:
  A1: Athugasemd eitt.
  A2: Athugasemd tvö.
  B1: Athugasemd þrjú.
guidingQuestions:
  - id: q1
    question: Hvað er þetta?
    icon: ❓
    label: Próf
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
      examples: [
        { level: 'A1', text: 'Dæmi eitt.' },
        { level: 'A2', text: 'Dæmi tvö.' },
        { level: 'B1', text: 'Dæmi þrjú.' },
      ],
      teacherNotes: [
        { level: 'A1', text: 'Athugasemd eitt.' },
        { level: 'A2', text: 'Athugasemd tvö.' },
        { level: 'B1', text: 'Athugasemd þrjú.' },
      ],
      guidingQuestions: [
        {
          question: 'Hvað er þetta?',
          icon: '❓',
          label: 'Próf',
          answers: [{ level: 'A1', options: ['svar eitt', 'svar tvö'] }],
        },
      ],
    });
  });
});

describe('question labels and context boxes', () => {
  const withQuestion = (fields: string) => `id: prufa
name: Prufa
description: Lýsing.
color: "#123456"
icon: 🧪
${PER_LEVEL}guidingQuestions:
  - id: q1
    question: Hvar er þetta?
    icon: ❓
${fields}    answers:
      A1:
        - heima
`;

  it('gives a context question its kind and colour, and no label', () => {
    const target = makeDir();
    write(target, 'prufa.yaml', withQuestion('    context: hvar\n'));
    const [q] = loadCategory('prufa', target).guidingQuestions;
    expect(q.context).toEqual({ kind: 'hvar', color: '#B91C1C' });
    expect(q).not.toHaveProperty('label');
  });

  it('throws on a question with neither a label nor a context kind', () => {
    const target = makeDir();
    write(target, 'prufa.yaml', withQuestion(''));
    expect(() => loadCategory('prufa', target)).toThrow(/prufa\.q1 needs exactly one of label/);
  });

  it('throws on a question with both', () => {
    const target = makeDir();
    write(target, 'prufa.yaml', withQuestion('    label: Hvar?\n    context: hvar\n'));
    expect(() => loadCategory('prufa', target)).toThrow(/prufa\.q1 needs exactly one of label/);
  });

  it('throws on a context kind that has no colour', () => {
    const target = makeDir();
    write(target, 'prufa.yaml', withQuestion('    context: hvernig\n'));
    expect(() => loadCategory('prufa', target)).toThrow(/prufa\.q1\.context is "hvernig"/);
  });

  it('checks a label like any other text', () => {
    const target = makeDir();
    // A soft hyphen mid-word, built from an escape (see the header).
    write(target, 'prufa.yaml', withQuestion('    label: Út\u00ADlit\n'));
    expect(() => loadCategory('prufa', target)).toThrow(/prufa\.q1\.label contains/);
  });
});

describe('examples and teacher notes', () => {
  const head = `id: prufa
name: Prufa
description: Lýsing.
color: "#123456"
icon: 🧪
`;

  it('throws when a level has no example, which would print an empty box', () => {
    const target = makeDir();
    write(target, 'prufa.yaml', head + PER_LEVEL.replace('  B1: Dæmi þrjú.\n', ''));
    expect(() => loadCategory('prufa', target)).toThrow(/prufa\.examples\.B1 must be a non-empty/);
  });

  it('throws when a teacher note is empty', () => {
    const target = makeDir();
    write(target, 'prufa.yaml', head + PER_LEVEL.replace('Athugasemd tvö.', '""'));
    expect(() => loadCategory('prufa', target)).toThrow(
      /prufa\.teacherNotes\.A2 must be a non-empty/
    );
  });

  it('holds an example to the same text checks as everything else', () => {
    const target = makeDir();
    // U+00AD soft hyphen, built from an escape.
    write(target, 'prufa.yaml', head + PER_LEVEL.replace('Dæmi eitt.', '"D\u00ADæmi eitt."'));
    expect(() => loadCategory('prufa', target)).toThrow(/prufa\.examples\.A1 contains U\+00AD/);
  });
});

describe('sentence builder tags', () => {
  const card = `id: prufa
name: Prufa
description: Lýsing.
color: "#123456"
icon: 🧪
${PER_LEVEL}subCategories:
  - id: s1
    name: Tegund
    options:
      - ávöxtur
      - skór
sentenceFrames:
  - id: f1
    level: A1
    frames:
      - Þetta er ___.
      - Það er ___.
      - Það hefur ___ og ___.
guidingQuestions:
  - id: q1
    question: Hvernig er það?
    icon: ❓
    label: Útlit
    answers:
      A1:
        - sætt
        - stórt
`;
  const load = (builder: string) => {
    const target = makeDir();
    write(target, 'prufa.yaml', `${card}builder:\n  A1:\n${builder}`);
    return loadCategory('prufa', target);
  };
  const subject = `    subject:
      words: Tegund
      plural: [skór]
`;

  it('resolves a word list from a question or a vocabulary group, at the same level', () => {
    const result = load(`${subject}    frames:
      - frame: Þetta er ___.
        agree:
          er: sögn
        blank: subject
      - frame: Það er ___.
        agree:
          Það: NF
          er: sögn
        words: Hvernig er það?
        form: agree
    lemmas:
      sætt: sætur
`);
    expect(result.builder).toEqual([
      {
        level: 'A1',
        confirmed: false,
        subject: { kind: 'words', words: 'Tegund', options: ['ávöxtur', 'skór'], plural: ['skór'] },
        frames: [
          {
            frame: 'Þetta er ___.',
            agree: [{ word: 'er', role: 'sögn' }],
            blank: { subject: true },
          },
          {
            frame: 'Það er ___.',
            agree: [
              { word: 'Það', role: 'NF' },
              { word: 'er', role: 'sögn' },
            ],
            blank: { words: 'Hvernig er það?', options: ['sætt', 'stórt'], form: 'agree' },
          },
        ],
        lemmas: { sætt: 'sætur' },
      },
    ]);
  });

  it('reads a teacher confirmation, and refuses one that is not true or false', () => {
    const frames = `    frames:\n      - frame: Þetta er ___.\n        blank: subject\n`;
    expect(load(`    confirmed: true\n${subject}${frames}`).builder?.[0].confirmed).toBe(true);
    expect(() => load(`    confirmed: já\n${subject}${frames}`)).toThrow(
      /confirmed must be true or false/
    );
  });

  it('leaves a category with no builder without one', () => {
    const target = makeDir();
    write(target, 'prufa.yaml', card);
    expect(loadCategory('prufa', target)).not.toHaveProperty('builder');
  });

  it('throws on a frame the card does not print, so editing a frame breaks the build', () => {
    expect(() => load(`${subject}    frames:\n      - frame: Þetta er ekki ___.\n`)).toThrow(
      /"Þetta er ekki ___\." is not one of the card's A1 frames/
    );
  });

  it('throws on a frame with two blanks', () => {
    expect(() =>
      load(`${subject}    frames:\n      - frame: Það hefur ___ og ___.\n        words: Tegund\n`)
    ).toThrow(/at most one blank/);
  });

  it('throws on a word list that is neither a question nor a vocabulary group', () => {
    expect(() =>
      load(`${subject}    frames:\n      - frame: Það er ___.\n        words: Hvað er þetta?\n`)
    ).toThrow(/"Hvað er þetta\?" is neither a question with A1 answers nor a vocabulary group/);
  });

  it('throws on an unknown agreement role or blank form', () => {
    expect(() =>
      load(`${subject}    frames:
      - frame: Það er ___.
        agree:
          Það: ÞGF
        words: Tegund
`)
    ).toThrow(/"ÞGF" is not one of NF, ÞF, sögn/);
    expect(() =>
      load(
        `${subject}    frames:\n      - frame: Það er ___.\n        words: Tegund\n        form: ÞGF\n`
      )
    ).toThrow(/"ÞGF" is not one of as-is, agree, ÞF/);
  });

  it('throws on an agreeing word that is not in the frame', () => {
    expect(() =>
      load(`${subject}    frames:
      - frame: Það er ___.
        agree:
          Hann: NF
        words: Tegund
`)
    ).toThrow(/"Hann" is not a word in "Það er ___\."/);
  });

  it('throws on a plural that is not in the subject list', () => {
    expect(() =>
      load(`    subject:
      words: Tegund
      plural: [buxur]
    frames:
      - frame: Þetta er ___.
        blank: subject
`)
    ).toThrow(/plural: "buxur" is not in its word list/);
  });

  it('keeps the subject blank to a subject word list, with no words of its own', () => {
    expect(() =>
      load(`    subject:
      person: true
    frames:
      - frame: Þetta er ___.
        blank: subject
`)
    ).toThrow(/blank: subject needs a subject word list/);
    expect(() =>
      load(`${subject}    frames:
      - frame: Þetta er ___.
        blank: subject
        words: Tegund
`)
    ).toThrow(/the subject blank takes no words or form/);
  });

  it('throws on a fixed subject word that no frame says', () => {
    expect(() =>
      load(`    subject:
      word: hestur
    frames:
      - frame: Það er ___.
        words: Tegund
`)
    ).toThrow(/"hestur" appears in none of its frames/);
  });

  it('holds a lemmas choice to the text checks', () => {
    expect(() =>
      load(`${subject}    frames:
      - frame: Þetta er ___.
        blank: subject
    lemmas:
      sætt: ""
`)
    ).toThrow(/lemmas\.sætt must be a non-empty/);
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
examples:
  A1: Dæmi eitt.
  A2: Dæmi tvö.
  B1: Dæmi þrjú.
teacherNotes:
  A1: Athugasemd eitt.
  A2: Athugasemd tvö.
  B1: Athugasemd þrjú.
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
