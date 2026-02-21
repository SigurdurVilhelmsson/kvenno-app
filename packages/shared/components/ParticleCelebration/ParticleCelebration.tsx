import { useRef, useEffect, useCallback } from 'react';

import type {
  ParticleCelebrationProps,
  CelebrationConfig,
  CelebrationPreset,
  Particle,
  ParticleShape,
  YearTheme,
} from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Gravity applied per frame (pixels/frame^2) */
const GRAVITY = 0.15;

/** Velocity damping multiplier per frame (air resistance) */
const DAMPING = 0.98;

/** Minimum particle size in pixels */
const MIN_SIZE = 3;

/** Maximum particle size in pixels */
const MAX_SIZE = 8;

/** Assumed frame duration for life calculations (ms) */
const FRAME_MS = 16.67; // ~60fps

/** Year-theme color palettes */
const YEAR_COLORS: Record<YearTheme, string[]> = {
  '1-ar': ['#f36b22', '#ff9545', '#ffb678'],
  '2-ar': ['#0d9488', '#14b8a6', '#5eead4'],
  '3-ar': ['#7c3aed', '#a78bfa', '#c4b5fd'],
};

/** Fallback palette when no year theme is specified */
const DEFAULT_COLORS = ['#f36b22', '#ff9545', '#ffb678'];

/** Preset defaults: [particleCount, durationMs] */
const PRESET_DEFAULTS: Record<CelebrationPreset, { count: number; duration: number }> = {
  'burst':          { count: 25,  duration: 800  },
  'confetti':       { count: 70,  duration: 2000 },
  'streak-3':       { count: 15,  duration: 800  },
  'streak-5':       { count: 30,  duration: 1000 },
  'streak-10':      { count: 50,  duration: 1500 },
  'level-complete': { count: 100, duration: 3000 },
};

// ---------------------------------------------------------------------------
// Particle creation helpers
// ---------------------------------------------------------------------------

/**
 * Resolve the color palette for the current celebration.
 * Priority: explicit colors > yearTheme colors > defaults.
 */
function resolveColors(config: CelebrationConfig): string[] {
  if (config.colors && config.colors.length > 0) return config.colors;
  if (config.yearTheme) return YEAR_COLORS[config.yearTheme];
  return DEFAULT_COLORS;
}

/** Pick a random element from an array */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Random float in [min, max) */
function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Create a burst particle originating from (ox, oy) in canvas coordinates.
 * Particles shoot outward in all directions.
 */
function createBurstParticle(
  ox: number,
  oy: number,
  colors: string[],
  shape: ParticleShape,
  durationMs: number,
): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = rand(2, 7);
  const life = Math.round(durationMs / FRAME_MS);
  return {
    x: ox,
    y: oy,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - rand(1, 3), // bias upward slightly
    size: rand(MIN_SIZE, MAX_SIZE),
    color: pick(colors),
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: rand(-0.15, 0.15),
    opacity: 1,
    shape,
    life,
    maxLife: life,
  };
}

/**
 * Create a confetti particle that falls from the top of the viewport.
 * Confetti pieces drift sideways and rotate as they descend.
 */
function createConfettiParticle(
  canvasWidth: number,
  colors: string[],
  durationMs: number,
): Particle {
  const life = Math.round(durationMs / FRAME_MS);
  return {
    x: rand(0, canvasWidth),
    y: rand(-40, -5),
    vx: rand(-1.5, 1.5),
    vy: rand(1, 3),
    size: rand(4, 8),
    color: pick(colors),
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: rand(-0.2, 0.2),
    opacity: 1,
    shape: 'square',
    life,
    maxLife: life,
  };
}

/**
 * Create a star-shaped particle for streak-10 and level-complete effects.
 */
function createStarParticle(
  ox: number,
  oy: number,
  colors: string[],
  durationMs: number,
): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = rand(1.5, 5);
  const life = Math.round(durationMs / FRAME_MS);
  return {
    x: ox,
    y: oy,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - rand(0.5, 2),
    size: rand(5, 10),
    color: pick(colors),
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: rand(-0.1, 0.1),
    opacity: 1,
    shape: 'star',
    life,
    maxLife: life,
  };
}

// ---------------------------------------------------------------------------
// Populate particle pool for a given preset
// ---------------------------------------------------------------------------

/**
 * Fill the particle pool with particles appropriate for the given preset.
 * Returns the number of active particles written into the pool.
 */
function populatePool(
  pool: Particle[],
  config: CelebrationConfig,
  canvasWidth: number,
  canvasHeight: number,
): number {
  const { preset } = config;
  const defaults = PRESET_DEFAULTS[preset];
  const count = config.particleCount ?? defaults.count;
  const duration = config.duration ?? defaults.duration;
  const colors = resolveColors(config);

  // Resolve origin in canvas coordinates (default: center)
  const origin = config.origin ?? { x: 0.5, y: 0.5 };
  const ox = origin.x * canvasWidth;
  const oy = origin.y * canvasHeight;

  // Ensure pool has enough capacity
  while (pool.length < count + 80) {
    pool.push({
      x: 0, y: 0, vx: 0, vy: 0,
      size: 0, color: '', rotation: 0, rotationSpeed: 0,
      opacity: 0, shape: 'circle', life: 0, maxLife: 0,
    });
  }

  let idx = 0;

  switch (preset) {
    case 'burst': {
      for (let i = 0; i < count; i++) {
        Object.assign(pool[idx++], createBurstParticle(ox, oy, colors, 'circle', duration));
      }
      break;
    }

    case 'confetti': {
      for (let i = 0; i < count; i++) {
        Object.assign(pool[idx++], createConfettiParticle(canvasWidth, colors, duration));
      }
      break;
    }

    case 'streak-3': {
      // Single-color burst
      const singleColor = [colors[0]];
      for (let i = 0; i < count; i++) {
        Object.assign(pool[idx++], createBurstParticle(ox, oy, singleColor, 'circle', duration));
      }
      break;
    }

    case 'streak-5': {
      // Two-tone burst
      const twoTone = colors.slice(0, 2);
      for (let i = 0; i < count; i++) {
        Object.assign(pool[idx++], createBurstParticle(ox, oy, twoTone, 'circle', duration));
      }
      break;
    }

    case 'streak-10': {
      // Large burst with circles + star overlay
      const burstCount = Math.floor(count * 0.6);
      const starCount = count - burstCount;
      for (let i = 0; i < burstCount; i++) {
        Object.assign(pool[idx++], createBurstParticle(ox, oy, colors, 'circle', duration));
      }
      for (let i = 0; i < starCount; i++) {
        Object.assign(pool[idx++], createStarParticle(ox, oy, colors, duration));
      }
      break;
    }

    case 'level-complete': {
      // Center starburst
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const starburstCount = Math.floor(count * 0.35);
      const confettiCount = count - starburstCount;
      for (let i = 0; i < starburstCount; i++) {
        Object.assign(pool[idx++], createStarParticle(centerX, centerY, colors, duration));
      }
      // Confetti rain
      for (let i = 0; i < confettiCount; i++) {
        Object.assign(pool[idx++], createConfettiParticle(canvasWidth, colors, duration));
      }
      break;
    }
  }

  return idx;
}

// ---------------------------------------------------------------------------
// Canvas drawing helpers
// ---------------------------------------------------------------------------

/** Draw a 5-pointed star centered at (0, 0) with the given outer radius */
function drawStar(ctx: CanvasRenderingContext2D, outerR: number): void {
  const innerR = outerR * 0.45;
  const points = 5;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/** Draw a triangle centered at (0, 0) */
function drawTriangle(ctx: CanvasRenderingContext2D, size: number): void {
  const h = size * 0.866; // sqrt(3)/2
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.67);
  ctx.lineTo(size * 0.5, h * 0.33);
  ctx.lineTo(-size * 0.5, h * 0.33);
  ctx.closePath();
}

/**
 * Draw a single particle on the canvas.
 * Each particle gets a subtle radial gradient for depth.
 */
function drawParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);

  // Create a subtle radial gradient for depth
  const halfSize = p.size / 2;

  switch (p.shape) {
    case 'square': {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
      gradient.addColorStop(0, lightenColor(p.color, 40));
      gradient.addColorStop(1, p.color);
      ctx.fillStyle = gradient;
      // Confetti rectangles are taller than wide
      ctx.fillRect(-halfSize, -p.size * 0.35, p.size, p.size * 0.7);
      break;
    }

    case 'circle': {
      const gradient = ctx.createRadialGradient(
        -halfSize * 0.3, -halfSize * 0.3, 0,
        0, 0, halfSize,
      );
      gradient.addColorStop(0, lightenColor(p.color, 50));
      gradient.addColorStop(1, p.color);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'star': {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, halfSize);
      gradient.addColorStop(0, lightenColor(p.color, 60));
      gradient.addColorStop(1, p.color);
      ctx.fillStyle = gradient;
      drawStar(ctx, halfSize);
      ctx.fill();
      break;
    }

    case 'triangle': {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, halfSize);
      gradient.addColorStop(0, lightenColor(p.color, 40));
      gradient.addColorStop(1, p.color);
      ctx.fillStyle = gradient;
      drawTriangle(ctx, p.size);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

/**
 * Lighten a hex color by a given amount (0-255).
 * Returns the lightened hex string.
 */
function lightenColor(hex: string, amount: number): string {
  // Strip #
  const c = hex.replace('#', '');
  if (c.length !== 6) return hex;

  const r = Math.min(255, parseInt(c.substring(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(c.substring(2, 4), 16) + amount);
  const b = Math.min(255, parseInt(c.substring(4, 6), 16) + amount);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Detect prefers-reduced-motion
// ---------------------------------------------------------------------------

/** Returns true if the user prefers reduced motion */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ParticleCelebration - A canvas-based particle celebration overlay component.
 *
 * Renders celebratory particle effects (bursts, confetti, streaks) as a
 * non-interactive overlay. Designed for use in chemistry games to provide
 * visual feedback for correct answers, streaks, and level completions.
 *
 * Features:
 * - Multiple presets with distinct visual behaviors
 * - Year-theme color palettes (1-ar orange, 2-ar teal, 3-ar purple)
 * - Physics: gravity, air resistance, rotation
 * - Particle shapes: circles, rectangles, stars, triangles
 * - Radial gradients on particles for visual depth
 * - Respects prefers-reduced-motion accessibility setting
 * - Auto-cleanup after animation completes
 *
 * @example
 * ```tsx
 * <ParticleCelebration
 *   config={{ preset: 'burst', origin: { x: 0.5, y: 0.5 }, yearTheme: '1-ar' }}
 *   onComplete={() => console.log('done')}
 * />
 * ```
 */
export const ParticleCelebration: React.FC<ParticleCelebrationProps> = ({
  config,
  onComplete,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(undefined);
  const poolRef = useRef<Particle[]>([]);
  const activeCountRef = useRef(0);
  const startTimeRef = useRef(0);
  const flashRef = useRef<HTMLDivElement>(null);

  /** Determine whether the preset uses a full-screen overlay or element-relative positioning */
  const isFullScreen = config
    ? ['confetti', 'level-complete', 'streak-10'].includes(config.preset)
    : false;

  /**
   * Stop the animation loop and invoke the completion callback.
   * Safe to call multiple times; only fires onComplete once per config.
   */
  const stopAnimation = useCallback(() => {
    if (animationRef.current !== undefined) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    onComplete?.();
  }, [onComplete]);

  // Main effect: start animation when config becomes non-null
  useEffect(() => {
    if (!config) {
      // No active celebration - ensure cleanup
      if (animationRef.current !== undefined) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      return;
    }

    // Respect prefers-reduced-motion: show a brief flash instead
    if (prefersReducedMotion()) {
      const flashEl = flashRef.current;
      if (flashEl) {
        const colors = resolveColors(config);
        flashEl.style.backgroundColor = colors[0];
        flashEl.style.opacity = '0.3';
        requestAnimationFrame(() => {
          flashEl.style.transition = 'opacity 300ms ease-out';
          flashEl.style.opacity = '0';
        });
      }
      // Notify completion after the flash duration
      const timer = setTimeout(() => onComplete?.(), 350);
      return () => clearTimeout(timer);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Size canvas to viewport (or parent, for element-relative)
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    // Populate particles
    const pool = poolRef.current;
    activeCountRef.current = populatePool(pool, config, w, h);

    const defaults = PRESET_DEFAULTS[config.preset];
    const duration = config.duration ?? defaults.duration;
    startTimeRef.current = performance.now();

    // Animation loop
    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const count = activeCountRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, w, h);

      let alive = 0;

      for (let i = 0; i < count; i++) {
        const p = pool[i];
        if (p.life <= 0) continue;

        // Physics update
        p.vy += GRAVITY;
        p.vx *= DAMPING;
        p.vy *= DAMPING;

        // Confetti: add gentle sway (sinusoidal horizontal drift)
        if (p.shape === 'square') {
          p.vx += Math.sin(now * 0.003 + i) * 0.05;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Decrement life
        p.life--;

        // Fade out in the last 30% of life
        const lifeFraction = p.life / p.maxLife;
        p.opacity = lifeFraction < 0.3
          ? lifeFraction / 0.3
          : 1;

        drawParticle(ctx, p);
        alive++;
      }

      // Continue or stop
      if (alive > 0 && elapsed < duration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = undefined;
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== undefined) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, [config, onComplete, stopAnimation]);

  // Don't render anything when no celebration is active
  if (!config) return null;

  return (
    <>
      {/* Reduced-motion flash overlay */}
      <div
        ref={flashRef}
        className={`fixed inset-0 pointer-events-none z-50 opacity-0 ${className}`}
        aria-hidden="true"
      />
      {/* Main particle canvas */}
      <canvas
        ref={canvasRef}
        className={`pointer-events-none z-50 ${className}`}
        style={{
          position: isFullScreen ? 'fixed' : 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        aria-hidden="true"
      />
    </>
  );
};
