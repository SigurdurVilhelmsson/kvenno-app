import { useCallback, useRef } from 'react';
import { DraggableItemProps } from './types';

/**
 * DraggableItem Component
 *
 * A draggable item that can be picked up and dropped into zones.
 * Supports both mouse and touch interactions.
 */
export function DraggableItem({
  item,
  isDragging = false,
  onDragStart,
  onDragEnd,
  className = '',
}: DraggableItemProps) {
  const elementRef = useRef<HTMLDivElement>(null);

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

      onDragStart?.(item.id);
    },
    [item.id, item.disabled, onDragStart]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      // Reset visual feedback
      const target = e.currentTarget;
      target.style.transform = '';
      target.style.opacity = '';

      onDragEnd?.();
    },
    [onDragEnd]
  );

  return (
    <div
      ref={elementRef}
      draggable={!item.disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`
        draggable-item
        px-3 py-2 rounded-lg
        bg-white border-2 border-gray-200
        shadow-sm
        cursor-grab active:cursor-grabbing
        transition-all duration-150
        select-none
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
