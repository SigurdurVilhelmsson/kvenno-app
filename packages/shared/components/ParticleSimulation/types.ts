/**
 * ParticleSimulation Types
 *
 * A reusable particle simulation component for chemistry visualizations:
 * - Gas behavior (PVT relationships, kinetic theory)
 * - Chemical reactions (collisions, equilibrium)
 * - Solutions (dissolution, Brownian motion)
 */

/** Configuration for a particle type */
export interface ParticleType {
  /** Unique identifier */
  id: string;
  /** Display color */
  color: string;
  /** Particle radius in pixels */
  radius?: number;
  /** Optional label (e.g., "H₂", "O₂") */
  label?: string;
  /** Border/stroke color */
  strokeColor?: string;
  /** Mass (affects collision behavior) */
  mass?: number;
}

/** Individual particle state */
export interface Particle {
  id: string;
  typeId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  strokeColor?: string;
  mass: number;
  /** For reaction tracking */
  reacted?: boolean;
  /** Energy level (for activation energy visualization) */
  energy?: number;
}

/** Container configuration */
export interface ContainerConfig {
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Border color */
  borderColor?: string;
  /** Border width */
  borderWidth?: number;
  /** Background color */
  backgroundColor?: string;
  /** Whether walls are elastic (particles bounce) */
  elasticWalls?: boolean;
  /** Pressure indicator (affects border appearance) */
  pressure?: 'low' | 'normal' | 'high';
}

/** Physics configuration */
export interface PhysicsConfig {
  /** Base speed multiplier (related to temperature) */
  speedMultiplier?: number;
  /** Enable particle-particle collisions */
  enableCollisions?: boolean;
  /** Gravity (0 = no gravity, positive = downward) */
  gravity?: number;
  /** Friction coefficient (0-1, 0 = no friction) */
  friction?: number;
  /** Energy threshold for reactions */
  activationEnergy?: number;
}

/** Particle group for initialization */
export interface ParticleGroup {
  /** Particle type ID */
  typeId: string;
  /** Number of particles */
  count: number;
  /** Initial speed (or use default from temperature) */
  initialSpeed?: number;
  /** Spawn region (defaults to entire container) */
  spawnRegion?: {
    xMin?: number;
    xMax?: number;
    yMin?: number;
    yMax?: number;
  };
}

/** Reaction definition for collision-based reactions */
export interface ReactionConfig {
  /** Reactant type IDs */
  reactants: [string, string];
  /** Product type IDs */
  products: string[];
  /** Minimum energy required for reaction */
  activationEnergy?: number;
  /** Probability of reaction on collision (0-1) */
  probability?: number;
  /** Callback when reaction occurs */
  onReaction?: (reactant1: Particle, reactant2: Particle) => void;
}

/** Region highlight (e.g., for activation energy barrier) */
export interface RegionHighlight {
  /** Y position for horizontal region */
  yMin?: number;
  yMax?: number;
  /** X position for vertical region */
  xMin?: number;
  xMax?: number;
  /** Region color */
  color: string;
  /** Label */
  label?: string;
}

/** Main component props */
export interface ParticleSimulationProps {
  /** Container configuration */
  container: ContainerConfig;
  /** Particle types available */
  particleTypes: ParticleType[];
  /** Initial particle groups */
  particles: ParticleGroup[];
  /** Physics configuration */
  physics?: PhysicsConfig;
  /** Reaction definitions */
  reactions?: ReactionConfig[];
  /** Region highlights */
  regions?: RegionHighlight[];
  /** Whether simulation is running */
  running?: boolean;
  /** Temperature (affects particle speed, 0-1000 K typical) */
  temperature?: number;
  /** Callback when particle counts change */
  onParticleCountChange?: (counts: Record<string, number>) => void;
  /** Callback on each frame (for external state sync) */
  onFrame?: (particles: Particle[]) => void;
  /** Show particle labels */
  showLabels?: boolean;
  /** Show velocity vectors */
  showVelocityVectors?: boolean;
  /** Accessibility label */
  ariaLabel?: string;
  /** CSS class name */
  className?: string;
}

/** Preset configurations for common scenarios */
export type SimulationPreset =
  | 'gas-simple'      // Basic gas particles
  | 'gas-mixture'     // Two types of gas
  | 'kinetics'        // Collision with activation energy
  | 'equilibrium'     // Forward/reverse reactions
  | 'dissolution'     // Solute dissolving
  | 'brownian';       // Brownian motion

/** Hook return type for controlling simulation */
export interface SimulationControls {
  /** Start/resume simulation */
  start: () => void;
  /** Pause simulation */
  pause: () => void;
  /** Reset to initial state */
  reset: () => void;
  /** Add particles dynamically */
  addParticles: (group: ParticleGroup) => void;
  /** Remove particles by type */
  removeParticles: (typeId: string, count: number) => void;
  /** Set temperature */
  setTemperature: (temp: number) => void;
  /** Get current particle counts */
  getParticleCounts: () => Record<string, number>;
  /** Current running state */
  isRunning: boolean;
}
