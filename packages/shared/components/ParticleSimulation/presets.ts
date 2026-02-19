import type {
  ParticleType,
  ParticleGroup,
  PhysicsConfig,
  ContainerConfig,
  ReactionConfig
} from './types';

/**
 * Preset particle types for common chemistry scenarios
 */
export const PARTICLE_TYPES = {
  // Gas molecules
  hydrogen: {
    id: 'H2',
    color: '#60a5fa',
    radius: 3,
    label: 'H₂',
    mass: 2
  },
  oxygen: {
    id: 'O2',
    color: '#ef4444',
    radius: 4,
    label: 'O₂',
    mass: 32
  },
  nitrogen: {
    id: 'N2',
    color: '#a855f7',
    radius: 4,
    label: 'N₂',
    mass: 28
  },
  water: {
    id: 'H2O',
    color: '#06b6d4',
    radius: 3,
    label: 'H₂O',
    mass: 18
  },
  carbonDioxide: {
    id: 'CO2',
    color: '#6b7280',
    radius: 5,
    label: 'CO₂',
    mass: 44
  },
  ammonia: {
    id: 'NH3',
    color: '#22c55e',
    radius: 3,
    label: 'NH₃',
    mass: 17
  },
  // Generic particles
  reactantA: {
    id: 'A',
    color: '#f97316',
    radius: 5,
    label: 'A',
    strokeColor: '#c2410c',
    mass: 1
  },
  reactantB: {
    id: 'B',
    color: '#3b82f6',
    radius: 5,
    label: 'B',
    strokeColor: '#1d4ed8',
    mass: 1
  },
  productC: {
    id: 'C',
    color: '#22c55e',
    radius: 6,
    label: 'C',
    strokeColor: '#15803d',
    mass: 2
  },
  // Solution particles
  solute: {
    id: 'solute',
    color: '#f59e0b',
    radius: 4,
    label: 'solute',
    mass: 1
  },
  solvent: {
    id: 'solvent',
    color: '#60a5fa',
    radius: 3,
    label: '',
    mass: 1
  },
  ion: {
    id: 'ion',
    color: '#ec4899',
    radius: 3,
    label: '+',
    mass: 1
  }
} as const satisfies Record<string, ParticleType>;

/**
 * Preset physics configurations
 */
export const PHYSICS_PRESETS = {
  // Ideal gas behavior
  idealGas: {
    speedMultiplier: 1,
    enableCollisions: false,
    gravity: 0,
    friction: 0
  } as PhysicsConfig,

  // Gas with collisions (more realistic)
  realGas: {
    speedMultiplier: 1,
    enableCollisions: true,
    gravity: 0,
    friction: 0
  } as PhysicsConfig,

  // Kinetics with activation energy
  kinetics: {
    speedMultiplier: 1.5,
    enableCollisions: true,
    gravity: 0,
    friction: 0,
    activationEnergy: 50
  } as PhysicsConfig,

  // Solution/liquid behavior
  solution: {
    speedMultiplier: 0.5,
    enableCollisions: true,
    gravity: 0,
    friction: 0.01
  } as PhysicsConfig,

  // Brownian motion
  brownian: {
    speedMultiplier: 0.3,
    enableCollisions: true,
    gravity: 0,
    friction: 0.02
  } as PhysicsConfig,

  // Settling/precipitation
  settling: {
    speedMultiplier: 0.5,
    enableCollisions: true,
    gravity: 0.05,
    friction: 0.01
  } as PhysicsConfig
};

/**
 * Preset container configurations
 */
export const CONTAINER_PRESETS = {
  small: {
    width: 300,
    height: 200,
    borderColor: '#374151',
    borderWidth: 2,
    backgroundColor: '#1e293b'
  } as ContainerConfig,

  medium: {
    width: 400,
    height: 300,
    borderColor: '#374151',
    borderWidth: 2,
    backgroundColor: '#1e293b'
  } as ContainerConfig,

  large: {
    width: 500,
    height: 350,
    borderColor: '#374151',
    borderWidth: 2,
    backgroundColor: '#1e293b'
  } as ContainerConfig,

  flask: {
    width: 300,
    height: 400,
    borderColor: '#64748b',
    borderWidth: 3,
    backgroundColor: '#0f172a'
  } as ContainerConfig
};

/**
 * Create a simple gas simulation preset
 */
export function createGasSimulation(
  particleCount: number = 30
): {
  container: ContainerConfig;
  particleTypes: ParticleType[];
  particles: ParticleGroup[];
  physics: PhysicsConfig;
} {
  return {
    container: CONTAINER_PRESETS.medium,
    particleTypes: [PARTICLE_TYPES.reactantA],
    particles: [{ typeId: 'A', count: particleCount }],
    physics: PHYSICS_PRESETS.idealGas
  };
}

/**
 * Create a gas mixture simulation
 */
export function createGasMixture(
  typeACounts: number = 20,
  typeBCounts: number = 20
): {
  container: ContainerConfig;
  particleTypes: ParticleType[];
  particles: ParticleGroup[];
  physics: PhysicsConfig;
} {
  return {
    container: CONTAINER_PRESETS.medium,
    particleTypes: [PARTICLE_TYPES.reactantA, PARTICLE_TYPES.reactantB],
    particles: [
      { typeId: 'A', count: typeACounts },
      { typeId: 'B', count: typeBCounts }
    ],
    physics: PHYSICS_PRESETS.realGas
  };
}

/**
 * Create a kinetics simulation with reactions
 */
export function createKineticsSimulation(
  reactantCount: number = 30,
  activationEnergy: number = 50
): {
  container: ContainerConfig;
  particleTypes: ParticleType[];
  particles: ParticleGroup[];
  physics: PhysicsConfig;
  reactions: ReactionConfig[];
} {
  return {
    container: CONTAINER_PRESETS.large,
    particleTypes: [
      PARTICLE_TYPES.reactantA,
      PARTICLE_TYPES.reactantB,
      PARTICLE_TYPES.productC
    ],
    particles: [
      { typeId: 'A', count: reactantCount },
      { typeId: 'B', count: reactantCount }
    ],
    physics: {
      ...PHYSICS_PRESETS.kinetics,
      activationEnergy
    },
    reactions: [{
      reactants: ['A', 'B'],
      products: ['C'],
      activationEnergy,
      probability: 0.8
    }]
  };
}

/**
 * Create an equilibrium simulation (reversible reaction)
 */
export function createEquilibriumSimulation(): {
  container: ContainerConfig;
  particleTypes: ParticleType[];
  particles: ParticleGroup[];
  physics: PhysicsConfig;
  reactions: ReactionConfig[];
} {
  return {
    container: CONTAINER_PRESETS.large,
    particleTypes: [
      { id: 'N2', color: '#a855f7', radius: 5, label: 'N₂', mass: 28 },
      { id: 'H2', color: '#60a5fa', radius: 3, label: 'H₂', mass: 2 },
      { id: 'NH3', color: '#22c55e', radius: 4, label: 'NH₃', mass: 17 }
    ],
    particles: [
      { typeId: 'N2', count: 10 },
      { typeId: 'H2', count: 30 }
    ],
    physics: PHYSICS_PRESETS.kinetics,
    reactions: [
      // Forward: N₂ + 3H₂ → 2NH₃ (simplified as N₂ + H₂ → NH₃)
      {
        reactants: ['N2', 'H2'],
        products: ['NH3'],
        activationEnergy: 40,
        probability: 0.3
      }
    ]
  };
}
