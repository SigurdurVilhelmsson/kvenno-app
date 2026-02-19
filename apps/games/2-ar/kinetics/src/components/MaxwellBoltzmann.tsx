import { useMemo } from 'react';

interface MaxwellBoltzmannProps {
  temperature: number;
  activationEnergy: number;
  compareTemperature?: number;
  className?: string;
  /** Make the graph fill its container width */
  responsive?: boolean;
}

// Gas constant in kJ/(mol·K)
const R = 8.314e-3;

/**
 * Maxwell-Boltzmann energy distribution function
 * Returns relative probability density at energy E for temperature T
 */
function maxwellBoltzmann(E: number, T: number): number {
  if (E <= 0) return 0;
  const factor = Math.sqrt(E) * Math.exp(-E / (R * T));
  return factor;
}

/**
 * Calculate fraction of molecules with energy >= Ea
 * Uses trapezoidal integration
 */
function calculateFractionAboveEa(T: number, Ea: number, maxE: number = 150): number {
  const steps = 500;
  const dE = maxE / steps;

  let totalArea = 0;
  let areaAboveEa = 0;

  for (let i = 0; i < steps; i++) {
    const E1 = i * dE;
    const E2 = (i + 1) * dE;
    const f1 = maxwellBoltzmann(E1, T);
    const f2 = maxwellBoltzmann(E2, T);
    const area = (f1 + f2) * dE / 2;

    totalArea += area;
    if (E1 >= Ea) {
      areaAboveEa += area;
    } else if (E2 > Ea) {
      // Partial area when crossing Ea
      const ratio = (E2 - Ea) / dE;
      areaAboveEa += area * ratio;
    }
  }

  return totalArea > 0 ? areaAboveEa / totalArea : 0;
}

/**
 * Get color for temperature (blue -> orange -> red)
 */
function getTemperatureColor(T: number): string {
  if (T <= 300) return '#3b82f6'; // Blue
  if (T >= 450) return '#ef4444'; // Red
  // Interpolate orange
  const ratio = (T - 300) / 150;
  if (ratio < 0.5) {
    // Blue to orange
    return '#f97316';
  }
  return '#f97316'; // Orange for middle range
}

/**
 * MaxwellBoltzmann - Energy distribution visualization
 *
 * Shows the Maxwell-Boltzmann distribution curve with:
 * - Shaded area where E >= Ea (activation energy)
 * - Percentage of molecules with sufficient energy
 * - Optional comparison curve at different temperature
 */
export function MaxwellBoltzmann({
  temperature,
  activationEnergy,
  compareTemperature,
  className = '',
  responsive = true
}: MaxwellBoltzmannProps) {
  // Generate curve data
  const { mainCurve, compareCurve, maxY } = useMemo(() => {
    const points = 200;
    const maxE = 120;
    const dE = maxE / points;

    const main: { x: number; y: number }[] = [];
    const compare: { x: number; y: number }[] = [];
    let maxVal = 0;

    for (let i = 0; i <= points; i++) {
      const E = i * dE;
      const y = maxwellBoltzmann(E, temperature);
      main.push({ x: E, y });
      maxVal = Math.max(maxVal, y);

      if (compareTemperature) {
        const yComp = maxwellBoltzmann(E, compareTemperature);
        compare.push({ x: E, y: yComp });
        maxVal = Math.max(maxVal, yComp);
      }
    }

    return { mainCurve: main, compareCurve: compare, maxY: maxVal };
  }, [temperature, compareTemperature]);

  // Calculate percentage above Ea
  const fractionAboveEa = useMemo(() => {
    return calculateFractionAboveEa(temperature, activationEnergy);
  }, [temperature, activationEnergy]);

  const percentAboveEa = (fractionAboveEa * 100).toFixed(1);

  // SVG dimensions
  const width = 320;
  const height = 200;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Scale functions
  const maxE = 120;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: scaleX is an inline helper, useMemo deps are controlled
  const scaleX = (x: number) => margin.left + (x / maxE) * plotWidth;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: scaleY is an inline helper, useMemo deps are controlled
  const scaleY = (y: number) => margin.top + plotHeight - (y / maxY) * plotHeight;

  // Generate SVG path for curve
  const pathD = mainCurve.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`
  ).join(' ');

  // Generate SVG path for comparison curve
  const comparePathD = compareCurve.length > 0
    ? compareCurve.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`
      ).join(' ')
    : '';

  // Generate shaded area path (from Ea to end, under curve)
  const shadedPath = useMemo(() => {
    const startIdx = mainCurve.findIndex(p => p.x >= activationEnergy);
    if (startIdx === -1) return '';

    const relevantPoints = mainCurve.slice(startIdx);
    if (relevantPoints.length === 0) return '';

    let d = `M ${scaleX(activationEnergy)} ${scaleY(0)}`;

    // Interpolate y value at exactly Ea
    if (startIdx > 0) {
      const p1 = mainCurve[startIdx - 1];
      const p2 = mainCurve[startIdx];
      const ratio = (activationEnergy - p1.x) / (p2.x - p1.x);
      const yAtEa = p1.y + ratio * (p2.y - p1.y);
      d += ` L ${scaleX(activationEnergy)} ${scaleY(yAtEa)}`;
    }

    // Follow the curve
    relevantPoints.forEach(p => {
      d += ` L ${scaleX(p.x)} ${scaleY(p.y)}`;
    });

    // Close path back to baseline
    d += ` L ${scaleX(maxE)} ${scaleY(0)} Z`;

    return d;
  }, [mainCurve, activationEnergy, scaleX, scaleY]);

  const curveColor = getTemperatureColor(temperature);

  return (
    <div className={`bg-gray-900 rounded-xl p-4 ${className}`}>
      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-white font-semibold text-sm">Orkudreifing Maxwell-Boltzmann</h3>
        <div className="text-xs text-gray-400">
          {temperature} K
        </div>
      </div>

      <svg
        width={responsive ? '100%' : width}
        height={responsive ? 'auto' : height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="bg-slate-950 rounded-lg w-full"
        style={responsive ? { aspectRatio: `${width}/${height}` } : undefined}
        role="img"
        aria-label={`Maxwell-Boltzmann dreifing við ${temperature} K. ${percentAboveEa}% sameinda hafa orku yfir virkjunarorku.`}
      >
        {/* Grid lines */}
        <g className="text-gray-700">
          {[0, 30, 60, 90, 120].map(x => (
            <line
              key={`grid-x-${x}`}
              x1={scaleX(x)}
              y1={margin.top}
              x2={scaleX(x)}
              y2={height - margin.bottom}
              stroke="#374151"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          {[0.25, 0.5, 0.75].map((ratio, i) => (
            <line
              key={`grid-y-${i}`}
              x1={margin.left}
              y1={margin.top + plotHeight * (1 - ratio)}
              x2={width - margin.right}
              y2={margin.top + plotHeight * (1 - ratio)}
              stroke="#374151"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
        </g>

        {/* Axes */}
        <line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          stroke="#6b7280"
          strokeWidth="2"
        />
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height - margin.bottom}
          stroke="#6b7280"
          strokeWidth="2"
        />

        {/* X-axis label */}
        <text
          x={width / 2}
          y={height - 8}
          textAnchor="middle"
          className="fill-gray-400 text-xs"
          style={{ fontSize: '11px' }}
        >
          Orka (kJ/mol)
        </text>

        {/* Y-axis label */}
        <text
          x={12}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 12, ${height / 2})`}
          className="fill-gray-400 text-xs"
          style={{ fontSize: '10px' }}
        >
          Fjöldi sameinda
        </text>

        {/* X-axis ticks */}
        {[0, 30, 60, 90, 120].map(x => (
          <g key={`tick-${x}`}>
            <line
              x1={scaleX(x)}
              y1={height - margin.bottom}
              x2={scaleX(x)}
              y2={height - margin.bottom + 5}
              stroke="#6b7280"
              strokeWidth="1"
            />
            <text
              x={scaleX(x)}
              y={height - margin.bottom + 16}
              textAnchor="middle"
              className="fill-gray-500"
              style={{ fontSize: '10px' }}
            >
              {x}
            </text>
          </g>
        ))}

        {/* Shaded area above Ea */}
        <path
          d={shadedPath}
          fill="#22c55e"
          fillOpacity="0.3"
          stroke="none"
        />

        {/* Activation energy line */}
        <line
          x1={scaleX(activationEnergy)}
          y1={margin.top}
          x2={scaleX(activationEnergy)}
          y2={height - margin.bottom}
          stroke="#dc2626"
          strokeWidth="2"
          strokeDasharray="6,3"
        />
        <text
          x={scaleX(activationEnergy) + 4}
          y={margin.top + 12}
          className="fill-red-400"
          style={{ fontSize: '10px' }}
        >
          Ea
        </text>

        {/* Comparison curve (if provided) */}
        {comparePathD && (
          <path
            d={comparePathD}
            fill="none"
            stroke={getTemperatureColor(compareTemperature!)}
            strokeWidth="2"
            strokeDasharray="4,2"
            opacity="0.6"
          />
        )}

        {/* Main distribution curve */}
        <path
          d={pathD}
          fill="none"
          stroke={curveColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Percentage display */}
      <div className="mt-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-3 rounded"
            style={{ backgroundColor: '#22c55e', opacity: 0.5 }}
          />
          <span className="text-green-400 text-sm font-semibold">
            {percentAboveEa}% sameinda með E ≥ Ea
          </span>
        </div>
        <div className="text-xs text-gray-400">
          Ea = {activationEnergy} kJ/mol
        </div>
      </div>

      {/* Educational note */}
      <div className="mt-2 text-xs text-gray-400 text-center">
        Hærra hitastig → fleiri sameidir með nóga orku
      </div>
    </div>
  );
}
