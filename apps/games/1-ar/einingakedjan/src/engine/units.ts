/**
 * Unit algebra for Einingakeðjan.
 *
 * The design rule for this game is that correctness is *derived from the units*,
 * never compared against a stored answer key. That buys three things:
 *
 *  - any mathematically valid path is accepted, including reorderings of two
 *    commutative ratios (the older `dimensional-analysis` game compares against a
 *    `correctPath` array and marks those wrong — see CURRICULUM_REVIEW.md B11);
 *  - the diagnosis shown to a student is computed, not authored, so it cannot
 *    drift away from what the chain actually did;
 *  - authoring a problem is just a start quantity, a target unit and a card pool.
 *
 * The load-bearing idea is that a unit carries a *species*: `mol Mg` and `mol O2`
 * are different units and must not cancel. Using the molar mass of the wrong
 * substance is the single most common stoichiometry error, and tagging units is
 * what lets the engine catch it instead of silently accepting it.
 */

/** A single unit symbol, optionally bound to a chemical species. */
export interface UnitToken {
  /** The unit symbol itself: 'g', 'mol', 'mL', 'agnir'. */
  unit: string;
  /**
   * What the unit is *of*: 'Mg', 'NaOH', 'lausn'.
   *
   * `undefined` means "any species" — a metric equivalence such as 1 L = 1000 mL
   * holds no matter what is in the beaker. Untagged tokens are resolved against
   * the running quantity by {@link inferSpecies} before a ratio is applied, so by
   * the time cancellation runs an untagged token means the quantity itself is
   * untagged too.
   */
  species?: string;
}

/** A number with units, expressed as a product over a quotient. */
export interface Quantity {
  value: number;
  num: UnitToken[];
  den: UnitToken[];
}

/** The units alone, with no number — used for stating a target. */
export interface UnitSignature {
  num: UnitToken[];
  den: UnitToken[];
}

/** Where a ratio comes from. Drives the card colour and the "what is this?" copy. */
export type RatioKind = 'metric' | 'molmassi' | 'avogadro' | 'molstyrkur' | 'edlismassi' | 'jafna';

/** One side of an equivalence: a number and the unit it counts. */
export interface EquivalenceSide {
  value: number;
  unit: string;
  species?: string;
}

/**
 * A card in the pool.
 *
 * Deliberately an *equivalence* (24,31 g Mg = 1 mol Mg) rather than an oriented
 * fraction. Orienting it is the student's job, which is what makes "the ratio is
 * upside down" a correctable move inside the game rather than a different card
 * they should have picked instead.
 */
export interface Equivalence {
  id: string;
  left: EquivalenceSide;
  right: EquivalenceSide;
  kind: RatioKind;
  /** Short Icelandic provenance line, e.g. the balanced equation behind a mole ratio. */
  source?: string;
}

export type Orientation = 'forward' | 'flipped';

/** An equivalence with an orientation chosen: a genuine fraction. */
export interface OrientedRatio {
  equivalence: Equivalence;
  orientation: Orientation;
  num: EquivalenceSide;
  den: EquivalenceSide;
}

export const orient = (equivalence: Equivalence, orientation: Orientation): OrientedRatio =>
  orientation === 'forward'
    ? { equivalence, orientation, num: equivalence.left, den: equivalence.right }
    : { equivalence, orientation, num: equivalence.right, den: equivalence.left };

export const flip = (orientation: Orientation): Orientation =>
  orientation === 'forward' ? 'flipped' : 'forward';

export const toToken = (side: EquivalenceSide): UnitToken => ({
  unit: side.unit,
  species: side.species,
});

/**
 * Do two tokens cancel?
 *
 * Same unit, and either the same species or one of them untagged. An untagged
 * token is a wildcard precisely because a metric equivalence is substance-agnostic.
 */
export const tokensMatch = (a: UnitToken, b: UnitToken): boolean =>
  a.unit === b.unit &&
  (a.species === undefined || b.species === undefined || a.species === b.species);

/**
 * Give an untagged equivalence the species of the quantity it is about to be
 * applied to, so that `250 mL lausn * (1 L / 1000 mL)` yields `L lausn` rather
 * than dropping the tag on the floor.
 *
 * Only fires when *both* sides are untagged; half-tagged equivalences are a data
 * error and are rejected by the data-integrity test rather than patched here.
 */
export function inferSpecies(quantity: Quantity, ratio: OrientedRatio): OrientedRatio {
  const { equivalence } = ratio;
  if (equivalence.left.species !== undefined || equivalence.right.species !== undefined) {
    return ratio;
  }

  // Match against *either* side of the ratio, not just the denominator: a metric
  // equivalence applied to a volume of NaOH solution is about that solution
  // whichever way up it is turned, and tagging it either way keeps the units
  // consistent in the wrong-orientation case too — which is exactly the case the
  // student needs to be able to read.
  const relevant = (t: UnitToken): boolean =>
    t.species !== undefined && (t.unit === ratio.den.unit || t.unit === ratio.num.unit);

  const donor = quantity.num.find(relevant) ?? quantity.den.find(relevant);
  if (!donor?.species) return ratio;

  return {
    ...ratio,
    num: { ...ratio.num, species: donor.species },
    den: { ...ratio.den, species: donor.species },
  };
}

/** Which tokens a step struck out, so the UI can draw the cancellation lines. */
export interface CancellationMarks {
  /** Indices into the *incoming* quantity's numerator / denominator. */
  quantity: { num: number[]; den: number[] };
  /** Whether the ratio's own numerator / denominator token was consumed. */
  ratio: { num: boolean; den: boolean };
}

export interface StepResult {
  before: Quantity;
  ratio: OrientedRatio;
  after: Quantity;
  /** Number of unit pairs that cancelled. Zero is what makes a step wrong. */
  cancelCount: number;
  marks: CancellationMarks;
}

/**
 * Multiply a quantity by an oriented ratio and cancel whatever cancels.
 *
 * Cancellation is greedy and left-to-right. Because a single ratio contributes at
 * most one token to each side, greedy matching cannot strand a pair that some
 * other pairing would have cancelled for the quantities this game produces.
 */
export function applyRatio(quantity: Quantity, rawRatio: OrientedRatio): StepResult {
  const ratio = inferSpecies(quantity, rawRatio);

  const numTokens = [...quantity.num, toToken(ratio.num)];
  const denTokens = [...quantity.den, toToken(ratio.den)];
  const ratioNumIndex = quantity.num.length;
  const ratioDenIndex = quantity.den.length;

  const cancelledNum = new Set<number>();
  const cancelledDen = new Set<number>();

  for (let i = 0; i < numTokens.length; i++) {
    for (let j = 0; j < denTokens.length; j++) {
      if (cancelledDen.has(j)) continue;
      if (!tokensMatch(numTokens[i], denTokens[j])) continue;
      cancelledNum.add(i);
      cancelledDen.add(j);
      break;
    }
  }

  const after: Quantity = {
    value: (quantity.value * ratio.num.value) / ratio.den.value,
    num: numTokens.filter((_, i) => !cancelledNum.has(i)),
    den: denTokens.filter((_, j) => !cancelledDen.has(j)),
  };

  return {
    before: quantity,
    ratio,
    after,
    cancelCount: cancelledNum.size,
    marks: {
      quantity: {
        num: [...cancelledNum].filter((i) => i !== ratioNumIndex),
        den: [...cancelledDen].filter((j) => j !== ratioDenIndex),
      },
      ratio: {
        num: cancelledNum.has(ratioNumIndex),
        den: cancelledDen.has(ratioDenIndex),
      },
    },
  };
}

const tokenKey = (t: UnitToken): string => `${t.unit} ${t.species ?? ''}`;

const sameMultiset = (a: UnitToken[], b: UnitToken[]): boolean => {
  if (a.length !== b.length) return false;
  const counts = new Map<string, number>();
  for (const t of a) counts.set(tokenKey(t), (counts.get(tokenKey(t)) ?? 0) + 1);
  for (const t of b) {
    const k = tokenKey(t);
    const n = counts.get(k);
    if (!n) return false;
    counts.set(k, n - 1);
  }
  return true;
};

/** Exact unit match, species included — `g MgO` does not satisfy a target of `g Mg`. */
export const signatureMatches = (quantity: Quantity, target: UnitSignature): boolean =>
  sameMultiset(quantity.num, target.num) && sameMultiset(quantity.den, target.den);

/* ---------------------------------------------------------------- formatting */

const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻',
};

const superscript = (n: number): string =>
  String(n)
    .split('')
    .map((c) => SUPERSCRIPTS[c] ?? c)
    .join('');

/**
 * Round to `sig` significant digits and render with an Icelandic decimal comma.
 *
 * Callers keep |x| inside [1e-3, 1e5), where `Number#toString` never reaches for
 * exponential notation, so this stays a plain decimal.
 */
const decimal = (x: number, sig: number): string =>
  Number(x.toPrecision(sig)).toString().replace('.', ',');

/**
 * Icelandic number formatting: comma as the decimal separator, and scientific
 * notation once a value leaves the range a student would read comfortably.
 *
 * Note that this game never *parses* a typed number — the student builds a path
 * and the engine computes the value — so the comma here cannot collide with
 * `parseFloat` the way it does in the older game (CURRICULUM_REVIEW.md B9).
 */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';

  const abs = Math.abs(value);
  if (abs >= 1e5 || abs < 1e-3) {
    let exponent = Math.floor(Math.log10(abs));
    let mantissa = value / 10 ** exponent;
    // Rounding the mantissa can push it to 10; renormalise so we never print "10 x 10^3".
    if (Math.abs(Number(mantissa.toPrecision(3))) >= 10) {
      mantissa /= 10;
      exponent += 1;
    }
    return `${decimal(mantissa, 3)} × 10${superscript(exponent)}`;
  }

  return decimal(value, 4);
}

export const formatToken = (token: UnitToken): string =>
  token.species ? `${token.unit} ${token.species}` : token.unit;

export function formatSignature(signature: UnitSignature): string {
  const num = signature.num.length ? signature.num.map(formatToken).join('·') : '1';
  if (!signature.den.length) return num;
  return `${num} / ${signature.den.map(formatToken).join('·')}`;
}

export const formatQuantity = (q: Quantity): string =>
  `${formatNumber(q.value)} ${formatSignature(q)}`;

/** Convenience for building a start quantity in problem data. */
export const quantity = (value: number, unit: string, species?: string): Quantity => ({
  value,
  num: [{ unit, species }],
  den: [],
});

/** Convenience for stating a target in problem data. */
export const signature = (unit: string, species?: string): UnitSignature => ({
  num: [{ unit, species }],
  den: [],
});
