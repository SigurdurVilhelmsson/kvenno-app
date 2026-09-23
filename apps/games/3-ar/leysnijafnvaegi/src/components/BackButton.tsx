/**
 * The "Til baka" link in each phase's heading row.
 *
 * On a phone the heading takes most of the row, and the two words used to wrap
 * onto two lines of their own, 34 px wide. Kept on one line, and on a touch
 * screen given a 44 px tall target with equal negative margins, so the row and
 * the desktop look do not move.
 */
export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline pointer-coarse:-my-3 pointer-coarse:py-3"
    >
      Til baka
    </button>
  );
}
