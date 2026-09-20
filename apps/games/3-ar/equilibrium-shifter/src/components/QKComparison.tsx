import { useMemo } from 'react';

import type { GasMoles, ShiftDirection, Stress } from '../types';

interface QKComparisonProps {
  /** The direction the equilibrium shifts */
  shiftDirection: ShiftDirection;
  /** The stress that was applied */
  stress: Stress;
  /** Whether the reaction is exothermic */
  isExothermic: boolean;
  /**
   * Moles of gas on each side.
   *
   * **Required, because the pressure case cannot be answered without it.**
   * Compressing a mixture multiplies every concentration by the same factor,
   * so Q changes by that factor raised to Δn — and Δn is negative for most of
   * the classic equilibria. This panel used to say "Q eykst" for any pressure
   * increase, which is right only when Δn > 0.
   */
  gasMoles: GasMoles;
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
  gasMoles,
  animate = true,
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
    const deltaN = gasMoles.products - gasMoles.reactants;

    if (stressType === 'add-catalyst') {
      return {
        qEffect: 'Q breytist ekki',
        kEffect: 'K breytist ekki',
        reason: 'Hvati hraðar bæði fram- og bakhvarf jafnt',
      };
    }

    if (stressType === 'increase-temp') {
      if (isExothermic) {
        return {
          qEffect: 'Q er óbreytt',
          kEffect: 'K minnkar við hærra hita',
          reason: 'Fyrir varmalosandi hvörf lækkar K við hækkun hitastigs',
        };
      } else {
        return {
          qEffect: 'Q er óbreytt',
          kEffect: 'K eykst við hærra hita',
          reason: 'Fyrir varmabindandi hvörf hækkar K við hækkun hitastigs',
        };
      }
    }

    if (stressType === 'decrease-temp') {
      if (isExothermic) {
        return {
          qEffect: 'Q er óbreytt',
          kEffect: 'K eykst við lægra hita',
          reason: 'Fyrir varmalosandi hvörf hækkar K við lækkun hitastigs',
        };
      } else {
        return {
          qEffect: 'Q er óbreytt',
          kEffect: 'K minnkar við lægra hita',
          reason: 'Fyrir varmabindandi hvörf lækkar K við lækkun hitastigs',
        };
      }
    }

    if (stressType.includes('pressure')) {
      // Squeezing the mixture into a smaller volume multiplies every
      // concentration by the same factor f, so Q is multiplied by f^Δn. Which
      // way Q moves therefore depends on the SIGN of Δn, not on the direction
      // of the pressure change alone.
      //
      // This branch used to read "Q eykst" for every pressure increase. That
      // is right for N₂O₄ ⇌ 2NO₂ (Δn = +1) and backwards for the Haber process
      // (Δn = −2) — and it contradicted the bars drawn directly above it,
      // which take their widths from the shift direction and so were correct.
      // Of the 21 equilibria in this game that offer a pressure stress, 10
      // have Δn < 0 and 4 have Δn = 0, so the sentence was wrong on 14 of them.
      if (deltaN === 0) {
        return {
          qEffect: 'Q er óbreytt',
          kEffect: 'K er óbreytt',
          reason:
            'Jafn mörg gasmól beggja vegna, svo þrýstingsbreytingin margfaldar teljara og nefnara með sömu tölu og Q stendur í stað',
        };
      }
      const squeezing = stressType === 'increase-pressure';
      // Q rises when squeezing a reaction that makes more gas, and when
      // expanding one that makes less.
      const makesMoreGas = deltaN > 0;
      const qRises = squeezing === makesMoreGas;
      return {
        qEffect: qRises ? 'Q eykst' : 'Q minnkar',
        kEffect: 'K er óbreytt',
        reason: `Δn = ${deltaN > 0 ? '+' : ''}${deltaN}, svo ${
          squeezing ? 'þjöppun' : 'þensla'
        } margfaldar Q með stuðli í veldinu ${deltaN > 0 ? '+' : ''}${deltaN} — K breytist ekki við þrýsting`,
      };
    }

    // Concentration changes
    if (stressType === 'add-reactant' || stressType === 'remove-product') {
      return {
        qEffect: 'Q minnkar',
        kEffect: 'K er óbreytt',
        reason: 'Meira af hvarfefnum eða minna af myndefnum lækkar Q',
      };
    }

    if (stressType === 'add-product' || stressType === 'remove-reactant') {
      return {
        qEffect: 'Q eykst',
        kEffect: 'K er óbreytt',
        reason: 'Meira af myndefnum eða minna af hvarfefnum hækkar Q',
      };
    }

    return {
      qEffect: 'Q breytist',
      kEffect: 'K er óbreytt',
      reason: 'Kerfið leitast við að jafnvægi',
    };
  }, [stress, isExothermic, gasMoles]);

  // Get shift explanation
  const shiftExplanation = useMemo(() => {
    if (shiftDirection === 'right') {
      return 'Kerfið hliðrast til hægri til að auka Q þar til Q = K';
    } else if (shiftDirection === 'left') {
      return 'Kerfið hliðrast til vinstri til að minnka Q þar til Q = K';
    }
    return 'Q = K, kerfið er í jafnvægi';
  }, [shiftDirection]);

  // Use -700/-800 shades only to guarantee WCAG AA contrast (≥4.5:1) for white text.
  const getBarColor = (type: 'q' | 'k') => {
    if (shiftDirection === 'none') return 'bg-warm-700';
    if (type === 'q') {
      return shiftDirection === 'right' ? 'bg-blue-700' : 'bg-blue-800';
    }
    return shiftDirection === 'right' ? 'bg-purple-800' : 'bg-purple-700';
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
            <div className="flex-1 bg-warm-200 rounded-full h-6 overflow-hidden">
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
            <div className="flex-1 bg-warm-200 rounded-full h-6 overflow-hidden">
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
        <div
          className={`text-center mt-4 text-2xl font-bold ${animate ? 'animate-pulse' : ''} ${
            shiftDirection === 'right'
              ? 'text-green-600'
              : shiftDirection === 'left'
                ? 'text-red-600'
                : 'text-warm-600'
          }`}
        >
          {qkRelation}
        </div>
      </div>

      {/* Educational explanation */}
      <div className="space-y-3 text-sm">
        {/* What happened to Q and K */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
            <div className="font-semibold text-blue-800 text-xs mb-1">Q (hvarfstuðull)</div>
            <div className="text-blue-700">{explanation.qEffect}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-2 border border-purple-200">
            <div className="font-semibold text-purple-800 text-xs mb-1">K (jafnvægisfasti)</div>
            <div className="text-purple-700">{explanation.kEffect}</div>
          </div>
        </div>

        {/* Why */}
        <div className="bg-warm-50 rounded-lg p-2 border border-warm-200">
          <div className="font-semibold text-warm-800 text-xs mb-1">Ástæða</div>
          <div className="text-warm-700">{explanation.reason}</div>
        </div>

        {/* Result */}
        <div
          className={`rounded-lg p-3 border-2 ${
            shiftDirection === 'right'
              ? 'bg-green-50 border-green-300'
              : shiftDirection === 'left'
                ? 'bg-red-50 border-red-300'
                : 'bg-warm-50 border-warm-300'
          }`}
        >
          <div className="font-semibold text-warm-800 text-xs mb-1">Niðurstaða</div>
          <div
            className={`font-medium ${
              shiftDirection === 'right'
                ? 'text-green-700'
                : shiftDirection === 'left'
                  ? 'text-red-700'
                  : 'text-warm-700'
            }`}
          >
            {shiftExplanation}
          </div>
        </div>
      </div>

      {/* Formula reminder */}
      <div className="mt-4 text-center text-xs text-warm-500 bg-white rounded p-2">
        <span className="font-mono">Q = [myndefni]ⁿ / [hvarfefni]ᵐ</span>
        <span className="mx-2">•</span>
        <span>Q leitar alltaf í átt að K</span>
      </div>
    </div>
  );
}
