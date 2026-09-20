import { useMemo, useState } from 'react';

import { SCENARIOS } from '../data/problems';
import { renderEquation, type Term } from '../engine/precipitation';

/**
 * Beita — the whole prediction, start to finish, on a scenario the student has
 * not been walked through.
 *
 * Three commits in order: does anything precipitate, what is it, and what is
 * the nettójónajafna. Each is committed before the next is shown, so the answer
 * to one cannot be read off the scaffolding of the next.
 *
 * **The net ionic equation is built by selecting ions, never typed**, and that
 * is a deliberate repair of a specific defect rather than a style choice.
 * `ORPHANED_GAMES_ASSESSMENT.md:326` measured the old game's free-text grader:
 * it compared the raw string against a Unicode-subscript answer, so **six of
 * its eight precipitates were unanswerable from an Icelandic keyboard** — and
 * the placeholder told the student to type `BaSO₄(s)`. Worse, `Level3.tsx:81`
 * set `isCorrect = true` on any submission at all, so the accuracy readout was
 * fiction. Selecting from a tray of the ions actually present is answerable on
 * any keyboard and is graded against a derived answer, not a stored string.
 *
 * The same shape as `1-ar/nafnakerfid`'s name builder, which is this repo's
 * precedent for the identical problem: an input a student cannot physically
 * produce is not an assessment.
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

type Stage = 'predict' | 'identify' | 'build' | 'done';

/** A run is every scenario, in a fixed teaching order: easy, then the traps. */
const RUN = [...SCENARIOS].sort((a, b) => {
  const order = { ledd: 0, mid: 1, thung: 2 } as const;
  return order[a.difficulty] - order[b.difficulty];
});

export function BeitaScreen({ onComplete, onBack }: Props) {
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<Stage>('predict');
  const [chosen, setChosen] = useState<string | null>(null);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [wrongAt, setWrongAt] = useState<Stage | null>(null);
  const [solved, setSolved] = useState(0);

  const scenario = RUN[index];
  const { reaction } = scenario;

  /** The four ions in the beaker — the tray the student builds from. */
  const tray = useMemo(
    () =>
      [
        reaction.reactants[0].cation,
        reaction.reactants[0].anion,
        reaction.reactants[1].cation,
        reaction.reactants[1].anion,
      ].map((i) => i.formula),
    [reaction]
  );

  const expectedLeft = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of reaction.net.left) map[t.species] = t.coefficient;
    return map;
  }, [reaction]);

  const reset = (nextIndex: number) => {
    setIndex(nextIndex);
    setStage('predict');
    setChosen(null);
    setPicks({});
    setWrongAt(null);
  };

  const submitPrediction = (value: boolean) => {
    if (value !== reaction.formsPrecipitate) {
      setWrongAt('predict');
      setStage('done');
      return;
    }
    if (!reaction.formsPrecipitate) {
      setSolved(solved + 1);
      setStage('done');
      return;
    }
    setStage('identify');
  };

  const submitIdentity = (formula: string) => {
    setChosen(formula);
    if (!reaction.precipitates.some((p) => p.formula === formula)) {
      setWrongAt('identify');
      setStage('done');
      return;
    }
    setStage('build');
  };

  const submitEquation = () => {
    const chosenEntries = Object.entries(picks).filter(([, n]) => n > 0);
    const matches =
      chosenEntries.length === Object.keys(expectedLeft).length &&
      chosenEntries.every(([species, n]) => expectedLeft[species] === n);
    if (!matches) setWrongAt('build');
    else setSolved(solved + 1);
    setStage('done');
  };

  const bump = (species: string, delta: number) =>
    setPicks({ ...picks, [species]: Math.max(0, Math.min(6, (picks[species] ?? 0) + delta)) });

  const last = index + 1 >= RUN.length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-warm-800">Beita — spáðu fyrir um hvarfið</h2>
          <button onClick={onBack} className="text-sm text-warm-500 underline">
            Til baka
          </button>
        </div>

        <p className="mb-4 text-sm text-warm-600">
          Dæmi {index + 1} af {RUN.length} · {solved} leyst
        </p>

        <div className="mb-6 rounded-lg border-2 border-warm-200 bg-warm-50 p-5 text-center">
          <p className="font-mono text-xl text-warm-900">
            {reaction.reactants[0].formula}(aq) + {reaction.reactants[1].formula}(aq)
          </p>
          <p className="mt-2 text-sm text-warm-600">
            Jónir í glasinu: <span className="font-mono">{tray.join(', ')}</span>
          </p>
        </div>

        {stage === 'predict' && (
          <div>
            <p className="mb-3 font-semibold text-warm-800">Myndast botnfall?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => submitPrediction(true)}
                className="game-btn flex-1 rounded-lg border-2 border-warm-200 bg-white px-4 py-3 font-semibold text-warm-700 hover:bg-warm-50"
              >
                Já, botnfall myndast
              </button>
              <button
                type="button"
                onClick={() => submitPrediction(false)}
                className="game-btn flex-1 rounded-lg border-2 border-warm-200 bg-white px-4 py-3 font-semibold text-warm-700 hover:bg-warm-50"
              >
                Nei, ekkert gerist
              </button>
            </div>
          </div>
        )}

        {stage === 'identify' && (
          <div>
            <p className="mb-3 font-semibold text-warm-800">Hvort efnið fellur út?</p>
            <div className="flex gap-3">
              {reaction.products.map((p) => (
                <button
                  key={p.formula}
                  type="button"
                  onClick={() => submitIdentity(p.formula)}
                  className="game-btn flex-1 rounded-lg border-2 border-warm-200 bg-white px-4 py-3 font-mono text-lg text-warm-800 hover:bg-warm-50"
                >
                  {p.formula}
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === 'build' && (
          <div>
            <p className="mb-1 font-semibold text-warm-800">Byggðu nettójónajöfnuna.</p>
            <p className="mb-4 text-sm text-warm-600">
              Veldu jónirnar sem taka raunverulega þátt og settu réttan stuðul á hverja.
              Áhorfendajónirnar skilurðu eftir á núlli.
            </p>

            <div className="mb-4 space-y-2">
              {tray.map((species) => (
                <div
                  key={species}
                  className="flex items-center justify-between rounded-lg border-2 border-warm-200 bg-white px-3 py-2"
                >
                  <span className="font-mono text-lg text-warm-800">{species}(aq)</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Fækka ${species}`}
                      onClick={() => bump(species, -1)}
                      className="game-btn h-8 w-8 rounded border border-warm-300 text-warm-700 hover:bg-warm-100"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-mono text-lg">{picks[species] ?? 0}</span>
                    <button
                      type="button"
                      aria-label={`Fjölga ${species}`}
                      onClick={() => bump(species, 1)}
                      className="game-btn h-8 w-8 rounded border border-warm-300 text-warm-700 hover:bg-warm-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4 rounded-lg bg-warm-50 p-3 font-mono text-sm text-warm-800">
              {preview(picks)} → {chosen}(s)
            </div>

            <button
              type="button"
              onClick={submitEquation}
              className="game-btn w-full rounded-lg bg-kvenno-orange px-4 py-3 font-semibold text-white hover:bg-kvenno-orange-dark"
            >
              Athuga jöfnuna
            </button>
          </div>
        )}

        {stage === 'done' && (
          <div
            className={`rounded-lg border-2 p-4 ${
              wrongAt ? 'border-amber-300 bg-amber-50' : 'border-green-300 bg-green-50'
            }`}
          >
            <p className="mb-2 font-semibold text-warm-900">
              {wrongAt === 'predict' &&
                (reaction.formsPrecipitate
                  ? 'Það myndast botnfall hér.'
                  : 'Ekkert botnfall myndast hér.')}
              {wrongAt === 'identify' && 'Það er hitt efnið sem fellur út.'}
              {wrongAt === 'build' && 'Jafnan stemmir ekki alveg.'}
              {!wrongAt && 'Rétt.'}
            </p>

            {reaction.formsPrecipitate ? (
              <>
                <p className="mb-2 text-sm text-warm-800">
                  {reaction.precipitates.map((p) => p.formula).join(' og ')} er óleysanlegt.{' '}
                  {reaction.verdicts.find((v) => !v.verdict.soluble)!.verdict.rule.text}{' '}
                  {reaction.verdicts.find((v) => !v.verdict.soluble)!.verdict.rule.exceptionText}
                </p>
                <p className="font-mono text-sm text-warm-900">{renderEquation(reaction.net)}</p>
                <p className="mt-2 text-sm text-warm-700">
                  Áhorfendajónir: {reaction.spectators.map((s) => s.formula).join(', ')}
                </p>
              </>
            ) : (
              <p className="text-sm text-warm-800">
                Bæði möguleg efni — {reaction.products.map((p) => p.formula).join(' og ')} — eru
                leysanleg, svo allar fjórar jónirnar eru áhorfendajónir og engin nettójónajafna er
                til.
              </p>
            )}

            <p className="mt-3 text-sm text-warm-700">{scenario.context}</p>

            <button
              type="button"
              onClick={() => (last ? onComplete() : reset(index + 1))}
              className="game-btn mt-4 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
            >
              {last ? 'Ljúka' : 'Næsta dæmi'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** What the student has built so far, rendered the way the answer will be. */
function preview(picks: Record<string, number>): string {
  const terms: Term[] = Object.entries(picks)
    .filter(([, n]) => n > 0)
    .map(([species, coefficient]) => ({ species, coefficient, state: 'aq' as const }));
  if (terms.length === 0) return '…';
  return terms
    .map((t) => `${t.coefficient === 1 ? '' : t.coefficient}${t.species}(aq)`)
    .join(' + ');
}
