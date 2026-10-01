import { useState, useMemo, useRef, useSyncExternalStore } from 'react';

import { PinnedActions } from '@shared/components';
import { useRevealAfterCommit } from '@shared/utils';

import { AtomSymbol, BondLines, ElectronDot } from './LewisStructure';
import { BOND_E, diagnoseDrawing, type BondType } from '../utils/lewisDiagnosis';
import { LEWIS_COLORS, lewisGeometry } from '../utils/lewisLayout';
import { pairCount } from '../utils/lonePairs';

interface CorrectAtom {
  symbol: string;
  bondType: 'single' | 'double' | 'triple';
  lonePairs: number;
}

interface CorrectStructure {
  centralAtom: string;
  surroundingAtoms: CorrectAtom[];
  centralLonePairs: number;
  centralUnpairedElectron?: boolean;
}

interface DrawingFeedback {
  correct: boolean;
  /** What the drawing breaks, said by the rules (`diagnoseDrawing`). */
  messages: string[];
  bondErrors: { index: number; atom: string; expected: BondType; got: BondType }[];
  centralLPError: { expected: number; got: number } | null;
  surroundingLPErrors: { index: number; atom: string; expected: number; got: number }[];
}

interface LewisDrawingCanvasProps {
  molecule: string;
  totalElectrons: number;
  correctStructure: CorrectStructure;
  onComplete: (correct: boolean) => void;
  /** The student opened the solution: the molecule is not counted as solved unaided. */
  onSolutionShown?: () => void;
  disabled?: boolean;
}

/** Wrong checks before "Sýna lausn" is offered. */
const MISSES_BEFORE_SOLUTION = 2;
const NEXT_BOND: Record<BondType, BondType> = {
  none: 'single',
  single: 'double',
  double: 'triple',
  triple: 'none',
};
const BOND_LABEL: Record<BondType, string> = {
  none: 'Ekkert',
  single: 'Einfalt',
  double: 'Tvöfalt',
  triple: 'Þrefalt',
};

/**
 * Phones: narrower than `sm`, or a landscape phone (500 px tall or less). The
 * molecule then fills the board instead of floating in the middle of it —
 * at 360 px the full 350-unit board drew the bonds 23 px long and the outer
 * atoms' letters at 10 px — and the board is capped to the screen height.
 */
export const COMPACT_BOARD_QUERY = '(max-width: 639px), (max-height: 500px)';

function subscribeCompactBoard(onChange: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => {};
  const mql = window.matchMedia(COMPACT_BOARD_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function isCompactBoard(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(COMPACT_BOARD_QUERY).matches;
}

// The +/− lone-pair steppers: 32 px with a mouse, 44 px under a finger.
const STEP_BTN =
  'w-8 h-8 pointer-coarse:w-11 pointer-coarse:h-11 rounded-full disabled:opacity-40 font-bold transition-colors';

export function LewisDrawingCanvas({
  molecule,
  totalElectrons,
  correctStructure,
  onComplete,
  onSolutionShown,
  disabled = false,
}: LewisDrawingCanvasProps) {
  const { centralAtom, surroundingAtoms } = correctStructure;
  const n = surroundingAtoms.length;

  const [bonds, setBonds] = useState<BondType[]>(() => Array(n).fill('none'));
  const [centralLP, setCentralLP] = useState(0);
  const [surroundingLP, setSurroundingLP] = useState<number[]>(() => Array(n).fill(0));
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<DrawingFeedback | null>(null);
  const [misses, setMisses] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);
  const [focusedBondIdx, setFocusedBondIdx] = useState<number | null>(null);
  const bondRefs = useRef<(SVGGElement | null)[]>([]);

  const electronsUsed = useMemo(
    () =>
      bonds.reduce((s, b) => s + BOND_E[b], 0) +
      centralLP * 2 +
      surroundingLP.reduce((s, lp) => s + lp * 2, 0),
    [bonds, centralLP, surroundingLP]
  );
  const remaining = totalElectrons - electronsUsed;
  const isCorrectResult = submitted && feedback?.correct;
  const canInteract = !disabled && !isCorrectResult;

  // A wrong drawing: on a phone the list of what to fix comes into view (above
  // the pinned action bar), and focus moves to it (design P3). Editing the
  // drawing clears it, and the next Athuga brings it back.
  const wrongRef = useRef<HTMLDivElement>(null);
  const wrongShown = submitted && !!feedback && !feedback.correct;
  useRevealAfterCommit(wrongShown, () => ({
    bottom: wrongRef.current,
    tops: [wrongRef.current],
    focus: wrongRef.current,
  }));

  // --- Layout ---
  const W = 350,
    H = 280;
  const cx = W / 2,
    cy = H / 2;
  // The compact board crops to the most room this molecule's drawing can ever
  // take — every outer atom with three pairs, the central atom with four — so
  // nothing moves or clips as pairs are added, and a flat molecule such as
  // H–O–H is not framed in a tall empty square. Its bond hit strip is wider
  // too, so a fingertip on a short bond lands on it: 36 units is about 42 px on
  // a 360 px phone.
  const compact = useSyncExternalStore(subscribeCompactBoard, isCompactBoard, () => false);
  const viewBox = useMemo(() => {
    if (!compact) return `0 0 ${W} ${H}`;
    const { box } = lewisGeometry(
      {
        central: { symbol: centralAtom, lonePairs: 4 },
        outer: surroundingAtoms.map((a) => ({ symbol: a.symbol, lonePairs: 3, bond: 'single' })),
      },
      { x: cx, y: cy }
    );
    const pad = 10;
    const h = Math.max(box.maxY - box.minY + pad * 2, 110);
    const midY = (box.minY + box.maxY) / 2;
    return `${box.minX - pad} ${midY - h / 2} ${box.maxX - box.minX + pad * 2} ${h}`;
  }, [compact, centralAtom, surroundingAtoms, cx, cy]);
  const hitWidth = compact ? 36 : 24;
  // The invisible strip a tap or click lands on. A filled polygon rather than a
  // thick transparent stroke, so the bond's box is as big as what it catches: a
  // vertical line's box has no width, which hid H₂O's bonds from box-based
  // hit-testing (and from tools that measure touch targets) entirely.
  const hitStrip = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    perpX: number,
    perpY: number
  ): string => {
    const h = hitWidth / 2;
    return [
      [x1 + perpX * h, y1 + perpY * h],
      [x2 + perpX * h, y2 + perpY * h],
      [x2 - perpX * h, y2 - perpY * h],
      [x1 - perpX * h, y1 - perpY * h],
    ]
      .map(([x, y]) => `${x},${y}`)
      .join(' ');
  };

  // The board draws with the same geometry and pen as every other Lewis
  // structure in the game (utils/lewisLayout.ts), from the student's drawing.
  const showUnpaired = !!correctStructure.centralUnpairedElectron && remaining === 1;
  const geometry = useMemo(
    () =>
      lewisGeometry(
        {
          central: { symbol: centralAtom, lonePairs: centralLP, unpaired: showUnpaired },
          outer: surroundingAtoms.map((a, i) => ({
            symbol: a.symbol,
            lonePairs: surroundingLP[i],
            bond: bonds[i],
          })),
        },
        { x: cx, y: cy }
      ),
    [centralAtom, centralLP, showUnpaired, surroundingAtoms, surroundingLP, bonds, cx, cy]
  );

  // --- Atom label for controls ---
  const atomLabel = (i: number): string => {
    const sym = surroundingAtoms[i].symbol;
    const sameCount = surroundingAtoms.filter((a) => a.symbol === sym).length;
    if (sameCount === 1) return sym;
    const idx = surroundingAtoms.slice(0, i + 1).filter((a) => a.symbol === sym).length;
    const subs = ['₁', '₂', '₃', '₄', '₅', '₆'];
    return `${sym}${subs[idx - 1]}`;
  };

  // --- Event handlers ---
  const clearFeedback = () => {
    if (submitted && !isCorrectResult) {
      setSubmitted(false);
      setFeedback(null);
    }
  };

  const cycleBond = (i: number) => {
    if (!canInteract) return;
    clearFeedback();
    setBonds((prev) => {
      const next = [...prev];
      next[i] = NEXT_BOND[next[i]];
      return next;
    });
  };

  const focusBond = (i: number) => {
    bondRefs.current[i]?.focus();
  };

  const onBondKeyDown = (e: React.KeyboardEvent<SVGGElement>, i: number) => {
    if (!canInteract) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      cycleBond(i);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      focusBond((i + 1) % n);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      focusBond((i - 1 + n) % n);
    }
  };

  const adjustLP = (atomIdx: number, delta: number) => {
    if (!canInteract) return;
    clearFeedback();
    if (atomIdx === -1) {
      setCentralLP((prev) => Math.max(0, prev + delta));
    } else {
      setSurroundingLP((prev) => {
        const next = [...prev];
        next[atomIdx] = Math.max(0, prev[atomIdx] + delta);
        return next;
      });
    }
  };

  // --- Validation ---
  const validate = (): DrawingFeedback => {
    const bondErrors: DrawingFeedback['bondErrors'] = [];
    const surroundingLPErrors: DrawingFeedback['surroundingLPErrors'] = [];

    surroundingAtoms.forEach((atom, i) => {
      if (bonds[i] !== atom.bondType)
        bondErrors.push({ index: i, atom: atom.symbol, expected: atom.bondType, got: bonds[i] });
      if (surroundingLP[i] !== atom.lonePairs)
        surroundingLPErrors.push({
          index: i,
          atom: atom.symbol,
          expected: atom.lonePairs,
          got: surroundingLP[i],
        });
    });

    const centralLPError =
      centralLP !== correctStructure.centralLonePairs
        ? { expected: correctStructure.centralLonePairs, got: centralLP }
        : null;

    return {
      correct: bondErrors.length === 0 && !centralLPError && surroundingLPErrors.length === 0,
      messages: diagnoseDrawing(
        molecule,
        totalElectrons,
        correctStructure,
        { bonds, centralLP, surroundingLP },
        atomLabel
      ),
      bondErrors,
      centralLPError,
      surroundingLPErrors,
    };
  };

  const handleSubmit = () => {
    const result = validate();
    setFeedback(result);
    setSubmitted(true);
    if (!result.correct) setMisses((m) => m + 1);
    onComplete(result.correct);
  };

  // The key, only on request and only after two misses. It is worked out from
  // the drawing as it stands, so it shrinks as the student applies it.
  const solutionRef = useRef<HTMLDivElement>(null);
  const showSolution = () => {
    setSolutionShown(true);
    onSolutionShown?.();
  };
  const solution = solutionShown ? validate() : null;
  useRevealAfterCommit(solutionShown, () => ({
    bottom: solutionRef.current,
    tops: [solutionRef.current],
    focus: solutionRef.current,
  }));

  const reset = () => {
    setBonds(Array(n).fill('none'));
    setCentralLP(0);
    setSurroundingLP(Array(n).fill(0));
    setSubmitted(false);
    setFeedback(null);
  };

  // --- SVG render helpers ---
  const renderBond = (i: number) => {
    const { from, to, angle } = geometry.bonds[i];
    const { x: x1, y: y1 } = from;
    const { x: x2, y: y2 } = to;
    const perpX = -Math.sin(angle);
    const perpY = Math.cos(angle);
    const bt = bonds[i];
    const hasErr = solution?.bondErrors.some((e) => e.index === i);
    const color = hasErr ? LEWIS_COLORS.error : LEWIS_COLORS.bond;

    const isFocused = focusedBondIdx === i;
    const bondAriaLabel = `Tengi ${i + 1} af ${n}: ${centralAtom}–${atomLabel(i)}, núna ${BOND_LABEL[bt]}. Ýttu á Enter eða bil til að skipta.`;

    return (
      <g
        key={`bond-${i}`}
        ref={(el) => {
          bondRefs.current[i] = el;
        }}
        role="button"
        tabIndex={canInteract ? 0 : -1}
        aria-label={bondAriaLabel}
        onClick={() => cycleBond(i)}
        onKeyDown={(e) => onBondKeyDown(e, i)}
        onFocus={() => setFocusedBondIdx(i)}
        onBlur={() => setFocusedBondIdx((cur) => (cur === i ? null : cur))}
        style={{ cursor: canInteract ? 'pointer' : 'default', outline: 'none' }}
      >
        {isFocused && canInteract && (
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#3b82f6"
            strokeWidth={12}
            strokeLinecap="round"
            opacity={0.3}
          />
        )}
        <polygon points={hitStrip(x1, y1, x2, y2, perpX, perpY)} fill="transparent" />
        <BondLines from={from} to={to} type={bt} color={color} />
      </g>
    );
  };

  const remainingColor =
    remaining === 0
      ? 'text-green-600'
      : remaining === 1 && correctStructure.centralUnpairedElectron
        ? 'text-yellow-600'
        : remaining < 0
          ? 'text-red-600'
          : 'text-orange-600';
  const counterNotes = (
    <>
      {remaining === 1 && correctStructure.centralUnpairedElectron && (
        <div className="text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1 mt-2 phone:mt-1 text-center">
          1 rafeind eftir — ópöruð rafeind: {molecule} er stakeind
        </div>
      )}
      {remaining < 0 && (
        <div className="text-xs text-red-700 bg-red-50 rounded px-2 py-1 mt-2 phone:mt-1 text-center">
          Of margar rafeindir notaðar! Fjarlægðu tengi eða stök pör.
        </div>
      )}
    </>
  );

  const hasNonH = surroundingAtoms.some((a) => a.symbol !== 'H');

  return (
    // A phone on its side: the board | the counter, the lone pairs, the feedback and the
    // actions, so the board can be large enough to tap and the controls sit beside it.
    <div className="space-y-4 phone-land:grid phone-land:grid-cols-2 phone-land:gap-x-4 phone-land:gap-y-3 phone-land:items-start phone-land:space-y-0">
      {/* SVG Canvas */}
      <div className="bg-warm-50 rounded-xl p-2 flex flex-col items-center phone-land:row-span-4">
        {/* The compact board is capped at 42 % of the screen height, so the
            lone-pair controls start on the same screen (design §4). */}
        <svg
          viewBox={viewBox}
          className={
            compact
              ? 'w-full max-w-[420px] max-h-[42dvh] phone-land:max-h-[76dvh]'
              : 'w-full max-w-[420px]'
          }
          role="img"
          aria-label={`Teikniborð fyrir Lewis-formúlu ${molecule}`}
        >
          {/* Bonds */}
          {geometry.bonds.map((_, i) => renderBond(i))}

          {/* Lone pairs, plus the odd electron of a radical such as NO: once the
              count leaves exactly that one electron, it is drawn on the central
              atom beside the pairs rather than left out of the picture. Once the
              solution is open, an atom whose pairs differ from it is drawn red. */}
          {geometry.dots.map((d, i) => {
            const hasErr =
              d.atom === -1
                ? !!solution?.centralLPError
                : !!solution?.surroundingLPErrors.some((e) => e.index === d.atom);
            return d.odd ? (
              <g key={`dot-${i}`} data-unpaired-electron="">
                <ElectronDot at={d} />
              </g>
            ) : (
              <ElectronDot
                key={`dot-${i}`}
                at={d}
                color={hasErr ? LEWIS_COLORS.error : undefined}
              />
            );
          })}

          {/* Atoms, as the book writes them: the element symbol and nothing round it */}
          <AtomSymbol at={geometry.central} symbol={centralAtom} />
          {geometry.outer.map((p, i) => (
            <AtomSymbol key={`atom-${i}`} at={p} symbol={surroundingAtoms[i].symbol} />
          ))}

          {/* Instruction (drawn as HTML below the compact board, where 11 units would be too small to read) */}
          {canInteract && !compact && (
            <text
              x={W / 2}
              y={H - 8}
              textAnchor="middle"
              fill="#9ca3af"
              fontSize={11}
              className="pointer-events-none select-none"
            >
              Smelltu eða notaðu Tab + Enter til að breyta tengjum
            </text>
          )}
        </svg>
        {canInteract && compact && (
          <p className="text-xs text-warm-500 text-center pb-1">
            {/* No Tab key on a phone: say what a finger does. */}
            <span className="pointer-coarse:hidden">
              Smelltu eða notaðu Tab + Enter til að breyta tengjum
            </span>
            <span className="hidden pointer-coarse:inline">
              Smelltu á strikin til að breyta tengjum
            </span>
          </p>
        )}
      </div>

      {/* Electron counter: its own card where there is room; on a phone it
          shares a line with the lone-pair heading below (design §4). */}
      {!compact && (
        <div className="bg-white rounded-lg p-3 shadow-xs">
          <div className="flex justify-between items-center text-center">
            <div>
              <div className="text-xl font-bold text-warm-800">{totalElectrons}</div>
              <div className="text-xs text-warm-500">Alls</div>
            </div>
            <div className="text-warm-400 text-lg">−</div>
            <div>
              <div className="text-xl font-bold text-warm-800">{electronsUsed}</div>
              <div className="text-xs text-warm-500">Notaðar</div>
            </div>
            <div className="text-warm-400 text-lg">=</div>
            <div>
              <div className={`text-xl font-bold ${remainingColor}`}>{remaining}</div>
              <div className="text-xs text-warm-500">Eftir</div>
            </div>
          </div>
          {counterNotes}
        </div>
      )}

      {/* Lone pair controls */}
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-xs space-y-3 phone:space-y-1.5">
        {compact ? (
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <div className="text-sm font-semibold text-warm-700">Stök rafeindapör:</div>
              <div className="flex items-baseline gap-1 text-xs text-warm-500 tabular-nums">
                <span>Alls</span>
                <span className="text-base font-bold text-warm-800">{totalElectrons}</span>
                <span aria-hidden="true">−</span>
                <span>Notaðar</span>
                <span className="text-base font-bold text-warm-800">{electronsUsed}</span>
                <span aria-hidden="true">=</span>
                <span>Eftir</span>
                <span className={`text-base font-bold ${remainingColor}`}>{remaining}</span>
              </div>
            </div>
            {counterNotes}
          </div>
        ) : (
          <div className="text-sm font-semibold text-warm-700">Stök rafeindapör:</div>
        )}

        {/* Central atom. The label names it; the round coloured badge beside it was the
            old board's ball, and the board now draws symbols. */}
        <div
          className={`flex items-center justify-between gap-2 p-2 phone:py-0.5 rounded-lg ${
            solution?.centralLPError ? 'bg-red-50 border border-red-200' : 'bg-warm-50'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-warm-700">{centralAtom} (miðatóm)</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => adjustLP(-1, -1)}
              disabled={centralLP === 0 || !canInteract}
              aria-label={`Taka stakt par af ${centralAtom} (miðatóm)`}
              className={`${STEP_BTN} bg-warm-200 hover:bg-warm-300 text-warm-700`}
            >
              −
            </button>
            <span className="w-6 text-center font-mono font-bold">{centralLP}</span>
            <button
              onClick={() => adjustLP(-1, 1)}
              disabled={remaining < 2 || !canInteract}
              aria-label={`Bæta stöku pari við ${centralAtom} (miðatóm)`}
              className={`${STEP_BTN} bg-kvenno-orange-100 hover:bg-kvenno-orange-200 text-kvenno-orange-800`}
            >
              +
            </button>
          </div>
        </div>

        {/* Surrounding atoms (skip H) */}
        {surroundingAtoms.map((atom, i) => {
          if (atom.symbol === 'H') return null;
          const hasErr = solution?.surroundingLPErrors.some((e) => e.index === i);
          return (
            <div
              key={i}
              className={`flex items-center justify-between gap-2 p-2 phone:py-0.5 rounded-lg ${
                hasErr ? 'bg-red-50 border border-red-200' : 'bg-warm-50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-warm-700">{atomLabel(i)} (ytri)</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  onClick={() => adjustLP(i, -1)}
                  disabled={surroundingLP[i] === 0 || !canInteract}
                  aria-label={`Taka stakt par af ${atomLabel(i)} (ytri)`}
                  className={`${STEP_BTN} bg-warm-200 hover:bg-warm-300 text-warm-700`}
                >
                  −
                </button>
                <span className="w-6 text-center font-mono font-bold">{surroundingLP[i]}</span>
                <button
                  onClick={() => adjustLP(i, 1)}
                  disabled={remaining < 2 || !canInteract}
                  aria-label={`Bæta stöku pari við ${atomLabel(i)} (ytri)`}
                  className={`${STEP_BTN} bg-kvenno-orange-100 hover:bg-kvenno-orange-200 text-kvenno-orange-800`}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}

        {!hasNonH && (
          <div className="text-xs text-warm-500 italic">
            Vetni (H) hefur ekki stök pör í þessum sameindum.
          </div>
        )}
      </div>

      {/* Feedback, under the board and its controls: nothing the finger is using
          moves when it opens or clears. A status region, and the group focused
          after the check (P3). */}
      {wrongShown && (
        <div
          ref={wrongRef}
          role="status"
          tabIndex={-1}
          aria-labelledby="lewis-l2-wrong"
          className="bg-red-50 border border-red-200 rounded-xl p-4 phone:p-3 focus:outline-none"
        >
          <div id="lewis-l2-wrong" className="font-bold text-red-800 mb-2 phone:mb-1">
            Ekki alveg rétt — prófaðu aftur!
          </div>
          <ul className="text-sm text-red-800 space-y-1 list-disc pl-5">
            {feedback.messages.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
          {misses >= MISSES_BEFORE_SOLUTION && !solutionShown && (
            <button
              onClick={showSolution}
              className="mt-3 phone:mt-2 text-sm font-medium text-red-800 underline pointer-coarse:min-h-11"
            >
              Sýna lausn
            </button>
          )}
        </div>
      )}

      {/* The key, once asked for: what still differs from the correct structure. */}
      {solution && !isCorrectResult && (
        <div
          ref={solutionRef}
          role="group"
          tabIndex={-1}
          aria-labelledby="lewis-l2-solution"
          className="bg-amber-50 border border-amber-300 rounded-xl p-4 phone:p-3 focus:outline-none"
        >
          <div id="lewis-l2-solution" className="font-bold text-amber-900 mb-2 phone:mb-1">
            Lausn
          </div>
          {solution.correct ? (
            <p className="text-sm text-amber-900">Formúlan er eins og lausnin. Ýttu á Athuga.</p>
          ) : (
            <ul className="text-sm text-amber-900 space-y-1">
              {solution.bondErrors.map((e, i) => (
                <li key={`be-${i}`}>
                  • {centralAtom}–{atomLabel(e.index)}: {BOND_LABEL[e.got]} → ætti að vera{' '}
                  <strong>{BOND_LABEL[e.expected]}</strong>
                </li>
              ))}
              {solution.centralLPError && (
                <li>
                  • {centralAtom}: {pairCount(solution.centralLPError.got)} → ætti að vera{' '}
                  <strong>{solution.centralLPError.expected}</strong>
                </li>
              )}
              {solution.surroundingLPErrors.map((e, i) => (
                <li key={`le-${i}`}>
                  • {atomLabel(e.index)}: {pairCount(e.got)} → ætti að vera{' '}
                  <strong>{e.expected}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Action buttons: kept in reach at the bottom of a portrait phone while
          the board, the counter and the lone pairs scroll under them (P8), with
          the electrons left beside them. They leave with the board once the
          drawing is right, so they never sit over the result. */}
      {canInteract && (
        <PinnedActions
          status={<span className="whitespace-nowrap">Eftir: {remaining}</span>}
          pinnedClassName="pin:flex pin:items-center pin:gap-3"
        >
          <div className="flex gap-3 flex-1 min-w-0">
            <button
              onClick={reset}
              className="px-4 py-3 phone:py-2 pointer-coarse:min-h-11 rounded-xl bg-warm-200 hover:bg-warm-300 text-warm-700 font-medium transition-colors"
            >
              Hreinsa
            </button>
            <button
              onClick={handleSubmit}
              disabled={bonds.every((b) => b === 'none')}
              className="flex-1 bg-kvenno-orange hover:bg-kvenno-orange-600 disabled:bg-warm-300 text-white font-bold py-3 phone:py-2 pointer-coarse:min-h-11 rounded-xl transition-colors"
            >
              Athuga
            </button>
          </div>
        </PinnedActions>
      )}
    </div>
  );
}
