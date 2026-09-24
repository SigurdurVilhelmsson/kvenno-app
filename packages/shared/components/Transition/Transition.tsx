import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';

// True for content whose nearest Presence or FadePresence has `show` false: it
// is only still mounted so the fade-out has something to animate, and it will
// be gone in `exitDuration` ms. A Presence swap stacks the exiting content above
// whatever is entering in its place, so anything a descendant chooses to keep
// visible during the exit lands the entering content lower, and it jumps up when
// the exit ends. HintSystem reads this to drop its revealed tiers at once in that
// case, as it always did, instead of fading them (ph-titration Stig 1).
const PresenceExitingContext = createContext(false);

/** Whether the nearest enclosing Presence or FadePresence is fading this content out. */
export function usePresenceExiting(): boolean {
  return useContext(PresenceExitingContext);
}

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

  // While `show` is false the children are only fading out, but they are still
  // real DOM: a button in them could be tapped (or focused and pressed) for the
  // whole exit, which let a quick second tap re-submit an answer. `inert` takes
  // the exiting subtree out of pointer, focus and accessibility interaction, and
  // `pointer-events-none` is a fallback for a browser without `inert`. Entering
  // content is keyed on `show`, not on the fade, so it is live at once.
  const exiting = !show;

  return (
    <div
      className={`transition-all ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-[0.98]'}${exiting ? ' pointer-events-none' : ''}`}
      style={{ transitionDuration: `${exitDuration}ms` }}
      inert={exiting}
    >
      <PresenceExitingContext.Provider value={exiting}>{children}</PresenceExitingContext.Provider>
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

  // Exiting content is not interactive; see Presence above.
  const exiting = !show;

  return (
    <div
      className={`transition-opacity ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}${exiting ? ' pointer-events-none' : ''}`}
      style={{ transitionDuration: `${exitDuration}ms` }}
      inert={exiting}
    >
      <PresenceExitingContext.Provider value={exiting}>{children}</PresenceExitingContext.Provider>
    </div>
  );
}
