import { useEffect, useRef, useState } from 'react';

import { FeedbackPanel } from '@shared/components';
import {
  DECIMAL_INPUT_PROPS,
  formatDecimal,
  parseStudentNumber,
  shuffleArray,
} from '@shared/utils';

import { molarMassTable, YIELD_PROBLEMS, type YieldProblem } from '../data/yieldProblems';

/**
 * Stig 3 — takmarkandi hvarfefni og heimtur, í grömmum.
 *
 * **Stig 1 and 2 draw molecules; this level weighs them.** That is the book's
 * own progression: `ch04/m68714` introduces the limiting reactant with a
 * picture of sandwiches and then does the whole thing in grams, because a
 * chemist never counts molecules. So the concept is taught visually and
 * applied quantitatively, which is what an Apply phase is for — and it is
 * where Siggi's 2026-08-29 ruling sends this material, there being no Level 4.
 *
 * **The molar masses are printed, deliberately.** Masking them would leave the
 * level answerable only by someone who had memorised a periodic table, which
 * is not what it is assessing. `1-ar/lotukerfid` learnt that the hard way:
 * removing an answer leak there removed the student's only route to the
 * answer, and the route had to be put back on purpose.
 */

const TOTAL = YIELD_PROBLEMS.length;
const PER_STEP = 10;
const MAX_SCORE = TOTAL * 3 * PER_STEP;

/** Within two per cent of the mass, which is wider than any rounding a student does. */
const MASS_TOLERANCE = 0.02;
/** One percentage point. The answers run from 40 to 100, so this cannot accept a bare 0. */
const PERCENT_TOLERANCE = 1;

type Step = 'limiting' | 'theoretical' | 'percent' | 'review';

const decimals = (value: number, places = 2) => formatDecimal(value, places);

export function Level3({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack: () => void;
}) {
  const [problems, setProblems] = useState(() => shuffleArray(YIELD_PROBLEMS));
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState<Step>('limiting');
  const [score, setScore] = useState(0);
  const [problemScore, setProblemScore] = useState(0);
  const [done, setDone] = useState(false);

  const [selectedLimiting, setSelectedLimiting] = useState<string | null>(null);
  const [theoreticalInput, setTheoreticalInput] = useState('');
  const [percentInput, setPercentInput] = useState('');
  const [stepAnswered, setStepAnswered] = useState(false);
  const [stepCorrect, setStepCorrect] = useState(false);

  // Phones keep the old scroll offset across screens, which would open the
  // review, or the next problem, part-way down; start each at the top. Moving
  // between the three steps of one problem keeps the student where they are.
  const topRef = useRef<HTMLDivElement>(null);
  const reviewing = step === 'review';
  useEffect(() => {
    topRef.current?.scrollIntoView?.({ block: 'start' });
  }, [index, reviewing, done]);

  // The verdict appears under the answer at the foot of the screen, so on a
  // phone it lands at the fold; bring it and its buttons into view.
  const feedbackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (stepAnswered)
      feedbackRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [stepAnswered]);

  const problem: YieldProblem = problems[index];
  const { reaction, result } = problem;
  const masses = molarMassTable(problem);

  const resetProblemState = () => {
    setStep('limiting');
    setSelectedLimiting(null);
    setTheoreticalInput('');
    setPercentInput('');
    setStepAnswered(false);
    setStepCorrect(false);
    setProblemScore(0);
  };

  // Nothing chosen or typed yet is not an answer. Grading it marked the step
  // wrong and printed the correct answer, one accidental tap on "Athuga" away.
  const canCheck =
    step === 'limiting'
      ? selectedLimiting !== null
      : (step === 'theoretical' ? theoreticalInput : percentInput).trim() !== '';

  const checkStep = () => {
    if (stepAnswered || !canCheck) return;
    let correct = false;
    if (step === 'limiting') {
      correct = selectedLimiting === result.limitingFormula;
    } else if (step === 'theoretical') {
      // parseStudentNumber returns NaN, not null, for what it cannot read.
      const entered = parseStudentNumber(theoreticalInput);
      correct =
        Number.isFinite(entered) &&
        Math.abs(entered - result.theoreticalGrams) / result.theoreticalGrams <= MASS_TOLERANCE;
    } else if (step === 'percent') {
      const entered = parseStudentNumber(percentInput);
      correct = Number.isFinite(entered) && Math.abs(entered - result.percent) <= PERCENT_TOLERANCE;
    }
    setStepCorrect(correct);
    setStepAnswered(true);
    if (correct) {
      setScore((s) => s + PER_STEP);
      setProblemScore((s) => s + PER_STEP);
    }
  };

  const nextStep = () => {
    setStepAnswered(false);
    setStepCorrect(false);
    if (step === 'limiting') setStep('theoretical');
    else if (step === 'theoretical') setStep('percent');
    else setStep('review');
  };

  const retryStep = () => {
    setStepAnswered(false);
    setStepCorrect(false);
    if (step === 'limiting') setSelectedLimiting(null);
    else if (step === 'theoretical') setTheoreticalInput('');
    else setPercentInput('');
  };

  const nextProblem = () => {
    if (index + 1 >= TOTAL) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    resetProblemState();
  };

  const feedbackForStep = (): { explanation: string; misconception?: string } => {
    if (step === 'limiting') {
      return {
        explanation: stepCorrect
          ? `Rétt! ${result.limitingFormula} klárast fyrst.`
          : `Rétt svar: ${result.limitingFormula}. ${reaction.reactant1.formula}: ${decimals(result.extentR1, 3)} skipti, ${reaction.reactant2.formula}: ${decimals(result.extentR2, 3)} skipti.`,
        misconception: stepCorrect
          ? undefined
          : 'Berðu saman mólfjölda deilt með stuðli — ekki grömmin. Þyngra hvarfefni getur vel verið það sem klárast síðast.',
      };
    }
    if (step === 'theoretical') {
      return {
        explanation: stepCorrect
          ? `Rétt! ${decimals(result.theoreticalGrams)} g af ${problem.productFormula}.`
          : `Rétt svar: ${decimals(result.theoreticalGrams)} g. Takmarkandi hvarfefnið gefur ${decimals(Math.min(result.extentR1, result.extentR2), 4)} skipti af jöfnunni.`,
        misconception: stepCorrect
          ? undefined
          : 'Fræðilegar heimtur koma eingöngu frá takmarkandi hvarfefninu. Umframhvarfefnið breytir þeim engu.',
      };
    }
    return {
      explanation: stepCorrect
        ? `Rétt! ${decimals(result.percent, 1)} %.`
        : `Rétt svar: ${decimals(result.percent, 1)} %. ${decimals(result.actualGrams)} ÷ ${decimals(result.theoreticalGrams)} × 100.`,
      misconception: stepCorrect
        ? undefined
        : 'Raunheimtur deilt með fræðilegum heimtum, ekki öfugt. Talan verður aldrei yfir 100 % hér.',
    };
  };

  if (done) {
    return (
      <div
        ref={topRef}
        className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 flex items-center justify-center"
      >
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center space-y-6">
          <div className="text-5xl">
            {score >= MAX_SCORE * 0.8 ? '🎉' : score >= MAX_SCORE * 0.5 ? '👍' : '📚'}
          </div>
          <h2 className="text-2xl font-bold text-warm-800">Niðurstöður</h2>
          <p className="text-lg text-warm-700">
            Þú fékkst <span className="font-bold text-kvenno-orange">{score}</span> af{' '}
            <span className="font-bold">{MAX_SCORE}</span> stigum
          </p>
          <div className="h-3 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-kvenno-orange transition-all duration-700"
              style={{ width: `${(score / MAX_SCORE) * 100}%` }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setProblems(shuffleArray(YIELD_PROBLEMS));
                setIndex(0);
                setScore(0);
                resetProblemState();
                setDone(false);
              }}
              className="flex-1 bg-warm-200 hover:bg-warm-300 text-warm-800 font-bold py-3 rounded-xl transition-colors"
            >
              Reyna aftur
            </button>
            <button
              onClick={() => onComplete(score)}
              className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              Ljúka stigi
            </button>
          </div>
          <button
            onClick={onBack}
            className="text-warm-500 hover:text-warm-700 text-sm pointer-coarse:py-3 pointer-coarse:-my-3"
          >
            Til baka í valmynd
          </button>
        </div>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div ref={topRef} className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{problemScore === 30 ? '✅' : '📝'}</div>
              <h2 className="text-xl font-bold text-warm-800">
                {problemScore === 30 ? 'Fullkomið!' : 'Verkefni lokið'}
              </h2>
              <p className="text-warm-600 text-sm">{problemScore}/30 stig</p>
            </div>

            <div className="bg-warm-50 rounded-xl p-3 sm:p-4 mb-4">
              <h3 className="font-bold text-warm-800 mb-3">Útreikningurinn</h3>
              <div className="text-center text-base sm:text-lg font-mono bg-white p-2 rounded-lg mb-3">
                {reaction.equation}
              </div>
              <div className="text-sm space-y-1">
                {/* Phones: the arithmetic drops under its label, and breaks only between steps. */}
                <div className="flex flex-wrap justify-between gap-x-2">
                  <span>{reaction.reactant1.formula}:</span>
                  <span className="ml-auto text-right font-mono">
                    <span className="whitespace-nowrap">
                      {decimals(problem.gramsR1)} g → {decimals(result.molesR1, 3)} mól
                    </span>{' '}
                    <span className="whitespace-nowrap">
                      ÷ {reaction.reactant1.coeff} = <strong>{decimals(result.extentR1, 3)}</strong>
                    </span>
                  </span>
                </div>
                <div className="flex flex-wrap justify-between gap-x-2">
                  <span>{reaction.reactant2.formula}:</span>
                  <span className="ml-auto text-right font-mono">
                    <span className="whitespace-nowrap">
                      {decimals(problem.gramsR2)} g → {decimals(result.molesR2, 3)} mól
                    </span>{' '}
                    <span className="whitespace-nowrap">
                      ÷ {reaction.reactant2.coeff} = <strong>{decimals(result.extentR2, 3)}</strong>
                    </span>
                  </span>
                </div>
                <div className="flex justify-between gap-x-2 border-t border-warm-200 pt-1 mt-1">
                  <span>Takmarkandi:</span>
                  <strong className="text-kvenno-orange whitespace-nowrap">
                    {result.limitingFormula}
                  </strong>
                </div>
                <div className="flex justify-between gap-x-2">
                  <span>{result.excessFormula} eftir:</span>
                  <strong className="text-blue-700 whitespace-nowrap">
                    {decimals(result.excessLeftGrams)} g
                  </strong>
                </div>
                <div className="flex justify-between gap-x-2">
                  <span>Fræðilegar heimtur:</span>
                  <strong className="text-green-700 whitespace-nowrap">
                    {decimals(result.theoreticalGrams)} g {problem.productFormula}
                  </strong>
                </div>
                <div className="flex justify-between gap-x-2">
                  <span>Raunheimtur:</span>
                  <strong className="whitespace-nowrap">{decimals(result.actualGrams)} g</strong>
                </div>
                <div className="flex justify-between gap-x-2 border-t border-warm-200 pt-1 mt-1">
                  <span>Prósentuheimtur:</span>
                  <strong className="text-kvenno-orange whitespace-nowrap">
                    {decimals(result.percent, 1)} %
                  </strong>
                </div>
              </div>
            </div>

            <p className="text-sm text-warm-600 mb-4">{problem.context}</p>

            <button
              onClick={nextProblem}
              className="w-full bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
            >
              {index + 1 < TOTAL ? 'Næsta verkefni →' : 'Sjá niðurstöður →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepNumber = step === 'limiting' ? 1 : step === 'theoretical' ? 2 : 3;
  const limitingBtnCls = (formula: string) => {
    const sel = selectedLimiting === formula;
    const right = result.limitingFormula === formula;
    if (stepAnswered && sel)
      return right ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
    if (stepAnswered && right) return 'border-green-500 bg-green-50';
    if (sel) return 'border-kvenno-orange bg-orange-50';
    return 'border-warm-200 hover:border-orange-300 hover:bg-orange-50';
  };

  return (
    <div ref={topRef} className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          {/* Phones: back link and counter share the top row, the title gets its own. */}
          <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-x-2 gap-y-1">
            <button
              onClick={onBack}
              className="text-warm-500 hover:text-warm-700 font-semibold text-sm whitespace-nowrap pointer-coarse:min-h-11"
            >
              ← Til baka
            </button>
            <h1 className="order-last basis-full sm:order-none sm:basis-auto text-lg font-bold text-warm-800">
              Heimtur – <span className="whitespace-nowrap">Stig 3</span>
            </h1>
            <span className="text-sm font-semibold text-warm-600">
              {index + 1}/{TOTAL}
            </span>
          </div>
          <div className="mt-3 h-2 bg-warm-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-kvenno-orange transition-all duration-500"
              style={{ width: `${((index * 3 + stepNumber - 1) / (TOTAL * 3)) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-warm-500">Skref {stepNumber} af 3</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <p className="text-center text-lg font-mono text-warm-800 mb-3">{reaction.equation}</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-lg border-2 border-warm-200 p-2 sm:p-3 text-center">
              <div className="font-mono text-warm-800">{reaction.reactant1.formula}</div>
              <div className="text-lg sm:text-xl font-bold text-kvenno-orange whitespace-nowrap">
                {decimals(problem.gramsR1)} g
              </div>
            </div>
            <div className="rounded-lg border-2 border-warm-200 p-2 sm:p-3 text-center">
              <div className="font-mono text-warm-800">{reaction.reactant2.formula}</div>
              <div className="text-lg sm:text-xl font-bold text-kvenno-orange whitespace-nowrap">
                {decimals(problem.gramsR2)} g
              </div>
            </div>
          </div>
          {/* The student's route to the answer, printed on purpose. */}
          <div className="rounded-lg bg-warm-50 p-3 text-sm">
            <p className="mb-1 font-semibold text-warm-700">Mólmassar</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-warm-700">
              {masses.map((m) => (
                <span key={m.formula}>
                  {m.formula} = {decimals(m.mass)} g/mól
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          {step === 'limiting' && (
            <>
              <p className="mb-3 font-semibold text-warm-800">Hvort hvarfefnið er takmarkandi?</p>
              <div className="grid grid-cols-2 gap-3">
                {[reaction.reactant1, reaction.reactant2].map((r) => (
                  <button
                    key={r.formula}
                    onClick={() => !stepAnswered && setSelectedLimiting(r.formula)}
                    disabled={stepAnswered}
                    className={`rounded-xl border-2 p-4 font-mono text-lg transition-colors ${limitingBtnCls(r.formula)}`}
                  >
                    {r.formula}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 'theoretical' && (
            <>
              <p className="mb-3 font-semibold text-warm-800">
                Hverjar eru fræðilegar heimtur af {problem.productFormula}?
              </p>
              <div className="flex items-center gap-2">
                <input
                  {...DECIMAL_INPUT_PROPS}
                  value={theoreticalInput}
                  onChange={(e) => setTheoreticalInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && checkStep()}
                  disabled={stepAnswered}
                  placeholder="0,00"
                  aria-label="Fræðilegar heimtur í grömmum"
                  className="w-36 rounded-lg border-2 border-warm-300 px-3 py-2 text-center font-mono text-lg"
                />
                <span className="text-lg text-warm-700">g</span>
              </div>
            </>
          )}

          {step === 'percent' && (
            <>
              <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                Úr tilrauninni komu <strong>{decimals(result.actualGrams)} g</strong> af{' '}
                {problem.productFormula}.
              </div>
              <p className="mb-3 font-semibold text-warm-800">Hverjar eru prósentuheimturnar?</p>
              <div className="flex items-center gap-2">
                <input
                  {...DECIMAL_INPUT_PROPS}
                  value={percentInput}
                  onChange={(e) => setPercentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && checkStep()}
                  disabled={stepAnswered}
                  placeholder="0,0"
                  aria-label="Prósentuheimtur"
                  className="w-36 rounded-lg border-2 border-warm-300 px-3 py-2 text-center font-mono text-lg"
                />
                <span className="text-lg text-warm-700">%</span>
              </div>
            </>
          )}

          {!stepAnswered ? (
            <button
              onClick={checkStep}
              disabled={!canCheck}
              className="mt-4 w-full bg-kvenno-orange hover:bg-kvenno-orange-dark disabled:bg-warm-300 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Athuga
            </button>
          ) : (
            <div ref={feedbackRef} className="mt-4 space-y-3">
              <FeedbackPanel
                feedback={{ isCorrect: stepCorrect, ...feedbackForStep() }}
                config={{ showExplanation: true, showMisconceptions: !stepCorrect }}
              />
              <div className="flex gap-3">
                {!stepCorrect && (
                  <button
                    onClick={retryStep}
                    className="flex-1 bg-warm-200 hover:bg-warm-300 text-warm-800 font-bold py-3 rounded-xl transition-colors"
                  >
                    Reyna aftur
                  </button>
                )}
                <button
                  onClick={nextStep}
                  className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-dark text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Áfram →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
