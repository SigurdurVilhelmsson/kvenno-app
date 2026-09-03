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

import { useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import { DECIMAL_INPUT_PROPS, parseStudentNumber } from '@shared/utils';

import { KlofnunBar } from './KlofnunBar';
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

  const problem = PRACTICE_PROBLEMS[index];
  const s = solveWeakAcid(problem.acid.ka, problem.concentration);

  const reset = () => {
    setEntry('');
    setVerdict(null);
    setHintsOpen(0);
  };

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

  const prompt: Record<StepId, string> = {
    x: 'Skref 1 af 3 — reiknaðu x = [H⁺] með nálguninni',
    check: 'Skref 2 af 3 — athugaðu forsenduna',
    ph: 'Skref 3 af 3 — breyttu [H⁺] í pH',
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button type="button" onClick={onBack} className="mb-4 text-warm-600 hover:text-warm-800">
        ← Til baka
      </button>

      <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-warm-800">Æfa</h2>
          <span className="text-sm text-warm-500">
            Dæmi {index + 1} af {PRACTICE_PROBLEMS.length}
          </span>
        </div>

        <div className="mb-6 rounded-lg bg-warm-50 p-4">
          <p className="text-warm-800">
            <strong>{fmt(problem.concentration, 3)} M</strong> lausn af{' '}
            <strong>{problem.acid.name.toLowerCase()}</strong> ({problem.acid.formula}), Ka ={' '}
            {sciText(problem.acid.ka)}.
          </p>
          <p className="mt-1 text-sm text-warm-600">{problem.acid.context}</p>
        </div>

        <p className="mb-3 font-semibold text-warm-700">{prompt[step]}</p>

        {step === 'check' ? (
          <div>
            <p className="mb-3 text-warm-700">
              Þú fékkst x = {sciText(s.hApprox)} M úr {fmt(problem.concentration, 3)} M lausn.
              Klofnunarhlutfallið er {fmt(problem.percentDissociated, 2)} %.
            </p>
            <KlofnunBar percent={problem.percentDissociated} valid={problem.approximationValid} />
            <p className="mt-4 text-warm-700">
              Undir 5 % — forsendan <span className="font-mono">x ≪ C</span> hélt, svo nálgunin má
              standa og þú mátt halda áfram með þetta x.
            </p>
            <button
              type="button"
              onClick={advance}
              className="game-btn mt-4 rounded-lg bg-kvenno-orange px-5 py-2.5 text-white hover:bg-kvenno-orange-dark"
            >
              Áfram
            </button>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="answer" className="sr-only">
                Svar
              </label>
              <input
                id="answer"
                {...DECIMAL_INPUT_PROPS}
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && verdict === null) submit();
                }}
                disabled={verdict !== null}
                placeholder={step === 'x' ? 't.d. 1,3e-3' : 't.d. 2,87'}
                className="w-44 rounded-lg border border-warm-300 p-3 font-mono text-warm-800 disabled:bg-warm-50"
              />
              <span className="text-sm text-warm-600">
                {step === 'x' ? 'mól/L' : 'pH, tveir aukastafir'}
              </span>
              {verdict === null && (
                <button
                  type="button"
                  onClick={submit}
                  className="game-btn rounded-lg bg-kvenno-orange px-5 py-2.5 text-white hover:bg-kvenno-orange-dark"
                >
                  Athuga
                </button>
              )}
            </div>

            {verdict === null && (
              <div className="mt-4">
                {hintsOpen < HINTS[step].length && (
                  <button
                    type="button"
                    onClick={() => setHintsOpen((v) => v + 1)}
                    className="text-sm text-kvenno-orange hover:underline"
                  >
                    Vísbending {hintsOpen + 1} af {HINTS[step].length}
                  </button>
                )}
                <ul className="mt-2 space-y-1">
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
              <div className="fade-in mt-4">
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
                    misconception: verdict
                      ? undefined
                      : step === 'x'
                        ? 'Algeng villa er að gleyma kvaðratrótinni og skila Ka · C. Önnur er að skila C sjálfu — en aðeins hluti sýrunnar klofnar.'
                        : 'Ef þú fékkst jákvæða tölu yfir 7 gleymdirðu mínusnum: pH = −log₁₀[H⁺], og [H⁺] er minni en 1 svo lograrinn er neikvæður.',
                  }}
                />
                <button
                  type="button"
                  onClick={advance}
                  className="game-btn mt-4 rounded-lg bg-kvenno-orange px-5 py-2.5 text-white hover:bg-kvenno-orange-dark"
                >
                  {step === 'ph' && index + 1 === PRACTICE_PROBLEMS.length ? 'Ljúka Æfa' : 'Áfram'}
                </button>
                {!verdict && (
                  <button
                    type="button"
                    onClick={reset}
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
