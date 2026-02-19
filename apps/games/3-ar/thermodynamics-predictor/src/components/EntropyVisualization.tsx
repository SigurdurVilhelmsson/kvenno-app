import { useMemo } from 'react';
import { ParticleSimulation, PHYSICS_PRESETS } from '@shared/components';
import type { ParticleType, PhysicsConfig } from '@shared/components';

interface EntropyVisualizationProps {
  deltaS: number;
}

/**
 * EntropyVisualization - Shows particle motion based on entropy change
 *
 * High entropy (ΔS > 0): Disordered, fast brownian motion
 * Low entropy (ΔS < 0): Ordered, slow motion
 */
export function EntropyVisualization({ deltaS }: EntropyVisualizationProps) {
  const isIncreasing = deltaS > 0;
  const particleCount = 20;

  // Particle type based on entropy state
  const particleType: ParticleType = useMemo(() => ({
    id: 'entropy',
    color: isIncreasing ? '#22c55e' : '#3b82f6',
    radius: 5,
    label: '',
    mass: 1
  }), [isIncreasing]);

  // Physics based on entropy
  // High entropy = fast, chaotic motion
  // Low entropy = slow, more ordered
  const physics: PhysicsConfig = useMemo(() => {
    if (isIncreasing) {
      return {
        ...PHYSICS_PRESETS.brownian,
        speedMultiplier: 1.2,
        enableCollisions: true,
        friction: 0
      };
    } else {
      return {
        ...PHYSICS_PRESETS.brownian,
        speedMultiplier: 0.3,
        enableCollisions: true,
        friction: 0.02
      };
    }
  }, [isIncreasing]);

  // Temperature affects speed - higher entropy correlates with higher effective temp
  const temperature = isIncreasing ? 400 : 150;

  return (
    <div className="entropy-container relative">
      <ParticleSimulation
        container={{
          width: 160,
          height: 120,
          backgroundColor: isIncreasing ? '#0f172a' : '#1e293b',
          borderColor: isIncreasing ? '#22c55e' : '#3b82f6',
          borderWidth: 2
        }}
        particleTypes={[particleType]}
        particles={[{ typeId: 'entropy', count: particleCount }]}
        physics={physics}
        temperature={temperature}
        running={true}
        ariaLabel={`Entropy visualization showing ${isIncreasing ? 'high' : 'low'} entropy state`}
      />

      {/* Entropy label */}
      <div className={`absolute -bottom-6 left-0 right-0 text-center text-xs font-semibold ${
        isIncreasing ? 'text-green-500' : 'text-blue-500'
      }`}>
        {isIncreasing ? '↑ Há óreiða (ΔS > 0)' : '↓ Lág óreiða (ΔS < 0)'}
      </div>
    </div>
  );
}
