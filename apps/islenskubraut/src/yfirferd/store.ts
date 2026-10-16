import { useEffect, useState } from 'react';

import { categories } from '../data';

/**
 * A teacher's review of the drafts, on the review page and its listening page: a note per item and
 * a verdict per recording. Kept in this browser until the teacher sends it as a file or pasted text; nothing
 * reaches a server. `pnpm islenskubraut:yfirferd <file>` reads the file back.
 */

/** Where the review is kept between visits, in this browser only. */
const STORAGE_KEY = 'islenskubraut-yfirferd';

/** The file's format, so the script can refuse one it does not know. */
export const FORMAT = 'islenskubraut-yfirferd/1';

export type Verdict = 'right' | 'wrong';

export interface Review {
  reviewer: string;
  /** A note per item, by `categoryId/itemId`. */
  notes: Record<string, string>;
  /** A verdict per recording, by its text as printed. */
  clips: Record<string, { verdict: Verdict; note?: string }>;
}

/** The items a teacher reviews on each card, in the order the review page lists them. */
export const ITEMS = [
  { id: 'spjald', name: 'Spjaldið' },
  { id: 'ordalisti', name: 'Orðalisti' },
  { id: 'giskaleikur', name: 'Hvað er þetta?' },
  { id: 'texti', name: 'Frá tali til texta' },
  { id: 'egget', name: 'Ég get…' },
  { id: 'smidur', name: 'Setningasmiður' },
  { id: 'hljod', name: 'Upptökur' },
  { id: 'tenglar', name: 'Fleiri úrræði' },
  { id: 'glossur', name: 'Á þínu máli' },
] as const;

export type ItemId = (typeof ITEMS)[number]['id'];

const empty = (): Review => ({ reviewer: '', notes: {}, clips: {} });

function load(): Review {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<Review>;
    return {
      reviewer: typeof parsed.reviewer === 'string' ? parsed.reviewer : '',
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
      clips: parsed.clips && typeof parsed.clips === 'object' ? parsed.clips : {},
    };
  } catch {
    return empty();
  }
}

/**
 * The review, saved as it changes. If the browser keeps no storage (a private window, blocked
 * site data), it lasts until the page is left, and the page says so.
 */
export function useReview(): {
  review: Review;
  update: (change: (r: Review) => Review) => void;
  saved: boolean;
} {
  const [review, setReview] = useState<Review>(load);
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(review));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [review]);
  return { review, update: (change) => setReview((r) => change(r)), saved };
}

/** An item's name with its card's: `Dýr — Hvað er þetta?`. */
export function itemLabel(key: string): string {
  const [categoryId, itemId] = key.split('/');
  const category = categories.find((c) => c.id === categoryId);
  const item = ITEMS.find((i) => i.id === itemId);
  return `${category?.name ?? categoryId} — ${item?.name ?? itemId}`;
}

const written = (review: Review) =>
  Object.entries(review.notes).filter(([, text]) => text.trim() !== '');

/** How much the review holds, for the page's counts. */
export function counts(review: Review) {
  const verdicts = Object.values(review.clips);
  return {
    notes: written(review).length,
    right: verdicts.filter((v) => v.verdict === 'right').length,
    wrong: verdicts.filter((v) => v.verdict === 'wrong').length,
  };
}

/** The file a teacher sends back, which `pnpm islenskubraut:yfirferd` reads. */
export function reviewFile(review: Review, date: string) {
  return {
    format: FORMAT,
    reviewer: review.reviewer.trim(),
    date,
    notes: written(review).map(([key, text]) => ({
      key,
      label: itemLabel(key),
      text: text.trim(),
    })),
    clips: Object.entries(review.clips).map(([text, { verdict, note }]) => ({
      text,
      verdict,
      ...(note?.trim() ? { note: note.trim() } : {}),
    })),
  };
}

/** The same review as plain text, to paste into an email. */
export function reviewText(review: Review, date: string): string {
  const file = reviewFile(review, date);
  const lines = [`Yfirferð á Íslenskubraut, ${date}${file.reviewer ? `, ${file.reviewer}` : ''}`];
  for (const n of file.notes) lines.push('', n.label, n.text);
  const wrong = file.clips.filter((c) => c.verdict === 'wrong');
  const right = file.clips.filter((c) => c.verdict === 'right');
  if (file.clips.length > 0) {
    lines.push('', `Upptökur: ${right.length} réttar, ${wrong.length} rangar`);
    for (const c of wrong) lines.push(`Röng: „${c.text}“${c.note ? ` — ${c.note}` : ''}`);
    if (right.length > 0) lines.push(`Réttar: ${right.map((c) => `„${c.text}“`).join(', ')}`);
  }
  return `${lines.join('\n')}\n`;
}

/** Today's date as the file's name and heading use it: 2026-10-17. */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
