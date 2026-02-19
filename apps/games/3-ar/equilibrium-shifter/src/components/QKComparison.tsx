import { useMemo } from 'react';
import type { ShiftDirection, Stress } from '../types';

interface QKComparisonProps {
  /** The direction the equilibrium shifts */
  shiftDirection: ShiftDirection;
  /** The stress that was applied */
  stress: Stress;
  /** Whether the reaction is exothermic */
  isExothermic: boolean;
  /** Animation state */
  animate?: boolean;
}

/**
 * QKComparison - Visual comparison of Q (reaction quotient) vs K (equilibrium constant)
 *
 * Helps students understand WHY equilibrium shifts:
 * - Q < K: shifts right (toward products) to increase Q
 * - Q > K: shifts left (toward reactants) to decrease Q
 * - Q = K: at equilibrium (no net change)
 */
export function QKComparison({
  shiftDirection,
  stress,
  isExothermic,
  animate = true
}: QKComparisonProps) {
  // Determine Q vs K relationship based on shift direction
  const qkRelation = useMemo(() => {
    if (shiftDirection === 'right') return 'Q < K';
    if (shiftDirection === 'left') return 'Q > K';
    return 'Q = K';
  }, [shiftDirection]);

  // Get visual bar widths for Q and K (arbitrary visualization)
  const { qWidth, kWidth } = useMemo(() => {
    if (shiftDirection === 'right') {
      return { qWidth: 35, kWidth: 65 }; // Q is smaller
    } else if (shiftDirection === 'left') {
      return { qWidth: 65, kWidth: 35 }; // Q is larger
    }
    return { qWidth: 50, kWidth: 50 }; // Equal
  }, [shiftDirection]);

  // Get explanation based on stress type
  const explanation = useMemo(() => {
    const stressType = stress.type;

    if (stressType === 'add-catalyst') {
      return {
        qEffect: 'Q breytist ekki',
        kEffect: 'K breytist ekki',
        reason: 'Hvati hraðar bæði fram- og bakhvarf jafnt'
      };
    }

    if (stressType === 'increase-temp') {
      if (isExothermic) {
        return {
          qEffect: 'Q er óbreytt',
          kEffect: 'K minnkar við hærra hita',
          reason: 'Fyrir varmalosandi hvörf lækkar K við hækkun hitastigs'
        };
      } else {
        return {
          qEffect: 'Q er óbreytt',
          kEffect: 'K eykst við hærra hita',
          reason: 'Fyrir varmabindandi hvörf hækkar K við hækkun hitastigs'
        };
      }
    }

    if (stressType === 'decrease-temp') {
      if (isExothermic) {
        return {
          qEffect: 'Q er óbreytt',
          kEffect: 'K eykst við lægra hita',
          reason: 'Fyrir varmalosandi hvörf hækkar K við lækkun hitastigs'
        };
      } else {
        return {
          qEffect: 'Q er óbreytt',
          kEffect: 'K minnkar við lægra hita',
          reason: 'Fyrir varmabindandi hvörf lækkar K við lækkun hitastigs'
        };
      }
    }

    if (stressType.includes('pressure')) {
      return {
        qEffect: stressType === 'increase-pressure' ? 'Q eykst (þéttari)' : 'Q minnkar (þanist)',
        kEffect: 'K er óbreytt',
        reason: 'Þrýstingsbreyting hefur áhrif á styrk en ekki K'
      };
    }

    // Concentration changes
    if (stressType === 'add-reactant' || stressType === 'remove-product') {
      return {
        qEffect: 'Q minnkar',
        kEffect: 'K er óbreytt',
        reason: 'Meira af hvarfefnum eða minna af afurðum lækkar Q'
      };
    }

    if (stressType === 'add-product' || stressType === 'remove-reactant') {
      return {
        qEffect: 'Q eykst',
        kEffect: 'K er óbreytt',
        reason: 'Meira af afurðum eða minna af hvarfefnum hækkar Q'
      };
    }

    return {
      qEffect: 'Q breytist',
      kEffect: 'K er óbreytt',
      reason: 'Kerfið leitast við að jafnvægi'
    };
  }, [stress, isExothermic]);

  // Get shift explanation
  const shiftExplanation = useMemo(() => {
    if (shiftDirection === 'right') {
      return 'Kerfið hliðrast til hægri til að auka Q þar til Q = K';
    } else if (shiftDirection === 'left') {
      return 'Kerfið hliðrast til vinstri til að minnka Q þar til Q = K';
    }
    return 'Q = K, kerfið er í jafnvægi';
  }, [shiftDirection]);

  const getBarColor = (type: 'q' | 'k') => {
    if (shiftDirection === 'none') return 'bg-gray-500';
    if (type === 'q') {
      return shiftDirection === 'right' ? 'bg-blue-500' : 'bg-blue-700';
    }
    return shiftDirection === 'right' ? 'bg-purple-700' : 'bg-purple-500';
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
      <div className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
        <span className="text-lg">⚖️</span> Q vs K samanburður
      </div>

      {/* Visual Bar Comparison */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="space-y-3">
          {/* Q bar */}
          <div className="flex items-center gap-3">
            <div className="w-8 text-right font-mono font-bold text-blue-600">Q</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className={`h-full ${getBarColor('q')} rounded-full transition-all duration-700 flex items-center justify-end pr-2`}
                style={{ width: `${qWidth}%` }}
              >
                <span className="text-xs text-white font-semibold">
                  {shiftDirection === 'right' ? 'Lítið' : shiftDirection === 'left' ? 'Stórt' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* K bar */}
          <div className="flex items-center gap-3">
            <div className="w-8 text-right font-mono font-bold text-purple-600">K</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className={`h-full ${getBarColor('k')} rounded-full transition-all duration-700 flex items-center justify-end pr-2`}
                style={{ width: `${kWidth}%` }}
              >
                <span className="text-xs text-white font-semibold">
                  {shiftDirection === 'right' ? 'Stórt' : shiftDirection === 'left' ? 'Lítið' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Relation indicator */}
        <div className={`text-center mt-4 text-2xl font-bold ${animate ? 'animate-pulse' : ''} ${
          shiftDirection === 'right' ? 'text-green-600' :
          shiftDirection === 'left' ? 'text-red-600' :
          'text-gray-600'
        }`}>
          {qkRelation}
        </div>
      </div>

      {/* Educational explanation */}
      <div className="space-y-3 text-sm">
        {/* What happened to Q and K */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
            <div className="font-semibold text-blue-800 text-xs mb-1">Q (hvarfkvóti)</div>
            <div className="text-blue-700">{explanation.qEffect}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-2 border border-purple-200">
            <div className="font-semibold text-purple-800 text-xs mb-1">K (jafnvægisfasti)</div>
            <div className="text-purple-700">{explanation.kEffect}</div>
          </div>
        </div>

        {/* Why */}
        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
          <div className="font-semibold text-gray-800 text-xs mb-1">Ástæða</div>
          <div className="text-gray-700">{explanation.reason}</div>
        </div>

        {/* Result */}
        <div className={`rounded-lg p-3 border-2 ${
          shiftDirection === 'right' ? 'bg-green-50 border-green-300' :
          shiftDirection === 'left' ? 'bg-red-50 border-red-300' :
          'bg-gray-50 border-gray-300'
        }`}>
          <div className="font-semibold text-gray-800 text-xs mb-1">Niðurstaða</div>
          <div className={`font-medium ${
            shiftDirection === 'right' ? 'text-green-700' :
            shiftDirection === 'left' ? 'text-red-700' :
            'text-gray-700'
          }`}>
            {shiftExplanation}
          </div>
        </div>
      </div>

      {/* Formula reminder */}
      <div className="mt-4 text-center text-xs text-gray-500 bg-white rounded p-2">
        <span className="font-mono">Q = [afurðir]ⁿ / [hvarfefni]ᵐ</span>
        <span className="mx-2">•</span>
        <span>Q leitar alltaf í átt að K</span>
      </div>
    </div>
  );
}
