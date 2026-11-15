import { formatDecimal } from '@shared/utils';

import {
  V_CAPACITY_ACID,
  V_CAPACITY_BASE,
  V_MAX,
  pHAfter,
  type Glass,
  type Reagent,
} from '../engine/naermynd';

/**
 * pH against the reagent added, for both glasses, drawn as far as the volume
 * added so far. Both curves come from `pHAfter`, the function the meters read.
 */

const W = 320;
const H = 210;
const PAD = { left: 34, right: 10, top: 22, bottom: 34 };
const x = (v: number) => PAD.left + (v / V_MAX) * (W - PAD.left - PAD.right);
const y = (pH: number) => PAD.top + ((14 - pH) / 14) * (H - PAD.top - PAD.bottom);

const r1 = (n: number) => Math.round(n * 10) / 10;

const COLOR: Record<Glass, string> = { buffer: '#7c3aed', water: '#0284c7' };

function path(glass: Glass, reagent: Reagent, upTo: number): string {
  const points: string[] = [];
  const n = 70;
  for (let i = 0; i <= n; i++) {
    const v = (upTo * i) / n;
    points.push(`${r1(x(v))},${r1(y(pHAfter(glass, reagent, v)))}`);
  }
  return `M ${points.join(' L ')}`;
}

export function BufferCurve({ reagent, volume }: { reagent: Reagent; volume: number }) {
  const capacity = reagent === 'HCl' ? V_CAPACITY_ACID : V_CAPACITY_BASE;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label={`pH beggja glasa á móti ${reagent === 'HCl' ? 'saltsýru' : 'natríumhýdroxíði'} sem bætt hefur verið við, upp að ${formatDecimal(volume, 2)} mL.`}
      data-live
    >
      {/* Axes and grid. */}
      {[0, 2, 4, 6, 8, 10, 12, 14].map((p) => (
        <g key={p}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(p)} y2={y(p)} stroke="#e7e5e4" />
          <text x={PAD.left - 6} y={y(p) + 4} fontSize={10} textAnchor="end" fill="#57534e">
            {p}
          </text>
        </g>
      ))}
      {[0, 1, 2, 3].map((v) => (
        <text
          key={v}
          x={x(v)}
          y={H - PAD.bottom + 14}
          fontSize={10}
          textAnchor="middle"
          fill="#57534e"
        >
          {v}
        </text>
      ))}
      <text
        x={(PAD.left + W - PAD.right) / 2}
        y={H - 4}
        fontSize={10}
        textAnchor="middle"
        fill="#57534e"
      >
        mL {reagent === 'HCl' ? 'HCl' : 'NaOH'}
      </text>
      <text x={PAD.left - 6} y={12} fontSize={10} textAnchor="end" fill="#57534e">
        pH
      </text>

      {/* Where the buffer's base (or acid) runs out. */}
      <line
        x1={x(capacity)}
        x2={x(capacity)}
        y1={PAD.top}
        y2={H - PAD.bottom}
        stroke="#a8a29e"
        strokeDasharray="4 3"
      />

      {(['water', 'buffer'] as const).map((g) => (
        <g key={g}>
          {volume > 0 && (
            <path d={path(g, reagent, volume)} fill="none" stroke={COLOR[g]} strokeWidth={2.5} />
          )}
          <circle cx={x(volume)} cy={y(pHAfter(g, reagent, volume))} r={4} fill={COLOR[g]} />
        </g>
      ))}
    </svg>
  );
}

export const CURVE_COLOR = COLOR;
