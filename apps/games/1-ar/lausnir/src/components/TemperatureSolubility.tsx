import { useState, useEffect, useMemo } from 'react';

/**
 * Temperature-Solubility Visualization Component
 * Shows how temperature affects solubility with an interactive slider
 * and real solubility data for common compounds
 */

// Solubility data (g/100g H₂O) at different temperatures
// Based on real chemistry data
export interface SolubilityData {
  compound: string;
  formula: string;
  emoji: string;
  type: 'solid' | 'gas';
  // Solubility at different temperatures (0°C, 20°C, 40°C, 60°C, 80°C, 100°C)
  solubility: [number, number, number, number, number, number];
  color: string;
}

export const SOLUBILITY_DATA: SolubilityData[] = [
  {
    compound: 'Kalíumnítrat',
    formula: 'KNO₃',
    emoji: '🧪',
    type: 'solid',
    solubility: [13, 32, 64, 110, 169, 246],
    color: '#8b5cf6' // purple
  },
  {
    compound: 'Natríumklóríð',
    formula: 'NaCl',
    emoji: '🧂',
    type: 'solid',
    solubility: [35.7, 36.0, 36.4, 37.1, 38.0, 39.2],
    color: '#3b82f6' // blue
  },
  {
    compound: 'Sykur',
    formula: 'C₁₂H₂₂O₁₁',
    emoji: '🍬',
    type: 'solid',
    solubility: [179, 204, 238, 287, 362, 487],
    color: '#f59e0b' // amber
  },
  {
    compound: 'Kalsíumsúlfat',
    formula: 'CaSO₄',
    emoji: '⚪',
    type: 'solid',
    solubility: [0.176, 0.209, 0.210, 0.193, 0.162, 0.114],
    color: '#64748b' // slate
  },
  {
    compound: 'Súrefni',
    formula: 'O₂',
    emoji: '💨',
    type: 'gas',
    solubility: [0.069, 0.044, 0.031, 0.023, 0.018, 0.0],
    color: '#22c55e' // green
  },
  {
    compound: 'Koltvísýringur',
    formula: 'CO₂',
    emoji: '🫧',
    type: 'gas',
    solubility: [3.35, 1.69, 0.97, 0.58, 0.36, 0.0],
    color: '#6b7280' // gray
  }
];

// Temperature tick marks
const TEMPERATURES = [0, 20, 40, 60, 80, 100];

// Interpolate solubility at any temperature
function interpolateSolubility(data: SolubilityData, temp: number): number {
  const temps = [0, 20, 40, 60, 80, 100];

  // Clamp temperature
  if (temp <= 0) return data.solubility[0];
  if (temp >= 100) return data.solubility[5];

  // Find surrounding data points
  let lowerIdx = 0;
  for (let i = 0; i < temps.length - 1; i++) {
    if (temp >= temps[i] && temp < temps[i + 1]) {
      lowerIdx = i;
      break;
    }
  }

  const t1 = temps[lowerIdx];
  const t2 = temps[lowerIdx + 1];
  const s1 = data.solubility[lowerIdx];
  const s2 = data.solubility[lowerIdx + 1];

  // Linear interpolation
  const ratio = (temp - t1) / (t2 - t1);
  return s1 + (s2 - s1) * ratio;
}

interface TemperatureSolubilityCurveProps {
  selectedCompounds: string[];
  temperature: number;
  onTemperatureChange: (temp: number) => void;
  interactive?: boolean;
  showCurve?: boolean;
}

export function TemperatureSolubilityCurve({
  selectedCompounds,
  temperature,
  onTemperatureChange,
  interactive = true,
  showCurve = true
}: TemperatureSolubilityCurveProps) {
  const selectedData = useMemo(
    () => SOLUBILITY_DATA.filter(d => selectedCompounds.includes(d.formula)),
    [selectedCompounds]
  );

  // Calculate max solubility for scaling
  const maxSolubility = useMemo(() => {
    let max = 0;
    selectedData.forEach(d => {
      const m = Math.max(...d.solubility);
      if (m > max) max = m;
    });
    return Math.max(max * 1.1, 10); // Add 10% padding, minimum 10
  }, [selectedData]);

  // SVG dimensions
  const width = 320;
  const height = 200;
  const padding = { top: 20, right: 40, bottom: 40, left: 60 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Scale functions
  const xScale = (temp: number) => padding.left + (temp / 100) * graphWidth;
  const yScale = (sol: number) => padding.top + graphHeight - (sol / maxSolubility) * graphHeight;

  // Generate path for each compound
  const generatePath = (data: SolubilityData) => {
    const points = TEMPERATURES.map((t, i) => ({
      x: xScale(t),
      y: yScale(data.solubility[i])
    }));

    return `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      {/* SVG Chart */}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md mx-auto">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(temp => (
          <line
            key={`grid-x-${temp}`}
            x1={xScale(temp)}
            y1={padding.top}
            x2={xScale(temp)}
            y2={height - padding.bottom}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <line
            key={`grid-y-${ratio}`}
            x1={padding.left}
            y1={yScale(ratio * maxSolubility)}
            x2={width - padding.right}
            y2={yScale(ratio * maxSolubility)}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#374151"
          strokeWidth="2"
        />
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#374151"
          strokeWidth="2"
        />

        {/* X-axis labels */}
        {[0, 20, 40, 60, 80, 100].map(temp => (
          <text
            key={`x-${temp}`}
            x={xScale(temp)}
            y={height - padding.bottom + 20}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            {temp}°C
          </text>
        ))}

        {/* Y-axis label */}
        <text
          x={10}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 10, ${height / 2})`}
          className="text-xs fill-gray-600"
        >
          g/100g H₂O
        </text>

        {/* Y-axis values */}
        {[0, 0.5, 1].map(ratio => (
          <text
            key={`y-${ratio}`}
            x={padding.left - 5}
            y={yScale(ratio * maxSolubility) + 4}
            textAnchor="end"
            className="text-xs fill-gray-600"
          >
            {(ratio * maxSolubility).toFixed(0)}
          </text>
        ))}

        {/* Curves */}
        {showCurve && selectedData.map(data => (
          <path
            key={data.formula}
            d={generatePath(data)}
            fill="none"
            stroke={data.color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ))}

        {/* Current temperature line */}
        <line
          x1={xScale(temperature)}
          y1={padding.top}
          x2={xScale(temperature)}
          y2={height - padding.bottom}
          stroke="#ef4444"
          strokeWidth="2"
          strokeDasharray="4 2"
          className="transition-all duration-200"
        />

        {/* Current values */}
        {selectedData.map(data => {
          const sol = interpolateSolubility(data, temperature);
          return (
            <circle
              key={`point-${data.formula}`}
              cx={xScale(temperature)}
              cy={yScale(sol)}
              r="6"
              fill={data.color}
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-200"
            />
          );
        })}
      </svg>

      {/* Temperature slider */}
      {interactive && (
        <div className="mt-4">
          <div className="flex items-center gap-3">
            <span className="text-blue-500 text-lg">❄️</span>
            <input
              type="range"
              min="0"
              max="100"
              value={temperature}
              onChange={(e) => onTemperatureChange(Number(e.target.value))}
              className="flex-1 h-2 bg-gradient-to-r from-blue-400 via-yellow-400 to-red-500 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-red-500 text-lg">🔥</span>
          </div>
          <div className="text-center mt-2">
            <span className="text-2xl font-bold text-gray-800">{temperature}°C</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {selectedData.map(data => {
          const sol = interpolateSolubility(data, temperature);
          return (
            <div
              key={data.formula}
              className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full"
            >
              <span>{data.emoji}</span>
              <span className="text-sm font-medium" style={{ color: data.color }}>
                {data.formula}
              </span>
              <span className="text-xs text-gray-600">
                {sol.toFixed(1)} g
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TemperatureBeakerProps {
  compound: SolubilityData;
  temperature: number;
  showDissolving?: boolean;
}

export function TemperatureBeaker({
  compound,
  temperature,
  showDissolving = true
}: TemperatureBeakerProps) {
  const [particles, setParticles] = useState<{ x: number; y: number; dissolved: boolean }[]>([]);

  const solubility = interpolateSolubility(compound, temperature);
  const maxSolubility = Math.max(...compound.solubility);
  const saturationRatio = solubility / maxSolubility;

  // Generate particles based on temperature
  useEffect(() => {
    const particleCount = 20;
    const dissolvedCount = Math.floor(particleCount * Math.min(saturationRatio, 1));

    setParticles(
      Array.from({ length: particleCount }).map((_, i) => ({
        x: 15 + Math.random() * 50,
        y: i < dissolvedCount ? 30 + Math.random() * 50 : 75 + Math.random() * 15,
        dissolved: i < dissolvedCount
      }))
    );
  }, [temperature, saturationRatio]);

  // Color intensity based on dissolved amount
  const waterColor = `rgba(${compound.type === 'gas' ? '144, 238, 144' : '59, 130, 246'}, ${0.2 + saturationRatio * 0.4})`;

  return (
    <div className="text-center">
      <svg viewBox="0 0 80 100" className="w-24 h-32 mx-auto">
        {/* Beaker */}
        <path
          d="M10 15 L10 85 Q10 95 20 95 L60 95 Q70 95 70 85 L70 15"
          fill="none"
          stroke="#374151"
          strokeWidth="2"
        />

        {/* Water */}
        <rect
          x="11"
          y="30"
          width="58"
          height="65"
          fill={waterColor}
          className="transition-all duration-500"
        />

        {/* Temperature indicator */}
        <rect
          x="72"
          y="20"
          width="6"
          height="60"
          fill="#e5e7eb"
          rx="2"
        />
        <rect
          x="72"
          y={80 - (temperature / 100) * 60}
          width="6"
          height={(temperature / 100) * 60}
          fill={temperature > 60 ? '#ef4444' : temperature > 30 ? '#f59e0b' : '#3b82f6'}
          rx="2"
          className="transition-all duration-300"
        />

        {/* Particles */}
        {showDissolving && particles.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.dissolved ? 2 : 3}
            fill={compound.color}
            opacity={p.dissolved ? 0.7 : 1}
            className="transition-all duration-700"
          />
        ))}

        {/* Undissolved sediment */}
        {saturationRatio < 0.5 && (
          <ellipse
            cx="40"
            cy="88"
            rx={15 * (1 - saturationRatio)}
            ry={5 * (1 - saturationRatio)}
            fill={compound.color}
            opacity="0.8"
            className="transition-all duration-500"
          />
        )}
      </svg>

      <div className="mt-2">
        <div className="text-sm font-medium">{compound.emoji} {compound.formula}</div>
        <div className="text-xs text-gray-600">{temperature}°C</div>
        <div className="text-xs font-bold" style={{ color: compound.color }}>
          {solubility.toFixed(1)} g/100g
        </div>
      </div>
    </div>
  );
}

// Before/After comparison for temperature change
interface TemperatureComparisonProps {
  compound: SolubilityData;
  tempBefore: number;
  tempAfter: number;
  showAfter: boolean;
}

export function TemperatureComparison({
  compound,
  tempBefore,
  tempAfter,
  showAfter
}: TemperatureComparisonProps) {
  const solBefore = interpolateSolubility(compound, tempBefore);
  const solAfter = interpolateSolubility(compound, tempAfter);

  return (
    <div className="flex items-center justify-center gap-4 my-4">
      <div className="text-center">
        <div className="text-sm font-semibold mb-2 text-gray-700">Fyrir</div>
        <TemperatureBeaker compound={compound} temperature={tempBefore} />
      </div>

      <div className="flex flex-col items-center">
        <div className="text-2xl text-gray-400">→</div>
        <div className="text-xs text-gray-500 mt-1">
          {tempAfter > tempBefore ? '🔥 Hita' : '❄️ Kæla'}
        </div>
      </div>

      <div className={`text-center transition-opacity duration-300 ${showAfter ? 'opacity-100' : 'opacity-30'}`}>
        <div className="text-sm font-semibold mb-2 text-gray-700">Eftir</div>
        <TemperatureBeaker compound={compound} temperature={showAfter ? tempAfter : tempBefore} />
      </div>

      {showAfter && (
        <div className="ml-4 bg-gray-50 p-3 rounded-lg text-sm">
          <div className="font-semibold text-gray-700 mb-1">Breyting:</div>
          <div className={solAfter > solBefore ? 'text-green-600' : 'text-red-600'}>
            {solBefore.toFixed(1)} → {solAfter.toFixed(1)} g/100g
            <br />
            ({solAfter > solBefore ? '+' : ''}{((solAfter - solBefore) / solBefore * 100).toFixed(0)}%)
          </div>
        </div>
      )}
    </div>
  );
}

export { interpolateSolubility };
