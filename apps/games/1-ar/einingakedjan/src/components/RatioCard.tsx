import { KIND_LABELS, KIND_STYLES } from '../data/ratios';
import {
  formatNumber,
  type Equivalence,
  type EquivalenceSide,
  type OrientedRatio,
} from '../engine/units';

const sideLabel = (side: EquivalenceSide): string =>
  `${formatNumber(side.value)} ${side.unit}${side.species ? ` ${side.species}` : ''}`;

/**
 * One side of a ratio, as text that wraps only between the number and the unit.
 *
 * On a phone a side can be wider than its card (`6,02 × 10²³ formúlueiningar
 * NaCl`), and a free wrap splits the number from its power of ten or the unit
 * from its substance. Each half is kept whole instead.
 */
function SideText({ side }: { side: EquivalenceSide }) {
  return (
    <>
      <span className="whitespace-nowrap">{formatNumber(side.value)}</span>{' '}
      <span className="whitespace-nowrap">
        {side.unit}
        {side.species ? ` ${side.species}` : ''}
      </span>
    </>
  );
}

interface PoolCardProps {
  equivalence: Equivalence;
  onAdd: () => void;
  disabled?: boolean;
}

/**
 * A card in the pool, shown as an *equivalence* rather than a fraction.
 *
 * 24,31 g Mg = 1 mol Mg is a fact about magnesium; which way up to write it is a
 * decision the student makes when placing it. Keeping the pool un-oriented is
 * what makes "the ratio is upside down" a move inside the game rather than a
 * different card they should have picked.
 */
export function PoolCard({ equivalence, onAdd, disabled }: PoolCardProps) {
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={disabled}
      className={`game-btn w-full rounded-lg border-2 p-3 text-left transition hover:shadow-md disabled:opacity-40 ${KIND_STYLES[equivalence.kind]}`}
      aria-label={`Bæta við hlutfalli: ${sideLabel(equivalence.left)} jafngildir ${sideLabel(equivalence.right)}`}
    >
      <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wide opacity-70 md:text-[11px]">
        {KIND_LABELS[equivalence.kind]}
      </span>
      <span className="block text-sm font-medium">
        <SideText side={equivalence.left} /> <span className="opacity-60">=</span>{' '}
        <SideText side={equivalence.right} />
      </span>
      {equivalence.source && (
        <span className="mt-1 block text-xs opacity-70">{equivalence.source}</span>
      )}
    </button>
  );
}

interface RatioFractionProps {
  ratio: OrientedRatio;
  /** Whether this step cancelled the ratio's numerator / denominator. */
  marks?: { num: boolean; den: boolean };
  className?: string;
}

/** An oriented ratio drawn as a real fraction, with a rule between the halves. */
export function RatioFraction({ ratio, marks, className }: RatioFractionProps) {
  return (
    <span className={`inline-flex flex-col items-center leading-tight ${className ?? ''}`}>
      <span className={`px-2 text-center ${marks?.num ? 'unit-cancelled' : ''}`}>
        <SideText side={ratio.num} />
      </span>
      <span className="w-full border-t-2 border-current" aria-hidden="true" />
      <span className={`px-2 text-center ${marks?.den ? 'unit-cancelled' : ''}`}>
        <SideText side={ratio.den} />
      </span>
    </span>
  );
}

interface ChainCardProps {
  ratio: OrientedRatio;
  position: number;
  onFlip: () => void;
  onRemove: () => void;
  /** Highlight the card the solver stopped on. */
  failed?: boolean;
}

/** A placed card: a fraction the student can turn over or take back out. */
export function ChainCard({ ratio, position, onFlip, onRemove, failed }: ChainCardProps) {
  const { equivalence } = ratio;

  return (
    <div
      className={`rounded-lg border-2 p-2 text-sm ${
        failed ? 'border-red-500 bg-red-50 text-red-900' : KIND_STYLES[equivalence.kind]
      }`}
    >
      <div className="flex items-center justify-center px-1 py-1">
        <RatioFraction ratio={ratio} />
      </div>
      <div className="mt-1 flex gap-1">
        <button
          type="button"
          onClick={onFlip}
          className="game-btn flex-1 rounded border border-current/30 px-2 py-1 text-xs font-medium hover:bg-white/60 pointer-coarse:min-h-11"
          aria-label={`Snúa við hlutfalli númer ${position}`}
        >
          ⇅ Snúa við
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="game-btn rounded border border-current/30 px-2 py-1 text-xs font-medium hover:bg-white/60 pointer-coarse:min-h-11 pointer-coarse:min-w-11"
          aria-label={`Fjarlægja hlutfall númer ${position}`}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
