import { useMemo } from 'react';

interface AtomElectronInfo {
  symbol: string;
  valenceElectrons: number;
  bondingElectrons: number;
  lonePairElectrons: number;
  totalElectrons: number;
}

interface OctetViolation {
  type: 'incomplete' | 'expanded' | 'odd-electron';
  atom: string;
  electrons: number;
  expected: number;
  explanation: string;
  isAllowed: boolean;
  reason?: string;
}

interface OctetViolationCheckerProps {
  /** Atom information with electron counts */
  atoms: AtomElectronInfo[];
  /** Show detailed explanations */
  showExplanations?: boolean;
  /** Compact display mode */
  compact?: boolean;
  /** Callback when violation is detected */
  onViolationDetected?: (violations: OctetViolation[]) => void;
}

// Elements that can have expanded octets (period 3+)
const EXPANDED_OCTET_ELEMENTS = ['P', 'S', 'Cl', 'Br', 'I', 'Xe', 'Si', 'As', 'Se'];

// Elements that commonly have incomplete octets
const INCOMPLETE_OCTET_ELEMENTS = ['H', 'He', 'Li', 'Be', 'B', 'Al'];

// Expected electron counts
const EXPECTED_ELECTRONS: Record<string, number> = {
  'H': 2,
  'He': 2,
  'Li': 2,
  'Be': 4,
  'B': 6,
  // Most other elements follow octet rule
  default: 8,
};

/**
 * OctetViolationChecker - Detects and explains octet rule violations
 *
 * Handles:
 * - Incomplete octets (B, Be, Al)
 * - Expanded octets (P, S, Cl in higher oxidation states)
 * - Odd-electron species (radicals like NO, NO2)
 */
export function OctetViolationChecker({
  atoms,
  showExplanations = true,
  compact = false,
  onViolationDetected,
}: OctetViolationCheckerProps) {
  // Detect violations
  const violations = useMemo(() => {
    const found: OctetViolation[] = [];

    for (const atom of atoms) {
      const expected = EXPECTED_ELECTRONS[atom.symbol] ?? EXPECTED_ELECTRONS.default;
      const total = atom.totalElectrons;

      // Check for incomplete octet
      if (total < expected) {
        const isAllowed = INCOMPLETE_OCTET_ELEMENTS.includes(atom.symbol);
        found.push({
          type: 'incomplete',
          atom: atom.symbol,
          electrons: total,
          expected,
          explanation: isAllowed
            ? `${atom.symbol} getur verið stöðugt með færri en 8 rafeindum vegna lágrar rafeindaþéttar.`
            : `${atom.symbol} hefur ${total} rafeindir en vill hafa ${expected}. Þetta getur bent til óstöðugleika.`,
          isAllowed,
          reason: isAllowed ? 'Rafeindafátækt frumefni' : undefined,
        });
      }

      // Check for expanded octet
      if (total > 8 && atom.symbol !== 'H') {
        const isAllowed = EXPANDED_OCTET_ELEMENTS.includes(atom.symbol);
        found.push({
          type: 'expanded',
          atom: atom.symbol,
          electrons: total,
          expected: 8,
          explanation: isAllowed
            ? `${atom.symbol} getur haft útvíkkað áttund (>${8} rafeindir) vegna d-svigrúms í 3. lotu eða hærri.`
            : `${atom.symbol} ætti ekki að hafa fleiri en 8 rafeindir. Athugaðu Lewis-formúluna.`,
          isAllowed,
          reason: isAllowed ? `d-svigrúm í boði (lota ≥ 3)` : undefined,
        });
      }

      // Check for odd electron count (radical)
      if (total % 2 !== 0) {
        found.push({
          type: 'odd-electron',
          atom: atom.symbol,
          electrons: total,
          expected: total + 1,
          explanation: `${atom.symbol} hefur oddatölu rafeinda (${total}). Þetta er radíkal með ópöruðu rafeind.`,
          isAllowed: true,
          reason: 'Radíkal (óparuð rafeind)',
        });
      }
    }

    // Call callback if provided
    if (found.length > 0) {
      onViolationDetected?.(found);
    }

    return found;
  }, [atoms, onViolationDetected]);

  // Determine overall status
  const hasProblems = violations.some(v => !v.isAllowed);
  const hasAllowedExceptions = violations.some(v => v.isAllowed);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        violations.length === 0
          ? 'bg-green-100 text-green-800'
          : hasProblems
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
      }`}>
        {violations.length === 0 ? (
          <>
            <span className="text-green-600">✓</span>
            <span>Áttureglan uppfyllt</span>
          </>
        ) : hasProblems ? (
          <>
            <span className="text-red-600">⚠</span>
            <span>Áttureglan brotin</span>
          </>
        ) : (
          <>
            <span className="text-yellow-600">ℹ</span>
            <span>Leyfileg undantekning</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 shadow-lg">
      <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
        <span className="text-lg">🔍</span>
        Áttureglugreining (Octet Rule Check)
      </h3>

      {/* Status indicator */}
      <div className={`p-3 rounded-lg mb-4 ${
        violations.length === 0
          ? 'bg-green-500/20 border border-green-500/40'
          : hasProblems
            ? 'bg-red-500/20 border border-red-500/40'
            : 'bg-yellow-500/20 border border-yellow-500/40'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {violations.length === 0 ? '✅' : hasProblems ? '❌' : '⚠️'}
          </span>
          <div>
            <div className={`font-bold ${
              violations.length === 0 ? 'text-green-400' : hasProblems ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {violations.length === 0
                ? 'Áttureglan uppfyllt!'
                : hasProblems
                  ? 'Áttureglan brotin'
                  : 'Leyfilegar undantekningar fundnar'}
            </div>
            <div className="text-xs text-gray-400">
              {violations.length === 0
                ? 'Öll atóm hafa réttan fjölda rafeinda.'
                : `${violations.length} ${violations.length === 1 ? 'undantekning' : 'undantekningar'} fundnar.`}
            </div>
          </div>
        </div>
      </div>

      {/* Atom electron counts */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Rafeindafjöldi hvers atóms:</div>
        <div className="flex flex-wrap gap-2">
          {atoms.map((atom, i) => {
            const expected = EXPECTED_ELECTRONS[atom.symbol] ?? EXPECTED_ELECTRONS.default;
            const isViolation = atom.totalElectrons !== expected;
            const isExpanded = atom.totalElectrons > 8;
            const isIncomplete = atom.totalElectrons < expected;

            return (
              <div
                key={`${atom.symbol}-${i}`}
                className={`px-3 py-2 rounded-lg border ${
                  !isViolation
                    ? 'bg-green-500/20 border-green-500/40'
                    : isExpanded
                      ? 'bg-purple-500/20 border-purple-500/40'
                      : isIncomplete
                        ? 'bg-orange-500/20 border-orange-500/40'
                        : 'bg-red-500/20 border-red-500/40'
                }`}
              >
                <div className="text-center">
                  <div className="font-bold text-white">{atom.symbol}</div>
                  <div className={`text-lg font-mono ${
                    !isViolation
                      ? 'text-green-400'
                      : isExpanded
                        ? 'text-purple-400'
                        : 'text-orange-400'
                  }`}>
                    {atom.totalElectrons}
                  </div>
                  <div className="text-xs text-gray-400">
                    af {expected}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Violation details */}
      {violations.length > 0 && showExplanations && (
        <div className="space-y-2">
          <div className="text-xs text-gray-400 mb-1">Nánari greining:</div>
          {violations.map((v, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg ${
                v.isAllowed
                  ? 'bg-yellow-500/10 border border-yellow-500/30'
                  : 'bg-red-500/10 border border-red-500/30'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">
                  {v.type === 'expanded' ? '📈' : v.type === 'incomplete' ? '📉' : '⚡'}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${v.isAllowed ? 'text-yellow-400' : 'text-red-400'}`}>
                      {v.atom}
                    </span>
                    <span className="text-gray-400">—</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      v.type === 'expanded'
                        ? 'bg-purple-500/30 text-purple-300'
                        : v.type === 'incomplete'
                          ? 'bg-orange-500/30 text-orange-300'
                          : 'bg-blue-500/30 text-blue-300'
                    }`}>
                      {v.type === 'expanded'
                        ? 'Útvíkkað áttund'
                        : v.type === 'incomplete'
                          ? 'Ófullnægjandi áttund'
                          : 'Radíkal'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    {v.explanation}
                  </div>
                  {v.reason && (
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <span>💡</span> {v.reason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="text-xs text-gray-500 mb-2">Litakóðar:</div>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500/50" />
            <span className="text-gray-400">Átturegla uppfyllt</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-purple-500/50" />
            <span className="text-gray-400">Útvíkkað áttund</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-500/50" />
            <span className="text-gray-400">Ófullnægjandi</span>
          </div>
        </div>
      </div>

      {/* Examples info */}
      {hasAllowedExceptions && (
        <div className="mt-3 bg-slate-700/50 rounded-lg p-3 text-xs text-gray-400">
          <strong className="text-yellow-400">Góð dæmi um undantekningar:</strong>
          <ul className="mt-1 space-y-1 ml-4 list-disc">
            <li><span className="text-white">BF₃, BH₃</span> — Bór með 6 rafeindir (ófullnægjandi)</li>
            <li><span className="text-white">SF₆, PCl₅</span> — Brennisteinn/fosfór með 10-12 rafeindir (útvíkkað)</li>
            <li><span className="text-white">NO, NO₂</span> — Radíkalar með óparaðri rafeind</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default OctetViolationChecker;
