/**
 * useScorePopups - Hook for managing a queue of floating score popups
 *
 * Maintains an array of active popup items, generates unique IDs,
 * and enforces a maximum of 5 concurrent popups (oldest removed first
 * when exceeded).
 *
 * @example
 * ```tsx
 * import { useScorePopups, ScorePopup } from '@shared/components/AnimatedCounter';
 *
 * function ScoreDisplay() {
 *   const { popups, addPopup, removePopup } = useScorePopups();
 *
 *   const handleCorrectAnswer = (e: React.MouseEvent) => {
 *     addPopup(10, { x: e.clientX, y: e.clientY });
 *   };
 *
 *   return (
 *     <div className="relative">
 *       {popups.map((popup) => (
 *         <ScorePopup
 *           key={popup.id}
 *           points={popup.points}
 *           position={popup.position}
 *           onComplete={() => removePopup(popup.id)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useCallback, useRef } from 'react';

/** A single popup item in the queue */
export interface PopupItem {
  /** Unique identifier for this popup */
  id: string;
  /** Points to display (positive or negative) */
  points: number;
  /** Absolute position within the parent container */
  position: { x: number; y: number };
}

/** Return value from the useScorePopups hook */
export interface UseScorePopupsReturn {
  /** Array of currently active popup items */
  popups: PopupItem[];
  /** Add a new popup at the given position. Oldest removed if > 5 concurrent. */
  addPopup: (points: number, position: { x: number; y: number }) => void;
  /** Remove a popup by its unique ID (typically called from ScorePopup onComplete) */
  removePopup: (id: string) => void;
}

/** Maximum number of concurrent popups before oldest are evicted */
const MAX_CONCURRENT_POPUPS = 5;

/**
 * Hook for managing floating score popup lifecycle.
 *
 * Provides an array of active popups, a function to add new popups
 * (with automatic ID generation and overflow eviction), and a function
 * to remove popups by ID.
 *
 * @returns {@link UseScorePopupsReturn}
 */
export function useScorePopups(): UseScorePopupsReturn {
  const [popups, setPopups] = useState<PopupItem[]>([]);
  const counterRef = useRef(0);

  const addPopup = useCallback(
    (points: number, position: { x: number; y: number }) => {
      counterRef.current += 1;
      const id = `score-popup-${counterRef.current}-${Date.now()}`;

      const newPopup: PopupItem = { id, points, position };

      setPopups((prev) => {
        const next = [...prev, newPopup];
        // Evict oldest popups if we exceed the maximum
        if (next.length > MAX_CONCURRENT_POPUPS) {
          return next.slice(next.length - MAX_CONCURRENT_POPUPS);
        }
        return next;
      });
    },
    [],
  );

  const removePopup = useCallback((id: string) => {
    setPopups((prev) => prev.filter((popup) => popup.id !== id));
  }, []);

  return { popups, addPopup, removePopup };
}
