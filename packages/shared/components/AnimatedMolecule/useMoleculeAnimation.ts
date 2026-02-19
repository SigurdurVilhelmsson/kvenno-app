/**
 * useMoleculeAnimation - Hook for orchestrating molecule animations
 *
 * Manages animation state, calculates staggered delays, and handles
 * animation completion for the AnimatedMolecule component.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';

import type { MoleculeAnimationType } from '@shared/types';

import { ANIMATION_DURATIONS } from './molecule.constants';

export type AnimationState = 'idle' | 'running' | 'complete';

export interface AnimationTiming {
  /** Delay before this element starts animating (ms) */
  delay: number;
  /** Duration of this element's animation (ms) */
  duration: number;
}

export interface MoleculeAnimationConfig {
  /** Number of atoms in the molecule */
  atomCount: number;
  /** Number of bonds in the molecule */
  bondCount: number;
  /** Number of lone pairs to animate */
  lonePairCount: number;
  /** Animation type */
  animation: MoleculeAnimationType;
  /** Base animation duration (ms) */
  baseDuration?: number;
  /** Whether to skip animations (reduced motion) */
  reducedMotion?: boolean;
  /** Callback when all animations complete */
  onAnimationComplete?: () => void;
}

export interface MoleculeAnimationResult {
  /** Current animation state */
  state: AnimationState;
  /** Get timing for a specific atom */
  getAtomTiming: (index: number) => AnimationTiming;
  /** Get timing for a specific bond */
  getBondTiming: (index: number) => AnimationTiming;
  /** Get timing for a specific lone pair */
  getLonePairTiming: (atomIndex: number, pairIndex: number) => AnimationTiming;
  /** Total animation duration */
  totalDuration: number;
  /** Whether animations should be skipped */
  shouldSkipAnimation: boolean;
  /** Restart the animation */
  restart: () => void;
}

/**
 * Hook for managing molecule animation orchestration
 */
export function useMoleculeAnimation({
  atomCount,
  bondCount,
  lonePairCount,
  animation,
  baseDuration,
  reducedMotion = false,
  onAnimationComplete,
}: MoleculeAnimationConfig): MoleculeAnimationResult {
  const [state, setState] = useState<AnimationState>('idle');
  const [animationKey, setAnimationKey] = useState(0);

  // Determine if we should skip animations
  const shouldSkipAnimation = reducedMotion || animation === 'none';

  // Calculate base duration from animation type
  const duration = useMemo(() => {
    if (baseDuration) return baseDuration;
    switch (animation) {
      case 'none':
        return 0;
      case 'fade-in':
        return ANIMATION_DURATIONS.fast;
      case 'scale-in':
        return ANIMATION_DURATIONS.normal;
      case 'build':
        return ANIMATION_DURATIONS.build;
      default:
        return ANIMATION_DURATIONS.normal;
    }
  }, [animation, baseDuration]);

  // Calculate timing configuration based on animation type
  const timingConfig = useMemo(() => {
    if (shouldSkipAnimation) {
      return {
        atomDelay: 0,
        atomDuration: 0,
        bondStartDelay: 0,
        bondDelay: 0,
        bondDuration: 0,
        lonePairStartDelay: 0,
        lonePairDelay: 0,
        lonePairDuration: 0,
      };
    }

    switch (animation) {
      case 'build': {
        // Staggered build: atoms first, then bonds, then lone pairs
        const atomStagger = Math.max(50, duration / Math.max(atomCount, 1));
        const bondStagger = Math.max(30, (duration * 0.5) / Math.max(bondCount, 1));
        return {
          atomDelay: atomStagger,
          atomDuration: 300,
          bondStartDelay: atomCount * atomStagger,
          bondDelay: bondStagger,
          bondDuration: 300,
          lonePairStartDelay: atomCount * atomStagger + bondCount * bondStagger,
          lonePairDelay: 50,
          lonePairDuration: 200,
        };
      }

      case 'scale-in':
        // All elements scale in together with slight stagger
        return {
          atomDelay: 30,
          atomDuration: duration,
          bondStartDelay: 50,
          bondDelay: 20,
          bondDuration: duration,
          lonePairStartDelay: 100,
          lonePairDelay: 30,
          lonePairDuration: duration * 0.8,
        };

      case 'fade-in':
      default:
        // Simple fade with minimal stagger
        return {
          atomDelay: 20,
          atomDuration: duration,
          bondStartDelay: 30,
          bondDelay: 15,
          bondDuration: duration,
          lonePairStartDelay: 50,
          lonePairDelay: 25,
          lonePairDuration: duration,
        };
    }
  }, [animation, duration, atomCount, bondCount, shouldSkipAnimation]);

  // Calculate total animation duration
  const totalDuration = useMemo(() => {
    if (shouldSkipAnimation) return 0;

    const atomsEnd = atomCount * timingConfig.atomDelay + timingConfig.atomDuration;
    const bondsEnd = timingConfig.bondStartDelay + bondCount * timingConfig.bondDelay + timingConfig.bondDuration;
    const lonePairsEnd = timingConfig.lonePairStartDelay + lonePairCount * timingConfig.lonePairDelay + timingConfig.lonePairDuration;

    return Math.max(atomsEnd, bondsEnd, lonePairsEnd);
  }, [atomCount, bondCount, lonePairCount, timingConfig, shouldSkipAnimation]);

  // Get timing for a specific atom
  const getAtomTiming = useCallback(
    (index: number): AnimationTiming => {
      if (shouldSkipAnimation) {
        return { delay: 0, duration: 0 };
      }
      return {
        delay: index * timingConfig.atomDelay,
        duration: timingConfig.atomDuration,
      };
    },
    [timingConfig, shouldSkipAnimation]
  );

  // Get timing for a specific bond
  const getBondTiming = useCallback(
    (index: number): AnimationTiming => {
      if (shouldSkipAnimation) {
        return { delay: 0, duration: 0 };
      }
      return {
        delay: timingConfig.bondStartDelay + index * timingConfig.bondDelay,
        duration: timingConfig.bondDuration,
      };
    },
    [timingConfig, shouldSkipAnimation]
  );

  // Get timing for a specific lone pair
  const getLonePairTiming = useCallback(
    (atomIndex: number, pairIndex: number): AnimationTiming => {
      if (shouldSkipAnimation) {
        return { delay: 0, duration: 0 };
      }
      // Combine atom and pair indices for staggering
      const combinedIndex = atomIndex * 2 + pairIndex;
      return {
        delay: timingConfig.lonePairStartDelay + combinedIndex * timingConfig.lonePairDelay,
        duration: timingConfig.lonePairDuration,
      };
    },
    [timingConfig, shouldSkipAnimation]
  );

  // Restart animation
  const restart = useCallback(() => {
    setAnimationKey(k => k + 1);
    setState('idle');
  }, []);

  // Manage animation state lifecycle
  useEffect(() => {
    if (shouldSkipAnimation) {
      setState('complete');
      return;
    }

    setState('running');

    const timer = setTimeout(() => {
      setState('complete');
      onAnimationComplete?.();
    }, totalDuration + 50); // Small buffer for safety

    return () => clearTimeout(timer);
  }, [animationKey, totalDuration, shouldSkipAnimation, onAnimationComplete]);

  return {
    state,
    getAtomTiming,
    getBondTiming,
    getLonePairTiming,
    totalDuration,
    shouldSkipAnimation,
    restart,
  };
}

/**
 * CSS keyframe animations for molecule elements
 * These can be injected into the SVG defs or a global style
 */
export const MOLECULE_KEYFRAMES = `
  @keyframes moleculeFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes moleculeScaleIn {
    from {
      opacity: 0;
      transform: scale(0);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes moleculeBuildAtom {
    0% {
      opacity: 0;
      transform: scale(0);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes moleculeBuildBond {
    from {
      stroke-dashoffset: var(--bond-length, 100);
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes moleculePulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
`;

/**
 * Get CSS animation string for an element
 */
export function getAnimationStyle(
  animation: MoleculeAnimationType,
  timing: AnimationTiming,
  elementType: 'atom' | 'bond' | 'lonePair'
): React.CSSProperties {
  if (timing.duration === 0) {
    return {};
  }

  const animationName = (() => {
    switch (animation) {
      case 'build':
        return elementType === 'bond' ? 'moleculeBuildBond' : 'moleculeBuildAtom';
      case 'scale-in':
        return 'moleculeScaleIn';
      case 'fade-in':
      default:
        return 'moleculeFadeIn';
    }
  })();

  return {
    opacity: 0,
    animation: `${animationName} ${timing.duration}ms ease-out ${timing.delay}ms forwards`,
  };
}
