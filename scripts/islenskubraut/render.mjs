import { format, resolveConfig } from 'prettier';

import { CREDIT } from './myndir.mjs';

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

/** Who or what a builder sentence is about: its gender and number decide the rest. */
export type BuilderSubject =
  | { kind: 'words'; words: string; options: string[]; plural?: string[] }
  | { kind: 'word'; word: string }
  | { kind: 'person' };

/** How a word in a builder frame follows the subject. */
export interface BuilderAgreement {
  word: string;
  role: 'NF' | 'ÞF' | 'sögn';
}

export interface BuilderFrame {
  frame: string;
  agree: BuilderAgreement[];
  blank:
    | null
    | { subject: true }
    | { words: string; options: string[]; form: 'as-is' | 'agree' | 'ÞF' };
}

/** The sentence builder's tags for one level (REVIEW-QUEUE D3, C9). */
export interface Builder {
  level: Level;
  /** A teacher has checked this level's sentences; until then the card page does not link it. */
  confirmed: boolean;
  subject: BuilderSubject;
  frames: BuilderFrame[];
  /** BÍN headwords for forms BÍN reads as two words of the needed class. */
  lemmas?: Record<string, string>;
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
  builder?: Builder[];
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
 * The sentence builder's page data: every sentence already built, so the page needs neither the
 * engine nor BÍN's tables. Its word forms come from BÍN, so the file carries BÍN's terms.
 */
export function renderSmidur(entries) {
  return `${WARNING}
//
// The word forms in the sentences below come from BÍN and are released under CC BY-SA 4.0
// (https://creativecommons.org/licenses/by-sa/4.0/). Gögnin eru úr Beygingarlýsingu íslensks
// nútímamáls (BÍN) og eru í eigu Stofnunar Árna Magnússonar í íslenskum fræðum.

import type { Level } from './types';

/** One word of a built sentence; \`changed\` when it differs from the card as printed. */
export interface SmidurWord {
  word: string;
  changed: boolean;
}

/** Who or what the sentence is about, with the gender and number BÍN gives it. */
export interface SmidurSubject {
  text: string;
  gender: 'kk' | 'kvk' | 'hk';
  number: 'ET' | 'FT';
  person: boolean;
}

export interface SmidurFrame {
  frame: string;
  /** The card question whose answers fill the blank; null when the blank takes the subject. */
  question: string | null;
  /** The answers as the card prints them; null when there is nothing to pick. */
  options: string[] | null;
  /** \`sentences[subject][option]\`, with a single option slot when \`options\` is null. */
  sentences: SmidurWord[][][];
}

export interface SmidurLevel {
  level: Level;
  /** A teacher has checked these sentences (REVIEW-QUEUE C9); until then the card page does not link here. */
  confirmed: boolean;
  /** The card question the subject is picked from; null for a fixed subject or a person. */
  subjectQuestion: string | null;
  subjects: SmidurSubject[];
  frames: SmidurFrame[];
}

export const smidur: Record<string, SmidurLevel[]> = ${literal(Object.fromEntries(entries))};

export function getSmidur(categoryId: string, level: Level): SmidurLevel | undefined {
  return smidur[categoryId]?.find((s) => s.level === level);
}
`;
}

/**
 * The approved pictograms for the A1 chips, per category and chip, as ARASAAC numbers. The
 * pictures themselves are in `apps/islenskubraut/public/myndir/<id>.png`.
 */
export function renderMyndir(pictures) {
  return `${WARNING}
//
// Source of the pictures: ARASAAC (https://arasaac.org), CC BY-NC-SA 4.0. ${'`CREDIT`'} in
// scripts/islenskubraut/myndir.mjs is the wording any page showing them must carry.

/** \`myndir[categoryId][chip]\` is the ARASAAC number of an approved picture for that chip. */
export const myndir: Record<string, Record<string, number>> = ${literal(pictures)};

export const ARASAAC_CREDIT = ${JSON.stringify(CREDIT)};
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
