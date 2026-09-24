import { useState, useCallback, useMemo } from 'react';

import { DraggableItem, POOL_TARGET_ID } from './DraggableItem';
import { COMPACT_ITEM, DropZone } from './DropZone';
import { DragDropBuilderProps, DraggableItemData, ZoneState, DropResult } from './types';

/**
 * DragDropBuilder Component
 *
 * A flexible drag-and-drop interface for building sequences, equations,
 * or any ordered composition from a pool of items.
 *
 * Features:
 * - HTML5 drag-and-drop API (no external dependencies)
 * - Touch drag on phones and tablets: the item follows the finger, the zone under it lights
 *   up, and the page auto-scrolls near the viewport edges
 * - Tap-to-place, which needs no dragging at all: tap (or click, or Enter/Space) an item to
 *   pick it up, then tap a highlighted zone to place it — or the pool to take it back. Tapping
 *   a full single-item zone swaps the new item in and returns the old one to the pool
 * - Snap-to-zone with visual feedback
 * - Reorder capability within zones
 * - Validation callbacks
 * - `compact`: denser items and zones on a phone only (see DragDropBuilderProps.compact)
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
  onRemove,
  validateDrop,
  orientation = 'horizontal',
  disabled = false,
  compact = false,
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
  // Zone (or POOL_TARGET_ID) under the mouse or finger during a drag
  const [overZoneId, setOverZoneId] = useState<string | null>(null);
  // Item picked up by tap/click/keyboard, waiting for a destination
  const [pickedId, setPickedId] = useState<string | null>(null);
  const selectedId =
    !disabled && pickedId !== null && items.some((i) => i.id === pickedId && !i.disabled)
      ? pickedId
      : null;

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

  // Which zone an item is in, or undefined for the pool
  const zoneOf = useCallback(
    (itemId: string): string | undefined => {
      for (const [zId, itemIds] of Object.entries(zoneState)) {
        if (itemIds.includes(itemId)) return zId;
      }
      return undefined;
    },
    [zoneState]
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

      // Check max items. A full single-item zone still accepts: the new item swaps in and
      // the old one goes back to the pool (see placeItem).
      if (zone.maxItems !== undefined && zone.maxItems !== 1) {
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

  /**
   * Put an item into a zone (at `index`, default the end). The one pipeline every input
   * method goes through — mouse drop, touch drop and tap-to-place — so they cannot disagree.
   */
  const placeItem = useCallback(
    (itemId: string, zoneId: string, index?: number) => {
      const fromZoneId = zoneOf(itemId);
      if (fromZoneId === zoneId) return;

      const zone = zones.find((z) => z.id === zoneId);
      const current = (zoneState[zoneId] || []).filter((id) => id !== itemId);
      const displaced = zone?.maxItems === 1 && current.length >= 1 ? current[0] : undefined;
      const remaining = displaced ? current.filter((id) => id !== displaced) : current;
      const at = Math.min(index ?? remaining.length, remaining.length);

      setZoneState((prev) => {
        const newState = { ...prev };

        // Remove from previous location
        if (fromZoneId) {
          newState[fromZoneId] = prev[fromZoneId].filter((id) => id !== itemId);
        }

        // Add to new zone at specified index (a displaced item returns to the pool)
        const targetIds = (newState[zoneId] || []).filter(
          (id) => id !== itemId && id !== displaced
        );
        targetIds.splice(at, 0, itemId);
        newState[zoneId] = targetIds;

        return newState;
      });

      if (displaced) onRemove?.(displaced, zoneId);

      const result: DropResult = {
        itemId,
        zoneId,
        fromZoneId,
        index: at,
      };

      onDrop?.(result);
    },
    [zoneOf, zones, zoneState, onDrop, onRemove]
  );

  // Take an item out of whatever zone it is in and back to the pool
  const returnToPool = useCallback(
    (itemId: string) => {
      const fromZoneId = zoneOf(itemId);
      if (disabled || !fromZoneId) return;

      setZoneState((prev) => ({
        ...prev,
        [fromZoneId]: prev[fromZoneId].filter((id) => id !== itemId),
      }));

      onRemove?.(itemId, fromZoneId);
    },
    [disabled, zoneOf, onRemove]
  );

  // Handle drop from pool to zone
  const handleZoneDrop = useCallback(
    (zoneId: string) => (itemId: string, index: number) => {
      if (!canDropInZone(itemId, zoneId)) return;
      placeItem(itemId, zoneId, index);
    },
    [canDropInZone, placeItem]
  );

  /**
   * Touch-drop handler. Called by DraggableItem when a touch release lands on a
   * `[data-zone-id]` element (or the pool). Re-uses the same drop pipeline as mouse drops,
   * appending to the end of the target zone (touch UX doesn't support fine-grained index drop).
   */
  const handleTouchDrop = useCallback(
    (itemId: string, targetId: string) => {
      if (targetId === POOL_TARGET_ID) {
        returnToPool(itemId);
        return;
      }
      // If the item is being re-touch-dropped into the same zone, treat as no-op.
      if ((zoneState[targetId] || []).includes(itemId)) return;
      if (!canDropInZone(itemId, targetId)) return;
      placeItem(itemId, targetId);
    },
    [zoneState, canDropInZone, placeItem, returnToPool]
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
    setPickedId(null);
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

  // --- Tap-to-place ---------------------------------------------------------------------------

  const isTargetFor = useCallback(
    (zoneId: string) =>
      selectedId !== null && zoneOf(selectedId) !== zoneId && canDropInZone(selectedId, zoneId),
    [selectedId, zoneOf, canDropInZone]
  );

  const handleItemActivate = useCallback(
    (itemId: string) => {
      if (disabled) return;
      if (selectedId === itemId) {
        setPickedId(null);
        return;
      }
      // With an item picked up, tapping an item already sitting in a zone means "put it here"
      // — that item is most of what a student sees of a full zone.
      const tappedZone = zoneOf(itemId);
      if (selectedId !== null && tappedZone && isTargetFor(tappedZone)) {
        placeItem(selectedId, tappedZone);
        setPickedId(null);
        return;
      }
      setPickedId(itemId);
    },
    [disabled, selectedId, zoneOf, isTargetFor, placeItem]
  );

  const handleZoneActivate = useCallback(
    (zoneId: string) => {
      if (selectedId === null || !isTargetFor(zoneId)) return;
      placeItem(selectedId, zoneId);
      setPickedId(null);
    },
    [selectedId, isTargetFor, placeItem]
  );

  const selectedInZone = selectedId !== null && zoneOf(selectedId) !== undefined;

  const handlePoolClick = useCallback(() => {
    if (selectedId === null) return;
    if (selectedInZone) returnToPool(selectedId);
    setPickedId(null);
  }, [selectedId, selectedInZone, returnToPool]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') setPickedId(null);
  }, []);

  // Handle drop back to pool
  const handlePoolDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const itemId = e.dataTransfer.getData('text/plain');
      if (!itemId) return;

      // Remove from any zone
      returnToPool(itemId);
    },
    [returnToPool]
  );

  const handlePoolDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const poolIsTarget = selectedInZone || (draggingId !== null && overZoneId === POOL_TARGET_ID);

  return (
    <div
      className={`
        drag-drop-builder
        flex flex-col gap-4
        ${className}
      `}
      onKeyDown={handleKeyDown}
    >
      {/* Items Pool */}
      <div
        className={`
          items-pool
          p-4 rounded-xl
          bg-gray-100 border
          ${poolIsTarget ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200'}
          ${selectedInZone ? 'cursor-pointer' : ''}
          ${itemsPoolClassName}
        `}
        onDrop={handlePoolDrop}
        onDragOver={handlePoolDragOver}
        onClick={handlePoolClick}
        data-drop-pool
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 mb-2">
          <div className="text-xs font-medium text-gray-500">Tiltæk atriði</div>
          {/* What a picked-up item is waiting for — the one cue tap-to-place needs */}
          <div className="text-xs font-medium text-blue-700" aria-live="polite">
            {selectedId !== null &&
              (selectedInZone
                ? 'Veldu annan reit, eða smelltu hér til að skila atriðinu'
                : 'Veldu reit fyrir valið atriði')}
          </div>
        </div>
        <div
          className={`
            flex gap-2
            ${orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'}
          `}
        >
          {poolItems.length === 0 && (
            <div className="text-gray-400 text-sm italic py-2">Öll atriði hafa verið sett</div>
          )}
          {poolItems.map((item) => (
            <DraggableItem
              key={item.id}
              item={disabled ? { ...item, disabled: true } : item}
              isDragging={draggingId === item.id}
              isSelected={selectedId === item.id}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onTouchDrop={handleTouchDrop}
              onTouchOver={setOverZoneId}
              onActivate={handleItemActivate}
              className={compact ? COMPACT_ITEM : ''}
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
            <div key={zone.id} className="flex-1" onDragOver={() => handleZoneDragOver(zone.id)}>
              <DropZone
                zone={zone}
                items={zoneItems}
                isOver={isOver}
                canDrop={canDrop}
                onDrop={handleZoneDrop(zone.id)}
                onReorder={handleZoneReorder(zone.id)}
                onTouchDrop={handleTouchDrop}
                onTouchOver={setOverZoneId}
                selectedId={selectedId}
                isTarget={isTargetFor(zone.id)}
                onActivate={() => handleZoneActivate(zone.id)}
                onActivateItem={handleItemActivate}
                onItemDragStart={handleDragStart}
                onItemDragEnd={handleDragEnd}
                orientation={orientation}
                compact={compact}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DragDropBuilder;
