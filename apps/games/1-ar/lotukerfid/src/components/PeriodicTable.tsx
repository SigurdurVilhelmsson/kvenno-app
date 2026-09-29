import { useEffect, useMemo, useRef, useState, useCallback, type KeyboardEvent } from 'react';

import { PhoneDisclosure } from '@shared/components';
import { formatDecimal, revealInline } from '@shared/utils';

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
  /**
   * Whether each cell shows its category — colour, the two-letter badge, the
   * legend, and the category in the accessible name. Default `true`.
   *
   * Set `false` while a question asks the student to classify an element or to
   * name what a group has in common: with it `true` the table below the
   * question answers the question. Position stays visible, which is the datum
   * the level actually teaches them to read.
   */
  showCategories?: boolean;
  /**
   * Whether each cell shows its atomic mass. Default `true`.
   *
   * Set `false` while a question asks the student to order elements by mass,
   * for the same reason.
   */
  showMasses?: boolean;
}

/**
 * Whether the student has swiped a table sideways since the page loaded. Shared
 * by every table on the page, so a level's later tables start without the hint.
 */
let swipedThisVisit = false;

/** Two-letter Icelandic category abbreviation rendered in each cell. */
const CATEGORY_ABBR: Record<ElementCategory, string> = {
  'alkali-metal': 'Al',
  'alkaline-earth': 'Jm',
  'transition-metal': 'Hl',
  'post-transition-metal': 'Pm',
  metalloid: 'Hm',
  nonmetal: 'Ml',
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
  showCategory,
  showMass,
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
  showCategory: boolean;
  showMass: boolean;
  tabIndex: number;
  onClick?: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  onFocus: () => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}) {
  const colors = showCategory ? CATEGORY_COLORS[element.category] : MASKED_COLORS;
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
      aria-label={
        showCategory
          ? `${element.name} (${element.symbol}), sætistala ${element.atomicNumber}, ${categoryLabel}`
          : `${element.name} (${element.symbol}), sætistala ${element.atomicNumber}`
      }
      className={`
        element-cell relative w-full h-full min-h-[52px] md:min-h-[56px] phone:min-h-[46px] px-0 py-0.5 md:p-0.5 phone:py-0 rounded-md border-2
        flex flex-col items-center justify-center text-center
        outline-none focus-visible:ring-3 focus-visible:ring-kvenno-orange focus-visible:ring-offset-1 focus-visible:z-20
        ${interactive ? 'hover:scale-110 hover:z-10 hover:shadow-lg cursor-pointer' : 'cursor-default'}
        ${colors.bg} ${colors.text} ${colors.border}
        ${stateClasses}
      `}
    >
      {/* Below md the cell is wide enough for readable text only if the
          number and the category badge share the top row; from md the badge
          returns to its corner and the number to the centre. On a phone the
          three lines sit without padding or leading, so a cell is 46 px square
          and the whole table stands on one screen with its question. */}
      <span className="flex w-full items-start justify-between gap-0.5 px-px md:contents">
        <span className="text-xs md:text-[10px] text-warm-500 leading-none">
          {element.atomicNumber}
        </span>
        {showCategory && (
          <span
            aria-hidden="true"
            className="md:absolute md:top-0 md:right-0.5 text-xs md:text-[8px] font-semibold opacity-70 leading-none"
          >
            {CATEGORY_ABBR[element.category]}
          </span>
        )}
      </span>
      <span className="text-base md:text-lg font-bold leading-tight phone:leading-none">
        {element.symbol}
      </span>
      <span
        className="text-xs md:text-[9px] font-mono leading-none"
        aria-hidden={showMass ? undefined : true}
      >
        {showMass ? formatDecimal(element.atomicMass, 1) : '\u00A0'}
      </span>
    </button>
  );
}

/** Neutral cell palette used when the category is masked. */
const MASKED_COLORS = {
  bg: 'bg-warm-100',
  text: 'text-warm-700',
  border: 'border-warm-300',
};

function EmptyCell() {
  return <div className="w-full h-full min-h-[52px] md:min-h-[56px] phone:min-h-[46px]" />;
}

/**
 * A cell of period 7 when the game places no element there. On a phone the
 * row shrinks to a 12 px strip of faint cells rather than a full row of blank
 * space, so the table still reads as seven periods — the intro says
 * `Lotukerfið hefur 7 lotur` — without spending a row's height on nothing.
 * Everywhere else it is the blank cell it always was.
 */
function PlaceholderCell() {
  return (
    <div className="w-full h-full min-h-[52px] md:min-h-[56px] phone:min-h-0 phone:h-3 phone:rounded-sm phone:bg-warm-100" />
  );
}

export function PeriodicTable({
  onElementClick,
  highlightedElements,
  correctElement = null,
  wrongElement = null,
  interactive = true,
  showCategories = true,
  showMasses = true,
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

  // Below md the grid is wider than the screen and scrolls sideways inside
  // this box. From md up nothing overflows and none of the below scrolls.
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Which sides of the box have more table beyond them, for the fades that
  // show the grid is cut by the box and not simply over.
  const [moreBeyond, setMoreBeyond] = useState({ start: false, end: false });
  const updateMoreBeyond = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const max = scroller.scrollWidth - scroller.clientWidth;
    const start = scroller.scrollLeft > 1;
    const end = scroller.scrollLeft < max - 1;
    setMoreBeyond((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);
  useEffect(() => {
    updateMoreBeyond();
    const scroller = scrollerRef.current;
    if (!scroller || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateMoreBeyond);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [updateMoreBeyond]);

  // The swipe hint, and whether a finger is on the box: only a scroll made
  // while touching counts as the student's own swipe, not the reset and the
  // reveal below.
  const [hideSwipeHint, setHideSwipeHint] = useState(() => swipedThisVisit);
  const touching = useRef(false);
  const onScroll = () => {
    updateMoreBeyond();
    if (touching.current) swipedThisVisit = true;
  };

  // Whatever the table is pointing at — the highlighted elements, the correct
  // cell, the one just tapped — is brought into the box's view, because a
  // desktop student sees all of it at once: their joint extent centred when it
  // fits the box, else the primary cell. The box only overflows below md, so
  // this scrolls there at any width (`anyWidth`), as it always has.
  const primarySymbol = correctElement ?? [...highlightSet][0] ?? wrongElement ?? null;
  const revealKey = [primarySymbol, wrongElement, ...highlightSet].filter(Boolean).join(',');
  useEffect(() => {
    // A student who has already swiped the table sideways knows it scrolls:
    // from the next thing it points at on, a phone drops the swipe hint. Not
    // the moment they swipe, which would shift the table under their finger.
    if (swipedThisVisit) setHideSwipeHint(true);
    const scroller = scrollerRef.current;
    if (!scroller || scroller.scrollWidth <= scroller.clientWidth) return;
    // Nothing to point at — a new question that has not been answered yet —
    // so every question starts from the same place, the table's left edge.
    if (!revealKey) {
      scroller.scrollLeft = 0;
      return;
    }
    const cellOf = (symbol: string | null) => (symbol ? cellRefs.current.get(symbol) : undefined);
    const cells = revealKey
      .split(',')
      .map(cellOf)
      .filter((c): c is HTMLButtonElement => !!c);
    revealInline(cellOf(primarySymbol) ?? cells[0], {
      inline: 'center',
      together: cells,
      anyWidth: true,
    });
  }, [revealKey, primarySymbol]);

  // The trailing period-7 row, when the game places no element in it. It stays
  // in the grid; on a phone it shrinks to a placeholder strip.
  const lastRow = periodicGrid.length - 1;
  const lastRowEmpty = periodicGrid[lastRow].every((cell) => cell === null);

  // Category legend.
  //
  // The plurals are declared rather than built by appending to the singular:
  // `málmur` pluralises to `málmar`, not `málmurar`, so the six -ur nouns here
  // came out as non-words. `Halógen` is neuter and unchanged in the plural.
  const categories: { key: ElementCategory; label: string }[] = [
    { key: 'alkali-metal', label: 'Al — Alkalímálmar' },
    { key: 'alkaline-earth', label: 'Jm — Jarðalkalímálmar' },
    { key: 'transition-metal', label: 'Hl — Hliðarmálmar' },
    { key: 'post-transition-metal', label: 'Pm — P-málmar' },
    { key: 'metalloid', label: 'Hm — Hálfmálmar' },
    { key: 'nonmetal', label: 'Ml — Málmleysingjar' },
    { key: 'halogen', label: 'Ha — Halógen' },
    { key: 'noble-gas', label: 'Eð — Eðalgös' },
  ];

  return (
    <div className="w-full">
      {/* Periodic Table Grid. Eighteen columns cannot fit a phone at a size a
          finger can hit or an eye can read, so below md every column keeps at
          least 46px and the grid scrolls sideways inside its own box; the
          padding keeps a ringed or enlarged cell from being clipped by it.
          From md the columns share the width, as they always have. */}
      <p
        className={`md:hidden text-center text-xs text-warm-500 mb-1 ${hideSwipeHint ? 'phone:hidden' : ''}`}
      >
        Strjúktu til hliðar til að sjá allt lotukerfið →
      </p>
      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          onTouchStart={() => {
            touching.current = true;
          }}
          onTouchEnd={() => {
            touching.current = false;
          }}
          onTouchCancel={() => {
            touching.current = false;
          }}
          className="overflow-x-auto overscroll-x-contain px-1.5 py-1 md:overflow-visible md:p-0"
        >
          <div
            role="grid"
            aria-label="Lotukerfið"
            className="grid gap-0.5 grid-cols-[repeat(18,minmax(46px,1fr))] md:grid-cols-[repeat(18,minmax(0,1fr))]"
          >
            {/* Group numbers header */}
            {Array.from({ length: 18 }, (_, i) => (
              <div
                key={`group-${i + 1}`}
                className="text-center text-xs text-warm-400 font-semibold py-0.5 phone:py-0"
              >
                {i + 1}
              </div>
            ))}

            {/* Periodic table rows */}
            {periodicGrid.map((row, periodIdx) => {
              const placeholder = lastRowEmpty && periodIdx === lastRow;
              return row.map((element, groupIdx) => (
                <div
                  key={`${periodIdx}-${groupIdx}`}
                  className={placeholder ? 'aspect-square phone:aspect-auto' : 'aspect-square'}
                >
                  {element ? (
                    <ElementCell
                      element={element}
                      isHighlighted={highlightSet.has(element.symbol)}
                      isCorrect={correctElement === element.symbol}
                      isWrong={wrongElement === element.symbol}
                      interactive={interactive}
                      showCategory={showCategories}
                      showMass={showMasses}
                      tabIndex={(focusedSymbol ?? firstSymbol) === element.symbol ? 0 : -1}
                      buttonRef={(el) => {
                        if (el) cellRefs.current.set(element.symbol, el);
                        else cellRefs.current.delete(element.symbol);
                      }}
                      onClick={() => onElementClick?.(element)}
                      onKeyDown={handleCellKeyDown(element)}
                      onFocus={() => setFocusedSymbol(element.symbol)}
                    />
                  ) : placeholder ? (
                    <PlaceholderCell />
                  ) : (
                    <EmptyCell />
                  )}
                </div>
              ));
            })}
          </div>
        </div>
        {moreBeyond.start && (
          <div
            aria-hidden="true"
            className="md:hidden pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-white to-transparent"
          />
        )}
        {moreBeyond.end && (
          <div
            aria-hidden="true"
            className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-white to-transparent"
          />
        )}
      </div>

      {/* Category Legend (includes abbreviations for color-blind users). A
          reference the student opens when they need it, so on a phone it
          starts closed behind a button (design P9); everywhere else it shows
          as it always has. */}
      {showCategories && (
        <PhoneDisclosure
          summary="Tegundir frumefna"
          className="mt-3 pt-3 border-t border-warm-200 phone:mt-2 phone:pt-2"
          buttonClassName="text-sm text-warm-700"
        >
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => {
              const colors = CATEGORY_COLORS[cat.key];
              return (
                <div
                  key={cat.key}
                  className={`px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
                >
                  {cat.label}
                </div>
              );
            })}
          </div>
        </PhoneDisclosure>
      )}
    </div>
  );
}

export default PeriodicTable;
