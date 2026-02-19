import React from 'react';
import { getIndicatorColor } from '../data/indicators';
import { getPHColor } from '../utils/ph-calculations';

interface FlaskProps {
  pH: number;
  selectedIndicator: string | null;
  volumeAnalyte: number;
  volumeTitrant: number;
  isSwirling?: boolean;
}

/**
 * Erlenmeyer Flask component - displays solution with color changes
 */
export const Flask: React.FC<FlaskProps> = ({
  pH,
  selectedIndicator,
  volumeAnalyte,
  volumeTitrant,
  isSwirling = false
}) => {
  const totalVolume = volumeAnalyte + volumeTitrant;
  const fillPercentage = Math.min((totalVolume / 100) * 100, 90); // Max 90% full

  // Get color based on indicator or pH scale
  const solutionColor = selectedIndicator
    ? getIndicatorColor(selectedIndicator, pH)
    : getPHColor(pH);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-60 h-70">
        {/* Flask neck */}
        <div
          className="mx-auto w-12 h-18 rounded-t-lg border-4 border-indigo-500 border-b-0 relative"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
            boxShadow: 'inset -2px 0 4px rgba(99, 102, 241, 0.2), inset 2px 0 4px rgba(255, 255, 255, 0.8)'
          }}
        />

        {/* Flask body */}
        <div
          className={`relative w-60 h-52 border-4 border-indigo-500 overflow-hidden ${isSwirling ? 'animate-pulse' : ''}`}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.75) 100%)',
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
            borderRadius: '0 0 45% 45%',
            boxShadow: 'inset -5px 0 10px rgba(99, 102, 241, 0.15), inset 5px 0 10px rgba(255, 255, 255, 0.8), 0 8px 16px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Solution liquid */}
          <div
            className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${isSwirling ? 'animate-swirl' : ''}`}
            style={{
              height: `${fillPercentage}%`,
              backgroundColor: solutionColor,
              opacity: solutionColor === 'transparent' ? 0.1 : 0.7,
              mixBlendMode: 'multiply'
            }}
          >
            {/* Stirring bar */}
            {isSwirling && (
              <div
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1.5 bg-white rounded-full animate-spin"
                style={{ animationDuration: '1s' }}
              />
            )}
          </div>

          {/* Shine effect */}
          <div
            className="absolute top-0 right-0 w-20 h-full opacity-30"
            style={{
              background: 'linear-gradient(to left, rgba(255, 255, 255, 0.6), transparent)'
            }}
          />
        </div>
      </div>

      {/* Volume and pH display */}
      <div className="mt-4 flex gap-2">
        <div className="bg-blue-100 px-3 py-1.5 rounded-lg border-2 border-blue-300 text-center">
          <p className="text-xs text-blue-700 font-semibold">Rúmmál</p>
          <p className="text-sm font-bold text-blue-900">{totalVolume.toFixed(1)} mL</p>
        </div>
        <div
          className="px-3 py-1.5 rounded-lg border-2 text-center"
          style={{
            backgroundColor: `${solutionColor}20`,
            borderColor: solutionColor !== 'transparent' ? solutionColor : '#cbd5e1'
          }}
        >
          <p className="text-xs text-gray-700 font-semibold">pH</p>
          <p className="text-sm font-bold text-gray-900">{pH.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};
