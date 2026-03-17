import { useMemo } from 'react';

import { ParticleSimulation, PHYSICS_PRESETS } from '@shared/components';
import type {
  ParticleType,
  ParticleGroup,
  PhysicsConfig,
  ContainerConfig,
} from '@shared/components';

interface EntropyVisualizationProps {
  deltaS: number;
}

/**
 * EntropyVisualization — Microstate-based entropy visualization
 *
 * Shows BEFORE and AFTER states side by side to illustrate entropy change:
 * - Positive ΔS: particles confined to left half → spread across full container (more microstates)
 * - Negative ΔS: particles dispersed → organized in a tight central cluster (fewer microstates)
 *
 * CRITICAL: Both states use the SAME particle speed and temperature to decouple
 * entropy from temperature. Entropy is about the number of accessible microstates (W),
 * not particle speed.
 */
export function EntropyVisualization({ deltaS }: EntropyVisualizationProps) {
  const isIncreasing = deltaS > 0;
  const particleCount = 20;

  // Container dimensions for each simulation panel
  const containerWidth = 150;
  const containerHeight = 110;

  // Shared particle type — same color in both panels to emphasize
  // that it's the SAME system, only spatial distribution changes
  const particleType: ParticleType = useMemo(
    () => ({
      id: 'entropy',
      color: '#a78bfa',
      radius: 5,
      label: '',
      mass: 1,
    }),
    []
  );

  // CRITICAL: Identical physics for both simulations.
  // Same speed, same temperature — entropy ≠ temperature.
  const physics: PhysicsConfig = useMemo(
    () => ({
      ...PHYSICS_PRESETS.brownian,
      speedMultiplier: 0.6,
      enableCollisions: true,
      friction: 0.02,
    }),
    []
  );

  const temperature = 300;

  // Shared container styling
  const baseContainer: ContainerConfig = useMemo(
    () => ({
      width: containerWidth,
      height: containerHeight,
      backgroundColor: '#0f172a',
      borderColor: '#475569',
      borderWidth: 2,
    }),
    []
  );

  // --- Particle groups for each scenario ---

  // Positive ΔS (entropy increases):
  //   BEFORE: particles confined to left half of container
  //   AFTER:  particles spread across full container
  const positiveBeforeParticles: ParticleGroup[] = useMemo(
    () => [
      {
        typeId: 'entropy',
        count: particleCount,
        spawnRegion: {
          xMin: 0,
          xMax: containerWidth * 0.45,
          yMin: 0,
          yMax: containerHeight,
        },
      },
    ],
    []
  );

  const positiveAfterParticles: ParticleGroup[] = useMemo(
    () => [
      {
        typeId: 'entropy',
        count: particleCount,
        // No spawnRegion — full container
      },
    ],
    []
  );

  // Negative ΔS (entropy decreases):
  //   BEFORE: particles spread across full container
  //   AFTER:  particles clustered tightly in center (lattice-like)
  const negativeBeforeParticles: ParticleGroup[] = useMemo(
    () => [
      {
        typeId: 'entropy',
        count: particleCount,
        // No spawnRegion — full container
      },
    ],
    []
  );

  const negativeAfterParticles: ParticleGroup[] = useMemo(
    () => [
      {
        typeId: 'entropy',
        count: particleCount,
        spawnRegion: {
          xMin: containerWidth * 0.3,
          xMax: containerWidth * 0.7,
          yMin: containerHeight * 0.25,
          yMax: containerHeight * 0.75,
        },
      },
    ],
    []
  );

  // Select before/after particle groups based on deltaS sign
  const beforeParticles = isIncreasing ? positiveBeforeParticles : negativeBeforeParticles;
  const afterParticles = isIncreasing ? positiveAfterParticles : negativeAfterParticles;

  // Container border color indicates the state change
  const beforeContainer: ContainerConfig = useMemo(
    () => ({
      ...baseContainer,
      borderColor: '#64748b',
    }),
    [baseContainer]
  );

  const afterContainer: ContainerConfig = useMemo(
    () => ({
      ...baseContainer,
      borderColor: isIncreasing ? '#22c55e' : '#f59e0b',
    }),
    [baseContainer, isIncreasing]
  );

  // Divider line for "before" state when ΔS > 0 to show confinement boundary
  const beforeRegions = isIncreasing
    ? [
        {
          xMin: Math.floor(containerWidth * 0.45),
          xMax: Math.floor(containerWidth * 0.47),
          color: 'rgba(148, 163, 184, 0.5)',
          label: '',
        },
      ]
    : undefined;

  // Cluster boundary hint for "after" state when ΔS < 0
  const afterRegions = !isIncreasing
    ? [
        {
          xMin: Math.floor(containerWidth * 0.28),
          xMax: Math.floor(containerWidth * 0.72),
          yMin: Math.floor(containerHeight * 0.23),
          yMax: Math.floor(containerHeight * 0.77),
          color: 'rgba(245, 158, 11, 0.12)',
          label: '',
        },
      ]
    : undefined;

  return (
    <div className="entropy-viz">
      {/* Formula */}
      <div className="text-center text-xs text-gray-500 mb-2 font-mono">S = k·ln(W)</div>

      {/* Side-by-side Before / After */}
      <div className="flex items-center gap-3 justify-center">
        {/* BEFORE */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-semibold text-gray-600 mb-1">Fyrir</div>
          <ParticleSimulation
            container={beforeContainer}
            particleTypes={[particleType]}
            particles={beforeParticles}
            physics={physics}
            temperature={temperature}
            running={true}
            regions={beforeRegions}
            ariaLabel={
              isIncreasing
                ? 'Fyrir: agnir bundnar við vinstri hluta ílátsins'
                : 'Fyrir: agnir dreifðar um allt ílátið'
            }
          />
        </div>

        {/* Arrow */}
        <div className="text-xl text-gray-400 font-bold mt-4">→</div>

        {/* AFTER */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-semibold text-gray-600 mb-1">Eftir</div>
          <ParticleSimulation
            container={afterContainer}
            particleTypes={[particleType]}
            particles={afterParticles}
            physics={physics}
            temperature={temperature}
            running={true}
            regions={afterRegions}
            ariaLabel={
              isIncreasing
                ? 'Eftir: agnir dreifðar um allt ílátið — fleiri örstaður'
                : 'Eftir: agnir skipulagðar í miðju — færri örstaður'
            }
          />
        </div>
      </div>

      {/* Label */}
      <div
        className={`text-center text-xs font-semibold mt-2 ${
          isIncreasing ? 'text-green-600' : 'text-amber-600'
        }`}
      >
        {isIncreasing ? '↑ Fleiri örstaður (ΔS > 0)' : '↓ Færri örstaður (ΔS < 0)'}
      </div>
    </div>
  );
}
