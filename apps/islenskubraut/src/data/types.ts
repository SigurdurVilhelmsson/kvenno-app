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

export interface GuidingQuestion {
  question: string;
  icon: string;
  answers: {
    level: Level;
    options: string[];
  }[];
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
