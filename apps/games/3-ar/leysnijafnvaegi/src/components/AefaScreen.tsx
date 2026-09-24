import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { useArmedAfter, useRevealAfterCommit } from '@shared/utils';

import { BackButton } from './BackButton';
import { Sci } from './Sci';
import { ScientificInput } from './ScientificInput';
import { SOLUBILITY_PROBLEMS } from '../data/problems';
import { saltBy } from '../data/salts';
import {
  dissolutionEquation,
  gradeScientific,
  kspExpression,
  molarSolubility,
  type GradeOutcome,
} from '../engine/ksp';
import { revealBelowFoldOnDesktop, useItemStart } from '../utils/desktopReveal';

/**
 * Æfa — compute the molar solubility from Ksp, and the reverse.
 *
 * **The answer is entered as a mantissa and a power of ten, in two fields.**
 * Every answer here is between 10⁻⁵ and 10⁻¹⁷, so a single decimal box is not
 * usable by anyone, and a single free-text box is what broke the old game:
 * `Level2.tsx:48` did `.replace(/10/g, 'e')`, which made the format the game
 * itself advertised grade as its mantissa, the plain-decimal form grade as 0,
 * and an Icelandic comma grade as 1.
 *
 * Two fields also let the feedback say which half is wrong: "right digits,
 * wrong power of ten" is a different mistake from "wrong digits", and a merged
 * box could only say "wrong". It is **not** what forgetting the 4 in 4s³ looks
 * like, nor taking a square root for a cube root: both change the digits, so on
 * this pool they grade as `tolustafir` or `baedi` and never as `veldisvisir`.
 * The `veldisvisir` message used to name those two causes, which was false
 * every time it was shown; a test now holds it to naming only what it can see.
 *
 * Both fields use `DECIMAL_INPUT_PROPS` (in `ScientificInput`, which also
 * carries the `±` key an iPhone's decimal keypad lacks). The exponent is an
 * integer, but it is a signed one rather than a count of things, so the numeric
 * input type would put a spinner and a mobile keypad with no minus sign in
 * front of the student.
 *
 * That last sentence is phrased to avoid writing the numeric type literally.
 * `decimal-input.test.ts` greps source text and cannot tell a use from a
 * mention, so naming it here fails the very test the sentence is explaining —
 * the third guard today to catch its own documentation, after the electrolyte
 * terminology note and the seashell one in this game's own data.
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

const ORDER = { ledd: 0, mid: 1, thung: 2 } as const;
const RUN = [...SOLUBILITY_PROBLEMS].sort((a, b) => ORDER[a.difficulty] - ORDER[b.difficulty]);

/**
 * The example shown in the empty fields and in the fill-in-both message.
 *
 * It must not be an answer. It used to be 1,34 and −5, which is AgCl's molar
 * solubility, 1,34 × 10⁻⁵ M — and AgCl is the first problem the phase serves,
 * so the answer to it sat in the field before the student typed anything. A
 * test holds this example against every problem's answer.
 */
const EXAMPLE = { mantissa: '2,5', exponent: '-7' } as const;

const MESSAGE: Record<GradeOutcome, string> = {
  rett: 'Rétt.',
  veldisvisir: 'Tölustafirnir eru réttir en veldisvísirinn ekki.',
  tolustafir: 'Rétt stærðarþrep, en tölurnar stemma ekki. Reiknaðu aftur.',
  baedi: 'Hvorki tölustafirnir né veldisvísirinn stemma.',
  ogilt: `Fylltu í báða reitina — tölu og veldisvísi, t.d. ${EXAMPLE.mantissa} og ${EXAMPLE.exponent.replace('-', '−')}.`,
};

export function AefaScreen({ onComplete, onBack }: Props) {
  const [index, setIndex] = useState(0);
  const [mantissa, setMantissa] = useState('');
  const [exponent, setExponent] = useState('');
  const [outcome, setOutcome] = useState<GradeOutcome | null>(null);
  const [solved, setSolved] = useState(0);
  // An empty or unreadable entry is not an attempt: the fields stay open and
  // the answer stays hidden, so the student can do what the message asks.
  const [invalid, setInvalid] = useState(false);
  const answerLabelId = useId();
  const verdictId = useId();
  const problemRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // The next problem starts at the top of the card, not where "Næsta dæmi" was,
  // and focus moves to the new problem (utils/desktopReveal.ts).
  const cardRef = useItemStart<HTMLDivElement>(index);
  // After Athuga, on a phone: from the problem through "Næsta dæmi" if it
  // fits, else from the answer, else the feedback, the most that fits. Focus
  // moves to the feedback, not to the button (design P3).
  useRevealAfterCommit(outcome !== null, () => ({
    bottom: nextRef.current,
    tops: [problemRef.current, answerRef.current, feedbackRef.current],
    focus: feedbackRef.current,
  }));
  // A desktop window keeps what the game's own helper did there: a 2:1 salt's
  // feedback that ran past the bottom edge is brought up to show it.
  useEffect(() => {
    if (outcome !== null) revealBelowFoldOnDesktop(feedbackRef.current);
  }, [outcome]);
  // A double tap on Athuga must not press "Næsta dæmi".
  const armed = useArmedAfter(400, `${index}:${outcome !== null}`);

  const problem = RUN[index];
  const salt = useMemo(() => saltBy(problem.formula), [problem.formula]);
  const pure = molarSolubility(salt);
  // The pool's names are capitalised because Kanna shows them as labels; here
  // one sits mid-sentence, where an Icelandic common noun is lower case.
  // Only the first letter moves, so a Roman numeral such as (II) keeps its case.
  const inSentence = salt.name.charAt(0).toLocaleLowerCase('is') + salt.name.slice(1);

  const check = () => {
    if (outcome !== null) return;
    const result = gradeScientific({ mantissa, exponent }, problem.answer);
    if (result.outcome === 'ogilt') {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setOutcome(result.outcome);
    if (result.outcome === 'rett') setSolved(solved + 1);
  };

  const next = () => {
    if (index + 1 >= RUN.length) {
      onComplete();
      return;
    }
    setIndex(index + 1);
    setMantissa('');
    setExponent('');
    setOutcome(null);
    setInvalid(false);
  };

  const asksForSolubility = problem.direction === 'kspToS';

  // Held outside the layout below, and kept verbatim, so the text nodes these
  // lines make are exactly the ones they made before the phone layout wrapped
  // the problem: a split in a different place renders a desktop pixel apart.
  // prettier-ignore
  const question = asksForSolubility ? (
    <>
      Hver er mólarleysni <span className="font-mono font-semibold">{salt.formula}</span>{' '}
      ({inSentence}) í hreinu vatni við <span className="whitespace-nowrap">25 °C</span>?
    </>
  ) : (
    <>
      Mólarleysni <span className="font-mono font-semibold">{salt.formula}</span> (
      {inSentence}) mælist <Sci value={pure} figures={3} unit="M" /> við{' '}
      <span className="whitespace-nowrap">25 °C</span>. Hvert er Ksp?
    </>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div ref={cardRef} className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-6 flex items-baseline justify-between gap-3 phone:mb-2">
          <h2 className="min-w-0 text-xl font-bold text-warm-800 sm:text-2xl phone:text-base">
            Æfa — reiknaðu mólarleysnina
          </h2>
          <BackButton onClick={onBack} />
        </div>

        <p className="mb-4 text-sm text-warm-600 phone:mb-2">
          Dæmi {index + 1} af {RUN.length} · {solved} rétt
        </p>

        {/* On a phone held sideways the problem sits beside the answer. */}
        <div className="phone-land:grid phone-land:grid-cols-2 phone-land:items-start phone-land:gap-4">
          <div
            ref={problemRef}
            className="mb-6 rounded-xl border-2 border-warm-200 bg-warm-50 p-4 sm:p-5 phone:mb-3 phone:p-3"
          >
            <p data-item-start className="mb-3 text-warm-800 phone:mb-2">
              {question}
            </p>
            <dl className="space-y-1 font-mono text-sm text-warm-700">
              <div>{dissolutionEquation(salt)}</div>
              <div>{kspExpression(salt)}</div>
              {asksForSolubility && (
                <div>
                  Ksp = <Sci value={salt.ksp} />
                </div>
              )}
            </dl>
          </div>

          <div>
            {/* The two fields are named Tala and Veldisvísir; the group carries the
            heading, unit included, so it is read out with them. */}
            <div
              ref={answerRef}
              className="mb-4 phone:mb-3"
              role="group"
              aria-labelledby={answerLabelId}
            >
              <p
                id={answerLabelId}
                className="mb-2 block text-sm font-semibold text-warm-700 phone:mb-1"
              >
                Svar {asksForSolubility ? '(M)' : ''}
              </p>
              <ScientificInput
                mantissa={mantissa}
                exponent={exponent}
                onMantissaChange={setMantissa}
                onExponentChange={setExponent}
                mantissaPlaceholder={EXAMPLE.mantissa}
                exponentPlaceholder={EXAMPLE.exponent}
                disabled={outcome !== null}
                onSubmit={check}
              />
              <p className="mt-2 text-xs text-warm-500 phone:mt-1">
                Tvær tölur: fyrst talan, svo veldisvísirinn. Bæði komma og punktur virka.
              </p>
            </div>

            {outcome === null ? (
              <>
                {invalid && (
                  <p role="alert" className="mb-3 text-sm font-semibold text-amber-800">
                    {MESSAGE.ogilt}
                  </p>
                )}
                <button
                  key="check"
                  type="button"
                  onClick={check}
                  className="game-btn w-full rounded-lg bg-kvenno-orange px-4 py-3 font-semibold text-white hover:bg-kvenno-orange-dark"
                >
                  Athuga
                </button>
              </>
            ) : (
              // The group focus moves to after Athuga, named by the verdict.
              <div
                key="feedback"
                ref={feedbackRef}
                role="group"
                aria-labelledby={verdictId}
                tabIndex={-1}
                className={`rounded-lg border-2 p-4 phone:p-3 ${
                  outcome === 'rett'
                    ? 'border-green-300 bg-green-50'
                    : 'border-amber-300 bg-amber-50'
                }`}
              >
                <p id={verdictId} className="mb-2 font-semibold text-warm-900">
                  {MESSAGE[outcome]}
                </p>
                <p className="text-sm text-warm-800">
                  Svarið er{' '}
                  <span className="whitespace-nowrap">
                    <span className="font-mono">
                      <Sci value={problem.answer} figures={3} />
                    </span>
                    {asksForSolubility ? ' M' : ''}
                  </span>
                  .
                </p>
                {asksForSolubility && salt.x * salt.y > 1 && (
                  <p className="mt-2 rounded border border-amber-300 bg-white p-2 text-sm text-amber-900">
                    Hlutfallið er {salt.x}:{salt.y}, svo Ksp = {salt.x > 1 ? `(${salt.x}s)` : 's'}
                    {salt.x > 1 ? <sup className="pointer-coarse:text-[12px]">{salt.x}</sup> : ''}
                    {salt.y > 1 ? `(${salt.y}s)` : '(s)'}
                    {salt.y > 1 ? (
                      <sup className="pointer-coarse:text-[12px]">{salt.y}</sup>
                    ) : (
                      ''
                    )} = {Math.pow(salt.x, salt.x) * Math.pow(salt.y, salt.y)}s
                    <sup className="pointer-coarse:text-[12px]">{salt.x + salt.y}</sup>.
                    Kvaðratrótin á ekki við hér.
                  </p>
                )}
                <button
                  ref={nextRef}
                  type="button"
                  onClick={armed(next)}
                  className="game-btn mt-4 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 pointer-coarse:min-h-11 phone:mt-3"
                >
                  {index + 1 >= RUN.length ? 'Ljúka' : 'Næsta dæmi'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
