import { formatDecimal } from '@shared/utils';

import { PKA, V_EQ, V_HALF, V_MAX, pHAt } from '../utils/agnasyn';

/**
 * Agnasýn's títrunarferill, drawn only as far as the NaOH added so far, with
 * the two points the scenes are about marked once the curve has reached them.
 */

const W = 400;
const H = 280;
const PAD = { left: 40, right: 14, top: 14, bottom: 40 };
const X0 = PAD.left;
const X1 = W - PAD.right;
const Y0 = H - PAD.bottom;
const Y1 = PAD.top;

const x = (v: number) => X0 + ((X1 - X0) * v) / V_MAX;
const y = (pH: number) => Y0 - ((Y0 - Y1) * pH) / 14;
const r1 = (n: number) => Math.round(n * 10) / 10;

function pathTo(volume: number): string {
  const points: string[] = [];
  const n = Math.max(1, Math.ceil(volume / 0.05));
  for (let i = 0; i <= n; i++) {
    const v = Math.min(volume, i * 0.05);
    points.push(`${r1(x(v))} ${r1(y(pHAt(v)))}`);
  }
  // Land exactly on the equivalence point, where the curve is steepest.
  if (volume >= V_EQ) {
    const at = points.findIndex((_, i) => i * 0.05 > V_EQ);
    if (at > 0) points.splice(at, 0, `${r1(x(V_EQ))} ${r1(y(pHAt(V_EQ)))}`);
  }
  return `M ${points.join(' L ')}`;
}

interface ProgressCurveProps {
  volume: number;
}

export function ProgressCurve({ volume }: ProgressCurveProps) {
  const pH = pHAt(volume);
  const reachedHalf = volume >= V_HALF - 1e-9;
  const reachedEq = volume >= V_EQ - 1e-9;
  const pHEq = pHAt(V_EQ);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label={`Títrunarferill: pH ${formatDecimal(pH, 2)} eftir ${formatDecimal(volume, 2)} mL af NaOH`}
    >
      {/* Grid and axes. */}
      {[0, 2, 4, 6, 8, 10, 12, 14].map((p) => (
        <g key={p}>
          <line x1={X0} x2={X1} y1={y(p)} y2={y(p)} stroke="#e7e5e4" />
          <text x={X0 - 6} y={y(p) + 4} fontSize={12} textAnchor="end" fill="#57534e">
            {p}
          </text>
        </g>
      ))}
      {[0, 10, 20, 30, 40].map((v) => (
        <g key={v}>
          <line x1={x(v)} x2={x(v)} y1={Y0} y2={Y0 + 4} stroke="#78716c" />
          <text x={x(v)} y={Y0 + 17} fontSize={12} textAnchor="middle" fill="#57534e">
            {v}
          </text>
        </g>
      ))}
      <line x1={X0} x2={X1} y1={Y0} y2={Y0} stroke="#78716c" />
      <line x1={X0} x2={X0} y1={Y0} y2={Y1} stroke="#78716c" />
      <text x={(X0 + X1) / 2} y={H - 6} fontSize={12} textAnchor="middle" fill="#44403c">
        NaOH (mL)
      </text>
      <text
        x={12}
        y={(Y0 + Y1) / 2}
        fontSize={12}
        textAnchor="middle"
        fill="#44403c"
        transform={`rotate(-90 12 ${(Y0 + Y1) / 2})`}
      >
        pH
      </text>

      {/* The buffer region, pKa ± 1, once the curve is in it. */}
      {volume > 0 && (
        <rect
          x={x(V_EQ / 11)}
          width={x((10 * V_EQ) / 11) - x(V_EQ / 11)}
          y={y(PKA + 1)}
          height={y(PKA - 1) - y(PKA + 1)}
          fill="#dcfce7"
          opacity={0.6}
        />
      )}
      {volume > 0 && (
        <text x={x(V_HALF)} y={y(PKA + 1) - 4} fontSize={11} textAnchor="middle" fill="#15803d">
          stuðpúðasvæði
        </text>
      )}

      {/* pH 7, for the equivalence point to be read against. */}
      {reachedEq && (
        <>
          <line x1={X0} x2={X1} y1={y(7)} y2={y(7)} stroke="#a8a29e" strokeDasharray="4 3" />
          <text x={X1 - 2} y={y(7) + 14} fontSize={11} textAnchor="end" fill="#78716c">
            pH 7
          </text>
        </>
      )}

      <path d={pathTo(volume)} fill="none" stroke="#7c3aed" strokeWidth={2.5} />

      {reachedHalf && (
        <g>
          <line
            x1={X0}
            x2={x(V_HALF)}
            y1={y(PKA)}
            y2={y(PKA)}
            stroke="#15803d"
            strokeDasharray="4 3"
          />
          <line
            x1={x(V_HALF)}
            x2={x(V_HALF)}
            y1={y(PKA)}
            y2={Y0}
            stroke="#15803d"
            strokeDasharray="4 3"
          />
          <circle cx={x(V_HALF)} cy={y(PKA)} r={5} fill="#15803d" />
          <text x={x(V_HALF) + 8} y={y(PKA) + 16} fontSize={11} fill="#14532d">
            pH = pKₐ = {formatDecimal(PKA, 2)}
          </text>
        </g>
      )}
      {reachedEq && (
        <g>
          <line
            x1={x(V_EQ)}
            x2={x(V_EQ)}
            y1={y(pHEq)}
            y2={Y0}
            stroke="#b45309"
            strokeDasharray="4 3"
          />
          <circle cx={x(V_EQ)} cy={y(pHEq)} r={5} fill="#b45309" />
          <text x={x(V_EQ) - 9} y={y(pHEq) - 6} fontSize={11} textAnchor="end" fill="#78350f">
            jafngildispunktur, pH {formatDecimal(pHEq, 2)}
          </text>
        </g>
      )}

      {/* Where the titration is now. */}
      <circle cx={x(volume)} cy={y(pH)} r={6} fill="#fff" stroke="#7c3aed" strokeWidth={3} />
    </svg>
  );
}
