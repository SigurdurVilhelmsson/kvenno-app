import { useEffect, useMemo, useRef, useState } from 'react';

import {
  focusTarget,
  isPhone,
  revealSpan,
  shuffleArray,
  useArmedAfter,
  useItemTop,
} from '@shared/utils';

import { SCENARIOS } from '../data/problems';
import { renderEquation, type Term } from '../engine/precipitation';
import { revealOnDesktop } from '../utils/desktopReveal';

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

  // Every precipitating scenario is written with the precipitating cation in
  // the first bottle, so in data order the answer to "Hvort efnið fellur út?"
  // was always the left-hand button. Shuffle once per scenario; grading
  // compares formulas, so nothing else depends on the order.
  const productOptions = useMemo(() => shuffleArray(reaction.products), [reaction]);

  const expectedLeft = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of reaction.net.left) map[t.species] = t.coefficient;
    return map;
  }, [reaction]);

  // Each commit swaps the question below the scenario card, and the button that
  // did it has gone. Focus moves to the new question (or, once the scenario is
  // done, to the feedback, not to "Næsta dæmi": design P3). On a phone the
  // scenario card comes into view with the new question and its buttons where
  // they fit; the feedback likewise, down to "Næsta dæmi", and where that does
  // not fit the verdict at the top, read down to the button. "Næsta dæmi"
  // brings the card's top back under the header and focuses the new scenario.
  // A desktop window keeps what the game's own helper did there.
  const counterRef = useRef<HTMLParagraphElement>(null);
  const scenarioRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLParagraphElement>(null);
  const verdictRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useItemTop<HTMLDivElement>(index);
  const shown = useRef({ index, stage });
  useEffect(() => {
    const before = shown.current;
    shown.current = { index, stage };
    if (index !== before.index) {
      if (!isPhone()) revealOnDesktop(counterRef.current, stageRef.current);
      return;
    }
    if (stage === before.stage) return;
    if (isPhone()) {
      const done = stage === 'done';
      revealSpan(stageRef.current, [
        scenarioRef.current,
        done ? stageRef.current : questionRef.current,
        done ? verdictRef.current : null,
      ]);
    } else {
      revealOnDesktop(stageRef.current);
    }
    focusTarget(stage === 'done' ? stageRef.current : questionRef.current);
  }, [index, stage]);

  // A new question's buttons, and "Næsta dæmi", take no press within 400 ms of
  // appearing where the last button was: a double tap cannot answer the next
  // question, or leave the scenario, unread.
  const armed = useArmedAfter(400, `${index}:${stage}`);

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
      <div ref={cardRef} className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-6 flex items-baseline justify-between gap-3 phone:mb-2">
          <h2 className="text-xl font-bold text-warm-800 sm:text-2xl phone:min-w-0 phone:text-base">
            Beita — spáðu fyrir um hvarfið
          </h2>
          <button
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline pointer-coarse:-my-3 pointer-coarse:py-3"
          >
            Til baka
          </button>
        </div>

        <p ref={counterRef} className="mb-4 text-sm text-warm-600 phone:mb-1">
          Dæmi {index + 1} af {RUN.length} · {solved} leyst
        </p>

        <div
          ref={scenarioRef}
          data-item-start
          className="mb-6 rounded-lg border-2 border-warm-200 bg-warm-50 p-5 text-center phone:mb-3 phone:p-3"
        >
          <p className="font-mono text-xl text-warm-900 phone:text-lg">
            {reaction.reactants[0].formula}(aq) + {reaction.reactants[1].formula}(aq)
          </p>
          <p className="mt-2 text-sm text-warm-600 phone:mt-1">
            Jónir í glasinu: <span className="font-mono">{tray.join(', ')}</span>
          </p>
        </div>

        {stage === 'predict' && (
          <div ref={stageRef}>
            <p ref={questionRef} className="mb-3 font-semibold text-warm-800 phone:mb-2">
              Myndast botnfall?
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                type="button"
                onClick={armed(() => submitPrediction(true))}
                className="game-btn flex-1 rounded-lg border-2 border-warm-200 bg-white px-2 py-3 font-semibold text-warm-700 hover:bg-warm-50 sm:px-4"
              >
                Já, botnfall myndast
              </button>
              <button
                type="button"
                onClick={armed(() => submitPrediction(false))}
                className="game-btn flex-1 rounded-lg border-2 border-warm-200 bg-white px-2 py-3 font-semibold text-warm-700 hover:bg-warm-50 sm:px-4"
              >
                Nei, ekkert gerist
              </button>
            </div>
          </div>
        )}

        {stage === 'identify' && (
          <div ref={stageRef}>
            <p ref={questionRef} className="mb-3 font-semibold text-warm-800 phone:mb-2">
              Hvort efnið fellur út?
            </p>
            <div className="flex gap-2 sm:gap-3">
              {productOptions.map((p) => (
                <button
                  key={p.formula}
                  type="button"
                  onClick={armed(() => submitIdentity(p.formula))}
                  className="game-btn flex-1 rounded-lg border-2 border-warm-200 bg-white px-2 py-3 font-mono text-lg text-warm-800 hover:bg-warm-50 sm:px-4"
                >
                  {p.formula}
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === 'build' && (
          <div ref={stageRef}>
            <p ref={questionRef} className="mb-1 font-semibold text-warm-800">
              Byggðu nettójónajöfnuna.
            </p>
            <p className="mb-4 text-sm text-warm-600 phone:mb-2">
              Veldu jónirnar sem taka raunverulega þátt og settu réttan stuðul á hverja.
              Áhorfendajónirnar skilurðu eftir á núlli.
            </p>

            {/* On a phone two ions to a row, so the four rows are two; on a
                portrait phone each stepper goes under its ion to fit. */}
            <div className="mb-4 space-y-2 phone:mb-2 phone:grid phone:grid-cols-2 phone:gap-2 phone:space-y-0">
              {tray.map((species) => (
                <div
                  key={species}
                  className="flex items-center justify-between gap-2 rounded-lg border-2 border-warm-200 bg-white px-2 py-2 sm:px-3 max-sm:min-w-0 max-sm:flex-col max-sm:gap-1 max-sm:px-1 max-sm:py-1.5"
                >
                  <span className="min-w-0 font-mono text-lg text-warm-800">{species}(aq)</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Fækka ${species}`}
                      onClick={armed(() => bump(species, -1))}
                      className="game-btn h-8 w-8 rounded border border-warm-300 text-warm-700 hover:bg-warm-100 pointer-coarse:h-11 pointer-coarse:w-11"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-mono text-lg">{picks[species] ?? 0}</span>
                    <button
                      type="button"
                      aria-label={`Fjölga ${species}`}
                      onClick={armed(() => bump(species, 1))}
                      className="game-btn h-8 w-8 rounded border border-warm-300 text-warm-700 hover:bg-warm-100 pointer-coarse:h-11 pointer-coarse:w-11"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4 rounded-lg bg-warm-50 p-3 font-mono text-sm text-warm-800 phone:mb-3 phone:p-2">
              {preview(picks)} → {chosen}(s)
            </div>

            <button
              type="button"
              onClick={armed(submitEquation)}
              className="game-btn w-full rounded-lg bg-kvenno-orange px-4 py-3 font-semibold text-white hover:bg-kvenno-orange-dark"
            >
              Athuga jöfnuna
            </button>
          </div>
        )}

        {stage === 'done' && (
          <div
            ref={stageRef}
            role="group"
            aria-labelledby="beita-verdict"
            className={`rounded-lg border-2 p-4 phone:p-3 ${
              wrongAt ? 'border-amber-300 bg-amber-50' : 'border-green-300 bg-green-50'
            }`}
          >
            <p ref={verdictRef} id="beita-verdict" className="mb-2 font-semibold text-warm-900">
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

            <p className="mt-3 text-sm text-warm-700 phone:mt-2">{scenario.context}</p>

            <button
              key="naesta"
              type="button"
              onClick={armed(() => (last ? onComplete() : reset(index + 1)))}
              className="game-btn mt-4 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 pointer-coarse:min-h-11"
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
