import { useState, useCallback, useRef } from 'react';

import { DraggableItem } from './DraggableItem';
import type { DropZoneProps } from './types';

/** The phone-only item padding `compact` adds, in the pool and in every zone alike. */
export const COMPACT_ITEM = 'phone:px-2 phone:py-1';

/**
 * DropZone Component
 *
 * A target zone where draggable items can be dropped.
 * Supports reordering of items within the zone.
 *
 * While an item is picked up by tap/click/keyboard (`selectedId`), a zone that can take it
 * (`isTarget`) is highlighted and placing is one tap, click or Enter on the zone.
 */
export function DropZone({
  zone,
  items,
  isOver = false,
  canDrop = true,
  onDrop,
  onReorder,
  onTouchDrop,
  onTouchOver,
  selectedId = null,
  isTarget = false,
  onActivate,
  onActivateItem,
  onItemDragStart,
  onItemDragEnd,
  orientation = 'horizontal',
  compact = false,
  className = '',
  renderItem,
}: DropZoneProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [localDraggingId, setLocalDraggingId] = useState<string | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      if (!canDrop) {
        e.dataTransfer.dropEffect = 'none';
        return;
      }

      e.dataTransfer.dropEffect = 'move';

      // Calculate drop index based on mouse position
      if (!zoneRef.current) return;

      const children = Array.from(zoneRef.current.querySelectorAll('.draggable-item'));
      const rect = zoneRef.current.getBoundingClientRect();

      if (orientation === 'horizontal') {
        const mouseX = e.clientX - rect.left;
        let newIndex = children.length;

        for (let i = 0; i < children.length; i++) {
          const childRect = children[i].getBoundingClientRect();
          const childCenter = childRect.left - rect.left + childRect.width / 2;
          if (mouseX < childCenter) {
            newIndex = i;
            break;
          }
        }
        setDragOverIndex(newIndex);
      } else {
        const mouseY = e.clientY - rect.top;
        let newIndex = children.length;

        for (let i = 0; i < children.length; i++) {
          const childRect = children[i].getBoundingClientRect();
          const childCenter = childRect.top - rect.top + childRect.height / 2;
          if (mouseY < childCenter) {
            newIndex = i;
            break;
          }
        }
        setDragOverIndex(newIndex);
      }
    },
    [canDrop, orientation]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const itemId = e.dataTransfer.getData('text/plain');
      const dropIndex = dragOverIndex ?? items.length;

      setDragOverIndex(null);

      if (!itemId || !canDrop) return;

      // Check if this is a reorder within the same zone
      const existingIndex = items.findIndex((item) => item.id === itemId);
      if (existingIndex !== -1) {
        // Reordering within zone
        const newOrder = [...items.map((item) => item.id)];
        newOrder.splice(existingIndex, 1);
        newOrder.splice(dropIndex > existingIndex ? dropIndex - 1 : dropIndex, 0, itemId);
        onReorder?.(newOrder);
      } else {
        // New item dropped
        onDrop?.(itemId, dropIndex);
      }
    },
    [items, dragOverIndex, canDrop, onDrop, onReorder]
  );

  const handleItemDragStart = useCallback(
    (itemId: string) => {
      setLocalDraggingId(itemId);
      onItemDragStart?.(itemId);
    },
    [onItemDragStart]
  );

  const handleItemDragEnd = useCallback(() => {
    setLocalDraggingId(null);
    onItemDragEnd?.();
  }, [onItemDragEnd]);

  // Clicks on an item stop propagation, so this only sees the zone itself.
  const handleClick = useCallback(() => {
    if (isTarget) onActivate?.();
  }, [isTarget, onActivate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isTarget || e.target !== e.currentTarget) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate?.();
      }
    },
    [isTarget, onActivate]
  );

  const isFull = zone.maxItems !== undefined && items.length >= zone.maxItems;
  // A full single-item zone still takes a drop (the new item swaps in), so it lights up too.
  const showDropIndicator = isOver && canDrop && (!isFull || zone.maxItems === 1);
  // Dim the zones a picked-up item cannot go to — but not the one it is sitting in, or the
  // item the student just selected would itself look disabled.
  const picking = selectedId !== null && !items.some((item) => item.id === selectedId);

  // `compact` (see DragDropBuilderProps) changes nothing but `phone:` classes, so a
  // desktop window, and any screen taller than 500 px from `sm` up, renders as before.
  // The label stays in the accessibility tree (sr-only, never display:none), though the
  // group's aria-label already names the zone. The capacity count goes into the corner,
  // with room kept for it on the right so it never sits on an item; a one-item zone
  // shows no count at all, since the zone being filled already says 1 / 1.
  const showCapacity = zone.maxItems !== undefined;
  const cornerCount = compact && showCapacity && zone.maxItems !== 1;
  const compactZone = compact
    ? `phone:relative phone:min-h-11 phone:p-2 ${cornerCount ? 'phone:pr-10' : ''}`
    : '';
  const compactCapacity = compact
    ? zone.maxItems === 1
      ? 'phone:hidden'
      : 'phone:absolute phone:top-1 phone:right-2 phone:mt-0'
    : '';
  const compactItem = compact ? COMPACT_ITEM : '';

  return (
    <div
      ref={zoneRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        drop-zone
        min-h-[60px] p-3 rounded-xl
        border-2 border-dashed
        transition-all duration-200
        ${showDropIndicator || isTarget ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}
        ${!canDrop && isOver ? 'border-red-300 bg-red-50' : ''}
        ${isFull && !isTarget && !showDropIndicator ? 'border-amber-300 bg-amber-50' : ''}
        ${isTarget ? 'cursor-pointer' : ''}
        ${picking && !isTarget ? 'opacity-60' : ''}
        ${compactZone}
        ${className}
      `}
      data-zone-id={zone.id}
      role="group"
      tabIndex={isTarget ? 0 : undefined}
      aria-label={zone.label || `Drop zone ${zone.id}`}
    >
      {/* Zone label */}
      {zone.label && (
        <div className={`text-xs font-medium text-gray-500 mb-2 ${compact ? 'phone:sr-only' : ''}`}>
          {zone.label}
        </div>
      )}

      {/* Items container */}
      <div
        className={`
          flex gap-2
          ${orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'}
        `}
      >
        {items.length === 0 && zone.placeholder && (
          <div className={`text-gray-400 text-sm italic py-2 ${compact ? 'phone:py-0.5' : ''}`}>
            {zone.placeholder}
          </div>
        )}

        {items.map((item, index) => (
          <div key={item.id} className="relative">
            {/* Drop indicator line */}
            {dragOverIndex === index && (
              <div
                className={`
                  absolute bg-blue-500 rounded-full
                  ${
                    orientation === 'horizontal'
                      ? 'w-1 h-full -left-1.5 top-0'
                      : 'h-1 w-full -top-1.5 left-0'
                  }
                `}
              />
            )}

            {renderItem ? (
              renderItem(item, index)
            ) : (
              <DraggableItem
                item={item}
                isDragging={localDraggingId === item.id}
                isSelected={selectedId === item.id}
                onDragStart={handleItemDragStart}
                onDragEnd={handleItemDragEnd}
                onTouchDrop={onTouchDrop}
                onTouchOver={onTouchOver}
                onActivate={onActivateItem}
                className={compactItem}
              />
            )}
          </div>
        ))}

        {/* Drop indicator at end */}
        {dragOverIndex === items.length && items.length > 0 && (
          <div
            className={`
              bg-blue-500 rounded-full
              ${orientation === 'horizontal' ? 'w-1 h-8 self-center' : 'h-1 w-full'}
            `}
          />
        )}
      </div>

      {/* Capacity indicator */}
      {showCapacity && (
        <div className={`text-xs text-gray-400 mt-2 text-right ${compactCapacity}`}>
          {items.length} / {zone.maxItems}
        </div>
      )}
    </div>
  );
}

export default DropZone;
