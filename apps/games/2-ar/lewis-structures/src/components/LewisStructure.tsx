import {
  LEWIS_COLORS,
  LEWIS_SIZES,
  chargeText,
  lewisGeometry,
  type LewisBond,
  type LewisDrawing,
  type Point,
} from '../utils/lewisLayout';

/**
 * The game's one way of drawing a Lewis structure — see `utils/lewisLayout.ts`
 * for why there is only one. The pieces are exported so the Stig 2 board can
 * draw with the same pen and add its own tap targets on top.
 */

export function BondLines({
  from,
  to,
  type,
  color = LEWIS_COLORS.bond,
}: {
  from: Point;
  to: Point;
  type: LewisBond;
  color?: string;
}) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const px = -Math.sin(angle);
  const py = Math.cos(angle);
  const { bondGap } = LEWIS_SIZES;
  const offsets =
    type === 'single'
      ? [0]
      : type === 'double'
        ? [-bondGap / 2, bondGap / 2]
        : type === 'triple'
          ? [-bondGap, 0, bondGap]
          : [];
  if (type === 'none') {
    return (
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={LEWIS_COLORS.placeholder}
        strokeWidth={2}
        strokeDasharray="6,4"
      />
    );
  }
  return (
    <>
      {offsets.map((o) => (
        <line
          key={o}
          x1={from.x + px * o}
          y1={from.y + py * o}
          x2={to.x + px * o}
          y2={to.y + py * o}
          stroke={color}
          strokeWidth={type === 'single' ? 3 : 2.5}
          strokeLinecap="round"
        />
      ))}
    </>
  );
}

export function AtomSymbol({
  at,
  symbol,
  color = LEWIS_COLORS.ink,
}: {
  at: Point;
  symbol: string;
  color?: string;
}) {
  return (
    <text
      x={at.x}
      y={at.y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={LEWIS_SIZES.symbolSize}
      fontWeight={600}
      fill={color}
      className="pointer-events-none select-none"
    >
      {symbol}
    </text>
  );
}

export function ElectronDot({ at, color = LEWIS_COLORS.pair }: { at: Point; color?: string }) {
  return (
    <circle
      cx={at.x}
      cy={at.y}
      r={LEWIS_SIZES.dotRadius}
      fill={color}
      className="pointer-events-none"
    />
  );
}

export function FormalChargeBadge({ at, charge }: { at: Point; charge: number }) {
  if (!charge) return null;
  return (
    <g data-formal-charge={charge} className="pointer-events-none">
      <circle
        cx={at.x}
        cy={at.y}
        r={8.5}
        fill="#ffffff"
        stroke={LEWIS_COLORS.ink}
        strokeWidth={1.5}
      />
      <text
        x={at.x}
        y={at.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={Math.abs(charge) === 1 ? 14 : 10}
        fontWeight={700}
        fill={LEWIS_COLORS.ink}
      >
        {chargeText(charge)}
      </text>
    </g>
  );
}

interface LewisStructureProps {
  drawing: LewisDrawing;
  /** Accessible description of the whole structure, in Icelandic. */
  label: string;
  /** Draw the circled formal charges. Off where the charges are what is being asked. */
  showFormalCharges?: boolean;
  /** Largest width in CSS pixels; the drawing scales down to its container. */
  maxWidth?: number;
  className?: string;
}

/** A complete structure as a standalone SVG, cropped to what is drawn. */
export function LewisStructure({
  drawing,
  label,
  showFormalCharges = true,
  maxWidth = 260,
  className = '',
}: LewisStructureProps) {
  const g = lewisGeometry(drawing);
  const pad = 8;
  let { minX, minY, maxX, maxY } = g.box;
  const bracketed = drawing.ionCharge !== undefined && drawing.ionCharge !== 0;
  if (bracketed) {
    minX -= 10;
    maxX += 30;
    minY -= 6;
    maxY += 6;
  }
  const width = maxX - minX + pad * 2;
  const height = maxY - minY + pad * 2;
  const x0 = minX - pad;
  const y0 = minY - pad;

  return (
    <svg
      viewBox={`${x0} ${y0} ${width} ${height}`}
      role="img"
      aria-label={label}
      className={`block h-auto w-full ${className}`}
      style={{ maxWidth }}
      data-lewis-structure=""
    >
      {g.bonds.map((b, i) => (
        <BondLines key={`b${i}`} from={b.from} to={b.to} type={b.type} />
      ))}
      {g.dots.map((d, i) => (
        <ElectronDot key={`d${i}`} at={d} />
      ))}
      <AtomSymbol at={g.central} symbol={drawing.central.symbol} />
      {g.outer.map((p, i) => (
        <AtomSymbol key={`a${i}`} at={p} symbol={drawing.outer[i].symbol} />
      ))}
      {showFormalCharges && (
        <>
          <FormalChargeBadge at={g.chargeAt(-1)} charge={drawing.central.formalCharge ?? 0} />
          {drawing.outer.map((a, i) => (
            <FormalChargeBadge key={`c${i}`} at={g.chargeAt(i)} charge={a.formalCharge ?? 0} />
          ))}
        </>
      )}
      {bracketed && (
        <g stroke={LEWIS_COLORS.ink} strokeWidth={2} fill="none" data-ion-bracket="">
          <path d={`M ${minX + 8} ${minY} h -8 v ${maxY - minY} h 8`} />
          <path d={`M ${maxX - 30} ${minY} h 8 v ${maxY - minY} h -8`} />
          <text
            x={maxX - 18}
            y={minY + 8}
            fontSize={15}
            fontWeight={700}
            fill={LEWIS_COLORS.ink}
            stroke="none"
            dominantBaseline="central"
          >
            {chargeText(drawing.ionCharge ?? 0)}
          </text>
        </g>
      )}
    </svg>
  );
}
