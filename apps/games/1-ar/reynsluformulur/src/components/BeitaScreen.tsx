import { useEffect, useRef, useState } from 'react';

import {
  DECIMAL_INPUT_PROPS,
  isPhone,
  parseStudentNumber,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
} from '@shared/utils';

import { MOLECULAR_PROBLEMS } from '../data/problems';
import { formatFormula } from '../engine/empirical';
import { revealOnDesktop } from '../utils/desktopReveal';

/**
 * Beita — empirical formula plus a measured molar mass gives the molecular one.
 *
 * The phase exists because the empirical formula is not the answer to "what is
 * this substance". CH₂O is formaldehyde, acetic acid, glucose and half a dozen
 * sugars; the molar mass is what chooses between them. Glucose is in the set
 * for exactly that reason — the student has already derived CH₂O in Æfa from
 * formaldehyde's percentages, and meets the same formula again here attached to
 * a different compound.
 *
 * The student enters `n` rather than the formula, so the grader is comparing a
 * number and can say whether the division went wrong or the scaling did. The
 * formula is then shown built from their own `n`.
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

const fmt = (n: number, dp: number) => n.toFixed(dp).replace('.', ',');

export function BeitaScreen({ onComplete, onBack }: Props) {
  const [index, setIndex] = useState(0);
  const [entry, setEntry] = useState('');
  const [answered, setAnswered] = useState(false);

  const problem = MOLECULAR_PROBLEMS[index];
  const given = parseStudentNumber(entry);
  const correct = answered && Math.abs(given - problem.n) < 0.01;

  // Only a whole n builds a formula whose mass can be set against the measured
  // one. A fractional n builds none: rounding each subscript on its own can
  // land back on the right formula — 1,5 on HO rounds to H₂O₂ at exactly the
  // measured mass — which the line below would then call wrong. A safe integer,
  // not merely an integer: `1e21` parses as a whole number, but it prints in
  // exponent form, which the subscript writer turns into "undefined".
  const givenWhole = Number.isSafeInteger(given) && given >= 1;

  const counterRef = useRef<HTMLParagraphElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const inputRowRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLParagraphElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // "Næsta dæmi" swaps in a new problem at the top of a card the student has
  // scrolled past. On a phone the card's top comes back under the header, and
  // focus moves to the new problem at every width.
  const cardRef = useItemTop<HTMLDivElement>(index);

  // "Svara" puts the verdict under the input, below the fold of a landscape
  // phone. On a phone, the most that fits of problem → answer → feedback →
  // "Næsta dæmi"; where the explanation is long, the verdict at the top, read
  // down to the button. Focus moves to the feedback, not to the button
  // (design P3). "Svara" and "Næsta dæmi" are separate buttons, and a double
  // tap cannot press the second.
  useRevealAfterCommit(answered, () => ({
    bottom: nextRef.current,
    tops: [problemRef.current, inputRowRef.current, feedbackRef.current, verdictRef.current],
    focus: feedbackRef.current,
  }));

  // A desktop window keeps what the game's own helper did there, at any
  // width: the feedback and the button after "Svara", the problem and its
  // input after "Næsta dæmi", each brought into view when it is not.
  const indexBefore = useRef(index);
  useEffect(() => {
    if (!isPhone()) {
      if (answered) revealOnDesktop(feedbackRef.current, nextRef.current);
      else if (index !== indexBefore.current) {
        revealOnDesktop(counterRef.current, inputRowRef.current);
      }
    }
    indexBefore.current = index;
  }, [answered, index]);

  const armed = useArmedAfter(400, `${index}:${answered}`);

  const submit = () => {
    if (answered || entry.trim() === '') return;
    setAnswered(true);
  };

  const next = () => {
    setEntry('');
    setAnswered(false);
    if (index + 1 < MOLECULAR_PROBLEMS.length) setIndex(index + 1);
    else onComplete();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div ref={cardRef} className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-4 flex items-baseline justify-between gap-3 phone:mb-2">
          <h2 className="text-xl font-bold text-warm-800 sm:text-2xl phone:min-w-0 phone:text-base">
            Beita — frá reynslu að sameind
          </h2>
          <button
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline pointer-coarse:-my-3 pointer-coarse:py-3"
          >
            Til baka
          </button>
        </div>

        <p ref={counterRef} className="mb-4 text-sm text-warm-500 phone:mb-2">
          Dæmi {index + 1} af {MOLECULAR_PROBLEMS.length}
        </p>

        <div
          ref={problemRef}
          data-item-start
          className="mb-6 rounded-lg bg-warm-50 p-4 phone:mb-3 phone:p-3"
        >
          <p className="text-warm-800">
            Reynsluformúla efnisins er{' '}
            <strong className="font-mono text-lg">{formatFormula(problem.empirical)}</strong>, og
            mældur mólmassi þess er{' '}
            <strong className="whitespace-nowrap font-mono text-lg">
              {fmt(problem.molarMass, 2)} g/mól
            </strong>
            .
          </p>
          <p className="mt-2 text-sm text-warm-600">
            Hversu mörgum sinnum passar reynsluformúlan inn í sameindina? Þessi tala heitir{' '}
            <em>n</em>.
          </p>
        </div>

        <div ref={inputRowRef} className="mb-4 flex flex-wrap items-center gap-3 phone:mb-3">
          <label htmlFor="n-input" className="font-semibold text-warm-700">
            n =
          </label>
          <input
            {...DECIMAL_INPUT_PROPS}
            id="n-input"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
            enterKeyHint="done"
            disabled={answered}
            autoComplete="off"
            className="w-28 rounded-lg border-2 border-warm-300 px-3 py-2 text-lg"
          />
          {!answered && (
            <button
              key="svara"
              onClick={submit}
              disabled={entry.trim() === ''}
              className="game-btn rounded-lg bg-kvenno-orange px-5 py-2 font-semibold text-white disabled:opacity-40 pointer-coarse:min-h-11"
            >
              Svara
            </button>
          )}
        </div>

        {answered && (
          <div
            ref={feedbackRef}
            role="group"
            aria-labelledby="beita-verdict"
            className={`mb-4 rounded-lg border p-4 text-sm phone:mb-3 phone:p-3 ${
              correct
                ? 'border-green-200 bg-green-50 text-green-900'
                : 'border-amber-300 bg-amber-50 text-amber-900'
            }`}
          >
            <p ref={verdictRef} id="beita-verdict" className="mb-1 font-semibold">
              {correct ? 'Rétt' : 'Ekki alveg'}
            </p>
            <p>
              Massi reynsluformúlunnar er{' '}
              <span className="whitespace-nowrap">{fmt(problem.empiricalMass, 2)} g/mól</span>. n ={' '}
              {fmt(problem.molarMass, 2)} ÷ {fmt(problem.empiricalMass, 2)} ={' '}
              <strong>{problem.n}</strong>.
            </p>
            <p className="mt-2">
              Sameindaformúlan er <strong className="font-mono text-base">{problem.answer}</strong>.
            </p>
            {!correct && givenWhole && (
              <p className="mt-2">
                Þitt n gaf{' '}
                <span className="font-mono">
                  {formatFormula(
                    problem.empirical.map((e) => ({ ...e, subscript: e.subscript * given }))
                  )}
                </span>
                , sem hefur mólmassa{' '}
                <span className="whitespace-nowrap">
                  {fmt(problem.empiricalMass * given, 2)} g/mól
                </span>{' '}
                — ekki þann sem var mældur.
              </p>
            )}
            <p className="mt-2 text-warm-600">{problem.context}</p>
          </div>
        )}

        {answered && (
          <button
            key="next"
            ref={nextRef}
            onClick={armed(next)}
            className="game-btn rounded-lg bg-kvenno-orange px-6 py-3 font-semibold text-white"
          >
            {index + 1 === MOLECULAR_PROBLEMS.length ? 'Klára' : 'Næsta dæmi'}
          </button>
        )}
      </div>
    </div>
  );
}
