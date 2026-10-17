/**
 * What playing each recording on the listening page found (`YfirferdHljod.tsx`): the audio the
 * server holds at its address and when that was learnt, and whether a play's check is still out.
 * Kept outside the page, for as long as its code is loaded, so leaving the page within the app
 * and coming back does not forget that a recording was found remade: only a reload does.
 */
export type Heard = { v?: string; at?: string; checking?: boolean };

let state: Record<string, Heard> = {};
const listeners = new Set<() => void>();
// Each play of a text is numbered, and only the latest one's check counts.
const latest = new Map<string, number>();

export const heardStore = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

function set(text: string, next: Heard) {
  state = { ...state, [text]: next };
  for (const l of listeners) l();
}

/**
 * A play of `text` begins: its row waits for the check. Returns what to call with the version the
 * server holds (`undefined` where the browser could not tell), which counts only if no later play
 * of the text has begun since; one that could not tell leaves what an earlier check found.
 */
export function beginPlay(text: string, now: () => string) {
  const n = (latest.get(text) ?? 0) + 1;
  latest.set(text, n);
  set(text, { ...state[text], checking: true });
  return (version: string | undefined) => {
    if (latest.get(text) !== n) return;
    set(
      text,
      version === undefined
        ? { ...state[text], checking: false }
        : { v: version, at: now(), checking: false }
    );
  };
}

/** Forget everything, as a reload does. For tests. */
export function forgetHeard() {
  state = {};
  latest.clear();
  for (const l of listeners) l();
}
