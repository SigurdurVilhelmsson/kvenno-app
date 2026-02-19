import React from 'react';
import { indicators } from '../data/indicators';
import { IndicatorType } from '../types';

interface IndicatorSelectorProps {
  selectedIndicator: IndicatorType | null;
  onSelect: (indicator: IndicatorType) => void;
  disabled?: boolean;
}

/**
 * Indicator Selector component
 */
export const IndicatorSelector: React.FC<IndicatorSelectorProps> = ({
  selectedIndicator,
  onSelect,
  disabled = false
}) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md border-2 border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-3">Veldu Vísi</h3>
      <div className="grid grid-cols-1 gap-2">
        {indicators.map((indicator) => (
          <button
            key={indicator.id}
            onClick={() => onSelect(indicator.id)}
            disabled={disabled}
            className={`p-3 rounded-lg border-2 text-left transition-all ${
              selectedIndicator === indicator.id
                ? 'border-orange-500 bg-orange-50 shadow-md'
                : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-900">{indicator.name}</p>
                <p className="text-xs text-gray-600">
                  pH {indicator.pHRange[0].toFixed(1)} - {indicator.pHRange[1].toFixed(1)}
                </p>
              </div>
              <div className="flex gap-1 ml-2">
                <div
                  className="w-6 h-6 rounded border border-gray-400"
                  style={{ backgroundColor: indicator.colorAcidic }}
                  title="Súr litur"
                />
                <div
                  className="w-6 h-6 rounded border border-gray-400"
                  style={{ backgroundColor: indicator.colorBasic }}
                  title="Basískur litur"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1 italic">{indicator.description}</p>
          </button>
        ))}
      </div>

      {selectedIndicator && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-xs text-green-800 font-semibold">
            ✓ Valinn: {indicators.find(i => i.id === selectedIndicator)?.name}
          </p>
        </div>
      )}
    </div>
  );
};
