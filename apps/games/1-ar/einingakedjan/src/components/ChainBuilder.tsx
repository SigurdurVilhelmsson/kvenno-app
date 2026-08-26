import { useCallback, useEffect, useMemo, useState } from 'react';

import { useEscapeKey } from '@shared/hooks';
import { shuffleArray } from '@shared/utils';

import { ChainCard, PoolCard } from './RatioCard';
import { SolveTrace } from './SolveTrace';
import { UnitsDisplay } from './UnitsDisplay';
import type { Problem } from '../data/problems';
import { ratioById } from '../data/ratios';
import {
  correctionPrompt,
  predictionOptions,
  solveChain,
  type ChainSlot,
  type FixAction,
} from '../engine/chain';
import { flip, formatSignature, orient, type Orientation } from '../engine/units';

/** How long each step of the worked solution stays on screen before the next appears. */
const STEP_REVEAL_MS = 1200;

type Mode = 'building' | 'predicting' | 'tracing' | 'correcting' | 'solved';

interface ChainBuilderProps {
  problems: Problem[];
  /**
   * Ask the student which unit will survive before running the chain.
   *
   * On in the practice phase, off in the apply phase. One tap, no typing — it is
   * what stops the level being beatable by shuffling cards until the game turns
   * green, without turning into another thing to type.
   */
  predictBeforeSolving: boolean;
  onComplete: () => void;
  onBack: () => void;
}

export function ChainBuilder({
  problems,
  predictBeforeSolving,
  onComplete,
  onBack,
}: ChainBuilderProps) {
  const [index, setIndex] = useState(0);
  const [slots, setSlots] = useState<ChainSlot[]>([]);
  const [mode, setMode] = useState<Mode>('building');
  const [revealed, setRevealed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [chosenFix, setChosenFix] = useState<FixAction | null>(null);

  const problem = problems[index];

  // Shuffled once per problem: position in the pool must not hint at the answer.
  const pool = useMemo(
    () => shuffleArray(problem.poolIds.map(ratioById)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [problem.id]
  );

  const result = useMemo(
    () => solveChain(problem.start, slots, [...pool], problem.target),
    [problem, slots, pool]
  );

  const predictions = useMemo(
    () =>
      mode === 'predicting'
        ? shuffleArray(predictionOptions(problem.start, slots, [...pool], problem.target))
        : [],
    [mode, problem, slots, pool]
  );

  const prompt = useMemo(
    () => (mode === 'correcting' ? correctionPrompt(result, problem.target) : null),
    [mode, result, problem.target]
  );

  const resetProblem = useCallback(() => {
    setSlots([]);
    setMode('building');
    setRevealed(0);
    setShowHint(false);
    setPrediction(null);
    setChosenFix(null);
  }, []);

  // Escape backs out one layer at a time: out of the worked solution first, and
  // only out of the game itself once the student is back at the board.
  const handleEscape = useCallback(() => {
    if (mode === 'building') {
      onBack();
      return;
    }
    setMode('building');
    setRevealed(0);
    setPrediction(null);
    setChosenFix(null);
  }, [mode, onBack]);

  useEscapeKey(handleEscape);

  // Reveal the worked solution one step at a time, then settle into the outcome.
  useEffect(() => {
    if (mode !== 'tracing') return undefined;

    if (revealed >= result.steps.length) {
      const settle = setTimeout(
        () => setMode(result.status === 'solved' ? 'solved' : 'correcting'),
        600
      );
      return () => clearTimeout(settle);
    }

    const tick = setTimeout(() => setRevealed((r) => r + 1), STEP_REVEAL_MS);
    return () => clearTimeout(tick);
  }, [mode, revealed, result]);

  const addRatio = (id: string) => {
    setSlots((current) => [...current, { equivalenceId: id, orientation: 'forward' }]);
  };

  const flipSlot = (position: number) => {
    setSlots((current) =>
      current.map((slot, i) =>
        i === position ? { ...slot, orientation: flip(slot.orientation) } : slot
      )
    );
  };

  const removeSlot = (position: number) => {
    setSlots((current) => current.filter((_, i) => i !== position));
  };

  const startSolving = () => {
    setChosenFix(null);
    setRevealed(0);
    setPrediction(null);
    setMode(predictBeforeSolving ? 'predicting' : 'tracing');
  };

  const applyFix = (action: FixAction) => {
    if (action === 'flip' && result.failedSlot !== undefined) flipSlot(result.failedSlot);
    if (action === 'remove' && result.failedSlot !== undefined) removeSlot(result.failedSlot);
    // 'addStep' needs no edit — the student goes back and lengthens the chain.
    setMode('building');
    setRevealed(0);
    setChosenFix(null);
  };

  const nextProblem = () => {
    if (index + 1 >= problems.length) {
      onComplete();
      return;
    }
    setIndex(index + 1);
    setSlots([]);
    setMode('building');
    setRevealed(0);
    setShowHint(false);
    setPrediction(null);
    setChosenFix(null);
  };

  const orientedSlots = slots.map((slot) => ({
    slot,
    ratio: orient(ratioById(slot.equivalenceId), slot.orientation as Orientation),
  }));

  const chosenOption = prompt?.options.find((o) => o.id === chosenFix) ?? null;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="game-btn rounded-lg border border-warm-300 px-3 py-1.5 text-sm text-warm-700 hover:bg-warm-50"
        >
          ← Aftur í valmynd
        </button>
        <span className="text-sm text-warm-600">
          Dæmi {index + 1} af {problems.length}
        </span>
      </div>

      {/* Scenario */}
      <div className="mb-4 rounded-xl bg-white p-5 shadow-sm">
        <div className="flex gap-4">
          <span className="text-4xl" aria-hidden="true">
            {problem.icon}
          </span>
          <div className="flex-1">
            <p className="text-warm-800">{problem.context}</p>
            <p className="mt-3 text-warm-800">
              <strong>Finndu {problem.goal}.</strong>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-lg bg-warm-100 px-3 py-1.5">
                Þú ert með:{' '}
                <UnitsDisplay quantity={problem.start} valueLabel={problem.startLabel} />
              </span>
              <span aria-hidden="true" className="text-warm-400">
                →
              </span>
              <span className="rounded-lg bg-orange-100 px-3 py-1.5 text-orange-900">
                Markið: {formatSignature(problem.target)}
              </span>
            </div>
            {problem.equation && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 font-mono text-sm text-amber-900">
                {problem.equation}
              </p>
            )}
          </div>
        </div>
      </div>

      {mode === 'building' && (
        <>
          {/* The chain under construction */}
          <div className="mb-4 rounded-xl bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-semibold text-warm-800">Keðjan þín</h3>
            <div className="flex flex-wrap items-stretch gap-3">
              <div className="flex items-center rounded-lg bg-warm-100 px-3 py-2">
                <UnitsDisplay quantity={problem.start} valueLabel={problem.startLabel} />
              </div>
              {orientedSlots.map(({ ratio }, position) => (
                <div
                  key={`${ratio.equivalence.id}-${position}`}
                  className="flex items-center gap-3"
                >
                  <span aria-hidden="true" className="text-warm-400">
                    ×
                  </span>
                  <ChainCard
                    ratio={ratio}
                    position={position + 1}
                    onFlip={() => flipSlot(position)}
                    onRemove={() => removeSlot(position)}
                  />
                </div>
              ))}
              {slots.length === 0 && (
                <p className="flex items-center text-sm text-warm-500">
                  Veldu hlutfall úr safninu hér að neðan til að byrja keðjuna.
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={startSolving}
                disabled={slots.length === 0}
                className="game-btn rounded-lg bg-kvenno-orange px-5 py-2.5 font-semibold text-white hover:bg-kvenno-orange-dark disabled:opacity-40"
              >
                Leysa
              </button>
              <button
                type="button"
                onClick={() => setShowHint((s) => !s)}
                className="game-btn rounded-lg border border-warm-300 px-4 py-2.5 text-warm-700 hover:bg-warm-50"
                aria-expanded={showHint}
              >
                {showHint ? 'Fela vísbendingu' : 'Vísbending'}
              </button>
              {slots.length > 0 && (
                <button
                  type="button"
                  onClick={resetProblem}
                  className="game-btn rounded-lg border border-warm-300 px-4 py-2.5 text-warm-700 hover:bg-warm-50"
                >
                  Byrja upp á nýtt
                </button>
              )}
            </div>

            {showHint && (
              <p className="fade-in mt-3 rounded-lg bg-sky-50 p-3 text-sm text-sky-900">
                {problem.hint}
              </p>
            )}
          </div>

          {/* The pool */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="mb-1 font-semibold text-warm-800">Hlutföll í boði</h3>
            <p className="mb-3 text-sm text-warm-600">
              Hvert spjald er staðreynd sem má nota í báðar áttir. Þegar þú setur það í keðjuna
              velur þú hvorum megin við strikið hvor einingin lendir.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pool.map((equivalence) => (
                <PoolCard
                  key={equivalence.id}
                  equivalence={equivalence}
                  onAdd={() => addRatio(equivalence.id)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {mode === 'predicting' && (
        <div className="fade-in rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-1 font-semibold text-warm-800">Áður en við reiknum</h3>
          <p className="mb-4 text-sm text-warm-600">
            Horfðu á keðjuna sem þú byggðir. Hvaða eining stendur eftir þegar allt hefur styst út?
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {predictions.map((option) => {
              const chosen = prediction === option.label;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setPrediction(option.label)}
                  disabled={prediction !== null}
                  className={`game-btn rounded-lg border-2 px-4 py-3 text-left transition disabled:cursor-default ${
                    prediction === null
                      ? 'border-warm-200 hover:border-kvenno-orange hover:bg-orange-50'
                      : option.correct
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : chosen
                          ? 'border-red-400 bg-red-50 text-red-900'
                          : 'border-warm-200 opacity-50'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {prediction !== null && (
            <div className="fade-in mt-4">
              <p className="text-sm text-warm-700">
                {predictions.find((o) => o.label === prediction)?.correct
                  ? 'Rétt lesið úr keðjunni. Sjáum hana ganga upp skref fyrir skref.'
                  : 'Ekki alveg — keðjan þín endar á annarri einingu en þú bjóst við. Fylgstu með hvar hún sveigir af leið.'}
              </p>
              <button
                type="button"
                onClick={() => setMode('tracing')}
                className="game-btn mt-3 rounded-lg bg-kvenno-orange px-5 py-2.5 font-semibold text-white hover:bg-kvenno-orange-dark"
              >
                Sýna útreikninginn
              </button>
            </div>
          )}
        </div>
      )}

      {(mode === 'tracing' || mode === 'correcting' || mode === 'solved') && (
        <div className="rounded-xl bg-warm-50 p-5 shadow-sm">
          <SolveTrace
            start={problem.start}
            startLabel={problem.startLabel}
            steps={result.steps}
            revealed={mode === 'tracing' ? revealed : result.steps.length}
            failedStep={result.failedSlot}
          />

          {mode === 'tracing' && revealed < result.steps.length && (
            <button
              type="button"
              onClick={() => setRevealed(result.steps.length)}
              className="game-btn mt-4 rounded-lg border border-warm-300 bg-white px-4 py-2 text-sm text-warm-700 hover:bg-warm-100"
            >
              Sýna öll skrefin strax
            </button>
          )}

          {mode === 'solved' && (
            <div className="fade-in mt-4 rounded-lg border-2 border-green-400 bg-green-50 p-4">
              <p className="font-semibold text-green-900">
                Keðjan gengur upp. Allar einingar styttust út nema markið.
              </p>
              <p className="mt-2 text-lg text-green-900">
                Svar: <UnitsDisplay quantity={result.final} className="font-bold" />
              </p>
              <p className="mt-3 rounded-lg bg-white/70 p-3 text-sm text-green-900">
                <strong>Af hverju skiptir þetta máli?</strong> {problem.why}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={nextProblem}
                  className="game-btn rounded-lg bg-kvenno-orange px-5 py-2.5 font-semibold text-white hover:bg-kvenno-orange-dark"
                >
                  {index + 1 >= problems.length ? 'Ljúka' : 'Næsta dæmi'}
                </button>
                <button
                  type="button"
                  onClick={resetProblem}
                  className="game-btn rounded-lg border border-warm-300 bg-white px-4 py-2.5 text-warm-700 hover:bg-warm-50"
                >
                  Prófa aðra leið
                </button>
              </div>
            </div>
          )}

          {mode === 'correcting' && prompt && (
            <div className="fade-in mt-4 rounded-lg border-2 border-amber-400 bg-amber-50 p-4">
              <p className="text-amber-900">{prompt.problem}</p>
              <p className="mt-3 font-semibold text-amber-900">{prompt.question}</p>
              <div className="mt-3 grid gap-2">
                {prompt.options.map((option) => {
                  const chosen = chosenFix === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setChosenFix(option.id)}
                      className={`game-btn rounded-lg border-2 px-4 py-2.5 text-left transition ${
                        chosen
                          ? option.correct
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-red-400 bg-red-50 text-red-900'
                          : 'border-warm-200 bg-white hover:border-amber-500'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {chosenOption && (
                <div className="fade-in mt-3">
                  <p
                    className={`rounded-lg p-3 text-sm ${
                      chosenOption.correct
                        ? 'bg-green-100 text-green-900'
                        : 'bg-red-100 text-red-900'
                    }`}
                  >
                    {chosenOption.explanation}
                  </p>
                  {chosenOption.correct ? (
                    <button
                      type="button"
                      onClick={() => applyFix(chosenOption.id)}
                      className="game-btn mt-3 rounded-lg bg-kvenno-orange px-5 py-2.5 font-semibold text-white hover:bg-kvenno-orange-dark"
                    >
                      {chosenOption.id === 'addStep' ? 'Lengja keðjuna' : 'Laga og reyna aftur'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setChosenFix(null)}
                      className="game-btn mt-3 rounded-lg border border-warm-300 bg-white px-4 py-2 text-sm text-warm-700 hover:bg-warm-50"
                    >
                      Velja aftur
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
