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
  /** Callback when drag starts */
  onDragStart?: (itemId: string) => void;
  /** Callback when drag ends */
  onDragEnd?: () => void;
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
  /** Orientation of items in the zone */
  orientation?: 'horizontal' | 'vertical';
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
  /** Validation function for drops */
  validateDrop?: (itemId: string, zoneId: string) => boolean;
  /** Orientation of items in zones */
  orientation?: 'horizontal' | 'vertical';
  /** Whether drag and drop is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Additional classes for the items pool */
  itemsPoolClassName?: string;
  /** Additional classes for drop zones */
  zonesClassName?: string;
}
