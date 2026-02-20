/**
 * Atom and molecule visualization components for the Molmassi game.
 * Renders individual atom circles and molecule assemblies with animations.
 */

// Visual properties for atoms (used in UI)
export const ATOM_VISUALS: Record<string, { color: string; size: number; name: string; mass: number }> = {
  H: { color: '#F3F4F6', size: 24, name: 'Vetni', mass: 1.008 },
  C: { color: '#4B5563', size: 30, name: 'Kolefni', mass: 12.011 },
  N: { color: '#3B82F6', size: 28, name: 'Köfnunarefni', mass: 14.007 },
  O: { color: '#EF4444', size: 28, name: 'Súrefni', mass: 15.999 },
  S: { color: '#EAB308', size: 32, name: 'Brennisteinn', mass: 32.065 },
  Cl: { color: '#22C55E', size: 32, name: 'Klór', mass: 35.453 },
  Na: { color: '#8B5CF6', size: 34, name: 'Natríum', mass: 22.990 },
  Ca: { color: '#F97316', size: 36, name: 'Kalsíum', mass: 40.078 },
  Fe: { color: '#78716C', size: 34, name: 'Járn', mass: 55.845 },
  K: { color: '#EC4899', size: 38, name: 'Kalíum', mass: 39.098 },
  Mg: { color: '#14B8A6', size: 34, name: 'Magnesíum', mass: 24.305 },
  P: { color: '#F59E0B', size: 30, name: 'Fosfór', mass: 30.974 },
  Al: { color: '#A1A1AA', size: 32, name: 'Ál', mass: 26.982 },
  Cu: { color: '#B45309', size: 32, name: 'Kopar', mass: 63.546 },
};

interface AtomCircleProps {
  symbol: string;
  showLabel?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  animateIn?: boolean;
  delay?: number;
}

/** Renders a single atom as a colored circle with its element symbol. */
export function AtomCircle({ symbol, showLabel = true, onClick, isSelected = false, animateIn = false, delay = 0 }: AtomCircleProps) {
  const visual = ATOM_VISUALS[symbol] || { color: '#888', size: 30, name: symbol, mass: 0 };

  return (
    <div
      className={`relative inline-flex flex-col items-center ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div
        className={`atom-circle rounded-full border-2 flex items-center justify-center font-bold text-xs ${animateIn ? 'animate-bounce-in' : ''} ${isSelected ? 'ring-4 ring-primary/50 animate-pulse-soft' : ''}`}
        style={{
          width: visual.size,
          height: visual.size,
          backgroundColor: visual.color,
          borderColor: visual.color === '#FFFFFF' ? '#CBD5E1' : 'transparent',
          color: visual.color === '#FFFFFF' || visual.color === '#EAB308' ? '#1F2937' : '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          animationDelay: animateIn ? `${delay}ms` : '0ms',
          animationFillMode: 'backwards',
        }}
      >
        {symbol}
      </div>
      {showLabel && (
        <span className="text-xs text-warm-600 mt-1">{visual.name}</span>
      )}
    </div>
  );
}

interface MoleculeVisualProps {
  elements: { symbol: string; count: number }[];
  showMassBar?: boolean;
  animateAtoms?: boolean;
}

/** Renders a molecule as a collection of atom circles with an optional mass bar. */
export function MoleculeVisual({ elements, showMassBar = false, animateAtoms = true }: MoleculeVisualProps) {
  const totalMass = elements.reduce((sum, el) => {
    const visual = ATOM_VISUALS[el.symbol];
    return sum + (visual ? visual.mass * el.count : 0);
  }, 0);

  // Calculate max possible mass for the bar (roughly 100 g/mol for simple molecules)
  const maxMass = 100;
  const massPercent = Math.min((totalMass / maxMass) * 100, 100);

  // Count total atoms for staggered animation
  let atomCounter = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-warm-100 rounded-xl min-h-[80px]">
        {elements.map((el, elIndex) => (
          <div key={elIndex} className="flex items-center gap-1">
            {Array.from({ length: el.count }).map((_, atomIndex) => {
              const staggerDelay = atomCounter * 50; // 50ms stagger
              atomCounter++;
              return (
                <AtomCircle
                  key={`${elIndex}-${atomIndex}`}
                  symbol={el.symbol}
                  showLabel={false}
                  animateIn={animateAtoms}
                  delay={staggerDelay}
                />
              );
            })}
          </div>
        ))}
      </div>

      {showMassBar && (
        <div className="w-full max-w-xs animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="text-xs text-warm-600 text-center mb-1">Heildarmassi</div>
          <div className="h-4 bg-warm-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full mass-bar-fill bg-gradient-to-r from-green-400 via-yellow-400 to-red-400"
              style={{ width: `${massPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-warm-500 mt-1">
            <span>Létt</span>
            <span>Þungt</span>
          </div>
        </div>
      )}
    </div>
  );
}
