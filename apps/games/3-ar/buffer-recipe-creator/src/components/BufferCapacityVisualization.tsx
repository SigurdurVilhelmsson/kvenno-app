import { useState, useMemo, useCallback, useEffect, useRef } from 'react';

import { useContainerWidth } from '@shared/components/ResponsiveContainer';
import { formatDecimal, revealSpan } from '@shared/utils';

/**
 * Below this rendered width the curve is drawn in a compact layout whose viewBox matches the
 * screen pixel for pixel, so its labels keep a legible size. Scaling the 320-unit desktop
 * drawing down to a phone column shrank them to 6-8 px. At and above it nothing changes.
 */
const COMPACT_BELOW_PX = 420;

interface BufferCapacityVisualizationProps {
  /** pKa of the buffer system */
  pKa: number;
  /** Initial acid concentration (M) */
  acidConc: number;
  /** Initial base concentration (M) */
  baseConc: number;
  /** Total buffer concentration for capacity calculation */
  totalConc: number;
  /** Acid name for display */
  acidName?: string;
  /** Base name for display */
  baseName?: string;
  /** Whether to show the acid/base addition simulator */
  showAdditionSim?: boolean;
  /** Callback when acid/base is added */
  onAddition?: (type: 'acid' | 'base', amount: number, newPH: number) => void;
}

/** Water's ion product at 25 °C. */
const KW = 1e-14;

/**
 * The buffer after a net amount of strong acid (M; negative for strong base) has reacted with it:
 * A⁻ + H⁺ → HA, HA + OH⁻ → A⁻ + H₂O. Returns the pH and what is left of each component.
 *
 * - Both components left: Henderson-Hasselbalch, kept between the pH of the weak acid alone and
 *   of the weak base alone at the same total. Near exhaustion the log ratio runs away, and a
 *   trace of A⁻ cannot make a solution more acidic than the weak acid without it.
 * - One used up: the excess strong acid or base sets [H⁺] or [OH⁻], unless the weak acid or base
 *   now making up the whole mixture sets more (√(Ka·C), √(Kb·C)), as at the equivalence point.
 */
function simulateMixture(pKa: number, acid0: number, base0: number, netStrongAcid: number) {
  const Ka = Math.pow(10, -pKa);
  const Kb = KW / Ka;
  const total = acid0 + base0;
  const acid = acid0 + netStrongAcid;
  const base = base0 - netStrongAcid;

  if (base <= 0) {
    // Every A⁻ is now HA; −base is the strong acid nothing has neutralised. Never above 7.
    const H = Math.max(-base, Math.sqrt(Ka * total), 1e-7);
    return { pH: -Math.log10(H), acidConc: total, baseConc: 0 };
  }
  if (acid <= 0) {
    const OH = Math.max(-acid, Math.sqrt(Kb * total), 1e-7);
    return { pH: 14 + Math.log10(OH), acidConc: 0, baseConc: total };
  }
  const weakAcidPH = -Math.log10(Math.max(Math.sqrt(Ka * total), 1e-7));
  const weakBasePH = 14 + Math.log10(Math.max(Math.sqrt(Kb * total), 1e-7));
  const hh = pKa + Math.log10(base / acid);
  return { pH: Math.min(weakBasePH, Math.max(weakAcidPH, hh)), acidConc: acid, baseConc: base };
}

/**
 * BufferCapacityVisualization - Shows buffer capacity and acid/base addition effects
 *
 * Demonstrates:
 * 1. Buffer capacity curve (β vs pH) showing optimal range at pKa ± 1
 * 2. Interactive simulation of adding strong acid/base to buffer
 * 3. Visual comparison: buffered vs unbuffered solution
 */
export function BufferCapacityVisualization({
  pKa,
  acidConc,
  baseConc,
  totalConc,
  acidName = 'HA',
  baseName = 'A⁻',
  showAdditionSim = true,
  onAddition,
}: BufferCapacityVisualizationProps) {
  // State for acid/base addition simulation
  // Running totals of what the student has added, in M — the unit the buttons and the
  // "Bætt við" readouts print. Neutralisation is worked out from the two totals below, so
  // neither handler touches the other's total.
  const [acidAdded, setAcidAdded] = useState(0); // M of strong acid added
  const [baseAdded, setBaseAdded] = useState(0); // M of strong base added
  const [showComparison, setShowComparison] = useState(false);
  const comparisonRef = useRef<HTMLDivElement>(null);

  // The comparison opens below its toggle, which a phone user taps at the bottom edge of the
  // screen, so it rendered wholly below the fold. Nothing moves when it already fits. At any
  // width, by the shortest scroll, as it always was.
  useEffect(() => {
    if (showComparison) revealSpan(comparisonRef.current, [], { anyWidth: true, gap: 0 });
  }, [showComparison]);

  // The mixture after the student's additions, worked out as the textbook does: while both
  // components remain, Henderson-Hasselbalch, never past what the weak acid or the weak base
  // alone would give; once the added strong acid or base has used one up, the pH comes from the
  // excess (or from the weak acid or base left, whichever sets more H⁺ or OH⁻). This floored a
  // used-up component at 0,001 M instead, so the pH stopped moving and the buffer looked
  // limitless while the water beside it kept falling (mobile-pass decision 118 (a)).
  const mixture = useCallback(
    (netStrongAcid: number) => simulateMixture(pKa, acidConc, baseConc, netStrongAcid),
    [pKa, acidConc, baseConc]
  );

  const adjustedState = useMemo(
    () => mixture(acidAdded - baseAdded),
    [mixture, acidAdded, baseAdded]
  );

  // Calculate what pH would be in unbuffered water. The amounts are concentrations (M), so
  // [H⁺] is the excess itself: 0,01 M strong acid gives pH 2. This divided by 1000 as if they
  // were mmol, and showed water at pH 5 — a smaller change than the buffer's, under a tip
  // saying the buffer changes less.
  const unbufferedPH = useMemo(() => {
    const netH = acidAdded - baseAdded;
    if (Math.abs(netH) < 0.001) return 7.0;
    if (netH > 0) {
      // Excess H⁺
      return Math.max(0, -Math.log10(netH));
    } else {
      // Excess OH⁻
      const pOH = Math.max(0, -Math.log10(-netH));
      return Math.min(14, 14 - pOH);
    }
  }, [acidAdded, baseAdded]);

  // Initial pH, from the same model with nothing added, so that before anything is added the
  // two agree and ΔpH reads 0.
  const initialPH = useMemo(() => mixture(0).pH, [mixture]);

  // Buffer capacity (β) at current pH
  const bufferCapacity = useMemo(() => {
    // β = 2.303 × C × (Ka × [H⁺]) / (Ka + [H⁺])²
    const H = Math.pow(10, -adjustedState.pH);
    const Ka = Math.pow(10, -pKa);
    const alpha = (Ka * H) / Math.pow(Ka + H, 2);
    return 2.303 * totalConc * alpha;
  }, [adjustedState.pH, pKa, totalConc]);

  // Generate buffer capacity curve points
  const capacityCurve = useMemo(() => {
    const points: { pH: number; capacity: number }[] = [];
    const Ka = Math.pow(10, -pKa);

    for (let pH = pKa - 3; pH <= pKa + 3; pH += 0.1) {
      const H = Math.pow(10, -pH);
      const alpha = (Ka * H) / Math.pow(Ka + H, 2);
      const beta = 2.303 * totalConc * alpha;
      points.push({ pH, capacity: beta });
    }
    return points;
  }, [pKa, totalConc]);

  // Max capacity for scaling
  const maxCapacity = useMemo(() => {
    return Math.max(...capacityCurve.map((p) => p.capacity));
  }, [capacityCurve]);

  // Handle adding acid. The base total is left alone: `adjustedState` already neutralises
  // one against the other, and taking the amount off both totals as well counted it twice —
  // 0,05 M acid then 0,01 M base read as 0,03 M net acid, and "Bætt við" showed 0,040.
  const handleAddAcid = (amount: number) => {
    const newAcidAdded = Math.max(0, acidAdded + amount);
    setAcidAdded(newAcidAdded);
    onAddition?.('acid', amount, mixture(newAcidAdded - baseAdded).pH);
  };

  // Handle adding base (see handleAddAcid)
  const handleAddBase = (amount: number) => {
    const newBaseAdded = Math.max(0, baseAdded + amount);
    setBaseAdded(newBaseAdded);
    onAddition?.('base', amount, mixture(acidAdded - newBaseAdded).pH);
  };

  // Reset simulation
  const handleReset = () => {
    setAcidAdded(0);
    setBaseAdded(0);
  };

  // SVG dimensions for capacity curve
  const curveBoxRef = useRef<HTMLDivElement>(null);
  const measuredWidth = useContainerWidth(curveBoxRef);
  const compact = measuredWidth !== null && measuredWidth < COMPACT_BELOW_PX;
  const svgWidth = compact ? Math.round(measuredWidth) : 320;
  const svgHeight = compact ? 194 : 160;
  const padding = compact
    ? { top: 30, right: 14, bottom: 48, left: 22 }
    : { top: 20, right: 20, bottom: 30, left: 40 };
  const fontSize = compact ? { tick: 12, label: 13 } : { tick: 9, label: 10 };
  const graphBottom = svgHeight - padding.bottom;
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Scale functions
  const xScale = (pH: number) => {
    const minPH = pKa - 3;
    const maxPH = pKa + 3;
    return padding.left + ((pH - minPH) / (maxPH - minPH)) * graphWidth;
  };

  const yScale = (capacity: number) => {
    return svgHeight - padding.bottom - (capacity / maxCapacity) * graphHeight;
  };

  // Generate SVG path for capacity curve
  const pathD = capacityCurve
    .map(
      (p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.pH).toFixed(1)} ${yScale(p.capacity).toFixed(1)}`
    )
    .join(' ');

  // pH color based on value
  const getPhColor = (pH: number): string => {
    if (pH < 4) return '#ef4444';
    if (pH < 6) return '#f97316';
    if (pH < 8) return '#84cc16';
    if (pH < 10) return '#22c55e';
    return '#3b82f6';
  };

  return (
    <div className="bg-gradient-to-b from-warm-800 to-warm-900 rounded-xl p-3 sm:p-4 shadow-lg">
      <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
        <span className="text-lg">🛡️</span>
        Stuðpúðageta
      </h3>

      {/* Buffer Capacity Curve */}
      <div className="bg-warm-700/50 rounded-lg p-3 mb-4">
        <div className="text-xs text-warm-400 mb-2 text-center">β (stuðpúðageta) vs pH</div>
        <div ref={curveBoxRef}>
          <svg
            width="100%"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="overflow-visible"
            role="img"
            aria-label={`Stuðpúðageta graf: pH ${formatDecimal(adjustedState.pH, 2)}, pKa ${formatDecimal(pKa, 1)}. Besta stuðpúðasvæði er pH ${formatDecimal(pKa - 1, 1)} til ${formatDecimal(pKa + 1, 1)}.`}
          >
            <title>Stuðpúðageta (β) sem fall af pH</title>
            {/* Grid lines */}
            <defs>
              <pattern id="grid-capacity" width="20" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              </pattern>
            </defs>
            <rect
              x={padding.left}
              y={padding.top}
              width={graphWidth}
              height={graphHeight}
              fill="url(#grid-capacity)"
            />

            {/* Optimal buffer range (pKa ± 1) shaded region */}
            <rect
              x={xScale(pKa - 1)}
              y={padding.top}
              width={xScale(pKa + 1) - xScale(pKa - 1)}
              height={graphHeight}
              fill="#22c55e"
              opacity="0.2"
            />
            {/* Compact: above the plot, where neither the curve nor its pH marker can reach */}
            <text
              x={xScale(pKa)}
              y={compact ? padding.top - 10 : padding.top + 12}
              textAnchor="middle"
              fill="#22c55e"
              fontSize={fontSize.tick}
              fontWeight="bold"
            >
              Besta svæði
            </text>

            {/* Buffer capacity curve */}
            <path d={pathD} fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />

            {/* pKa marker */}
            <line
              x1={xScale(pKa)}
              y1={padding.top}
              x2={xScale(pKa)}
              y2={graphBottom}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
            <text
              x={xScale(pKa)}
              y={graphBottom + (compact ? 34 : 20)}
              textAnchor="middle"
              fill="#f59e0b"
              fontSize={fontSize.label}
              fontWeight="bold"
            >
              pKa = {formatDecimal(pKa, 1)}
            </text>

            {/* Current pH marker, held at the edge of the plot once the excess strong acid or
                base has taken the pH past pKa ± 3 */}
            <circle
              cx={xScale(Math.min(pKa + 3, Math.max(pKa - 3, adjustedState.pH)))}
              cy={yScale(bufferCapacity)}
              r="6"
              fill={getPhColor(adjustedState.pH)}
              stroke="#fff"
              strokeWidth="2"
            />

            {/* X-axis labels */}
            {[pKa - 2, pKa - 1, pKa, pKa + 1, pKa + 2].map((pH) => (
              <text
                key={pH}
                x={xScale(pH)}
                y={graphBottom + (compact ? 15 : 12)}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize={fontSize.tick}
              >
                {formatDecimal(pH, 1)}
              </text>
            ))}

            {/* Y-axis label (a single glyph, so the compact layout does not rotate it) */}
            {compact ? (
              <text
                x="8"
                y={padding.top + graphHeight / 2 + 4}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize={fontSize.label}
              >
                β
              </text>
            ) : (
              <text
                x="10"
                y={svgHeight / 2}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="9"
                transform={`rotate(-90, 10, ${svgHeight / 2})`}
              >
                β
              </text>
            )}

            {/* X-axis label; compact moves it to the right end, off the centred pKa label */}
            <text
              x={compact ? svgWidth - 2 : svgWidth / 2}
              y={compact ? graphBottom + 34 : svgHeight - 2}
              textAnchor={compact ? 'end' : 'middle'}
              fill="#9ca3af"
              fontSize={fontSize.label}
            >
              pH
            </text>
          </svg>
        </div>
      </div>

      {/* Current State Display */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-4">
        <div className="bg-warm-700 rounded-lg px-1 py-2 sm:p-2 text-center">
          <div className="text-xs text-warm-400">Núverandi pH</div>
          <div className="text-xl font-bold" style={{ color: getPhColor(adjustedState.pH) }}>
            {formatDecimal(adjustedState.pH, 2)}
          </div>
        </div>
        <div className="bg-warm-700 rounded-lg px-1 py-2 sm:p-2 text-center">
          <div className="text-xs text-warm-400">Upphafs-pH</div>
          <div className="text-lg font-semibold text-warm-300">{formatDecimal(initialPH, 2)}</div>
        </div>
        <div className="bg-warm-700 rounded-lg px-1 py-2 sm:p-2 text-center">
          <div className="text-xs text-warm-400">ΔpH</div>
          <div
            className={`text-lg font-semibold ${
              Math.abs(adjustedState.pH - initialPH) < 0.5 ? 'text-green-400' : 'text-orange-400'
            }`}
          >
            {formatDecimal(adjustedState.pH - initialPH, 2)}
          </div>
        </div>
      </div>

      {/* Acid/Base Addition Simulator */}
      {showAdditionSim && (
        <div className="bg-warm-700/50 rounded-lg p-3 mb-4">
          <div className="text-xs text-warm-400 mb-2 text-center font-semibold">
            Bæta við sýru eða basa
          </div>

          {/* Visual representation of buffer components */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold mx-auto">
                {acidName}
              </div>
              <div className="text-xs text-warm-400 mt-1">
                {formatDecimal(adjustedState.acidConc, 3)} M
              </div>
            </div>
            <div className="text-warm-400 text-2xl">⇌</div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold mx-auto">
                {baseName}
              </div>
              <div className="text-xs text-warm-400 mt-1">
                {formatDecimal(adjustedState.baseConc, 3)} M
              </div>
            </div>
          </div>

          {/* Addition controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-red-400 font-semibold mb-1 text-center">
                + Sterk sýra (H⁺)
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleAddAcid(0.01)}
                  aria-label="Bæta við 0,01 M sterkri sýru"
                  className="flex-1 py-1.5 pointer-coarse:min-h-11 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                >
                  +0,01 M
                </button>
                <button
                  onClick={() => handleAddAcid(0.05)}
                  aria-label="Bæta við 0,05 M sterkri sýru"
                  className="flex-1 py-1.5 pointer-coarse:min-h-11 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                >
                  +0,05 M
                </button>
              </div>
              <div className="text-xs text-warm-500 mt-1 text-center">
                Bætt við: {formatDecimal(acidAdded, 3)} M
              </div>
            </div>

            <div>
              <div className="text-xs text-blue-400 font-semibold mb-1 text-center">
                + Sterkur basi (OH⁻)
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleAddBase(0.01)}
                  aria-label="Bæta við 0,01 M sterkum basa"
                  className="flex-1 py-1.5 pointer-coarse:min-h-11 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                >
                  +0,01 M
                </button>
                <button
                  onClick={() => handleAddBase(0.05)}
                  aria-label="Bæta við 0,05 M sterkum basa"
                  className="flex-1 py-1.5 pointer-coarse:min-h-11 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                >
                  +0,05 M
                </button>
              </div>
              <div className="text-xs text-warm-500 mt-1 text-center">
                Bætt við: {formatDecimal(baseAdded, 3)} M
              </div>
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="w-full mt-3 py-3 bg-warm-600 hover:bg-warm-500 text-white text-sm rounded transition-colors"
          >
            ↺ Endurstilla
          </button>
        </div>
      )}

      {/* Comparison toggle */}
      <button
        onClick={() => setShowComparison(!showComparison)}
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors mb-3"
      >
        {showComparison ? '▼ Fela samanburð' : '▶ Sýna samanburð við vatn'}
      </button>

      {/* Comparison: Buffer vs Water. It opens whenever the toggle says it is open; it used to
          stay empty until something was added, under a button already reading "Fela". */}
      {showComparison && (
        <div ref={comparisonRef} className="bg-warm-700/50 rounded-lg p-3">
          <div className="text-xs text-warm-400 mb-2 text-center font-semibold">
            Samanburður: Stuðpúði vs Hreint vatn
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Buffer solution */}
            <div className="text-center">
              <div className="text-xs text-green-400 font-semibold mb-1">Með stuðpúða</div>
              <div
                className="h-24 rounded-lg flex items-center justify-center text-white font-bold text-lg transition-colors"
                style={{ backgroundColor: getPhColor(adjustedState.pH) }}
              >
                pH {formatDecimal(adjustedState.pH, 2)}
              </div>
              {/* From the buffer's own starting pH, as the ΔpH readout above measures it. This
                  measured from 7, so an acetate buffer that moved 0,18 read 2,44. */}
              <div className="text-xs text-warm-400 mt-1">
                ΔpH = {formatDecimal(Math.abs(adjustedState.pH - initialPH), 2)}
              </div>
            </div>

            {/* Pure water */}
            <div className="text-center">
              <div className="text-xs text-red-400 font-semibold mb-1">Án stuðpúða (vatn)</div>
              <div
                className="h-24 rounded-lg flex items-center justify-center text-white font-bold text-lg transition-colors"
                style={{ backgroundColor: getPhColor(unbufferedPH) }}
              >
                pH {formatDecimal(unbufferedPH, 2)}
              </div>
              <div className="text-xs text-warm-400 mt-1">
                ΔpH = {formatDecimal(Math.abs(unbufferedPH - 7), 2)}
              </div>
            </div>
          </div>

          {/* Only when the numbers above bear it out: additions that cancel leave both at 0,00. */}
          {Math.abs(unbufferedPH - 7) > Math.abs(adjustedState.pH - initialPH) && (
            <div className="mt-3 text-xs text-center text-warm-400">
              💡 Stuðpúðinn verndar pH - minni breyting en í vatni!
            </div>
          )}
        </div>
      )}

      {/* Buffer mechanism explanation */}
      <div className="mt-4 bg-yellow-900/30 rounded-lg p-3">
        <div className="text-xs text-yellow-400 font-semibold mb-1">Hvernig stuðpúðinn virkar:</div>
        <div className="text-xs text-warm-300 space-y-1">
          <div>
            • <span className="text-red-400">Við sýrubótun:</span> {baseName} + H⁺ → {acidName}
          </div>
          <div>
            • <span className="text-blue-400">Við basabótun:</span> {acidName} + OH⁻ → {baseName} +
            H₂O
          </div>
          <div className="text-warm-400 mt-2">
            Stuðpúðagetan er mest þegar pH = pKa (hlutfall {baseName}/{acidName} ≈ 1)
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500" />
          <span className="text-warm-400">Besta svæði (pKa ± 1)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-yellow-500" />
          <span className="text-warm-400">pKa</span>
        </div>
      </div>
    </div>
  );
}

export default BufferCapacityVisualization;
