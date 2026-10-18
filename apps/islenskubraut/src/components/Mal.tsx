import { createContext, useContext, useEffect, useState } from 'react';

import { glossur, type Glossur } from '../data/glossur';

/**
 * "Á þínu máli" (docs/research/islenskubraut-additions/, item 8): a student picks their own language
 * and each word on the card shows its gloss, or a link to look it up, beside it. Only a language a
 * speaker has approved is offered, except under `?drog` (REVIEW-QUEUE C18).
 */

const STORAGE_KEY = 'islenskubraut-mal';

/** The language picked on the card page, or null for Icelandic alone. */
export const MalContext = createContext<Glossur | null>(null);

/** The languages this page may offer: the approved ones, or all of them under `?drog`. */
export function languagesFor(drafts: boolean): Glossur[] {
  return glossur.filter((g) => g.approved || drafts);
}

function remembered(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * The picked language, remembered in this browser only. A remembered language no longer offered
 * (a draft outside `?drog`) is ignored, not shown.
 */
export function useMal(drafts: boolean): [Glossur | null, (code: string) => void] {
  const offered = languagesFor(drafts);
  const [code, setCode] = useState<string | null>(remembered);
  useEffect(() => {
    try {
      if (code) window.localStorage.setItem(STORAGE_KEY, code);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* private window or blocked storage: the choice lasts until the page is left */
    }
  }, [code]);
  return [offered.find((g) => g.code === code) ?? null, (c) => setCode(c || null)];
}

/** The picker, shown only when some language is offered. */
export function MalPicker({
  drafts,
  value,
  onChange,
}: {
  drafts: boolean;
  value: Glossur | null;
  onChange: (code: string) => void;
}) {
  const offered = languagesFor(drafts);
  if (offered.length === 0) return null;
  return (
    <label className="inline-flex items-center gap-2 text-sm text-warm-700">
      Á þínu máli
      <select
        value={value?.code ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-warm-300 bg-surface-raised px-2 py-1 text-warm-900 pointer-coarse:min-h-11"
      >
        <option value="">Bara íslenska</option>
        {offered.map((g) => (
          <option key={g.code} value={g.code} lang={g.code}>
            {g.name}
            {g.approved ? '' : ' (drög)'}
          </option>
        ))}
      </select>
    </label>
  );
}

/** The word to look a chip up by: its last word, as a dictionary finds `feld` under `feldur`. */
export function lookupWord(chip: string): string {
  return chip.split('/')[0].trim().split(/\s+/).at(-1) ?? chip;
}

/**
 * A chip's gloss in the picked language, and its dictionary link, under the chip's word. `question`
 * is the question's label (`Lykt`) or its box's kind (`hvar`): a chip that means something else
 * under one question of the card has a gloss of its own there.
 */
export function Glossa({
  categoryId,
  question,
  text,
}: {
  categoryId: string;
  question?: string;
  text: string;
}) {
  const mal = useContext(MalContext);
  if (!mal) return null;
  const gloss =
    (question ? mal.questions?.[categoryId]?.[question]?.[text] : undefined) ??
    mal.words[categoryId]?.[text];
  if (!gloss && !mal.dictionary) return null;
  const href = mal.dictionary?.replace('{word}', encodeURIComponent(lookupWord(text)));
  return (
    <span lang={mal.code} dir={mal.dir} className="block text-[0.7rem] font-normal text-warm-700">
      {gloss}
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          lang="is"
          aria-label={`Orðabók: ${text}`}
          className="ml-1 underline hover:text-warm-900"
        >
          ↗
        </a>
      )}
    </span>
  );
}
