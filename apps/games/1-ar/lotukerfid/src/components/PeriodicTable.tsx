import { useMemo, useRef, useState, useCallback, type KeyboardEvent } from 'react';

import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  ELEMENTS,
  type Element,
  type ElementCategory,
} from '../data/elements';

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

/** Two-letter Icelandic category abbreviation rendered in each cell. */
const CATEGORY_ABBR: Record<ElementCategory, string> = {
  'alkali-metal': 'Al',
  'alkaline-earth': 'Jm',
  'transition-metal': 'Sk',
  'post-transition-metal': 'Pm',
  metalloid: 'Hm',
  nonmetal: 'Óm',
  halogen: 'Ha',
  'noble-gas': 'Eð',
  lanthanide: 'La',
  actinide: 'Ac',
};

function ElementCell({
  element,
  isHighlighted,
  isCorrect,
  isWrong,
  interactive,
  tabIndex,
  onClick,
  onKeyDown,
  onFocus,
  buttonRef,
}: {
  element: Element;
  isHighlighted: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  interactive: boolean;
  tabIndex: number;
  onClick?: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  onFocus: () => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}) {
  const colors = CATEGORY_COLORS[element.category];
  const categoryLabel = CATEGORY_LABELS[element.category];

  const stateClasses = isCorrect
    ? 'ring-3 ring-green-500 ring-offset-1 scale-110 z-10'
    : isWrong
      ? 'ring-3 ring-red-500 ring-offset-1 shake'
      : isHighlighted
        ? 'ring-2 ring-primary ring-offset-1'
        : '';

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={interactive ? onClick : undefined}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      tabIndex={interactive ? tabIndex : -1}
      disabled={!interactive}
      aria-label={`${element.name} (${element.symbol}), atómnúmer ${element.atomicNumber}, ${categoryLabel}`}
      className={`
        element-cell relative w-full h-full min-h-[44px] sm:min-h-[48px] md:min-h-[56px] p-0.5 rounded-md border-2
        flex flex-col items-center justify-center text-center
        outline-none focus-visible:ring-3 focus-visible:ring-kvenno-orange focus-visible:ring-offset-1 focus-visible:z-20
        ${interactive ? 'hover:scale-110 hover:z-10 hover:shadow-lg cursor-pointer' : 'cursor-default'}
        ${colors.bg} ${colors.text} ${colors.border}
        ${stateClasses}
      `}
    >
      <span
        aria-hidden="true"
        className="absolute top-0 right-0.5 text-[6px] sm:text-[7px] md:text-[8px] font-semibold opacity-70 leading-none"
      >
        {CATEGORY_ABBR[element.category]}
      </span>
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
  return <div className="w-full h-full min-h-[44px] sm:min-h-[48px] md:min-h-[56px]" />;
}

export function PeriodicTable({
  onElementClick,
  highlightedElements,
  correctElement = null,
  wrongElement = null,
  interactive = true,
}: PeriodicTableProps) {
  const highlightSet = highlightedElements ?? new Set<string>();
  const [focusedSymbol, setFocusedSymbol] = useState<string | null>(null);
  const cellRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

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

  /** First real element in the grid — gets the initial tab stop. */
  const firstSymbol = useMemo(() => {
    for (const row of periodicGrid) {
      for (const cell of row) {
        if (cell) return cell.symbol;
      }
    }
    return null;
  }, [periodicGrid]);

  const moveFocus = useCallback(
    (fromPeriod: number, fromGroup: number, dPeriod: number, dGroup: number) => {
      // Scan in the given direction until a real element is found (skipping gaps).
      let p = fromPeriod + dPeriod;
      let g = fromGroup + dGroup;
      while (p >= 1 && p <= 7 && g >= 1 && g <= 18) {
        const target = ELEMENTS.find((e) => e.period === p && e.group === g);
        if (target) {
          const btn = cellRefs.current.get(target.symbol);
          if (btn) {
            btn.focus();
            return true;
          }
        }
        p += dPeriod;
        g += dGroup;
      }
      return false;
    },
    []
  );

  const handleCellKeyDown = useCallback(
    (element: Element) => (e: KeyboardEvent<HTMLButtonElement>) => {
      const keyMap: Record<string, [number, number] | undefined> = {
        ArrowRight: [0, 1],
        ArrowLeft: [0, -1],
        ArrowDown: [1, 0],
        ArrowUp: [-1, 0],
      };
      const delta = keyMap[e.key];
      if (delta) {
        e.preventDefault();
        moveFocus(element.period, element.group, delta[0], delta[1]);
      }
    },
    [moveFocus]
  );

  // Category legend
  const categories: { key: ElementCategory; label: string }[] = [
    { key: 'alkali-metal', label: `Al — ${CATEGORY_LABELS['alkali-metal']}ar` },
    { key: 'alkaline-earth', label: `Jm — ${CATEGORY_LABELS['alkaline-earth']}ar` },
    { key: 'transition-metal', label: `Sk — ${CATEGORY_LABELS['transition-metal']}ar` },
    { key: 'post-transition-metal', label: `Pm — ${CATEGORY_LABELS['post-transition-metal']}ar` },
    { key: 'metalloid', label: `Hm — ${CATEGORY_LABELS.metalloid}ar` },
    { key: 'nonmetal', label: `Óm — ${CATEGORY_LABELS.nonmetal}ar` },
    { key: 'halogen', label: `Ha — ${CATEGORY_LABELS.halogen}` },
    { key: 'noble-gas', label: `Eð — ${CATEGORY_LABELS['noble-gas']}ir` },
  ];

  return (
    <div className="w-full">
      {/* Periodic Table Grid */}
      <div
        role="grid"
        aria-label="Lotukerfið"
        className="grid gap-0.5"
        style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}
      >
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
                  tabIndex={(focusedSymbol ?? firstSymbol) === element.symbol ? 0 : -1}
                  buttonRef={(el) => {
                    if (el) cellRefs.current.set(element.symbol, el);
                    else cellRefs.current.delete(element.symbol);
                  }}
                  onClick={() => onElementClick?.(element)}
                  onKeyDown={handleCellKeyDown(element)}
                  onFocus={() => setFocusedSymbol(element.symbol)}
                />
              ) : (
                <EmptyCell />
              )}
            </div>
          ))
        )}
      </div>

      {/* Category Legend (includes abbreviations for color-blind users) */}
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
