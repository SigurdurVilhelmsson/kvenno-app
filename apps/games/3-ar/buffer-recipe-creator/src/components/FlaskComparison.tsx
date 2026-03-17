import { useMemo } from 'react';

interface FlaskComparisonProps {
  /** The target pH of the buffer */
  targetPH: number;
  /** pKa of the acid */
  pKa: number;
  /** How much acid has been added (moles, 0 = none) */
  addedAcidMoles: number;
  /** How much base has been added (moles, 0 = none) */
  addedBaseMoles: number;
  /** Buffer concentration in M */
  bufferConcentration: number;
}

/** pH color scale (0-14) matching the ph-titration game palette */
const PH_COLORS = [
  '#8B0000',
  '#DC143C',
  '#FF0000',
  '#FF4500',
  '#FF6347',
  '#FFA500',
  '#FFD700',
  '#00FF00',
  '#00CED1',
  '#1E90FF',
  '#0000FF',
  '#4B0082',
  '#8B00FF',
  '#9400D3',
  '#800080',
];

function getPHColor(pH: number): string {
  const idx = Math.min(14, Math.max(0, Math.round(pH)));
  return PH_COLORS[idx];
}

/** SVG flask with colored solution */
function Flask({ color, label, pH }: { color: string; label: string; pH: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs font-semibold text-warm-300 text-center">{label}</div>
      <svg
        width="80"
        height="120"
        viewBox="0 0 80 120"
        role="img"
        aria-label={`${label}: pH ${pH.toFixed(2)}`}
      >
        <title>
          {label} - pH {pH.toFixed(2)}
        </title>
        {/* Solution fill (behind flask outline) */}
        <path d="M 14 88 Q 12 108 30 113 L 50 113 Q 68 108 66 88 Z" fill={color} opacity="0.75">
          <animate
            attributeName="opacity"
            values="0.70;0.80;0.70"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>
        {/* Flask neck */}
        <rect
          x="30"
          y="0"
          width="20"
          height="30"
          rx="2"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
        />
        {/* Flask body */}
        <path
          d="M 30 30 L 10 90 Q 10 115 30 118 L 50 118 Q 70 115 70 90 L 50 30"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* pH label inside flask */}
        <text x="40" y="105" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="bold">
          {pH.toFixed(1)}
        </text>
      </svg>
    </div>
  );
}

/**
 * FlaskComparison - Side-by-side buffered vs unbuffered flask visualization.
 *
 * Shows how a buffer solution resists pH change compared to an unbuffered
 * solution when the same amount of acid or base is added. The solution
 * color maps to the pH via the standard pH indicator color scale.
 */
export default function FlaskComparison({
  targetPH,
  pKa,
  addedAcidMoles,
  addedBaseMoles,
  bufferConcentration,
}: FlaskComparisonProps) {
  // Assume 1 L volume for simplicity
  const volume = 1; // L

  // Calculate buffered pH via Henderson-Hasselbalch
  const bufferedPH = useMemo(() => {
    const ratio = Math.pow(10, targetPH - pKa);
    const totalMoles = bufferConcentration * volume;
    const baseMoles0 = (totalMoles * ratio) / (1 + ratio);
    const acidMoles0 = totalMoles - baseMoles0;

    // Adding strong acid: A- + H+ -> HA  (base decreases, acid increases)
    // Adding strong base: HA + OH- -> A- + H2O (acid decreases, base increases)
    const adjustedAcid = Math.max(0.0001, acidMoles0 + addedAcidMoles - addedBaseMoles);
    const adjustedBase = Math.max(0.0001, baseMoles0 - addedAcidMoles + addedBaseMoles);

    return Math.min(14, Math.max(0, pKa + Math.log10(adjustedBase / adjustedAcid)));
  }, [targetPH, pKa, addedAcidMoles, addedBaseMoles, bufferConcentration, volume]);

  // Calculate unbuffered pH (pure water starting at same pH, then acid/base added)
  const unbufferedPH = useMemo(() => {
    const netAcid = addedAcidMoles - addedBaseMoles;
    if (Math.abs(netAcid) < 1e-8) return targetPH;
    if (netAcid > 0) {
      // Net acid added to water
      const hConc = netAcid / volume;
      return Math.max(0, -Math.log10(hConc));
    } else {
      // Net base added to water
      const ohConc = -netAcid / volume;
      const pOH = Math.max(0, -Math.log10(ohConc));
      return Math.min(14, 14 - pOH);
    }
  }, [addedAcidMoles, addedBaseMoles, targetPH, volume]);

  const bufferedColor = getPHColor(bufferedPH);
  const unbufferedColor = getPHColor(unbufferedPH);
  const hasAddition = addedAcidMoles > 0 || addedBaseMoles > 0;

  return (
    <div className="bg-warm-800/60 rounded-xl p-4">
      <h4 className="text-sm font-bold text-warm-200 mb-3 text-center">
        Stuðpúðaður vs Óstuðpúðaður
      </h4>

      {/* Side-by-side flasks */}
      <div className="flex justify-center gap-6 mb-3">
        <Flask color={bufferedColor} label="Stuðpúðaður" pH={bufferedPH} />
        <Flask color={unbufferedColor} label="Óstuðpúðaður" pH={unbufferedPH} />
      </div>

      {/* pH color bar */}
      <div className="relative mt-2">
        <div className="flex h-3 rounded-full overflow-hidden">
          {PH_COLORS.map((c, i) => (
            <div key={i} className="flex-1" style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-warm-400 mt-0.5 px-0.5">
          <span>0</span>
          <span>7</span>
          <span>14</span>
        </div>

        {/* Markers for each flask's pH on the color bar */}
        <div
          className="absolute top-[-4px] transition-all duration-300"
          style={{ left: `${(bufferedPH / 14) * 100}%` }}
          title={`Stuðpúðaður: pH ${bufferedPH.toFixed(2)}`}
        >
          <div className="w-2.5 h-2.5 -ml-1 rounded-full border-2 border-white bg-green-400" />
        </div>
        <div
          className="absolute top-[-4px] transition-all duration-300"
          style={{ left: `${(unbufferedPH / 14) * 100}%` }}
          title={`Óstuðpúðaður: pH ${unbufferedPH.toFixed(2)}`}
        >
          <div className="w-2.5 h-2.5 -ml-1 rounded-full border-2 border-white bg-red-400" />
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-[10px] text-warm-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Stuðpúðaður
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Óstuðpúðaður
        </span>
      </div>

      {/* Insight text */}
      {hasAddition && (
        <p className="text-[10px] text-warm-400 text-center mt-2">
          Stuðpúðinn heldur pH stöðugu - munur aðeins {Math.abs(bufferedPH - targetPH).toFixed(2)}{' '}
          einingar!
        </p>
      )}
    </div>
  );
}
