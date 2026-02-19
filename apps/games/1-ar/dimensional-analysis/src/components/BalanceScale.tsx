interface BalanceScaleProps {
  leftValue: number;
  leftUnit: string;
  rightValue: number;
  rightUnit: string;
  balanced: boolean;
}

export function BalanceScale({ leftValue, leftUnit, rightValue, rightUnit, balanced }: BalanceScaleProps) {
  return (
    <div className="flex flex-col items-center p-6">
      <p className="text-lg text-gray-700 mb-4 font-semibold">
        {balanced ? '⚖️ Jafnvægi - Þessi tvö gildi eru jafn stór!' : '⚖️ Umbreyting'}
      </p>

      <div className="relative w-full max-w-md">
        {/* Balance beam */}
        <div className={`w-full h-2 bg-gray-800 rounded transition-transform duration-500 ${
          balanced ? '' : 'rotate-2'
        }`}>
          {/* Fulcrum */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-800"></div>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          {/* Left side */}
          <div className="flex flex-col items-center">
            <div className={`bg-blue-500 text-white rounded-lg px-6 py-4 shadow-lg transition-transform duration-500 ${
              balanced ? 'translate-y-0' : '-translate-y-2'
            }`}>
              <p className="text-2xl font-bold">{leftValue} {leftUnit}</p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex flex-col items-center">
            <div className={`bg-green-500 text-white rounded-lg px-6 py-4 shadow-lg transition-transform duration-500 ${
              balanced ? 'translate-y-0' : '-translate-y-2'
            }`}>
              <p className="text-2xl font-bold">{rightValue} {rightUnit}</p>
            </div>
          </div>
        </div>
      </div>

      {balanced && (
        <div className="mt-6 text-center">
          <p className="text-gray-700 font-medium">
            Vegna þess að {leftValue} {leftUnit} = {rightValue} {rightUnit}
          </p>
          <p className="text-primary font-bold text-lg mt-2">
            ({leftValue} {leftUnit}) / ({rightValue} {rightUnit}) = 1
          </p>
        </div>
      )}
    </div>
  );
}
