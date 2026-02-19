import { useState, useEffect } from 'react';

interface UnitBlockProps {
  value: number;
  unit: string;
  isSelected?: boolean;
  isCancelling?: boolean;
  isCancelled?: boolean;
  isMatching?: boolean;
  onClick?: () => void;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'gray';
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  /** Use enhanced strikethrough animation */
  useStrikethrough?: boolean;
}

const colorClasses = {
  blue: 'bg-blue-500 text-white border-blue-600',
  green: 'bg-green-500 text-white border-green-600',
  orange: 'bg-orange-500 text-white border-orange-600',
  red: 'bg-red-500 text-white border-red-600',
  gray: 'bg-gray-400 text-gray-200 border-gray-500'
};

const sizeClasses = {
  small: 'px-2 py-1 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-6 py-3 text-xl'
};

/**
 * Interactive unit block component with animations
 * Used for visual manipulation of units in dimensional analysis
 */
export function UnitBlock({
  value,
  unit,
  isSelected = false,
  isCancelling = false,
  isCancelled = false,
  isMatching = false,
  onClick,
  color = 'blue',
  size = 'medium',
  showValue = true,
  useStrikethrough = false
}: UnitBlockProps) {
  const [animationClass, setAnimationClass] = useState('');
  const [showStrikethrough, setShowStrikethrough] = useState(false);
  const [showBurst, setShowBurst] = useState(false);

  useEffect(() => {
    if (isCancelling) {
      if (useStrikethrough) {
        // Enhanced strikethrough animation
        setShowStrikethrough(true);
        setShowBurst(true);
        setAnimationClass('');
        const timer = setTimeout(() => {
          setAnimationClass('unit-cancelled');
        }, 400);
        return () => clearTimeout(timer);
      } else {
        // Legacy animation
        setAnimationClass('animate-pulse scale-110');
        const timer = setTimeout(() => {
          setAnimationClass('animate-shrink opacity-0 scale-0');
        }, 300);
        return () => clearTimeout(timer);
      }
    } else if (isCancelled) {
      if (useStrikethrough) {
        setShowStrikethrough(true);
        setAnimationClass('unit-cancelled');
      } else {
        setAnimationClass('opacity-0 scale-0');
      }
    } else if (isSelected || isMatching) {
      setAnimationClass(isMatching ? 'unit-match-glow ring-4 ring-orange-400 scale-105' : 'ring-4 ring-yellow-400 scale-105');
      setShowStrikethrough(false);
      setShowBurst(false);
    } else {
      setAnimationClass('');
      setShowStrikethrough(false);
      setShowBurst(false);
    }
  }, [isCancelling, isCancelled, isSelected, isMatching, useStrikethrough]);

  // For legacy mode, hide completely when cancelled
  if (isCancelled && !isCancelling && !useStrikethrough) {
    return null;
  }

  const baseClasses = `
    inline-flex items-center justify-center
    rounded-lg border-2 font-bold
    transition-all duration-300 ease-in-out
    ${colorClasses[isCancelled ? 'gray' : color]}
    ${sizeClasses[size]}
    ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
    ${animationClass}
  `;

  // Wrap in container for strikethrough effect
  if (useStrikethrough) {
    return (
      <div className="unit-cancel-container">
        <div
          className={baseClasses}
          onClick={onClick}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          onKeyDown={(e) => {
            if (onClick && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onClick();
            }
          }}
        >
          {showValue && <span className="mr-1">{value}</span>}
          <span>{unit}</span>
        </div>
        {/* Strikethrough line */}
        <div className={`unit-cancel-line ${showStrikethrough ? 'animate' : ''}`} />
        {/* Burst effect */}
        {showBurst && <div className={`cancel-burst ${showBurst ? 'animate' : ''}`} />}
      </div>
    );
  }

  return (
    <div
      className={baseClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {showValue && <span className="mr-1">{value}</span>}
      <span>{unit}</span>
    </div>
  );
}

interface ConversionFactorBlockProps {
  numeratorValue: number;
  numeratorUnit: string;
  denominatorValue: number;
  denominatorUnit: string;
  isSelected?: boolean;
  isCorrect?: boolean | null;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Conversion factor displayed as a fraction block
 */
export function ConversionFactorBlock({
  numeratorValue,
  numeratorUnit,
  denominatorValue,
  denominatorUnit,
  isSelected = false,
  isCorrect = null,
  onClick,
  size = 'medium'
}: ConversionFactorBlockProps) {
  const borderColor = isCorrect === true
    ? 'border-green-500 bg-green-50'
    : isCorrect === false
    ? 'border-red-500 bg-red-50'
    : isSelected
    ? 'border-orange-500 bg-orange-50'
    : 'border-gray-300 bg-white';

  const sizeStyles = {
    small: { container: 'p-2 min-w-[80px]', text: 'text-sm' },
    medium: { container: 'p-3 min-w-[120px]', text: 'text-base' },
    large: { container: 'p-4 min-w-[160px]', text: 'text-lg' }
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center rounded-xl border-2
        transition-all duration-200
        ${borderColor}
        ${sizeStyles[size].container}
        ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
        ${isSelected ? 'ring-4 ring-yellow-400' : ''}
      `}
      disabled={!onClick}
    >
      <div className={`font-bold text-blue-600 ${sizeStyles[size].text}`}>
        {numeratorValue} {numeratorUnit}
      </div>
      <div className="w-full h-0.5 bg-gray-800 my-1" />
      <div className={`font-bold text-green-600 ${sizeStyles[size].text}`}>
        {denominatorValue} {denominatorUnit}
      </div>
    </button>
  );
}

interface EquivalenceDisplayProps {
  leftValue: number;
  leftUnit: string;
  rightValue: number;
  rightUnit: string;
  isEqual: boolean;
  /** Comparison value: negative = left heavier, positive = right heavier, 0 = equal */
  comparison?: number;
}

/**
 * Visual display showing equivalence between two unit expressions
 * Uses a balance scale metaphor that tilts based on which side is heavier
 */
export function EquivalenceDisplay({
  leftValue,
  leftUnit,
  rightValue,
  rightUnit,
  isEqual,
  comparison = 0
}: EquivalenceDisplayProps) {
  // Determine tilt direction and amount
  // Positive comparison = right is heavier = tilt right down
  // Negative comparison = left is heavier = tilt left down
  const getTiltClass = () => {
    if (isEqual) return '';
    if (comparison > 0) return 'rotate-[-5deg]'; // Right heavier - right goes down
    if (comparison < 0) return 'rotate-[5deg]';  // Left heavier - left goes down
    return '';
  };

  // Pan positions based on tilt
  const getLeftPanClass = () => {
    if (isEqual) return '';
    if (comparison > 0) return '-translate-y-3'; // Right heavier - left goes up
    if (comparison < 0) return 'translate-y-3';  // Left heavier - left goes down
    return '';
  };

  const getRightPanClass = () => {
    if (isEqual) return '';
    if (comparison > 0) return 'translate-y-3';  // Right heavier - right goes down
    if (comparison < 0) return '-translate-y-3'; // Left heavier - right goes up
    return '';
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl">
      {/* Scale beam */}
      <div className={`
        relative w-full max-w-md h-2 bg-gray-800 rounded-full
        transition-transform duration-500 origin-center
        ${getTiltClass()}
      `}>
        {/* Fulcrum */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[16px] border-l-transparent border-r-transparent border-t-gray-800" />
        </div>
      </div>

      {/* Scale pans */}
      <div className="flex justify-between w-full max-w-md mt-6 px-4">
        <div className={`
          transition-all duration-500
          ${getLeftPanClass()}
        `}>
          <UnitBlock
            value={leftValue}
            unit={leftUnit}
            color="blue"
            size="large"
          />
        </div>

        <div className={`
          flex items-center text-3xl font-bold
          ${isEqual ? 'text-green-600' : 'text-gray-400'}
        `}>
          {isEqual ? '=' : '?'}
        </div>

        <div className={`
          transition-all duration-500
          ${getRightPanClass()}
        `}>
          <UnitBlock
            value={rightValue}
            unit={rightUnit}
            color="green"
            size="large"
          />
        </div>
      </div>

      {/* Status message */}
      <div className={`
        mt-6 px-6 py-2 rounded-full font-bold text-lg
        transition-all duration-300
        ${isEqual
          ? 'bg-green-100 text-green-700'
          : 'bg-yellow-100 text-yellow-700'}
      `}>
        {isEqual ? 'Jafnvægi! Sama rúmmál!' : 'Ekki jafnvægi...'}
      </div>
    </div>
  );
}
