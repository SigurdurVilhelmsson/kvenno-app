import { useEffect, useState } from 'react';

import { ParticleGlyph } from './ParticleBeaker';

/**
 * NaOH(s) → Na⁺(aq) + OH⁻(aq), drawn as a small solid whose units come apart
 * in water and drift off as separate ions, on a loop.
 */

const W = 300;
const H = 130;
const UNITS = 6;

/**
 * The solid is a checkerboard of ions, 4 by 3, each Na⁺ beside an OH⁻; each
 * unit is a horizontal pair, and in water its two ions drift apart.
 */
const CELL = 17;
const cell = (c: number, r: number) => ({ x: 40 + c * CELL, y: 42 + r * CELL });
const LAYOUT = Array.from({ length: UNITS }, (_, i) => {
  const r = Math.floor(i / 2);
  const c = (i % 2) * 2;
  const naFirst = (c + r) % 2 === 0;
  const naStart = cell(naFirst ? c : c + 1, r);
  const ohStart = cell(naFirst ? c + 1 : c, r);
  const angle = (i / UNITS) * Math.PI * 2 + 0.4;
  const naEnd = { x: 185 + Math.cos(angle) * 72, y: 65 + Math.sin(angle) * 40 };
  const ohEnd = { x: 185 + Math.cos(angle + 2.6) * 50, y: 65 + Math.sin(angle + 2.6) * 30 };
  return { naStart, ohStart, naEnd, ohEnd };
});

const PERIOD = 5;

function ease(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
}

export function NaOHDissolve({ still }: { still: boolean }) {
  const [t, setT] = useState(still ? PERIOD : 0);

  useEffect(() => {
    if (still) {
      setT(PERIOD);
      return;
    }
    let raf = 0;
    const begin = performance.now();
    const tick = (now: number) => {
      setT(((now - begin) / 1000) % PERIOD);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [still]);

  // Hold the solid, take it apart over two seconds, hold the ions.
  const k = still ? 1 : ease((t - 1) / 2);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto max-w-sm mx-auto"
      role="img"
      aria-label="NaOH leysist upp: hver eining verður að einni Na⁺-jón og einni OH⁻-jón"
      data-live
    >
      <rect x={4} y={4} width={W - 8} height={H - 8} rx={12} fill="#e0f2fe" opacity={0.7} />
      <text x={14} y={22} fontSize={11} fill="#0369a1">
        vatn
      </text>
      {LAYOUT.map(({ naStart, ohStart, naEnd, ohEnd }, i) => {
        const na = {
          x: naStart.x + (naEnd.x - naStart.x) * k,
          y: naStart.y + (naEnd.y - naStart.y) * k,
        };
        const oh = {
          x: ohStart.x + (ohEnd.x - ohStart.x) * k,
          y: ohStart.y + (ohEnd.y - ohStart.y) * k,
        };
        return (
          <g key={i}>
            <g transform={`translate(${Math.round(na.x) - 12} ${Math.round(na.y) - 12})`}>
              <ParticleGlyph kind="Na" />
            </g>
            <g transform={`translate(${Math.round(oh.x) - 13} ${Math.round(oh.y) - 13})`}>
              <ParticleGlyph kind="OH" />
            </g>
          </g>
        );
      })}
      <text x={36} y={110} fontSize={11} fill="#44403c" opacity={1 - k}>
        NaOH(s)
      </text>
      <text x={W - 14} y={H - 12} fontSize={11} textAnchor="end" fill="#44403c" opacity={k}>
        Na⁺(aq) + OH⁻(aq)
      </text>
    </svg>
  );
}
