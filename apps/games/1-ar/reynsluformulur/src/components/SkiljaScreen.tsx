import { useEffect, useRef, useState } from 'react';

import { focusTarget, isPhone, revealInline, revealSpan, useArmedAfter } from '@shared/utils';

import { PROBLEMS } from '../data/problems';
import { deriveEmpirical } from '../engine/empirical';
import { revealOnDesktop } from '../utils/desktopReveal';

/**
 * Skilja — the method, worked one column at a time on a real compound.
 *
 * The four columns are revealed in order rather than all at once, because the
 * step that matters is the last one and a student who sees the finished table
 * reads the answer instead of the method.
 *
 * Járn(III)oxíð is the worked example on purpose: its ratios come out 1 : 1,5,
 * which is exactly the case the February review recorded students getting wrong
 * — _"Students frequently round 1.5 to 2"_. Teaching the method on a compound
 * where every ratio is already whole would hide the only hard part.
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

const WORKED_ID = 'jarnoxid';

const COLUMNS = [
  {
    key: 'percent',
    label: 'Prósenta',
    caption: 'Taktu 100 g sýni. Þá er hvert prósent einfaldlega grömm.',
  },
  {
    key: 'moles',
    label: 'Mól',
    caption: 'Deildu massanum með mólmassa frumefnisins. Nú ertu kominn með fjölda, ekki massa.',
  },
  {
    key: 'ratio',
    label: 'Hlutfall',
    caption: 'Deildu öllum mólfjöldunum með þeim minnsta. Minnsta talan verður 1.',
  },
  {
    key: 'subscript',
    label: 'Vísitala',
    caption: 'Margfaldaðu upp þangað til allar tölurnar eru heilar. Þetta er skrefið sem klikkar.',
  },
] as const;

const fmt = (n: number, dp: number) => n.toFixed(dp).replace('.', ',');

/**
 * The element column, pinned while the table scrolls sideways on a phone. The
 * inset shadow is its right-hand edge, which is what shows that the table
 * continues under it. From `sm` up the table fits and the column is ordinary.
 */
const PINNED =
  'sticky left-0 z-10 shadow-[inset_-1px_0_0_var(--color-warm-200)] sm:static sm:shadow-none';

/** Table rows one step shorter on a phone, as a portrait and as on its side. */
const ROW = 'phone:py-2';

export function SkiljaScreen({ onComplete, onBack }: Props) {
  const [shown, setShown] = useState(1);
  const problem = PROBLEMS.find((p) => p.id === WORKED_ID)!;
  const derived = deriveEmpirical(
    Object.fromEntries(problem.percentages.map((p) => [p.element, p.percent]))
  );

  // "Næsta súla" adds a column to the table above the button. On a phone the
  // table is wider than the screen from the third column on, so it scrolls
  // sideways to the column just added, at any width, as it always has. On a
  // phone the page then shows the new step whole — the table, its caption,
  // any note under it — down to the button, or from the caption when that
  // is all that fits (design §3: a pager keeps its Næsta at the foot of what it
  // opened). A desktop window keeps what the game's own helper did there: the
  // table brought into view when it is not.
  //
  // Focus moves to the caption, which says what the new column is; the next
  // Tab reaches the button again.
  const tableRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const shownBefore = useRef(shown);
  useEffect(() => {
    if (shown === shownBefore.current) return;
    const added = shown > shownBefore.current;
    shownBefore.current = shown;
    if (isPhone()) revealSpan(buttonsRef.current, [tableRef.current, captionRef.current]);
    else revealOnDesktop(tableRef.current);
    if (added) {
      revealInline(tableRef.current?.querySelector('thead th:last-child'), {
        inline: 'end',
        anyWidth: true,
      });
    }
    focusTarget(captionRef.current);
  }, [shown]);
  // A double tap on "Næsta súla" must not skip the column it has just opened,
  // nor press "Áfram í Æfa", which takes its place after the last one.
  const armed = useArmedAfter(400, shown);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-6 flex items-baseline justify-between gap-3 phone:mb-3">
          <h2 className="text-xl font-bold text-warm-800 sm:text-2xl phone:min-w-0 phone:text-base">
            Skilja — fjórar súlur
          </h2>
          <button
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline pointer-coarse:-my-3 pointer-coarse:py-3"
          >
            Til baka
          </button>
        </div>

        <p className="mb-6 text-warm-700 phone:mb-3">
          Efnagreining á ryði gefur{' '}
          {problem.percentages.map((p, i) => (
            <span key={p.element}>
              {i > 0 && ' og '}
              <span className="whitespace-nowrap">{`${p.element} ${fmt(p.percent, 2)} %`}</span>
            </span>
          ))}
          . Leiðin að formúlunni er alltaf sama taflan.
        </p>

        {/* Five columns do not fit a phone, and there is no narrower way to
            write them, so the table scrolls sideways inside its box. The
            element column stays pinned on the left below `sm`, so the numbers
            scrolled into view never lose the element they belong to. */}
        <div
          ref={tableRef}
          className="mb-4 overflow-x-auto rounded-lg border border-warm-200 phone:mb-3"
        >
          <table className="w-full text-sm">
            <thead className="bg-warm-50 text-warm-700">
              <tr>
                <th className={`${PINNED} bg-warm-50 px-2 py-3 text-left sm:p-3 ${ROW}`}>
                  Frumefni
                </th>
                {COLUMNS.slice(0, shown).map((c) => (
                  <th key={c.key} className={`px-1.5 py-3 text-right sm:p-3 ${ROW}`}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {derived.rows.map((r) => (
                <tr key={r.element} className="border-t border-warm-100">
                  <td
                    className={`${PINNED} bg-white px-2 py-3 font-mono font-semibold text-warm-800 sm:p-3 ${ROW}`}
                  >
                    {r.element}
                  </td>
                  {shown >= 1 && (
                    <td
                      className={`whitespace-nowrap px-1.5 py-3 text-right font-mono sm:p-3 ${ROW}`}
                    >
                      {fmt(r.percent, 2)} g
                    </td>
                  )}
                  {shown >= 2 && (
                    <td className={`px-1.5 py-3 text-right font-mono sm:p-3 ${ROW}`}>
                      {fmt(r.moles, 3)}
                    </td>
                  )}
                  {shown >= 3 && (
                    <td
                      className={`whitespace-nowrap px-1.5 py-3 text-right font-mono sm:p-3 ${ROW}`}
                    >
                      {fmt(r.ratio, 2)}
                      {Math.abs(r.ratio - 1.5) < 0.05 && (
                        <span className="ml-1 text-amber-600">←</span>
                      )}
                    </td>
                  )}
                  {shown >= 4 && (
                    <td
                      className={`px-1.5 py-3 text-right font-mono font-bold text-orange-700 sm:p-3 ${ROW}`}
                    >
                      {r.subscript}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p ref={captionRef} className="mb-6 text-sm text-warm-600 phone:mb-3">
          {COLUMNS[shown - 1].caption}
        </p>

        {shown === 3 && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 phone:mb-3 phone:p-3">
            <p className="mb-1 font-semibold">Hér tapa flestir dæminu</p>
            <p>
              Hlutfallið fyrir O er <strong>1,50</strong>. Það er ekki 2 sem búið er að mæla
              ónákvæmt — það er nákvæmlega helmingur. Formúla getur ekki haft hálfa frumeind, svo
              svarið er að <strong>margfalda allt með 2</strong>, ekki að námunda.
            </p>
          </div>
        )}

        {shown === 4 && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 phone:mb-3 phone:p-3">
            <p>
              Margfaldað með <strong>{derived.multiplier}</strong>: 1 → {derived.rows[0].subscript}{' '}
              og 1,5 → {derived.rows[1].subscript}. Reynsluformúlan er{' '}
              <strong className="font-mono text-base">{derived.formula}</strong>.
            </p>
            <p className="mt-2">
              Hefðirðu námundað 1,5 upp í 2 hefðirðu fengið FeO₂ — efni sem er ekki til.
            </p>
          </div>
        )}

        <div ref={buttonsRef} className="flex flex-wrap gap-3">
          {/* Two elements, not one relabelled: "Áfram í Æfa" is a new button
              under the finger, and the guard drops a second tap on it. */}
          {shown < COLUMNS.length ? (
            <button
              key="next"
              onClick={armed(() => setShown(shown + 1))}
              className="game-btn rounded-lg bg-kvenno-orange px-6 py-3 font-semibold text-white"
            >
              Næsta súla
            </button>
          ) : (
            <button
              key="onward"
              onClick={armed(onComplete)}
              className="game-btn rounded-lg bg-kvenno-orange px-6 py-3 font-semibold text-white"
            >
              Áfram í Æfa
            </button>
          )}
          {shown > 1 && (
            <button
              onClick={() => setShown(shown - 1)}
              className="game-btn rounded-lg border border-warm-300 px-5 py-3 text-warm-700"
            >
              Fyrri súla
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
