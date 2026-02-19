/**
 * Molecule visualization types for AnimatedMolecule component
 */

/**
 * 2D position for atom placement
 */
export interface Position2D {
  x: number;
  y: number;
}

/**
 * 3D position for VSEPR geometry calculations
 */
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Bond types supported by the component
 */
export type BondType = 'single' | 'double' | 'triple';

/**
 * Partial charge indicators for polar molecules
 */
export type PartialCharge = 'positive' | 'negative' | 'none';

/**
 * VSEPR molecular geometry types
 */
export type MolecularGeometry =
  | 'linear'
  | 'bent'
  | 'trigonal-planar'
  | 'trigonal-pyramidal'
  | 'tetrahedral'
  | 'see-saw'
  | 't-shaped'
  | 'square-planar'
  | 'trigonal-bipyramidal'
  | 'square-pyramidal'
  | 'octahedral';

/**
 * Element visual properties for rendering
 */
export interface ElementVisual {
  /** Hex color code for the element */
  color: string;
  /** Relative radius (1.0 = standard) */
  radius: number;
  /** Element name */
  name?: string;
  /** Atomic mass (g/mol) */
  mass?: number;
  /** Optional stroke/border color for better visibility */
  strokeColor?: string;
}

/**
 * Individual atom in a molecule
 */
export interface MoleculeAtom {
  /** Unique identifier for the atom */
  id: string;
  /** Element symbol (e.g., 'C', 'O', 'H') */
  symbol: string;
  /** Optional position - if not provided, auto-calculated based on bonds/geometry */
  position?: Position2D;
  /** Number of lone pairs (for Lewis structures) */
  lonePairs?: number;
  /** Formal charge on the atom */
  formalCharge?: number;
  /** Partial charge for polar molecules */
  partialCharge?: PartialCharge;
  /** Whether this atom has an unpaired electron (radical) */
  isRadical?: boolean;
  /** Optional label (e.g., atom number for organic nomenclature) */
  label?: string;
  /** Whether this atom should be highlighted */
  highlight?: boolean;
}

/**
 * Bond between two atoms
 */
export interface MoleculeBond {
  /** ID of the first atom */
  from: string;
  /** ID of the second atom */
  to: string;
  /** Bond type */
  type: BondType;
  /** Whether the bond is polar */
  polar?: boolean;
  /** Whether this bond should be highlighted */
  highlight?: boolean;
}

/**
 * Dipole moment direction
 */
export interface DipoleMoment {
  /** Direction of the dipole arrow */
  direction: 'up' | 'down' | 'left' | 'right';
  /** Optional magnitude (for display) */
  magnitude?: number;
}

/**
 * Complete molecule definition
 */
export interface Molecule {
  /** Unique identifier */
  id: string;
  /** Chemical formula (e.g., 'H₂O', 'CO₂') */
  formula: string;
  /** Optional name */
  name?: string;
  /** Atoms in the molecule */
  atoms: MoleculeAtom[];
  /** Bonds between atoms */
  bonds: MoleculeBond[];
  /** VSEPR geometry (optional, for automatic positioning) */
  geometry?: MolecularGeometry;
  /** Whether the molecule is polar */
  isPolar?: boolean;
  /** Net dipole moment direction */
  dipoleMoment?: DipoleMoment;
  /** Carbon chain length (for organic molecules) */
  carbonChainLength?: number;
}

/**
 * Rendering mode for the AnimatedMolecule component
 */
export type MoleculeRenderMode = 'simple' | 'lewis' | 'vsepr' | 'organic';

/**
 * Size variants for the component
 */
export type MoleculeSizeVariant = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Animation types supported
 */
export type MoleculeAnimationType = 'none' | 'fade-in' | 'scale-in' | 'build';

/**
 * Click event payload for interactive molecules
 */
export interface MoleculeClickEvent {
  type: 'atom' | 'bond';
  atomId?: string;
  bondIndex?: number;
  atom?: MoleculeAtom;
  bond?: MoleculeBond;
}

/**
 * Props for the AnimatedMolecule component
 */
export interface AnimatedMoleculeProps {
  /** The molecule to render */
  molecule: Molecule;
  /** Rendering mode */
  mode?: MoleculeRenderMode;
  /** Size variant */
  size?: MoleculeSizeVariant;
  /** Animation type */
  animation?: MoleculeAnimationType;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Show lone pairs (Lewis mode) */
  showLonePairs?: boolean;
  /** Show formal charges */
  showFormalCharges?: boolean;
  /** Show partial charges (delta+/delta-) */
  showPartialCharges?: boolean;
  /** Show dipole moment arrow */
  showDipoleMoment?: boolean;
  /** Show atom labels/numbers */
  showAtomLabels?: boolean;
  /** Enable click interactions */
  interactive?: boolean;
  /** Callback when an atom is clicked */
  onAtomClick?: (event: MoleculeClickEvent) => void;
  /** Callback when a bond is clicked */
  onBondClick?: (event: MoleculeClickEvent) => void;
  /** Array of atom IDs to highlight */
  highlightedAtoms?: string[];
  /** Array of bond indices to highlight */
  highlightedBonds?: number[];
  /** Additional CSS class */
  className?: string;
  /** Override reduced motion preference */
  reducedMotion?: boolean;
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** Callback when all animations complete */
  onAnimationComplete?: () => void;
}
