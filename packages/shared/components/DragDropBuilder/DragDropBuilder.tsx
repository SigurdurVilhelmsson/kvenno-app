import { useState, useCallback, useMemo } from 'react';
import {
  DragDropBuilderProps,
  DraggableItemData,
  ZoneState,
  DropResult,
} from './types';
import { DraggableItem } from './DraggableItem';
import { DropZone } from './DropZone';

/**
 * DragDropBuilder Component
 *
 * A flexible drag-and-drop interface for building sequences, equations,
 * or any ordered composition from a pool of items.
 *
 * Features:
 * - HTML5 drag-and-drop API (no external dependencies)
 * - Touch support for tablets
 * - Snap-to-zone with visual feedback
 * - Reorder capability within zones
 * - Validation callbacks
 *
 * @example
 * ```tsx
 * <DragDropBuilder
 *   items={[
 *     { id: 'h2', content: 'H₂' },
 *     { id: 'o2', content: 'O₂' },
 *     { id: 'h2o', content: 'H₂O' },
 *   ]}
 *   zones={[
 *     { id: 'reactants', label: 'Reactants', maxItems: 2 },
 *     { id: 'products', label: 'Products', maxItems: 1 },
 *   ]}
 *   onDrop={(result) => console.log('Dropped:', result)}
 *   validateDrop={(itemId, zoneId) => true}
 * />
 * ```
 */
export function DragDropBuilder({
  items,
  zones,
  initialState = {},
  onDrop,
  onReorder,
  validateDrop,
  orientation = 'horizontal',
  disabled = false,
  className = '',
  itemsPoolClassName = '',
  zonesClassName = '',
}: DragDropBuilderProps) {
  // State tracking which items are in which zones
  const [zoneState, setZoneState] = useState<ZoneState>(() => {
    // Initialize with provided state or empty zones
    const state: ZoneState = {};
    for (const zone of zones) {
      state[zone.id] = initialState[zone.id] || [];
    }
    return state;
  });

  // Track which item is currently being dragged
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overZoneId, setOverZoneId] = useState<string | null>(null);

  // Items available in the pool (not in any zone)
  const poolItems = useMemo(() => {
    const assignedIds = new Set(Object.values(zoneState).flat());
    return items.filter((item) => !assignedIds.has(item.id));
  }, [items, zoneState]);

  // Get items for a specific zone
  const getZoneItems = useCallback(
    (zoneId: string): DraggableItemData[] => {
      const itemIds = zoneState[zoneId] || [];
      return itemIds
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is DraggableItemData => item !== undefined);
    },
    [items, zoneState]
  );

  // Check if a drop is valid
  const canDropInZone = useCallback(
    (itemId: string, zoneId: string): boolean => {
      if (disabled) return false;

      const item = items.find((i) => i.id === itemId);
      const zone = zones.find((z) => z.id === zoneId);

      if (!item || !zone) return false;
      if (item.disabled) return false;

      // Check category restrictions
      if (zone.acceptedCategories && item.category) {
        if (!zone.acceptedCategories.includes(item.category)) {
          return false;
        }
      }

      // Check max items
      if (zone.maxItems !== undefined) {
        const currentItems = zoneState[zoneId] || [];
        // Allow if item is already in zone (reordering)
        if (!currentItems.includes(itemId) && currentItems.length >= zone.maxItems) {
          return false;
        }
      }

      // Custom validation
      if (validateDrop && !validateDrop(itemId, zoneId)) {
        return false;
      }

      return true;
    },
    [disabled, items, zones, zoneState, validateDrop]
  );

  // Handle drop from pool to zone
  const handleZoneDrop = useCallback(
    (zoneId: string) => (itemId: string, index: number) => {
      if (!canDropInZone(itemId, zoneId)) return;

      // Find where the item currently is
      let fromZoneId: string | undefined;
      for (const [zId, itemIds] of Object.entries(zoneState)) {
        if (itemIds.includes(itemId)) {
          fromZoneId = zId;
          break;
        }
      }

      setZoneState((prev) => {
        const newState = { ...prev };

        // Remove from previous location
        if (fromZoneId) {
          newState[fromZoneId] = prev[fromZoneId].filter((id) => id !== itemId);
        }

        // Add to new zone at specified index
        const targetIds = [...(prev[zoneId] || [])];
        targetIds.splice(index, 0, itemId);
        newState[zoneId] = targetIds;

        return newState;
      });

      const result: DropResult = {
        itemId,
        zoneId,
        fromZoneId,
        index,
      };

      onDrop?.(result);
    },
    [zoneState, canDropInZone, onDrop]
  );

  // Handle reorder within a zone
  const handleZoneReorder = useCallback(
    (zoneId: string) => (newOrder: string[]) => {
      setZoneState((prev) => ({
        ...prev,
        [zoneId]: newOrder,
      }));

      onReorder?.(zoneId, newOrder);
    },
    [onReorder]
  );

  // Handle drag start
  const handleDragStart = useCallback((itemId: string) => {
    setDraggingId(itemId);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setOverZoneId(null);
  }, []);

  // Handle drag over zone
  const handleZoneDragOver = useCallback((zoneId: string) => {
    setOverZoneId(zoneId);
  }, []);

  // Handle drop back to pool
  const handlePoolDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const itemId = e.dataTransfer.getData('text/plain');
      if (!itemId) return;

      // Remove from any zone
      setZoneState((prev) => {
        const newState = { ...prev };
        for (const zoneId of Object.keys(newState)) {
          newState[zoneId] = prev[zoneId].filter((id) => id !== itemId);
        }
        return newState;
      });
    },
    []
  );

  const handlePoolDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div
      className={`
        drag-drop-builder
        flex flex-col gap-4
        ${className}
      `}
    >
      {/* Items Pool */}
      <div
        className={`
          items-pool
          p-4 rounded-xl
          bg-gray-100 border border-gray-200
          ${itemsPoolClassName}
        `}
        onDrop={handlePoolDrop}
        onDragOver={handlePoolDragOver}
      >
        <div className="text-xs font-medium text-gray-500 mb-2">Tiltæk atriði</div>
        <div
          className={`
            flex gap-2
            ${orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'}
          `}
        >
          {poolItems.length === 0 && (
            <div className="text-gray-400 text-sm italic py-2">
              Öll atriði hafa verið sett
            </div>
          )}
          {poolItems.map((item) => (
            <DraggableItem
              key={item.id}
              item={disabled ? { ...item, disabled: true } : item}
              isDragging={draggingId === item.id}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      </div>

      {/* Drop Zones */}
      <div
        className={`
          drop-zones
          flex gap-4
          ${zones.length > 2 ? 'flex-col md:flex-row' : 'flex-col sm:flex-row'}
          ${zonesClassName}
        `}
      >
        {zones.map((zone) => {
          const zoneItems = getZoneItems(zone.id);
          const isOver = overZoneId === zone.id;
          const canDrop = draggingId ? canDropInZone(draggingId, zone.id) : true;

          return (
            <div
              key={zone.id}
              className="flex-1"
              onDragOver={() => handleZoneDragOver(zone.id)}
            >
              <DropZone
                zone={zone}
                items={zoneItems}
                isOver={isOver}
                canDrop={canDrop}
                onDrop={handleZoneDrop(zone.id)}
                onReorder={handleZoneReorder(zone.id)}
                orientation={orientation}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DragDropBuilder;
