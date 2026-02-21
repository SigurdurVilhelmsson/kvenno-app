/**
 * AnimatedBackground — Layered animated gradient background for chemistry games.
 *
 * Renders drifting radial-gradient blobs and optional floating chemistry-symbol
 * SVGs, themed per year (1-ar warm oranges, 2-ar cool teals, 3-ar rich purples).
 *
 * @example
 * ```tsx
 * import { AnimatedBackground } from '@shared/components/AnimatedBackground';
 *
 * <AnimatedBackground yearTheme="2-ar" variant="gameplay" showSymbols>
 *   <GameUI />
 * </AnimatedBackground>
 * ```
 */

export { AnimatedBackground } from './AnimatedBackground';
export type {
  YearTheme,
  AnimatedBackgroundVariant,
  AnimatedBackgroundIntensity,
  AnimatedBackgroundProps,
} from './AnimatedBackground';
