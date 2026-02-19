import React from 'react';
import { getPHColor } from '../utils/ph-calculations';

interface PHMeterProps {
  pH: number;
  isActive?: boolean;
}

/**
 * Digital pH Meter component
 */
export const PHMeter: React.FC<PHMeterProps> = ({ pH, isActive = true }) => {
  const pHColor = getPHColor(pH);

  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-800 rounded-lg p-4 shadow-xl border-4 border-gray-700">
        {/* Brand label */}
        <div className="text-center mb-2">
          <p className="text-xs text-gray-400 font-bold">DIGITAL pH METER</p>
        </div>

        {/* Display screen */}
        <div
          className="bg-gray-900 rounded px-6 py-4 mb-3 border-2 border-gray-600"
          style={{
            fontFamily: '"Courier New", monospace',
            boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.5)'
          }}
        >
          {isActive ? (
            <div className="text-center">
              <div
                className="text-4xl font-bold tabular-nums"
                style={{
                  color: pHColor,
                  textShadow: `0 0 8px ${pHColor}`
                }}
              >
                {pH.toFixed(2)}
              </div>
              <div className="text-xs text-green-400 mt-1">pH</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-600">---</div>
              <div className="text-xs text-gray-600 mt-1">STANDBY</div>
            </div>
          )}
        </div>

        {/* pH scale indicator */}
        <div className="relative h-6 rounded overflow-hidden">
          {/* pH gradient bar */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, #8B0000 0%, #DC143C 7%, #FF0000 14%, #FF4500 21%, #FF6347 28%, #FFA500 35%, #FFD700 42%, #00FF00 50%, #00CED1 57%, #1E90FF 64%, #0000FF 71%, #4B0082 78%, #8B00FF 85%, #9400D3 92%, #800080 100%)'
            }}
          />

          {/* Current pH marker */}
          {isActive && (
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
              style={{
                left: `${(pH / 14) * 100}%`,
                transform: 'translateX(-50%)',
                boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)'
              }}
            >
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-2 border-r-2 border-t-3 border-transparent border-t-white" />
              </div>
            </div>
          )}
        </div>

        {/* Scale numbers */}
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>0</span>
          <span>7</span>
          <span>14</span>
        </div>
      </div>

      {/* Labels */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-600 font-semibold">
          {pH < 7 ? '🔴 Súr lausn' : pH > 7 ? '🔵 Basísk lausn' : '🟢 Hlutlaus'}
        </p>
      </div>
    </div>
  );
};
