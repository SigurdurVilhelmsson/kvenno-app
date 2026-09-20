/**
 * Standard enthalpies of formation, for deriving a reaction's ΔH°.
 *
 * **Source: the Icelandic textbook's own appendix** —
 * `efnafraedi-2e/02-mt-output/appendices/m68865`, *Staðalvarmafræðilegir
 * eiginleikar fyrir valin efni*, at 298 K. Only the species the games actually
 * need are transcribed; add a row when a game needs one, and do not add a value
 * the book does not give.
 *
 * **Read this before treating it like `appendix-d.ts`.** That file is Brown's
 * Appendix D, which Siggi ruled authoritative on 2026-09-19 where the two books
 * disagree. This one is the *other* book, for a quantity Brown's Appendix D does
 * not cover at all — so the ruling does not reach it, and nothing here has been
 * checked against Brown. That matters because the two books diverged badly on
 * Ksp (13 of 33 shared compounds by 3× or more), and nobody has measured whether
 * they diverge here.
 *
 * **One divergence is already visible in shipped data.** Deriving ΔH° from these
 * rows reproduces two of the three values `3-ar/equilibrium-shifter` shipped
 * almost exactly — the Haber process at −91,8 against a stored −92, and the
 * contact process at −197,78 against a stored −198 — but gives **+55,3 kJ/mol**
 * for N₂O₄ ⇌ 2NO₂ where the game stored **+58**. The gap is ΔHf°(N₂O₄): 11,1
 * here against roughly 9,2 in the value the stored number came from. The derived
 * figure is the one this platform shows, because it is the one a student can
 * look up in the book they own.
 *
 * **Why derive rather than store a ΔH per reaction.** The same reason
 * `1-ar/reynsluformulur` stores formulas rather than percentages: a stored
 * ΔH can disagree with the equation it belongs to and nothing notices. Derived
 * from the formation enthalpies, it cannot.
 */

/** ΔHf° in kJ/mol at 298 K. The phase is part of the key: it changes the value. */
export const FORMATION_ENTHALPY: Record<string, number> = {
  // Elements in their standard state are zero by definition.
  'C(s)': 0,
  'Cl₂(g)': 0,
  'H₂(g)': 0,
  'I₂(s)': 0,
  'N₂(g)': 0,
  'O₂(g)': 0,

  'CaCO₃(s)': -1220.0,
  'CaO(s)': -634.9,
  'CH₃OH(g)': -201.0,
  'CH₄(g)': -74.6,
  'CO(g)': -110.52,
  'CO₂(g)': -393.51,
  'H₂O(g)': -241.82,
  'H₂O(l)': -285.83,
  'H₂S(g)': -20.6,
  'HI(g)': 26.48,
  'I₂(g)': 62.438,
  'N₂O₄(g)': 11.1,
  'NH₃(g)': -45.9,
  'NO(g)': 90.25,
  'NO₂(g)': 33.2,
  'PCl₃(g)': -287.0,
  'PCl₅(g)': -374.9,
  'SO₂(g)': -296.83,
  'SO₃(g)': -395.72,
};

/** The gas constant in kJ/(mol·K), to match the kJ/mol of the table above. */
export const R_KJ = 0.0083145;

export const CELSIUS_OFFSET = 273.15;

export interface EnthalpyTerm {
  formula: string;
  phase: string;
  coefficient: number;
}

/** True when every species in the reaction has a row. */
export function hasFormationData(species: EnthalpyTerm[]): boolean {
  return species.every((s) => FORMATION_ENTHALPY[`${s.formula}(${s.phase})`] !== undefined);
}

/**
 * ΔH° for a reaction, in kJ/mol, as Σ n·ΔHf°(products) − Σ n·ΔHf°(reactants).
 *
 * Throws rather than guessing when a species is missing, so a reaction added
 * without its data fails loudly instead of quietly reporting the enthalpy of
 * the part of itself the table happens to cover.
 */
export function reactionEnthalpy(reactants: EnthalpyTerm[], products: EnthalpyTerm[]): number {
  const sum = (list: EnthalpyTerm[]) =>
    list.reduce((total, s) => {
      const key = `${s.formula}(${s.phase})`;
      const value = FORMATION_ENTHALPY[key];
      if (value === undefined) {
        throw new RangeError(
          `No standard formation enthalpy for ${key}. Add it from the book's ` +
            `appendix m68865, or leave the reaction without a derived ΔH.`
        );
      }
      return total + s.coefficient * value;
    }, 0);
  return sum(products) - sum(reactants);
}

/**
 * How the equilibrium constant moves with temperature — the van 't Hoff
 * relation, `ln(K₂/K₁) = −ΔH°/R · (1/T₂ − 1/T₁)`.
 *
 * **This is the one stress that changes K itself**, and it is why a Le Chatelier
 * game needs an enthalpy at all. Every other stress moves Q and leaves K alone;
 * heating moves the target.
 *
 * The derivation assumes ΔH° is constant over the interval, which is the
 * standard school treatment and is why the temperature steps the games offer
 * are modest ones rather than hundreds of degrees.
 */
export function shiftConstantWithTemperature(
  k1: number,
  deltaH: number,
  fromC: number,
  toC: number
): number {
  const t1 = fromC + CELSIUS_OFFSET;
  const t2 = toC + CELSIUS_OFFSET;
  if (t1 <= 0 || t2 <= 0) {
    throw new RangeError(`Temperatures must be above absolute zero: ${fromC} °C, ${toC} °C`);
  }
  if (k1 <= 0 || !Number.isFinite(k1)) {
    throw new RangeError(`K must be finite and positive, got ${k1}`);
  }
  return k1 * Math.exp((-deltaH / R_KJ) * (1 / t2 - 1 / t1));
}
