import { Compound } from '../data/compounds';
import { generateCalculationBreakdown } from '../utils/calculations';

interface CalculationBreakdownProps {
  compound: Compound;
}

export function CalculationBreakdown({ compound }: CalculationBreakdownProps) {
  const breakdown = generateCalculationBreakdown(compound);

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 animate-slide-down">
      <h3 className="text-lg font-bold text-blue-800 mb-3">📋 Útreikningur:</h3>
      <div className="space-y-2">
        {breakdown.map((step, index) => (
          <div key={index}>
            {step.type === 'section' ? (
              <h4 className="font-semibold text-gray-700 mt-3 mb-1">{step.label}</h4>
            ) : (
              <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-primary">{step.symbol}</span>
                  <span className="text-gray-600">×</span>
                  <span className="font-semibold">{step.count}</span>
                  <span className="text-gray-600">×</span>
                  <span className="text-sm text-gray-600">{step.atomicMass?.toFixed(3)} g/mol</span>
                </div>
                <span className="font-semibold text-green-600">
                  = {step.total?.toFixed(3)} g/mol
                </span>
              </div>
            )}
          </div>
        ))}
        <div className="border-t-2 border-gray-300 pt-2 mt-3">
          <div className="flex items-center justify-between bg-green-100 rounded px-3 py-2">
            <span className="font-bold text-gray-700">Heild mólmassi:</span>
            <span className="text-xl font-bold text-green-600">
              {compound.molarMass.toFixed(3)} g/mol
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
