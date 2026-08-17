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
