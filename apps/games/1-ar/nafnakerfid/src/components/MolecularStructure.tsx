import { useMemo } from 'react';
import { Compound } from '../data/compounds';

interface MolecularStructureProps {
  compound: Compound;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
}

// Atom visual properties - colors based on CPK coloring convention
const ATOM_COLORS: Record<string, { fill: string; border: string; textColor: string }> = {
  // Common elements
  H: { fill: '#FFFFFF', border: '#CBD5E1', textColor: '#374151' },
  C: { fill: '#333333', border: '#1F2937', textColor: '#FFFFFF' },
  N: { fill: '#3B82F6', border: '#2563EB', textColor: '#FFFFFF' },
  O: { fill: '#EF4444', border: '#DC2626', textColor: '#FFFFFF' },
  F: { fill: '#22C55E', border: '#16A34A', textColor: '#FFFFFF' },
  Cl: { fill: '#22C55E', border: '#16A34A', textColor: '#FFFFFF' },
  Br: { fill: '#92400E', border: '#78350F', textColor: '#FFFFFF' },
  I: { fill: '#7C3AED', border: '#6D28D9', textColor: '#FFFFFF' },
  S: { fill: '#EAB308', border: '#CA8A04', textColor: '#1F2937' },
  P: { fill: '#F97316', border: '#EA580C', textColor: '#FFFFFF' },

  // Metals
  Na: { fill: '#8B5CF6', border: '#7C3AED', textColor: '#FFFFFF' },
  K: { fill: '#EC4899', border: '#DB2777', textColor: '#FFFFFF' },
  Li: { fill: '#A855F7', border: '#9333EA', textColor: '#FFFFFF' },
  Mg: { fill: '#14B8A6', border: '#0D9488', textColor: '#FFFFFF' },
  Ca: { fill: '#F97316', border: '#EA580C', textColor: '#FFFFFF' },
  Ba: { fill: '#10B981', border: '#059669', textColor: '#FFFFFF' },
  Al: { fill: '#A1A1AA', border: '#71717A', textColor: '#FFFFFF' },
  Fe: { fill: '#B45309', border: '#92400E', textColor: '#FFFFFF' },
  Cu: { fill: '#D97706', border: '#B45309', textColor: '#FFFFFF' },
  Zn: { fill: '#6B7280', border: '#4B5563', textColor: '#FFFFFF' },
  Ag: { fill: '#C0C0C0', border: '#9CA3AF', textColor: '#374151' },
  Pb: { fill: '#4B5563', border: '#374151', textColor: '#FFFFFF' },
  Hg: { fill: '#71717A', border: '#52525B', textColor: '#FFFFFF' },
  Sn: { fill: '#9CA3AF', border: '#6B7280', textColor: '#374151' },
  Mn: { fill: '#A78BFA', border: '#8B5CF6', textColor: '#FFFFFF' },
  Cr: { fill: '#06B6D4', border: '#0891B2', textColor: '#FFFFFF' },
  Co: { fill: '#3B82F6', border: '#2563EB', textColor: '#FFFFFF' },
  Ni: { fill: '#10B981', border: '#059669', textColor: '#FFFFFF' },
  Xe: { fill: '#38BDF8', border: '#0EA5E9', textColor: '#1F2937' },
};

// Default color for unknown elements
const DEFAULT_COLOR = { fill: '#9CA3AF', border: '#6B7280', textColor: '#FFFFFF' };

// Parse formula to extract element counts
function parseFormula(formula: string): Array<{ symbol: string; count: number }> {
  // Replace subscript numbers with regular numbers
  const normalized = formula
    .replace(/₀/g, '0').replace(/₁/g, '1').replace(/₂/g, '2')
    .replace(/₃/g, '3').replace(/₄/g, '4').replace(/₅/g, '5')
    .replace(/₆/g, '6').replace(/₇/g, '7').replace(/₈/g, '8')
    .replace(/₉/g, '9')
    // Remove brackets and their multipliers for simplified display
    .replace(/[()[\]·]/g, '');

  const result: Array<{ symbol: string; count: number }> = [];

  // Match element symbols followed by optional numbers
  const regex = /([A-Z][a-z]?)(\d*)/g;
  let match;

  while ((match = regex.exec(normalized)) !== null) {
    const symbol = match[1];
    const count = match[2] ? parseInt(match[2], 10) : 1;

    // Skip if symbol is empty
    if (!symbol) continue;

    // Merge with existing element or add new
    const existing = result.find(e => e.symbol === symbol);
    if (existing) {
      existing.count += count;
    } else {
      result.push({ symbol, count });
    }
  }

  return result;
}

// Size configurations
const SIZE_CONFIG = {
  small: { atomSize: 20, fontSize: 'text-[8px]', gap: 1, maxAtoms: 8 },
  medium: { atomSize: 28, fontSize: 'text-[10px]', gap: 2, maxAtoms: 10 },
  large: { atomSize: 36, fontSize: 'text-xs', gap: 3, maxAtoms: 12 },
};

// Single atom component
function Atom({
  symbol,
  size,
  showLabel
}: {
  symbol: string;
  size: number;
  showLabel: boolean;
}) {
  const colors = ATOM_COLORS[symbol] || DEFAULT_COLOR;

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: colors.fill,
        borderColor: colors.border,
        borderWidth: 2,
        color: colors.textColor,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset 0 -2px 4px rgba(0,0,0,0.1)',
      }}
    >
      {showLabel && (
        <span className="leading-none" style={{ fontSize: size * 0.35 }}>
          {symbol}
        </span>
      )}
    </div>
  );
}

/**
 * Visual molecular structure component
 * Displays atoms as colored circles based on the compound formula
 */
export function MolecularStructure({
  compound,
  size = 'medium',
  showLabels = true
}: MolecularStructureProps) {
  const config = SIZE_CONFIG[size];

  const atoms = useMemo(() => {
    const parsed = parseFormula(compound.formula);
    const result: string[] = [];

    // Flatten to individual atoms, respecting max limit
    for (const { symbol, count } of parsed) {
      const atomsToAdd = Math.min(count, config.maxAtoms - result.length);
      for (let i = 0; i < atomsToAdd && result.length < config.maxAtoms; i++) {
        result.push(symbol);
      }
    }

    return result;
  }, [compound.formula, config.maxAtoms]);

  const totalParsed = useMemo(() => {
    return parseFormula(compound.formula).reduce((sum, el) => sum + el.count, 0);
  }, [compound.formula]);

  const hasMore = totalParsed > atoms.length;

  // Arrange atoms in a visually pleasing layout
  // For ionic compounds: show metal/nonmetal grouping
  // For molecular compounds: show connected structure
  const isIonic = compound.type === 'ionic';

  if (atoms.length === 0) {
    return null;
  }

  // For small displays, use a simple flex wrap
  if (size === 'small') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-0.5">
        {atoms.map((symbol, idx) => (
          <Atom key={idx} symbol={symbol} size={config.atomSize} showLabel={showLabels} />
        ))}
        {hasMore && (
          <span className="text-gray-400 text-[8px] ml-1">+{totalParsed - atoms.length}</span>
        )}
      </div>
    );
  }

  // For medium/large, try to show structure
  // Group by element type for ionic compounds
  if (isIonic) {
    const metals = atoms.filter(s => !['O', 'Cl', 'F', 'Br', 'I', 'S', 'N', 'H', 'C', 'P'].includes(s));
    const nonmetals = atoms.filter(s => ['O', 'Cl', 'F', 'Br', 'I', 'S', 'N', 'H', 'C', 'P'].includes(s));

    return (
      <div className="flex items-center justify-center gap-2">
        {/* Metal atoms */}
        {metals.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-0.5">
            {metals.map((symbol, idx) => (
              <Atom key={`m-${idx}`} symbol={symbol} size={config.atomSize} showLabel={showLabels} />
            ))}
          </div>
        )}

        {/* Separator for ionic */}
        {metals.length > 0 && nonmetals.length > 0 && (
          <div className="flex flex-col items-center">
            <div className="text-gray-400 text-xs">⁺</div>
            <div className="text-gray-400 text-xs">⁻</div>
          </div>
        )}

        {/* Nonmetal atoms */}
        {nonmetals.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-0.5">
            {nonmetals.map((symbol, idx) => (
              <Atom key={`n-${idx}`} symbol={symbol} size={config.atomSize} showLabel={showLabels} />
            ))}
          </div>
        )}

        {hasMore && (
          <span className="text-gray-400 text-xs">+{totalParsed - atoms.length}</span>
        )}
      </div>
    );
  }

  // Molecular compounds - show as connected cluster
  return (
    <div className="flex flex-wrap items-center justify-center" style={{ gap: config.gap }}>
      {atoms.map((symbol, idx) => (
        <Atom key={idx} symbol={symbol} size={config.atomSize} showLabel={showLabels} />
      ))}
      {hasMore && (
        <span className="text-gray-400 text-xs ml-1">+{totalParsed - atoms.length}</span>
      )}
    </div>
  );
}

/**
 * Compact badge showing element composition
 */
export function ElementBadges({ compound, size = 'small' }: { compound: Compound; size?: 'small' | 'medium' }) {
  const elements = parseFormula(compound.formula);

  const badgeSize = size === 'small' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <div className="flex flex-wrap gap-1 justify-center">
      {elements.slice(0, 4).map(({ symbol, count }) => {
        const colors = ATOM_COLORS[symbol] || DEFAULT_COLOR;
        return (
          <span
            key={symbol}
            className={`rounded-full font-semibold ${badgeSize}`}
            style={{
              backgroundColor: colors.fill,
              color: colors.textColor,
              borderColor: colors.border,
              borderWidth: 1,
            }}
          >
            {symbol}{count > 1 ? `×${count}` : ''}
          </span>
        );
      })}
    </div>
  );
}

// ============== STRUCTURAL FORMULA COMPONENT ==============

// Predefined molecular structures with atom positions and bonds
interface AtomPosition {
  symbol: string;
  x: number;
  y: number;
}

interface Bond {
  from: number; // index of atom
  to: number;   // index of atom
  type: 1 | 2 | 3; // single, double, triple
}

interface MolecularStructureData {
  atoms: AtomPosition[];
  bonds: Bond[];
  width: number;
  height: number;
}

// Predefined structures for common molecules
const STRUCTURAL_FORMULAS: Record<string, MolecularStructureData> = {
  // Water: H-O-H (bent shape)
  'H₂O': {
    atoms: [
      { symbol: 'H', x: 15, y: 20 },
      { symbol: 'O', x: 50, y: 35 },
      { symbol: 'H', x: 85, y: 20 },
    ],
    bonds: [
      { from: 0, to: 1, type: 1 },
      { from: 1, to: 2, type: 1 },
    ],
    width: 100,
    height: 55,
  },
  // Carbon dioxide: O=C=O (linear)
  'CO₂': {
    atoms: [
      { symbol: 'O', x: 15, y: 30 },
      { symbol: 'C', x: 50, y: 30 },
      { symbol: 'O', x: 85, y: 30 },
    ],
    bonds: [
      { from: 0, to: 1, type: 2 },
      { from: 1, to: 2, type: 2 },
    ],
    width: 100,
    height: 60,
  },
  // Ammonia: NH₃ (trigonal pyramidal shown as flat)
  'NH₃': {
    atoms: [
      { symbol: 'N', x: 50, y: 25 },
      { symbol: 'H', x: 20, y: 50 },
      { symbol: 'H', x: 50, y: 55 },
      { symbol: 'H', x: 80, y: 50 },
    ],
    bonds: [
      { from: 0, to: 1, type: 1 },
      { from: 0, to: 2, type: 1 },
      { from: 0, to: 3, type: 1 },
    ],
    width: 100,
    height: 70,
  },
  // Methane: CH₄ (tetrahedral shown as flat)
  'CH₄': {
    atoms: [
      { symbol: 'C', x: 50, y: 35 },
      { symbol: 'H', x: 50, y: 10 },
      { symbol: 'H', x: 20, y: 50 },
      { symbol: 'H', x: 80, y: 50 },
      { symbol: 'H', x: 50, y: 60 },
    ],
    bonds: [
      { from: 0, to: 1, type: 1 },
      { from: 0, to: 2, type: 1 },
      { from: 0, to: 3, type: 1 },
      { from: 0, to: 4, type: 1 },
    ],
    width: 100,
    height: 70,
  },
  // Hydrogen: H-H
  'H₂': {
    atoms: [
      { symbol: 'H', x: 25, y: 30 },
      { symbol: 'H', x: 75, y: 30 },
    ],
    bonds: [
      { from: 0, to: 1, type: 1 },
    ],
    width: 100,
    height: 60,
  },
  // Oxygen: O=O
  'O₂': {
    atoms: [
      { symbol: 'O', x: 25, y: 30 },
      { symbol: 'O', x: 75, y: 30 },
    ],
    bonds: [
      { from: 0, to: 1, type: 2 },
    ],
    width: 100,
    height: 60,
  },
  // Nitrogen: N≡N
  'N₂': {
    atoms: [
      { symbol: 'N', x: 25, y: 30 },
      { symbol: 'N', x: 75, y: 30 },
    ],
    bonds: [
      { from: 0, to: 1, type: 3 },
    ],
    width: 100,
    height: 60,
  },
  // Chlorine: Cl-Cl
  'Cl₂': {
    atoms: [
      { symbol: 'Cl', x: 25, y: 30 },
      { symbol: 'Cl', x: 75, y: 30 },
    ],
    bonds: [
      { from: 0, to: 1, type: 1 },
    ],
    width: 100,
    height: 60,
  },
  // Hydrogen chloride: H-Cl
  'HCl': {
    atoms: [
      { symbol: 'H', x: 25, y: 30 },
      { symbol: 'Cl', x: 75, y: 30 },
    ],
    bonds: [
      { from: 0, to: 1, type: 1 },
    ],
    width: 100,
    height: 60,
  },
  // Sodium chloride (ionic - shown with charges)
  'NaCl': {
    atoms: [
      { symbol: 'Na', x: 30, y: 30 },
      { symbol: 'Cl', x: 70, y: 30 },
    ],
    bonds: [], // Ionic - no covalent bonds
    width: 100,
    height: 60,
  },
  // Sodium hydroxide
  'NaOH': {
    atoms: [
      { symbol: 'Na', x: 20, y: 30 },
      { symbol: 'O', x: 55, y: 30 },
      { symbol: 'H', x: 85, y: 30 },
    ],
    bonds: [
      { from: 1, to: 2, type: 1 },
    ],
    width: 100,
    height: 60,
  },
  // Sulfur dioxide: O=S=O
  'SO₂': {
    atoms: [
      { symbol: 'O', x: 15, y: 30 },
      { symbol: 'S', x: 50, y: 30 },
      { symbol: 'O', x: 85, y: 30 },
    ],
    bonds: [
      { from: 0, to: 1, type: 2 },
      { from: 1, to: 2, type: 2 },
    ],
    width: 100,
    height: 60,
  },
  // Calcium oxide (ionic)
  'CaO': {
    atoms: [
      { symbol: 'Ca', x: 30, y: 30 },
      { symbol: 'O', x: 70, y: 30 },
    ],
    bonds: [],
    width: 100,
    height: 60,
  },
  // Magnesium oxide (ionic)
  'MgO': {
    atoms: [
      { symbol: 'Mg', x: 30, y: 30 },
      { symbol: 'O', x: 70, y: 30 },
    ],
    bonds: [],
    width: 100,
    height: 60,
  },
  // Calcium chloride (ionic)
  'CaCl₂': {
    atoms: [
      { symbol: 'Cl', x: 15, y: 30 },
      { symbol: 'Ca', x: 50, y: 30 },
      { symbol: 'Cl', x: 85, y: 30 },
    ],
    bonds: [],
    width: 100,
    height: 60,
  },
  // Potassium bromide (ionic)
  'KBr': {
    atoms: [
      { symbol: 'K', x: 30, y: 30 },
      { symbol: 'Br', x: 70, y: 30 },
    ],
    bonds: [],
    width: 100,
    height: 60,
  },
  // Lithium fluoride (ionic)
  'LiF': {
    atoms: [
      { symbol: 'Li', x: 30, y: 30 },
      { symbol: 'F', x: 70, y: 30 },
    ],
    bonds: [],
    width: 100,
    height: 60,
  },
  // Potassium chloride (ionic)
  'KCl': {
    atoms: [
      { symbol: 'K', x: 30, y: 30 },
      { symbol: 'Cl', x: 70, y: 30 },
    ],
    bonds: [],
    width: 100,
    height: 60,
  },
  // Barium oxide (ionic)
  'BaO': {
    atoms: [
      { symbol: 'Ba', x: 30, y: 30 },
      { symbol: 'O', x: 70, y: 30 },
    ],
    bonds: [],
    width: 100,
    height: 60,
  },
  // Sodium fluoride (ionic)
  'NaF': {
    atoms: [
      { symbol: 'Na', x: 30, y: 30 },
      { symbol: 'F', x: 70, y: 30 },
    ],
    bonds: [],
    width: 100,
    height: 60,
  },
  // Sodium oxide (ionic)
  'Na₂O': {
    atoms: [
      { symbol: 'Na', x: 15, y: 30 },
      { symbol: 'O', x: 50, y: 30 },
      { symbol: 'Na', x: 85, y: 30 },
    ],
    bonds: [],
    width: 100,
    height: 60,
  },
  // Magnesium chloride (ionic)
  'MgCl₂': {
    atoms: [
      { symbol: 'Cl', x: 15, y: 30 },
      { symbol: 'Mg', x: 50, y: 30 },
      { symbol: 'Cl', x: 85, y: 30 },
    ],
    bonds: [],
    width: 100,
    height: 60,
  },
  // Aluminum chloride
  'AlCl₃': {
    atoms: [
      { symbol: 'Cl', x: 20, y: 15 },
      { symbol: 'Al', x: 50, y: 35 },
      { symbol: 'Cl', x: 20, y: 55 },
      { symbol: 'Cl', x: 80, y: 35 },
    ],
    bonds: [],
    width: 100,
    height: 70,
  },
  // Lithium oxide (ionic)
  'Li₂O': {
    atoms: [
      { symbol: 'Li', x: 15, y: 30 },
      { symbol: 'O', x: 50, y: 30 },
      { symbol: 'Li', x: 85, y: 30 },
    ],
    bonds: [],
    width: 100,
    height: 60,
  },
  // Zinc oxide (ionic)
  'ZnO': {
    atoms: [
      { symbol: 'Zn', x: 30, y: 30 },
      { symbol: 'O', x: 70, y: 30 },
    ],
    bonds: [],
    width: 100,
    height: 60,
  },
  // Silver chloride (ionic)
  'AgCl': {
    atoms: [
      { symbol: 'Ag', x: 30, y: 30 },
      { symbol: 'Cl', x: 70, y: 30 },
    ],
    bonds: [],
    width: 100,
    height: 60,
  },
  // Hydrogen bromide: H-Br
  'HBr': {
    atoms: [
      { symbol: 'H', x: 25, y: 30 },
      { symbol: 'Br', x: 75, y: 30 },
    ],
    bonds: [
      { from: 0, to: 1, type: 1 },
    ],
    width: 100,
    height: 60,
  },
  // Hydrogen fluoride: H-F
  'HF': {
    atoms: [
      { symbol: 'H', x: 25, y: 30 },
      { symbol: 'F', x: 75, y: 30 },
    ],
    bonds: [
      { from: 0, to: 1, type: 1 },
    ],
    width: 100,
    height: 60,
  },
  // Sulfur trioxide: O=S=O with third O
  'SO₃': {
    atoms: [
      { symbol: 'S', x: 50, y: 30 },
      { symbol: 'O', x: 20, y: 50 },
      { symbol: 'O', x: 80, y: 50 },
      { symbol: 'O', x: 50, y: 10 },
    ],
    bonds: [
      { from: 0, to: 1, type: 2 },
      { from: 0, to: 2, type: 1 },
      { from: 0, to: 3, type: 1 },
    ],
    width: 100,
    height: 60,
  },
};

interface StructuralFormulaProps {
  formula: string;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  /** Show charge indicators for ionic compounds */
  showCharges?: boolean;
}

/**
 * Structural formula component showing atoms with bonds
 * For molecules with predefined structures, shows actual bond arrangement
 * Falls back to simple display for unknown structures
 */
export function StructuralFormula({
  formula,
  size = 'medium',
  showLabels = true,
  showCharges = true,
}: StructuralFormulaProps) {
  const structure = STRUCTURAL_FORMULAS[formula];

  const sizeConfig = {
    small: { scale: 0.6, atomRadius: 10, fontSize: 8, bondWidth: 2 },
    medium: { scale: 0.9, atomRadius: 14, fontSize: 10, bondWidth: 2.5 },
    large: { scale: 1.2, atomRadius: 18, fontSize: 12, bondWidth: 3 },
  };

  const config = sizeConfig[size];

  // If no predefined structure, return null (use MolecularStructure instead)
  if (!structure) {
    return null;
  }

  const svgWidth = structure.width * config.scale;
  const svgHeight = structure.height * config.scale;

  // Check if ionic (no bonds)
  const isIonic = structure.bonds.length === 0 && structure.atoms.length >= 2;

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${structure.width} ${structure.height}`}
      className="mx-auto"
    >
      {/* Draw bonds */}
      {structure.bonds.map((bond, idx) => {
        const from = structure.atoms[bond.from];
        const to = structure.atoms[bond.to];

        // Calculate bond line positions
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / len; // normalized
        const ny = dy / len;

        // Offset to not overlap with atoms
        const offset = config.atomRadius * 0.8;
        const x1 = from.x + nx * offset;
        const y1 = from.y + ny * offset;
        const x2 = to.x - nx * offset;
        const y2 = to.y - ny * offset;

        // Perpendicular offset for multiple bonds
        const perpX = -ny * 3;
        const perpY = nx * 3;

        if (bond.type === 1) {
          return (
            <line
              key={idx}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#374151"
              strokeWidth={config.bondWidth}
              strokeLinecap="round"
            />
          );
        } else if (bond.type === 2) {
          return (
            <g key={idx}>
              <line
                x1={x1 + perpX}
                y1={y1 + perpY}
                x2={x2 + perpX}
                y2={y2 + perpY}
                stroke="#374151"
                strokeWidth={config.bondWidth}
                strokeLinecap="round"
              />
              <line
                x1={x1 - perpX}
                y1={y1 - perpY}
                x2={x2 - perpX}
                y2={y2 - perpY}
                stroke="#374151"
                strokeWidth={config.bondWidth}
                strokeLinecap="round"
              />
            </g>
          );
        } else {
          // Triple bond
          return (
            <g key={idx}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#374151"
                strokeWidth={config.bondWidth}
                strokeLinecap="round"
              />
              <line
                x1={x1 + perpX * 1.5}
                y1={y1 + perpY * 1.5}
                x2={x2 + perpX * 1.5}
                y2={y2 + perpY * 1.5}
                stroke="#374151"
                strokeWidth={config.bondWidth}
                strokeLinecap="round"
              />
              <line
                x1={x1 - perpX * 1.5}
                y1={y1 - perpY * 1.5}
                x2={x2 - perpX * 1.5}
                y2={y2 - perpY * 1.5}
                stroke="#374151"
                strokeWidth={config.bondWidth}
                strokeLinecap="round"
              />
            </g>
          );
        }
      })}

      {/* Draw ionic bond indicator (dashed line) */}
      {isIonic && structure.atoms.length >= 2 && (
        <line
          x1={structure.atoms[0].x + config.atomRadius}
          y1={structure.atoms[0].y}
          x2={structure.atoms[1].x - config.atomRadius}
          y2={structure.atoms[1].y}
          stroke="#9CA3AF"
          strokeWidth={config.bondWidth}
          strokeDasharray="4,3"
          strokeLinecap="round"
        />
      )}

      {/* Draw atoms */}
      {structure.atoms.map((atom, idx) => {
        const colors = ATOM_COLORS[atom.symbol] || DEFAULT_COLOR;

        // Determine charge for ionic compounds
        let charge = '';
        if (isIonic && showCharges) {
          const metals = ['Na', 'K', 'Li', 'Ca', 'Mg', 'Ba', 'Al', 'Fe', 'Cu', 'Zn', 'Ag'];
          if (metals.includes(atom.symbol)) {
            charge = '+';
            if (['Ca', 'Mg', 'Ba', 'Zn', 'Fe', 'Cu'].includes(atom.symbol)) charge = '²⁺';
            if (atom.symbol === 'Al') charge = '³⁺';
          } else if (['O'].includes(atom.symbol)) {
            charge = '²⁻';
          } else if (['Cl', 'F', 'Br', 'I'].includes(atom.symbol)) {
            charge = '⁻';
          }
        }

        return (
          <g key={idx}>
            {/* Atom circle */}
            <circle
              cx={atom.x}
              cy={atom.y}
              r={config.atomRadius}
              fill={colors.fill}
              stroke={colors.border}
              strokeWidth={2}
            />
            {/* Atom label */}
            {showLabels && (
              <text
                x={atom.x}
                y={atom.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={colors.textColor}
                fontSize={config.fontSize}
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {atom.symbol}
              </text>
            )}
            {/* Charge indicator */}
            {charge && (
              <text
                x={atom.x + config.atomRadius * 0.7}
                y={atom.y - config.atomRadius * 0.5}
                textAnchor="start"
                fill="#374151"
                fontSize={config.fontSize * 0.8}
                fontWeight="bold"
              >
                {charge}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

interface CompoundVisualizationProps {
  compound: Compound;
  size?: 'small' | 'medium' | 'large';
  /** Prefer structural formula over ball model */
  preferStructural?: boolean;
  showLabels?: boolean;
}

/**
 * Smart compound visualization that chooses the best representation
 * Uses structural formula for known molecules, falls back to ball model
 */
export function CompoundVisualization({
  compound,
  size = 'medium',
  preferStructural = true,
  showLabels = true,
}: CompoundVisualizationProps) {
  const hasStructuralFormula = STRUCTURAL_FORMULAS[compound.formula] !== undefined;

  if (preferStructural && hasStructuralFormula) {
    return (
      <StructuralFormula
        formula={compound.formula}
        size={size}
        showLabels={showLabels}
      />
    );
  }

  return (
    <MolecularStructure
      compound={compound}
      size={size}
      showLabels={showLabels}
    />
  );
}
