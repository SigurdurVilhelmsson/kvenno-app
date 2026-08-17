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
