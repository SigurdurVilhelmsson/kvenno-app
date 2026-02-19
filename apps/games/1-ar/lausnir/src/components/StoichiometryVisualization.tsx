import { useMemo } from 'react';

interface StoichiometryProps {
  /** Number of moles of each component */
  quantities: Array<{ symbol: string; moles: number; color: string }>;
  /** Show ratio between components */
  showRatio?: boolean;
  /** Label for the visualization */
  label?: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

// Visual dot representation of quantity
function QuantityDots({
  count,
  maxDisplay,
  color,
  size
}: {
  count: number;
  maxDisplay: number;
  color: string;
  size: 'small' | 'medium' | 'large';
}) {
  const displayCount = Math.min(count, maxDisplay);
  const hasMore = count > maxDisplay;

  const dotSize = size === 'small' ? 8 : size === 'medium' ? 12 : 16;
  const gap = size === 'small' ? 2 : size === 'medium' ? 3 : 4;

  return (
    <div className="flex flex-wrap items-center justify-center" style={{ gap }}>
      {Array.from({ length: displayCount }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            boxShadow: `0 1px 2px rgba(0,0,0,0.2), inset 0 -1px 2px rgba(0,0,0,0.1)`,
          }}
        />
      ))}
      {hasMore && (
        <span className="text-xs text-gray-500 ml-1">+{count - maxDisplay}</span>
      )}
    </div>
  );
}

// Calculate greatest common divisor for ratio simplification
function gcd(a: number, b: number): number {
  if (b === 0) return a;
  return gcd(b, a % b);
}

// Simplify a ratio
function simplifyRatio(values: number[]): number[] {
  if (values.length === 0) return [];
  if (values.length === 1) return [1];

  // Convert to integers by multiplying by 1000 and rounding
  const integers = values.map(v => Math.round(v * 1000));

  // Find GCD of all values
  let divisor = integers[0];
  for (let i = 1; i < integers.length; i++) {
    divisor = gcd(divisor, integers[i]);
  }

  // Divide by GCD
  const simplified = integers.map(v => Math.round(v / divisor));

  // If values are too large, just show as-is
  const maxValue = Math.max(...simplified);
  if (maxValue > 10) {
    return values.map(v => Math.round(v * 10) / 10);
  }

  return simplified;
}

/**
 * Visual representation of stoichiometric quantities
 * Shows particles as colored dots with ratio indicators
 */
export function StoichiometryVisualization({
  quantities,
  showRatio = true,
  label,
  size = 'medium'
}: StoichiometryProps) {
  const maxDotsPerGroup = size === 'small' ? 5 : size === 'medium' ? 8 : 12;

  const ratio = useMemo(() => {
    if (!showRatio || quantities.length < 2) return null;
    const moles = quantities.map(q => q.moles);
    return simplifyRatio(moles);
  }, [quantities, showRatio]);

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      {label && (
        <div className="text-sm font-semibold text-gray-700 text-center mb-3">
          {label}
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        {quantities.map((q, i) => (
          <div key={i} className="flex flex-col items-center">
            {/* Symbol */}
            <div
              className="text-lg font-bold mb-2"
              style={{ color: q.color }}
            >
              {q.symbol}
            </div>

            {/* Dots representing quantity */}
            <QuantityDots
              count={Math.round(q.moles * 10)} // Scale for visualization
              maxDisplay={maxDotsPerGroup}
              color={q.color}
              size={size}
            />

            {/* Moles value */}
            <div className="text-xs text-gray-600 mt-2">
              {q.moles.toFixed(2)} mól
            </div>

            {/* Ratio number */}
            {ratio && (
              <div className="text-lg font-bold text-gray-800 mt-1">
                {ratio[i]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ratio display */}
      {ratio && ratio.length > 1 && (
        <div className="text-center mt-3 text-sm text-gray-600">
          <span className="font-semibold">Hlutfall: </span>
          {ratio.join(' : ')}
        </div>
      )}
    </div>
  );
}

interface ConcentrationComparisonProps {
  before: { molecules: number; volumeML: number };
  after: { molecules: number; volumeML: number };
  showParticles?: boolean;
  animate?: boolean;
}

/**
 * Visual comparison of concentration before and after an operation
 */
export function ConcentrationComparison({
  before,
  after,
  showParticles = true,
  animate = false
}: ConcentrationComparisonProps) {
  const calcConcentration = (molecules: number, volumeML: number) =>
    (molecules * 0.01) / (volumeML / 1000);

  const beforeConc = calcConcentration(before.molecules, before.volumeML);
  const afterConc = calcConcentration(after.molecules, after.volumeML);

  const particleColor = '#f97316';
  const maxParticles = 20;

  return (
    <div className="flex items-center justify-center gap-6">
      {/* Before state */}
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-600 mb-2">Fyrir</div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 min-w-[120px]">
          {showParticles && (
            <div className="mb-2">
              <QuantityDots
                count={before.molecules}
                maxDisplay={maxParticles}
                color={particleColor}
                size="small"
              />
            </div>
          )}
          <div className="text-xs text-gray-500">{before.molecules} agnir</div>
          <div className="text-xs text-gray-500">{before.volumeML} mL</div>
          <div className="text-lg font-bold text-blue-600 mt-1">
            {beforeConc.toFixed(2)} M
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className={`text-3xl text-gray-400 ${animate ? 'animate-pulse' : ''}`}>
        →
      </div>

      {/* After state */}
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-600 mb-2">Eftir</div>
        <div className={`bg-green-50 border-2 border-green-200 rounded-xl p-4 min-w-[120px] ${
          animate ? 'animate-fade-in' : ''
        }`}>
          {showParticles && (
            <div className="mb-2">
              <QuantityDots
                count={after.molecules}
                maxDisplay={maxParticles}
                color={particleColor}
                size="small"
              />
            </div>
          )}
          <div className="text-xs text-gray-500">{after.molecules} agnir</div>
          <div className="text-xs text-gray-500">{after.volumeML} mL</div>
          <div className="text-lg font-bold text-green-600 mt-1">
            {afterConc.toFixed(2)} M
          </div>
        </div>
      </div>
    </div>
  );
}

interface MixingVisualizationProps {
  solution1: { molecules: number; volumeML: number; color: string; label?: string };
  solution2: { molecules: number; volumeML: number; color: string; label?: string };
  result?: { molecules: number; volumeML: number; color: string };
  showAnimation?: boolean;
}

/**
 * Visual representation of mixing two solutions
 */
export function MixingVisualization({
  solution1,
  solution2,
  result,
  showAnimation = false
}: MixingVisualizationProps) {
  const calcConcentration = (molecules: number, volumeML: number) =>
    (molecules * 0.01) / (volumeML / 1000);

  const maxParticles = 15;

  const resultState = result || {
    molecules: solution1.molecules + solution2.molecules,
    volumeML: solution1.volumeML + solution2.volumeML,
    color: '#8b5cf6'
  };

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {/* Solution 1 */}
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-600 mb-2">
          {solution1.label || 'Lausn 1'}
        </div>
        <div
          className="rounded-xl p-3 min-w-[100px] border-2"
          style={{
            backgroundColor: `${solution1.color}15`,
            borderColor: `${solution1.color}50`
          }}
        >
          <QuantityDots
            count={solution1.molecules}
            maxDisplay={maxParticles}
            color={solution1.color}
            size="small"
          />
          <div className="text-xs text-gray-500 mt-2">{solution1.volumeML} mL</div>
          <div className="text-sm font-bold" style={{ color: solution1.color }}>
            {calcConcentration(solution1.molecules, solution1.volumeML).toFixed(2)} M
          </div>
        </div>
      </div>

      {/* Plus sign */}
      <div className="text-2xl text-gray-400 font-bold">+</div>

      {/* Solution 2 */}
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-600 mb-2">
          {solution2.label || 'Lausn 2'}
        </div>
        <div
          className="rounded-xl p-3 min-w-[100px] border-2"
          style={{
            backgroundColor: `${solution2.color}15`,
            borderColor: `${solution2.color}50`
          }}
        >
          <QuantityDots
            count={solution2.molecules}
            maxDisplay={maxParticles}
            color={solution2.color}
            size="small"
          />
          <div className="text-xs text-gray-500 mt-2">{solution2.volumeML} mL</div>
          <div className="text-sm font-bold" style={{ color: solution2.color }}>
            {calcConcentration(solution2.molecules, solution2.volumeML).toFixed(2)} M
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className={`text-3xl text-gray-400 ${showAnimation ? 'animate-pulse' : ''}`}>
        →
      </div>

      {/* Result */}
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-600 mb-2">Blanda</div>
        <div
          className={`rounded-xl p-3 min-w-[100px] border-2 ${
            showAnimation ? 'animate-fade-in' : ''
          }`}
          style={{
            backgroundColor: `${resultState.color}15`,
            borderColor: `${resultState.color}50`
          }}
        >
          <QuantityDots
            count={resultState.molecules}
            maxDisplay={maxParticles * 2}
            color={resultState.color}
            size="small"
          />
          <div className="text-xs text-gray-500 mt-2">{resultState.volumeML} mL</div>
          <div className="text-sm font-bold" style={{ color: resultState.color }}>
            {calcConcentration(resultState.molecules, resultState.volumeML).toFixed(2)} M
          </div>
        </div>
      </div>
    </div>
  );
}

interface DilutionVisualizationProps {
  /** Initial state */
  initial: { molecules: number; volumeML: number };
  /** Final volume after dilution */
  finalVolumeML: number;
  /** Show animation */
  animate?: boolean;
}

/**
 * Visual representation of dilution process
 * Shows same particles spreading in larger volume
 */
export function DilutionVisualization({
  initial,
  finalVolumeML,
  animate = false
}: DilutionVisualizationProps) {
  const calcConcentration = (molecules: number, volumeML: number) =>
    (molecules * 0.01) / (volumeML / 1000);

  const particleColor = '#f97316';
  const maxParticles = 15;

  const initialConc = calcConcentration(initial.molecules, initial.volumeML);
  const finalConc = calcConcentration(initial.molecules, finalVolumeML);
  const waterAdded = finalVolumeML - initial.volumeML;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {/* Initial state */}
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-600 mb-2">Upphafleg lausn</div>
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 min-w-[120px]">
            <QuantityDots
              count={initial.molecules}
              maxDisplay={maxParticles}
              color={particleColor}
              size="medium"
            />
            <div className="text-xs text-gray-500 mt-2">{initial.volumeML} mL</div>
            <div className="text-lg font-bold text-orange-600">
              {initialConc.toFixed(2)} M
            </div>
          </div>
        </div>

        {/* Plus water */}
        <div className="text-center">
          <div className="text-2xl text-gray-400 font-bold">+</div>
        </div>

        {/* Water added */}
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-600 mb-2">Vatn bætt við</div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 min-w-[100px]">
            <div className="text-3xl">💧</div>
            <div className="text-xs text-gray-500 mt-2">{waterAdded} mL</div>
          </div>
        </div>

        {/* Arrow */}
        <div className={`text-3xl text-gray-400 ${animate ? 'animate-pulse' : ''}`}>
          →
        </div>

        {/* Final state */}
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-600 mb-2">Þynnt lausn</div>
          <div className={`bg-green-50 border-2 border-green-200 rounded-xl p-4 min-w-[140px] ${
            animate ? 'animate-fade-in' : ''
          }`}>
            <QuantityDots
              count={initial.molecules}
              maxDisplay={maxParticles}
              color={particleColor}
              size="medium"
            />
            <div className="text-xs text-gray-500 mt-2">{finalVolumeML} mL</div>
            <div className="text-lg font-bold text-green-600">
              {finalConc.toFixed(3)} M
            </div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="text-center text-sm text-gray-600 bg-gray-100 rounded-lg p-3">
        <span className="font-semibold">Sama fjöldi agna</span> ({initial.molecules}) í{' '}
        <span className="font-semibold">stærra rúmmáli</span> = lægri styrkur
      </div>
    </div>
  );
}
