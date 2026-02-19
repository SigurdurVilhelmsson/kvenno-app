export type Level = 'A1' | 'A2' | 'B1';

export interface SubCategory {
  name: string;
  options: string[];
}

export interface SentenceFrame {
  level: Level;
  frames: string[];
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
  guidingQuestions: GuidingQuestion[];
}
