import React from 'react';

import { formatDecimal } from '@shared/utils';

import { indicators } from '../data/indicators';
import { IndicatorType } from '../types';

interface IndicatorSelectorProps {
  selectedIndicator: IndicatorType | null;
  onSelect: (indicator: IndicatorType) => void;
  disabled?: boolean;
  /** A line under the heading, e.g. what the choice is for. */
  intro?: React.ReactNode;
}

/**
 * Indicator Selector component
 */
export const IndicatorSelector: React.FC<IndicatorSelectorProps> = ({
  selectedIndicator,
  onSelect,
  disabled = false,
  intro,
}) => {
  return (
    <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-2 border-warm-200 phone:p-2">
      <h3 className="text-lg font-bold text-warm-800 mb-3 phone:text-base phone:mb-2">
        Veldu litvísi
      </h3>
      {intro && <p className="text-sm text-warm-700 mb-3 phone:mb-2">{intro}</p>}
      {/* Two columns on a phone on its side. */}
      <div className="grid grid-cols-1 gap-2 phone:gap-1.5 phone-land:grid-cols-2">
        {indicators.map((indicator) => (
          <button
            key={indicator.id}
            onClick={() => onSelect(indicator.id)}
            disabled={disabled}
            aria-pressed={selectedIndicator === indicator.id}
            className={`p-3 phone:p-2 rounded-lg border-2 text-left transition-all ${
              selectedIndicator === indicator.id
                ? 'border-orange-500 bg-orange-50 shadow-md'
                : 'border-warm-300 bg-white hover:border-warm-400 hover:bg-warm-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-bold text-sm text-warm-900">{indicator.name}</p>
                <p className="text-xs text-warm-600">
                  pH {formatDecimal(indicator.pHRange[0], 1)} -{' '}
                  {formatDecimal(indicator.pHRange[1], 1)}
                </p>
              </div>
              <div className="flex gap-1 sm:gap-2 ml-2">
                <div className="flex flex-col items-center">
                  <div
                    className="w-6 h-6 rounded border border-warm-400"
                    style={{ backgroundColor: indicator.colorAcidic }}
                    aria-hidden="true"
                  />
                  <span className="text-[10px] max-lg:text-xs text-warm-600 mt-0.5">
                    Súr<span className="sr-only">: {indicator.colorAcidicName}</span>
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className="w-6 h-6 rounded border border-warm-400"
                    style={{ backgroundColor: indicator.colorBasic }}
                    aria-hidden="true"
                  />
                  <span className="text-[10px] max-lg:text-xs text-warm-600 mt-0.5">
                    Basísk<span className="sr-only">: {indicator.colorBasicName}</span>
                  </span>
                </div>
              </div>
            </div>
            {/* No description here: it says which titration the indicator suits,
                which is half the question. The result shows it (decision 114 (c)). */}
          </button>
        ))}
      </div>
    </div>
  );
};
