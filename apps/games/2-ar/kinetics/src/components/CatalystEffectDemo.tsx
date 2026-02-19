import { useState, useMemo } from 'react';

interface CatalystEffectDemoProps {
  /** Temperature in Kelvin */
  temperature?: number;
  /** Base activation energy without catalyst (kJ/mol) */
  baseActivationEnergy?: number;
  /** Activation energy with catalyst (kJ/mol) */
  catalyzedActivationEnergy?: number;
  /** Show interactive controls */
  interactive?: boolean;
  /** Compact display mode */
  compact?: boolean;
}

// Gas constant in kJ/(mol·K)
const R = 8.314e-3;

/**
 * Calculate fraction of molecules with energy >= Ea using Arrhenius
 */
function calculateFractionAboveEa(T: number, Ea: number): number {
  // Simplified Boltzmann factor approximation
  return Math.exp(-Ea / (R * T));
}

/**
 * CatalystEffectDemo - Visual comparison of catalyzed vs uncatalyzed reactions
 *
 * Shows:
 * - Energy diagram with and without catalyst
 * - Activation energy comparison
 * - Percentage of molecules that can react
 * - The ΔH remains unchanged
 */
export function CatalystEffectDemo({
  temperature = 350,
  baseActivationEnergy = 60,
  catalyzedActivationEnergy = 35,
  interactive = true,
  compact = false,
}: CatalystEffectDemoProps) {
  const [temp, setTemp] = useState(temperature);
  const [baseEa, setBaseEa] = useState(baseActivationEnergy);
  const [catEa, setCatEa] = useState(catalyzedActivationEnergy);
  const [showAnimation, setShowAnimation] = useState(false);

  // Calculate reaction rates using Arrhenius equation (relative)
  const rates = useMemo(() => {
    const fractionWithout = calculateFractionAboveEa(temp, baseEa);
    const fractionWith = calculateFractionAboveEa(temp, catEa);
    const speedup = fractionWith / fractionWithout;

    return {
      withoutCatalyst: fractionWithout,
      withCatalyst: fractionWith,
      speedup: speedup,
    };
  }, [temp, baseEa, catEa]);

  // SVG dimensions
  const width = compact ? 280 : 380;
  const height = compact ? 180 : 220;
  const margin = { top: 30, right: 20, bottom: 30, left: 50 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Energy scale (0 to 100 kJ/mol)
  const maxEnergy = 80;
  const deltaH = -20; // Exothermic reaction

  // Reaction progress scale
  const scaleX = (progress: number) => margin.left + progress * plotWidth;
  const scaleY = (energy: number) => margin.top + (1 - energy / maxEnergy) * plotHeight;

  // Baseline energy levels
  const reactantEnergy = 50;
  const productEnergy = reactantEnergy + deltaH;

  // Generate smooth curve for energy pathway
  const generatePathway = (Ea: number) => {
    const points: string[] = [];
    const peakEnergy = reactantEnergy + Ea;

    // Gaussian-like curve for transition state
    for (let i = 0; i <= 100; i++) {
      const progress = i / 100;
      let energy: number;

      if (progress < 0.15) {
        // Reactant plateau
        energy = reactantEnergy;
      } else if (progress > 0.85) {
        // Product plateau
        energy = productEnergy;
      } else {
        // Transition curve (Gaussian-ish)
        const normalizedProgress = (progress - 0.15) / 0.7;
        const peakCenter = 0.5;
        const sigma = 0.2;
        const gaussian = Math.exp(-Math.pow(normalizedProgress - peakCenter, 2) / (2 * sigma * sigma));

        // Interpolate between start/end and peak
        const baseLevel = reactantEnergy + (productEnergy - reactantEnergy) * normalizedProgress;
        energy = baseLevel + (peakEnergy - baseLevel) * gaussian;
      }

      const cmd = i === 0 ? 'M' : 'L';
      points.push(`${cmd} ${scaleX(progress)} ${scaleY(energy)}`);
    }

    return points.join(' ');
  };

  const uncatalyzedPath = generatePathway(baseEa);
  const catalyzedPath = generatePathway(catEa);

  // Peak positions for annotations
  const uncatPeakY = scaleY(reactantEnergy + baseEa);
  const catPeakY = scaleY(reactantEnergy + catEa);
  const peakX = scaleX(0.5);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <span className="text-lg">⚗️</span>
          Hvataáhrif (Catalyst Effect)
        </h3>
        {interactive && (
          <button
            onClick={() => setShowAnimation(!showAnimation)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              showAnimation
                ? 'bg-green-500 text-white'
                : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            }`}
          >
            {showAnimation ? 'Sýna hreyfingu' : 'Kyrrt'}
          </button>
        )}
      </div>

      {/* Interactive controls */}
      {interactive && !compact && (
        <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-slate-700/50 rounded-lg">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Hitastig</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="250"
                max="500"
                step="10"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="flex-1 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-xs font-mono text-blue-400 w-12">{temp} K</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Ea (án hvata)</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="30"
                max="100"
                step="5"
                value={baseEa}
                onChange={(e) => setBaseEa(Number(e.target.value))}
                className="flex-1 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <span className="text-xs font-mono text-red-400 w-12">{baseEa}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Ea (með hvata)</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10"
                max={baseEa - 5}
                step="5"
                value={Math.min(catEa, baseEa - 5)}
                onChange={(e) => setCatEa(Number(e.target.value))}
                className="flex-1 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <span className="text-xs font-mono text-green-400 w-12">{catEa}</span>
            </div>
          </div>
        </div>
      )}

      {/* Energy diagram */}
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="bg-slate-950 rounded-lg"
        role="img"
        aria-label={`Orkurit: Án hvata Ea=${baseEa} kJ/mol, Með hvata Ea=${catEa} kJ/mol`}
      >
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="0.5" />
          </pattern>

          {/* Gradient for uncatalyzed path */}
          <linearGradient id="uncatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>

          {/* Gradient for catalyzed path */}
          <linearGradient id="catGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        <rect x={margin.left} y={margin.top} width={plotWidth} height={plotHeight} fill="url(#grid)" opacity="0.3" />

        {/* Y-axis */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height - margin.bottom}
          stroke="#6b7280"
          strokeWidth="2"
        />

        {/* X-axis */}
        <line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          stroke="#6b7280"
          strokeWidth="2"
        />

        {/* Y-axis label */}
        <text
          x={15}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 15, ${height / 2})`}
          className="fill-gray-400"
          style={{ fontSize: '10px' }}
        >
          Orka (kJ/mol)
        </text>

        {/* X-axis label */}
        <text
          x={width / 2}
          y={height - 8}
          textAnchor="middle"
          className="fill-gray-400"
          style={{ fontSize: '10px' }}
        >
          Hvarfgangur
        </text>

        {/* Energy level lines */}
        {/* Reactant level */}
        <line
          x1={margin.left}
          y1={scaleY(reactantEnergy)}
          x2={scaleX(0.2)}
          y2={scaleY(reactantEnergy)}
          stroke="#60a5fa"
          strokeWidth="2"
          strokeDasharray="4,2"
        />
        <text
          x={margin.left + 5}
          y={scaleY(reactantEnergy) - 5}
          className="fill-blue-400"
          style={{ fontSize: '9px' }}
        >
          Hvarfefni
        </text>

        {/* Product level */}
        <line
          x1={scaleX(0.8)}
          y1={scaleY(productEnergy)}
          x2={width - margin.right}
          y2={scaleY(productEnergy)}
          stroke="#60a5fa"
          strokeWidth="2"
          strokeDasharray="4,2"
        />
        <text
          x={width - margin.right - 40}
          y={scaleY(productEnergy) - 5}
          className="fill-blue-400"
          style={{ fontSize: '9px' }}
        >
          Myndefni
        </text>

        {/* Uncatalyzed pathway */}
        <path
          d={uncatalyzedPath}
          fill="none"
          stroke="url(#uncatGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.8"
          className={showAnimation ? 'animate-pulse' : ''}
        />

        {/* Catalyzed pathway */}
        <path
          d={catalyzedPath}
          fill="none"
          stroke="url(#catGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          className={showAnimation ? 'animate-pulse' : ''}
        />

        {/* Activation energy arrows */}
        {/* Uncatalyzed Ea arrow */}
        <line
          x1={peakX - 30}
          y1={scaleY(reactantEnergy)}
          x2={peakX - 30}
          y2={uncatPeakY}
          stroke="#ef4444"
          strokeWidth="2"
          markerEnd="url(#arrowRed)"
        />
        <defs>
          <marker id="arrowRed" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
          </marker>
          <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#22c55e" />
          </marker>
        </defs>

        {/* Catalyzed Ea arrow */}
        <line
          x1={peakX + 30}
          y1={scaleY(reactantEnergy)}
          x2={peakX + 30}
          y2={catPeakY}
          stroke="#22c55e"
          strokeWidth="2"
          markerEnd="url(#arrowGreen)"
        />

        {/* Labels for Ea values */}
        <text
          x={peakX - 35}
          y={(scaleY(reactantEnergy) + uncatPeakY) / 2}
          textAnchor="end"
          className="fill-red-400 font-bold"
          style={{ fontSize: '10px' }}
        >
          Ea = {baseEa}
        </text>
        <text
          x={peakX + 35}
          y={(scaleY(reactantEnergy) + catPeakY) / 2}
          textAnchor="start"
          className="fill-green-400 font-bold"
          style={{ fontSize: '10px' }}
        >
          Ea' = {catEa}
        </text>

        {/* ΔH arrow and label */}
        <line
          x1={width - margin.right - 15}
          y1={scaleY(reactantEnergy)}
          x2={width - margin.right - 15}
          y2={scaleY(productEnergy)}
          stroke="#60a5fa"
          strokeWidth="1.5"
        />
        <text
          x={width - margin.right - 5}
          y={(scaleY(reactantEnergy) + scaleY(productEnergy)) / 2}
          textAnchor="start"
          className="fill-blue-400"
          style={{ fontSize: '8px' }}
        >
          ΔH
        </text>

        {/* Transition state markers */}
        <circle
          cx={peakX}
          cy={uncatPeakY}
          r="4"
          fill="#ef4444"
          stroke="#1f2937"
          strokeWidth="2"
        />
        <circle
          cx={peakX}
          cy={catPeakY}
          r="4"
          fill="#22c55e"
          stroke="#1f2937"
          strokeWidth="2"
        />

        {/* Legend */}
        <g transform={`translate(${margin.left + 10}, ${margin.top + 5})`}>
          <line x1="0" y1="0" x2="20" y2="0" stroke="#ef4444" strokeWidth="3" />
          <text x="25" y="4" className="fill-gray-300" style={{ fontSize: '9px' }}>Án hvata</text>

          <line x1="0" y1="15" x2="20" y2="15" stroke="#22c55e" strokeWidth="3" />
          <text x="25" y="19" className="fill-gray-300" style={{ fontSize: '9px' }}>Með hvata</text>
        </g>
      </svg>

      {/* Statistics comparison */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3">
          <div className="text-red-400 text-xs font-medium mb-1">Án hvata</div>
          <div className="text-white text-lg font-bold">Ea = {baseEa} kJ/mol</div>
          <div className="text-gray-400 text-xs mt-1">
            {(rates.withoutCatalyst * 100).toExponential(1)}% sameinda geta hvarfast
          </div>
        </div>

        <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-3">
          <div className="text-green-400 text-xs font-medium mb-1">Með hvata</div>
          <div className="text-white text-lg font-bold">Ea' = {catEa} kJ/mol</div>
          <div className="text-gray-400 text-xs mt-1">
            {(rates.withCatalyst * 100).toExponential(1)}% sameinda geta hvarfast
          </div>
        </div>
      </div>

      {/* Speedup indicator */}
      <div className="mt-3 bg-slate-700/50 rounded-lg p-3 text-center">
        <div className="text-gray-400 text-xs mb-1">Hvörf hraðar um</div>
        <div className="text-2xl font-bold text-yellow-400">
          {rates.speedup.toExponential(1)}×
        </div>
        <div className="text-gray-500 text-xs mt-1">
          Hvati lækkar Ea um {baseEa - catEa} kJ/mol
        </div>
      </div>

      {/* Key points */}
      {!compact && (
        <div className="mt-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="text-blue-400 text-xs font-medium mb-2">Mikilvægt að vita:</div>
          <ul className="text-gray-300 text-xs space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Hvati lækkar virkjunarorku (Ea) með öðrum hvarfgangshátt</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">→</span>
              <span>ΔH breytist EKKI - hvati breytir aðeins leiðinni, ekki endapunktinum</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">⚡</span>
              <span>Hvati myndast aftur í lok hvarfsins - hann eyðist ekki</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default CatalystEffectDemo;
