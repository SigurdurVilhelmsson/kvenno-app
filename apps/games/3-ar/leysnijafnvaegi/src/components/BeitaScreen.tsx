import { useState } from 'react';

import { FRACTIONAL_PROBLEMS, MIXING_PROBLEMS } from '../data/problems';
import { saltBy } from '../data/salts';
import { formatScientific, kspExpression } from '../engine/ksp';

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
    const right = guess === mixing.precipitates;
    setWrong(!right);
    if (right) setSolved(solved + 1);
    setStage('reveal');
  };

  const submitRanking = () => {
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
      <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-warm-800">
            {isMixing ? 'Beita — myndast botnfall?' : 'Beita — hvað fellur út fyrst?'}
          </h2>
          <button onClick={onBack} className="text-sm text-warm-500 underline">
            Til baka
          </button>
        </div>

        <p className="mb-4 text-sm text-warm-600">
          Dæmi {index + 1} af {total} · {solved} rétt
        </p>

        {isMixing ? (
          <>
            <div className="mb-6 rounded-xl border-2 border-warm-200 bg-warm-50 p-5">
              <p className="mb-3 text-warm-800">
                Er <span className="font-mono">{salt(mixing.formula)}</span> látið falla út?
              </p>
              <ul className="space-y-1 font-mono text-sm text-warm-700">
                <li>
                  {(mixing.cation.volume * 1000).toFixed(0)} mL af{' '}
                  {formatScientific(mixing.cation.concentration)} M {mixing.cation.source}
                </li>
                <li>
                  {(mixing.anion.volume * 1000).toFixed(0)} mL af{' '}
                  {formatScientific(mixing.anion.concentration)} M {mixing.anion.source}
                </li>
              </ul>
              <p className="mt-3 font-mono text-sm text-warm-600">
                {kspExpression(saltBy(mixing.formula))} = {formatScientific(mixing.ksp)}
              </p>
              {stage === 'predict' && (
                <p className="mt-3 rounded bg-white/70 p-2 text-xs text-warm-600">
                  Mundu að þynna fyrst. Heildarrúmmálið er{' '}
                  {((mixing.cation.volume + mixing.anion.volume) * 1000).toFixed(0)} mL.
                </p>
              )}
            </div>

            {stage === 'predict' ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => answerMixing(true)}
                  className="game-btn flex-1 rounded-lg border-2 border-warm-200 bg-white px-4 py-3 font-semibold text-warm-700 hover:bg-warm-50"
                >
                  Já, Q &gt; Ksp
                </button>
                <button
                  type="button"
                  onClick={() => answerMixing(false)}
                  className="game-btn flex-1 rounded-lg border-2 border-warm-200 bg-white px-4 py-3 font-semibold text-warm-700 hover:bg-warm-50"
                >
                  Nei, Q &lt; Ksp
                </button>
              </div>
            ) : (
              <Feedback wrong={wrong} onNext={advance} last={last}>
                <p className="mb-2 font-semibold text-warm-900">
                  {mixing.precipitates ? 'Botnfall myndast.' : 'Ekkert botnfall myndast.'}
                </p>
                <dl className="mb-2 space-y-1 font-mono text-sm text-warm-800">
                  <div>
                    Eftir þynningu: [{saltBy(mixing.formula).cation}] ={' '}
                    {formatScientific(mixing.diluted.cation, 3)} M, [{saltBy(mixing.formula).anion}]
                    = {formatScientific(mixing.diluted.anion, 3)} M
                  </div>
                  <div>
                    Q = {formatScientific(mixing.q, 3)} · Ksp = {formatScientific(mixing.ksp)}
                  </div>
                  <div>
                    Q / Ksp ={' '}
                    {mixing.ratio < 10 ? mixing.ratio.toFixed(2) : Math.round(mixing.ratio)}
                  </div>
                </dl>
                <p className="text-sm text-warm-700">{mixing.context}</p>
              </Feedback>
            )}
          </>
        ) : (
          <>
            <div className="mb-6 rounded-xl border-2 border-warm-200 bg-warm-50 p-5">
              <p className="mb-3 text-warm-800">
                {fractional.sharedIonName} er bætt hægt út í. Raðaðu efnunum eftir því hvað fellur
                út fyrst — smelltu í réttri röð.
              </p>
              <ul className="space-y-1 font-mono text-sm text-warm-700">
                {fractional.candidates.map((c) => (
                  <li key={c.formula}>
                    {c.formula} · Ksp = {formatScientific(saltBy(c.formula).ksp)}
                  </li>
                ))}
              </ul>
            </div>

            {stage === 'predict' ? (
              <>
                <div className="mb-4 flex flex-wrap gap-2">
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
              </>
            ) : (
              <Feedback wrong={wrong} onNext={advance} last={last}>
                <p className="mb-2 font-semibold text-warm-900">Rétt röð:</p>
                <ol className="mb-3 space-y-1 font-mono text-sm text-warm-800">
                  {fractional.order.map((o, i) => (
                    <li key={o.formula}>
                      {i + 1}. {o.formula} — þarf [{fractional.sharedIonName}] ={' '}
                      {formatScientific(o.threshold, 3)} M
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
          </>
        )}
      </div>
    </div>
  );
}

function salt(formula: string) {
  return formula;
}

function Feedback({
  wrong,
  onNext,
  last,
  children,
}: {
  wrong: boolean;
  onNext: () => void;
  last: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border-2 p-4 ${
        wrong ? 'border-amber-300 bg-amber-50' : 'border-green-300 bg-green-50'
      }`}
    >
      {children}
      <button
        type="button"
        onClick={onNext}
        className="game-btn mt-4 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
      >
        {last ? 'Ljúka' : 'Næsta dæmi'}
      </button>
    </div>
  );
}
