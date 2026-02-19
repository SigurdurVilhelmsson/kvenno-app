import { useState, useEffect, useCallback } from 'react';

interface Domain {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'bonding' | 'lone';
  targetX: number;
  targetY: number;
}

interface GeometryConfig {
  id: string;
  name: string;
  domains: number;
  lonePairs: number;
  positions: { x: number; y: number }[];
  description: string;
}

const GEOMETRIES: GeometryConfig[] = [
  {
    id: 'linear',
    name: 'Línuleg',
    domains: 2,
    lonePairs: 0,
    positions: [
      { x: 0.2, y: 0.5 },
      { x: 0.8, y: 0.5 },
    ],
    description: '2 rafeinasvið hrinda hvort öðru 180° í sundur'
  },
  {
    id: 'trigonal-planar',
    name: 'Þríhyrnd slétt',
    domains: 3,
    lonePairs: 0,
    positions: [
      { x: 0.5, y: 0.2 },
      { x: 0.2, y: 0.75 },
      { x: 0.8, y: 0.75 },
    ],
    description: '3 rafeinasvið raðast í 120° hornin'
  },
  {
    id: 'tetrahedral',
    name: 'Fjórflötungur',
    domains: 4,
    lonePairs: 0,
    positions: [
      { x: 0.5, y: 0.15 },
      { x: 0.2, y: 0.55 },
      { x: 0.8, y: 0.55 },
      { x: 0.5, y: 0.85 },
    ],
    description: '4 rafeinasvið raðast í 109.5° hornin'
  },
  {
    id: 'trigonal-pyramidal',
    name: 'Þríhyrnd pýramída',
    domains: 4,
    lonePairs: 1,
    positions: [
      { x: 0.5, y: 0.15 },  // lone pair
      { x: 0.2, y: 0.55 },
      { x: 0.8, y: 0.55 },
      { x: 0.5, y: 0.85 },
    ],
    description: 'Einstætt par hrindur bindandi pörum niður á við'
  },
  {
    id: 'bent',
    name: 'Beygð',
    domains: 4,
    lonePairs: 2,
    positions: [
      { x: 0.35, y: 0.2 },  // lone pair
      { x: 0.65, y: 0.2 },  // lone pair
      { x: 0.2, y: 0.7 },
      { x: 0.8, y: 0.7 },
    ],
    description: '2 einstæð pör ýta bindandi pörum nær saman'
  },
  {
    id: 'octahedral',
    name: 'Áttflötungur',
    domains: 6,
    lonePairs: 0,
    positions: [
      { x: 0.5, y: 0.1 },
      { x: 0.5, y: 0.9 },
      { x: 0.1, y: 0.5 },
      { x: 0.9, y: 0.5 },
      { x: 0.3, y: 0.3 },
      { x: 0.7, y: 0.7 },
    ],
    description: '6 rafeinasvið raðast í 90° hornin'
  },
];

interface ElectronRepulsionAnimationProps {
  geometryId?: string;
  autoPlay?: boolean;
  showForces?: boolean;
  compact?: boolean;
}

export function ElectronRepulsionAnimation({
  geometryId = 'tetrahedral',
  autoPlay = false,
  showForces = true,
  compact = false
}: ElectronRepulsionAnimationProps) {
  const [selectedGeometry, setSelectedGeometry] = useState(
    GEOMETRIES.find(g => g.id === geometryId) || GEOMETRIES[2]
  );
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [phase, setPhase] = useState<'initial' | 'repelling' | 'settled'>('initial');
  const [step, setStep] = useState(0);

  const centerX = 0.5;
  const centerY = 0.5;

  // Initialize domains at clustered positions
  const initializeDomains = useCallback(() => {
    const newDomains: Domain[] = [];
    const geo = selectedGeometry;

    for (let i = 0; i < geo.domains; i++) {
      // Start domains near center in a tight cluster
      const angle = (i / geo.domains) * Math.PI * 2 + Math.random() * 0.3;
      const distance = 0.08 + Math.random() * 0.05;
      const isLone = i < geo.lonePairs;

      newDomains.push({
        id: `domain-${i}`,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: 0,
        vy: 0,
        type: isLone ? 'lone' : 'bonding',
        targetX: geo.positions[i].x,
        targetY: geo.positions[i].y,
      });
    }

    setDomains(newDomains);
    setPhase('initial');
    setStep(0);
  }, [selectedGeometry]);

  useEffect(() => {
    initializeDomains();
  }, [initializeDomains]);

  useEffect(() => {
    if (autoPlay) {
      const timer = setTimeout(() => startAnimation(), 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, selectedGeometry]);

  const startAnimation = () => {
    setIsAnimating(true);
    setPhase('repelling');
    setStep(0);
  };

  // Animation loop using physics-based repulsion
  useEffect(() => {
    if (!isAnimating || phase !== 'repelling') return;

    const animate = () => {
      setDomains(prevDomains => {
        const newDomains = prevDomains.map(domain => {
          let fx = 0;
          let fy = 0;

          // Repulsion from other domains
          prevDomains.forEach(other => {
            if (other.id === domain.id) return;

            const dx = domain.x - other.x;
            const dy = domain.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
            const minDist = 0.15;

            // Stronger repulsion when closer
            if (dist < minDist * 2) {
              const force = (minDist * 2 - dist) * 0.02;
              fx += (dx / dist) * force;
              fy += (dy / dist) * force;
            }
          });

          // Attraction to target position (spring force)
          const targetDx = domain.targetX - domain.x;
          const targetDy = domain.targetY - domain.y;
          const springForce = 0.015;
          fx += targetDx * springForce;
          fy += targetDy * springForce;

          // Weak attraction to center (to keep domains from flying away)
          const centerDx = centerX - domain.x;
          const centerDy = centerY - domain.y;
          const centerDist = Math.sqrt(centerDx * centerDx + centerDy * centerDy);
          if (centerDist > 0.4) {
            fx += centerDx * 0.01;
            fy += centerDy * 0.01;
          }

          // Update velocity with damping
          const damping = 0.9;
          const newVx = (domain.vx + fx) * damping;
          const newVy = (domain.vy + fy) * damping;

          // Update position
          const newX = Math.max(0.05, Math.min(0.95, domain.x + newVx));
          const newY = Math.max(0.05, Math.min(0.95, domain.y + newVy));

          return {
            ...domain,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
          };
        });

        return newDomains;
      });

      setStep(prev => prev + 1);
    };

    const interval = setInterval(animate, 16);

    // Check if settled
    if (step > 200) {
      clearInterval(interval);
      setIsAnimating(false);
      setPhase('settled');
    }

    return () => clearInterval(interval);
  }, [isAnimating, phase, step]);

  const handleGeometryChange = (geo: GeometryConfig) => {
    setSelectedGeometry(geo);
    setIsAnimating(false);
    setPhase('initial');
  };

  const width = compact ? 200 : 300;
  const height = compact ? 200 : 300;

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold text-purple-800 flex items-center gap-2 ${compact ? 'text-base' : 'text-lg'}`}>
          <span>⚡</span> Rafeindahrun
        </h3>
        <div className={`text-xs px-2 py-1 rounded-full ${
          phase === 'initial' ? 'bg-gray-100 text-gray-600' :
          phase === 'repelling' ? 'bg-purple-100 text-purple-700 animate-pulse' :
          'bg-green-100 text-green-700'
        }`}>
          {phase === 'initial' ? 'Tilbúið' :
           phase === 'repelling' ? 'Hrundur...' :
           'Stöðugt'}
        </div>
      </div>

      {/* Geometry selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {GEOMETRIES.map(geo => (
          <button
            key={geo.id}
            onClick={() => handleGeometryChange(geo)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedGeometry.id === geo.id
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-purple-100 border border-gray-200'
            }`}
          >
            {geo.domains} svið
            {geo.lonePairs > 0 && ` (${geo.lonePairs} lp)`}
          </button>
        ))}
      </div>

      {/* Animation canvas */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-inner">
        <svg
          width={width}
          height={height}
          viewBox="0 0 1 1"
          className="mx-auto"
          style={{ overflow: 'visible' }}
        >
          {/* Central atom */}
          <circle
            cx={centerX}
            cy={centerY}
            r={0.08}
            fill="#6366f1"
            stroke="#4f46e5"
            strokeWidth={0.01}
          />
          <text
            x={centerX}
            y={centerY + 0.025}
            textAnchor="middle"
            fill="white"
            fontSize="0.06"
            fontWeight="bold"
          >
            X
          </text>

          {/* Force arrows (when showing forces and animating) */}
          {showForces && phase === 'repelling' && domains.map((domain, i) => {
            const otherDomains = domains.filter(d => d.id !== domain.id);
            return otherDomains.map((other, j) => {
              const dx = domain.x - other.x;
              const dy = domain.y - other.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 0.3) return null;

              const midX = (domain.x + other.x) / 2;
              const midY = (domain.y + other.y) / 2;
              const arrowLen = 0.05;
              const nx = dx / dist;
              const ny = dy / dist;

              return (
                <g key={`force-${i}-${j}`} opacity={0.4}>
                  {/* Arrow from midpoint toward domain */}
                  <line
                    x1={midX}
                    y1={midY}
                    x2={midX + nx * arrowLen}
                    y2={midY + ny * arrowLen}
                    stroke="#ef4444"
                    strokeWidth={0.008}
                    markerEnd="url(#arrowhead)"
                  />
                  {/* Arrow from midpoint toward other */}
                  <line
                    x1={midX}
                    y1={midY}
                    x2={midX - nx * arrowLen}
                    y2={midY - ny * arrowLen}
                    stroke="#ef4444"
                    strokeWidth={0.008}
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              );
            });
          })}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="4"
              markerHeight="4"
              refX="3"
              refY="2"
              orient="auto"
            >
              <polygon points="0,0 4,2 0,4" fill="#ef4444" />
            </marker>
          </defs>

          {/* Bonds to central atom */}
          {domains.filter(d => d.type === 'bonding').map(domain => (
            <line
              key={`bond-${domain.id}`}
              x1={centerX}
              y1={centerY}
              x2={domain.x}
              y2={domain.y}
              stroke="#374151"
              strokeWidth={0.015}
              strokeLinecap="round"
            />
          ))}

          {/* Electron domains */}
          {domains.map((domain, i) => (
            <g key={domain.id}>
              {/* Domain circle */}
              <circle
                cx={domain.x}
                cy={domain.y}
                r={domain.type === 'lone' ? 0.05 : 0.06}
                fill={domain.type === 'lone' ? '#fbbf24' : '#10b981'}
                stroke={domain.type === 'lone' ? '#f59e0b' : '#059669'}
                strokeWidth={0.008}
                className="transition-all duration-75"
              />
              {/* Electron dots */}
              {domain.type === 'bonding' ? (
                <text
                  x={domain.x}
                  y={domain.y + 0.018}
                  textAnchor="middle"
                  fill="white"
                  fontSize="0.04"
                  fontWeight="bold"
                >
                  {i - selectedGeometry.lonePairs + 1}
                </text>
              ) : (
                <g>
                  <circle cx={domain.x - 0.015} cy={domain.y} r={0.012} fill="#78350f" />
                  <circle cx={domain.x + 0.015} cy={domain.y} r={0.012} fill="#78350f" />
                </g>
              )}
            </g>
          ))}

          {/* Target positions (ghost) when not settled */}
          {phase !== 'settled' && selectedGeometry.positions.map((pos, i) => (
            <circle
              key={`target-${i}`}
              cx={pos.x}
              cy={pos.y}
              r={0.04}
              fill="none"
              stroke="#a5b4fc"
              strokeWidth={0.005}
              strokeDasharray="0.02 0.02"
              opacity={0.5}
            />
          ))}
        </svg>
      </div>

      {/* Description */}
      <div className="bg-white rounded-lg p-3 mb-4 text-sm text-gray-700">
        <div className="font-medium text-purple-800 mb-1">{selectedGeometry.name}</div>
        <div>{selectedGeometry.description}</div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={initializeDomains}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all"
        >
          Endurstilla
        </button>
        <button
          onClick={startAnimation}
          disabled={isAnimating}
          className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white font-bold py-2 px-4 rounded-lg transition-all"
        >
          {isAnimating ? 'Hrinda...' : 'Hrinda rafeindum'}
        </button>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-600" />
          <span>Bindandi par</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-yellow-500" />
          <span>Einstætt par</span>
        </div>
        {showForces && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-red-500" />
            <span>Frávísunarkraftur</span>
          </div>
        )}
      </div>
    </div>
  );
}
