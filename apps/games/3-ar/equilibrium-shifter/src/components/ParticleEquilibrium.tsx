import { useMemo } from 'react';

import { ParticleSimulation, PHYSICS_PRESETS } from '@shared/components';
import type { ParticleType } from '@shared/components';

interface ParticleEquilibriumProps {
  reactantCount: number;
  productCount: number;
  shiftDirection?: 'left' | 'right' | 'none' | null;
  /** null where ΔH is zero: the reaction is neither útvermið nor innvermið. */
  isExothermic?: boolean | null;
  running?: boolean;
  className?: string;
}

/**
 * ParticleEquilibrium - Visualization of dynamic equilibrium
 *
 * Shows particles representing reactants and products in a single container,
 * with visual indication of equilibrium shift direction.
 */
export function ParticleEquilibrium({
  reactantCount = 20,
  productCount = 20,
  shiftDirection = null,
  isExothermic = true,
  running = true,
  className = '',
}: ParticleEquilibriumProps) {
  // Particle types
  const particleTypes: ParticleType[] = useMemo(
    () => [
      {
        id: 'R',
        color: '#f97316', // Orange for reactants
        radius: 5,
        label: 'R',
        strokeColor: '#c2410c',
        mass: 1,
      },
      {
        id: 'P',
        color: '#8b5cf6', // Purple for products
        radius: 5,
        label: 'P',
        strokeColor: '#6d28d9',
        mass: 1,
      },
    ],
    []
  );

  // Adjust particle counts based on shift
  const adjustedReactants = useMemo(() => {
    if (shiftDirection === 'right') return Math.max(5, reactantCount - 5);
    if (shiftDirection === 'left') return Math.min(35, reactantCount + 5);
    return reactantCount;
  }, [reactantCount, shiftDirection]);

  const adjustedProducts = useMemo(() => {
    if (shiftDirection === 'right') return Math.min(35, productCount + 5);
    if (shiftDirection === 'left') return Math.max(5, productCount - 5);
    return productCount;
  }, [productCount, shiftDirection]);

  // Container styling based on shift direction
  const containerBorderColor = useMemo(() => {
    if (shiftDirection === 'right') return '#22c55e';
    if (shiftDirection === 'left') return '#ef4444';
    return '#6b7280';
  }, [shiftDirection]);

  return (
    // min-w-0 lets the canvas shrink to a phone-width card (it is a flex item).
    // Below sm the direction arrows sit just inside the canvas edges instead of
    // 32 px outside them, where they pushed the page sideways.
    <div className={`relative min-w-0 max-w-full ${className}`}>
      {/* Direction indicators */}
      <div className="absolute left-2 sm:-left-8 top-1/2 -translate-y-1/2 z-10">
        <div
          className={`text-2xl transition-all duration-300 ${
            shiftDirection === 'left' ? 'text-red-500 scale-150' : 'text-warm-400'
          }`}
        >
          ←
        </div>
      </div>

      <div className="absolute right-2 sm:-right-8 top-1/2 -translate-y-1/2 z-10">
        <div
          className={`text-2xl transition-all duration-300 ${
            shiftDirection === 'right' ? 'text-green-500 scale-150' : 'text-warm-400'
          }`}
        >
          →
        </div>
      </div>

      {/* Main simulation container */}
      <div className="relative">
        <ParticleSimulation
          container={{
            width: 300,
            height: 180,
            backgroundColor: '#0f172a',
            borderColor: containerBorderColor,
            borderWidth: shiftDirection ? 4 : 2,
          }}
          particleTypes={particleTypes}
          particles={[
            { typeId: 'R', count: adjustedReactants },
            { typeId: 'P', count: adjustedProducts },
          ]}
          physics={{
            ...PHYSICS_PRESETS.realGas,
            speedMultiplier: 0.8,
            enableCollisions: true,
          }}
          temperature={300}
          running={running}
          showLabels={false}
          ariaLabel={`Kvikt jafnvægi: ${adjustedReactants} eindir hvarfefna og ${adjustedProducts} eindir myndefna`}
        />

        {/* Thermodynamics indicator */}
        {isExothermic !== null && (
          <div className="absolute top-2 right-2 text-xs">
            <span className={isExothermic ? 'text-red-400' : 'text-blue-400'}>
              {isExothermic ? '🔥 Útvermið' : '❄️ Innvermið'}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-2 flex justify-center gap-6 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-warm-600">Hvarfefni ({adjustedReactants})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-warm-600">Myndefni ({adjustedProducts})</span>
        </div>
      </div>

      {/* Equilibrium status */}
      {shiftDirection && (
        <div
          className={`mt-2 text-center text-sm font-semibold ${
            shiftDirection === 'right'
              ? 'text-green-600'
              : shiftDirection === 'left'
                ? 'text-red-600'
                : 'text-warm-600'
          }`}
        >
          {shiftDirection === 'right' && '→ Hliðrun til hægri'}
          {shiftDirection === 'left' && '← Hliðrun til vinstri'}
          {shiftDirection === 'none' && '⇌ Engin hliðrun'}
        </div>
      )}
    </div>
  );
}
