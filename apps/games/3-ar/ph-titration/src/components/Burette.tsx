import React from 'react';

interface BuretteProps {
  volumeAdded: number;
  maxVolume?: number;
  isAnimating?: boolean;
  /** Enable responsive sizing based on viewport */
  responsive?: boolean;
  /** Size variant for different layouts */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Burette component - displays titrant delivery system
 *
 * Supports responsive sizing for mobile devices:
 * - responsive: true uses viewport-based heights with min/max bounds
 * - size: 'sm' | 'md' | 'lg' provides preset sizes
 */
export const Burette: React.FC<BuretteProps> = ({
  volumeAdded,
  maxVolume = 60,
  isAnimating = false,
  responsive = true,
  size = 'md'
}) => {
  const fillPercentage = Math.min((volumeAdded / maxVolume) * 100, 100);

  // Size configurations
  const sizeConfig = {
    sm: {
      height: 'h-[280px] md:h-[360px]',
      width: 'w-10',
      scaleMarks: 'left-[-32px] text-[10px]',
      tipSize: 6,
      stopcockWidth: 'w-6',
      volumeText: 'text-xs',
    },
    md: {
      height: 'h-[320px] md:h-[420px] lg:h-[500px]',
      width: 'w-11 md:w-12',
      scaleMarks: 'left-[-36px] md:left-[-40px] text-[10px] md:text-xs',
      tipSize: 7,
      stopcockWidth: 'w-7 md:w-8',
      volumeText: 'text-xs md:text-sm',
    },
    lg: {
      height: 'h-[400px] md:h-[500px] lg:h-[600px]',
      width: 'w-12 md:w-14',
      scaleMarks: 'left-[-40px] md:left-[-44px] text-xs',
      tipSize: 8,
      stopcockWidth: 'w-8',
      volumeText: 'text-sm',
    },
  };

  const config = sizeConfig[size];

  // Use responsive or fixed sizing
  const heightClass = responsive ? config.height : 'h-[500px]';
  const widthClass = responsive ? config.width : 'w-12';

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Burette container */}
        <div
          className={`relative ${widthClass} ${heightClass} rounded-t-lg rounded-b-sm border-4 border-indigo-700`}
          role="meter"
          aria-label={`Büretta: ${volumeAdded.toFixed(2)} mL af ${maxVolume} mL bætt við`}
          aria-valuenow={volumeAdded}
          aria-valuemin={0}
          aria-valuemax={maxVolume}
          style={{
            background: 'linear-gradient(to bottom, #e0e7ff 0%, #c7d2fe 100%)',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Liquid level */}
          <div
            className="absolute bottom-0 left-0 right-0 rounded-b transition-all duration-300"
            style={{
              height: `${fillPercentage}%`,
              background: 'linear-gradient(to bottom, #3b82f6, #1e40af)',
            }}
          />

          {/* Dripping animation */}
          {isAnimating && (
            <div
              className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-blue-500 animate-drip"
            />
          )}

          {/* Volume scale marks */}
          <div className={`absolute ${config.scaleMarks} top-2 bottom-2 flex flex-col justify-between font-bold text-indigo-700`}>
            {[0, 10, 20, 30, 40, 50, 60].reverse().map((vol) => (
              <div key={vol} className="relative">
                <span>{vol}</span>
                <div className="absolute left-full top-1/2 w-2 h-0.5 bg-indigo-700" />
              </div>
            ))}
          </div>
        </div>

        {/* Burette tip */}
        <div
          className="absolute bottom-[-15px] left-1/2 transform -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: `${config.tipSize}px solid transparent`,
            borderRight: `${config.tipSize}px solid transparent`,
            borderTop: `${Math.round(config.tipSize * 1.875)}px solid #4338ca`
          }}
        />

        {/* Stopcock */}
        <div
          className={`absolute bottom-[-8px] right-[-20px] ${config.stopcockWidth} h-3 rounded-md border-2 border-indigo-900`}
          style={{
            background: 'linear-gradient(to right, #6366f1, #4338ca)'
          }}
        />
      </div>

      {/* Volume display */}
      <div className="mt-6 bg-indigo-100 px-3 md:px-4 py-2 rounded-lg border-2 border-indigo-300">
        <p className={`${config.volumeText} font-bold text-indigo-900`}>
          Rúmmál bætt við: <span className="text-base md:text-lg">{volumeAdded.toFixed(2)}</span> mL
        </p>
      </div>
    </div>
  );
};
