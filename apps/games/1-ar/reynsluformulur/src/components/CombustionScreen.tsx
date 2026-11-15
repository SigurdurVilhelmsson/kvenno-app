import { useLayoutEffect, useRef, useState } from 'react';

import {
  focusTarget,
  formatDecimal,
  revealSpan,
  useArmedAfter,
  useItemTop,
  useRevealAfterCommit,
} from '@shared/utils';

import {
  COMBUSTION_PROBLEMS,
  M_CO2,
  M_H2O,
  formulaText,
  solveCombustion,
  type CombustionProblem,
} from '../data/combustion';
import { ATOMIC_MASSES } from '../data/elements';
import { deriveEmpirical } from '../engine/empirical';

/**
 * Beita's second part: brunaefnagreining (combustion analysis, book
 * ch04/m68716), Siggi's Phase 4 ruling of 2026-11-15. The masses of CO₂ and
 * H₂O give the masses of C and H; from there it is the table Æfa drilled. The
 * student writes the formula; the feedback works it through from the masses.
 */

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

const fmt = (n: number, sig = 3): string => formatDecimal(Number(n.toPrecision(sig)));

/** What a student gets by forgetting that each H₂O carries two H atoms. */
function halfHydrogen(p: CombustionProblem): { C: number; H: number } | null {
  if (p.h2o === undefined) return null;
  const s = solveCombustion(p);
  try {
    const d = deriveEmpirical({ C: s.massC, H: s.massH / 2 }, { grams: true });
    const sub = (el: 'C' | 'H') => d.rows.find((r) => r.element === el)!.subscript;
    return { C: sub('C'), H: sub('H') };
  } catch {
    return null;
  }
}

export type CombustionVerdict = 'right' | 'empirical' | 'half-h' | 'swapped' | 'wrong';

export function judgeCombustion(p: CombustionProblem, c: number, h: number): CombustionVerdict {
  const s = solveCombustion(p);
  const target = s.molecular ?? s.empirical;
  if (c === target.C && h === target.H) return 'right';
  if (s.molecular && c === s.empirical.C && h === s.empirical.H) return 'empirical';
  const half = halfHydrogen(p);
  if (half && c === half.C && h === half.H) return 'half-h';
  if (c === target.H && h === target.C && target.C !== target.H) return 'swapped';
  return 'wrong';
}

const MESSAGES: Record<Exclude<CombustionVerdict, 'right'>, string> = {
  empirical:
    'Þetta er reynsluformúlan. Mólmassinn er gefinn: deildu honum með massa reynsluformúlunnar til að fá n.',
  'half-h':
    'Hver vatnssameind, H₂O, ber tvær vetnisfrumeindir, svo mól af vetni eru tvöföld mól af vatni.',
  swapped: 'Þú víxlaðir tölunum. Kolefnið kemur úr CO₂ og vetnið úr H₂O.',
  wrong: 'Ekki rétt. Farðu skref fyrir skref: massi C og H, síðan mól, síðan hlutfall.',
};

export function CombustionScreen({ onComplete, onBack }: Props) {
  const [index, setIndex] = useState(0);
  const [c, setC] = useState('');
  const [h, setH] = useState('');
  const [verdict, setVerdict] = useState<CombustionVerdict | null>(null);
  const [attempts, setAttempts] = useState(0);
  const answered = verdict !== null;

  const p = COMBUSTION_PROBLEMS[index];
  const s = solveCombustion(p);
  const asksMolecular = s.molecular !== undefined;

  const cardRef = useItemTop<HTMLDivElement>(index, { anyWidth: true, gap: 0 });
  const promptRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  useRevealAfterCommit(answered, () => ({
    bottom: actionsRef.current,
    tops: [promptRef.current, feedbackRef.current],
    focus: feedbackRef.current,
  }));
  const armed = useArmedAfter(400, `${index}:${answered}`);
  const [retries, setRetries] = useState(0);
  const shownRetries = useRef(retries);
  useLayoutEffect(() => {
    if (shownRetries.current === retries) return;
    shownRetries.current = retries;
    revealSpan(actionsRef.current, [promptRef.current]);
    focusTarget(firstInputRef.current);
  }, [retries]);

  const cn = Number.parseInt(c, 10);
  const hn = Number.parseInt(h, 10);
  const canCheck = cn >= 1 && hn >= 1;

  const check = () => {
    if (!canCheck || answered) return;
    setVerdict(judgeCombustion(p, cn, hn));
    setAttempts((a) => a + 1);
  };

  const next = () => {
    setC('');
    setH('');
    setVerdict(null);
    setAttempts(0);
    if (index + 1 < COMBUSTION_PROBLEMS.length) setIndex(index + 1);
    else onComplete();
  };

  const u = p.unit;
  const showSteps = verdict === 'right' || attempts > 1;
  const molC = s.massC / ATOMIC_MASSES.C!;
  const molH = s.massH / ATOMIC_MASSES.H!;

  return (
    <div className="mx-auto max-w-3xl">
      <div ref={cardRef} className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-4 flex items-baseline justify-between gap-3 phone:mb-2">
          <h2 className="text-xl font-bold text-warm-800 sm:text-2xl phone:min-w-0 phone:text-base">
            Beita — brunaefnagreining
          </h2>
          <button
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline pointer-coarse:-my-3 pointer-coarse:py-3"
          >
            Til baka
          </button>
        </div>

        <p className="mb-3 text-sm text-warm-600 phone:sr-only">
          Sýnið er brennt í súrefni. Allt kolefnið fer í koldíoxíð og allt vetnið í vatn, svo massi
          þeirra segir hve mikið C og H var í sýninu.
        </p>

        <p className="mb-2 text-sm text-warm-500">
          Dæmi {index + 1} af {COMBUSTION_PROBLEMS.length}
        </p>

        <div
          ref={promptRef}
          data-item-start
          className="mb-4 rounded-lg bg-warm-50 p-4 phone:mb-3 phone:p-3"
        >
          <p className="font-semibold text-warm-800">{p.name}</p>
          <p className="text-sm text-warm-600">{p.context}</p>
          <p className="mt-2 text-warm-800">
            {fmt(p.sample, 4)} {u} sýnis gefa {fmt(p.co2)} {u} af CO₂
            {p.h2o !== undefined ? ` og ${fmt(p.h2o)} ${u} af H₂O` : ''}.
            {p.h2o === undefined && ' Vetnið er það sem eftir er af massa sýnisins.'}
            {p.molarMass !== undefined && ` Mólmassi efnisins er um ${fmt(p.molarMass, 5)} g/mól.`}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-lg">
            <span>{asksMolecular ? 'Sameindaformúla:' : 'Reynsluformúla:'}</span>
            <span>C</span>
            <input
              ref={firstInputRef}
              type="number"
              min={1}
              inputMode="numeric"
              aria-label="Fjöldi C"
              value={c}
              readOnly={answered}
              onChange={(e) => setC(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && check()}
              className="w-16 rounded-lg border-2 border-warm-300 px-2 py-1 text-center"
            />
            <span>H</span>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              aria-label="Fjöldi H"
              value={h}
              readOnly={answered}
              onChange={(e) => setH(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && check()}
              className="w-16 rounded-lg border-2 border-warm-300 px-2 py-1 text-center"
            />
          </div>
        </div>

        {answered && (
          <div
            ref={feedbackRef}
            role="group"
            tabIndex={-1}
            aria-labelledby="bruni-verdict"
            className={`mb-4 rounded-lg border p-4 text-sm phone:mb-3 phone:p-3 ${
              verdict === 'right'
                ? 'border-green-200 bg-green-50 text-green-900'
                : 'border-amber-300 bg-amber-50 text-amber-900'
            }`}
          >
            <p id="bruni-verdict" className="mb-1 font-semibold">
              {verdict === 'right' ? 'Rétt' : 'Ekki alveg'}
            </p>
            {verdict !== 'right' && <p>{MESSAGES[verdict]}</p>}
            {showSteps && (
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>
                  Massi C = {fmt(p.co2)} {u} × {fmt(ATOMIC_MASSES.C!, 5)} / {fmt(M_CO2, 5)} ={' '}
                  {fmt(s.massC)} {u}
                </li>
                <li>
                  {s.hByDifference
                    ? `Massi H = ${fmt(p.sample, 4)} − ${fmt(s.massC)} = ${fmt(s.massH)} ${u}`
                    : `Massi H = ${fmt(p.h2o!)} ${u} × 2 × ${fmt(ATOMIC_MASSES.H!, 4)} / ${fmt(M_H2O, 5)} = ${fmt(s.massH)} ${u}`}
                </li>
                <li>
                  Mólhlutfall H : C = {fmt(molH)} : {fmt(molC)} = {fmt(molH / molC)} : 1, svo
                  reynsluformúlan er {formulaText(s.empirical)}.
                </li>
                {s.molecular && (
                  <li>
                    n = {fmt(p.molarMass!, 5)} ÷{' '}
                    {fmt(s.empirical.C * ATOMIC_MASSES.C! + s.empirical.H * ATOMIC_MASSES.H!, 4)} ≈{' '}
                    {s.n}, svo sameindaformúlan er {formulaText(s.molecular)}.
                  </li>
                )}
              </ol>
            )}
          </div>
        )}

        <div ref={actionsRef} className="flex flex-wrap gap-3">
          {!answered ? (
            <button
              key="check"
              onClick={check}
              disabled={!canCheck}
              className="game-btn rounded-lg bg-kvenno-orange px-5 py-2 font-semibold text-white disabled:opacity-40 pointer-coarse:min-h-11"
            >
              Svara
            </button>
          ) : (
            <>
              {verdict !== 'right' && (
                <button
                  key="retry"
                  onClick={armed(() => {
                    setVerdict(null);
                    setRetries((n) => n + 1);
                  })}
                  className="game-btn rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-white"
                >
                  Reyna aftur
                </button>
              )}
              <button
                key="next"
                onClick={armed(next)}
                className="game-btn rounded-lg bg-kvenno-orange px-6 py-3 font-semibold text-white"
              >
                {index + 1 === COMBUSTION_PROBLEMS.length ? 'Klára' : 'Næsta dæmi'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
