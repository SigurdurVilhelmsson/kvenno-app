import { dyr } from './categories/dyr';
import { farartaeki } from './categories/farartaeki';
import { klaednadur } from './categories/klaednadur';
import { manneskja } from './categories/manneskja';
import { matur } from './categories/matur';
import { stadir } from './categories/stadir';
import { Category } from './types';

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
