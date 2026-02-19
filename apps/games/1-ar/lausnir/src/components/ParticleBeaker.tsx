import { useMemo } from 'react';
import { ParticleSimulation, PHYSICS_PRESETS } from '@shared/components';
import type { ParticleType } from '@shared/components';

interface ParticleBeakerProps {
  volume: number;
  maxVolume?: number;
  concentration?: number;
  molecules: number;
  color?: string;
  label?: string;
  running?: boolean;
}

/**
 * ParticleBeaker - A beaker visualization with animated particles showing Brownian motion
 *
 * Combines a static SVG beaker outline with a canvas-based particle simulation
 * inside the liquid area.
 */
export function ParticleBeaker({
  volume,
  maxVolume = 500,
  concentration,
  molecules,
  color = '#f97316',
  label,
  running = true
}: ParticleBeakerProps) {
  const fillPercent = Math.min(100, (volume / maxVolume) * 100);

  // Calculate display dimensions
  const beakerWidth = 200;
  const beakerHeight = 260;
  const innerPadding = 16;

  // Liquid area dimensions (inside beaker)
  const liquidWidth = beakerWidth - innerPadding * 2;
  const maxLiquidHeight = 180;
  const liquidHeight = Math.max(30, (fillPercent / 100) * maxLiquidHeight);

  // Particle configuration
  const displayParticles = Math.min(molecules, 60);

  const particleType: ParticleType = useMemo(() => ({
    id: 'solute',
    color: color,
    radius: 4,
    label: '',
    mass: 1
  }), [color]);

  // Calculate particle speed based on concentration (denser = slower due to more collisions)
  const effectiveTemp = 300 - Math.min(200, (concentration || 1) * 30);

  return (
    <div className="relative mx-auto" style={{ width: beakerWidth, height: beakerHeight }}>
      {/* Beaker SVG outline and graduations */}
      <svg
        viewBox="0 0 100 140"
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      >
        {/* Beaker outline */}
        <path
          d="M15 10 L15 120 Q15 130 25 130 L75 130 Q85 130 85 120 L85 10"
          fill="none"
          stroke="#374151"
          strokeWidth="3"
        />

        {/* Volume graduations */}
        {[20, 40, 60, 80, 100].map((percent, i) => (
          <g key={i}>
            <line
              x1="85"
              y1={120 - (percent * 1.1)}
              x2="92"
              y2={120 - (percent * 1.1)}
              stroke="#9ca3af"
              strokeWidth="1"
            />
            <text
              x="94"
              y={120 - (percent * 1.1) + 3}
              fontSize="6"
              fill="#6b7280"
            >
              {Math.round((percent / 100) * maxVolume)}
            </text>
          </g>
        ))}

        {/* Solution fill background (semi-transparent) */}
        <rect
          x="16"
          y={120 - (fillPercent * 1.1)}
          width="68"
          height={fillPercent * 1.1}
          fill={color}
          opacity={0.15}
          className="transition-all duration-300"
        />

        {/* Meniscus */}
        {fillPercent > 0 && (
          <path
            d={`M 16 ${120 - fillPercent * 1.1} Q 35 ${120 - fillPercent * 1.1 - 2} 50 ${120 - fillPercent * 1.1} T 84 ${120 - fillPercent * 1.1}`}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            opacity="0.4"
          />
        )}
      </svg>

      {/* Particle simulation (positioned inside liquid area) */}
      <div
        className="absolute overflow-hidden rounded-b-lg"
        style={{
          left: innerPadding,
          bottom: 26, // Account for beaker bottom curve
          width: liquidWidth,
          height: liquidHeight
        }}
      >
        <ParticleSimulation
          container={{
            width: liquidWidth,
            height: liquidHeight,
            backgroundColor: 'transparent',
            borderWidth: 0
          }}
          particleTypes={[particleType]}
          particles={[{ typeId: 'solute', count: displayParticles }]}
          physics={{
            ...PHYSICS_PRESETS.brownian,
            speedMultiplier: 0.4,
            enableCollisions: true
          }}
          temperature={effectiveTemp}
          running={running}
          ariaLabel={`Solution with ${molecules} solute particles in ${volume} mL`}
        />
      </div>

      {/* Volume and concentration labels */}
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <div className="text-sm font-semibold text-gray-700">
          {volume} mL
        </div>
        {concentration !== undefined && (
          <div className="text-xs text-gray-500">
            {concentration.toFixed(2)} M
          </div>
        )}
      </div>

      {/* Custom label */}
      {label && (
        <div className="absolute -bottom-8 left-0 right-0 text-center text-sm text-gray-600 whitespace-pre-line">
          {label}
        </div>
      )}
    </div>
  );
}
