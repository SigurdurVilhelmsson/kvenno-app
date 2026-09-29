import { useCallback, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from 'react';

import { revealInline, useIsPhone } from '@shared/utils';

import { ChainCard } from './RatioCard';
import { UnitsDisplay } from './UnitsDisplay';
import type { OrientedRatio, Quantity } from '../engine/units';

interface ChainRowProps {
  start: Quantity;
  startLabel?: string;
  /** The placed ratios, in order, each already oriented. */
  ratios: { key: string; ratio: OrientedRatio }[];
  /** Turn card `position` (0-based) over. Without it and `onRemove` the cards are read-only. */
  onFlip?: (position: number) => void;
  onRemove?: (position: number) => void;
  /** Shown after the starting measurement while no card is placed. */
  empty?: ReactNode;
  /** Extra classes for the row: its wide-screen wrapping, gaps and box. */
  className?: string;
  rowRef?: Ref<HTMLDivElement>;
  /** Marks each placed card's wrapper, for the tests and the reveals that look for it. */
  markSlots?: boolean;
  /** Makes the row a group with this accessible name (the read-only chain beside the prediction). */
  groupLabel?: string;
}

/** Fade the edge the row scrolls past, so a card cut off there reads as "more this way". */
const FADE = 24;

function fadeMask(left: boolean, right: boolean): string | undefined {
  if (!left && !right) return undefined;
  const from = left ? `transparent, black ${FADE}px` : 'black, black';
  const to = right ? `black calc(100% - ${FADE}px), transparent` : 'black';
  return `linear-gradient(to right, ${from}, ${to})`;
}

/**
 * The chain as the student built it: the measurement, then each ratio after a
 * multiplication sign.
 *
 * On a wide screen the cards wrap onto as many lines as they need, as they
 * always have. On a phone they stay on **one line** that scrolls sideways
 * (design §4, einingakedjan): wrapped, a three-card chain was three rows and
 * 300 px tall, and it grew every time a card was added. One row keeps its
 * height whatever the chain's length, so the chain can sit in a strip pinned
 * under the header while the student picks from the pool. When a card is added
 * the row scrolls to its end, where the new card is, and a faded edge marks
 * each side that has more to scroll to.
 */
export function ChainRow({
  start,
  startLabel,
  ratios,
  onFlip,
  onRemove,
  empty,
  className = '',
  rowRef,
  markSlots = false,
  groupLabel,
}: ChainRowProps) {
  const phone = useIsPhone();
  const ownRef = useRef<HTMLDivElement | null>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      ownRef.current = el;
      if (typeof rowRef === 'function') rowRef(el);
      else if (rowRef) rowRef.current = el;
    },
    [rowRef]
  );

  const measure = useCallback(() => {
    const el = ownRef.current;
    if (!el || !phone) {
      setEdges((e) => (e.left || e.right ? { left: false, right: false } : e));
      return;
    }
    const left = el.scrollLeft > 1;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setEdges((e) => (e.left === left && e.right === right ? e : { left, right }));
  }, [phone]);

  // A card added lands at the end of the row, off its right edge once the chain
  // is wider than the screen: bring it in. Turning a card over or taking one out
  // leaves the row where the student put it.
  const shownCount = useRef(ratios.length);
  useLayoutEffect(() => {
    const added = ratios.length > shownCount.current;
    shownCount.current = ratios.length;
    const el = ownRef.current;
    if (added && el) {
      const placed = el.querySelectorAll('[data-chain-card]');
      revealInline(placed[placed.length - 1], { inline: 'end' });
    }
    measure();
  }, [ratios.length, measure]);

  useLayoutEffect(() => {
    measure();
    if (!phone || typeof ResizeObserver === 'undefined' || !ownRef.current) return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(ownRef.current);
    return () => observer.disconnect();
  }, [phone, measure]);

  const mask = phone ? fadeMask(edges.left, edges.right) : undefined;

  // `relative` on a phone: the screen-reader text inside the cards is
  // absolutely positioned, and it is clipped by the row only when the row is
  // its containing block. Without it the page itself scrolled sideways.

  return (
    <div
      ref={setRef}
      role={groupLabel ? 'group' : undefined}
      aria-label={groupLabel}
      onScroll={phone ? measure : undefined}
      style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
      className={`flex items-stretch gap-3 phone:relative phone:flex-nowrap phone:gap-1.5 phone:overflow-x-auto phone:overscroll-x-contain ${className}`}
    >
      <div className="flex items-center rounded-lg bg-warm-100 px-3 py-2 phone:shrink-0 phone:px-2 phone:py-1">
        <UnitsDisplay quantity={start} valueLabel={startLabel} />
      </div>
      {ratios.map(({ key, ratio }, position) => (
        <div
          key={key}
          data-slot={markSlots ? '' : undefined}
          data-chain-card=""
          className="flex min-w-0 items-center gap-3 phone:shrink-0 phone:gap-1.5"
        >
          <span aria-hidden="true" className="text-warm-400">
            ×
          </span>
          <ChainCard
            ratio={ratio}
            position={position + 1}
            onFlip={onFlip ? () => onFlip(position) : undefined}
            onRemove={onRemove ? () => onRemove(position) : undefined}
          />
        </div>
      ))}
      {ratios.length === 0 && empty}
    </div>
  );
}
