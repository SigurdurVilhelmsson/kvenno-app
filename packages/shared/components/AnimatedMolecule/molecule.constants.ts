/**
 * Constants for molecule visualization
 */

import type { ElementVisual, MolecularGeometry, Position3D } from '@shared/types';

/**
 * Element visual properties - colors based on CPK coloring convention
 * with adjustments for educational clarity
 */
export const ELEMENT_VISUALS: Record<string, ElementVisual> = {
  // Common elements - H and C have stroke colors for visibility on any background
  H:  { color: '#F3F4F6', radius: 0.6, name: 'Hydrogen', mass: 1.008, strokeColor: '#9CA3AF' },
  C:  { color: '#4B5563', radius: 1.0, name: 'Carbon', mass: 12.011, strokeColor: '#D1D5DB' },
  N:  { color: '#3B82F6', radius: 0.95, name: 'Nitrogen', mass: 14.007 },
  O:  { color: '#EF4444', radius: 0.9, name: 'Oxygen', mass: 15.999 },
  F:  { color: '#84CC16', radius: 0.7, name: 'Fluorine', mass: 18.998 },

  // Halogens
  Cl: { color: '#22C55E', radius: 1.15, name: 'Chlorine', mass: 35.453 },
  Br: { color: '#991B1B', radius: 1.25, name: 'Bromine', mass: 79.904 },
  I:  { color: '#7C3AED', radius: 1.4, name: 'Iodine', mass: 126.904 },

  // Alkali metals
  Li: { color: '#A855F7', radius: 1.2, name: 'Lithium', mass: 6.941 },
  Na: { color: '#8B5CF6', radius: 1.5, name: 'Sodium', mass: 22.990 },
  K:  { color: '#EC4899', radius: 1.8, name: 'Potassium', mass: 39.098 },

  // Alkaline earth metals
  Be: { color: '#A3E635', radius: 0.9, name: 'Beryllium', mass: 9.012 },
  Mg: { color: '#14B8A6', radius: 1.3, name: 'Magnesium', mass: 24.305 },
  Ca: { color: '#F97316', radius: 1.6, name: 'Calcium', mass: 40.078 },

  // Other common elements
  S:  { color: '#EAB308', radius: 1.2, name: 'Sulfur', mass: 32.065 },
  P:  { color: '#F59E0B', radius: 1.1, name: 'Phosphorus', mass: 30.974 },
  Si: { color: '#D4A574', radius: 1.15, name: 'Silicon', mass: 28.086 },

  // Metals
  Al: { color: '#A1A1AA', radius: 1.25, name: 'Aluminum', mass: 26.982 },
  Fe: { color: '#78716C', radius: 1.3, name: 'Iron', mass: 55.845 },
  Cu: { color: '#B45309', radius: 1.28, name: 'Copper', mass: 63.546 },
  Zn: { color: '#71717A', radius: 1.35, name: 'Zinc', mass: 65.38 },
  Ag: { color: '#C0C0C0', radius: 1.45, name: 'Silver', mass: 107.868 },
  Au: { color: '#FFD700', radius: 1.44, name: 'Gold', mass: 196.967 },

  // Noble gases
  He: { color: '#00FFFF', radius: 0.5, name: 'Helium', mass: 4.003 },
  Ne: { color: '#FF6347', radius: 0.7, name: 'Neon', mass: 20.180 },
  Ar: { color: '#00CED1', radius: 1.0, name: 'Argon', mass: 39.948 },
};

/**
 * Default element visual for unknown elements
 */
export const DEFAULT_ELEMENT_VISUAL: ElementVisual = {
  color: '#9CA3AF',
  radius: 1.0,
  name: 'Unknown',
  mass: 0,
};

/**
 * Size configurations for different component sizes
 */
export const SIZE_CONFIG = {
  sm: {
    width: 120,
    height: 120,
    atomRadius: 14,
    bondWidth: 2,
    fontSize: 10,
  },
  md: {
    width: 180,
    height: 180,
    atomRadius: 20,
    bondWidth: 3,
    fontSize: 12,
  },
  lg: {
    width: 240,
    height: 240,
    atomRadius: 26,
    bondWidth: 4,
    fontSize: 14,
  },
  xl: {
    width: 320,
    height: 320,
    atomRadius: 32,
    bondWidth: 5,
    fontSize: 16,
  },
} as const;

/**
 * Bond styling constants
 */
export const BOND_STYLES = {
  single: {
    lines: 1,
    gap: 0,
  },
  double: {
    lines: 2,
    gap: 4,
  },
  triple: {
    lines: 3,
    gap: 3,
  },
} as const;

/**
 * Animation duration defaults (in milliseconds)
 */
export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 400,
  slow: 600,
  build: 800,
} as const;

/**
 * VSEPR geometry coordinates for 3D positioning
 * All coordinates are normalized to fit within [-1, 1] range
 */
export const GEOMETRY_COORDS: Record<MolecularGeometry, Position3D[]> = {
  'linear': [
    { x: -1, y: 0, z: 0 },
    { x: 1, y: 0, z: 0 },
  ],
  'bent': [
    { x: -0.7, y: -0.5, z: 0 },
    { x: 0.7, y: -0.5, z: 0 },
  ],
  'trigonal-planar': [
    { x: 0, y: -1, z: 0 },
    { x: -0.87, y: 0.5, z: 0 },
    { x: 0.87, y: 0.5, z: 0 },
  ],
  'trigonal-pyramidal': [
    { x: 0, y: -0.8, z: 0.3 },
    { x: -0.7, y: 0.4, z: 0.3 },
    { x: 0.7, y: 0.4, z: 0.3 },
  ],
  'tetrahedral': [
    { x: 0, y: -0.9, z: 0.3 },
    { x: -0.85, y: 0.3, z: 0.3 },
    { x: 0.85, y: 0.3, z: 0.3 },
    { x: 0, y: 0.3, z: -0.9 },
  ],
  'see-saw': [
    { x: -1, y: 0, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 0, y: -0.8, z: 0.3 },
    { x: 0, y: 0.8, z: -0.3 },
  ],
  't-shaped': [
    { x: -1, y: 0, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 0, y: -1, z: 0 },
  ],
  'square-planar': [
    { x: 0, y: -1, z: 0 },
    { x: -1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 1, y: 0, z: 0 },
  ],
  'trigonal-bipyramidal': [
    { x: 0, y: -1, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: -0.87, y: 0, z: 0.3 },
    { x: 0.87, y: 0, z: 0.3 },
    { x: 0, y: 0, z: -1 },
  ],
  'square-pyramidal': [
    { x: 0, y: -1, z: 0 },
    { x: -0.8, y: 0.3, z: 0.3 },
    { x: 0.8, y: 0.3, z: 0.3 },
    { x: -0.8, y: 0.3, z: -0.6 },
    { x: 0.8, y: 0.3, z: -0.6 },
  ],
  'octahedral': [
    { x: 0, y: -1, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: -1, y: 0, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: -1 },
  ],
};

/**
 * Colors for various UI elements
 */
export const MOLECULE_COLORS = {
  // Bond colors
  bond: '#374151',
  bondHighlight: '#3B82F6',
  bondPolar: '#6366F1',

  // Charge colors
  formalChargePositive: '#EF4444',
  formalChargeNegative: '#3B82F6',
  partialChargePositive: '#F97316',
  partialChargeNegative: '#0EA5E9',

  // Lone pair color
  lonePair: '#6B7280',

  // Radical electron color
  radical: '#EF4444',

  // Highlight colors
  atomHighlight: '#FCD34D',

  // Dipole arrow
  dipole: '#8B5CF6',
} as const;

/**
 * Lone pair positioning angles (in degrees) for different atom positions
 */
export const LONE_PAIR_ANGLES = {
  // For atoms at different positions relative to central atom
  top: [225, 315],      // Lone pairs below the atom
  bottom: [45, 135],    // Lone pairs above the atom
  left: [315, 45],      // Lone pairs to the right
  right: [135, 225],    // Lone pairs to the left
  center: [0, 90, 180, 270], // For central atoms with multiple lone pairs
} as const;
