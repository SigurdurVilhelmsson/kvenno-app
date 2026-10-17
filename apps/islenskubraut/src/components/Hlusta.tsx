import { createContext, useContext } from 'react';

import { HLJOD_VOICE, hljod } from '../data/hljod';

/**
 * Whether draft recordings play too: on the card page opened with `?drog` (`SpjaldPage`), and on
 * the teachers' listening page (`YfirferdHljod`). Anywhere else only approved recordings play.
 */
export const DrogContext = createContext(false);

/** The recording of a text as printed, if it may play here: approved, or a draft under `?drog`. */
export function useClip(text: string): string | undefined {
  const drafts = useContext(DrogContext);
  const clip = hljod[text];
  if (!clip || !(clip.approved || drafts)) return undefined;
  return `${import.meta.env.BASE_URL}hljod/${clip.file}`;
}

/** Whether any of these texts has a recording that may play here, for the credit line. */
export function useAnyClip(texts: string[]): boolean {
  const drafts = useContext(DrogContext);
  return texts.some((t) => hljod[t] && (hljod[t].approved || drafts));
}

// One recording at a time: a second tap stops the first rather than talking over it.
let playing: HTMLAudioElement | null = null;

function play(src: string) {
  playing?.pause();
  playing = new Audio(src);
  void playing.play().catch(() => {
    /* a browser that refuses autoplay-like playback leaves the button as it was */
  });
}

/**
 * A small play button for a text on the card. Renders nothing for a text with no recording,
 * so the card looks as printed until a person has approved one.
 */
export function Hlusta({ text, color }: { text: string; color: string }) {
  const src = useClip(text);
  if (!src) return null;
  return (
    <button
      type="button"
      onClick={() => play(src)}
      aria-label={`Hlusta: ${text}`}
      title="Hlusta"
      className="inline-flex items-center justify-center w-6 h-6 rounded-full shrink-0 align-middle hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{ color }}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.48 4.48 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z" />
      </svg>
    </button>
  );
}

/** The voice's licence asks for this wherever its recordings play. */
export function HljodCredit({ className = '' }: { className?: string }) {
  return <p className={`text-xs text-warm-600 ${className}`}>Upptökur: {HLJOD_VOICE}.</p>;
}
