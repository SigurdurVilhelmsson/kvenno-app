import React, { useId } from 'react';

import { formatDecimal } from '@shared/utils';

import { getIndicatorColor } from '../data/indicators';
import { getPHColor } from '../utils/ph-calculations';

interface TitrationApparatusProps {
  /** Titrant delivered so far, mL: the burette reading. */
  volumeAdded: number;
  /** The burette's scale, mL. */
  maxVolume?: number;
  /** The sample's volume in the flask before any titrant, mL. */
  volumeAnalyte: number;
  pH: number;
  selectedIndicator: string | null;
  /** True while titrant is running: a drop falls from the tip. */
  isPouring?: boolean;
  /** True before an indicator is in: the solution shows no colour at all. */
  colourless?: boolean;
}

// Geometry, in viewBox units (160 × 430). The burette stands on the stand's
// rod and its tip sits in the flask's neck, as on a bench.
const BURETTE_X = 100; // centre line of burette, tip and flask
const TUBE_W = 18;
const TUBE_TOP = 12;
const SCALE_TOP = 28; // the 0 mL mark
const SCALE_BOTTOM = 252; // the maxVolume mark
const TUBE_BOTTOM = 266;
const STOPCOCK_Y = 276;
const TIP_END = 318;
const NECK_TOP = 306;
const NECK_W = 24;
const SHOULDER_Y = 336;
const FLASK_BOTTOM = 404;
const FLASK_HALF = 52;
const FLASK_CAPACITY = 110; // mL that would fill the body to the shoulder

const flaskOutline = (() => {
  const nl = BURETTE_X - NECK_W / 2;
  const nr = BURETTE_X + NECK_W / 2;
  const bl = BURETTE_X - FLASK_HALF;
  const br = BURETTE_X + FLASK_HALF;
  return [
    `M ${nl} ${NECK_TOP}`,
    `L ${nl} ${SHOULDER_Y}`,
    `L ${bl + 4} ${FLASK_BOTTOM - 8}`,
    `Q ${bl} ${FLASK_BOTTOM} ${bl + 9} ${FLASK_BOTTOM}`,
    `L ${br - 9} ${FLASK_BOTTOM}`,
    `Q ${br} ${FLASK_BOTTOM} ${br - 4} ${FLASK_BOTTOM - 8}`,
    `L ${nr} ${SHOULDER_Y}`,
    `L ${nr} ${NECK_TOP}`,
  ].join(' ');
})();

/**
 * The bench: a stand, a burette clamped to it and a conical flask under its
 * tip on a white tile. The burette reads 0 mL at the top and drains as
 * titrant runs into the flask, as a real one does; the flask takes the
 * indicator's colour, or a universal-indicator colour before one is chosen.
 *
 * One SVG, so the parts keep their places at every width. It replaced a
 * burette and a flask drawn side by side, the burette's scale upside down and
 * filling as it delivered, the flask with no outline (2026-11-14).
 */
export const TitrationApparatus: React.FC<TitrationApparatusProps> = ({
  volumeAdded,
  maxVolume = 60,
  volumeAnalyte,
  pH,
  selectedIndicator,
  isPouring = false,
  colourless: noIndicator = false,
}) => {
  const id = useId().replace(/:/g, '');
  const delivered = Math.min(Math.max(volumeAdded, 0), maxVolume);
  const mlToY = (ml: number) => SCALE_TOP + (ml / maxVolume) * (SCALE_BOTTOM - SCALE_TOP);
  const meniscusY = mlToY(delivered);

  const totalVolume = volumeAnalyte + delivered;
  const level = Math.min(totalVolume / FLASK_CAPACITY, 0.92);
  const liquidTop = FLASK_BOTTOM - level * (FLASK_BOTTOM - SHOULDER_Y);

  const solutionColor = noIndicator
    ? 'transparent'
    : selectedIndicator
      ? getIndicatorColor(selectedIndicator, pH)
      : getPHColor(pH);
  const colourless = solutionColor === 'transparent';

  const tubeL = BURETTE_X - TUBE_W / 2;
  const tubeR = BURETTE_X + TUBE_W / 2;

  // Graduations: a short mark every mL, a longer one every 5, a number every 10.
  const marks: React.ReactElement[] = [];
  for (let ml = 0; ml <= maxVolume; ml++) {
    const y = mlToY(ml);
    const len = ml % 10 === 0 ? 9 : ml % 5 === 0 ? 6 : 3.5;
    marks.push(
      <line
        key={`m${ml}`}
        x1={tubeL}
        x2={tubeL + len}
        y1={y}
        y2={y}
        stroke="#334155"
        strokeWidth={ml % 5 === 0 ? 0.9 : 0.6}
      />
    );
    if (ml % 10 === 0) {
      marks.push(
        <text
          key={`t${ml}`}
          x={tubeL - 4}
          y={y + 5}
          textAnchor="end"
          fontSize={14}
          fontWeight={600}
          fill="#334155"
        >
          {ml}
        </text>
      );
    }
  }

  const label = `Títrunarbúnaður. Búrettan sýnir ${formatDecimal(delivered, 2)} mL. Í keiluflöskunni eru ${formatDecimal(totalVolume, 1)} mL lausnar með pH ${formatDecimal(pH, 2)}.`;

  return (
    <svg
      viewBox="0 0 160 430"
      role="img"
      aria-label={label}
      data-burette-ml={delivered}
      className="h-[260px] w-auto md:h-[440px] lg:h-[480px] phone:h-[250px]"
    >
      <defs>
        <clipPath id={`${id}-flask`}>
          <path d={`${flaskOutline} Z`} />
        </clipPath>
        <linearGradient id={`${id}-glass`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#f1f5f9" stopOpacity="0.5" />
          <stop offset="1" stopColor="#e2e8f0" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`${id}-rod`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#94a3b8" />
          <stop offset="0.5" stopColor="#e2e8f0" />
          <stop offset="1" stopColor="#64748b" />
        </linearGradient>
      </defs>

      {/* Stand: base plate and rod */}
      <rect x={6} y={414} width={148} height={10} rx={3} fill="#475569" />
      <rect x={20} y={6} width={6} height={410} rx={2} fill={`url(#${id}-rod)`} />

      {/* Clamp holding the burette */}
      <rect x={18} y={84} width={10} height={12} rx={2} fill="#334155" />
      <rect x={26} y={88} width={tubeL - 24} height={4} fill="#475569" />
      <rect
        x={tubeL - 3}
        y={80}
        width={TUBE_W + 6}
        height={20}
        rx={3}
        fill="none"
        stroke="#475569"
        strokeWidth={3}
      />

      {/* White tile under the flask, so a colour change shows */}
      <rect
        x={BURETTE_X - 58}
        y={FLASK_BOTTOM}
        width={116}
        height={8}
        rx={1.5}
        fill="#ffffff"
        stroke="#cbd5e1"
      />

      {/* Burette: titrant from the meniscus down to the stopcock */}
      <rect
        x={tubeL + 1.5}
        y={meniscusY}
        width={TUBE_W - 3}
        height={TUBE_BOTTOM - meniscusY}
        fill="#bfdbfe"
        opacity={0.75}
      />
      <path
        d={`M ${tubeL + 1.5} ${meniscusY - 2} Q ${BURETTE_X} ${meniscusY + 4} ${tubeR - 1.5} ${meniscusY - 2}`}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={1.4}
      />
      {/* Stem, stopcock and tip, full of titrant below the tap */}
      <path
        d={`M ${tubeL} ${TUBE_BOTTOM} L ${BURETTE_X - 3} ${TUBE_BOTTOM + 8} L ${BURETTE_X - 3} ${STOPCOCK_Y + 12} L ${BURETTE_X - 1} ${TIP_END} L ${BURETTE_X + 1} ${TIP_END} L ${BURETTE_X + 3} ${STOPCOCK_Y + 12} L ${BURETTE_X + 3} ${TUBE_BOTTOM + 8} L ${tubeR} ${TUBE_BOTTOM} Z`}
        fill="#bfdbfe"
        stroke="#475569"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      {/* Glass tube */}
      <rect
        x={tubeL}
        y={TUBE_TOP}
        width={TUBE_W}
        height={TUBE_BOTTOM - TUBE_TOP}
        rx={2}
        fill={`url(#${id}-glass)`}
        fillOpacity={0.55}
        stroke="#475569"
        strokeWidth={1.4}
      />
      <line
        x1={tubeR - 4}
        x2={tubeR - 4}
        y1={TUBE_TOP + 6}
        y2={TUBE_BOTTOM - 6}
        stroke="#ffffff"
        strokeWidth={1.5}
        opacity={0.8}
      />
      {marks}
      <text x={tubeR + 4} y={SCALE_TOP + 5} fontSize={11} fill="#64748b">
        mL
      </text>

      {/* Stopcock: the key turns across the stem when it runs */}
      <circle
        cx={BURETTE_X}
        cy={STOPCOCK_Y}
        r={6}
        fill="#e2e8f0"
        stroke="#475569"
        strokeWidth={1.2}
      />
      <rect
        x={BURETTE_X - (isPouring ? 3 : 15)}
        y={STOPCOCK_Y - (isPouring ? 15 : 3)}
        width={isPouring ? 6 : 30}
        height={isPouring ? 30 : 6}
        rx={3}
        fill="#64748b"
      />

      {/* A drop falling while titrant runs */}
      {isPouring && (
        <g data-live="">
          <circle cx={BURETTE_X} cy={TIP_END + 4} r={2.4} fill="#60a5fa" className="animate-drip" />
        </g>
      )}

      {/* Conical flask: solution clipped to the glass, then the outline */}
      <g clipPath={`url(#${id}-flask)`}>
        <rect
          x={BURETTE_X - FLASK_HALF}
          y={NECK_TOP}
          width={FLASK_HALF * 2}
          height={FLASK_BOTTOM - NECK_TOP}
          fill="#f8fafc"
          opacity={0.6}
        />
        <rect
          x={BURETTE_X - FLASK_HALF}
          y={liquidTop}
          width={FLASK_HALF * 2}
          height={FLASK_BOTTOM - liquidTop}
          fill={colourless ? '#e0f2fe' : solutionColor}
          opacity={colourless ? 0.55 : 0.72}
          style={{ transition: 'fill 300ms, y 300ms, height 300ms' }}
        />
        <line
          x1={BURETTE_X - FLASK_HALF}
          x2={BURETTE_X + FLASK_HALF}
          y1={liquidTop}
          y2={liquidTop}
          stroke="#ffffff"
          strokeWidth={1.2}
          opacity={0.7}
        />
        <path
          d={`M ${BURETTE_X + NECK_W / 2 - 5} ${SHOULDER_Y + 4} L ${BURETTE_X + FLASK_HALF - 12} ${FLASK_BOTTOM - 12}`}
          stroke="#ffffff"
          strokeWidth={3}
          opacity={0.6}
          strokeLinecap="round"
        />
      </g>
      <path d={flaskOutline} fill="none" stroke="#334155" strokeWidth={2} strokeLinejoin="round" />
      {/* Rim */}
      <rect
        x={BURETTE_X - NECK_W / 2 - 2.5}
        y={NECK_TOP - 3}
        width={NECK_W + 5}
        height={4}
        rx={1.5}
        fill="none"
        stroke="#334155"
        strokeWidth={1.6}
      />
    </svg>
  );
};
