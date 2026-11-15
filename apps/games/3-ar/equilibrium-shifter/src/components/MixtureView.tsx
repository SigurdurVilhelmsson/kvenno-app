/**
 * The mixture itself: the real species of the equilibrium, drawn on one fixed
 * scale, in up to three frames (in equilibrium, the instant after the stress,
 * the new equilibrium). Built on the particle-view template
 * (docs/particle-view-template.md); every count comes from `engine/mixture.ts`,
 * which takes it from `applyStress`.
 *
 * Particles keep their place from frame to frame, so a step shows what changed:
 * new particles fade in, used ones fade out, and a compressed vessel squeezes the
 * same particles into a narrower box.
 */

import { useEffect, useMemo, useState } from 'react';

import { formatDecimal, formatScientific, prefersReducedMotion } from '@shared/utils';

import type { Mixture, MixtureFrame } from '../engine/mixture';
import type { StressType } from '../types';

const REACTANT_COLORS = ['#ea580c', '#ca8a04', '#be123c'];
const PRODUCT_COLORS = ['#7c3aed', '#2563eb', '#0f766e'];

export const FRAME_TITLES = ['Í jafnvægi', 'Strax eftir álagið', 'Nýtt jafnvægi'];

const WIDTH = 320;
const HEIGHT = 170;
const PAD = 10;
const RADIUS = 6;

/** A small deterministic generator, so a system always draws the same way. */
function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

interface Slot {
  formula: string;
  index: number;
  /** Position in the unit square. */
  x: number;
  y: number;
}

/**
 * One slot per particle any frame needs, on a jittered grid, assigned once so a
 * particle that exists in two frames sits in the same place in both.
 */
function slots(mixture: Mixture): Slot[] {
  const most = mixture.species.map((s) =>
    Math.max(...mixture.frames.map((f) => f.counts[s.formula] ?? 0))
  );
  const keys: { formula: string; index: number }[] = [];
  const longest = Math.max(0, ...most);
  for (let i = 0; i < longest; i++) {
    mixture.species.forEach((s, j) => {
      if (i < most[j]) keys.push({ formula: s.formula, index: i });
    });
  }
  const n = keys.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt(n * 1.9)));
  const rows = Math.max(1, Math.ceil(n / cols));
  const rand = seeded(n * 7919 + mixture.species.length);
  const cells = Array.from({ length: cols * rows }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return keys.map((k, i) => {
    const cell = cells[i];
    const c = cell % cols;
    const r = Math.floor(cell / cols);
    return {
      ...k,
      x: (c + 0.5 + (rand() - 0.5) * 0.5) / cols,
      y: (r + 0.5 + (rand() - 0.5) * 0.5) / rows,
    };
  });
}

function sameCounts(a: MixtureFrame | undefined, b: MixtureFrame | undefined): boolean {
  if (!a || !b) return false;
  return Object.keys(a.counts).every((k) => a.counts[k] === b.counts[k]);
}

function perParticle(scale: number): string {
  const mol = 1 / scale;
  return mol >= 0.01 ? formatDecimal(mol, mol < 0.1 ? 3 : 2) : formatScientific(mol, 2);
}

/** What the step from the first frame to the second did, in words. */
function stressCaption(type: StressType): string {
  switch (type) {
    case 'add-reactant':
    case 'add-product':
      return 'Efninu er bætt við: fleiri agnir af því, hinar óbreyttar.';
    case 'remove-reactant':
    case 'remove-product':
      return 'Hluti efnisins er tekinn burt: færri agnir af því, hinar óbreyttar.';
    case 'increase-pressure':
      return 'Rúmmálið er helmingað: jafnmargar agnir í helmingi minna rými.';
    case 'decrease-pressure':
      return 'Rúmmálið er tvöfaldað: jafnmargar agnir í tvöfalt stærra rými.';
    case 'increase-temp':
    case 'decrease-temp':
      return 'Blandan er óbreytt. Hitabreytingin breytir K, ekki fjölda agnanna.';
    case 'add-catalyst':
      return 'Hvati breytir engu í blöndunni; hann flýtir aðeins fyrir báðum hvörfum.';
  }
}

interface MixtureViewProps {
  mixture: Mixture;
  stress: StressType | null;
  /** How many of the frames may be shown yet: the new equilibrium waits for the answer. */
  available: number;
  /** True where the stress moves nothing, so the last frame says so. */
  inert?: boolean;
}

export function MixtureView({ mixture, stress, available, inert = false }: MixtureViewProps) {
  const shown = Math.max(1, Math.min(available, mixture.frames.length));
  const [frame, setFrame] = useState(shown - 1);
  const [still] = useState(prefersReducedMotion);

  useEffect(() => {
    setFrame(shown - 1);
  }, [shown, mixture]);

  const current = mixture.frames[Math.min(frame, shown - 1)];
  const places = useMemo(() => slots(mixture), [mixture]);
  const color = useMemo(() => {
    const map: Record<string, string> = {};
    let r = 0;
    let p = 0;
    for (const s of mixture.species) {
      map[s.formula] =
        s.side === 'reactant'
          ? REACTANT_COLORS[r++ % REACTANT_COLORS.length]
          : PRODUCT_COLORS[p++ % PRODUCT_COLORS.length];
    }
    return map;
  }, [mixture]);

  // The box is drawn to the largest volume any frame has, so a compressed vessel
  // visibly narrows rather than everything else growing.
  const largest = Math.max(...mixture.frames.map((f) => f.volume));
  const innerW = WIDTH - 2 * PAD;
  const boxW = (innerW * current.volume) / largest;
  const boxX = PAD + (innerW - boxW) / 2;

  const label = `${FRAME_TITLES[Math.min(frame, shown - 1)]}: ${mixture.species
    .map((s) => `${current.counts[s.formula]} ${s.formula}`)
    .join(', ')}.`;

  const transition = still ? undefined : 'opacity 500ms ease, transform 600ms ease';
  const caption =
    frame === 1 && stress
      ? stressCaption(stress)
      : frame === 2
        ? inert
          ? 'Ekkert hliðrast: blandan er þegar í jafnvægi.'
          : sameCounts(mixture.frames[1], mixture.frames[2])
            ? 'Kerfið hliðrast, en svo lítið að það nær ekki einni ögn á þessum kvarða.'
            : 'Kerfið hefur hliðrast þar til Q = K á ný.'
        : null;

  return (
    <div className="w-full max-w-md rounded-xl border border-warm-200 bg-white p-2 sm:p-3">
      <div className="mb-1 text-sm font-semibold text-warm-700">Agnirnar í kerfinu</div>
      {shown > 1 && (
        <div role="group" aria-label="Rammar" className="mb-2 flex flex-wrap gap-1.5">
          {FRAME_TITLES.slice(0, shown).map((t, i) => (
            <button
              key={t}
              type="button"
              onClick={() => setFrame(i)}
              aria-pressed={i === frame}
              className={`rounded-lg border-2 px-2 py-1 text-xs font-semibold pointer-coarse:min-h-11 ${
                i === frame
                  ? 'border-kvenno-orange-600 bg-kvenno-orange-600 text-white'
                  : 'border-warm-300 bg-white text-warm-800 hover:bg-warm-50'
              }`}
            >
              {i + 1}. {t}
            </button>
          ))}
        </div>
      )}
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="block h-auto w-full"
        role="img"
        aria-label={label}
        data-live
      >
        <rect
          x={boxX}
          y={PAD}
          width={boxW}
          height={HEIGHT - 2 * PAD}
          rx={8}
          fill="#f8fafc"
          stroke="#94a3b8"
          strokeWidth={2}
          style={{ transition: still ? undefined : 'x 600ms ease, width 600ms ease' }}
        />
        {places.map((p) => {
          const visible = p.index < (current.counts[p.formula] ?? 0);
          const cx = boxX + RADIUS + 2 + p.x * (boxW - 2 * RADIUS - 4);
          const cy = PAD + RADIUS + 2 + p.y * (HEIGHT - 2 * PAD - 2 * RADIUS - 4);
          return (
            <circle
              key={`${p.formula}-${p.index}`}
              r={RADIUS}
              cx={0}
              cy={0}
              fill={color[p.formula]}
              stroke="#1f2937"
              strokeOpacity={0.35}
              style={{
                transform: `translate(${cx}px, ${cy}px)`,
                opacity: visible ? 1 : 0,
                transition,
              }}
            />
          );
        })}
      </svg>
      {caption && <p className="mt-1 text-sm text-warm-700">{caption}</p>}
      <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-warm-700">
        {mixture.species.map((s) => (
          <li key={s.formula} className="flex items-center gap-1">
            <svg width="12" height="12" aria-hidden="true">
              <circle cx="6" cy="6" r="5" fill={color[s.formula]} />
            </svg>
            {s.formula} <span className="tabular-nums">{current.counts[s.formula]}</span>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-xs text-warm-500">
        Ein ögn ≈ {perParticle(mixture.scale)} mól. Fjöldinn er námundaður að heilli ögn og
        reiknaður út frá K.
      </p>
    </div>
  );
}
