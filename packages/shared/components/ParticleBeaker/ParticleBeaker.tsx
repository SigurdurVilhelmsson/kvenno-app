import { useEffect, useRef, useState } from 'react';

import {
  RADIUS,
  applyCounts,
  createSystem,
  flicker,
  setBounds,
  step,
  type Bounds,
  type Kind,
  type ParticleCounts,
  type Species,
  type System,
} from './system';

/**
 * A particle view of a solution: the particles in a flask, magnified, with the
 * liquid rising as the reagent is added from the búretta above. Water
 * molecules are not drawn. It holds no chemistry: the caller passes the counts
 * (from its own game's function, docs/particle-view-template.md) and how full
 * the flask is.
 */

const W = 320;
const H = 300;
const GLASS = { left: 14, right: W - 14, top: 52, bottom: H - 10 };
/** Liquid height at the largest volume on the scale. */
const FULL = GLASS.bottom - GLASS.top - 6;

function liquidBounds(fill: number): Bounds {
  const h = FULL * Math.max(0.05, Math.min(1, fill));
  return {
    left: GLASS.left + 4,
    right: GLASS.right - 4,
    top: GLASS.bottom - h,
    bottom: GLASS.bottom - 3,
  };
}

const STYLE: Record<
  Kind,
  { fill: string; stroke: string; text: string; label: string; textColor: string }
> = {
  HA: { fill: '#93c5fd', stroke: '#1d4ed8', text: 'HA', label: 'CH₃COOH', textColor: '#1e3a8a' },
  A: { fill: '#86efac', stroke: '#15803d', text: 'A⁻', label: 'CH₃COO⁻', textColor: '#14532d' },
  H3O: { fill: '#fca5a5', stroke: '#b91c1c', text: '+', label: 'H⁺', textColor: '#7f1d1d' },
  OH: { fill: '#c4b5fd', stroke: '#6d28d9', text: '−', label: 'OH⁻', textColor: '#3b0764' },
  Na: { fill: '#e7e5e4', stroke: '#78716c', text: '+', label: 'Na⁺', textColor: '#57534e' },
  Cl: { fill: '#ecfccb', stroke: '#65a30d', text: '−', label: 'Cl⁻', textColor: '#365314' },
  H2O: { fill: '#e0f2fe', stroke: '#7dd3fc', text: '', label: 'H₂O', textColor: '#0369a1' },
};

export function ParticleGlyph({ kind, flag = false }: { kind: Kind; flag?: boolean }) {
  const size = 2 * (RADIUS[kind] + 6);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
      aria-hidden="true"
      className="shrink-0"
    >
      <Glyph kind={kind} flag={flag} />
    </svg>
  );
}

function Glyph({ kind, flag }: { kind: Kind; flag: boolean }) {
  const r = RADIUS[kind];
  const s = STYLE[kind];
  return (
    <>
      {flag && (
        <circle r={r + 4} fill="none" stroke="#1c1917" strokeWidth={1.2} strokeDasharray="3 2" />
      )}
      <circle r={r} fill={s.fill} stroke={s.stroke} strokeWidth={1.5} />
      {kind === 'HA' && <circle cx={8} cy={-8} r={4} fill="#fff" stroke={s.stroke} />}
      {kind === 'H2O' ? (
        <text y={3} textAnchor="middle" fontSize={6} fill={s.textColor}>
          H₂O
        </text>
      ) : (
        <text
          y={kind === 'HA' || kind === 'A' ? 3 : 4}
          textAnchor="middle"
          fontSize={kind === 'HA' || kind === 'A' ? 8.5 : 11}
          fontWeight={700}
          fill={s.textColor}
        >
          {s.text}
        </text>
      )}
    </>
  );
}

/** What each kind is called by default: Agnasýn's ediksýra and its asetatjón. */
export const PARTICLE_LABEL: Record<Species, string> = {
  HA: STYLE.HA.label,
  A: STYLE.A.label,
  H3O: STYLE.H3O.label,
  OH: STYLE.OH.label,
  Na: STYLE.Na.label,
  Cl: STYLE.Cl.label,
};

interface ParticleBeakerProps {
  /** The particles to draw; a change is shown as the reactions that make it. */
  counts: ParticleCounts;
  /** How full the flask is, 0–1; may move continuously while a scene plays. */
  fill: number;
  /** New reagent drips in and reacts where it lands, rather than appearing in place. */
  drip: boolean;
  /** No drifting and no swims: every change is made at once. */
  still: boolean;
  /** Draw Na⁺ and Cl⁻ faded, once they have been named spectators. */
  dimSpectator: boolean;
  /** A label naming what is drawn, for a screen reader. */
  label: string;
  /** The formula printed beside the búretta. */
  reagent?: string;
}

/** A drip runs only for a small step forward in the strong reagent; anything else is a jump. */
function isDripStep(prev: ParticleCounts, next: ParticleCounts): boolean {
  const dNa = next.Na - prev.Na;
  const dCl = (next.Cl ?? 0) - (prev.Cl ?? 0);
  return (dNa > 0 && dNa <= 2 && dCl === 0) || (dCl > 0 && dCl <= 2 && dNa === 0);
}

export function ParticleBeaker({
  counts,
  fill,
  drip,
  still,
  dimSpectator,
  label,
  reagent = 'NaOH',
}: ParticleBeakerProps) {
  const sysRef = useRef<System | null>(null);
  const rngRef = useRef<() => number>(Math.random);
  const fillRef = useRef(fill);
  fillRef.current = fill;
  const [, setFrame] = useState(0);

  if (sysRef.current === null) {
    const sys = createSystem(liquidBounds(fill));
    applyCounts(sys, counts, rngRef.current, { animate: false, drip: false });
    sysRef.current = sys;
  }

  const key = `${counts.HA}:${counts.A}:${counts.H3O}:${counts.OH}:${counts.Na}:${counts.Cl ?? 0}:${counts.flag}`;
  const lastKey = useRef(key);
  const lastCounts = useRef(counts);
  useEffect(() => {
    const sys = sysRef.current;
    if (!sys || lastKey.current === key) return;
    lastKey.current = key;
    const forward = isDripStep(lastCounts.current, counts);
    lastCounts.current = counts;
    setBounds(sys, liquidBounds(fillRef.current));
    applyCounts(sys, counts, rngRef.current, {
      animate: !still,
      drip: drip && forward && !still,
    });
    setFrame((f) => f + 1);
    // `key` names every count, so `counts` is read only when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, drip, still]);

  // The frame loop: drift, swims and fades. A still view draws only on change.
  useEffect(() => {
    if (still) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const sys = sysRef.current;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (sys) {
        setBounds(sys, liquidBounds(fillRef.current));
        step(sys, dt, rngRef.current);
      }
      setFrame((f) => (f + 1) % 1_000_000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [still]);

  // A still view settles every change at once.
  useEffect(() => {
    if (!still || !sysRef.current) return;
    setBounds(sysRef.current, liquidBounds(fill));
    step(sysRef.current, 0, rngRef.current, true);
  });

  // The dynamic equilibrium: a pair forms while another recombines, every few seconds.
  const flagged = counts.flag !== null;
  useEffect(() => {
    if (!flagged || still) return;
    const id = window.setInterval(() => {
      if (sysRef.current) flicker(sysRef.current, rngRef.current);
    }, 3200);
    return () => window.clearInterval(id);
  }, [flagged, still]);

  const liquid = liquidBounds(fill);
  const particles = sysRef.current?.particles ?? [];
  // Spectators behind, so the reacting particles stay readable.
  const spectator = (k: Kind) => k === 'Na' || k === 'Cl';
  const ordered = [
    ...particles.filter((p) => spectator(p.kind)),
    ...particles.filter((p) => !spectator(p.kind)),
  ];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto max-h-[60vh]"
      role="img"
      aria-label={label}
      data-live
    >
      {/* The búretta's tip above the flask. */}
      <rect x={W / 2 - 7} y={0} width={14} height={30} fill="#f5f5f4" stroke="#a8a29e" />
      <rect x={W / 2 - 12} y={22} width={24} height={7} rx={2} fill="#78716c" />
      <path
        d={`M ${W / 2 - 4} 30 L ${W / 2 - 1.5} 44 L ${W / 2 + 1.5} 44 L ${W / 2 + 4} 30 Z`}
        fill="#d6d3d1"
      />
      <text x={W / 2 + 18} y={20} fontSize={11} fill="#57534e">
        {reagent}
      </text>

      {/* The glass and the liquid. */}
      <rect
        x={GLASS.left}
        y={GLASS.top}
        width={GLASS.right - GLASS.left}
        height={GLASS.bottom - GLASS.top}
        rx={14}
        fill="#fafaf9"
        stroke="#a8a29e"
        strokeWidth={2}
      />
      <rect
        x={GLASS.left + 2}
        y={liquid.top}
        width={GLASS.right - GLASS.left - 4}
        height={GLASS.bottom - 2 - liquid.top}
        rx={12}
        fill="#e0f2fe"
        opacity={0.8}
      />

      {ordered.map((p) => (
        <g
          key={p.id}
          transform={`translate(${Math.round(p.x * 10) / 10} ${Math.round(p.y * 10) / 10})`}
          opacity={(spectator(p.kind) && dimSpectator ? 0.7 : 1) * p.alpha}
        >
          {p.glow > 0 && (
            <circle r={RADIUS[p.kind] + 6} fill="#fde047" opacity={Math.min(0.6, p.glow / 2)} />
          )}
          <Glyph kind={p.kind} flag={p.flag} />
        </g>
      ))}
    </svg>
  );
}
