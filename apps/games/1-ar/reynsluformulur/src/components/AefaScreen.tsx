import { useMemo, useState } from 'react';

import { DECIMAL_INPUT_PROPS, parseStudentNumber } from '@shared/utils';

import { PROBLEMS } from '../data/problems';
import { deriveEmpirical, type Derivation } from '../engine/empirical';

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

  const submit = () => {
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

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg bg-white p-6 shadow-md md:p-8">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-warm-800">Æfa</h2>
          <button onClick={onBack} className="text-sm text-warm-500 underline">
            Til baka
          </button>
        </div>

        <p className="mb-1 text-sm text-warm-500">
          Efni {index + 1} af {PROBLEMS.length} · súla {COLUMN_LABEL[column]}
        </p>
        <p className="mb-4 text-warm-700">
          <strong>{problem.name}</strong> —{' '}
          {problem.percentages.map((p) => `${p.element} ${fmt(p.percent, 2)} %`).join(', ')}
        </p>
        <p className="mb-4 text-sm text-warm-600">{PROMPT[column]}</p>

        <div className="mb-4 space-y-2">
          {derived.rows.map((r) => {
            const isWrong = verdict?.wrong.includes(r.element);
            return (
              <div key={r.element} className="flex items-center gap-3">
                <span className="w-10 font-mono font-semibold text-warm-800">{r.element}</span>
                {column !== 'moles' && (
                  <span className="w-28 text-right font-mono text-sm text-warm-500">
                    {column === 'ratio' ? fmt(r.moles, 3) : fmt(r.ratio, 2)}
                  </span>
                )}
                <input
                  {...DECIMAL_INPUT_PROPS}
                  value={entries[r.element] ?? ''}
                  onChange={(e) => setEntries({ ...entries, [r.element]: e.target.value })}
                  disabled={verdict?.ok}
                  aria-label={`${COLUMN_LABEL[column]} fyrir ${r.element}`}
                  className={`w-32 rounded-lg border-2 px-3 py-2 text-right font-mono ${
                    verdict === null
                      ? 'border-warm-300'
                      : isWrong
                        ? 'border-red-400 bg-red-50'
                        : 'border-green-400 bg-green-50'
                  }`}
                />
                {verdict && (
                  <span className="text-sm text-warm-500">
                    {isWrong ? `rétt: ${fmt(expected(r.element), decimals)}` : '✓'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {verdict && !verdict.ok && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Ekki alveg — {COLUMN_LABEL[column]}súlan</p>
            {column === 'moles' && (
              <p className="mt-1">
                Mundu að deila, ekki margfalda: prósentan er grömm og mólmassinn er g/mól, svo grömm
                ÷ (g/mól) gefur mól.
              </p>
            )}
            {column === 'ratio' && (
              <p className="mt-1">
                Deildu öllum tölunum með þeirri <em>minnstu</em>, ekki þeirri stærstu. Minnsta talan
                á að verða nákvæmlega 1.
              </p>
            )}
            {column === 'subscript' && derived.multiplier > 1 && (
              <p className="mt-1">
                Hlutföllin hér eru ekki heil. Margfaldaðu þau <strong>öll</strong> með sömu tölu —
                {` ${derived.multiplier}`} dugar — í stað þess að námunda hvert fyrir sig. 1,5
                námundað í 2 er efni sem er ekki til.
              </p>
            )}
          </div>
        )}

        {verdict?.ok && column === 'subscript' && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
            <p>
              Reynsluformúlan er <strong className="font-mono text-base">{problem.answer}</strong>
              {problem.multiplier > 1 &&
                ` — hlutföllin þurftu að margfaldast með ${problem.multiplier}.`}
            </p>
            <p className="mt-2 text-green-800">{problem.context}</p>
          </div>
        )}

        <div className="flex gap-3">
          {!verdict?.ok ? (
            <button
              onClick={submit}
              disabled={derived.rows.some((r) => !(entries[r.element] ?? '').trim())}
              className="game-btn rounded-lg bg-kvenno-orange px-6 py-3 font-semibold text-white disabled:opacity-40"
            >
              Athuga
            </button>
          ) : (
            <button
              onClick={next}
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
              onClick={() => setVerdict(null)}
              className="game-btn rounded-lg border border-warm-300 px-5 py-3 text-warm-700"
            >
              Reyna aftur
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
