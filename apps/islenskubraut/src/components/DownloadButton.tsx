import { Level } from '../data/types';

interface DownloadButtonProps {
  categoryId: string;
  level: Level;
  color: string;
}

/**
 * Where a card's PDF is served. The build renders all 18 into `public/spjold/` (the `spjold`
 * script in `server/src/scripts/render-spjold.ts`, which names them the same way), so this is a
 * plain link: no backend, no loading state, nothing to fail at download time.
 */
function spjaldHref(categoryId: string, level: Level): string {
  return `${import.meta.env.BASE_URL}spjold/spjald-${categoryId}-${level}.pdf`;
}

export function DownloadButton({ categoryId, level, color }: DownloadButtonProps) {
  return (
    <a
      href={spjaldHref(categoryId, level)}
      download
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg"
      style={{ backgroundColor: color }}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <span>Hlaða niður PDF</span>
    </a>
  );
}

/**
 * The level's word list (`ordalisti-*.pdf`), rendered beside the cards at build time: the words
 * new at that level, a column for the student's own language and four review boxes.
 */
export function WordListButton({ categoryId, level, color }: DownloadButtonProps) {
  return (
    <a
      href={`${import.meta.env.BASE_URL}spjold/ordalisti-${categoryId}-${level}.pdf`}
      download
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border-2 text-warm-900 hover:bg-warm-100 transition-colors"
      style={{ borderColor: color }}
    >
      Orðalisti (PDF)
    </a>
  );
}

/**
 * "Hvað er þetta?", the level's guessing game (`giskaleikur-*.pdf`): cut-out cards describing
 * things in the card's own answer words, and a question sheet for the student who guesses.
 */
export function GameButton({ categoryId, level, color }: DownloadButtonProps) {
  return (
    <a
      href={`${import.meta.env.BASE_URL}spjold/giskaleikur-${categoryId}-${level}.pdf`}
      download
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border-2 text-warm-900 hover:bg-warm-100 transition-colors"
      style={{ borderColor: color }}
    >
      Hvað er þetta? (PDF)
    </a>
  );
}

/**
 * "Frá tali til texta", the level's talk-to-write sheet (`texti-*.pdf`): the card's frames, a model
 * text with its stages named, the same text with the card's words taken out, and lines to write on.
 */
export function TextiButton({ categoryId, level, color }: DownloadButtonProps) {
  return (
    <a
      href={`${import.meta.env.BASE_URL}spjold/texti-${categoryId}-${level}.pdf`}
      download
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border-2 text-warm-900 hover:bg-warm-100 transition-colors"
      style={{ borderColor: color }}
    >
      Frá tali til texta (PDF)
    </a>
  );
}
