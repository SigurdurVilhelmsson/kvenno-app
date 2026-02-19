import { useState, useMemo } from 'react';

interface BondAngleData {
  geometry: string;
  geometryName: string;
  idealAngle: number;
  actualAngle: number;
  lonePairs: number;
  bondingPairs: number;
  example: string;
  explanation: string;
}

interface BondAngleMeasurementProps {
  /** Currently selected geometry ID */
  geometryId?: string;
  /** Show comparison mode */
  showComparison?: boolean;
  /** Compact display */
  compact?: boolean;
}

// Bond angle data for all VSEPR geometries
const BOND_ANGLES: Record<string, BondAngleData> = {
  'linear': {
    geometry: 'linear',
    geometryName: 'Línuleg',
    idealAngle: 180,
    actualAngle: 180,
    lonePairs: 0,
    bondingPairs: 2,
    example: 'CO₂',
    explanation: 'Tvö rafeinasvið staðsetjast beint á móti hvoru öðru.',
  },
  'trigonal-planar': {
    geometry: 'trigonal-planar',
    geometryName: 'Þríhyrnd slétt',
    idealAngle: 120,
    actualAngle: 120,
    lonePairs: 0,
    bondingPairs: 3,
    example: 'BF₃',
    explanation: 'Þrjú rafeinasvið dreifast jafnt í sléttu, 120° sundur.',
  },
  'bent-2': {
    geometry: 'bent-2',
    geometryName: 'Beygð (1 lp)',
    idealAngle: 120,
    actualAngle: 117,
    lonePairs: 1,
    bondingPairs: 2,
    example: 'SO₂',
    explanation: 'Einstætt par þrýstir bindandi pörum saman.',
  },
  'tetrahedral': {
    geometry: 'tetrahedral',
    geometryName: 'Fjórflötungur',
    idealAngle: 109.5,
    actualAngle: 109.5,
    lonePairs: 0,
    bondingPairs: 4,
    example: 'CH₄',
    explanation: 'Fjögur rafeinasvið í fullkominni þrívíðri röðun.',
  },
  'trigonal-pyramidal': {
    geometry: 'trigonal-pyramidal',
    geometryName: 'Þríhyrnd pýramída',
    idealAngle: 109.5,
    actualAngle: 107,
    lonePairs: 1,
    bondingPairs: 3,
    example: 'NH₃',
    explanation: 'Einstætt par minnkar hornið úr 109.5° í ~107°.',
  },
  'bent-4': {
    geometry: 'bent-4',
    geometryName: 'Beygð (2 lp)',
    idealAngle: 109.5,
    actualAngle: 104.5,
    lonePairs: 2,
    bondingPairs: 2,
    example: 'H₂O',
    explanation: 'Tvö einstæð pör þrýsta horninu niður í 104.5°.',
  },
  'trigonal-bipyramidal': {
    geometry: 'trigonal-bipyramidal',
    geometryName: 'Þríhyrnd tvípýramída',
    idealAngle: 90,
    actualAngle: 90,
    lonePairs: 0,
    bondingPairs: 5,
    example: 'PCl₅',
    explanation: 'Ás-horn 90°, miðsléttuhhorn 120°.',
  },
  'octahedral': {
    geometry: 'octahedral',
    geometryName: 'Áttflötungur',
    idealAngle: 90,
    actualAngle: 90,
    lonePairs: 0,
    bondingPairs: 6,
    example: 'SF₆',
    explanation: 'Öll horn 90° í samhverfu formi.',
  },
};

/**
 * BondAngleMeasurement - Interactive bond angle visualization tool
 *
 * Shows:
 * - Visual angle arc with degree markings
 * - Comparison between ideal and actual angles
 * - Effect of lone pairs on bond angles
 */
export function BondAngleMeasurement({
  geometryId,
  showComparison = true,
  compact = false,
}: BondAngleMeasurementProps) {
  const [selectedGeometry, setSelectedGeometry] = useState(geometryId || 'tetrahedral');

  const angleData = BOND_ANGLES[selectedGeometry];

  // Calculate angle difference due to lone pairs
  const angleDifference = angleData.idealAngle - angleData.actualAngle;

  // SVG parameters
  const svgSize = compact ? 160 : 220;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2 + 20;
  const radius = compact ? 50 : 70;

  // Calculate arc path for angle visualization
  const createArcPath = (angle: number, r: number): string => {
    const startAngle = -angle / 2;
    const endAngle = angle / 2;

    const startRad = (startAngle * Math.PI) / 180 - Math.PI / 2;
    const endRad = (endAngle * Math.PI) / 180 - Math.PI / 2;

    const x1 = centerX + r * Math.cos(startRad);
    const y1 = centerY + r * Math.sin(startRad);
    const x2 = centerX + r * Math.cos(endRad);
    const y2 = centerY + r * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Calculate line endpoints for bonds
  const getBondEndpoints = (angle: number, length: number) => {
    const halfAngle = angle / 2;
    const rad1 = ((-halfAngle - 90) * Math.PI) / 180;
    const rad2 = ((halfAngle - 90) * Math.PI) / 180;

    return {
      left: {
        x: centerX + length * Math.cos(rad1),
        y: centerY + length * Math.sin(rad1),
      },
      right: {
        x: centerX + length * Math.cos(rad2),
        y: centerY + length * Math.sin(rad2),
      },
    };
  };

  const bondLength = compact ? 55 : 75;
  const idealBonds = getBondEndpoints(angleData.idealAngle, bondLength);
  const actualBonds = getBondEndpoints(angleData.actualAngle, bondLength);

  // Geometries grouped by base shape for comparison
  const comparisonGroups = useMemo(() => {
    return {
      'Úr fjórflötungi (109.5°)': ['tetrahedral', 'trigonal-pyramidal', 'bent-4'],
      'Úr þríhyrnd sléttri (120°)': ['trigonal-planar', 'bent-2'],
    };
  }, []);

  if (compact) {
    return (
      <div className="bg-slate-800 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <svg width={svgSize} height={svgSize} className="flex-shrink-0">
            {/* Angle arc */}
            <path
              d={createArcPath(angleData.actualAngle, radius * 0.6)}
              fill="rgba(45, 212, 191, 0.3)"
              stroke="#2dd4bf"
              strokeWidth="2"
            />

            {/* Bond lines */}
            <line
              x1={centerX}
              y1={centerY}
              x2={actualBonds.left.x}
              y2={actualBonds.left.y}
              stroke="#60a5fa"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1={centerX}
              y1={centerY}
              x2={actualBonds.right.x}
              y2={actualBonds.right.y}
              stroke="#60a5fa"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Central atom */}
            <circle cx={centerX} cy={centerY} r="10" fill="#f472b6" />

            {/* Terminal atoms */}
            <circle cx={actualBonds.left.x} cy={actualBonds.left.y} r="8" fill="#60a5fa" />
            <circle cx={actualBonds.right.x} cy={actualBonds.right.y} r="8" fill="#60a5fa" />

            {/* Angle label */}
            <text
              x={centerX}
              y={centerY - radius * 0.3}
              textAnchor="middle"
              fill="#2dd4bf"
              fontSize="14"
              fontWeight="bold"
            >
              {angleData.actualAngle}°
            </text>
          </svg>

          <div>
            <div className="font-bold text-white">{angleData.geometryName}</div>
            <div className="text-sm text-gray-400">{angleData.example}</div>
            {angleData.lonePairs > 0 && (
              <div className="text-xs text-yellow-400 mt-1">
                {angleData.lonePairs} einstæð pör → -{angleDifference}°
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 shadow-lg">
      <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
        <span className="text-lg">📐</span>
        Tengjahornamælir (Bond Angle Tool)
      </h3>

      {/* Geometry selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(BOND_ANGLES).map(([id, data]) => (
          <button
            key={id}
            onClick={() => setSelectedGeometry(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedGeometry === id
                ? 'bg-teal-500 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {data.example}
          </button>
        ))}
      </div>

      {/* Main visualization */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Angle diagram */}
        <div className="flex-1 flex justify-center">
          <svg width={svgSize} height={svgSize}>
            {/* Background circle for reference */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#374151"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.5"
            />

            {/* Ideal angle arc (faded) */}
            {showComparison && angleData.idealAngle !== angleData.actualAngle && (
              <path
                d={createArcPath(angleData.idealAngle, radius * 0.5)}
                fill="rgba(156, 163, 175, 0.2)"
                stroke="#9ca3af"
                strokeWidth="1"
                strokeDasharray="4,2"
              />
            )}

            {/* Actual angle arc */}
            <path
              d={createArcPath(angleData.actualAngle, radius * 0.7)}
              fill="rgba(45, 212, 191, 0.3)"
              stroke="#2dd4bf"
              strokeWidth="2"
            />

            {/* Degree markings */}
            {[0, 30, 60, 90, 120, 150, 180].map((deg) => {
              const rad = ((deg - 90) * Math.PI) / 180;
              const innerR = radius - 5;
              const outerR = radius + 5;
              return (
                <g key={deg}>
                  <line
                    x1={centerX + innerR * Math.cos(rad)}
                    y1={centerY + innerR * Math.sin(rad)}
                    x2={centerX + outerR * Math.cos(rad)}
                    y2={centerY + outerR * Math.sin(rad)}
                    stroke="#4b5563"
                    strokeWidth="1"
                  />
                  {deg % 60 === 0 && (
                    <text
                      x={centerX + (radius + 15) * Math.cos(rad)}
                      y={centerY + (radius + 15) * Math.sin(rad) + 4}
                      textAnchor="middle"
                      fill="#6b7280"
                      fontSize="10"
                    >
                      {deg}°
                    </text>
                  )}
                </g>
              );
            })}

            {/* Ideal bond lines (faded) */}
            {showComparison && angleData.idealAngle !== angleData.actualAngle && (
              <>
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={idealBonds.left.x}
                  y2={idealBonds.left.y}
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  opacity="0.5"
                />
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={idealBonds.right.x}
                  y2={idealBonds.right.y}
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  opacity="0.5"
                />
              </>
            )}

            {/* Actual bond lines */}
            <line
              x1={centerX}
              y1={centerY}
              x2={actualBonds.left.x}
              y2={actualBonds.left.y}
              stroke="#60a5fa"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1={centerX}
              y1={centerY}
              x2={actualBonds.right.x}
              y2={actualBonds.right.y}
              stroke="#60a5fa"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Central atom */}
            <circle cx={centerX} cy={centerY} r="14" fill="#f472b6" stroke="#fff" strokeWidth="2" />

            {/* Terminal atoms */}
            <circle cx={actualBonds.left.x} cy={actualBonds.left.y} r="10" fill="#60a5fa" stroke="#fff" strokeWidth="2" />
            <circle cx={actualBonds.right.x} cy={actualBonds.right.y} r="10" fill="#60a5fa" stroke="#fff" strokeWidth="2" />

            {/* Lone pair indicators */}
            {angleData.lonePairs > 0 && (
              <g>
                {Array.from({ length: Math.min(angleData.lonePairs, 2) }).map((_, i) => {
                  const lpAngle = 90 + (i === 0 ? -25 : 25);
                  const lpRad = (lpAngle * Math.PI) / 180;
                  const lpDist = 35;
                  return (
                    <g key={i}>
                      <ellipse
                        cx={centerX + lpDist * Math.cos(lpRad)}
                        cy={centerY - lpDist * Math.sin(lpRad)}
                        rx="8"
                        ry="12"
                        fill="rgba(250, 204, 21, 0.5)"
                        stroke="#facc15"
                        strokeWidth="2"
                        transform={`rotate(${90 - lpAngle}, ${centerX + lpDist * Math.cos(lpRad)}, ${centerY - lpDist * Math.sin(lpRad)})`}
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* Angle value label */}
            <text
              x={centerX}
              y={centerY - radius * 0.4}
              textAnchor="middle"
              fill="#2dd4bf"
              fontSize="18"
              fontWeight="bold"
            >
              {angleData.actualAngle}°
            </text>

            {/* Ideal angle label (if different) */}
            {showComparison && angleDifference > 0 && (
              <text
                x={centerX}
                y={centerY - radius * 0.4 - 20}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="12"
              >
                (kjörhorn: {angleData.idealAngle}°)
              </text>
            )}
          </svg>
        </div>

        {/* Info panel */}
        <div className="flex-1 space-y-3">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Lögun</div>
            <div className="font-bold text-white text-lg">{angleData.geometryName}</div>
            <div className="text-sm text-teal-400">{angleData.example}</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400">Bindandi pör</div>
              <div className="text-xl font-bold text-blue-400">{angleData.bondingPairs}</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400">Einstæð pör</div>
              <div className="text-xl font-bold text-yellow-400">{angleData.lonePairs}</div>
            </div>
          </div>

          {/* Angle breakdown */}
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-2">Horngreining</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Kjörhorn:</span>
                <span className="text-gray-300">{angleData.idealAngle}°</span>
              </div>
              {angleDifference > 0 && (
                <div className="flex justify-between">
                  <span className="text-yellow-400">Áhrif einstæðra para:</span>
                  <span className="text-yellow-300">-{angleDifference}°</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-600 pt-1 mt-1">
                <span className="text-teal-400 font-bold">Raunhorn:</span>
                <span className="text-teal-300 font-bold">{angleData.actualAngle}°</span>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="text-xs text-yellow-400 font-semibold mb-1">💡 Útskýring</div>
            <div className="text-sm text-yellow-200">{angleData.explanation}</div>
          </div>
        </div>
      </div>

      {/* Comparison section */}
      {showComparison && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="text-xs text-gray-400 mb-3">Samanburður: Áhrif einstæðra para</div>
          <div className="space-y-3">
            {Object.entries(comparisonGroups).map(([groupName, geometries]) => (
              <div key={groupName}>
                <div className="text-xs text-gray-500 mb-1">{groupName}</div>
                <div className="flex gap-2 flex-wrap">
                  {geometries.map((geoId) => {
                    const data = BOND_ANGLES[geoId];
                    const diff = data.idealAngle - data.actualAngle;
                    return (
                      <button
                        key={geoId}
                        onClick={() => setSelectedGeometry(geoId)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                          selectedGeometry === geoId
                            ? 'bg-teal-500/30 border border-teal-500'
                            : 'bg-slate-700/50 hover:bg-slate-600/50'
                        }`}
                      >
                        <span className="text-white font-medium">{data.example}</span>
                        <span className="text-teal-400">{data.actualAngle}°</span>
                        {diff > 0 && (
                          <span className="text-yellow-400 text-xs">({data.lonePairs} lp)</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-1 bg-blue-400 rounded" />
          <span className="text-gray-400">Efnatengi</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-yellow-400/50 border border-yellow-400" />
          <span className="text-gray-400">Einstætt par</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-sm bg-teal-400/30 border border-teal-400" />
          <span className="text-gray-400">Tengihorn</span>
        </div>
      </div>
    </div>
  );
}

export default BondAngleMeasurement;
