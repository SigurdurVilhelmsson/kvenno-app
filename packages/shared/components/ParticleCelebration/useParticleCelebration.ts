import { useState, useCallback, useRef } from 'react';

import type {
  CelebrationConfig,
  CelebrationPreset,
  ParticleCelebrationProps,
  YearTheme,
} from './types';

/** Maximum number of celebrations that can be queued */
const MAX_QUEUE = 3;

/** Return type for the useParticleCelebration hook */
export interface UseParticleCelebrationReturn {
  /** Trigger an arbitrary celebration with full config control */
  trigger: (config: CelebrationConfig) => void;
  /** Trigger a correct-answer burst at the given origin (normalized 0-1) */
  triggerCorrect: (origin?: { x: number; y: number }) => void;
  /** Placeholder for wrong-answer feedback (currently a no-op, extensible) */
  triggerWrong: () => void;
  /** Trigger a streak celebration; preset selected based on count */
  triggerStreak: (count: number) => void;
  /** Trigger a level-complete celebration */
  triggerLevelComplete: () => void;
  /** Props object to spread onto a ParticleCelebration component */
  celebrationProps: ParticleCelebrationProps;
}

/**
 * Hook for easy integration of particle celebrations into games.
 *
 * Manages the celebration lifecycle: triggering, queuing (up to 3),
 * and auto-advancing when an animation completes.
 *
 * @param yearTheme - Optional year theme for automatic color selection.
 *                    Pass '1-ar', '2-ar', or '3-ar' to use year-specific palettes.
 * @returns Control functions and props to spread onto ParticleCelebration.
 *
 * @example
 * ```tsx
 * function MyGame() {
 *   const { triggerCorrect, triggerStreak, celebrationProps } = useParticleCelebration('2-ar');
 *
 *   const handleAnswer = (correct: boolean, streak: number) => {
 *     if (correct) {
 *       triggerCorrect({ x: 0.5, y: 0.3 });
 *       if (streak >= 3) triggerStreak(streak);
 *     }
 *   };
 *
 *   return (
 *     <div className="relative">
 *       <GameBoard onAnswer={handleAnswer} />
 *       <ParticleCelebration {...celebrationProps} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useParticleCelebration(yearTheme?: YearTheme): UseParticleCelebrationReturn {
  const [currentConfig, setCurrentConfig] = useState<CelebrationConfig | null>(null);
  const queueRef = useRef<CelebrationConfig[]>([]);

  /**
   * Advance to the next queued celebration, or clear the active config
   * if the queue is empty.
   */
  const advanceQueue = useCallback(() => {
    if (queueRef.current.length > 0) {
      const next = queueRef.current.shift()!;
      setCurrentConfig(next);
    } else {
      setCurrentConfig(null);
    }
  }, []);

  /**
   * Enqueue or immediately start a celebration.
   * If no celebration is playing, it starts immediately.
   * Otherwise it is added to the queue (up to MAX_QUEUE).
   */
  const enqueue = useCallback((config: CelebrationConfig) => {
    // Attach the year theme if not explicitly provided
    const finalConfig: CelebrationConfig = {
      ...config,
      yearTheme: config.yearTheme ?? yearTheme,
    };

    setCurrentConfig((prev) => {
      if (prev === null) {
        // Nothing playing - start immediately
        return finalConfig;
      }
      // Already playing - queue it (drop if queue is full)
      if (queueRef.current.length < MAX_QUEUE) {
        queueRef.current.push(finalConfig);
      }
      return prev;
    });
  }, [yearTheme]);

  /**
   * Trigger a celebration with a full CelebrationConfig.
   */
  const trigger = useCallback((config: CelebrationConfig) => {
    enqueue(config);
  }, [enqueue]);

  /**
   * Trigger a correct-answer burst animation.
   * @param origin - Normalized (0-1) coordinates for the burst origin.
   *                 Defaults to center (0.5, 0.5).
   */
  const triggerCorrect = useCallback((origin?: { x: number; y: number }) => {
    enqueue({
      preset: 'burst',
      origin: origin ?? { x: 0.5, y: 0.5 },
    });
  }, [enqueue]);

  /**
   * Placeholder for wrong-answer visual feedback.
   * Currently a no-op but can be extended to show a shake, red flash, etc.
   */
  const triggerWrong = useCallback(() => {
    // Intentionally empty - extensible for future feedback effects
  }, []);

  /**
   * Trigger a streak celebration with preset auto-selected by streak count.
   * - count < 5  -> streak-3
   * - count < 10 -> streak-5
   * - count >= 10 -> streak-10
   *
   * @param count - The current answer streak count (3+)
   */
  const triggerStreak = useCallback((count: number) => {
    let preset: CelebrationPreset;
    if (count >= 10) {
      preset = 'streak-10';
    } else if (count >= 5) {
      preset = 'streak-5';
    } else {
      preset = 'streak-3';
    }
    enqueue({ preset });
  }, [enqueue]);

  /**
   * Trigger a level-complete celebration (full confetti + starburst).
   */
  const triggerLevelComplete = useCallback(() => {
    enqueue({ preset: 'level-complete' });
  }, [enqueue]);

  /** Props to spread onto a ParticleCelebration component */
  const celebrationProps: ParticleCelebrationProps = {
    config: currentConfig,
    onComplete: advanceQueue,
  };

  return {
    trigger,
    triggerCorrect,
    triggerWrong,
    triggerStreak,
    triggerLevelComplete,
    celebrationProps,
  };
}
