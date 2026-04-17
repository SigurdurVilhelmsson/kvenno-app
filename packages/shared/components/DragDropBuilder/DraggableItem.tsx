import { useCallback, useRef } from 'react';

import { DraggableItemProps } from './types';

/**
 * Walk up from an element looking for the closest ancestor with a `data-zone-id`.
 * Returns the zone id, or null if no zone ancestor exists.
 */
function findZoneIdAt(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y) as HTMLElement | null;
  if (!el) return null;
  const zone = el.closest<HTMLElement>('[data-zone-id]');
  return zone?.dataset.zoneId ?? null;
}

/**
 * DraggableItem Component
 *
 * A draggable item that can be picked up and dropped into zones.
 * Supports both mouse and touch interactions.
 *
 * Touch support: HTML5 drag-drop doesn't fire on touch. On touchmove we preview the
 * zone under the finger via `document.elementFromPoint`; on touchend, if the finger is
 * over a `[data-zone-id]`, we emit `onTouchDrop(itemId, zoneId)` so DragDropBuilder
 * can commit the drop through the same code path as mouse drops.
 */
export function DraggableItem({
  item,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onTouchDrop,
  className = '',
}: DraggableItemProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const lastTouchedZone = useRef<string | null>(null);

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

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (item.disabled) return;

      // Add visual feedback
      const target = e.currentTarget;
      target.style.transform = 'scale(1.05)';
      target.style.opacity = '0.8';

      lastTouchedZone.current = null;
      onDragStart?.(item.id);
    },
    [item.id, item.disabled, onDragStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (item.disabled) return;
      // Prevent scrolling while dragging; reliable drop detection requires the touch
      // to stay "captured" by the item element.
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      lastTouchedZone.current = findZoneIdAt(touch.clientX, touch.clientY);
    },
    [item.disabled]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      // Reset visual feedback
      const target = e.currentTarget;
      target.style.transform = '';
      target.style.opacity = '';

      // Use the last-seen zone (from touchmove) or re-check at touchend for single-tap-release.
      const touch = e.changedTouches[0];
      const zoneId =
        lastTouchedZone.current ?? (touch ? findZoneIdAt(touch.clientX, touch.clientY) : null);

      if (zoneId && !item.disabled) {
        onTouchDrop?.(item.id, zoneId);
      }
      lastTouchedZone.current = null;
      onDragEnd?.();
    },
    [item.id, item.disabled, onDragEnd, onTouchDrop]
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
      className={`
        draggable-item
        px-3 py-2 rounded-lg
        bg-white border-2 border-gray-200
        shadow-sm
        cursor-grab active:cursor-grabbing
        transition-all duration-150
        select-none
        touch-none
        ${isDragging ? 'opacity-50 scale-95' : 'hover:border-blue-300 hover:shadow-md'}
        ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      data-item-id={item.id}
      data-category={item.category}
      role="button"
      aria-grabbed={isDragging}
      aria-disabled={item.disabled}
      tabIndex={item.disabled ? -1 : 0}
    >
      {item.content}
    </div>
  );
}

export default DraggableItem;
