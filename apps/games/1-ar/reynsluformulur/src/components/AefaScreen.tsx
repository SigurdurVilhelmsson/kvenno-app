import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import {
  DECIMAL_INPUT_PROPS,
  focusTarget,
  isPhone,
  parseStudentNumber,
  revealSpan,
  useArmedAfter,
  useItemTop,
} from '@shared/utils';

import { PROBLEMS } from '../data/problems';
import { deriveEmpirical, type Derivation } from '../engine/empirical';
import { revealOnDesktop } from '../utils/desktopReveal';

/**
 * Æfa — the student fills the table, one column at a time.
 *
 * This is the shape `ORPHANED_GAMES_ASSESSMENT.md:544` asked for: the old
 * game's step table "inverted into a live table the student fills column by
 * column", which "makes per-step diagnosis possible". The old game printed the
 * completed table above a live input — its scaffold **was** the answer, and 18
 * of its 30 items exposed the answer before commit.
 *
 * Here nothing is shown before it is earned. A column unlocks only once the
 * previous one is right, so a wrong mole count cannot silently poison the
 * ratio, and the feedback can say *which* column went wrong rather than only
 * that the formula does not match.
 *
 * No score and no timer — a practice phase, per the April 2026 structure.
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

/** Entries are compared at 2 %, which is looser than the engine's own rounding. */
const TOLERANCE = 0.02;

const fmt = (n: number, dp: number) => n.toFixed(dp).replace('.', ',');

type Column = 'moles' | 'ratio' | 'subscript';

const COLUMN_LABEL: Record<Column, string> = {
  moles: 'Mól',
  ratio: 'Hlutfall',
  subscript: 'Vísitala',
};

/**
 * The column as the verdict names it, the definite compound `…súlan`. It is
 * not the label with `súlan` pasted on: `vísitala` compounds on its genitive
 * `vísitölu-` and `hlutfall` on `hlutfalls-`, as `vatnssúla` and
 * `kvikasilfurssúla` do in the textbook, so each form is written out here.
 */
const COLUMN_HEADING: Record<Column, string> = {
  moles: 'Mólsúlan',
  ratio: 'Hlutfallssúlan',
  subscript: 'Vísitölusúlan',
};

const PROMPT: Record<Column, string> = {
  moles: 'Deildu hverju prósenti (sem grömmum) með mólmassa frumefnisins.',
  ratio: 'Deildu hverjum mólfjölda með þeim minnsta.',
  subscript: 'Margfaldaðu hlutföllin upp þangað til allar tölurnar eru heilar.',
};

function close(got: number, want: number): boolean {
  if (!Number.isFinite(got)) return false;
  return Math.abs(got - want) <= Math.abs(want) * TOLERANCE;
}

export function AefaScreen({ onComplete, onBack }: Props) {
  const [index, setIndex] = useState(0);
  const [column, setColumn] = useState<Column>('moles');
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [verdict, setVerdict] = useState<null | { ok: boolean; wrong: string[] }>(null);

  const problem = PROBLEMS[index];
  const derived: Derivation = useMemo(
    () =>
      deriveEmpirical(Object.fromEntries(problem.percentages.map((p) => [p.element, p.percent]))),
    [problem]
  );

  const expected = (element: string): number => {
    const row = derived.rows.find((r) => r.element === element)!;
    return column === 'moles' ? row.moles : column === 'ratio' ? row.ratio : row.subscript;
  };

  const filled = derived.rows.every((r) => (entries[r.element] ?? '').trim() !== '');

  const submit = () => {
    if (!filled || verdict?.ok) return;
    const wrong = derived.rows
      .filter((r) => !close(parseStudentNumber(entries[r.element] ?? ''), expected(r.element)))
      .map((r) => r.element);
    setVerdict({ ok: wrong.length === 0, wrong });
  };

  const next = () => {
    setEntries({});
    setVerdict(null);
    if (column === 'moles') setColumn('ratio');
    else if (column === 'ratio') setColumn('subscript');
    else {
      setColumn('moles');
      if (index + 1 < PROBLEMS.length) setIndex(index + 1);
      else onComplete();
    }
  };

  const decimals = column === 'moles' ? 3 : column === 'ratio' ? 2 : 0;

  const rowsRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const step = `${index}-${column}`;

  // After "Næsta súla" / "Næsta efni": on a phone, the compound's top back
  // under the header if it has scrolled away — on a phone on its side, the
  // button is below the fold — and focus to the new step, which names the
  // column and the compound. A desktop window keeps what the game's own helper
  // did there: the compound and its empty inputs brought into view when they
  // are not.
  const problemRef = useItemTop<HTMLDivElement>(step);
  const stepBefore = useRef(step);
  useEffect(() => {
    if (step === stepBefore.current) return;
    stepBefore.current = step;
    if (!isPhone()) revealOnDesktop(problemRef.current, rowsRef.current);
  }, [step, problemRef]);

  // After "Athuga": on a phone, from the compound through the buttons if it
  // fits, else from the inputs or the verdict — the verdict box opens between
  // the inputs and the buttons. Focus moves to the verdict, or, when a right
  // column opens no box, to the inputs with their ticks; not to the button
  // (design P3), so a second Enter does nothing. A desktop window keeps what
  // the game's own helper did there: a verdict box and the buttons brought
  // into view when they are not.
  useEffect(() => {
    if (!verdict) return;
    if (isPhone()) {
      revealSpan(buttonsRef.current, [problemRef.current, rowsRef.current, verdictRef.current]);
    } else {
      revealOnDesktop(verdictRef.current, buttonsRef.current);
    }
    focusTarget(verdictRef.current ?? rowsRef.current);
  }, [verdict, problemRef]);

  // "Reyna aftur" unmounts with the verdict: focus goes to the first field
  // that was wrong, which is the one to change.
  const [retries, setRetries] = useState(0);
  const retryAt = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (retries > 0 && retryAt.current) focusTarget(inputRefs.current[retryAt.current]);
  }, [retries]);
  const retry = () => {
    retryAt.current = verdict?.wrong[0] ?? null;
    setVerdict(null);
    setRetries((n) => n + 1);
  };

  // A double tap on "Athuga" must not press the button that takes its place.
  const armed = useArmedAfter(400, `${step}:${verdict ? String(verdict.ok) : ''}`);

  // Enter in a field moves on to the next one, and in the last one checks the
  // column (design P12), as "Athuga" does. The next field is focused as Tab
  // focuses it, brought into view if it has to be: with a phone's keyboard
  // open, the third field of a three-element compound can sit under the
  // keyboard, and the student is about to type in it.
  const onEnter = (i: number) => {
    const nextRow = derived.rows[i + 1];
    if (nextRow) inputRefs.current[nextRow.element]?.focus();
    else submit();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-4 flex items-baseline justify-between gap-3 phone:mb-3">
          <h2 className="text-xl font-bold text-warm-800 sm:text-2xl phone:min-w-0 phone:text-base">
            Æfa
          </h2>
          <button
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline pointer-coarse:-my-3 pointer-coarse:py-3"
          >
            Til baka
          </button>
        </div>

        {/* On a phone on its side the compound sits beside the table being
            filled. Two plain blocks elsewhere, so the spacing is what it was. */}
        <div className="phone-land:grid phone-land:grid-cols-2 phone-land:items-start phone-land:gap-4">
          <div ref={problemRef} data-item-start>
            <p className="mb-1 text-sm text-warm-500">
              Efni {index + 1} af {PROBLEMS.length} · súla {COLUMN_LABEL[column]}
            </p>
            <p className="mb-4 text-warm-700">
              <strong>{problem.name}</strong> —{' '}
              {problem.percentages.map((p, i) => (
                <span key={p.element}>
                  {i > 0 && ', '}
                  <span className="whitespace-nowrap">{`${p.element} ${fmt(p.percent, 2)} %`}</span>
                </span>
              ))}
            </p>
            <p id="aefa-prompt" className="mb-4 text-sm text-warm-600">
              {PROMPT[column]}
            </p>
          </div>

          <div>
            {/* Narrower columns below `sm` so a row fits a 360 px phone; below
                that the verdict drops under the input rather than squeezing it. */}
            <div
              ref={rowsRef}
              role="group"
              aria-labelledby="aefa-prompt"
              className="mb-4 space-y-2"
            >
              {derived.rows.map((r, i) => {
                const isWrong = verdict?.wrong.includes(r.element);
                return (
                  <div
                    key={r.element}
                    className="flex flex-wrap items-center gap-x-2 gap-y-1 sm:flex-nowrap sm:gap-3"
                  >
                    <span className="w-8 font-mono font-semibold text-warm-800 sm:w-10">
                      {r.element}
                    </span>
                    {column !== 'moles' && (
                      <span className="w-14 text-right font-mono text-sm text-warm-500 sm:w-28">
                        {column === 'ratio' ? fmt(r.moles, 3) : fmt(r.ratio, 2)}
                      </span>
                    )}
                    <input
                      {...DECIMAL_INPUT_PROPS}
                      ref={(el) => {
                        inputRefs.current[r.element] = el;
                      }}
                      value={entries[r.element] ?? ''}
                      onChange={(e) => setEntries({ ...entries, [r.element]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter') return;
                        e.preventDefault();
                        onEnter(i);
                      }}
                      enterKeyHint={i + 1 < derived.rows.length ? 'next' : 'done'}
                      disabled={verdict?.ok}
                      autoComplete="off"
                      aria-label={`${COLUMN_LABEL[column]} fyrir ${r.element}`}
                      className={`w-24 rounded-lg border-2 px-3 py-2 text-right font-mono sm:w-32 ${
                        verdict === null
                          ? 'border-warm-300'
                          : isWrong
                            ? 'border-red-400 bg-red-50'
                            : 'border-green-400 bg-green-50'
                      }`}
                    />
                    {verdict && (
                      <span className="ml-auto whitespace-nowrap text-sm text-warm-500 sm:ml-0">
                        {isWrong ? `rétt: ${fmt(expected(r.element), decimals)}` : '✓'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {verdict && !verdict.ok && (
              <div
                ref={verdictRef}
                role="group"
                aria-labelledby="aefa-verdict"
                className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
              >
                <p id="aefa-verdict" className="font-semibold">
                  Ekki alveg — {COLUMN_HEADING[column]}
                </p>
                {column === 'moles' && (
                  <p className="mt-1">
                    Mundu að deila, ekki margfalda: prósentan er grömm og mólmassinn er g/mól, svo
                    grömm ÷ (g/mól) gefur mól.
                  </p>
                )}
                {column === 'ratio' && (
                  <p className="mt-1">
                    Deildu öllum tölunum með þeirri <em>minnstu</em>, ekki þeirri stærstu. Minnsta
                    talan á að verða nákvæmlega 1.
                  </p>
                )}
                {column === 'subscript' && derived.multiplier > 1 && (
                  <p className="mt-1">
                    Hlutföllin hér eru ekki heil. Margfaldaðu þau <strong>öll</strong> með sömu tölu
                    —{` ${derived.multiplier}`} dugar — í stað þess að námunda hvert fyrir sig. 1,5
                    námundað í 2 er efni sem er ekki til.
                  </p>
                )}
              </div>
            )}

            {verdict?.ok && column === 'subscript' && (
              <div
                ref={verdictRef}
                role="group"
                aria-labelledby="aefa-formula"
                className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900"
              >
                <p id="aefa-formula">
                  Reynsluformúlan er{' '}
                  <strong className="font-mono text-base">{problem.answer}</strong>
                  {problem.multiplier > 1 &&
                    ` — hlutföllin þurftu að margfaldast með ${problem.multiplier}.`}
                </p>
                <p className="mt-2 text-green-800">{problem.context}</p>
              </div>
            )}

            <div ref={buttonsRef} className="flex flex-wrap gap-3">
              {/* Two elements, not one relabelled (design P3): the button that
                  follows a right answer is new under the finger, and the guard
                  drops a second tap on it. */}
              {!verdict?.ok ? (
                <button
                  key="athuga"
                  onClick={submit}
                  disabled={!filled}
                  className="game-btn rounded-lg bg-kvenno-orange px-6 py-3 font-semibold text-white disabled:opacity-40"
                >
                  Athuga
                </button>
              ) : (
                <button
                  key="next"
                  onClick={armed(next)}
                  className="game-btn rounded-lg bg-kvenno-orange px-6 py-3 font-semibold text-white"
                >
                  {column === 'subscript' && index + 1 === PROBLEMS.length
                    ? 'Klára'
                    : column === 'subscript'
                      ? 'Næsta efni'
                      : 'Næsta súla'}
                </button>
              )}
              {verdict && !verdict.ok && (
                <button
                  onClick={armed(retry)}
                  className="game-btn rounded-lg border border-warm-300 px-5 py-3 text-warm-700"
                >
                  Reyna aftur
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
