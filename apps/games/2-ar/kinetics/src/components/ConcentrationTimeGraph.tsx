import { useState, useMemo } from 'react';

interface ConcentrationTimeGraphProps {
  /** Initial concentration [A]₀ in M */
  initialConcentration?: number;
  /** Rate constant k */
  rateConstant?: number;
  /** Reaction order (0, 1, or 2) */
  order?: 0 | 1 | 2;
  /** Show all orders for comparison */
  showComparison?: boolean;
  /** Interactive controls */
  interactive?: boolean;
  /** Compact display */
  compact?: boolean;
}

/**
 * Calculate concentration at time t for different orders
 */
function calculateConcentration(
  t: number,
  A0: number,
  k: number,
  order: 0 | 1 | 2
): number {
  switch (order) {
    case 0:
      // [A] = [A]₀ - kt
      return Math.max(0, A0 - k * t);
    case 1:
      // [A] = [A]₀ × e^(-kt)
      return A0 * Math.exp(-k * t);
    case 2:
      // [A] = [A]₀ / (1 + kt[A]₀)
      return A0 / (1 + k * t * A0);
    default:
      return A0;
  }
}

/**
 * Calculate half-life for different orders
 */
function calculateHalfLife(A0: number, k: number, order: 0 | 1 | 2): number {
  switch (order) {
    case 0:
      // t₁/₂ = [A]₀ / (2k)
      return A0 / (2 * k);
    case 1:
      // t₁/₂ = ln(2) / k
      return Math.log(2) / k;
    case 2:
      // t₁/₂ = 1 / (k[A]₀)
      return 1 / (k * A0);
    default:
      return 0;
  }
}

const ORDER_INFO = {
  0: {
    name: '0. stig (Zero Order)',
    equation: '[A] = [A]₀ - kt',
    linearPlot: '[A] vs t',
    halfLifeEq: 't₁/₂ = [A]₀/(2k)',
    color: '#ef4444', // red
    description: 'Styrkur minnkar línulega með tíma. Hraðinn er stöðugur.',
  },
  1: {
    name: '1. stig (First Order)',
    equation: '[A] = [A]₀·e^(-kt)',
    linearPlot: 'ln[A] vs t',
    halfLifeEq: 't₁/₂ = ln(2)/k',
    color: '#22c55e', // green
    description: 'Styrkur minnkar veldisfallslega. Hraðinn fer lækkandi.',
  },
  2: {
    name: '2. stig (Second Order)',
    equation: '[A] = [A]₀/(1+kt[A]₀)',
    linearPlot: '1/[A] vs t',
    halfLifeEq: 't₁/₂ = 1/(k[A]₀)',
    color: '#3b82f6', // blue
    description: 'Styrkur minnkar hægar en 1. stig. Langt "hali" á graf.',
  },
};

/**
 * ConcentrationTimeGraph - Visualizes [A] vs time for reaction kinetics
 *
 * Shows how concentration decreases over time based on reaction order,
 * with half-life markers and optional comparison between orders.
 */
export function ConcentrationTimeGraph({
  initialConcentration = 1.0,
  rateConstant = 0.1,
  order = 1,
  showComparison = false,
  interactive = true,
  compact = false,
}: ConcentrationTimeGraphProps) {
  const [A0, setA0] = useState(initialConcentration);
  const [k, setK] = useState(rateConstant);
  const [selectedOrder, setSelectedOrder] = useState<0 | 1 | 2>(order);
  const [showHalfLife, setShowHalfLife] = useState(true);

  // SVG dimensions
  const width = compact ? 300 : 400;
  const height = compact ? 180 : 240;
  const margin = { top: 30, right: 30, bottom: 40, left: 55 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Calculate time range based on rate constant (show ~5 half-lives)
  const maxTime = useMemo(() => {
    const t_half = calculateHalfLife(A0, k, selectedOrder);
    return Math.min(100, t_half * 5);
  }, [A0, k, selectedOrder]);

  // Generate curve data
  const curves = useMemo(() => {
    const orders = showComparison ? [0, 1, 2] as const : [selectedOrder];
    const result: Record<number, { x: number; y: number }[]> = {};

    for (const ord of orders) {
      const points: { x: number; y: number }[] = [];
      const steps = 100;

      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * maxTime;
        const concentration = calculateConcentration(t, A0, k, ord);
        points.push({ x: t, y: concentration });
      }

      result[ord] = points;
    }

    return result;
  }, [A0, k, selectedOrder, maxTime, showComparison]);

  // Scale functions
  const scaleX = (x: number) => margin.left + (x / maxTime) * plotWidth;
  const scaleY = (y: number) => margin.top + (1 - y / A0) * plotHeight;

  // Generate SVG path for a curve
  const generatePath = (points: { x: number; y: number }[]) => {
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`)
      .join(' ');
  };

  // Calculate half-life for current settings
  const halfLife = calculateHalfLife(A0, k, selectedOrder);
  const halfLifeConc = A0 / 2;

  const info = ORDER_INFO[selectedOrder];

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <span className="text-lg">📈</span>
          Styrkur vs Tími
        </h3>
        {interactive && (
          <div className="flex gap-2">
            {([0, 1, 2] as const).map((ord) => (
              <button
                key={ord}
                onClick={() => setSelectedOrder(ord)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  selectedOrder === ord
                    ? `text-white`
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                style={{
                  backgroundColor: selectedOrder === ord ? ORDER_INFO[ord].color : undefined,
                }}
              >
                {ord}. stig
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive controls */}
      {interactive && !compact && (
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-700/50 rounded-lg">
          <div>
            <label className="text-xs text-gray-400 block mb-1">[A]₀ (M)</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={A0}
                onChange={(e) => setA0(Number(e.target.value))}
                className="flex-1 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <span className="text-xs font-mono text-purple-400 w-10">{A0.toFixed(1)}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">k (hraðafasti)</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.01"
                value={k}
                onChange={(e) => setK(Number(e.target.value))}
                className="flex-1 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <span className="text-xs font-mono text-orange-400 w-12">{k.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Graph */}
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="bg-slate-950 rounded-lg"
        role="img"
        aria-label={`Styrkur vs tími graf fyrir ${info.name}`}
      >
        {/* Grid */}
        <defs>
          <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect
          x={margin.left}
          y={margin.top}
          width={plotWidth}
          height={plotHeight}
          fill="url(#gridPattern)"
          opacity="0.3"
        />

        {/* Axes */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height - margin.bottom}
          stroke="#6b7280"
          strokeWidth="2"
        />
        <line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          stroke="#6b7280"
          strokeWidth="2"
        />

        {/* Axis labels */}
        <text
          x={15}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 15, ${height / 2})`}
          className="fill-gray-400"
          style={{ fontSize: '11px' }}
        >
          [A] (M)
        </text>
        <text
          x={width / 2}
          y={height - 8}
          textAnchor="middle"
          className="fill-gray-400"
          style={{ fontSize: '11px' }}
        >
          Tími (s)
        </text>

        {/* Y-axis ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = scaleY(ratio * A0);
          const label = (ratio * A0).toFixed(2);
          return (
            <g key={ratio}>
              <line
                x1={margin.left - 5}
                y1={y}
                x2={margin.left}
                y2={y}
                stroke="#6b7280"
              />
              <text
                x={margin.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-gray-500"
                style={{ fontSize: '9px' }}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* X-axis ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const x = scaleX(ratio * maxTime);
          const label = (ratio * maxTime).toFixed(0);
          return (
            <g key={ratio}>
              <line
                x1={x}
                y1={height - margin.bottom}
                x2={x}
                y2={height - margin.bottom + 5}
                stroke="#6b7280"
              />
              <text
                x={x}
                y={height - margin.bottom + 16}
                textAnchor="middle"
                className="fill-gray-500"
                style={{ fontSize: '9px' }}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Half-life marker */}
        {showHalfLife && halfLife <= maxTime && (
          <g>
            {/* Vertical line at t₁/₂ */}
            <line
              x1={scaleX(halfLife)}
              y1={margin.top}
              x2={scaleX(halfLife)}
              y2={scaleY(halfLifeConc)}
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeDasharray="4,2"
            />
            {/* Horizontal line at [A]₀/2 */}
            <line
              x1={margin.left}
              y1={scaleY(halfLifeConc)}
              x2={scaleX(halfLife)}
              y2={scaleY(halfLifeConc)}
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeDasharray="4,2"
            />
            {/* Label */}
            <text
              x={scaleX(halfLife) + 5}
              y={margin.top + 12}
              className="fill-yellow-400"
              style={{ fontSize: '9px' }}
            >
              t₁/₂ = {halfLife.toFixed(1)}s
            </text>
            {/* Half concentration label */}
            <text
              x={margin.left + 5}
              y={scaleY(halfLifeConc) - 5}
              className="fill-yellow-400"
              style={{ fontSize: '9px' }}
            >
              [A]₀/2
            </text>
            {/* Circle at intersection */}
            <circle
              cx={scaleX(halfLife)}
              cy={scaleY(halfLifeConc)}
              r="4"
              fill="#fbbf24"
              stroke="#1f2937"
              strokeWidth="2"
            />
          </g>
        )}

        {/* Concentration curves */}
        {(showComparison ? [0, 1, 2] as const : [selectedOrder]).map((ord) => (
          <path
            key={ord}
            d={generatePath(curves[ord] || [])}
            fill="none"
            stroke={ORDER_INFO[ord].color}
            strokeWidth={showComparison ? 2 : 3}
            strokeLinecap="round"
            opacity={showComparison && ord !== selectedOrder ? 0.4 : 1}
          />
        ))}

        {/* Initial concentration marker */}
        <circle
          cx={scaleX(0)}
          cy={scaleY(A0)}
          r="5"
          fill={info.color}
          stroke="#1f2937"
          strokeWidth="2"
        />
        <text
          x={scaleX(0) + 8}
          y={scaleY(A0) + 4}
          className="fill-gray-300"
          style={{ fontSize: '9px' }}
        >
          [A]₀
        </text>

        {/* Legend for comparison mode */}
        {showComparison && (
          <g transform={`translate(${width - margin.right - 60}, ${margin.top + 10})`}>
            {([0, 1, 2] as const).map((ord, i) => (
              <g key={ord} transform={`translate(0, ${i * 15})`}>
                <line
                  x1="0"
                  y1="0"
                  x2="15"
                  y2="0"
                  stroke={ORDER_INFO[ord].color}
                  strokeWidth="2"
                />
                <text
                  x="20"
                  y="4"
                  className="fill-gray-300"
                  style={{ fontSize: '9px' }}
                >
                  {ord}. stig
                </text>
              </g>
            ))}
          </g>
        )}
      </svg>

      {/* Order information */}
      <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: `${info.color}20` }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: info.color }} />
          <span className="text-white font-bold text-sm">{info.name}</span>
        </div>
        <div className="text-gray-300 text-xs mb-2">{info.description}</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/50 p-2 rounded">
            <div className="text-gray-400">Jafna:</div>
            <div className="font-mono text-white">{info.equation}</div>
          </div>
          <div className="bg-slate-800/50 p-2 rounded">
            <div className="text-gray-400">Helmingunartími:</div>
            <div className="font-mono text-yellow-400">{info.halfLifeEq}</div>
          </div>
        </div>
      </div>

      {/* Half-life toggle */}
      {interactive && (
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => setShowHalfLife(!showHalfLife)}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              showHalfLife
                ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50'
                : 'bg-gray-600 text-gray-300'
            }`}
          >
            {showHalfLife ? '✓ Sýna t₁/₂' : 'Sýna t₁/₂'}
          </button>

          <div className="text-xs text-gray-400">
            t₁/₂ = <span className="font-mono text-yellow-400">{halfLife.toFixed(2)} s</span>
          </div>
        </div>
      )}

      {/* Key insight */}
      {!compact && (
        <div className="mt-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="text-blue-400 text-xs font-medium mb-1">Lykilatriði:</div>
          <ul className="text-gray-300 text-xs space-y-1">
            <li className="flex items-start gap-2">
              <span style={{ color: ORDER_INFO[0].color }}>●</span>
              <span>0. stig: t₁/₂ fer eftir [A]₀ - lengist þegar styrkur minnkar</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: ORDER_INFO[1].color }}>●</span>
              <span>1. stig: t₁/₂ er STÖÐUGUR - fer ekki eftir styrk</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: ORDER_INFO[2].color }}>●</span>
              <span>2. stig: t₁/₂ lengist þegar styrkur minnkar</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default ConcentrationTimeGraph;
