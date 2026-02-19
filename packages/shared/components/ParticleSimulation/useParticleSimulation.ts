import { useState, useCallback, useRef } from 'react';
import type { ParticleGroup, SimulationControls, Particle } from './types';

/**
 * Hook for controlling a ParticleSimulation component
 *
 * Usage:
 * ```tsx
 * const controls = useParticleSimulation();
 *
 * <ParticleSimulation
 *   running={controls.isRunning}
 *   temperature={controls.temperature}
 *   // ... other props
 * />
 *
 * <button onClick={controls.start}>Start</button>
 * <button onClick={controls.pause}>Pause</button>
 * ```
 */
export function useParticleSimulation(initialTemperature = 300): SimulationControls & {
  temperature: number;
  particleCounts: Record<string, number>;
  setParticleCounts: (counts: Record<string, number>) => void;
} {
  const [isRunning, setIsRunning] = useState(true);
  const [temperature, setTemperatureState] = useState(initialTemperature);
  const [particleCounts, setParticleCounts] = useState<Record<string, number>>({});

  // Ref for external particle manipulation (requires component support)
  const addQueueRef = useRef<ParticleGroup[]>([]);
  const removeQueueRef = useRef<{ typeId: string; count: number }[]>([]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    // This triggers re-initialization in the component
    setIsRunning(false);
    setTimeout(() => setIsRunning(true), 0);
  }, []);

  const addParticles = useCallback((group: ParticleGroup) => {
    addQueueRef.current.push(group);
  }, []);

  const removeParticles = useCallback((typeId: string, count: number) => {
    removeQueueRef.current.push({ typeId, count });
  }, []);

  const setTemperature = useCallback((temp: number) => {
    setTemperatureState(Math.max(0, temp));
  }, []);

  const getParticleCounts = useCallback(() => {
    return { ...particleCounts };
  }, [particleCounts]);

  return {
    isRunning,
    temperature,
    particleCounts,
    setParticleCounts,
    start,
    pause,
    reset,
    addParticles,
    removeParticles,
    setTemperature,
    getParticleCounts
  };
}

/**
 * Calculate average kinetic energy from particles
 */
export function calculateAverageKE(particles: Particle[]): number {
  if (particles.length === 0) return 0;
  const totalKE = particles.reduce((sum, p) => {
    return sum + 0.5 * p.mass * (p.vx * p.vx + p.vy * p.vy);
  }, 0);
  return totalKE / particles.length;
}

/**
 * Calculate temperature from average kinetic energy
 * (Simplified: T proportional to KE)
 */
export function temperatureFromKE(avgKE: number): number {
  return avgKE * 100; // Simplified conversion
}
