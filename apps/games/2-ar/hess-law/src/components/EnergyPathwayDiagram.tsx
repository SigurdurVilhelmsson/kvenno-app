import { useMemo } from 'react';

interface EnergyStep {
  label: string;
  deltaH: number;
  cumulativeH: number;
  color: string;
}

interface EnergyPathwayDiagramProps {
  /** Selected equations with their current deltaH values */
  steps: { label: string; deltaH: number }[];
  /** Target deltaH to reach */
  targetDeltaH: number;
  /** Whether the current sum matches the target */
  isCorrect: boolean;
  /** Height of the diagram in pixels */
  height?: number;
}

/**
 * EnergyPathwayDiagram - Visual "staircase" showing cumulative ΔH
 *
 * Demonstrates Hess's Law by showing how individual reaction steps
 * combine to reach the same final energy change regardless of path.
 */
export function EnergyPathwayDiagram({
  steps,
  targetDeltaH,
  isCorrect,
  height = 280
}: EnergyPathwayDiagramProps) {
  // Calculate cumulative energy at each step
  const energySteps: EnergyStep[] = useMemo(() => {
    let cumulative = 0;
    return steps.map((step) => {
      cumulative += step.deltaH;
      return {
        label: step.label,
        deltaH: step.deltaH,
        cumulativeH: cumulative,
        color: step.deltaH < 0 ? '#ef4444' : '#3b82f6' // red for exothermic, blue for endothermic
      };
    });
  }, [steps]);

  // Find the range for scaling
  const allValues = [0, targetDeltaH, ...energySteps.map(s => s.cumulativeH)];
  const minEnergy = Math.min(...allValues) - 50;
  const maxEnergy = Math.max(...allValues) + 50;
  const range = maxEnergy - minEnergy;

  // Convert energy to Y position (inverted: lower energy = higher position)
  const energyToY = (energy: number): number => {
    const normalized = (maxEnergy - energy) / range;
    return 40 + normalized * (height - 80); // padding top and bottom
  };

  const width = 400;
  const stepWidth = steps.length > 0 ? (width - 100) / (steps.length + 1) : width - 100;

  // Generate path points for the staircase
  const pathPoints = useMemo(() => {
    if (steps.length === 0) return '';

    const points: string[] = [];
    let x = 50;
    let y = energyToY(0);

    // Start point
    points.push(`M ${x} ${y}`);

    // Each step
    energySteps.forEach((step) => {
      const nextX = x + stepWidth;
      const nextY = energyToY(step.cumulativeH);

      // Horizontal line to middle
      points.push(`L ${x + stepWidth / 2} ${y}`);
      // Vertical line (the energy change)
      points.push(`L ${x + stepWidth / 2} ${nextY}`);
      // Horizontal line to next position
      points.push(`L ${nextX} ${nextY}`);

      x = nextX;
      y = nextY;
    });

    return points.join(' ');
  }, [energySteps, stepWidth, height]);

  // Target line position
  const targetY = energyToY(targetDeltaH);
  const finalY = energySteps.length > 0 ? energyToY(energySteps[energySteps.length - 1].cumulativeH) : energyToY(0);

  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-4 shadow-lg">
      <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
        <span className="text-lg">📊</span>
        Orkuferillinn
      </h3>

      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Zero energy reference line */}
        <line
          x1="30"
          y1={energyToY(0)}
          x2={width - 20}
          y2={energyToY(0)}
          stroke="#6b7280"
          strokeWidth="1"
          strokeDasharray="4,4"
        />
        <text x="10" y={energyToY(0) + 4} fill="#9ca3af" fontSize="10">0</text>

        {/* Target energy line */}
        <line
          x1="30"
          y1={targetY}
          x2={width - 20}
          y2={targetY}
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="6,4"
        />
        <text x={width - 18} y={targetY + 4} fill="#f59e0b" fontSize="10" fontWeight="bold">
          Markmið
        </text>

        {/* Energy pathway (animated staircase) */}
        {steps.length > 0 && (
          <>
            {/* Shadow for depth */}
            <path
              d={pathPoints}
              fill="none"
              stroke="#000"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
              transform="translate(2, 2)"
            />

            {/* Main path */}
            <path
              d={pathPoints}
              fill="none"
              stroke={isCorrect ? '#22c55e' : '#60a5fa'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500"
              style={{
                strokeDasharray: '1000',
                strokeDashoffset: '0',
                animation: 'drawPath 1s ease-out forwards'
              }}
            />
          </>
        )}

        {/* Start point */}
        <circle
          cx="50"
          cy={energyToY(0)}
          r="8"
          fill="#22c55e"
          stroke="#fff"
          strokeWidth="2"
        />
        <text x="50" y={energyToY(0) - 15} fill="#22c55e" fontSize="11" textAnchor="middle" fontWeight="bold">
          Byrjun
        </text>

        {/* Step markers */}
        {energySteps.map((step, index) => {
          const x = 50 + (index + 1) * stepWidth;
          const y = energyToY(step.cumulativeH);

          return (
            <g key={index}>
              {/* Step circle */}
              <circle
                cx={x}
                cy={y}
                r="6"
                fill={step.color}
                stroke="#fff"
                strokeWidth="2"
                className="transition-all duration-300"
              />

              {/* Delta H label */}
              <text
                x={x - stepWidth / 2}
                y={y + (step.deltaH < 0 ? -10 : 20)}
                fill={step.color}
                fontSize="10"
                textAnchor="middle"
                fontWeight="bold"
              >
                {step.deltaH > 0 ? '+' : ''}{step.deltaH.toFixed(0)} kJ
              </text>

              {/* Cumulative label */}
              <text
                x={x}
                y={y + 18}
                fill="#9ca3af"
                fontSize="9"
                textAnchor="middle"
              >
                Σ = {step.cumulativeH.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Final point indicator */}
        {steps.length > 0 && (
          <g>
            <circle
              cx={50 + steps.length * stepWidth}
              cy={finalY}
              r="10"
              fill={isCorrect ? '#22c55e' : '#60a5fa'}
              stroke="#fff"
              strokeWidth="3"
              className={isCorrect ? 'animate-pulse' : ''}
            />
            {isCorrect && (
              <text
                x={50 + steps.length * stepWidth}
                y={finalY + 4}
                fill="#fff"
                fontSize="12"
                textAnchor="middle"
                fontWeight="bold"
              >
                ✓
              </text>
            )}
          </g>
        )}

        {/* Y-axis label */}
        <text
          x="15"
          y={height / 2}
          fill="#9ca3af"
          fontSize="10"
          textAnchor="middle"
          transform={`rotate(-90, 15, ${height / 2})`}
        >
          Orka (kJ)
        </text>
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-400">Exóþermt (−ΔH)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-gray-400">Endóþermt (+ΔH)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-yellow-500" style={{ width: '12px' }} />
          <span className="text-gray-400">Markmið</span>
        </div>
      </div>

      {/* Hess's Law reminder */}
      {steps.length > 0 && (
        <div className="mt-3 text-center text-xs text-gray-400">
          💡 Lögmál Hess: Heildarorkubreytingin er sú sama óháð leiðinni
        </div>
      )}

      <style>{`
        @keyframes drawPath {
          from {
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default EnergyPathwayDiagram;
