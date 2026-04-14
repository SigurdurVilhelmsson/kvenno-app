import type { ElementCount } from '../utils/balanceChecker';

interface AtomCounterProps {
  elements: ElementCount[];
  /** Optionally highlight unbalanced elements (used in Level 1 hints) */
  highlightUnbalanced?: boolean;
}

/**
 * AtomCounter - shows a table of atom counts for each side.
 * Updates in real-time as coefficients change.
 * Green checkmark when balanced, red X when not.
 */
export function AtomCounter({ elements, highlightUnbalanced = false }: AtomCounterProps) {
  if (elements.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="text-sm font-semibold text-warm-600 mb-3">Fjöldi atóma</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-warm-500 border-b border-warm-200">
            <th className="text-left py-1.5 px-2 font-medium">Frumefni</th>
            <th className="text-center py-1.5 px-2 font-medium">Vinstri</th>
            <th className="text-center py-1.5 px-2 font-medium">Hægri</th>
            <th className="text-center py-1.5 px-2 font-medium w-10"></th>
          </tr>
        </thead>
        <tbody>
          {elements.map(({ element, left, right, balanced }) => (
            <tr
              key={element}
              className={`border-b border-warm-100 transition-colors duration-200 ${
                highlightUnbalanced && !balanced ? 'bg-red-50' : balanced ? 'bg-green-50' : ''
              }`}
            >
              <td className="py-1.5 px-2 font-bold text-warm-800">{element}</td>
              <td className="py-1.5 px-2 text-center font-mono text-warm-700">{left}</td>
              <td className="py-1.5 px-2 text-center font-mono text-warm-700">{right}</td>
              <td className="py-1.5 px-2 text-center">
                {balanced ? (
                  <span className="text-green-500 font-bold text-base">✓</span>
                ) : (
                  <span className="text-red-500 font-bold text-base">✗</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AtomCounter;
