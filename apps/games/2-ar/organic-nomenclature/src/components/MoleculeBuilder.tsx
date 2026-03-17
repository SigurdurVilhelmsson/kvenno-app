import { useState, useCallback } from 'react';

/**
 * MoleculeBuilder
 *
 * Interactive component for building hydrocarbon molecules by:
 * 1. Adding/removing carbon atoms to chain
 * 2. Clicking bonds to cycle through single → double → triple
 * 3. Toggling methyl (-CH₃) branches on interior carbons
 * 4. Auto-generating IUPAC names based on structure
 */

type BondType = 'single' | 'double' | 'triple';

interface Bond {
  position: number; // Position in chain (1-indexed, bond between C(position) and C(position+1))
  type: BondType;
}

// Prefix map for carbon count
const PREFIXES: Record<number, string> = {
  1: 'meth',
  2: 'eth',
  3: 'prop',
  4: 'but',
  5: 'pent',
  6: 'hex',
  7: 'hept',
  8: 'oct',
  9: 'non',
  10: 'dec',
};

// Multiplier prefixes for branch count
const BRANCH_MULTIPLIERS: Record<number, string> = {
  1: '',
  2: 'dí',
  3: 'trí',
  4: 'tetra',
  5: 'penta',
  6: 'hexa',
  7: 'hepta',
  8: 'okta',
};

interface MoleculeBuilderProps {
  onNameGenerated?: (name: string, formula: string) => void;
  compact?: boolean;
  maxCarbons?: number;
  initialCarbons?: number;
}

export function MoleculeBuilder({
  onNameGenerated,
  compact = false,
  maxCarbons = 10,
  initialCarbons = 4,
}: MoleculeBuilderProps) {
  const [carbonCount, setCarbonCount] = useState(initialCarbons);
  const [bonds, setBonds] = useState<Bond[]>(() => {
    // Initialize all single bonds
    return Array.from({ length: initialCarbons - 1 }, (_, i) => ({
      position: i + 1,
      type: 'single' as BondType,
    }));
  });
  const [branches, setBranches] = useState<number[]>([]);
  const [showFormula, setShowFormula] = useState(true);

  // Check if a carbon position is eligible for a branch (interior carbons only)
  const canHaveBranch = (position: number): boolean => {
    return position >= 2 && position <= carbonCount - 1;
  };

  // Toggle a methyl branch at a given carbon position
  const toggleBranch = (position: number) => {
    if (!canHaveBranch(position)) return;

    setBranches((prev) => {
      if (prev.includes(position)) {
        return prev.filter((p) => p !== position);
      }
      return [...prev, position].sort((a, b) => a - b);
    });
  };

  // Update bonds when carbon count changes
  const updateCarbonCount = (newCount: number) => {
    if (newCount < 2 || newCount > maxCarbons) return;

    setCarbonCount(newCount);

    if (newCount > carbonCount) {
      // Adding carbons - add new single bonds
      const newBonds = [...bonds];
      for (let i = carbonCount; i < newCount; i++) {
        newBonds.push({ position: i, type: 'single' });
      }
      setBonds(newBonds);
    } else {
      // Removing carbons - remove bonds
      setBonds(bonds.filter((b) => b.position < newCount));
    }

    // Remove branches at positions that are no longer valid
    setBranches((prev) => prev.filter((p) => p >= 2 && p <= newCount - 1));
  };

  // Cycle bond type: single → double → triple → single
  const cycleBond = (position: number) => {
    setBonds((prev) =>
      prev.map((bond) => {
        if (bond.position !== position) return bond;

        const nextType: BondType =
          bond.type === 'single' ? 'double' : bond.type === 'double' ? 'triple' : 'single';

        return { ...bond, type: nextType };
      })
    );
  };

  // Helper for subscript numbers
  const subscript = (n: number): string => {
    const subscripts: Record<string, string> = {
      '0': '₀',
      '1': '₁',
      '2': '₂',
      '3': '₃',
      '4': '₄',
      '5': '₅',
      '6': '₆',
      '7': '₇',
      '8': '₈',
      '9': '₉',
    };
    return String(n)
      .split('')
      .map((d) => subscripts[d] || d)
      .join('');
  };

  // Helper to get bond order value
  const bondValue = (bondType: BondType): number => {
    return bondType === 'single' ? 1 : bondType === 'double' ? 2 : 3;
  };

  // Calculate molecular formula
  const calculateFormula = useCallback(() => {
    // Total carbons = main chain + branches
    const totalCarbons = carbonCount + branches.length;

    // Count hydrogen atoms on the main chain
    let hydrogenCount = 0;

    // First carbon
    const firstBond = bonds.find((b) => b.position === 1);
    const firstBondVal = firstBond ? bondValue(firstBond.type) : 0;
    const firstHasBranch = branches.includes(1); // Should never happen, but guard
    hydrogenCount += 4 - firstBondVal - (firstHasBranch ? 1 : 0);

    // Middle carbons
    for (let i = 2; i < carbonCount; i++) {
      const leftBond = bonds.find((b) => b.position === i - 1);
      const rightBond = bonds.find((b) => b.position === i);

      const leftVal = leftBond ? bondValue(leftBond.type) : 0;
      const rightVal = rightBond ? bondValue(rightBond.type) : 0;
      const hasBranch = branches.includes(i);

      // A branch takes one bond slot (single bond to CH₃)
      hydrogenCount += 4 - leftVal - rightVal - (hasBranch ? 1 : 0);
    }

    // Last carbon
    const lastBond = bonds.find((b) => b.position === carbonCount - 1);
    const lastBondVal = lastBond ? bondValue(lastBond.type) : 0;
    const lastHasBranch = branches.includes(carbonCount); // Should never happen
    hydrogenCount += 4 - lastBondVal - (lastHasBranch ? 1 : 0);

    // Each branch CH₃ contributes 3 hydrogens
    hydrogenCount += branches.length * 3;

    return `C${totalCarbons > 1 ? '₋' + subscript(totalCarbons) : ''}H${subscript(hydrogenCount)}`;
  }, [carbonCount, bonds, branches]);

  // Generate IUPAC name
  const generateName = useCallback(() => {
    const prefix = PREFIXES[carbonCount] || `C${carbonCount}`;

    // Find unsaturated bonds
    const doubleBonds = bonds.filter((b) => b.type === 'double');
    const tripleBonds = bonds.filter((b) => b.type === 'triple');

    // Build base name (suffix)
    let baseName: string;
    if (tripleBonds.length > 0) {
      const position = tripleBonds[0].position;
      if (carbonCount >= 4) {
        baseName = `${position}-${prefix}yn`;
      } else {
        baseName = `${prefix}yn`;
      }
    } else if (doubleBonds.length > 0) {
      const position = doubleBonds[0].position;
      if (carbonCount >= 4) {
        baseName = `${position}-${prefix}en`;
      } else {
        baseName = `${prefix}en`;
      }
    } else {
      baseName = `${prefix}an`;
    }

    // Add branch prefix if branches exist
    if (branches.length > 0) {
      const sortedPositions = [...branches].sort((a, b) => a - b);
      const positionStr = sortedPositions.join(',');
      const multiplier = BRANCH_MULTIPLIERS[branches.length] || '';
      return `${positionStr}-${multiplier}metýl${baseName}`;
    }

    return baseName;
  }, [carbonCount, bonds, branches]);

  // Get compound type
  const getCompoundType = () => {
    const hasTriple = bonds.some((b) => b.type === 'triple');
    const hasDouble = bonds.some((b) => b.type === 'double');
    const hasBranches = branches.length > 0;

    if (hasTriple)
      return { type: 'alkyne', label: hasBranches ? 'Greinótt alkýn' : 'Alkýn', color: 'purple' };
    if (hasDouble)
      return { type: 'alkene', label: hasBranches ? 'Greinótt alkén' : 'Alkén', color: 'green' };
    return { type: 'alkane', label: hasBranches ? 'Greinótt alkan' : 'Alkan', color: 'gray' };
  };

  const name = generateName();
  const formula = calculateFormula();
  const compound = getCompoundType();

  // Notify parent of name changes
  if (onNameGenerated) {
    onNameGenerated(name, formula);
  }

  const atomSize = compact ? 32 : 44;
  const bondLength = compact ? 40 : 56;
  const bondHeight = compact ? 4 : 6;
  const branchBondHeight = compact ? 24 : 36;
  const branchAtomSize = compact ? 26 : 34;

  return (
    <div
      className={`${compact ? 'p-3' : 'p-4'} bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-bold text-emerald-800 ${compact ? 'text-sm' : 'text-base'}`}>
          Sameindasmiður
        </h3>
        <label className="flex items-center gap-1.5 text-xs text-warm-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showFormula}
            onChange={(e) => setShowFormula(e.target.checked)}
            className="rounded border-warm-300"
          />
          Sýna formúlu
        </label>
      </div>

      {/* Carbon chain visualization */}
      <div className="bg-warm-900 rounded-xl p-4 mb-4 overflow-x-auto">
        <div
          className="flex items-end justify-center min-w-fit"
          style={{ gap: 0, paddingTop: branchBondHeight + branchAtomSize + 8 }}
        >
          {Array.from({ length: carbonCount }).map((_, i) => {
            const carbonPosition = i + 1;
            const hasBranch = branches.includes(carbonPosition);
            const isEligible = canHaveBranch(carbonPosition);

            return (
              <div key={i} className="flex items-end">
                {/* Carbon atom column with branch above */}
                <div className="flex flex-col items-center">
                  {/* Branch area (above the carbon) */}
                  <div
                    className="flex flex-col items-center"
                    style={{
                      height: branchBondHeight + branchAtomSize + 8,
                      justifyContent: 'flex-end',
                    }}
                  >
                    {hasBranch ? (
                      <>
                        {/* Branch CH₃ atom */}
                        <div className="relative">
                          <div
                            className="flex items-center justify-center rounded-full bg-teal-700 border-2 border-teal-400 text-teal-100 font-bold select-none"
                            style={{
                              width: branchAtomSize,
                              height: branchAtomSize,
                              fontSize: branchAtomSize * 0.32,
                            }}
                          >
                            CH₃
                          </div>
                          {/* Remove branch button */}
                          <button
                            onClick={() => toggleBranch(carbonPosition)}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 text-white text-[10px] flex items-center justify-center leading-none transition-colors"
                            aria-label="Fjarlægja grein"
                          >
                            ×
                          </button>
                        </div>
                        {/* Vertical bond line */}
                        <div
                          className="bg-teal-400 rounded-full"
                          style={{
                            width: 3,
                            height: branchBondHeight,
                          }}
                        />
                      </>
                    ) : isEligible ? (
                      /* Add branch button */
                      <button
                        onClick={() => toggleBranch(carbonPosition)}
                        className="w-6 h-6 rounded-full bg-teal-600/40 hover:bg-teal-500/60 text-teal-300 text-sm font-bold flex items-center justify-center transition-colors mb-1"
                        style={{ marginTop: 'auto' }}
                        aria-label={`Bæta við grein á C${carbonPosition}`}
                        title="Grein"
                      >
                        +
                      </button>
                    ) : null}
                  </div>

                  {/* Carbon atom */}
                  <div
                    className={`flex items-center justify-center rounded-full border-2 text-white font-bold select-none ${
                      hasBranch ? 'bg-warm-700 border-teal-400' : 'bg-warm-700 border-warm-500'
                    }`}
                    style={{ width: atomSize, height: atomSize, fontSize: atomSize * 0.4 }}
                  >
                    C{carbonPosition}
                  </div>
                </div>

                {/* Bond (if not last carbon) */}
                {i < carbonCount - 1 && (
                  <button
                    onClick={() => cycleBond(i + 1)}
                    className="relative flex flex-col justify-center items-center hover:scale-110 focus-visible:scale-110 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:outline-none rounded transition-transform cursor-pointer group"
                    style={{ width: bondLength, height: atomSize }}
                    aria-label={`Tenging ${i + 1}–${i + 2}: ${bonds.find((b) => b.position === i + 1)?.type === 'single' ? 'einföld' : bonds.find((b) => b.position === i + 1)?.type === 'double' ? 'tvöföld' : 'þreföld'}. Smelltu til að breyta.`}
                  >
                    {/* Bond lines */}
                    {(() => {
                      const bond = bonds.find((b) => b.position === i + 1);
                      const bondType = bond?.type || 'single';

                      if (bondType === 'single') {
                        return (
                          <div
                            className="bg-warm-400 group-hover:bg-warm-300 rounded-full"
                            style={{ width: '100%', height: bondHeight }}
                          />
                        );
                      }

                      if (bondType === 'double') {
                        return (
                          <>
                            <div
                              className="bg-green-400 group-hover:bg-green-300 rounded-full"
                              style={{ width: '100%', height: bondHeight, marginBottom: 4 }}
                            />
                            <div
                              className="bg-green-400 group-hover:bg-green-300 rounded-full"
                              style={{ width: '100%', height: bondHeight }}
                            />
                          </>
                        );
                      }

                      // Triple bond
                      return (
                        <>
                          <div
                            className="bg-purple-400 group-hover:bg-purple-300 rounded-full"
                            style={{ width: '100%', height: bondHeight - 1, marginBottom: 2 }}
                          />
                          <div
                            className="bg-purple-400 group-hover:bg-purple-300 rounded-full"
                            style={{ width: '100%', height: bondHeight - 1, marginBottom: 2 }}
                          />
                          <div
                            className="bg-purple-400 group-hover:bg-purple-300 rounded-full"
                            style={{ width: '100%', height: bondHeight - 1 }}
                          />
                        </>
                      );
                    })()}

                    {/* Bond type indicator */}
                    <div className="absolute -bottom-5 text-[10px] text-warm-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {bonds.find((b) => b.position === i + 1)?.type === 'single'
                        ? 'ein'
                        : bonds.find((b) => b.position === i + 1)?.type === 'double'
                          ? 'tví'
                          : 'þrí'}
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex justify-center gap-4 text-xs text-warm-400">
          <span className="flex items-center gap-1">
            <span className="w-4 h-1 bg-warm-400 rounded" /> ein
          </span>
          <span className="flex items-center gap-1">
            <span className="flex flex-col gap-0.5">
              <span className="w-4 h-0.5 bg-green-400 rounded" />
              <span className="w-4 h-0.5 bg-green-400 rounded" />
            </span>
            tví
          </span>
          <span className="flex items-center gap-1">
            <span className="flex flex-col gap-0.5">
              <span className="w-4 h-0.5 bg-purple-400 rounded" />
              <span className="w-4 h-0.5 bg-purple-400 rounded" />
              <span className="w-4 h-0.5 bg-purple-400 rounded" />
            </span>
            þrí
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-teal-700 border border-teal-400" />
            grein
          </span>
        </div>
      </div>

      {/* Carbon count controls */}
      <div className="flex justify-center items-center gap-4 mb-4">
        <button
          onClick={() => updateCarbonCount(carbonCount - 1)}
          disabled={carbonCount <= 2}
          className={`w-12 h-12 rounded-full font-bold text-xl transition-all ${
            carbonCount > 2
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-warm-200 text-warm-400 cursor-not-allowed'
          }`}
        >
          -
        </button>

        <div className="text-center px-4">
          <div className="text-xl font-bold text-warm-800">{carbonCount}</div>
          <div className="text-xs text-warm-500">kolefni</div>
        </div>

        <button
          onClick={() => updateCarbonCount(carbonCount + 1)}
          disabled={carbonCount >= maxCarbons}
          className={`w-12 h-12 rounded-full font-bold text-xl transition-all ${
            carbonCount < maxCarbons
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-warm-200 text-warm-400 cursor-not-allowed'
          }`}
        >
          +
        </button>
      </div>

      {/* Result panel */}
      <div
        className={`bg-white rounded-xl p-4 border-2 ${
          compound.color === 'green'
            ? 'border-green-300'
            : compound.color === 'purple'
              ? 'border-purple-300'
              : 'border-warm-300'
        }`}
      >
        <div className="flex justify-between items-center mb-2">
          <span
            className={`text-sm font-medium px-2 py-0.5 rounded ${
              compound.color === 'green'
                ? 'bg-green-100 text-green-700'
                : compound.color === 'purple'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-warm-100 text-warm-700'
            }`}
          >
            {compound.label}
          </span>
          {showFormula && <span className="font-mono text-warm-600">{formula}</span>}
        </div>

        <div
          className={`text-center text-2xl font-bold ${
            compound.color === 'green'
              ? 'text-green-600'
              : compound.color === 'purple'
                ? 'text-purple-600'
                : 'text-warm-700'
          }`}
        >
          {name}
        </div>

        <div className="mt-2 text-center text-xs text-warm-500">
          {branches.length > 0 && (
            <span>
              {branches.length} {branches.length === 1 ? 'metýlgrein' : 'metýlgreinar'}
              {' • '}
            </span>
          )}
          {bonds.some((b) => b.type === 'double')
            ? `Tvítengi á stað ${bonds.find((b) => b.type === 'double')?.position}`
            : bonds.some((b) => b.type === 'triple')
              ? `Þrítengi á stað ${bonds.find((b) => b.type === 'triple')?.position}`
              : 'Öll tengi eru einföld'}
        </div>
      </div>

      {/* Instructions */}
      <div className={`mt-3 text-center ${compact ? 'text-xs' : 'text-sm'} text-warm-600`}>
        <p>
          <strong>+/-</strong> bætir við/fjarlægir kolefni • <strong>Smelltu á tengingu</strong> til
          að breyta • <strong className="text-teal-700">+</strong> bætir við metýlgrein
        </p>
      </div>
    </div>
  );
}

export default MoleculeBuilder;
