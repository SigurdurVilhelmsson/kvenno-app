import { formatNumber, formatToken, type Quantity, type UnitToken } from '../engine/units';

interface TokenListProps {
  tokens: UnitToken[];
  /** Indices to strike through, i.e. the units this step cancelled. */
  cancelled?: number[];
}

function TokenList({ tokens, cancelled = [] }: TokenListProps) {
  if (tokens.length === 0) return <span>1</span>;
  return (
    <>
      {tokens.map((token, i) => (
        <span key={`${token.unit}-${token.species ?? ''}-${i}`}>
          {i > 0 && <span aria-hidden="true">·</span>}
          <span className={cancelled.includes(i) ? 'unit-cancelled' : undefined}>
            {formatToken(token)}
          </span>
        </span>
      ))}
    </>
  );
}

interface UnitsDisplayProps {
  quantity: Quantity;
  /** Which numerator / denominator tokens this step struck out. */
  marks?: { num: number[]; den: number[] };
  /** Hide the number and show units only — used for target chips. */
  unitsOnly?: boolean;
  /**
   * Print this instead of the formatted value.
   *
   * A measurement's trailing zeros carry its precision — "5,00 g" is not the same
   * claim as "5 g" — and a JS number cannot hold them. Problem data states the
   * measurement as written so the chip agrees with the sentence above it.
   */
  valueLabel?: string;
  className?: string;
}

/**
 * A quantity rendered as a fraction, with cancelled units struck through.
 *
 * The strikethrough is the whole point of the game, so it is drawn with a real
 * line (see `.unit-cancelled` in styles.css) rather than colour alone, and the
 * cancelled text keeps enough contrast to stay readable.
 */
export function UnitsDisplay({
  quantity,
  marks,
  unitsOnly,
  valueLabel,
  className,
}: UnitsDisplayProps) {
  const hasDenominator = quantity.den.length > 0;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ''}`}>
      {!unitsOnly && (
        <span className="font-semibold tabular-nums">
          {valueLabel ?? formatNumber(quantity.value)}
        </span>
      )}
      {hasDenominator ? (
        <span className="inline-flex flex-col items-center leading-tight">
          <span className="px-1">
            <TokenList tokens={quantity.num} cancelled={marks?.num} />
          </span>
          <span className="w-full border-t border-current" aria-hidden="true" />
          <span className="px-1">
            <TokenList tokens={quantity.den} cancelled={marks?.den} />
          </span>
        </span>
      ) : (
        <span>
          <TokenList tokens={quantity.num} cancelled={marks?.num} />
        </span>
      )}
    </span>
  );
}
