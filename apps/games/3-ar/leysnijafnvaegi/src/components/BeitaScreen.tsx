import { useEffect, useId, useRef, useState, type Ref } from 'react';

import { formatDecimal, useArmedAfter, useRevealAfterCommit } from '@shared/utils';

import { BackButton } from './BackButton';
import { Sci } from './Sci';
import { FRACTIONAL_PROBLEMS, MIXING_PROBLEMS } from '../data/problems';
import { saltBy } from '../data/salts';
import { kspExpression } from '../engine/ksp';
import { revealBelowFoldOnDesktop, useItemStart } from '../utils/desktopReveal';

/**
 * Beita — will it precipitate, and which one first?
 *
 * **The dilution is the student's to do.** Mixing 50 mL with 50 mL halves both
 * concentrations before Q can be computed, and mixing 25 mL with 75 mL does not
 * halve either of them. The old game pre-computed that step on all six of its
 * items and left a binary button (`ORPHANED_GAMES_ASSESSMENT.md:470`), which
 * removed the one part of the task students actually get wrong. Here the
 * diluted concentrations appear only after the prediction is committed.
 *
 * The second half is `hlutfelling`, and its point is the Mohr titration: the
 * salt with the *larger* Ksp precipitates first. A student who has learned
 * "lower Ksp comes down first" gets that one wrong, which is the intention —
 * the old game only ever posed it on pairs where the shortcut happened to
 * work.
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

type Stage = 'predict' | 'reveal';

export function BeitaScreen({ onComplete, onBack }: Props) {
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<Stage>('predict');
  const [wrong, setWrong] = useState(false);
  const [solved, setSolved] = useState(0);
  const [ranking, setRanking] = useState<string[]>([]);
  const problemRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // The next problem starts at the top of the card, not where "Næsta dæmi" was,
  // and focus moves to the new question (utils/desktopReveal.ts).
  const cardRef = useItemStart<HTMLDivElement>(index);
  // After the prediction, on a phone: from the problem through "Næsta dæmi" if
  // it fits, else the working from its verdict. The Já/Nei buttons and "Athuga
  // röðina" are gone by then, so focus moves to the working (design P3).
  useRevealAfterCommit(stage === 'reveal', () => ({
    bottom: nextRef.current,
    tops: [problemRef.current, feedbackRef.current],
    focus: feedbackRef.current,
  }));
  // A desktop window keeps what the game's own helper did there: working that
  // ran past the bottom edge is brought up to show it.
  useEffect(() => {
    if (stage === 'reveal') revealBelowFoldOnDesktop(feedbackRef.current);
  }, [stage]);
  // A double tap on Já/Nei or "Athuga röðina" must not press "Næsta dæmi".
  const armed = useArmedAfter(400, `${index}:${stage}`);

  const mixingCount = MIXING_PROBLEMS.length;
  const isMixing = index < mixingCount;
  const fractional = FRACTIONAL_PROBLEMS[index - mixingCount];
  const mixing = MIXING_PROBLEMS[index];
  const total = mixingCount + FRACTIONAL_PROBLEMS.length;
  const last = index + 1 >= total;

  const advance = () => {
    if (last) {
      onComplete();
      return;
    }
    setIndex(index + 1);
    setStage('predict');
    setWrong(false);
    setRanking([]);
  };

  const answerMixing = (guess: boolean) => {
    if (stage !== 'predict') return;
    const right = guess === mixing.precipitates;
    setWrong(!right);
    if (right) setSolved(solved + 1);
    setStage('reveal');
  };

  const submitRanking = () => {
    if (stage !== 'predict') return;
    const right =
      ranking.length === fractional.order.length &&
      ranking.every((f, i) => f === fractional.order[i].formula);
    setWrong(!right);
    if (right) setSolved(solved + 1);
    setStage('reveal');
  };

  const toggleRank = (formula: string) => {
    setRanking(
      ranking.includes(formula) ? ranking.filter((f) => f !== formula) : [...ranking, formula]
    );
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div ref={cardRef} className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-6 flex items-baseline justify-between gap-3 phone:mb-2">
          <h2 className="min-w-0 text-xl font-bold text-warm-800 sm:text-2xl phone:text-base">
            {isMixing ? 'Beita — myndast botnfall?' : 'Beita — hvað fellur út fyrst?'}
          </h2>
          <BackButton onClick={onBack} />
        </div>

        <p className="mb-4 text-sm text-warm-600 phone:mb-2">
          Dæmi {index + 1} af {total} · {solved} rétt
        </p>

        {/* On a phone held sideways the problem sits beside the answer. */}
        {isMixing ? (
          <div className="phone-land:grid phone-land:grid-cols-2 phone-land:items-start phone-land:gap-4">
            <div
              ref={problemRef}
              className="mb-6 rounded-xl border-2 border-warm-200 bg-warm-50 p-4 sm:p-5 phone:mb-3 phone:p-3"
            >
              <p data-item-start className="mb-3 text-warm-800 phone:mb-2">
                Er <span className="font-mono">{salt(mixing.formula)}</span> látið falla út?
              </p>
              <ul className="space-y-1 font-mono text-sm text-warm-700">
                <li>
                  {(mixing.cation.volume * 1000).toFixed(0)} mL af{' '}
                  <Sci value={mixing.cation.concentration} unit="M" /> {mixing.cation.source}
                </li>
                <li>
                  {(mixing.anion.volume * 1000).toFixed(0)} mL af{' '}
                  <Sci value={mixing.anion.concentration} unit="M" /> {mixing.anion.source}
                </li>
              </ul>
              <p className="mt-3 font-mono text-sm text-warm-600 phone:mt-2">
                {kspExpression(saltBy(mixing.formula))} = <Sci value={mixing.ksp} />
              </p>
              {stage === 'predict' && (
                <p className="mt-3 rounded bg-white/70 p-2 text-xs text-warm-600 phone:mt-2">
                  Mundu að þynna fyrst. Heildarrúmmálið er{' '}
                  {((mixing.cation.volume + mixing.anion.volume) * 1000).toFixed(0)} mL.
                </p>
              )}
            </div>

            {stage === 'predict' ? (
              // Each relation is held whole, so a narrow button breaks after
              // "Já," or "Nei," and never between Q and Ksp.
              <div key="predict" className="flex gap-3">
                <button
                  type="button"
                  onClick={() => answerMixing(true)}
                  className="game-btn flex-1 rounded-lg border-2 border-warm-200 bg-white px-3 py-3 font-semibold text-warm-700 hover:bg-warm-50 sm:px-4"
                >
                  Já, <span className="whitespace-nowrap">Q &gt; Ksp</span>
                </button>
                <button
                  type="button"
                  onClick={() => answerMixing(false)}
                  className="game-btn flex-1 rounded-lg border-2 border-warm-200 bg-white px-3 py-3 font-semibold text-warm-700 hover:bg-warm-50 sm:px-4"
                >
                  Nei, <span className="whitespace-nowrap">Q &lt; Ksp</span>
                </button>
              </div>
            ) : (
              <Feedback
                key="reveal"
                ref={feedbackRef}
                nextRef={nextRef}
                wrong={wrong}
                onNext={armed(advance)}
                last={last}
              >
                <p className="mb-2 font-semibold text-warm-900">
                  {mixing.precipitates ? 'Botnfall myndast.' : 'Ekkert botnfall myndast.'}
                </p>
                <dl className="mb-2 space-y-1 font-mono text-sm text-warm-800">
                  {/* Each "[ion] = value" is held whole, so a phone breaks the
                      line between the two concentrations rather than at an
                      equals sign in the middle of one. */}
                  <div>
                    Eftir þynningu:{' '}
                    <span className="whitespace-nowrap">
                      [{saltBy(mixing.formula).cation}] ={' '}
                      <Sci value={mixing.diluted.cation} figures={3} unit="M" />,
                    </span>{' '}
                    <span className="whitespace-nowrap">
                      [{saltBy(mixing.formula).anion}] ={' '}
                      <Sci value={mixing.diluted.anion} figures={3} unit="M" />
                    </span>
                  </div>
                  <div>
                    <span className="whitespace-nowrap">
                      Q = <Sci value={mixing.q} figures={3} />
                    </span>{' '}
                    ·{' '}
                    <span className="whitespace-nowrap">
                      Ksp = <Sci value={mixing.ksp} />
                    </span>
                  </div>
                  <div>
                    Q / Ksp ={' '}
                    {mixing.ratio < 10 ? formatDecimal(mixing.ratio, 2) : Math.round(mixing.ratio)}
                  </div>
                </dl>
                <p className="text-sm text-warm-700">{mixing.context}</p>
              </Feedback>
            )}
          </div>
        ) : (
          <div className="phone-land:grid phone-land:grid-cols-2 phone-land:items-start phone-land:gap-4">
            <div
              ref={problemRef}
              className="mb-6 rounded-xl border-2 border-warm-200 bg-warm-50 p-4 sm:p-5 phone:mb-3 phone:p-3"
            >
              <p data-item-start className="mb-3 text-warm-800 phone:mb-2">
                {fractional.sharedIonName} er bætt hægt út í. Raðaðu efnunum eftir því hvað fellur
                út fyrst — smelltu í réttri röð.
              </p>
              <ul className="space-y-1 font-mono text-sm text-warm-700">
                {fractional.candidates.map((c) => (
                  <li key={c.formula}>
                    {c.formula} · Ksp = <Sci value={saltBy(c.formula).ksp} />
                  </li>
                ))}
              </ul>
            </div>

            {stage === 'predict' ? (
              <div key="predict">
                <div className="mb-4 flex flex-wrap gap-2 phone:mb-3">
                  {fractional.candidates.map((c) => {
                    const position = ranking.indexOf(c.formula);
                    return (
                      <button
                        key={c.formula}
                        type="button"
                        onClick={() => toggleRank(c.formula)}
                        className={`game-btn rounded-lg border-2 px-4 py-3 font-mono ${
                          position >= 0
                            ? 'border-orange-400 bg-orange-50 text-orange-900'
                            : 'border-warm-200 bg-white text-warm-700 hover:bg-warm-50'
                        }`}
                      >
                        {position >= 0 && <span className="mr-2 font-bold">{position + 1}.</span>}
                        {c.formula}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={submitRanking}
                  disabled={ranking.length !== fractional.candidates.length}
                  className="game-btn w-full rounded-lg bg-kvenno-orange px-4 py-3 font-semibold text-white hover:bg-kvenno-orange-dark disabled:cursor-not-allowed disabled:bg-warm-300"
                >
                  Athuga röðina
                </button>
              </div>
            ) : (
              <Feedback
                key="reveal"
                ref={feedbackRef}
                nextRef={nextRef}
                wrong={wrong}
                onNext={armed(advance)}
                last={last}
              >
                <p className="mb-2 font-semibold text-warm-900">Rétt röð:</p>
                <ol className="mb-3 space-y-1 font-mono text-sm text-warm-800">
                  {fractional.order.map((o, i) => (
                    <li key={o.formula}>
                      {i + 1}. {o.formula} — þarf{' '}
                      <span className="whitespace-nowrap">
                        [{fractional.sharedIonName}] ={' '}
                        <Sci value={o.threshold} figures={3} unit="M" />
                      </span>
                    </li>
                  ))}
                </ol>
                {fractional.defeatsKspOrdering && (
                  <p className="mb-2 rounded border border-amber-300 bg-white p-2 text-sm text-amber-900">
                    Taktu eftir: þetta er <strong>ekki</strong> sama röð og Ksp gefur. Lægsta Ksp
                    fellur ekki út fyrst þegar hlutföllin eru ólík, því þá fer jónin í mismunandi
                    veldi í hvoru margfeldinu.
                  </p>
                )}
                <p className="text-sm text-warm-700">{fractional.context}</p>
              </Feedback>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function salt(formula: string) {
  return formula;
}

function Feedback({
  ref,
  nextRef,
  wrong,
  onNext,
  last,
  children,
}: {
  ref: Ref<HTMLDivElement>;
  nextRef: Ref<HTMLButtonElement>;
  wrong: boolean;
  onNext: () => void;
  last: boolean;
  children: React.ReactNode;
}) {
  const verdictId = useId();
  return (
    // The group focus moves to after the prediction, named by the verdict.
    <div
      ref={ref}
      role="group"
      aria-labelledby={verdictId}
      tabIndex={-1}
      className={`rounded-lg border-2 p-4 phone:p-3 ${
        wrong ? 'border-amber-300 bg-amber-50' : 'border-green-300 bg-green-50'
      }`}
    >
      {/* Said in words as well as by the panel's colour, which is all a
          colour-blind student or a screen reader would otherwise have. */}
      <p id={verdictId} className="mb-2 font-semibold text-warm-900">
        {wrong ? 'Ekki rétt.' : 'Rétt.'}
      </p>
      {children}
      <button
        ref={nextRef}
        type="button"
        onClick={onNext}
        className="game-btn mt-4 phone:mt-3 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 pointer-coarse:min-h-11"
      >
        {last ? 'Ljúka' : 'Næsta dæmi'}
      </button>
    </div>
  );
}
