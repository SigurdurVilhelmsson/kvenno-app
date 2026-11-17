import { useCallback, useState, type ReactNode } from 'react';

export interface MenuProgressProps {
  /** What is done, e.g. `2 af 3 stigum lokið`. Shown after "Framvinda:". */
  children: ReactNode;
  /** Wipes the game's saved progress. Asked for twice, so one stray tap cannot. */
  onReset: () => void;
  className?: string;
}

/**
 * The progress line under a game's menu cards, as pH Títrun draws it, with its
 * two-step Endurstilla. Every Year-3 game uses it, so starting over works the same
 * everywhere: some reset on one tap, one opened a browser dialog, three had no way.
 */
export function MenuProgress({ children, onReset, className = 'mt-8' }: MenuProgressProps) {
  const [confirming, setConfirming] = useState(false);
  // The confirm step replaces the button that had focus, so focus moves to its
  // safe choice rather than falling to <body>.
  const focusOnMount = useCallback((el: HTMLButtonElement | null) => el?.focus(), []);
  return (
    <div
      className={`${className} bg-warm-50 p-4 phone:p-3 rounded-xl flex flex-wrap justify-between items-center gap-3`}
    >
      <div className="text-warm-700">
        <span className="font-semibold">Framvinda:</span> {children}
      </div>
      {confirming ? (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-warm-700">Eyða framvindu?</span>
          <button
            type="button"
            onClick={() => {
              onReset();
              setConfirming(false);
            }}
            className="font-semibold text-red-600 hover:text-red-700 pointer-coarse:py-3 pointer-coarse:-my-3"
          >
            Já, endurstilla
          </button>
          <button
            type="button"
            ref={focusOnMount}
            onClick={() => setConfirming(false)}
            className="text-warm-600 hover:text-warm-800 pointer-coarse:py-3 pointer-coarse:-my-3"
          >
            Hætta við
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-sm text-warm-500 hover:text-red-500 transition-colors pointer-coarse:py-3 pointer-coarse:-my-3"
        >
          Endurstilla
        </button>
      )}
    </div>
  );
}
