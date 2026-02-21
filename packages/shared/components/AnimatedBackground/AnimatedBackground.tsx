import React, { useMemo } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Chemistry year theme controlling the color palette. */
export type YearTheme = '1-ar' | '2-ar' | '3-ar';

/** Visual variant that adjusts opacity and animation speed. */
export type AnimatedBackgroundVariant = 'default' | 'menu' | 'gameplay' | 'celebration';

/** Controls how pronounced the background animations are. */
export type AnimatedBackgroundIntensity = 'low' | 'medium' | 'high';

export interface AnimatedBackgroundProps {
  /** Year theme that determines the color palette. */
  yearTheme: YearTheme;
  /** Visual variant — adjusts blob opacity and animation speed. Default `'default'`. */
  variant?: AnimatedBackgroundVariant;
  /** When `true`, renders faint floating chemistry symbol SVGs. Default `false`. */
  showSymbols?: boolean;
  /** Animation intensity — scales durations and movement range. Default `'medium'`. */
  intensity?: AnimatedBackgroundIntensity;
  /** Content rendered above the animated layers. */
  children: React.ReactNode;
  /** Additional class names merged onto the outermost wrapper. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Theme color palettes
// ---------------------------------------------------------------------------

interface ThemeColors {
  base: string;
  blob1: string;
  blob2: string;
  blob3: string;
}

const THEME_COLORS: Record<YearTheme, ThemeColors> = {
  '1-ar': {
    base: '#fff7f0',
    blob1: '#ffd4b0',
    blob2: '#ffb678',
    blob3: '#ff9545',
  },
  '2-ar': {
    base: '#f0fdfa',
    blob1: '#99f6e4',
    blob2: '#5eead4',
    blob3: '#2dd4bf',
  },
  '3-ar': {
    base: '#faf5ff',
    blob1: '#ddd6fe',
    blob2: '#c4b5fd',
    blob3: '#a78bfa',
  },
};

// ---------------------------------------------------------------------------
// Variant-specific opacity multipliers
// ---------------------------------------------------------------------------

const VARIANT_OPACITY: Record<AnimatedBackgroundVariant, number> = {
  default: 0.10,
  menu: 0.15,
  gameplay: 0.08,
  celebration: 0.15,
};

// ---------------------------------------------------------------------------
// Intensity → base animation duration (seconds)
// ---------------------------------------------------------------------------

const INTENSITY_DURATION: Record<AnimatedBackgroundIntensity, number> = {
  low: 40,
  medium: 25,
  high: 15,
};

// Celebration variant speeds things up further
const CELEBRATION_SPEED_FACTOR = 0.6;

// ---------------------------------------------------------------------------
// Chemistry symbol SVG paths (simple line-art)
// ---------------------------------------------------------------------------

/** Atom: three elliptical orbits + a center nucleus dot. */
function AtomSymbol() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="50" cy="50" r="4" fill="currentColor" stroke="none" />
      <ellipse cx="50" cy="50" rx="38" ry="14" />
      <ellipse cx="50" cy="50" rx="38" ry="14" transform="rotate(60 50 50)" />
      <ellipse cx="50" cy="50" rx="38" ry="14" transform="rotate(120 50 50)" />
    </svg>
  );
}

/** Beaker: a simple straight-walled beaker outline. */
function BeakerSymbol() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30 15 L30 70 Q30 88 50 88 Q70 88 70 70 L70 15" />
      <line x1="25" y1="15" x2="75" y2="15" />
      <path d="M35 55 Q50 48 65 55" opacity="0.5" />
    </svg>
  );
}

/** Erlenmeyer flask outline. */
function FlaskSymbol() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 12 L40 42 L18 82 Q14 90 22 90 L78 90 Q86 90 82 82 L60 42 L60 12" />
      <line x1="35" y1="12" x2="65" y2="12" />
      <path d="M28 72 Q50 62 72 72" opacity="0.5" />
    </svg>
  );
}

/** Simple diatomic / triatomic molecule: circles + connecting bonds. */
function MoleculeSymbol() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="30" y1="55" x2="50" y2="38" />
      <line x1="50" y1="38" x2="70" y2="55" />
      <circle cx="30" cy="55" r="10" />
      <circle cx="50" cy="38" r="12" />
      <circle cx="70" cy="55" r="10" />
    </svg>
  );
}

/** Hexagonal benzene ring outline. */
function HexRingSymbol() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <polygon points="50,14 82,30 82,62 50,78 18,62 18,30" />
      <polygon points="50,24 72,36 72,56 50,68 28,56 28,36" strokeDasharray="8 6" opacity="0.6" />
    </svg>
  );
}

/** Test tube outline. */
function TestTubeSymbol() {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M38 10 L38 68 Q38 86 50 86 Q62 86 62 68 L62 10" />
      <line x1="32" y1="10" x2="68" y2="10" />
      <line x1="38" y1="22" x2="62" y2="22" opacity="0.4" />
      <path d="M42 60 Q50 54 58 60" opacity="0.5" />
    </svg>
  );
}

const CHEMISTRY_SYMBOLS = [AtomSymbol, BeakerSymbol, FlaskSymbol, MoleculeSymbol, HexRingSymbol, TestTubeSymbol];

// Each floating symbol instance: position, size, animation delay/duration offset.
interface SymbolPlacement {
  Component: React.FC;
  /** CSS left offset (%). */
  left: number;
  /** CSS top offset (%). */
  top: number;
  /** Size in px. */
  size: number;
  /** Animation delay in seconds. */
  delay: number;
  /** Multiplier on the base symbol drift duration. */
  durationFactor: number;
  /** Initial rotation (deg). */
  rotate: number;
}

/**
 * Deterministic symbol placements so the layout is stable across renders
 * but looks naturally scattered.
 */
const SYMBOL_PLACEMENTS: Omit<SymbolPlacement, 'Component'>[] = [
  { left: 8, top: 12, size: 90, delay: 0, durationFactor: 1.0, rotate: 15 },
  { left: 72, top: 6, size: 70, delay: 4, durationFactor: 1.15, rotate: -10 },
  { left: 45, top: 55, size: 110, delay: 8, durationFactor: 0.9, rotate: 30 },
  { left: 85, top: 60, size: 65, delay: 12, durationFactor: 1.25, rotate: -20 },
  { left: 18, top: 75, size: 80, delay: 6, durationFactor: 1.05, rotate: 5 },
  { left: 58, top: 85, size: 100, delay: 2, durationFactor: 0.95, rotate: -35 },
];

// ---------------------------------------------------------------------------
// Keyframe stylesheet (injected once via <style>)
// ---------------------------------------------------------------------------

/**
 * Builds all @keyframes and blob/symbol styles for the requested parameters.
 * The stylesheet is scoped via a unique-ish className prefix to avoid collisions
 * if multiple AnimatedBackground instances coexist (unlikely but safe).
 */
function buildStylesheet(
  baseDuration: number,
  isCelebration: boolean,
): string {
  const dur = isCelebration ? baseDuration * CELEBRATION_SPEED_FACTOR : baseDuration;

  // Blob durations — each blob has a slightly different cycle so they de-sync
  const d1 = dur;
  const d2 = dur * 1.3;
  const d3 = dur * 0.85;

  // Symbol drift is always slower than blobs for subtle parallax
  const symbolDur = dur * 1.5;

  return `
/* ---- Gradient blob keyframes ---- */

@keyframes ab-blob-drift-1 {
  0%   { transform: translate(0%, 0%) scale(1); }
  25%  { transform: translate(12%, -8%) scale(1.05); }
  50%  { transform: translate(-5%, 10%) scale(0.95); }
  75%  { transform: translate(-12%, -4%) scale(1.02); }
  100% { transform: translate(0%, 0%) scale(1); }
}

@keyframes ab-blob-drift-2 {
  0%   { transform: translate(0%, 0%) scale(1); }
  20%  { transform: translate(-10%, 6%) scale(1.04); }
  40%  { transform: translate(8%, 12%) scale(0.96); }
  60%  { transform: translate(14%, -6%) scale(1.06); }
  80%  { transform: translate(-6%, -10%) scale(0.98); }
  100% { transform: translate(0%, 0%) scale(1); }
}

@keyframes ab-blob-drift-3 {
  0%   { transform: translate(0%, 0%) scale(1); }
  30%  { transform: translate(10%, 14%) scale(1.03); }
  60%  { transform: translate(-14%, 4%) scale(0.97); }
  100% { transform: translate(0%, 0%) scale(1); }
}

/* ---- Floating symbol keyframes ---- */

@keyframes ab-symbol-drift {
  0%   { transform: translate(0px, 0px) rotate(0deg); }
  25%  { transform: translate(8px, -12px) rotate(3deg); }
  50%  { transform: translate(-6px, 6px) rotate(-2deg); }
  75%  { transform: translate(10px, 10px) rotate(4deg); }
  100% { transform: translate(0px, 0px) rotate(0deg); }
}

/* ---- Blob animation classes ---- */

.ab-blob-1 {
  animation: ab-blob-drift-1 ${d1.toFixed(1)}s ease-in-out infinite;
  will-change: transform;
}

.ab-blob-2 {
  animation: ab-blob-drift-2 ${d2.toFixed(1)}s ease-in-out infinite;
  will-change: transform;
}

.ab-blob-3 {
  animation: ab-blob-drift-3 ${d3.toFixed(1)}s ease-in-out infinite;
  will-change: transform;
}

/* ---- Symbol animation class ---- */

.ab-symbol {
  animation: ab-symbol-drift var(--ab-sym-dur) ease-in-out infinite;
  animation-delay: var(--ab-sym-delay);
  will-change: transform;
}

/* ---- Reduced motion ---- */

@media (prefers-reduced-motion: reduce) {
  .ab-blob-1,
  .ab-blob-2,
  .ab-blob-3,
  .ab-symbol {
    animation: none !important;
  }
}

/* ---- Symbol base duration variable (consumed by .ab-symbol via var) ---- */
:root {
  --ab-symbol-base-dur: ${symbolDur.toFixed(1)}s;
}
`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `AnimatedBackground` renders a layered, subtly animated background
 * with drifting gradient blobs and optional floating chemistry symbols.
 *
 * It is designed to replace flat gradient backgrounds in chemistry games,
 * providing an atmospheric and visually rich canvas that adapts to the
 * year theme (1-ar warm oranges, 2-ar cool teals, 3-ar rich purples).
 *
 * All decorative layers are `pointer-events: none` and `aria-hidden`,
 * and animations respect `prefers-reduced-motion`.
 *
 * @example
 * ```tsx
 * <AnimatedBackground yearTheme="2-ar" variant="gameplay" showSymbols>
 *   <GameContent />
 * </AnimatedBackground>
 * ```
 */
export function AnimatedBackground({
  yearTheme,
  variant = 'default',
  showSymbols = false,
  intensity = 'medium',
  children,
  className = '',
}: AnimatedBackgroundProps) {
  const themeColors = THEME_COLORS[yearTheme];
  const blobOpacity = VARIANT_OPACITY[variant];
  const baseDuration = INTENSITY_DURATION[intensity];
  const isCelebration = variant === 'celebration';

  // Memoize the stylesheet string so it only recomputes when inputs change.
  const stylesheet = useMemo(
    () => buildStylesheet(baseDuration, isCelebration),
    [baseDuration, isCelebration],
  );

  // Memoize symbol placements mapped to actual components.
  const symbolInstances = useMemo<SymbolPlacement[]>(() => {
    if (!showSymbols) return [];
    return SYMBOL_PLACEMENTS.map((placement, i) => ({
      ...placement,
      Component: CHEMISTRY_SYMBOLS[i % CHEMISTRY_SYMBOLS.length],
    }));
  }, [showSymbols]);

  // Compute the symbol base duration for inline style vars.
  const symbolBaseDur = isCelebration
    ? baseDuration * CELEBRATION_SPEED_FACTOR * 1.5
    : baseDuration * 1.5;

  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* Injected keyframe styles */}
      <style dangerouslySetInnerHTML={{ __html: stylesheet }} />

      {/* ── Base color layer ── */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: themeColors.base }}
        aria-hidden="true"
      />

      {/* ── Gradient blob layer ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Blob 1 — top-left region, largest */}
        <div
          className="ab-blob-1 absolute rounded-full"
          style={{
            width: '70vmax',
            height: '70vmax',
            top: '-20%',
            left: '-15%',
            background: `radial-gradient(circle, ${themeColors.blob1} 0%, transparent 70%)`,
            opacity: blobOpacity,
            filter: 'blur(80px)',
          }}
        />

        {/* Blob 2 — center-right region */}
        <div
          className="ab-blob-2 absolute rounded-full"
          style={{
            width: '55vmax',
            height: '55vmax',
            top: '20%',
            right: '-10%',
            background: `radial-gradient(circle, ${themeColors.blob2} 0%, transparent 70%)`,
            opacity: blobOpacity,
            filter: 'blur(80px)',
          }}
        />

        {/* Blob 3 — bottom region, deepest color */}
        <div
          className="ab-blob-3 absolute rounded-full"
          style={{
            width: '60vmax',
            height: '60vmax',
            bottom: '-15%',
            left: '20%',
            background: `radial-gradient(circle, ${themeColors.blob3} 0%, transparent 70%)`,
            opacity: blobOpacity,
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* ── Chemistry symbols layer (optional) ── */}
      {showSymbols && symbolInstances.length > 0 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {symbolInstances.map((sym, i) => {
            const dur = symbolBaseDur * sym.durationFactor;
            return (
              <div
                key={i}
                className="ab-symbol absolute"
                style={{
                  left: `${sym.left}%`,
                  top: `${sym.top}%`,
                  width: sym.size,
                  height: sym.size,
                  opacity: 0.04,
                  color: themeColors.blob3,
                  transform: `rotate(${sym.rotate}deg)`,
                  '--ab-sym-dur': `${dur.toFixed(1)}s`,
                  '--ab-sym-delay': `${sym.delay}s`,
                } as React.CSSProperties}
              >
                <sym.Component />
              </div>
            );
          })}
        </div>
      )}

      {/* ── Content ── */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
