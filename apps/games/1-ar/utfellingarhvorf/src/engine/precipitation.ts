/**
 * Útfellingarhvörf — from two solutions to a net ionic equation.
 *
 * **Everything here is derived, and that is the point.** The old
 * `jonir-i-lausn` stored a molecular equation, a net ionic equation and a
 * solubility verdict as three independent strings per reaction, so nothing
 * stopped them disagreeing — and `ORPHANED_GAMES_ASSESSMENT.md:326` found that
 * they did: it tested a chromate precipitate against a rule table with no
 * chromate row. Here a reaction is two soluble salts and nothing else. The
 * formulas, the coefficients, the three equations, the spectator ions and the
 * verdict all fall out of the ion charges and the school's solubility table.
 *
 * The sequence the student learns, and the sequence this file computes:
 *
 *  1. **Sameindajafna** — the salts as written, balanced
 *  2. **Heildarjónajafna** — every soluble ionic species split into its ions
 *  3. **Nettójónajafna** — the áhorfendajónir struck out
 *
 * Step 3 is subtraction, not a new fact, which is why nothing is stored: the
 * net ionic equation *is* the complete ionic equation minus what appears
 * unchanged on both sides.
 */

import {
  ANIONS,
  CATIONS,
  ion,
  SOLUBILITY_RULES,
  type Ion,
  type SolubilityRule,
} from '../data/ions';

const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n: number) =>
  String(n)
    .split('')
    .map((d) => SUBSCRIPTS[Number(d)])
    .join('');

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** A neutral ionic compound: one cation, one anion, and the counts that balance them. */
export interface Salt {
  cation: Ion;
  anion: Ion;
  cationCount: number;
  anionCount: number;
  /** `Ca₃(PO₄)₂`. */
  formula: string;
}

/**
 * Build the neutral compound from a cation and an anion.
 *
 * Cross the charges and reduce: Ca²⁺ with PO₄³⁻ gives Ca₃(PO₄)₂, and Mg²⁺ with
 * SO₄²⁻ reduces from Mg₂(SO₄)₂ to MgSO₄. Forgetting to reduce is the classic
 * first-year slip, so it happens here once rather than in every data entry.
 */
export function makeSalt(cationFormula: string, anionFormula: string): Salt {
  const cation = ion(cationFormula);
  const anion = ion(anionFormula);
  if (cation.charge <= 0) throw new RangeError(`${cationFormula} is not a cation`);
  if (anion.charge >= 0) throw new RangeError(`${anionFormula} is not an anion`);

  const negative = Math.abs(anion.charge);
  const divisor = gcd(cation.charge, negative);
  const cationCount = negative / divisor;
  const anionCount = cation.charge / divisor;

  return {
    cation,
    anion,
    cationCount,
    anionCount,
    formula: partsToFormula(cation, cationCount) + partsToFormula(anion, anionCount),
  };
}

/** `Ca` + 3 -> `Ca₃`; `PO₄³⁻` + 2 -> `(PO₄)₂`; anything + 1 -> the bare core. */
function partsToFormula(species: Ion, count: number): string {
  const core = coreOf(species);
  if (count === 1) return core;
  return species.polyatomic ? `(${core})${sub(count)}` : `${core}${sub(count)}`;
}

/** Strip the charge off an ion formula: `SO₄²⁻` -> `SO₄`, `Na⁺` -> `Na`. */
export function coreOf(species: Ion): string {
  return species.formula.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]*[⁺⁻]$/u, '');
}

export interface Verdict {
  soluble: boolean;
  /** The row of the school's table that decided it. */
  rule: SolubilityRule;
  /** True when the rule's own verdict was reversed by an exception. */
  byException: boolean;
}

/**
 * Is this compound soluble in water?
 *
 * The cation row is checked first because it is the one row with no exceptions;
 * every other row lists group 1 and ammonium among *its* exceptions, so this
 * ordering makes them agree rather than compete. After that, the row keyed on
 * the anion decides, flipped when the cation is one of its exceptions.
 *
 * Throws when no row covers the anion. That is deliberate: the old game's
 * Ag₂CrO₄ question was unanswerable precisely because its rule table was silent
 * on chromate, and a silent default would reproduce that bug instead of
 * reporting it.
 */
export function solubility(salt: Salt): Verdict {
  const cationRule = SOLUBILITY_RULES[0];
  if (
    cationRule.ion === salt.cation.formula ||
    cationRule.alsoCovers.includes(salt.cation.formula)
  ) {
    return { soluble: true, rule: cationRule, byException: false };
  }

  const rule = SOLUBILITY_RULES.find(
    (r) => r.ion === salt.anion.formula || r.alsoCovers.includes(salt.anion.formula)
  );
  if (!rule) {
    throw new RangeError(
      `No solubility rule covers ${salt.anion.formula}. Add a row to SOLUBILITY_RULES, or drop ` +
        `the ion — an uncovered anion is how the old game shipped an unanswerable Ag₂CrO₄ question.`
    );
  }

  const byException = rule.exceptions.includes(salt.cation.formula);
  return { soluble: byException ? !rule.soluble : rule.soluble, rule, byException };
}

/** One side of an equation: a species, how many of it, and its state. */
export interface Term {
  /** `AgNO₃`, `Ag⁺`, `Cl⁻`. */
  species: string;
  coefficient: number;
  state: 'aq' | 's';
}

export interface Reaction {
  /** The two solutions poured together. */
  reactants: [Salt, Salt];
  /** The two compounds their ions could form. */
  products: [Salt, Salt];
  /** Those of the products that are insoluble — empty when nothing happens. */
  precipitates: Salt[];
  formsPrecipitate: boolean;
  molecular: { left: Term[]; right: Term[] };
  complete: { left: Term[]; right: Term[] };
  /** Empty when no precipitate forms — there is no net ionic equation then. */
  net: { left: Term[]; right: Term[] };
  /** Ions unchanged on both sides of the complete ionic equation. */
  spectators: Ion[];
  verdicts: { salt: Salt; verdict: Verdict }[];
}

/**
 * Balance the molecular equation for a double displacement.
 *
 * `a·C1A1 + b·C2A2 → c·C1A2 + d·C2A1`, where all four formulas are already
 * fixed by charge balance, so only the coefficients are unknown. Conserving
 * each of the four ions gives four equations:
 *
 * ```
 *   C1:  a·x₁ = c·p₁      A1:  a·y₁ = d·q₂
 *   A2:  b·y₂ = c·q₁      C2:  b·x₂ = d·p₂
 * ```
 *
 * which fix `b`, `c` and `d` as rationals in terms of `a`. Scaling by the
 * common denominator and dividing through by the gcd gives the smallest
 * whole-number set — the same "reduced coefficients" convention B12 added to
 * `1-ar/jafna-jofnur`, where an unreduced equation is balanced and still wrong.
 *
 * The fourth equation is redundant with the other three given charge balance,
 * so it is used as a check rather than as an input: if it fails, the formulas
 * themselves are wrong and the equation should not be shown to anyone.
 */
function balance(
  reactants: [Salt, Salt],
  products: [Salt, Salt]
): [number, number, number, number] {
  const [r1, r2] = reactants;
  const [p1, p2] = products;

  // With a = p₁·q₂·y₂ every division below is exact, which is cheaper than
  // carrying fractions and is then reduced away anyway.
  const a = p1.cationCount * p2.anionCount * r2.anionCount;
  const c = (a * r1.cationCount) / p1.cationCount;
  const d = (a * r1.anionCount) / p2.anionCount;
  const b = (c * p1.anionCount) / r2.anionCount;

  const coefficients = [a, b, c, d];
  if (!coefficients.every((n) => Number.isInteger(n) && n > 0)) {
    throw new RangeError(
      `Cannot balance ${r1.formula} + ${r2.formula} → ${p1.formula} + ${p2.formula}: ` +
        `got non-integer coefficients ${coefficients.join(', ')}`
    );
  }
  if (b * r2.cationCount !== d * p2.cationCount) {
    throw new RangeError(
      `${r1.formula} + ${r2.formula} → ${p1.formula} + ${p2.formula} does not conserve ` +
        `${r2.cation.formula} — one of the four formulas is wrong.`
    );
  }

  const divisor = coefficients.reduce((x, y) => gcd(x, y));
  const reduced = coefficients.map((n) => n / divisor);
  return [reduced[0], reduced[1], reduced[2], reduced[3]];
}

/**
 * Cations before anions, which is how every textbook writes a net ionic
 * equation. Without it the order is an accident of which bottle was named
 * first, so the same reaction reads two ways depending on the question.
 */
function cationsFirst(terms: Term[]): Term[] {
  return [...terms].sort((x, y) => rank(x) - rank(y));
}

function rank(term: Term): number {
  if (term.state === 's') return 2;
  const known = CATIONS_AND_ANIONS.find((i) => i.formula === term.species);
  if (!known) return 1;
  return known.charge > 0 ? 0 : 1;
}

const CATIONS_AND_ANIONS: Ion[] = [...CATIONS, ...ANIONS];

/**
 * Pour two soluble salts together and work out what happens.
 *
 * Both reactants must be soluble — you cannot pour a solid — and the engine
 * says so rather than quietly producing a nonsense scenario. That check is why
 * a question like "mix AgCl solution with…" cannot be written here at all.
 */
export function react(saltA: Salt, saltB: Salt): Reaction {
  for (const s of [saltA, saltB]) {
    const v = solubility(s);
    if (!v.soluble) {
      throw new RangeError(
        `${s.formula} is insoluble, so there is no solution of it to pour. ` +
          `Both reactants in a precipitation scenario have to be soluble.`
      );
    }
  }

  // Swap partners: each cation meets the other solution's anion.
  const products: [Salt, Salt] = [
    makeSalt(saltA.cation.formula, saltB.anion.formula),
    makeSalt(saltB.cation.formula, saltA.anion.formula),
  ];

  const verdicts = products.map((salt) => ({ salt, verdict: solubility(salt) }));
  const precipitates = verdicts.filter((v) => !v.verdict.soluble).map((v) => v.salt);
  const formsPrecipitate = precipitates.length > 0;

  const [a, b, c, d] = balance([saltA, saltB], products);

  const molecular = {
    left: [
      { species: saltA.formula, coefficient: a, state: 'aq' as const },
      { species: saltB.formula, coefficient: b, state: 'aq' as const },
    ],
    right: [
      {
        species: products[0].formula,
        coefficient: c,
        state: verdicts[0].verdict.soluble ? ('aq' as const) : ('s' as const),
      },
      {
        species: products[1].formula,
        coefficient: d,
        state: verdicts[1].verdict.soluble ? ('aq' as const) : ('s' as const),
      },
    ],
  };

  // Every aqueous ionic species splits; a solid does not. That one distinction
  // is the whole of the complete ionic equation.
  const split = (salt: Salt, coefficient: number, soluble: boolean): Term[] =>
    soluble
      ? [
          {
            species: salt.cation.formula,
            coefficient: coefficient * salt.cationCount,
            state: 'aq' as const,
          },
          {
            species: salt.anion.formula,
            coefficient: coefficient * salt.anionCount,
            state: 'aq' as const,
          },
        ]
      : [{ species: salt.formula, coefficient, state: 's' as const }];

  const complete = {
    left: [...split(saltA, a, true), ...split(saltB, b, true)],
    right: [
      ...split(products[0], c, verdicts[0].verdict.soluble),
      ...split(products[1], d, verdicts[1].verdict.soluble),
    ],
  };

  const net = formsPrecipitate ? cancelSpectators(complete) : { left: [], right: [] };

  const spectatorFormulas = spectatorsOf(complete);
  const spectators = spectatorFormulas.map((f) => ion(f));

  return {
    reactants: [saltA, saltB],
    products,
    precipitates,
    formsPrecipitate,
    molecular,
    complete,
    net,
    spectators,
    verdicts,
  };
}

/** Sum the coefficients of each species on one side. */
function totals(terms: Term[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const t of terms) map.set(t.species, (map.get(t.species) ?? 0) + t.coefficient);
  return map;
}

/**
 * The áhorfendajónir: species present in the same amount and the same form on
 * both sides.
 *
 * "Same amount" is the part students skip. An ion that appears twice on the
 * left and once on the right has genuinely taken part and is not a spectator,
 * so equality of coefficients is required, not mere presence.
 */
export function spectatorsOf(complete: { left: Term[]; right: Term[] }): string[] {
  const left = totals(complete.left);
  const right = totals(complete.right);
  return [...left.entries()]
    .filter(([species, n]) => right.get(species) === n)
    .map(([species]) => species);
}

/** Strike the spectators out, then reduce what is left to lowest terms. */
function cancelSpectators(complete: { left: Term[]; right: Term[] }): {
  left: Term[];
  right: Term[];
} {
  const spectators = new Set(spectatorsOf(complete));
  const keep = (terms: Term[]) => terms.filter((t) => !spectators.has(t.species));
  const left = keep(complete.left);
  const right = keep(complete.right);

  const all = [...left, ...right].map((t) => t.coefficient);
  const divisor = all.length > 0 ? all.reduce((x, y) => gcd(x, y)) : 1;
  const reduce = (terms: Term[]) =>
    terms.map((t) => ({ ...t, coefficient: t.coefficient / divisor }));

  return { left: cationsFirst(reduce(left)), right: reduce(right) };
}

/** `2Ag⁺(aq) + CrO₄²⁻(aq) → Ag₂CrO₄(s)` — a side, rendered. */
export function renderSide(terms: Term[]): string {
  if (terms.length === 0) return '';
  return terms
    .map((t) => `${t.coefficient === 1 ? '' : t.coefficient}${t.species}(${t.state})`)
    .join(' + ');
}

/** A whole equation, rendered. */
export function renderEquation(eq: { left: Term[]; right: Term[] }): string {
  return `${renderSide(eq.left)} → ${renderSide(eq.right)}`;
}
