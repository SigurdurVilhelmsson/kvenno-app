// AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
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
 * A question on the card. A main question has a `label`, printed under it; a context
 * question has a `context` instead, and prints as a box in its colour. Never both.
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
    null | { subject: true } | { words: string; options: string[]; form: 'as-is' | 'agree' | 'ÞF' };
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
