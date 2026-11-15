import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
  DECIMAL_INPUT_PROPS,
  focusTarget,
  formatDecimal,
  isPhone,
  parseStudentNumber,
  revealOnDesktop,
  revealSpan,
  useArmedAfter,
  useItemTop,
} from '@shared/utils';

import { PERCENT_ITEMS } from '../data/percent';

/**
 * Æfa, first part — prósentusamsetning, from a known formula.
 *
 * The book's order (`ch03/m68702`): percent composition first, then the same arithmetic
 * turned round to find a formula. Two columns, filled one at a time as in the empirical
 * table that follows: the mass of each element in one mole of the compound, then each
 * mass as a percent of the molar mass. A wrong column is answered in two tiers, as the
 * table answers it (decisions item 46, option b).
 *
 * Levels are not gated (Siggi, 2026-08-29), so the student can go straight to the table.
 * No score and no timer.
 */

interface Props {
  onComplete: () => void;
  onSkip: () => void;
  onBack: () => void;
}

/** Entries are compared at 1 %: the masses and percentages are exact sums and quotients. */
const TOLERANCE = 0.01;

type Column = 'mass' | 'percent';

const COLUMN_LABEL: Record<Column, string> = {
  mass: 'Massi í 1 mól',
  percent: 'Massaprósenta',
};

const COLUMN_HEADING: Record<Column, string> = {
  mass: 'Massasúlan',
  percent: 'Prósentusúlan',
};

const PROMPT: Record<Column, string> = {
  mass: 'Hve mörg grömm af hverju frumefni eru í einu móli af efninu? Margfaldaðu fjölda atómanna með mólmassa frumefnisins.',
  percent: 'Deildu massa hvers frumefnis með mólmassa efnisins og margfaldaðu með 100.',
};

const fmt = (n: number, dp: number) => formatDecimal(n, dp);

function close(got: number, want: number): boolean {
  if (!Number.isFinite(got)) return false;
  return Math.abs(got - want) <= Math.abs(want) * TOLERANCE;
}

export function PercentScreen({ onComplete, onSkip, onBack }: Props) {
  const [index, setIndex] = useState(0);
  const [column, setColumn] = useState<Column>('mass');
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [verdict, setVerdict] = useState<null | { ok: boolean; wrong: string[] }>(null);
  const [wrongTries, setWrongTries] = useState(0);
  const showValues = wrongTries >= 2;

  const item = PERCENT_ITEMS[index];
  const expected = (element: string): number => {
    const row = item.rows.find((r) => r.element === element)!;
    return column === 'mass' ? row.mass : row.percent;
  };
  const decimals = 2;

  const filled = item.rows.every((r) => (entries[r.element] ?? '').trim() !== '');

  const submit = () => {
    if (!filled || verdict?.ok) return;
    const wrong = item.rows
      .filter((r) => !close(parseStudentNumber(entries[r.element] ?? ''), expected(r.element)))
      .map((r) => r.element);
    setVerdict({ ok: wrong.length === 0, wrong });
    if (wrong.length) setWrongTries((n) => n + 1);
  };

  const next = () => {
    setEntries({});
    setVerdict(null);
    setWrongTries(0);
    if (column === 'mass') setColumn('percent');
    else {
      setColumn('mass');
      if (index + 1 < PERCENT_ITEMS.length) setIndex(index + 1);
      else onComplete();
    }
  };

  const rowsRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const step = `${index}-${column}`;

  const problemRef = useItemTop<HTMLDivElement>(step);
  const stepBefore = useRef(step);
  useEffect(() => {
    if (step === stepBefore.current) return;
    stepBefore.current = step;
    if (!isPhone()) revealOnDesktop(problemRef.current, rowsRef.current);
  }, [step, problemRef]);

  useEffect(() => {
    if (!verdict) return;
    if (isPhone()) {
      revealSpan(buttonsRef.current, [problemRef.current, rowsRef.current, verdictRef.current]);
    } else {
      revealOnDesktop(verdictRef.current, buttonsRef.current);
    }
    focusTarget(verdictRef.current ?? rowsRef.current);
  }, [verdict, problemRef]);

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

  const armed = useArmedAfter(400, `${step}:${verdict ? String(verdict.ok) : ''}`);

  const onEnter = (i: number) => {
    const nextRow = item.rows[i + 1];
    if (nextRow) inputRefs.current[nextRow.element]?.focus();
    else submit();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-bold text-warm-800 sm:text-2xl phone:min-w-0 phone:text-base">
            Æfa — prósentusamsetning
          </h2>
          <button
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline pointer-coarse:-my-3 pointer-coarse:py-3"
          >
            Til baka
          </button>
        </div>
        <p className="mb-4 text-sm text-warm-600 phone:mb-3">
          Fyrst öfuga leiðin: frá formúlu að prósentum.{' '}
          <button
            type="button"
            onClick={onSkip}
            className="whitespace-nowrap text-kvenno-orange-700 underline pointer-coarse:-my-3 pointer-coarse:py-3"
          >
            Beint í reynsluformúluna
          </button>
        </p>

        <div className="phone-land:grid phone-land:grid-cols-2 phone-land:items-start phone-land:gap-4">
          <div ref={problemRef} data-item-start>
            <p className="mb-1 text-sm text-warm-500">
              Efni {index + 1} af {PERCENT_ITEMS.length} · súla {COLUMN_LABEL[column]}
            </p>
            <p className="mb-4 text-warm-700">
              <strong>{item.name}</strong>, <span className="font-mono">{item.formula}</span>
              {column === 'percent' && (
                <>
                  {' '}
                  — mólmassi{' '}
                  <span className="whitespace-nowrap">{fmt(item.molarMass, 2)} g/mól</span>
                </>
              )}
            </p>
            <p id="percent-prompt" className="mb-4 text-sm text-warm-600">
              {PROMPT[column]}
            </p>
          </div>

          <div>
            <div
              ref={rowsRef}
              role="group"
              aria-labelledby="percent-prompt"
              className="mb-4 space-y-2"
            >
              {item.rows.map((r, i) => {
                const isWrong = verdict?.wrong.includes(r.element);
                return (
                  <div
                    key={r.element}
                    className="flex flex-wrap items-center gap-x-2 gap-y-1 sm:flex-nowrap sm:gap-3"
                  >
                    <span className="w-8 font-mono font-semibold text-warm-800 sm:w-10">
                      {r.element}
                    </span>
                    <span className="w-24 text-right font-mono text-sm text-warm-500 sm:w-36">
                      {column === 'mass'
                        ? `${r.subscript} × ${fmt(r.atomicMass, 3)}`
                        : `${fmt(r.mass, 2)} g`}
                    </span>
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
                      enterKeyHint={i + 1 < item.rows.length ? 'next' : 'done'}
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
                    <span className="text-sm text-warm-500">{column === 'mass' ? 'g' : '%'}</span>
                    {verdict && (
                      <span className="ml-auto whitespace-nowrap text-sm text-warm-500 sm:ml-0">
                        {!isWrong ? (
                          '✓'
                        ) : showValues ? (
                          `rétt: ${fmt(expected(r.element), decimals)}`
                        ) : (
                          <>
                            <span aria-hidden="true">✗</span>
                            <span className="sr-only">rangt</span>
                          </>
                        )}
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
                aria-labelledby="percent-verdict"
                className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
              >
                <p id="percent-verdict" className="font-semibold">
                  Ekki alveg — {COLUMN_HEADING[column]}
                </p>
                <p className="mt-1">
                  {showValues
                    ? 'Rétt gildi eru sýnd við hvern rangan reit.'
                    : verdict.wrong.length === 1
                      ? 'Reiturinn sem er merktur ✗ er rangur. Lagaðu hann og athugaðu aftur.'
                      : 'Reitirnir sem eru merktir ✗ eru rangir. Lagaðu þá og athugaðu aftur.'}
                </p>
                <p className="mt-1">
                  {column === 'mass'
                    ? 'Lágstafurinn segir hve mörg atóm frumefnisins eru í formúlunni; margfaldaðu mólmassa frumefnisins með honum.'
                    : 'Deildu með mólmassa alls efnisins, ekki frumefnisins, og mundu að margfalda með 100.'}
                </p>
              </div>
            )}

            {verdict?.ok && column === 'percent' && (
              <div
                ref={verdictRef}
                role="group"
                aria-labelledby="percent-done"
                className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900"
              >
                <p id="percent-done">
                  {item.rows
                    .map((r) => `${fmt(r.percent, 2)} % ${r.element}`)
                    .join(', ')
                    .replace(/, ([^,]*)$/, ' og $1')}
                  . Samtals{' '}
                  {fmt(
                    item.rows.reduce((sum, r) => sum + Number(r.percent.toFixed(2)), 0),
                    2
                  )}{' '}
                  %.
                </p>
                <p className="mt-2 text-green-800">{item.context}</p>
              </div>
            )}

            <div ref={buttonsRef} className="flex flex-wrap gap-3">
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
                  {column === 'percent' && index + 1 === PERCENT_ITEMS.length
                    ? 'Áfram í reynsluformúluna'
                    : column === 'percent'
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
