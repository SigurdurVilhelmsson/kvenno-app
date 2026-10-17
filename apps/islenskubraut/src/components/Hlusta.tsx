import { createContext, useContext } from 'react';

import { HLJOD_VOICE, hljod } from '../data/hljod';

/**
 * Whether draft recordings play too: on the card page opened with `?drog` (`SpjaldPage`), and on
 * the teachers' listening page (`YfirferdHljod`). Anywhere else only approved recordings play.
 */
export const DrogContext = createContext(false);

/**
 * The recording of a text as printed, if it may play here: approved, or a draft under `?drog`.
 * Its address carries the version of its audio (`?v=`), so a browser fetches a recording made
 * again rather than replaying the copy it kept (Firefox does, for a while after a reload, whatever
 * the server's `Cache-Control` says).
 */
export function useClip(text: string): string | undefined {
  const drafts = useContext(DrogContext);
  const clip = hljod[text];
  if (!clip || !(clip.approved || drafts)) return undefined;
  return `${import.meta.env.BASE_URL}hljod/${clip.file}${clip.v ? `?v=${clip.v}` : ''}`;
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
  void playing.play()?.catch(() => {
    /* a browser that refuses autoplay-like playback leaves the button as it was */
  });
}

/**
 * The version of the recording the server has now, as `clipVersion` in
 * `scripts/islenskubraut/hljod.mjs` computes it (the first 12 hex digits of its SHA-256), or
 * undefined where the browser cannot tell: no network, or no `crypto.subtle` off https.
 */
export async function versionOf(src: string): Promise<string | undefined> {
  try {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) return undefined;
    const response = await fetch(src, { cache: 'no-cache' });
    if (!response.ok) return undefined;
    const digest = await subtle.digest('SHA-256', await response.arrayBuffer());
    return [...new Uint8Array(digest)]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 12);
  } catch {
    return undefined;
  }
}

/**
 * A small play button for a text on the card. Renders nothing for a text with no recording,
 * so the card looks as printed until a person has approved one. `onHeard`, on the listening
 * page, is told the version the server holds at the clip's address, which a page left open since
 * before a recording was made again knows by an older one.
 */
export function Hlusta({
  text,
  color,
  onHeard,
}: {
  text: string;
  color: string;
  onHeard?: (version: string) => void;
}) {
  const src = useClip(text);
  if (!src) return null;
  return (
    <button
      type="button"
      onClick={() => {
        play(src);
        if (onHeard) void versionOf(src).then((v) => v && onHeard(v));
      }}
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
