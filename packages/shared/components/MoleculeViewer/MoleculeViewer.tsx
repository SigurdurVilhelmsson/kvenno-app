/**
 * MoleculeViewer - A standardized wrapper for displaying molecules
 *
 * Provides a consistent dark background for optimal visibility of all atom types,
 * especially hydrogen (white/light gray) and carbon.
 *
 * Usage:
 * ```tsx
 * <MoleculeViewer molecule={molecule} size="lg" />
 * ```
 */

import { AnimatedMolecule } from '../AnimatedMolecule';
import type { AnimatedMoleculeProps } from '@shared/types';

export interface MoleculeViewerProps extends Omit<AnimatedMoleculeProps, 'className'> {
  /** Additional CSS class for outer container */
  containerClassName?: string;
  /** Show molecule name/formula below */
  showLabel?: boolean;
  /** Custom label text (overrides molecule name/formula) */
  label?: string;
  /** Label position */
  labelPosition?: 'above' | 'below';
  /** Container variant */
  variant?: 'default' | 'compact' | 'card';
}

export function MoleculeViewer({
  molecule,
  containerClassName = '',
  showLabel = false,
  label,
  labelPosition = 'below',
  variant = 'default',
  ...moleculeProps
}: MoleculeViewerProps) {
  const displayLabel = label || molecule.name || molecule.formula;

  // Variant-specific styling
  const variantStyles = {
    default: 'bg-slate-900 rounded-xl p-4',
    compact: 'bg-slate-900 rounded-lg p-2',
    card: 'bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-700',
  };

  const labelStyles = {
    default: 'text-slate-200 text-sm font-medium',
    compact: 'text-slate-300 text-xs',
    card: 'text-white text-lg font-semibold',
  };

  return (
    <div
      className={`molecule-viewer flex flex-col items-center ${variantStyles[variant]} ${containerClassName}`}
    >
      {showLabel && labelPosition === 'above' && (
        <div className={`mb-2 ${labelStyles[variant]}`}>
          {displayLabel}
        </div>
      )}

      <div className="flex items-center justify-center">
        <AnimatedMolecule
          molecule={molecule}
          {...moleculeProps}
        />
      </div>

      {showLabel && labelPosition === 'below' && (
        <div className={`mt-2 ${labelStyles[variant]}`}>
          {displayLabel}
        </div>
      )}
    </div>
  );
}

/**
 * MoleculeViewerGrid - Display multiple molecules in a grid
 */
export interface MoleculeViewerGridProps {
  molecules: AnimatedMoleculeProps['molecule'][];
  columns?: 2 | 3 | 4;
  size?: AnimatedMoleculeProps['size'];
  mode?: AnimatedMoleculeProps['mode'];
  showLabels?: boolean;
  className?: string;
}

export function MoleculeViewerGrid({
  molecules,
  columns = 3,
  size = 'sm',
  mode = 'simple',
  showLabels = true,
  className = '',
}: MoleculeViewerGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {molecules.map((molecule) => (
        <MoleculeViewer
          key={molecule.id}
          molecule={molecule}
          size={size}
          mode={mode}
          variant="compact"
          showLabel={showLabels}
        />
      ))}
    </div>
  );
}
