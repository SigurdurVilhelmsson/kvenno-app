import { useState, useEffect, useRef } from 'react';

/**
 * ShapeTransitionAnimation
 *
 * Animates transitions between VSEPR geometries as electron domains are
 * added or removed, demonstrating how molecular shape depends on domain count.
 */

interface DomainPosition {
  x: number;
  y: number;
  isLonePair: boolean;
}

interface GeometryConfig {
  name: string;
  nameEn: string;
  bondAngle: string;
  positions: DomainPosition[];
  example?: string;
}

// Target positions for each electron domain count (2-6)
const GEOMETRY_CONFIGS: Record<number, GeometryConfig> = {
  2: {
    name: 'Línuleg',
    nameEn: 'Linear',
    bondAngle: '180°',
    positions: [
      { x: -80, y: 0, isLonePair: false },
      { x: 80, y: 0, isLonePair: false },
    ],
    example: 'CO₂',
  },
  3: {
    name: 'Þríhyrnd slétt',
    nameEn: 'Trigonal Planar',
    bondAngle: '120°',
    positions: [
      { x: 0, y: -70, isLonePair: false },
      { x: -60, y: 35, isLonePair: false },
      { x: 60, y: 35, isLonePair: false },
    ],
    example: 'BF₃',
  },
  4: {
    name: 'Fjórflötungur',
    nameEn: 'Tetrahedral',
    bondAngle: '109.5°',
    positions: [
      { x: 0, y: -70, isLonePair: false },
      { x: -60, y: 0, isLonePair: false },
      { x: 60, y: 0, isLonePair: false },
      { x: 0, y: 70, isLonePair: false },
    ],
    example: 'CH₄',
  },
  5: {
    name: 'Þríhyrnd tvípýramída',
    nameEn: 'Trigonal Bipyramidal',
    bondAngle: '90°/120°',
    positions: [
      { x: 0, y: -80, isLonePair: false },
      { x: -55, y: 0, isLonePair: false },
      { x: 55, y: 0, isLonePair: false },
      { x: 0, y: 0, isLonePair: false }, // equatorial
      { x: 0, y: 80, isLonePair: false },
    ],
    example: 'PCl₅',
  },
  6: {
    name: 'Áttflötungur',
    nameEn: 'Octahedral',
    bondAngle: '90°',
    positions: [
      { x: 0, y: -80, isLonePair: false },
      { x: -70, y: 0, isLonePair: false },
      { x: 70, y: 0, isLonePair: false },
      { x: 0, y: 80, isLonePair: false },
      { x: -40, y: -40, isLonePair: false },
      { x: 40, y: 40, isLonePair: false },
    ],
    example: 'SF₆',
  },
};

interface AnimatedDomain {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isNew: boolean;
  isRemoving: boolean;
  opacity: number;
}

interface ShapeTransitionAnimationProps {
  compact?: boolean;
  showControls?: boolean;
  initialDomains?: number;
}

export function ShapeTransitionAnimation({
  compact = false,
  showControls = true,
  initialDomains = 4,
}: ShapeTransitionAnimationProps) {
  const [domainCount, setDomainCount] = useState(initialDomains);
  const [domains, setDomains] = useState<AnimatedDomain[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTrail, setShowTrail] = useState(true);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const config = GEOMETRY_CONFIGS[domainCount];

  // Initialize domains
  useEffect(() => {
    const initial = config.positions.map((pos, i) => ({
      id: i,
      x: pos.x,
      y: pos.y,
      targetX: pos.x,
      targetY: pos.y,
      isNew: false,
      isRemoving: false,
      opacity: 1,
    }));
    setDomains(initial);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isAnimating) return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      const speed = 0.008 * delta;

      setDomains(prev => {
        let allDone = true;
        const updated = prev.map(d => {
          // Calculate distance to target
          const dx = d.targetX - d.x;
          const dy = d.targetY - d.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Handle opacity for new/removing domains
          let newOpacity = d.opacity;
          if (d.isNew && d.opacity < 1) {
            newOpacity = Math.min(1, d.opacity + 0.05);
            allDone = false;
          }
          if (d.isRemoving && d.opacity > 0) {
            newOpacity = Math.max(0, d.opacity - 0.08);
            allDone = false;
          }

          // Move toward target
          if (dist > 1) {
            allDone = false;
            return {
              ...d,
              x: d.x + dx * speed,
              y: d.y + dy * speed,
              opacity: newOpacity,
            };
          }

          return {
            ...d,
            x: d.targetX,
            y: d.targetY,
            opacity: newOpacity,
            isNew: false,
          };
        }).filter(d => !(d.isRemoving && d.opacity <= 0));

        if (allDone) {
          setIsAnimating(false);
        }

        return updated;
      });

      if (isAnimating) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    lastTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating]);

  // Handle domain count change
  const changeDomains = (newCount: number) => {
    if (newCount < 2 || newCount > 6 || isAnimating) return;

    const newConfig = GEOMETRY_CONFIGS[newCount];
    const prevCount = domainCount;

    setDomainCount(newCount);
    setIsAnimating(true);

    if (newCount > prevCount) {
      // Adding domains
      const newDomains = [...domains];

      // Update existing domain targets
      for (let i = 0; i < domains.length; i++) {
        if (i < newConfig.positions.length) {
          newDomains[i] = {
            ...newDomains[i],
            targetX: newConfig.positions[i].x,
            targetY: newConfig.positions[i].y,
          };
        }
      }

      // Add new domains (start from center)
      for (let i = prevCount; i < newCount; i++) {
        newDomains.push({
          id: Date.now() + i,
          x: 0,
          y: 0,
          targetX: newConfig.positions[i].x,
          targetY: newConfig.positions[i].y,
          isNew: true,
          isRemoving: false,
          opacity: 0,
        });
      }

      setDomains(newDomains);
    } else {
      // Removing domains
      const newDomains = domains.map((d, i) => {
        if (i >= newCount) {
          // Mark for removal (animate to center and fade)
          return {
            ...d,
            targetX: 0,
            targetY: 0,
            isRemoving: true,
          };
        }
        // Update target for remaining domains
        return {
          ...d,
          targetX: newConfig.positions[i].x,
          targetY: newConfig.positions[i].y,
        };
      });

      setDomains(newDomains);
    }
  };

  const size = compact ? 220 : 300;
  const center = size / 2;
  const centralRadius = compact ? 22 : 28;
  const domainRadius = compact ? 14 : 18;

  return (
    <div className={`${compact ? 'p-3' : 'p-4'} bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-bold text-indigo-800 ${compact ? 'text-sm' : 'text-base'}`}>
          Lögunarbreyting
        </h3>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showTrail}
              onChange={(e) => setShowTrail(e.target.checked)}
              className="rounded border-gray-300"
            />
            Sýna slóð
          </label>
        </div>
      </div>

      {/* SVG Animation */}
      <div className="flex justify-center mb-4">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="bg-slate-900 rounded-xl"
        >
          <defs>
            {/* Glow filter for domains */}
            <filter id="domainGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradient for central atom */}
            <radialGradient id="centralGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </radialGradient>

            {/* Gradient for domains */}
            <radialGradient id="domainGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#06b6d4" />
            </radialGradient>
          </defs>

          {/* Trail paths (ghost positions) */}
          {showTrail && domains.map(d => {
            const dx = d.targetX - d.x;
            const dy = d.targetY - d.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 5 || d.isRemoving) return null;

            return (
              <g key={`trail-${d.id}`}>
                {/* Trail line */}
                <line
                  x1={center + d.x}
                  y1={center + d.y}
                  x2={center + d.targetX}
                  y2={center + d.targetY}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.4"
                />
                {/* Target ghost */}
                <circle
                  cx={center + d.targetX}
                  cy={center + d.targetY}
                  r={domainRadius}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.3"
                />
              </g>
            );
          })}

          {/* Bonds from center to domains */}
          {domains.map(d => (
            <line
              key={`bond-${d.id}`}
              x1={center}
              y1={center}
              x2={center + d.x}
              y2={center + d.y}
              stroke="#64748b"
              strokeWidth="4"
              strokeLinecap="round"
              opacity={d.opacity * 0.8}
            />
          ))}

          {/* Central atom */}
          <circle
            cx={center}
            cy={center}
            r={centralRadius}
            fill="url(#centralGradient)"
            filter="url(#domainGlow)"
          />
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize={compact ? "12" : "14"}
            fontWeight="bold"
          >
            X
          </text>

          {/* Electron domains */}
          {domains.map(d => (
            <g key={d.id} opacity={d.opacity}>
              <circle
                cx={center + d.x}
                cy={center + d.y}
                r={domainRadius}
                fill="url(#domainGradient)"
                filter="url(#domainGlow)"
                className={d.isNew ? 'animate-pulse' : ''}
              />
            </g>
          ))}

          {/* Domain count label */}
          <text
            x={size - 12}
            y={20}
            textAnchor="end"
            fill="#94a3b8"
            fontSize="12"
          >
            {domainCount} svið
          </text>
        </svg>
      </div>

      {/* Info panel */}
      <div className="bg-white rounded-lg p-3 mb-4 text-center">
        <div className="text-lg font-bold text-indigo-700">{config.name}</div>
        <div className="text-sm text-gray-500">{config.nameEn}</div>
        <div className="flex justify-center gap-6 mt-2 text-sm">
          <div>
            <span className="text-gray-500">Horn:</span>{' '}
            <span className="font-medium text-indigo-600">{config.bondAngle}</span>
          </div>
          {config.example && (
            <div>
              <span className="text-gray-500">Dæmi:</span>{' '}
              <span className="font-medium text-cyan-600">{config.example}</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => changeDomains(domainCount - 1)}
            disabled={domainCount <= 2 || isAnimating}
            className={`w-12 h-12 rounded-full font-bold text-2xl transition-all ${
              domainCount > 2 && !isAnimating
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Fjarlægja rafeinasvið"
          >
            -
          </button>

          <div className="text-center px-4">
            <div className="text-2xl font-bold text-indigo-700">{domainCount}</div>
            <div className="text-xs text-gray-500">rafeinasvið</div>
          </div>

          <button
            onClick={() => changeDomains(domainCount + 1)}
            disabled={domainCount >= 6 || isAnimating}
            className={`w-12 h-12 rounded-full font-bold text-2xl transition-all ${
              domainCount < 6 && !isAnimating
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Bæta við rafeinasviði"
          >
            +
          </button>
        </div>
      )}

      {/* Geometry sequence */}
      <div className="mt-4 flex justify-center gap-1">
        {[2, 3, 4, 5, 6].map(n => (
          <button
            key={n}
            onClick={() => changeDomains(n)}
            disabled={isAnimating}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
              n === domainCount
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-indigo-100'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Educational note */}
      <div className={`mt-4 text-center ${compact ? 'text-xs' : 'text-sm'} text-gray-600`}>
        <p>
          <strong>VSEPR:</strong> Rafeinasvið hrinda hvort öðru frá og finna jafnvægisstöðu.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Smelltu á + eða - til að sjá hvernig lögunin breytist.
        </p>
      </div>
    </div>
  );
}

export default ShapeTransitionAnimation;
