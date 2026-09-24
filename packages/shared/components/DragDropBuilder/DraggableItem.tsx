import { useCallback, useEffect, useRef } from 'react';

import { DraggableItemProps } from './types';

/** Reported by a touch drag released over the items pool rather than a zone. */
export const POOL_TARGET_ID = '__pool__';

/** Finger travel (px) before a touch counts as a drag rather than a tap. */
const DRAG_THRESHOLD = 8;
/**
 * Distance (px) from the top/bottom of the viewport inside which a touch drag scrolls the page.
 * The item under the finger blocks native scrolling (it must, or the page would scroll instead
 * of the item moving), so without this a zone below the fold could not be reached. The top band
 * is deeper because the game header is sticky and covers the top of the viewport.
 */
const EDGE_TOP = 110;
const EDGE_BOTTOM = 72;

/**
 * Find the drop target under a viewport point: the nearest `[data-zone-id]` ancestor, or the
 * items pool (`[data-drop-pool]`), or null.
 */
function findDropTargetAt(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y) as HTMLElement | null;
  if (!el) return null;
  const zone = el.closest<HTMLElement>('[data-zone-id]');
  if (zone?.dataset.zoneId) return zone.dataset.zoneId;
  return el.closest('[data-drop-pool]') ? POOL_TARGET_ID : null;
}

interface TouchDrag {
  startX: number;
  startY: number;
  startScrollY: number;
  x: number;
  y: number;
  dragging: boolean;
  frame: number | null;
  el: HTMLDivElement;
}

/**
 * DraggableItem Component
 *
 * A draggable item that can be picked up and dropped into zones.
 * Supports mouse, touch and keyboard.
 *
 * - Mouse: HTML5 drag-and-drop, or click to pick up and click a zone to place.
 * - Touch: HTML5 drag-drop doesn't fire on touch. A finger drag moves the item under the
 *   finger (the item has `touch-action: none`, so the page does not scroll instead), previews
 *   the zone under it via `document.elementFromPoint`, and auto-scrolls near the viewport
 *   edges. On release over a `[data-zone-id]` (or the pool) it emits `onTouchDrop` so
 *   DragDropBuilder commits the drop through the same code path as mouse drops. A tap without
 *   movement picks the item up instead (`onActivate`), for tap-to-place.
 * - Keyboard: Enter or Space picks the item up (`onActivate`).
 */
export function DraggableItem({
  item,
  isDragging = false,
  isSelected = false,
  onDragStart,
  onDragEnd,
  onTouchDrop,
  onTouchOver,
  onActivate,
  className = '',
}: DraggableItemProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<TouchDrag | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (item.disabled) {
        e.preventDefault();
        return;
      }

      // Set drag data
      e.dataTransfer.setData('text/plain', item.id);
      e.dataTransfer.effectAllowed = 'move';

      // Set drag image offset to center
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        e.dataTransfer.setDragImage(elementRef.current, rect.width / 2, rect.height / 2);
      }

      onDragStart?.(item.id);
    },
    [item.id, item.disabled, onDragStart]
  );

  const handleDragEnd = useCallback(() => {
    onDragEnd?.();
  }, [onDragEnd]);

  // --- Touch -------------------------------------------------------------------------------

  /** Move the item under the finger and report the target beneath it. */
  const followFinger = useCallback(
    (st: TouchDrag) => {
      const dx = st.x - st.startX;
      const dy = st.y - st.startY + (window.scrollY - st.startScrollY);
      st.el.style.transform = `translate(${dx}px, ${dy}px) scale(1.05)`;
      // The item has pointer-events: none while dragged, so this sees what is beneath it.
      onTouchOver?.(findDropTargetAt(st.x, st.y));
    },
    [onTouchOver]
  );

  const resetDragStyles = (el: HTMLDivElement) => {
    el.style.transform = '';
    el.style.opacity = '';
    el.style.transition = '';
    el.style.position = '';
    el.style.zIndex = '';
    el.style.pointerEvents = '';
    el.style.boxShadow = '';
  };

  const endTouch = useCallback(() => {
    const st = touchRef.current;
    touchRef.current = null;
    if (!st) return null;
    if (st.frame !== null) cancelAnimationFrame(st.frame);
    if (st.dragging) {
      resetDragStyles(st.el);
      onTouchOver?.(null);
    }
    return st;
  }, [onTouchOver]);

  // Never leave an auto-scroll loop running if the item unmounts mid-drag.
  useEffect(() => () => void endTouch(), [endTouch]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (item.disabled) return;
      const touch = e.touches[0];
      if (!touch || e.touches.length > 1) return;
      touchRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startScrollY: window.scrollY,
        x: touch.clientX,
        y: touch.clientY,
        dragging: false,
        frame: null,
        el: e.currentTarget,
      };
    },
    [item.disabled]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const st = touchRef.current;
      const touch = e.touches[0];
      if (!st || !touch || item.disabled) return;
      st.x = touch.clientX;
      st.y = touch.clientY;

      if (!st.dragging) {
        if (Math.hypot(st.x - st.startX, st.y - st.startY) < DRAG_THRESHOLD) return;
        // Lift the item: it follows the finger above the page until released.
        st.dragging = true;
        const el = st.el;
        el.style.transition = 'none';
        el.style.position = 'relative';
        el.style.zIndex = '50';
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.9';
        el.style.boxShadow = '0 10px 24px rgba(0, 0, 0, 0.25)';
        onDragStart?.(item.id);

        const autoScroll = () => {
          if (touchRef.current !== st) return;
          const bottom = window.innerHeight - EDGE_BOTTOM;
          // Only toward the edge the finger is heading for: an item picked up inside a band
          // (likely on a short landscape screen) must not start the page moving by itself.
          let speed = 0;
          if (st.y < EDGE_TOP && st.y < st.startY) speed = -Math.ceil((EDGE_TOP - st.y) / 6);
          else if (st.y > bottom && st.y > st.startY) speed = Math.ceil((st.y - bottom) / 6);
          if (speed !== 0) {
            window.scrollBy(0, speed);
            followFinger(st);
          }
          st.frame = requestAnimationFrame(autoScroll);
        };
        st.frame = requestAnimationFrame(autoScroll);
      }
      followFinger(st);
    },
    [item.id, item.disabled, onDragStart, followFinger]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      // Read the target while the lifted item still lets hit-testing pass through it, at the
      // last position the finger was seen.
      const lifted = touchRef.current;
      const targetId = lifted?.dragging ? findDropTargetAt(lifted.x, lifted.y) : null;
      const st = endTouch();
      if (!st || item.disabled) return;

      if (!st.dragging) {
        // A tap. Handle it here and suppress the emulated click that would follow, so the
        // item is not toggled twice.
        e.preventDefault();
        onActivate?.(item.id);
        return;
      }

      if (targetId) onTouchDrop?.(item.id, targetId);
      onDragEnd?.();
    },
    [item.id, item.disabled, endTouch, onActivate, onTouchDrop, onDragEnd]
  );

  const handleTouchCancel = useCallback(() => {
    const st = endTouch();
    if (st?.dragging) onDragEnd?.();
  }, [endTouch, onDragEnd]);

  // --- Click and keyboard ------------------------------------------------------------------

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // The zone or pool around the item has its own click meaning (place / return).
      e.stopPropagation();
      if (!item.disabled) onActivate?.(item.id);
    },
    [item.id, item.disabled, onActivate]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (item.disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        onActivate?.(item.id);
      }
    },
    [item.id, item.disabled, onActivate]
  );

  return (
    <div
      ref={elementRef}
      draggable={!item.disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        draggable-item
        px-3 py-2 rounded-lg
        bg-white border-2
        shadow-sm
        cursor-grab active:cursor-grabbing
        transition-all duration-150
        select-none
        touch-none
        ${isSelected ? 'border-blue-500 ring-4 ring-blue-300 shadow-md -translate-y-0.5' : 'border-gray-200'}
        ${isDragging ? 'opacity-50 scale-95' : 'hover:border-blue-300 hover:shadow-md'}
        ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      data-item-id={item.id}
      data-category={item.category}
      role="button"
      aria-grabbed={isDragging}
      aria-pressed={isSelected}
      aria-disabled={item.disabled}
      tabIndex={item.disabled ? -1 : 0}
    >
      {item.content}
    </div>
  );
}

export default DraggableItem;
