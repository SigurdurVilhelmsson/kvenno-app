import { format, resolveConfig } from 'prettier';

const WARNING = `// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     content/islenskubraut/
// Regenerate: pnpm islenskubraut:build
//
// Edit the YAML, not this file. A test fails if this file drifts from it.`;

/**
 * The data types, written identically into the app and the server. Until Oct 2026 each kept
 * its own hand-written copy, under different names (`Level` and `CEFRLevel`); the server must
 * not import the Vite app, so generating both is how they stay one definition.
 */
export function renderTypes() {
  return `// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
//
// Source:     renderTypes() in scripts/islenskubraut/render.mjs
// Regenerate: pnpm islenskubraut:build
//
// The app and the server each get an identical copy of these types.

export type Level = 'A1' | 'A2' | 'B1';

export interface SubCategory {
  name: string;
  options: string[];
}

export interface SentenceFrame {
  level: Level;
  frames: string[];
}

/** One string per level: a worked example, or a note for the teacher. */
export interface LevelText {
  level: Level;
  text: string;
}

/** Which of the four coloured "Notagildi og samhengi" boxes a question is. */
export type ContextKind = 'hvar' | 'hvenaer' | 'hver' | 'notagildi';

export interface GuidingQuestionAnswer {
  level: Level;
  options: string[];
}

/**
 * A question on the card. A main question has a \`label\`, printed under it; a context
 * question has a \`context\` instead, and prints as a box in its colour. Never both.
 */
export interface GuidingQuestion {
  question: string;
  icon: string;
  label?: string;
  context?: { kind: ContextKind; color: string };
  answers: GuidingQuestionAnswer[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  subCategories: SubCategory[];
  sentenceFrames: SentenceFrame[];
  examples: LevelText[];
  teacherNotes: LevelText[];
  guidingQuestions: GuidingQuestion[];
}
`;
}

/** JSON.stringify, not hand-rolled quoting: an escaping bug is what corrupted this data. */
const literal = (value) => JSON.stringify(value, null, 2);

export function renderSpaCategory(category) {
  return `${WARNING}

import { Category } from '../types';

export const ${category.id}: Category = ${literal(category)};
`;
}

/**
 * The SPA barrel every component imports.
 *
 * Generated as of Sep 2026. It used to be hand-maintained, which made adding a
 * category a three-file edit where forgetting this file failed as a whole-tree
 * deep-equality error that never said "you forgot to register the new category".
 * The ARRAY follows CATEGORY_ORDER in load.mjs, so the taught order lives in
 * exactly one place. The IMPORTS are sorted alphabetically instead, because
 * eslint's import-x/order rule warns otherwise — the two orders differ and that
 * is deliberate, not an oversight.
 */
export function renderSpaIndex(categories) {
  const imports = [...categories]
    .sort((a, b) => a.id.localeCompare(b.id, 'en'))
    .map((c) => `import { ${c.id} } from './categories/${c.id}';`)
    .join('\n');
  const names = categories.map((c) => c.id).join(', ');
  return `${WARNING}

${imports}
import { Category } from './types';

export const categories: Category[] = [${names}];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export type {
  Category,
  ContextKind,
  GuidingQuestion,
  Level,
  LevelText,
  SubCategory,
  SentenceFrame,
} from './types';
`;
}

export function renderServerModule(categories) {
  return `${WARNING}

import type { Category } from '../types/islenskubraut.js';

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
