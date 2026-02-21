/**
 * ParticleCelebration Types
 *
 * Type definitions for the canvas-based particle celebration effect system.
 * Used to provide visual feedback in chemistry games for correct answers,
 * answer streaks, and level completions.
 */

/** Available celebration animation presets */
export type CelebrationPreset =
  | 'burst'          // Correct answer: particles burst outward from origin
  | 'confetti'       // Full-screen confetti rain from top
  | 'streak-3'       // 3-answer streak: small single-color burst
  | 'streak-5'       // 5-answer streak: medium two-tone burst
  | 'streak-10'      // 10+ streak: large burst + confetti overlay with stars
  | 'level-complete'; // Level complete: full confetti + center starburst

/** Year theme identifier, maps to year-specific color palettes */
export type YearTheme = '1-ar' | '2-ar' | '3-ar';

/** Configuration for triggering a celebration animation */
export interface CelebrationConfig {
  /** Which animation preset to use */
  preset: CelebrationPreset;
  /** Origin point for burst-type effects (normalized 0-1 coordinates) */
  origin?: { x: number; y: number };
  /** Override the default color palette */
  colors?: string[];
  /** Override the default particle count for the preset */
  particleCount?: number;
  /** Override the default duration in milliseconds */
  duration?: number;
  /** Year theme for automatic color selection */
  yearTheme?: YearTheme;
}

/** Shape of an individual particle */
export type ParticleShape = 'circle' | 'square' | 'triangle' | 'star';

/** Internal state of a single particle during animation */
export interface Particle {
  /** Current x position in canvas pixels */
  x: number;
  /** Current y position in canvas pixels */
  y: number;
  /** Horizontal velocity in pixels per frame */
  vx: number;
  /** Vertical velocity in pixels per frame */
  vy: number;
  /** Particle size in pixels */
  size: number;
  /** Fill color (hex or CSS color string) */
  color: string;
  /** Current rotation angle in radians */
  rotation: number;
  /** Rotation speed in radians per frame */
  rotationSpeed: number;
  /** Current opacity (0-1) */
  opacity: number;
  /** Visual shape of the particle */
  shape: ParticleShape;
  /** Remaining life in frames */
  life: number;
  /** Total lifespan in frames (used for opacity fade calculation) */
  maxLife: number;
}

/** Props for the ParticleCelebration React component */
export interface ParticleCelebrationProps {
  /** Current celebration config, or null when no animation is active */
  config: CelebrationConfig | null;
  /** Called when the animation finishes (all particles dead or duration elapsed) */
  onComplete?: () => void;
  /** Additional CSS class for the container */
  className?: string;
}
