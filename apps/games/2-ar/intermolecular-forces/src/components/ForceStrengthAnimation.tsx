import { useState, useEffect } from 'react';

interface ForceStrengthAnimationProps {
  /** Selected force type to highlight */
  highlightForce?: 'london' | 'dipole' | 'hydrogen' | null;
  /** Show interactive comparison mode */
  interactive?: boolean;
  /** Compact display */
  compact?: boolean;
  /** Show animation */
  animate?: boolean;
}

interface ForceData {
  id: 'london' | 'dipole' | 'hydrogen';
  name: string;
  nameEn: string;
  strength: number; // Relative strength 1-10
  energyRange: string; // kJ/mol
  color: string;
  description: string;
  example: string;
  icon: string;
}

const FORCES: ForceData[] = [
  {
    id: 'london',
    name: 'London dreifikraftar',
    nameEn: 'London Dispersion',
    strength: 2,
    energyRange: '0.05 - 40',
    color: '#a855f7', // purple
    description: 'Tímabundnir tvípólar í rafeindaský',
    example: 'CH₄, I₂, Ar',
    icon: '🌫️',
  },
  {
    id: 'dipole',
    name: 'Tvípól-tvípól',
    nameEn: 'Dipole-Dipole',
    strength: 5,
    energyRange: '5 - 25',
    color: '#3b82f6', // blue
    description: 'Varanlegt aðdráttarafl milli δ+ og δ-',
    example: 'HCl, SO₂',
    icon: '⚡',
  },
  {
    id: 'hydrogen',
    name: 'Vetnistengi',
    nameEn: 'Hydrogen Bond',
    strength: 8,
    energyRange: '10 - 40',
    color: '#ef4444', // red
    description: 'Sérstakur tvípól: H bundið við F, O, eða N',
    example: 'H₂O, NH₃, HF',
    icon: '🔗',
  },
];

/**
 * ForceStrengthAnimation - Visual comparison of IMF strengths
 *
 * Shows animated bars, molecule interactions, and relative strengths
 * to help students understand the hierarchy of intermolecular forces.
 */
export function ForceStrengthAnimation({
  highlightForce = null,
  interactive = true,
  compact = false,
  animate = true,
}: ForceStrengthAnimationProps) {
  const [selectedForce, setSelectedForce] = useState<'london' | 'dipole' | 'hydrogen' | null>(highlightForce);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  // Animation loop
  useEffect(() => {
    if (!animate) return;

    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 100);
    }, 50);

    return () => clearInterval(interval);
  }, [animate]);

  // SVG dimensions
  const width = compact ? 280 : 380;
  const height = compact ? 200 : 280;
  const margin = { top: 20, right: 20, bottom: 40, left: 20 };

  // Calculate animated oscillation for molecule pairs
  const getOscillation = (baseOffset: number, strength: number) => {
    const phase = (animationPhase + baseOffset) % 100;
    const amplitude = 10 - strength; // Weaker forces = more movement
    return Math.sin((phase / 100) * Math.PI * 2) * amplitude;
  };

  // Get "spring" tension visualization
  const getSpringPath = (x1: number, y1: number, x2: number, y2: number, strength: number) => {
    const midY = (y1 + y2) / 2;
    const dx = x2 - x1;
    const amplitude = 15 - strength * 1.5; // Weaker = more wavy
    const waves = Math.max(2, 6 - Math.floor(strength / 2));

    let path = `M ${x1} ${y1}`;

    for (let i = 1; i <= waves; i++) {
      const t = i / waves;
      const px = x1 + dx * t;
      const py = midY + (i % 2 === 0 ? amplitude : -amplitude) * Math.sin(t * Math.PI);
      path += ` Q ${x1 + dx * (t - 0.5 / waves)} ${py} ${px} ${midY}`;
    }

    return path;
  };

  const selectedData = selectedForce ? FORCES.find(f => f.id === selectedForce) : null;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <span className="text-lg">💪</span>
          Styrkur millisameindakrafta
        </h3>
        {interactive && (
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              showComparison
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            }`}
          >
            {showComparison ? 'Sýna val' : 'Bera saman'}
          </button>
        )}
      </div>

      {/* Force selector buttons */}
      {interactive && !showComparison && (
        <div className="flex gap-2 mb-4">
          {FORCES.map(force => (
            <button
              key={force.id}
              onClick={() => setSelectedForce(selectedForce === force.id ? null : force.id)}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedForce === force.id
                  ? 'text-white ring-2 ring-white/50'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
              style={{
                backgroundColor: selectedForce === force.id ? force.color : undefined,
              }}
            >
              <div className="text-lg mb-1">{force.icon}</div>
              <div className="truncate">{force.name.split(' ')[0]}</div>
            </button>
          ))}
        </div>
      )}

      {/* Animated visualization */}
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="bg-slate-950 rounded-lg"
        role="img"
        aria-label="Styrkur millisameindakrafta samanburður"
      >
        <defs>
          {/* Gradients for molecules */}
          <radialGradient id="moleculeGrad" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#666" stopOpacity="0.1" />
          </radialGradient>

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background grid */}
        <pattern id="forceGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" />
        </pattern>
        <rect x="0" y="0" width={width} height={height} fill="url(#forceGrid)" opacity="0.3" />

        {/* Force comparison or single force display */}
        {showComparison ? (
          // Show all three forces side by side
          FORCES.map((force, index) => {
            const sectionWidth = (width - margin.left - margin.right) / 3;
            const centerX = margin.left + sectionWidth * index + sectionWidth / 2;
            const centerY = height / 2;
            const oscillation = getOscillation(index * 33, force.strength);

            return (
              <g key={force.id}>
                {/* Section label */}
                <text
                  x={centerX}
                  y={30}
                  textAnchor="middle"
                  className="fill-gray-400"
                  style={{ fontSize: '10px' }}
                >
                  {force.name.split(' ')[0]}
                </text>

                {/* Molecule pair */}
                <circle
                  cx={centerX - 25 + oscillation}
                  cy={centerY}
                  r={15}
                  fill={force.color}
                  opacity="0.7"
                />
                <circle
                  cx={centerX + 25 - oscillation}
                  cy={centerY}
                  r={15}
                  fill={force.color}
                  opacity="0.7"
                />

                {/* Force connection line */}
                <path
                  d={getSpringPath(
                    centerX - 10 + oscillation,
                    centerY,
                    centerX + 10 - oscillation,
                    centerY,
                    force.strength
                  )}
                  fill="none"
                  stroke={force.color}
                  strokeWidth="2"
                  strokeDasharray={force.strength > 5 ? 'none' : '4,2'}
                />

                {/* Strength bar */}
                <rect
                  x={centerX - 20}
                  y={height - 50}
                  width={40}
                  height={10}
                  rx={5}
                  fill="#374151"
                />
                <rect
                  x={centerX - 20}
                  y={height - 50}
                  width={(force.strength / 10) * 40}
                  height={10}
                  rx={5}
                  fill={force.color}
                />

                {/* Strength label */}
                <text
                  x={centerX}
                  y={height - 30}
                  textAnchor="middle"
                  className="fill-gray-400"
                  style={{ fontSize: '9px' }}
                >
                  {force.energyRange} kJ/mol
                </text>
              </g>
            );
          })
        ) : selectedForce ? (
          // Show selected force in detail
          (() => {
            const force = FORCES.find(f => f.id === selectedForce)!;
            const centerX = width / 2;
            const centerY = height / 2 - 20;
            const oscillation = getOscillation(0, force.strength);

            return (
              <g>
                {/* Large animated molecule pair */}
                <g filter="url(#glow)">
                  <circle
                    cx={centerX - 50 + oscillation}
                    cy={centerY}
                    r={30}
                    fill={force.color}
                    opacity="0.8"
                  />
                  <circle
                    cx={centerX + 50 - oscillation}
                    cy={centerY}
                    r={30}
                    fill={force.color}
                    opacity="0.8"
                  />
                </g>

                {/* Partial charge labels */}
                {force.id !== 'london' && (
                  <>
                    <text
                      x={centerX - 50 + oscillation}
                      y={centerY + 5}
                      textAnchor="middle"
                      className="fill-white font-bold"
                      style={{ fontSize: '14px' }}
                    >
                      δ+
                    </text>
                    <text
                      x={centerX + 50 - oscillation}
                      y={centerY + 5}
                      textAnchor="middle"
                      className="fill-white font-bold"
                      style={{ fontSize: '14px' }}
                    >
                      δ−
                    </text>
                  </>
                )}

                {/* Force visualization - spring or dotted line */}
                <path
                  d={getSpringPath(
                    centerX - 20 + oscillation,
                    centerY,
                    centerX + 20 - oscillation,
                    centerY,
                    force.strength
                  )}
                  fill="none"
                  stroke={force.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Force arrows */}
                <path
                  d={`M ${centerX - 25 + oscillation} ${centerY} L ${centerX - 15 + oscillation} ${centerY - 5} L ${centerX - 15 + oscillation} ${centerY + 5} Z`}
                  fill={force.color}
                />
                <path
                  d={`M ${centerX + 25 - oscillation} ${centerY} L ${centerX + 15 - oscillation} ${centerY - 5} L ${centerX + 15 - oscillation} ${centerY + 5} Z`}
                  fill={force.color}
                />

                {/* Force name */}
                <text
                  x={centerX}
                  y={40}
                  textAnchor="middle"
                  className="fill-white font-bold"
                  style={{ fontSize: '14px' }}
                >
                  {force.icon} {force.name}
                </text>

                {/* Energy range bar */}
                <rect
                  x={centerX - 80}
                  y={height - 60}
                  width={160}
                  height={15}
                  rx={7.5}
                  fill="#374151"
                />
                <rect
                  x={centerX - 80}
                  y={height - 60}
                  width={(force.strength / 10) * 160}
                  height={15}
                  rx={7.5}
                  fill={force.color}
                  className={animate ? 'animate-pulse' : ''}
                />

                {/* Energy label */}
                <text
                  x={centerX}
                  y={height - 35}
                  textAnchor="middle"
                  className="fill-gray-300"
                  style={{ fontSize: '11px' }}
                >
                  {force.energyRange} kJ/mol
                </text>
              </g>
            );
          })()
        ) : (
          // Default: show strength hierarchy
          <g>
            <text
              x={width / 2}
              y={height / 2}
              textAnchor="middle"
              className="fill-gray-400"
              style={{ fontSize: '12px' }}
            >
              Veldu kraft til að sjá hermun
            </text>

            {/* Horizontal strength scale */}
            <g transform={`translate(${margin.left}, ${height - 70})`}>
              {FORCES.map((force, i) => {
                const barWidth = ((width - margin.left - margin.right) / 10) * force.strength;
                const y = i * 20;

                return (
                  <g key={force.id}>
                    <text
                      x={0}
                      y={y + 12}
                      className="fill-gray-400"
                      style={{ fontSize: '9px' }}
                    >
                      {force.icon}
                    </text>
                    <rect
                      x={20}
                      y={y}
                      width={width - margin.left - margin.right - 30}
                      height={15}
                      rx={4}
                      fill="#374151"
                    />
                    <rect
                      x={20}
                      y={y}
                      width={barWidth}
                      height={15}
                      rx={4}
                      fill={force.color}
                      className={animate ? 'transition-all duration-500' : ''}
                    />
                  </g>
                );
              })}
            </g>
          </g>
        )}
      </svg>

      {/* Selected force details */}
      {selectedData && !showComparison && (
        <div
          className="mt-4 p-3 rounded-lg"
          style={{ backgroundColor: `${selectedData.color}20`, borderColor: `${selectedData.color}40` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{selectedData.icon}</span>
            <div>
              <div className="text-white font-bold text-sm">{selectedData.name}</div>
              <div className="text-gray-400 text-xs">{selectedData.nameEn}</div>
            </div>
          </div>
          <div className="text-gray-300 text-sm mb-2">{selectedData.description}</div>
          <div className="flex gap-4 text-xs">
            <div>
              <span className="text-gray-400">Styrkssvið:</span>
              <span className="text-white ml-1">{selectedData.energyRange} kJ/mol</span>
            </div>
            <div>
              <span className="text-gray-400">Dæmi:</span>
              <span className="text-white ml-1 font-mono">{selectedData.example}</span>
            </div>
          </div>
        </div>
      )}

      {/* Key insight */}
      {!compact && (
        <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="text-yellow-400 text-xs font-medium mb-1">Mundu:</div>
          <ul className="text-gray-300 text-xs space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">●</span>
              <span><strong>London</strong> er alltaf til staðar, sterkari með auknum mólmassa</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">●</span>
              <span><strong>Tvípól</strong> krefst skautaðrar sameindar (ósamhverf)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">●</span>
              <span><strong>Vetnistengi</strong> krefst H bundið við F, O, eða N</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default ForceStrengthAnimation;
