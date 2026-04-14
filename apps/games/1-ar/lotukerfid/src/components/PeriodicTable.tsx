import { useMemo } from 'react';

import { ELEMENTS, CATEGORY_COLORS, type Element, type ElementCategory } from '../data/elements';

interface PeriodicTableProps {
  /** Callback when student clicks an element cell */
  onElementClick?: (element: Element) => void;
  /** Set of element symbols to highlight (e.g. for current question) */
  highlightedElements?: Set<string>;
  /** Symbol of the element to show as correct (green glow) */
  correctElement?: string | null;
  /** Symbol of the element to show as wrong (red shake) */
  wrongElement?: string | null;
  /** Whether cells are clickable */
  interactive?: boolean;
}

function ElementCell({
  element,
  isHighlighted,
  isCorrect,
  isWrong,
  interactive,
  onClick,
}: {
  element: Element;
  isHighlighted: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  interactive: boolean;
  onClick?: () => void;
}) {
  const colors = CATEGORY_COLORS[element.category];

  const stateClasses = isCorrect
    ? 'ring-3 ring-green-500 ring-offset-1 scale-110 z-10'
    : isWrong
      ? 'ring-3 ring-red-500 ring-offset-1 shake'
      : isHighlighted
        ? 'ring-2 ring-primary ring-offset-1'
        : '';

  return (
    <button
      type="button"
      onClick={interactive ? onClick : undefined}
      disabled={!interactive}
      className={`
        element-cell w-full h-full min-h-[40px] sm:min-h-[48px] md:min-h-[56px] p-0.5 rounded-md border-2
        flex flex-col items-center justify-center text-center
        ${interactive ? 'hover:scale-110 hover:z-10 hover:shadow-lg cursor-pointer' : 'cursor-default'}
        ${colors.bg} ${colors.text} ${colors.border}
        ${stateClasses}
      `}
    >
      <span className="text-[7px] sm:text-[8px] md:text-[10px] text-warm-500 leading-none">
        {element.atomicNumber}
      </span>
      <span className="text-xs sm:text-sm md:text-lg font-bold leading-tight">
        {element.symbol}
      </span>
      <span className="text-[6px] sm:text-[7px] md:text-[9px] font-mono leading-none">
        {element.atomicMass.toFixed(1)}
      </span>
    </button>
  );
}

function EmptyCell() {
  return <div className="w-full h-full min-h-[40px] sm:min-h-[48px] md:min-h-[56px]" />;
}

export function PeriodicTable({
  onElementClick,
  highlightedElements,
  correctElement = null,
  wrongElement = null,
  interactive = true,
}: PeriodicTableProps) {
  const highlightSet = highlightedElements ?? new Set<string>();

  // Build periodic table grid (18 groups x 7 periods)
  const periodicGrid = useMemo(() => {
    const grid: (Element | null)[][] = [];
    for (let period = 1; period <= 7; period++) {
      const row: (Element | null)[] = [];
      for (let group = 1; group <= 18; group++) {
        const element = ELEMENTS.find((e) => e.period === period && e.group === group);
        row.push(element || null);
      }
      grid.push(row);
    }
    return grid;
  }, []);

  // Category legend
  const categories: { key: ElementCategory; label: string }[] = [
    { key: 'alkali-metal', label: 'Alkalimálmar' },
    { key: 'alkaline-earth', label: 'Jarðalkalimálmar' },
    { key: 'transition-metal', label: 'Skiptimálmar' },
    { key: 'post-transition-metal', label: 'P-málmar' },
    { key: 'metalloid', label: 'Hálfmálmar' },
    { key: 'nonmetal', label: 'Ómálmar' },
    { key: 'halogen', label: 'Halógen' },
    { key: 'noble-gas', label: 'Eðallofttegundir' },
  ];

  return (
    <div className="w-full">
      {/* Periodic Table Grid */}
      <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
        {/* Group numbers header */}
        {Array.from({ length: 18 }, (_, i) => (
          <div
            key={`group-${i + 1}`}
            className="text-center text-[8px] sm:text-[10px] md:text-xs text-warm-400 font-semibold py-0.5"
          >
            {i + 1}
          </div>
        ))}

        {/* Periodic table rows */}
        {periodicGrid.map((row, periodIdx) =>
          row.map((element, groupIdx) => (
            <div key={`${periodIdx}-${groupIdx}`} className="aspect-square">
              {element ? (
                <ElementCell
                  element={element}
                  isHighlighted={highlightSet.has(element.symbol)}
                  isCorrect={correctElement === element.symbol}
                  isWrong={wrongElement === element.symbol}
                  interactive={interactive}
                  onClick={() => onElementClick?.(element)}
                />
              ) : (
                <EmptyCell />
              )}
            </div>
          ))
        )}
      </div>

      {/* Category Legend */}
      <div className="mt-3 pt-3 border-t border-warm-200">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const colors = CATEGORY_COLORS[cat.key];
            return (
              <div
                key={cat.key}
                className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
              >
                {cat.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PeriodicTable;
