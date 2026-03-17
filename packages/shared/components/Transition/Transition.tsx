import { useState, useEffect, useRef, type ReactNode } from 'react';

interface PresenceProps {
  /** Whether children should be shown */
  show: boolean;
  /** Exit animation duration in ms (default: 200) */
  exitDuration?: number;
  /** Children to render */
  children: ReactNode;
}

/**
 * Presence - Lightweight AnimatePresence replacement
 *
 * Delays unmounting children by exitDuration to allow CSS exit animations.
 * Works with Tailwind transition classes applied to children.
 */
export function Presence({ show, exitDuration = 200, children }: PresenceProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (show) {
      // Mount immediately, then trigger enter animation on next frame
      setShouldRender(true);
      // Use rAF to ensure DOM has updated before applying visible class
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      // Start exit animation
      setIsVisible(false);
      // Unmount after animation completes
      timeoutRef.current = setTimeout(() => {
        setShouldRender(false);
      }, exitDuration);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [show, exitDuration]);

  if (!shouldRender) return null;

  return (
    <div
      className={`transition-all ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-[0.98]'}`}
      style={{ transitionDuration: `${exitDuration}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * FadePresence - Simple opacity-only fade (no translate/scale)
 */
export function FadePresence({ show, exitDuration = 200, children }: PresenceProps) {
  const [shouldRender, setShouldRender] = useState(show);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      timeoutRef.current = setTimeout(() => {
        setShouldRender(false);
      }, exitDuration);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [show, exitDuration]);

  if (!shouldRender) return null;

  return (
    <div
      className={`transition-opacity ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ transitionDuration: `${exitDuration}ms` }}
    >
      {children}
    </div>
  );
}
