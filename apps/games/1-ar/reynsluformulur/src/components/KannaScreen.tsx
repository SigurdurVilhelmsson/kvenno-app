import { Fragment, useEffect, useRef, useState } from 'react';

import { focusTarget, isPhone, revealSpan } from '@shared/utils';

import { COMPOUNDS } from '../data/problems';
import { percentComposition } from '../engine/empirical';
import { revealOnDesktop } from '../utils/desktopReveal';

/**
 * Kanna — the discovery phase. No right or wrong.
 *
 * The thing to discover is the one that makes the whole topic necessary:
 * **percent composition does not tell you how many atoms there are.** A student
 * picks a compound, sees its percentages, and sees that the element with the
 * largest share is very often not the element with the most atoms — because
 * mass and count are different questions and the molar mass is what separates
 * them.
 *
 * Formaldehyde sits in the pool deliberately: its context line says glucose
 * shares its empirical formula — identical percentages, different compounds.
 * That is the fact the Beita phase later resolves with a molar mass, where
 * glucose itself appears.
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

export function KannaScreen({ onComplete, onBack }: Props) {
  const [id, setId] = useState(COMPOUNDS[0].id);
  const compound = COMPOUNDS.find((c) => c.id === id)!;
  const pct = percentComposition(compound.counts);

  const heaviestShare = [...pct].sort((a, b) => b.percent - a.percent)[0];
  // Every element with the largest count, not the first of them: in H₂O₂ and
  // NaCl no element has the most atoms, and naming one as if it did states
  // something false about the formula in the table right above.
  const mostCount = Math.max(...compound.counts.map((c) => c.subscript));
  const mostAtoms = compound.counts.filter((c) => c.subscript === mostCount);
  const tied = mostAtoms.length > 1;
  const theyDisagree = tied || heaviestShare.element !== mostAtoms[0].element;

  // The table and the sentence that reads it sit below the list of compounds,
  // under the fold of a phone once a student has scrolled to the lower
  // buttons. Choosing a compound brings them into view. On a phone the list
  // comes with them where it fits (design §4: the list through the sentence,
  // about 540 px), so the next compound is one tap away with no scroll; where
  // it does not fit, the table and the sentence. A desktop window keeps what
  // the game's own helper did there: the table and the sentence, and nothing
  // moves when they are already on screen.
  //
  // Focus moves to the sentence, which says what the new table shows: a
  // screen reader hears the finding rather than nothing at all.
  const chipsRef = useRef<HTMLDivElement>(null);
  const readingRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const idBefore = useRef(id);
  useEffect(() => {
    if (id === idBefore.current) return;
    idBefore.current = id;
    // The table and the sentence together end at `readingRef`'s foot, which
    // is the sentence's in a column and the taller of the two side by side.
    if (isPhone()) revealSpan(readingRef.current, [chipsRef.current, tableRef.current]);
    else revealOnDesktop(tableRef.current, noteRef.current);
    focusTarget(noteRef.current);
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-6 flex items-baseline justify-between gap-3 phone:mb-3">
          <h2 className="text-xl font-bold text-warm-800 sm:text-2xl phone:min-w-0 phone:text-base">
            Kanna — massi er ekki fjöldi
          </h2>
          <button
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline pointer-coarse:-my-3 pointer-coarse:py-3"
          >
            Til baka
          </button>
        </div>

        <p className="mb-6 text-warm-700 phone:mb-3">
          Veldu efni og skoðaðu hvað efnagreining myndi mæla: hversu stór hluti massans kemur frá
          hverju frumefni. Taktu eftir hvort frumefnið sem á stærsta hlutann er líka það sem á
          flestar frumeindir.
        </p>

        <div ref={chipsRef} className="mb-6 flex flex-wrap gap-2 phone:mb-3 phone:gap-1.5">
          {COMPOUNDS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setId(c.id)}
              className={`game-btn rounded-lg border-2 px-3 py-2 text-sm pointer-coarse:min-h-11 phone:px-2.5 ${
                c.id === id
                  ? 'border-orange-400 bg-orange-50 font-semibold text-orange-900'
                  : 'border-warm-200 bg-white text-warm-700 hover:bg-warm-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* On a phone on its side the table and the sentence that reads it sit
            side by side under the list, so a compound, what it measures and
            what that shows share one screen. A plain block elsewhere, so the
            spacing is what it was. */}
        <div
          ref={readingRef}
          className="phone-land:mb-3 phone-land:grid phone-land:grid-cols-2 phone-land:items-start phone-land:gap-4"
        >
          {/* On a phone the bar goes under the percentage rather than beside
              it: beside it, the atom-count column — the one this screen is
              about — was pushed out of the box and cut off. The same holds in
              the half-width column of a phone on its side. */}
          <div
            ref={tableRef}
            className="mb-6 overflow-x-auto rounded-lg border border-warm-200 phone:mb-3 phone-land:mb-0"
          >
            <table className="w-full text-sm">
              <thead className="bg-warm-50 text-warm-700">
                <tr>
                  <th className="px-2 py-3 text-left sm:p-3 phone:px-2 phone:py-2">Frumefni</th>
                  <th className="px-1.5 py-3 text-right sm:p-3 phone:px-1.5 phone:py-2">
                    Hlutfall massa
                  </th>
                  <th className="px-1.5 py-3 text-right sm:p-3 phone:px-1.5 phone:py-2">
                    Fjöldi frumeinda
                  </th>
                </tr>
              </thead>
              <tbody>
                {pct.map((p) => {
                  const count = compound.counts.find((c) => c.element === p.element)!;
                  return (
                    <tr key={p.element} className="border-t border-warm-100">
                      <td className="px-2 py-3 font-mono font-semibold text-warm-800 sm:p-3 phone:px-2 phone:py-2">
                        {p.element}
                      </td>
                      <td className="px-1.5 py-3 text-right sm:p-3 phone:px-1.5 phone:py-2">
                        <div className="flex flex-col-reverse items-end gap-1 sm:flex-row sm:items-center sm:justify-end sm:gap-2 phone-land:flex-col-reverse phone-land:items-end phone-land:gap-1">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-warm-100 sm:w-32 phone-land:w-full">
                            <div
                              className="h-full rounded-full bg-orange-400"
                              style={{ width: `${p.percent}%` }}
                            />
                          </div>
                          <span className="whitespace-nowrap text-right font-mono sm:w-16 phone-land:w-auto">
                            {p.percent.toFixed(2).replace('.', ',')} %
                          </span>
                        </div>
                      </td>
                      <td className="px-1.5 py-3 text-right font-mono sm:p-3 phone:px-1.5 phone:py-2">
                        {count.subscript}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div
            ref={noteRef}
            className={`mb-6 rounded-lg border p-4 text-sm phone:mb-3 phone:p-3 phone-land:mb-0 ${
              theyDisagree
                ? 'border-amber-300 bg-amber-50 text-amber-900'
                : 'border-sky-200 bg-sky-50 text-sky-900'
            }`}
          >
            {theyDisagree ? (
              <p>
                <strong>{heaviestShare.element}</strong> á stærsta hlutann af massanum (
                {heaviestShare.percent.toFixed(1).replace('.', ',')} %), en{' '}
                {tied ? (
                  <>
                    {mostAtoms.map((c, i) => (
                      <Fragment key={c.element}>
                        {i > 0 && (i === mostAtoms.length - 1 ? ' og ' : ', ')}
                        <strong>{c.element}</strong>
                      </Fragment>
                    ))}{' '}
                    eiga jafnmargar frumeindir.
                  </>
                ) : (
                  <>
                    <strong>{mostAtoms[0].element}</strong> á flestar frumeindirnar ({mostCount}).
                  </>
                )}{' '}
                Prósentan segir þér ekki fjöldann — til þess þarf að deila með mólmassanum.
              </p>
            ) : (
              <p>
                Hér fer það saman: <strong>{heaviestShare.element}</strong> á bæði stærsta hlutann
                af massanum og flestar frumeindirnar. Prófaðu efni þar sem það gerir það ekki.
              </p>
            )}
          </div>
        </div>

        <p className="mb-6 text-sm text-warm-600 phone:mb-3">{compound.context}</p>

        <button
          onClick={onComplete}
          className="game-btn rounded-lg bg-kvenno-orange px-6 py-3 font-semibold text-white"
        >
          Áfram í Skilja
        </button>
      </div>
    </div>
  );
}
