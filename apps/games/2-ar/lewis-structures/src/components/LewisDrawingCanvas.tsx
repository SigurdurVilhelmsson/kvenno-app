import { useState, useMemo, useCallback, useRef } from 'react';

type BondType = 'none' | 'single' | 'double' | 'triple';

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
  bondErrors: { index: number; atom: string; expected: BondType; got: BondType }[];
  centralLPError: { expected: number; got: number } | null;
  surroundingLPErrors: { index: number; atom: string; expected: number; got: number }[];
}

interface LewisDrawingCanvasProps {
  molecule: string;
  totalElectrons: number;
  correctStructure: CorrectStructure;
  onComplete: (correct: boolean) => void;
  disabled?: boolean;
}

const BOND_E: Record<BondType, number> = { none: 0, single: 2, double: 4, triple: 6 };
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

export function LewisDrawingCanvas({
  molecule,
  totalElectrons,
  correctStructure,
  onComplete,
  disabled = false,
}: LewisDrawingCanvasProps) {
  const { centralAtom, surroundingAtoms } = correctStructure;
  const n = surroundingAtoms.length;

  const [bonds, setBonds] = useState<BondType[]>(() => Array(n).fill('none'));
  const [centralLP, setCentralLP] = useState(0);
  const [surroundingLP, setSurroundingLP] = useState<number[]>(() => Array(n).fill(0));
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<DrawingFeedback | null>(null);
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

  // --- Layout ---
  const W = 350,
    H = 280;
  const cx = W / 2,
    cy = H / 2;
  const orbitR = n <= 2 ? 78 : n <= 4 ? 85 : 82;
  const cR = 26,
    sR = 22;

  const positions = useMemo(
    () =>
      surroundingAtoms.map((_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        return { x: cx + Math.cos(a) * orbitR, y: cy + Math.sin(a) * orbitR, a };
      }),
    [n, cx, cy, orbitR, surroundingAtoms]
  );

  // --- Lone pair position helpers ---
  const getSurroundingLPAngles = (bondAngle: number, count: number): number[] => {
    if (count === 0) return [];
    const opp = bondAngle + Math.PI;
    if (count === 1) return [opp];
    const spread = Math.min(Math.PI * 0.7, count * 0.3);
    return Array.from({ length: count }, (_, i) => opp + spread * (i / (count - 1) - 0.5) * 2);
  };

  const getCentralLPAngles = useCallback(
    (count: number): number[] => {
      if (count === 0) return [];
      const bondAngles = positions.map((p) => Math.atan2(p.y - cy, p.x - cx));
      if (bondAngles.length === 0) {
        return Array.from({ length: count }, (_, i) => (i / count) * Math.PI * 2 - Math.PI / 2);
      }
      const sorted = [...bondAngles].sort((a, b) => a - b);
      const gaps: { mid: number; size: number }[] = [];
      for (let i = 0; i < sorted.length; i++) {
        const curr = sorted[i];
        const next = sorted[(i + 1) % sorted.length];
        let size = next - curr;
        if (size <= 0) size += Math.PI * 2;
        gaps.push({ mid: curr + size / 2, size });
      }
      gaps.sort((a, b) => b.size - a.size);
      return gaps.slice(0, count).map((g) => g.mid);
    },
    [positions, cy, cx]
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
      bondErrors,
      centralLPError,
      surroundingLPErrors,
    };
  };

  const handleSubmit = () => {
    const result = validate();
    setFeedback(result);
    setSubmitted(true);
    onComplete(result.correct);
  };

  const reset = () => {
    setBonds(Array(n).fill('none'));
    setCentralLP(0);
    setSurroundingLP(Array(n).fill(0));
    setSubmitted(false);
    setFeedback(null);
  };

  // --- SVG render helpers ---
  const renderBond = (i: number) => {
    const p = positions[i];
    const angle = Math.atan2(p.y - cy, p.x - cx);
    const x1 = cx + Math.cos(angle) * cR;
    const y1 = cy + Math.sin(angle) * cR;
    const x2 = p.x - Math.cos(angle) * sR;
    const y2 = p.y - Math.sin(angle) * sR;
    const perpX = -Math.sin(angle);
    const perpY = Math.cos(angle);
    const off = 4;
    const bt = bonds[i];
    const hasErr = feedback?.bondErrors.some((e) => e.index === i);
    const color = hasErr ? '#ef4444' : '#374151';

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
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={24} />
        {bt === 'none' && (
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#d1d5db"
            strokeWidth={2}
            strokeDasharray="6,4"
          />
        )}
        {bt === 'single' && (
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
          />
        )}
        {bt === 'double' && (
          <>
            <line
              x1={x1 + perpX * off}
              y1={y1 + perpY * off}
              x2={x2 + perpX * off}
              y2={y2 + perpY * off}
              stroke={color}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            <line
              x1={x1 - perpX * off}
              y1={y1 - perpY * off}
              x2={x2 - perpX * off}
              y2={y2 - perpY * off}
              stroke={color}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </>
        )}
        {bt === 'triple' && (
          <>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <line
              x1={x1 + perpX * off * 1.3}
              y1={y1 + perpY * off * 1.3}
              x2={x2 + perpX * off * 1.3}
              y2={y2 + perpY * off * 1.3}
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <line
              x1={x1 - perpX * off * 1.3}
              y1={y1 - perpY * off * 1.3}
              x2={x2 - perpX * off * 1.3}
              y2={y2 - perpY * off * 1.3}
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </>
        )}
      </g>
    );
  };

  const renderLPDots = (
    atomX: number,
    atomY: number,
    angles: number[],
    hasError: boolean,
    dist: number
  ) => {
    const dotColor = hasError ? '#ef4444' : '#6366f1';
    return angles.map((angle, i) => {
      const px = atomX + Math.cos(angle) * dist;
      const py = atomY + Math.sin(angle) * dist;
      const gapX = -Math.sin(angle) * 4;
      const gapY = Math.cos(angle) * 4;
      return (
        <g key={`lp-${i}`} className="pointer-events-none">
          <circle cx={px + gapX} cy={py + gapY} r={2.5} fill={dotColor} />
          <circle cx={px - gapX} cy={py - gapY} r={2.5} fill={dotColor} />
        </g>
      );
    });
  };

  const hasNonH = surroundingAtoms.some((a) => a.symbol !== 'H');

  return (
    <div className="space-y-4">
      {/* SVG Canvas */}
      <div className="bg-warm-50 rounded-xl p-2 flex justify-center">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full max-w-[420px]"
          role="img"
          aria-label={`Teikniborð fyrir Lewis-formúlu ${molecule}`}
        >
          {/* Bonds */}
          {positions.map((_, i) => renderBond(i))}

          {/* Central lone pair dots */}
          {renderLPDots(cx, cy, getCentralLPAngles(centralLP), !!feedback?.centralLPError, 36)}

          {/* Surrounding lone pair dots */}
          {positions.map((p, i) => {
            const bondAngle = Math.atan2(cy - p.y, cx - p.x);
            const hasErr = feedback?.surroundingLPErrors.some((e) => e.index === i) ?? false;
            return renderLPDots(
              p.x,
              p.y,
              getSurroundingLPAngles(bondAngle, surroundingLP[i]),
              hasErr,
              30
            );
          })}

          {/* Central atom */}
          <circle cx={cx} cy={cy} r={cR} fill="#3b82f6" stroke="#2563eb" strokeWidth={2} />
          <text
            x={cx}
            y={cy + 6}
            textAnchor="middle"
            fill="white"
            fontSize={16}
            fontWeight="bold"
            className="pointer-events-none select-none"
          >
            {centralAtom}
          </text>

          {/* Surrounding atoms */}
          {positions.map((p, i) => (
            <g key={`atom-${i}`}>
              <circle cx={p.x} cy={p.y} r={sR} fill="#10b981" stroke="#059669" strokeWidth={2} />
              <text
                x={p.x}
                y={p.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize={14}
                fontWeight="bold"
                className="pointer-events-none select-none"
              >
                {surroundingAtoms[i].symbol}
              </text>
            </g>
          ))}

          {/* Instruction */}
          {canInteract && (
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
      </div>

      {/* Electron counter */}
      <div className="bg-white rounded-lg p-3 shadow-xs">
        <div className="flex justify-between items-center text-center">
          <div>
            <div className="text-xl font-bold text-blue-600">{totalElectrons}</div>
            <div className="text-xs text-warm-500">Heildar</div>
          </div>
          <div className="text-warm-400 text-lg">−</div>
          <div>
            <div className="text-xl font-bold text-green-600">{electronsUsed}</div>
            <div className="text-xs text-warm-500">Notaðar</div>
          </div>
          <div className="text-warm-400 text-lg">=</div>
          <div>
            <div
              className={`text-xl font-bold ${
                remaining === 0
                  ? 'text-green-600'
                  : remaining === 1 && correctStructure.centralUnpairedElectron
                    ? 'text-yellow-600'
                    : remaining < 0
                      ? 'text-red-600'
                      : 'text-orange-600'
              }`}
            >
              {remaining}
            </div>
            <div className="text-xs text-warm-500">Eftir</div>
          </div>
        </div>
        {remaining === 1 && correctStructure.centralUnpairedElectron && (
          <div className="text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1 mt-2 text-center">
            1 rafeind eftir — óparuð rafeind (radical)
          </div>
        )}
        {remaining < 0 && (
          <div className="text-xs text-red-700 bg-red-50 rounded px-2 py-1 mt-2 text-center">
            Of margar rafeindir notaðar! Fjarlægðu tengsl eða einstæð pör.
          </div>
        )}
      </div>

      {/* Lone pair controls */}
      <div className="bg-white rounded-lg p-4 shadow-xs space-y-3">
        <div className="text-sm font-semibold text-warm-700">Einstæð rafeindarapör:</div>

        {/* Central atom */}
        <div
          className={`flex items-center justify-between p-2 rounded-lg ${
            feedback?.centralLPError ? 'bg-red-50 border border-red-200' : 'bg-blue-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{centralAtom}</span>
            </div>
            <span className="text-sm font-medium text-warm-700">{centralAtom} (miðatóm)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustLP(-1, -1)}
              disabled={centralLP === 0 || !canInteract}
              className="w-8 h-8 rounded-full bg-warm-200 hover:bg-warm-300 disabled:opacity-40 text-warm-700 font-bold transition-colors"
            >
              −
            </button>
            <span className="w-6 text-center font-mono font-bold">{centralLP}</span>
            <button
              onClick={() => adjustLP(-1, 1)}
              disabled={remaining < 2 || !canInteract}
              className="w-8 h-8 rounded-full bg-blue-200 hover:bg-blue-300 disabled:opacity-40 text-blue-700 font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Surrounding atoms (skip H) */}
        {surroundingAtoms.map((atom, i) => {
          if (atom.symbol === 'H') return null;
          const hasErr = feedback?.surroundingLPErrors.some((e) => e.index === i);
          return (
            <div
              key={i}
              className={`flex items-center justify-between p-2 rounded-lg ${
                hasErr ? 'bg-red-50 border border-red-200' : 'bg-green-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{atom.symbol}</span>
                </div>
                <span className="text-sm font-medium text-warm-700">{atomLabel(i)} (ytri)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustLP(i, -1)}
                  disabled={surroundingLP[i] === 0 || !canInteract}
                  className="w-8 h-8 rounded-full bg-warm-200 hover:bg-warm-300 disabled:opacity-40 text-warm-700 font-bold transition-colors"
                >
                  −
                </button>
                <span className="w-6 text-center font-mono font-bold">{surroundingLP[i]}</span>
                <button
                  onClick={() => adjustLP(i, 1)}
                  disabled={remaining < 2 || !canInteract}
                  className="w-8 h-8 rounded-full bg-green-200 hover:bg-green-300 disabled:opacity-40 text-green-700 font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}

        {!hasNonH && (
          <div className="text-xs text-warm-500 italic">
            Vetni (H) hefur ekki einstæð pör í þessum sameindum.
          </div>
        )}
      </div>

      {/* Feedback */}
      {submitted && feedback && !feedback.correct && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="font-bold text-red-800 mb-2">Ekki alveg rétt — prófaðu aftur!</div>
          <ul className="text-sm text-red-700 space-y-1">
            {feedback.bondErrors.map((e, i) => (
              <li key={`be-${i}`}>
                • {centralAtom}–{e.atom}: {BOND_LABEL[e.got]} → ætti að vera{' '}
                <strong>{BOND_LABEL[e.expected]}</strong>
              </li>
            ))}
            {feedback.centralLPError && (
              <li>
                • {centralAtom}: {feedback.centralLPError.got} pör → ætti að vera{' '}
                <strong>{feedback.centralLPError.expected}</strong>
              </li>
            )}
            {feedback.surroundingLPErrors.map((e, i) => (
              <li key={`le-${i}`}>
                • {e.atom}: {e.got} pör → ætti að vera <strong>{e.expected}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      {canInteract && (
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="px-4 py-3 rounded-xl bg-warm-200 hover:bg-warm-300 text-warm-700 font-medium transition-colors"
          >
            Hreinsa
          </button>
          <button
            onClick={handleSubmit}
            disabled={bonds.every((b) => b === 'none')}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-warm-300 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Athuga
          </button>
        </div>
      )}
    </div>
  );
}
