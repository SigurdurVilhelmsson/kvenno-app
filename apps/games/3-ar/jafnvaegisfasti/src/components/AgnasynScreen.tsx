/**
 * Agnasýn — two flasks of the water-gas shift, one started from reactants and
 * one from products, running to the same equilibrium. Nothing is graded or
 * stored. Built on the particle-view template (docs/particle-view-template.md);
 * every number comes from `engine/agnasyn.ts`.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { equationOf } from '@shared/engine/equilibrium';
import { focusTarget, formatDecimal, formatScientific, prefersReducedMotion } from '@shared/utils';

import {
  C0,
  K,
  PARTICLES_PER_M,
  SPECIES,
  T_MAX,
  countsAt,
  qAt,
  settledTime,
  type FlaskId,
  REACTION,
} from '../engine/agnasyn';

const COLORS: Record<string, string> = {
  CO: '#ea580c',
  'H₂O': '#ca8a04',
  'CO₂': '#7c3aed',
  'H₂': '#2563eb',
};

const FLASKS: { id: FlaskId; title: string }[] = [
  { id: 'hvarfefni', title: 'Byrjað á hvarfefnum' },
  { id: 'myndefni', title: 'Byrjað á myndefnum' },
];

/** Scene time per second of real time while playing. */
const SPEED = 1.25;
const EXCHANGE_MS = 1800;
const SETTLED = Math.max(settledTime('hvarfefni'), settledTime('myndefni'));

/** Q for reading: a comma, and words where it is 0 or infinite. */
export function showQ(q: number): string {
  if (!Number.isFinite(q)) return '∞';
  if (q === 0) return '0';
  if (q >= 0.01 && q < 1000) return formatDecimal(q, q < 0.1 ? 3 : q < 10 ? 2 : 1);
  return formatScientific(q, 2);
}

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Twenty places per species on a jittered grid, a different layout per flask. */
function places(seed: number) {
  const n = SPECIES.length * 20;
  const cols = 10;
  const rows = n / cols;
  const rand = seeded(seed);
  const cells = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells.map((cell) => ({
    x: ((cell % cols) + 0.5 + (rand() - 0.5) * 0.5) / cols,
    y: (Math.floor(cell / cols) + 0.5 + (rand() - 0.5) * 0.5) / rows,
  }));
}

const W = 200;
const H = 170;
const R = 5;

function Flask({
  id,
  t,
  offset,
  still,
}: {
  id: FlaskId;
  t: number;
  offset: number;
  still: boolean;
}) {
  const counts = countsAt(id, t);
  const spots = useMemo(() => places(id === 'hvarfefni' ? 11 : 29), [id]);
  const label = `${FLASKS.find((f) => f.id === id)!.title}: ${SPECIES.map(
    (s) => `${counts[s]} ${s}`
  ).join(', ')}.`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full"
      role="img"
      aria-label={label}
      data-live
    >
      <rect
        x={2}
        y={2}
        width={W - 4}
        height={H - 4}
        rx={10}
        fill="#f8fafc"
        stroke="#94a3b8"
        strokeWidth={2}
      />
      {SPECIES.map((s, si) =>
        Array.from({ length: 20 }, (_, i) => {
          // At equilibrium the offset turns: one of each species goes and another
          // appears, so both reactions are seen to continue while the counts hold.
          const visible = (i - offset + 20) % 20 < counts[s];
          const p = spots[si * 20 + i];
          return (
            <circle
              key={`${s}-${i}`}
              cx={8 + p.x * (W - 16)}
              cy={8 + p.y * (H - 16)}
              r={R}
              fill={COLORS[s]}
              stroke="#1f2937"
              strokeOpacity="0.35"
              style={{
                opacity: visible ? 1 : 0,
                transition: still ? undefined : 'opacity 400ms ease',
              }}
            />
          );
        })
      )}
    </svg>
  );
}

const GX = 34;
const GW = 300;
const GH = 150;
const LOG_MIN = -2;
const LOG_MAX = 2;

function y(q: number): number {
  const l = q <= 0 ? LOG_MIN : !Number.isFinite(q) ? LOG_MAX : Math.log10(q);
  const c = Math.max(LOG_MIN, Math.min(LOG_MAX, l));
  return 10 + ((LOG_MAX - c) / (LOG_MAX - LOG_MIN)) * (GH - 30);
}
const x = (t: number) => GX + (t / T_MAX) * (GW - GX - 8);

const TRACE: Record<FlaskId, string> = { hvarfefni: '#c2410c', myndefni: '#6d28d9' };

function QGraph({ t }: { t: number }) {
  const lines = useMemo(
    () =>
      FLASKS.map((f) => {
        const pts: string[] = [];
        for (let i = 0; i <= 200; i++) {
          const ti = (i / 200) * T_MAX;
          pts.push(`${Math.round(x(ti) * 10) / 10},${Math.round(y(qAt(f.id, ti)) * 10) / 10}`);
        }
        return { id: f.id, d: `M${pts.join('L')}` };
      }),
    []
  );
  const ticks = [-2, -1, 0, 1, 2];
  return (
    <svg
      viewBox={`0 0 ${GW} ${GH}`}
      className="block h-auto w-full"
      role="img"
      aria-label={`Q með tíma í báðum flöskum. Q byrjar í 0 í annarri og óendanlegu í hinni og stefnir í K = ${showQ(K)} í báðum.`}
      data-live
    >
      {ticks.map((k) => (
        <g key={k}>
          <line x1={GX} x2={GW - 8} y1={y(10 ** k)} y2={y(10 ** k)} stroke="#e5e7eb" />
          <text x={GX - 4} y={y(10 ** k) + 4} textAnchor="end" fontSize={10} fill="#57534e">
            {k === 0 ? '1' : `10${k < 0 ? '⁻' : ''}${['', '¹', '²'][Math.abs(k)]}`}
          </text>
        </g>
      ))}
      <line
        x1={GX}
        x2={GW - 8}
        y1={y(K)}
        y2={y(K)}
        stroke="#15803d"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
      <text x={GW - 10} y={y(K) - 5} textAnchor="end" fontSize={11} fontWeight={600} fill="#15803d">
        K = {showQ(K)}
      </text>
      {lines.map((l) => (
        <path key={l.id} d={l.d} fill="none" stroke={TRACE[l.id]} strokeWidth="2.5" />
      ))}
      <line x1={x(t)} x2={x(t)} y1={8} y2={GH - 20} stroke="#1f2937" strokeWidth={1} />
      {FLASKS.map((f) => (
        <circle key={f.id} cx={x(t)} cy={y(qAt(f.id, t))} r={4} fill={TRACE[f.id]} />
      ))}
      <text x={(GX + GW) / 2} y={GH - 4} textAnchor="middle" fontSize={10} fill="#57534e">
        tími →
      </text>
      <text x={8} y={GH / 2 - 10} fontSize={11} fontWeight={600} fill="#57534e">
        Q
      </text>
    </svg>
  );
}

function IceTable({ id, t }: { id: FlaskId; t: number }) {
  const start = countsAt(id, 0);
  const now = countsAt(id, t);
  const settled = t >= SETTLED;
  const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');
  return (
    <table className="w-full text-sm tabular-nums">
      <caption className="mb-1 text-left text-sm font-semibold text-warm-700">
        {FLASKS.find((f) => f.id === id)!.title}
      </caption>
      <thead>
        <tr className="text-warm-600">
          <th scope="col" className="text-left font-normal">
            <span className="sr-only">Lína</span>
          </th>
          {SPECIES.map((s) => (
            <th key={s} scope="col" className="px-1 text-right font-semibold">
              {s}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row" className="text-left font-normal text-warm-600">
            Upphaf
          </th>
          {SPECIES.map((s) => (
            <td key={s} className="px-1 text-right">
              {start[s]}
            </td>
          ))}
        </tr>
        <tr>
          <th scope="row" className="text-left font-normal text-warm-600">
            Breyting
          </th>
          {SPECIES.map((s) => (
            <td key={s} className="px-1 text-right">
              {signed(now[s] - start[s])}
            </td>
          ))}
        </tr>
        <tr className="font-semibold">
          <th scope="row" className="text-left">
            {settled ? 'Jafnvægi' : 'Nú'}
          </th>
          {SPECIES.map((s) => (
            <td key={s} className="px-1 text-right">
              {now[s]}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

interface Props {
  onBack: () => void;
}

export function AgnasynScreen({ onBack }: Props) {
  const [still] = useState(prefersReducedMotion);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [offset, setOffset] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    focusTarget(headingRef.current);
  }, []);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const dt = ((now - last) / 1000) * SPEED;
      last = now;
      setT((prev) => Math.min(T_MAX, prev + dt));
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  useEffect(() => {
    if (playing && t >= T_MAX) setPlaying(false);
  }, [playing, t]);

  const atEquilibrium = t >= SETTLED;
  useEffect(() => {
    if (still || !atEquilibrium) return;
    const id = setInterval(() => setOffset((o) => (o + 1) % 20), EXCHANGE_MS);
    return () => clearInterval(id);
  }, [still, atEquilibrium]);

  const play = () => {
    if (t >= T_MAX) setT(0);
    setPlaying((p) => !p);
  };

  const stage =
    t === 0 ? (
      <p>
        Í báðum flöskum eru jafnmörg atóm: í annarri sem CO og H₂O, í hinni sem CO₂ og H₂. Í þeirri
        fyrri er Q = 0, því þar er ekkert myndefni; í þeirri seinni er Q óendanlegt, því þar er
        ekkert hvarfefni. Ýttu á Spila eða dragðu tímann.
      </p>
    ) : atEquilibrium ? (
      <p>
        Báðar flöskurnar enda í sömu blöndu, 11 CO, 11 H₂O, 9 CO₂ og 9 H₂, og Q = K = {showQ(K)} í
        báðum. Hvörfin hætta ekki: sameindir hvarfast enn í báðar áttir, jafnhratt, svo fjöldinn
        helst sá sami. Neðsta línan í töflunum er jafnvægislína ICE-töflu, lesin beint af myndinni.
      </p>
    ) : (
      <p>
        Í fyrri flöskunni er Q minna en K og hvarfið gengur til hægri; í þeirri seinni er Q stærra
        en K og það gengur til vinstri. Í hvorri töflu er breytingin jafnstór fyrir öll efnin, með
        öfugu formerki hvarfefna- og myndefnamegin: hvert CO sem hverfur skilar einu CO₂.
      </p>
    );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 md:p-8 phone:p-3">
        <div className="mb-3 flex items-baseline justify-between gap-3 phone:mb-2">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="min-w-0 text-xl font-bold text-warm-800 sm:text-2xl phone:text-base"
          >
            Agnasýn: tvær leiðir að sama jafnvægi
          </h2>
          <button
            onClick={onBack}
            className="shrink-0 whitespace-nowrap text-sm text-warm-500 underline pointer-coarse:-my-3 pointer-coarse:-mr-3 pointer-coarse:px-3 pointer-coarse:py-3"
          >
            Til baka
          </button>
        </div>

        <div className="mb-3 rounded-xl border border-green-200 bg-green-50 p-3 text-center">
          <p className="font-mono text-sm text-green-900 sm:text-base">{equationOf(REACTION)}</p>
          <p className="text-sm text-green-900">Vatnsgashvarfið við 800 °C, K = {showQ(K)}</p>
        </div>

        <div className="mx-auto mb-3 grid max-w-2xl grid-cols-2 gap-2 sm:gap-3">
          {FLASKS.map((f) => {
            const q = qAt(f.id, t);
            return (
              <div key={f.id} className="rounded-xl border border-warm-200 p-1.5 sm:p-2">
                <div className="mb-1 text-sm font-semibold" style={{ color: TRACE[f.id] }}>
                  {f.title}
                </div>
                <Flask id={f.id} t={t} offset={offset} still={still} />
                <div className="mt-1 text-center text-lg font-bold text-warm-800 phone:text-base">
                  Q = {showQ(q)}
                </div>
                <div className="text-center text-sm text-warm-600">
                  {Math.abs(q - K) / K < 0.005
                    ? 'Q = K'
                    : q < K
                      ? 'Q < K: til hægri'
                      : 'Q > K: til vinstri'}
                </div>
              </div>
            );
          })}
        </div>

        <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-warm-700">
          {SPECIES.map((s) => (
            <li key={s} className="flex items-center gap-1">
              <svg width="12" height="12" aria-hidden="true">
                <circle cx="6" cy="6" r="5" fill={COLORS[s]} />
              </svg>
              {s}
            </li>
          ))}
        </ul>

        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border-2 border-green-200 bg-green-50 p-3">
          <button
            type="button"
            onClick={play}
            className="min-w-24 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 pointer-coarse:min-h-11"
          >
            {playing ? 'Stöðva' : t >= T_MAX ? 'Byrja aftur' : 'Spila'}
          </button>
          <label className="flex min-w-48 flex-1 items-center gap-2 text-sm font-semibold text-green-900">
            Tími
            <input
              type="range"
              min={0}
              max={T_MAX}
              step="0.05"
              value={t}
              onChange={(e) => {
                setPlaying(false);
                setT(Number(e.target.value));
              }}
              className="flex-1"
            />
          </label>
        </div>

        <div className="mb-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-warm-200 p-2">
            <div className="mb-1 text-sm font-semibold text-warm-700">Q með tíma</div>
            <QGraph t={t} />
          </div>
          <div className="space-y-3 rounded-xl border border-warm-200 p-2">
            {FLASKS.map((f) => (
              <IceTable key={f.id} id={f.id} t={t} />
            ))}
          </div>
        </div>

        <div aria-live="polite" className="mb-2 space-y-3 leading-relaxed text-warm-800">
          {stage}
        </div>
        <p className="text-xs text-warm-500">
          Ein ögn = {formatDecimal(1 / PARTICLES_PER_M, 3)} M; hver flaska byrjar með{' '}
          {formatDecimal(C0, 3)} M af hvoru efni. Hvar blandan endar ræðst af K einu. Hversu hratt
          hún kemst þangað stendur ekki í bókinni: hraðinn er valinn til sýnis og tímaásinn hefur
          engar einingar.
        </p>
      </div>
    </div>
  );
}
