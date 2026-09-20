import { describe, it, expect } from 'vitest';

import { ANIONS, CATIONS, SOLUBILITY_RULES, ion } from '../data/ions';
import {
  coreOf,
  makeSalt,
  react,
  renderEquation,
  solubility,
  spectatorsOf,
  type Term,
} from '../engine/precipitation';

/**
 * The engine, checked against chemistry rather than against itself.
 *
 * The properties below are the ones the old `jonir-i-lausn` violated. Each is
 * asserted as a property over the whole ion pool, not as a fixed expectation
 * for the compounds that happen to ship, so adding an ion cannot quietly
 * reintroduce the defect.
 */

/** Count the atoms of each element on one side, honouring coefficients. */
function atomCount(terms: Term[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const term of terms) {
    for (const [element, n] of parseFormula(term.species)) {
      counts.set(element, (counts.get(element) ?? 0) + n * term.coefficient);
    }
  }
  return counts;
}

/**
 * A deliberately independent formula parser.
 *
 * The engine builds formulas by concatenation; this takes them apart again by
 * reading the string. If both agreed by sharing code the test would prove
 * nothing.
 */
function parseFormula(formula: string): Map<string, number> {
  const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉';
  const digit = (c: string) => SUBSCRIPTS.indexOf(c);
  const out = new Map<string, number>();
  const bare = formula.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]*[⁺⁻]$/u, '');

  const walk = (text: string, multiplier: number) => {
    let i = 0;
    while (i < text.length) {
      if (text[i] === '(') {
        let depth = 1;
        let j = i + 1;
        while (j < text.length && depth > 0) {
          if (text[j] === '(') depth++;
          if (text[j] === ')') depth--;
          j++;
        }
        const inner = text.slice(i + 1, j - 1);
        let n = 0;
        while (j < text.length && digit(text[j]) >= 0) n = n * 10 + digit(text[j++]);
        walk(inner, multiplier * (n || 1));
        i = j;
        continue;
      }
      const m = /^([A-Z][a-z]?)/.exec(text.slice(i));
      if (!m) throw new Error(`Cannot parse ${formula} at ${i} (${text.slice(i)})`);
      i += m[1].length;
      let n = 0;
      while (i < text.length && digit(text[i]) >= 0) n = n * 10 + digit(text[i++]);
      out.set(m[1], (out.get(m[1]) ?? 0) + multiplier * (n || 1));
    }
  };

  walk(bare, 1);
  return out;
}

function chargeOf(terms: Term[]): number {
  return terms.reduce((sum, t) => {
    const known = [...CATIONS, ...ANIONS].find((i) => i.formula === t.species);
    return sum + (known ? known.charge * t.coefficient : 0);
  }, 0);
}

/** Every soluble pairing in the pool — the full space the game can reach. */
const ALL_PAIRS = CATIONS.flatMap((c) => ANIONS.map((a) => makeSalt(c.formula, a.formula)));
const SOLUBLE_PAIRS = ALL_PAIRS.filter((s) => solubility(s).soluble);

describe('formulas are built from charge, not typed', () => {
  it.each([
    ['Na⁺', 'Cl⁻', 'NaCl'],
    ['Ca²⁺', 'PO₄³⁻', 'Ca₃(PO₄)₂'],
    ['Mg²⁺', 'SO₄²⁻', 'MgSO₄'],
    ['Pb²⁺', 'NO₃⁻', 'Pb(NO₃)₂'],
    ['Ag⁺', 'CrO₄²⁻', 'Ag₂CrO₄'],
    ['Fe³⁺', 'OH⁻', 'Fe(OH)₃'],
    ['NH₄⁺', 'S²⁻', '(NH₄)₂S'],
    ['Fe³⁺', 'SO₄²⁻', 'Fe₂(SO₄)₃'],
  ])('%s + %s = %s', (cation, anion, formula) => {
    expect(makeSalt(cation, anion).formula).toBe(formula);
  });

  it('every compound in the pool is electrically neutral', () => {
    for (const salt of ALL_PAIRS) {
      const positive = salt.cation.charge * salt.cationCount;
      const negative = Math.abs(salt.anion.charge) * salt.anionCount;
      expect(positive, salt.formula).toBe(negative);
    }
  });

  it('every compound is in lowest terms', () => {
    // Mg₂(SO₄)₂ is neutral and wrong. The reduction is the same convention B12
    // added to jafna-jofnur: balanced is not enough, it has to be reduced.
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    for (const salt of ALL_PAIRS) {
      expect(gcd(salt.cationCount, salt.anionCount), salt.formula).toBe(1);
    }
  });

  it('parses back to the counts it was built from', () => {
    for (const salt of ALL_PAIRS) {
      const parsed = parseFormula(salt.formula);
      const cationAtoms = parseFormula(coreOf(salt.cation));
      for (const [element, n] of cationAtoms) {
        expect(parsed.get(element) ?? 0, `${salt.formula} ${element}`).toBeGreaterThanOrEqual(
          n * salt.cationCount
        );
      }
    }
  });
});

describe('solubility comes from the school table', () => {
  it('every anion in the pool is covered by a rule', () => {
    // This is the Ag₂CrO₄ defect as a property. The old game asked about a
    // chromate precipitate with no chromate row in its table, so the question
    // could not be reasoned to. An uncovered anion now fails here instead.
    for (const anion of ANIONS) {
      const covered = SOLUBILITY_RULES.some(
        (r) => r.ion === anion.formula || r.alsoCovers.includes(anion.formula)
      );
      expect(covered, `no solubility rule covers ${anion.formula}`).toBe(true);
    }
  });

  it('throws rather than guessing for an ion it does not know', () => {
    expect(() => ion('Xx⁺')).toThrow(/No ion declared/);
  });

  it.each([
    ['Ag⁺', 'Cl⁻', false],
    ['Ag⁺', 'NO₃⁻', true],
    ['Ag⁺', 'CrO₄²⁻', false],
    ['Na⁺', 'CO₃²⁻', true],
    ['Ca²⁺', 'CO₃²⁻', false],
    ['Ba²⁺', 'OH⁻', true],
    ['Ca²⁺', 'OH⁻', false],
    ['Ca²⁺', 'SO₄²⁻', false],
    ['Mg²⁺', 'SO₄²⁻', true],
    ['Mg²⁺', 'F⁻', false],
    ['Na⁺', 'F⁻', true],
    ['NH₄⁺', 'PO₄³⁻', true],
  ])('%s%s soluble = %s', (cation, anion, expected) => {
    expect(solubility(makeSalt(cation, anion)).soluble).toBe(expected);
  });

  it('a group-1 or ammonium salt is always soluble, with no exceptions', () => {
    // The book's only "engar undantekningar" cation row. If any anion rule
    // could override it the table would contradict itself.
    for (const cation of ['Li⁺', 'Na⁺', 'K⁺', 'NH₄⁺']) {
      for (const anion of ANIONS) {
        expect(
          solubility(makeSalt(cation, anion.formula)).soluble,
          `${cation}${anion.formula}`
        ).toBe(true);
      }
    }
  });

  it('the rule it cites is the rule that decided it', () => {
    // A verdict printed beside the wrong rule teaches the wrong rule.
    for (const salt of ALL_PAIRS) {
      const { rule, byException, soluble } = solubility(salt);
      const mentionsCation =
        rule.ion === salt.cation.formula || rule.alsoCovers.includes(salt.cation.formula);
      const mentionsAnion =
        rule.ion === salt.anion.formula || rule.alsoCovers.includes(salt.anion.formula);
      expect(mentionsCation || mentionsAnion, `${salt.formula} cites an unrelated rule`).toBe(true);
      expect(soluble, salt.formula).toBe(byException ? !rule.soluble : rule.soluble);
    }
  });

  it('every exception listed is an ion that exists, or is documented as absent', () => {
    // Hg₂²⁺ appears in the book's exception text but not in the pool, so it is
    // deliberately absent from the machine-readable list. Anything else in the
    // list has to be a real ion, or the rule silently never fires.
    const known = new Set([...CATIONS, ...ANIONS].map((i) => i.formula));
    for (const rule of SOLUBILITY_RULES) {
      for (const e of rule.exceptions) {
        expect(known.has(e), `${rule.id} excepts ${e}, which is not a declared ion`).toBe(true);
      }
    }
  });
});

describe('the three equations are one computation', () => {
  it('refuses a scenario whose reactants are not both soluble', () => {
    expect(() => react(makeSalt('Ag⁺', 'Cl⁻'), makeSalt('Na⁺', 'NO₃⁻'))).toThrow(/insoluble/);
  });

  const reactions = SOLUBLE_PAIRS.flatMap((a) =>
    SOLUBLE_PAIRS.filter(
      (b) => a.cation.formula !== b.cation.formula && a.anion.formula !== b.anion.formula
    ).map((b) => ({ a, b, reaction: react(a, b) }))
  );

  it('exercises a large space, not a handful of cases', () => {
    expect(reactions.length).toBeGreaterThan(200);
  });

  it('every molecular equation balances by atom count', () => {
    for (const { reaction, a, b } of reactions) {
      const left = atomCount(reaction.molecular.left);
      const right = atomCount(reaction.molecular.right);
      const label = `${a.formula} + ${b.formula}`;
      expect(new Set([...left.keys(), ...right.keys()]).size, label).toBe(left.size);
      for (const [element, n] of left) expect(right.get(element), `${label} ${element}`).toBe(n);
    }
  });

  it('every complete ionic equation balances in atoms and in charge', () => {
    for (const { reaction, a, b } of reactions) {
      const label = `${a.formula} + ${b.formula}`;
      const left = atomCount(reaction.complete.left);
      const right = atomCount(reaction.complete.right);
      for (const [element, n] of left) expect(right.get(element), `${label} ${element}`).toBe(n);
      expect(chargeOf(reaction.complete.left), `${label} charge`).toBe(
        chargeOf(reaction.complete.right)
      );
    }
  });

  it('every net ionic equation balances in atoms and in charge', () => {
    // Charge balance is the one students skip, and the one that catches a net
    // ionic equation with a spectator left in it.
    for (const { reaction, a, b } of reactions) {
      if (!reaction.formsPrecipitate) continue;
      const label = `${a.formula} + ${b.formula}`;
      const left = atomCount(reaction.net.left);
      const right = atomCount(reaction.net.right);
      for (const [element, n] of left) expect(right.get(element), `${label} ${element}`).toBe(n);
      expect(chargeOf(reaction.net.left), `${label} charge`).toBe(chargeOf(reaction.net.right));
    }
  });

  it('the net ionic equation never contains a spectator', () => {
    for (const { reaction, a, b } of reactions) {
      if (!reaction.formsPrecipitate) continue;
      const spectators = new Set(reaction.spectators.map((s) => s.formula));
      for (const term of [...reaction.net.left, ...reaction.net.right]) {
        expect(spectators.has(term.species), `${a.formula}+${b.formula} kept ${term.species}`).toBe(
          false
        );
      }
    }
  });

  it('the net ionic equation is never empty when a precipitate forms', () => {
    for (const { reaction } of reactions) {
      if (!reaction.formsPrecipitate) continue;
      expect(reaction.net.left.length).toBeGreaterThan(0);
      expect(reaction.net.right.length).toBeGreaterThan(0);
    }
  });

  it('there is no net ionic equation when nothing precipitates', () => {
    // Every ion is a spectator, so the equation cancels to nothing. Printing a
    // blank one is honest; printing the molecular one relabelled is not.
    for (const { reaction } of reactions) {
      if (reaction.formsPrecipitate) continue;
      expect(reaction.net.left).toHaveLength(0);
      expect(reaction.net.right).toHaveLength(0);
    }
  });

  it('a spectator really is unchanged on both sides', () => {
    for (const { reaction, a, b } of reactions) {
      for (const spectator of reaction.spectators) {
        const on = (terms: Term[]) =>
          terms
            .filter((t) => t.species === spectator.formula)
            .reduce((s, t) => s + t.coefficient, 0);
        expect(on(reaction.complete.left), `${a.formula}+${b.formula} ${spectator.formula}`).toBe(
          on(reaction.complete.right)
        );
        expect(on(reaction.complete.left)).toBeGreaterThan(0);
      }
    }
  });

  it('the molecular equation uses the smallest whole-number coefficients', () => {
    const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
    for (const { reaction, a, b } of reactions) {
      const all = [...reaction.molecular.left, ...reaction.molecular.right].map(
        (t) => t.coefficient
      );
      expect(
        all.reduce((x, y) => gcd(x, y)),
        `${a.formula} + ${b.formula} is not reduced`
      ).toBe(1);
    }
  });

  it('a solid is never split into ions, and an aqueous salt always is', () => {
    for (const { reaction } of reactions) {
      for (const term of [...reaction.complete.left, ...reaction.complete.right]) {
        if (term.state === 's') {
          expect(reaction.precipitates.map((p) => p.formula)).toContain(term.species);
        } else {
          const isIon = [...CATIONS, ...ANIONS].some((i) => i.formula === term.species);
          expect(isIon, `${term.species} is aqueous but was not split`).toBe(true);
        }
      }
    }
  });
});

describe('the worked examples the textbook prints', () => {
  // The book's own §4.2 examples, so the game agrees with what the student
  // reads. These are the only fixed expectations in the file.
  it.each([
    ['Ag⁺', 'NO₃⁻', 'Na⁺', 'Cl⁻', 'Ag⁺(aq) + Cl⁻(aq) → AgCl(s)'],
    ['Pb²⁺', 'NO₃⁻', 'K⁺', 'I⁻', 'Pb²⁺(aq) + 2I⁻(aq) → PbI₂(s)'],
    ['K⁺', 'SO₄²⁻', 'Ba²⁺', 'NO₃⁻', 'Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s)'],
  ])('%s%s + %s%s gives %s', (c1, a1, c2, a2, expected) => {
    const r = react(makeSalt(c1, a1), makeSalt(c2, a2));
    expect(renderEquation(r.net)).toBe(expected);
  });

  it('reproduces the molecular equations the old game stored', () => {
    // The old data was checked by hand and found to balance
    // (ORPHANED_GAMES_ASSESSMENT.md:324). Deriving them independently and
    // getting the same strings is what lets the old file be discarded rather
    // than trusted.
    const cases: [string, string, string, string, string][] = [
      ['Ag⁺', 'NO₃⁻', 'Na⁺', 'Cl⁻', 'AgNO₃(aq) + NaCl(aq) → AgCl(s) + NaNO₃(aq)'],
      ['Pb²⁺', 'NO₃⁻', 'K⁺', 'I⁻', 'Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s) + 2KNO₃(aq)'],
      ['Ba²⁺', 'Cl⁻', 'Na⁺', 'SO₄²⁻', 'BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄(s) + 2NaCl(aq)'],
      ['Fe³⁺', 'Cl⁻', 'Na⁺', 'OH⁻', 'FeCl₃(aq) + 3NaOH(aq) → Fe(OH)₃(s) + 3NaCl(aq)'],
      ['Ag⁺', 'NO₃⁻', 'K⁺', 'CrO₄²⁻', '2AgNO₃(aq) + K₂CrO₄(aq) → Ag₂CrO₄(s) + 2KNO₃(aq)'],
    ];
    for (const [c1, a1, c2, a2, expected] of cases) {
      expect(renderEquation(react(makeSalt(c1, a1), makeSalt(c2, a2)).molecular)).toBe(expected);
    }
  });
});

describe('spectatorsOf requires equal amounts, not mere presence', () => {
  it('an ion that appears in different amounts is not a spectator', () => {
    const complete = {
      left: [
        { species: 'Na⁺', coefficient: 2, state: 'aq' as const },
        { species: 'Cl⁻', coefficient: 2, state: 'aq' as const },
      ],
      right: [
        { species: 'Na⁺', coefficient: 1, state: 'aq' as const },
        { species: 'Cl⁻', coefficient: 2, state: 'aq' as const },
      ],
    };
    expect(spectatorsOf(complete)).toEqual(['Cl⁻']);
  });
});
