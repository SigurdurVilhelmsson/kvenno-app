export { ParticleSimulation } from './ParticleSimulation';
export { useParticleSimulation, calculateAverageKE, temperatureFromKE } from './useParticleSimulation';
export {
  PARTICLE_TYPES,
  PHYSICS_PRESETS,
  CONTAINER_PRESETS,
  createGasSimulation,
  createGasMixture,
  createKineticsSimulation,
  createEquilibriumSimulation
} from './presets';
export type {
  ParticleType,
  Particle,
  ContainerConfig,
  PhysicsConfig,
  ParticleGroup,
  ReactionConfig,
  RegionHighlight,
  ParticleSimulationProps,
  SimulationPreset,
  SimulationControls,
  EnhancedRenderingConfig,
  CollisionFlash
} from './types';
