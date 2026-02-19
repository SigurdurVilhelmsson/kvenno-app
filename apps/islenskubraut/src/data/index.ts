import { Category } from './types';
import { dyr } from './categories/dyr';
import { matur } from './categories/matur';
import { farartaeki } from './categories/farartaeki';
import { manneskja } from './categories/manneskja';
import { stadir } from './categories/stadir';
import { klaednadur } from './categories/klaednadur';

export const categories: Category[] = [
  dyr,
  matur,
  farartaeki,
  manneskja,
  stadir,
  klaednadur,
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export type { Category, Level, SubCategory, SentenceFrame, GuidingQuestion } from './types';
