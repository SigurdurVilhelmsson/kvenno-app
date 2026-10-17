import { useCallback, useEffect, useRef, useState } from 'react';

import { categories } from '../data';
import { hlustun } from '../data/hlustun';

/**
 * A teacher's review of the drafts, on the review page and its listening page: a note per item and
 * a verdict per recording. Kept in this browser, sent as a file or pasted text, and kept after
 * that until the teacher clears it; nothing reaches a server. `pnpm islenskubraut:yfirferd <file>`
 * reads the file back.
 */

/** Where the review is kept between visits, in this browser only. */
const STORAGE_KEY = 'islenskubraut-yfirferd';

/** The file's format, so the script can refuse one it does not know. */
export const FORMAT = 'islenskubraut-yfirferd/1';

export type Verdict = 'right' | 'wrong';

export interface Review {
  reviewer: string;
  /**
   * This browser's reviewer, a random id put in every file it sends, so two teachers who type the
   * same name are still two. Cleared with the review, since the next person is someone else.
   */
  id?: string;
  /** A note per item, by `categoryId/itemId`. */
  notes: Record<string, string>;
  /**
   * A verdict per recording, by its text as printed, with the version of the audio it was given
   * to (`v`, a hash) and when (`at`): a recording made again since is a different one, and needs
   * a new verdict. `null` is a verdict taken back, kept so that the file says so.
   */
  clips: Record<string, ClipVerdict>;
}

export interface ClipVerdict {
  verdict: Verdict | null;
  v: string;
  at: string;
  note?: string;
}

/** Each recording's audio as it is now, to tell a verdict on it from one on an earlier one. */
const CURRENT = new Map(hlustun.map((c) => [c.text, c.v]));

/** A verdict given, and given to the recording as it is now. */
export function isCurrent(text: string, c: ClipVerdict | undefined): c is ClipVerdict {
  return c !== undefined && c.verdict !== null && CURRENT.get(text) === c.v;
}

/** Whether a count takes the singular in Icelandic: 1, 21, 101, but not 11. */
export function one(n: number): boolean {
  return n % 10 === 1 && n % 100 !== 11;
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

/** A new reviewer's id. */
export function newId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  );
}

const empty = (): Review => ({ reviewer: '', notes: {}, clips: {} });

function load(): Review {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<Review>;
    return {
      reviewer: typeof parsed.reviewer === 'string' ? parsed.reviewer : '',
      ...(typeof parsed.id === 'string' ? { id: parsed.id } : {}),
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
      clips: parsed.clips && typeof parsed.clips === 'object' ? parsed.clips : {},
    };
  } catch {
    return empty();
  }
}

/**
 * The review, saved as it changes. If the browser refuses storage (blocked site data), it lasts
 * until the page is left, and the page says so. A private window keeps it until the window is
 * closed, which the page cannot detect, so it says that too.
 *
 * Another tab with the page open writes to the same storage, so a change there is read back here
 * (the `storage` event); otherwise whichever tab wrote last would erase what the other wrote. What
 * was read back is never written back: by then the other tab may have written again, and the echo
 * would undo its latest keystrokes.
 */
export function useReview(): {
  review: Review;
  update: (change: (r: Review) => Review) => void;
  saved: boolean;
} {
  // A review with no id yet gets one, written with the first change made here.
  const [review, setReview] = useState<Review>(() => {
    const r = load();
    return r.id ? r : { ...r, id: newId() };
  });
  const [saved, setSaved] = useState(true);
  // The newest review this tab knows, its own changes and the other tab's, for the next change to
  // build on. A change made here is written at once; one read from another tab is never written
  // back, since by then that tab may have written again and the echo would undo its keystrokes.
  const latest = useRef(review);
  useEffect(() => {
    try {
      window.localStorage.setItem(`${STORAGE_KEY}-prufa`, '1');
      window.localStorage.removeItem(`${STORAGE_KEY}-prufa`);
    } catch {
      setSaved(false);
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const read = load();
      latest.current = read.id ? read : { ...read, id: latest.current.id };
      setReview(latest.current);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const update = useCallback((change: (r: Review) => Review) => {
    const next = change(latest.current);
    latest.current = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(true);
    } catch {
      setSaved(false);
    }
    setReview(next);
  }, []);
  return { review, update, saved };
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

/** The verdicts on the recordings as they are now, and those that are not (`old`). */
function sortClips(review: Review) {
  const all = Object.entries(review.clips);
  const entries = all.filter(([, c]) => c.verdict !== null);
  return {
    right: entries.filter(([t, c]) => isCurrent(t, c) && c.verdict === 'right'),
    wrong: entries.filter(([t, c]) => isCurrent(t, c) && c.verdict === 'wrong'),
    old: entries.filter(([t, c]) => !isCurrent(t, c)),
    withdrawn: all.filter(([, c]) => c.verdict === null),
  };
}

/**
 * How much the review holds, for the page's counts: verdicts on the recordings as they are now,
 * and verdicts taken back, which are worth sending on their own to withdraw one sent before.
 */
export function counts(review: Review) {
  const { right, wrong, withdrawn } = sortClips(review);
  return {
    notes: written(review).length,
    right: right.length,
    wrong: wrong.length,
    withdrawn: withdrawn.length,
  };
}

/**
 * The file a teacher sends back, which `pnpm islenskubraut:yfirferd` reads: every verdict, taken
 * back ones as `withdrawn`, each with its audio and time, so the script can weigh them. `saved` is
 * when the file was made.
 */
export function reviewFile(review: Review, date: string, saved = date) {
  return {
    format: FORMAT,
    reviewer: review.reviewer.trim(),
    id: review.id ?? '',
    date,
    saved,
    notes: written(review).map(([key, text]) => ({
      key,
      label: itemLabel(key),
      text: text.trim(),
    })),
    clips: Object.entries(review.clips).map(([text, { verdict, v, at, note }]) => ({
      text,
      verdict: verdict ?? 'withdrawn',
      v,
      at,
      ...(verdict === 'wrong' && note?.trim() ? { note: note.trim() } : {}),
    })),
  };
}

/**
 * The same review as plain text, to paste into an email. It gives the verdicts on the recordings
 * as they are now, and names apart the ones on a recording since made again, or no longer on the
 * cards, which a reader would otherwise take for current.
 */
export function reviewText(review: Review, date: string): string {
  const file = reviewFile(review, date);
  const lines = [`Yfirferð á Íslenskubraut, ${date}${file.reviewer ? `, ${file.reviewer}` : ''}`];
  for (const n of file.notes) lines.push('', n.label, n.text);
  const { right, wrong, old, withdrawn } = sortClips(review);
  const q = (entries: [string, ClipVerdict][]) => entries.map(([t]) => `„${t}“`).join(', ');
  if (right.length + wrong.length > 0) {
    const r = right.length;
    const w = wrong.length;
    lines.push(
      '',
      `Upptökur: ${r} ${one(r) ? 'rétt' : 'réttar'}, ${w} ${one(w) ? 'röng' : 'rangar'}`
    );
    for (const [t, c] of wrong) {
      const note = c.note?.trim();
      lines.push(`Röng: „${t}“${note ? ` — ${note}` : ''}`);
    }
    if (right.length > 0) lines.push(`Réttar: ${q(right)}`);
  }
  if (withdrawn.length > 0) lines.push('', `Dregið til baka: ${q(withdrawn)}`);
  if (old.length > 0) {
    lines.push(
      '',
      `Metnar áður en upptakan var gerð aftur, eða ekki lengur á spjöldunum: ${q(old)}`
    );
  }
  return `${lines.join('\n')}\n`;
}

/**
 * The download's name: the date, the reviewer and the start of this browser's id, so two
 * reviewers' files never share one, two teachers of one name included. A later file from the same
 * browser may replace an earlier one, which is harmless: it holds everything the earlier one did.
 */
export function fileName(review: Review, stamp: string): string {
  const who =
    review.reviewer
      .trim()
      .toLocaleLowerCase('is')
      .replace(/þ/g, 'th')
      .replace(/ð/g, 'd')
      .replace(/æ/g, 'ae')
      .replace(/ö/g, 'o')
      .replace(/ø/g, 'o')
      .replace(/ł/g, 'l')
      .replace(/ß/g, 'ss')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || stamp.slice(11, 19).replace(/:/g, '');
  const tag = (review.id ?? '')
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 6)
    .toLowerCase();
  return `yfirferd-islenskubraut-${stamp.slice(0, 10)}-${who}${tag ? `-${tag}` : ''}.json`;
}

/** Now, as the file's `saved` stamp: 2026-10-17T10:00:00.000Z. */
export function now(): string {
  return new Date().toISOString();
}

/** Today's date as the file's name and heading use it: 2026-10-17. */
export function today(): string {
  return now().slice(0, 10);
}
