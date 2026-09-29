/**
 * Æfa — the method, in steps, with the check built into the sequence.
 *
 * Four steps per problem, in the order the method is actually run: look Ka up,
 * compute x, **check the assumption**, then report pH. The check is a step of
 * its own rather than a footnote, because in Beita it is the step that decides
 * whether the answer is right.
 *
 * Every problem here is inside the 5 % rule (`PRACTICE_PROBLEMS` guarantees it,
 * and a test pins it), so the check always passes. That is deliberate: the
 * phase teaches the method, and meeting the exception while still learning the
 * method teaches neither. Beita breaks it.
 *
 * No scoring, no timer, and hints cost nothing — the April restructure's rule.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import {
  DECIMAL_INPUT_PROPS,
  focusTarget,
  isPhone,
  parseStudentNumber,
  revealSpan,
  usableArea,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
} from '@shared/utils';

import { useBackButton } from './BackButton';
import { KlofnunBar, formatPercent } from './KlofnunBar';
import { ScientificKeys } from './ScientificKeys';
import { PRACTICE_PROBLEMS } from '../data/problems';
import { PH_TOLERANCE, isRelativelyClose, isAbsolutelyClose } from '../engine/grade';
import { solveWeakAcid } from '../engine/ka';

const fmt = (n: number, dp: number) => n.toFixed(dp).replace('.', ',');
const sciText = (n: number) => n.toExponential(2).replace('.', ',');

interface PracticeScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

type StepId = 'x' | 'check' | 'ph';

export function PracticeScreen({ onComplete, onBack }: PracticeScreenProps) {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState<StepId>('x');
  const [entry, setEntry] = useState('');
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [hintsOpen, setHintsOpen] = useState(0);
  const [retries, setRetries] = useState(0);
  const back = useBackButton(onBack);
  const inputRef = useRef<HTMLInputElement>(null);
  const problemRef = useRef<HTMLDivElement>(null);
  const answerRowRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const hintListRef = useRef<HTMLUListElement>(null);
  const hintButtonRef = useRef<HTMLButtonElement>(null);

  // Each new step or problem: on a phone, the card's top back under the header
  // if it has scrolled away (the button that moved on sits at its foot), and
  // focus to the new step's heading — or, for a new problem, to its statement.
  const cardRef = useItemTop<HTMLDivElement>(`${index}:${step}`);

  // After "Athuga": on a phone, from the problem through "Áfram" if it fits,
  // else from the answer, else the verdict at the top. Focus moves to the
  // feedback, not to "Áfram", so a second Enter lands on nothing (design P3).
  useRevealAfterCommit(verdict !== null, () => ({
    bottom: nextRef.current,
    tops: [problemRef.current, answerRowRef.current, verdictRef.current],
    focus: verdictRef.current,
  }));
  // A desktop window keeps what the game's own helper did there, at any width:
  // feedback that opened within 48 px of the bottom edge is brought in.
  useEffect(() => {
    const el = feedbackRef.current;
    if (verdict === null || !el || isPhone()) return;
    if (el.getBoundingClientRect().top + 48 > usableArea().bottom) {
      revealSpan(el, [], { anyWidth: true, gap: 16 });
    }
  }, [verdict]);
  // "Reyna aftur" unmounts with the feedback: focus goes back to the field.
  useLayoutEffect(() => {
    if (retries > 0) focusTarget(inputRef.current);
  }, [retries]);
  // A double tap on "Athuga" must not press "Áfram" or "Reyna aftur" in its
  // place, nor a double tap on the check step's "Áfram" skip the next step.
  const armed = useArmedAfter(400, `${index}:${step}:${verdict !== null}`);

  const problem = PRACTICE_PROBLEMS[index];
  const s = solveWeakAcid(problem.acid.ka, problem.concentration);

  const reset = () => {
    setEntry('');
    setVerdict(null);
    setHintsOpen(0);
  };

  const retry = () => {
    reset();
    setRetries((n) => n + 1);
  };

  // Opening a hint: on a phone, the answer row through the new hint, so Athuga
  // stays in view with it. The button that opened the last hint unmounts, so
  // focus moves to that hint rather than falling to <body>.
  const openHint = () => setHintsOpen((v) => v + 1);
  useEffect(() => {
    if (hintsOpen === 0) return;
    const hint = hintListRef.current?.lastElementChild ?? null;
    revealSpan(hint, [answerRowRef.current, hint]);
    if (!hintButtonRef.current) focusTarget(hint as HTMLElement | null);
  }, [hintsOpen]);

  const advance = () => {
    if (step === 'x') {
      setStep('check');
    } else if (step === 'check') {
      setStep('ph');
    } else if (index + 1 < PRACTICE_PROBLEMS.length) {
      setIndex(index + 1);
      setStep('x');
    } else {
      onComplete();
      return;
    }
    reset();
  };

  const submit = () => {
    if (verdict !== null) return;
    const value = parseStudentNumber(entry);
    if (step === 'x') {
      setVerdict(isRelativelyClose(value, s.hApprox, 0.02));
    } else {
      setVerdict(isAbsolutelyClose(value, problem.answer, PH_TOLERANCE));
    }
  };

  const HINTS: Record<StepId, string[]> = {
    x: [
      'Forsendan er að x sé hverfandi miðað við C, svo Ka ≈ x² / C.',
      'Umraðað: x = √(Ka · C).',
      `Hér: x = √(${sciText(problem.acid.ka)} · ${fmt(problem.concentration, 3)}).`,
    ],
    check: [
      'Klofnunarhlutfallið er x deilt með C, gefið upp í prósentum.',
      'Ef það er undir 5 % hélt forsendan og nálgunin má standa.',
    ],
    ph: [
      'x er styrkur vetnisjóna, [H⁺].',
      'pH = −log₁₀[H⁺].',
      `Hér: pH = −log₁₀(${sciText(s.hApprox)}).`,
    ],
  };

  /**
   * The panel already prints "Algeng villa:" in front of this, so the text
   * starts after it. Each mistake is named only when the answer shows it, per
   * CLAUDE.md: Ka · C and C are the two numbers the common slips produce, and
   * leaving out the minus gives log₁₀[H⁺], which is negative. Any other wrong
   * number — a rounding, a typo — is not diagnosable, so the slot stays empty.
   */
  const misconception = (): string | undefined => {
    if (verdict) return undefined;
    const value = parseStudentNumber(entry);
    if (step === 'x') {
      if (isRelativelyClose(value, problem.acid.ka * problem.concentration, 0.05)) {
        return 'að gleyma kvaðratrótinni og skila Ka · C, sem er x² en ekki x.';
      }
      if (isRelativelyClose(value, problem.concentration, 0.05)) {
        return 'að skila C sjálfu — en aðeins hluti sýrunnar klofnar, svo x er miklu minna en C.';
      }
      return undefined;
    }
    return value < 0
      ? 'Svarið er neikvætt, svo mínusinn gleymdist: pH = −log₁₀[H⁺], og [H⁺] er minni en 1 svo lograrinn sjálfur er neikvæður.'
      : undefined;
  };

  const prompt: Record<StepId, string> = {
    x: 'Skref 1 af 3 — reiknaðu x = [H⁺] með nálguninni',
    check: 'Skref 2 af 3 — athugaðu forsenduna',
    ph: 'Skref 3 af 3 — breyttu [H⁺] í pH',
  };

  return (
    <div className="mx-auto max-w-3xl">
      {back.above}

      <div ref={cardRef} className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-4 flex items-baseline justify-between phone:mb-3 phone:gap-3">
          {back.inRow}
          <h2 className="text-2xl font-bold text-warm-800 phone:min-w-0 phone:flex-1 phone:text-base">
            Æfa
          </h2>
          <span className="text-sm text-warm-500 phone:shrink-0">
            Dæmi {index + 1} af {PRACTICE_PROBLEMS.length}
          </span>
        </div>

        <div
          ref={problemRef}
          data-item-start={step === 'x' ? '' : undefined}
          className="mb-6 rounded-lg bg-warm-50 p-4 phone:mb-3 phone:p-3"
        >
          <p className="text-warm-800">
            <strong>{fmt(problem.concentration, 3)} M</strong> lausn af{' '}
            <strong>{problem.acid.nameDative}</strong> ({problem.acid.formula}), Ka ={' '}
            {sciText(problem.acid.ka)}.
          </p>
          <p className="mt-1 text-sm text-warm-600">{problem.acid.context}</p>
        </div>

        <p
          data-item-start={step === 'x' ? undefined : ''}
          className="mb-3 font-semibold text-warm-700"
        >
          {prompt[step]}
        </p>

        {step === 'check' ? (
          <div>
            <p className="mb-3 text-warm-700">
              Þú fékkst x = {sciText(s.hApprox)} M úr {fmt(problem.concentration, 3)} M lausn.
              Klofnunarhlutfallið er{' '}
              <span className="whitespace-nowrap">
                {formatPercent(problem.percentDissociated)} %
              </span>
              .
            </p>
            <KlofnunBar percent={problem.percentDissociated} valid={problem.approximationValid} />
            <p className="mt-4 text-warm-700">
              Undir 5 % — forsendan <span className="font-mono">x ≪ C</span> hélt, svo nálgunin má
              standa og þú mátt halda áfram með þetta x.
            </p>
            <button
              type="button"
              onClick={armed(advance)}
              className="game-btn mt-4 rounded-lg bg-kvenno-orange px-5 py-2.5 text-white hover:bg-kvenno-orange-dark"
            >
              Áfram
            </button>
          </div>
        ) : (
          <div>
            {/* On a portrait phone the field, the two keys and Athuga share one
                row, and the unit takes the line under them; below ~340 px
                Athuga wraps rather than squeezing the field. */}
            <div ref={answerRowRef} className="flex flex-wrap items-center gap-2 max-sm:gap-1.5">
              <label htmlFor="answer" className="sr-only">
                Svar
              </label>
              <input
                id="answer"
                ref={inputRef}
                {...DECIMAL_INPUT_PROPS}
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && verdict === null) submit();
                }}
                enterKeyHint="done"
                disabled={verdict !== null}
                placeholder={step === 'x' ? 't.d. 1,3e-3' : 't.d. 2,87'}
                className="w-36 rounded-lg border border-warm-300 p-3 font-mono text-warm-800 disabled:bg-warm-50 sm:w-44 max-sm:w-auto max-sm:min-w-0 max-sm:flex-[0_1_6.5rem] max-sm:px-2"
              />
              {step === 'x' && verdict === null && (
                <ScientificKeys inputRef={inputRef} value={entry} onChange={setEntry} />
              )}
              <span className="text-sm text-warm-600 max-sm:order-last max-sm:basis-full">
                {step === 'x' ? 'mól/L' : 'pH, tveir aukastafir'}
              </span>
              {verdict === null && (
                <button
                  key="athuga"
                  type="button"
                  onClick={submit}
                  className="game-btn rounded-lg bg-kvenno-orange px-5 py-2.5 text-white hover:bg-kvenno-orange-dark max-sm:shrink-0 max-sm:px-4"
                >
                  Athuga
                </button>
              )}
            </div>

            {verdict === null && (
              <div className="mt-4">
                {hintsOpen < HINTS[step].length && (
                  <button
                    ref={hintButtonRef}
                    type="button"
                    onClick={openHint}
                    className="text-sm text-kvenno-orange hover:underline pointer-coarse:-my-3 pointer-coarse:py-3"
                  >
                    Vísbending {hintsOpen + 1} af {HINTS[step].length}
                  </button>
                )}
                <ul ref={hintListRef} className="mt-2 space-y-1">
                  {HINTS[step].slice(0, hintsOpen).map((h) => (
                    <li
                      key={h}
                      className="fade-in rounded-lg border border-warm-200 bg-warm-50 p-3 text-sm text-warm-700"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {verdict !== null && (
              <div ref={feedbackRef} className="fade-in mt-4">
                {/* The group focus moves to after Athuga; FeedbackPanel is
                    itself role=alert and announces the verdict. */}
                <div ref={verdictRef} tabIndex={-1} role="group">
                  <FeedbackPanel
                    feedback={{
                      isCorrect: verdict,
                      explanation:
                        step === 'x'
                          ? `x = √(Ka · C) = √(${sciText(problem.acid.ka)} · ${fmt(
                              problem.concentration,
                              3
                            )}) = ${sciText(s.hApprox)} M.`
                          : `pH = −log₁₀(${sciText(s.hApprox)}) = ${fmt(problem.answer, 2)}.`,
                      misconception: misconception(),
                    }}
                  />
                </div>
                <button
                  key="afram"
                  ref={nextRef}
                  type="button"
                  onClick={armed(advance)}
                  className="game-btn mt-4 rounded-lg bg-kvenno-orange px-5 py-2.5 text-white hover:bg-kvenno-orange-dark"
                >
                  {step === 'ph' && index + 1 === PRACTICE_PROBLEMS.length ? 'Ljúka Æfa' : 'Áfram'}
                </button>
                {!verdict && (
                  <button
                    type="button"
                    onClick={armed(retry)}
                    className="ml-3 rounded-lg px-4 py-2.5 text-warm-600 hover:text-warm-800"
                  >
                    Reyna aftur
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
