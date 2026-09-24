/**
 * Types for the DragDropBuilder component
 */

/**
 * A draggable item that can be placed in drop zones
 */
export interface DraggableItemData {
  /** Unique identifier for the item */
  id: string;
  /** Display content (text or React node) */
  content: string | React.ReactNode;
  /** Optional category for grouping/filtering */
  category?: string;
  /** Whether this item can be dragged */
  disabled?: boolean;
  /** Additional data attached to the item */
  data?: Record<string, unknown>;
}

/**
 * A zone where items can be dropped
 */
export interface DropZoneData {
  /** Unique identifier for the zone */
  id: string;
  /** Display label for the zone */
  label?: string;
  /** Accepted item categories (undefined = accept all) */
  acceptedCategories?: string[];
  /** Maximum items this zone can hold */
  maxItems?: number;
  /** Placeholder content when empty */
  placeholder?: string;
  /** Additional data attached to the zone */
  data?: Record<string, unknown>;
}

/**
 * Result of a drop operation
 */
export interface DropResult {
  /** ID of the dropped item */
  itemId: string;
  /** ID of the target zone */
  zoneId: string;
  /** Previous zone ID (if moving between zones) */
  fromZoneId?: string;
  /** Position index within the zone */
  index: number;
}

/**
 * State of items in zones
 */
export interface ZoneState {
  [zoneId: string]: string[];
}

/**
 * Props for the DraggableItem component
 */
export interface DraggableItemProps {
  /** Item data */
  item: DraggableItemData;
  /** Whether the item is currently being dragged */
  isDragging?: boolean;
  /**
   * Whether the item has been picked up by a tap, click or Enter/Space and is waiting for the
   * student to choose where it goes — the drag-free way to move it.
   */
  isSelected?: boolean;
  /** Callback when drag starts */
  onDragStart?: (itemId: string) => void;
  /** Callback when drag ends */
  onDragEnd?: () => void;
  /**
   * Callback when a touch drop completes over a zone.
   * Touch events don't integrate with HTML5 drag-drop, so the DraggableItem
   * reads `document.elementFromPoint(touch.clientX, touch.clientY)` on touchend,
   * walks up to the nearest `[data-zone-id]` ancestor, and emits the zone id here.
   * DragDropBuilder wires this to its internal drop handler.
   */
  onTouchDrop?: (itemId: string, zoneId: string) => void;
  /**
   * Called while a touch drag moves, with the id of the zone under the finger (the pool reports
   * `POOL_TARGET_ID`), or null over neither — so the target can be highlighted before release.
   */
  onTouchOver?: (targetId: string | null) => void;
  /** Tap, click, Enter or Space on the item: pick it up, or put it down again. */
  onActivate?: (itemId: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for the DropZone component
 */
export interface DropZoneProps {
  /** Zone data */
  zone: DropZoneData;
  /** Items currently in this zone */
  items: DraggableItemData[];
  /** Whether a draggable is currently over this zone */
  isOver?: boolean;
  /** Whether the current draggable can be dropped here */
  canDrop?: boolean;
  /** Callback when an item is dropped */
  onDrop?: (itemId: string, index: number) => void;
  /** Callback when items are reordered within the zone */
  onReorder?: (newOrder: string[]) => void;
  /** Forwarded to child DraggableItems so items already placed can be touch-dragged between zones. */
  onTouchDrop?: (itemId: string, zoneId: string) => void;
  /** Forwarded to child DraggableItems (see DraggableItemProps.onTouchOver). */
  onTouchOver?: (targetId: string | null) => void;
  /** Id of the item currently picked up by tap/click/keyboard, if any. */
  selectedId?: string | null;
  /** The picked-up item may be placed here: the zone is highlighted and tapping it places it. */
  isTarget?: boolean;
  /** Tap/click/Enter on the zone while an item is picked up. */
  onActivate?: () => void;
  /** Tap/click/Enter on one of the zone's items (see DraggableItemProps.onActivate). */
  onActivateItem?: (itemId: string) => void;
  /** Told when one of the zone's items starts/stops being dragged. */
  onItemDragStart?: (itemId: string) => void;
  onItemDragEnd?: () => void;
  /** Orientation of items in the zone */
  orientation?: 'horizontal' | 'vertical';
  /** Phone-only compact layout; see DragDropBuilderProps.compact. */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Render function for items (optional override) */
  renderItem?: (item: DraggableItemData, index: number) => React.ReactNode;
}

/**
 * Props for the DragDropBuilder component
 */
export interface DragDropBuilderProps {
  /** Available items to drag */
  items: DraggableItemData[];
  /** Drop zones configuration */
  zones: DropZoneData[];
  /** Initial state of items in zones */
  initialState?: ZoneState;
  /** Callback when an item is dropped */
  onDrop?: (result: DropResult) => void;
  /** Callback when items are reordered within a zone */
  onReorder?: (zoneId: string, newOrder: string[]) => void;
  /**
   * Callback when an item leaves a zone for the pool — dragged or tapped back, or displaced
   * when another item is placed in a full single-item zone. A consumer mirroring the zone
   * contents from `onDrop` needs this too, or it keeps showing an item the student removed.
   */
  onRemove?: (itemId: string, fromZoneId: string) => void;
  /** Validation function for drops */
  validateDrop?: (itemId: string, zoneId: string) => boolean;
  /** Orientation of items in zones */
  orientation?: 'horizontal' | 'vertical';
  /** Whether drag and drop is disabled */
  disabled?: boolean;
  /**
   * Denser items and zones on a phone (the `phone:` variant), unchanged from `sm` up and on
   * screens taller than 500 px. Items get `px-2 py-1`; a zone gets `min-h-11 p-2`, its label
   * becomes screen-reader-only (the zone's `aria-label` already names it), and its capacity
   * count moves into the top-right corner, or is dropped when the zone holds one item.
   * Tap-to-place, touch drag and the keyboard work exactly as without it.
   */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Additional classes for the items pool */
  itemsPoolClassName?: string;
  /** Additional classes for drop zones */
  zonesClassName?: string;
}
