import { useState, useCallback } from 'react';

/**
 * MoleculeBuilder
 *
 * Interactive component for building hydrocarbon molecules by:
 * 1. Adding/removing carbon atoms to chain
 * 2. Clicking bonds to cycle through single → double → triple
 * 3. Auto-generating IUPAC names based on structure
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
  const [showFormula, setShowFormula] = useState(true);

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
      setBonds(bonds.filter(b => b.position < newCount));
    }
  };

  // Cycle bond type: single → double → triple → single
  const cycleBond = (position: number) => {
    setBonds(prev =>
      prev.map(bond => {
        if (bond.position !== position) return bond;

        const nextType: BondType =
          bond.type === 'single' ? 'double' :
          bond.type === 'double' ? 'triple' : 'single';

        return { ...bond, type: nextType };
      })
    );
  };

  // Calculate molecular formula
  const calculateFormula = useCallback(() => {
    // Count hydrogen atoms
    // For each carbon: 4 - (bonds to other carbons)
    // Single bond = 1, double = 2, triple = 3

    let hydrogenCount = 0;

    // First carbon
    const firstBond = bonds.find(b => b.position === 1);
    const firstBondValue = firstBond
      ? firstBond.type === 'single' ? 1 : firstBond.type === 'double' ? 2 : 3
      : 0;
    hydrogenCount += 4 - firstBondValue;

    // Middle carbons
    for (let i = 2; i < carbonCount; i++) {
      const leftBond = bonds.find(b => b.position === i - 1);
      const rightBond = bonds.find(b => b.position === i);

      const leftValue = leftBond
        ? leftBond.type === 'single' ? 1 : leftBond.type === 'double' ? 2 : 3
        : 0;
      const rightValue = rightBond
        ? rightBond.type === 'single' ? 1 : rightBond.type === 'double' ? 2 : 3
        : 0;

      hydrogenCount += 4 - leftValue - rightValue;
    }

    // Last carbon
    const lastBond = bonds.find(b => b.position === carbonCount - 1);
    const lastBondValue = lastBond
      ? lastBond.type === 'single' ? 1 : lastBond.type === 'double' ? 2 : 3
      : 0;
    hydrogenCount += 4 - lastBondValue;

    return `C${carbonCount > 1 ? '₋' + subscript(carbonCount) : ''}H${subscript(hydrogenCount)}`;
  }, [carbonCount, bonds]);

  // Generate IUPAC name
  const generateName = useCallback(() => {
    const prefix = PREFIXES[carbonCount] || `C${carbonCount}`;

    // Find unsaturated bonds
    const doubleBonds = bonds.filter(b => b.type === 'double');
    const tripleBonds = bonds.filter(b => b.type === 'triple');

    // Simple naming for now (first unsaturated bond position)
    if (tripleBonds.length > 0) {
      const position = tripleBonds[0].position;
      if (carbonCount >= 4) {
        return `${position}-${prefix}yn`;
      }
      return `${prefix}yn`;
    }

    if (doubleBonds.length > 0) {
      const position = doubleBonds[0].position;
      if (carbonCount >= 4) {
        return `${position}-${prefix}en`;
      }
      return `${prefix}en`;
    }

    return `${prefix}an`;
  }, [carbonCount, bonds]);

  // Get compound type
  const getCompoundType = () => {
    const hasTriple = bonds.some(b => b.type === 'triple');
    const hasDouble = bonds.some(b => b.type === 'double');

    if (hasTriple) return { type: 'alkyne', label: 'Alkýn', color: 'purple' };
    if (hasDouble) return { type: 'alkene', label: 'Alkén', color: 'green' };
    return { type: 'alkane', label: 'Alkan', color: 'gray' };
  };

  // Helper for subscript numbers
  const subscript = (n: number): string => {
    const subscripts: Record<string, string> = {
      '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
      '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    };
    return String(n).split('').map(d => subscripts[d] || d).join('');
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

  return (
    <div className={`${compact ? 'p-3' : 'p-4'} bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-bold text-emerald-800 ${compact ? 'text-sm' : 'text-base'}`}>
          Sameindasmiður
        </h3>
        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showFormula}
            onChange={e => setShowFormula(e.target.checked)}
            className="rounded border-gray-300"
          />
          Sýna formúlu
        </label>
      </div>

      {/* Carbon chain visualization */}
      <div className="bg-slate-900 rounded-xl p-4 mb-4 overflow-x-auto">
        <div
          className="flex items-center justify-center min-w-fit"
          style={{ gap: 0 }}
        >
          {Array.from({ length: carbonCount }).map((_, i) => (
            <div key={i} className="flex items-center">
              {/* Carbon atom */}
              <div
                className="flex items-center justify-center rounded-full bg-gray-700 border-2 border-gray-500 text-white font-bold select-none"
                style={{ width: atomSize, height: atomSize, fontSize: atomSize * 0.4 }}
              >
                C{i + 1}
              </div>

              {/* Bond (if not last carbon) */}
              {i < carbonCount - 1 && (
                <button
                  onClick={() => cycleBond(i + 1)}
                  className="relative flex flex-col justify-center items-center hover:scale-110 transition-transform cursor-pointer group"
                  style={{ width: bondLength, height: atomSize }}
                  title="Smelltu til að breyta tengingu"
                >
                  {/* Bond lines */}
                  {(() => {
                    const bond = bonds.find(b => b.position === i + 1);
                    const bondType = bond?.type || 'single';

                    if (bondType === 'single') {
                      return (
                        <div
                          className="bg-gray-400 group-hover:bg-gray-300 rounded-full"
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
                  <div className="absolute -bottom-5 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {bonds.find(b => b.position === i + 1)?.type === 'single' ? 'ein' :
                     bonds.find(b => b.position === i + 1)?.type === 'double' ? 'tví' : 'þrí'}
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex justify-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-4 h-1 bg-gray-400 rounded" /> ein
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
        </div>
      </div>

      {/* Carbon count controls */}
      <div className="flex justify-center items-center gap-4 mb-4">
        <button
          onClick={() => updateCarbonCount(carbonCount - 1)}
          disabled={carbonCount <= 2}
          className={`w-10 h-10 rounded-full font-bold text-xl transition-all ${
            carbonCount > 2
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          -
        </button>

        <div className="text-center px-4">
          <div className="text-xl font-bold text-gray-800">{carbonCount}</div>
          <div className="text-xs text-gray-500">kolefni</div>
        </div>

        <button
          onClick={() => updateCarbonCount(carbonCount + 1)}
          disabled={carbonCount >= maxCarbons}
          className={`w-10 h-10 rounded-full font-bold text-xl transition-all ${
            carbonCount < maxCarbons
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          +
        </button>
      </div>

      {/* Result panel */}
      <div className={`bg-white rounded-xl p-4 border-2 ${
        compound.color === 'green' ? 'border-green-300' :
        compound.color === 'purple' ? 'border-purple-300' :
        'border-gray-300'
      }`}>
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium px-2 py-0.5 rounded ${
            compound.color === 'green' ? 'bg-green-100 text-green-700' :
            compound.color === 'purple' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {compound.label}
          </span>
          {showFormula && (
            <span className="font-mono text-gray-600">{formula}</span>
          )}
        </div>

        <div className={`text-center text-2xl font-bold ${
          compound.color === 'green' ? 'text-green-600' :
          compound.color === 'purple' ? 'text-purple-600' :
          'text-gray-700'
        }`}>
          {name}
        </div>

        <div className="mt-2 text-center text-xs text-gray-500">
          {bonds.some(b => b.type === 'double')
            ? `Tvítengi á stað ${bonds.find(b => b.type === 'double')?.position}`
            : bonds.some(b => b.type === 'triple')
            ? `Þrítengi á stað ${bonds.find(b => b.type === 'triple')?.position}`
            : 'Öll tengi eru einföld'}
        </div>
      </div>

      {/* Instructions */}
      <div className={`mt-3 text-center ${compact ? 'text-xs' : 'text-sm'} text-gray-600`}>
        <p>
          <strong>+/-</strong> bætir við/fjarlægir kolefni • <strong>Smelltu á tengingu</strong> til að breyta
        </p>
      </div>
    </div>
  );
}

export default MoleculeBuilder;
