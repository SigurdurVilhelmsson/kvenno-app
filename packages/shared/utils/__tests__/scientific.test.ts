import { describe, it, expect } from 'vitest';

import { formatScientific, gradeScientific, type ScientificEntry } from '../scientific';

/** Split a printed `1,34 × 10⁻⁵` back into the two fields a student fills in. */
function asTyped(printed: string): ScientificEntry {
  const [mantissa, power = '⁰'] = printed.split(' × 10');
  const exponent = power
    .replace('⁻', '-')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (d) => String('⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(d)));
  return { mantissa, exponent };
}

/** Values from 10⁻²⁰ to 10²⁴, dense enough to cross every mantissa. */
const GRID: number[] = [];
for (let e = -20; e <= 24; e += 1) {
  for (const m of [1, 1.004, 1.5, 2.25, 3.9, 4.5, 6.3, 7.77, 9.5, 9.94, 9.96, 9.996, 9.9996]) {
    GRID.push(m * 10 ** e);
  }
}

describe('formatScientific', () => {
  it('prints the Icelandic decimal comma and superscript powers', () => {
    expect(formatScientific(1.8e-10)).toBe('1,8 × 10⁻¹⁰');
    expect(formatScientific(1.342e-5, 3)).toBe('1,34 × 10⁻⁵');
    expect(formatScientific(6.022e23, 4)).toBe('6,022 × 10²³');
    expect(formatScientific(0)).toBe('0');
  });

  it('keeps a trailing zero, because it is a significant figure', () => {
    expect(formatScientific(1e-8)).toBe('1,0 × 10⁻⁸');
    expect(formatScientific(2.5e-7, 3)).toBe('2,50 × 10⁻⁷');
  });

  it('carries a mantissa that rounds up to 10 into the next power', () => {
    // It printed 10,0 × 10⁻⁵ here: not scientific notation, and three figures
    // where two were asked for. 2-ar/kinetics rounded before calling to avoid it.
    expect(formatScientific(9.96e-5, 2)).toBe('1,0 × 10⁻⁴');
    expect(formatScientific(9.996e-3, 3)).toBe('1,00 × 10⁻²');
    expect(formatScientific(9.9996e23, 4)).toBe('1,000 × 10²⁴');
    expect(formatScientific(-9.96e-5, 2)).toBe('-1,0 × 10⁻⁴');
    // A value just under the rounding line stays where it is.
    expect(formatScientific(9.94e-5, 2)).toBe('9,9 × 10⁻⁵');
  });

  it('always prints a mantissa of at least 1 and under 10, to the figures asked for', () => {
    for (const value of GRID) {
      for (const figures of [1, 2, 3, 4]) {
        const printed = formatScientific(value, figures);
        const { mantissa } = asTyped(printed);
        const m = Number(mantissa.replace(',', '.'));
        expect(m >= 1 && m < 10, `${value} at ${figures} figures printed ${printed}`).toBe(true);
        expect(mantissa.replace(',', '').length, printed).toBe(figures);
      }
    }
  });
});

describe('gradeScientific reads only what each field asks for', () => {
  const expected = 8.3e-17;

  it('refuses a mantissa field that holds more than a mantissa', () => {
    // parseFloat read the first of these as 8,3, so beside -17 it graded rett,
    // though the student had written 8,3 × 10⁻¹⁵ — a hundred times the answer.
    for (const mantissa of [
      '8,3 × 10²',
      '8,3×10^2',
      '8,3 x 10',
      '8,3e2',
      '8,3E-17',
      '8,3,1',
      '8.3.1',
      '8,3 g',
      '8,3M',
      '≈8,3',
      '8,3–9,0',
    ]) {
      expect(gradeScientific({ mantissa, exponent: '-17' }, expected).outcome, mantissa).toBe(
        'ogilt'
      );
    }
  });

  it('refuses an exponent that is not a whole number', () => {
    // parseInt read `1,5` as 1 and `10²` as 10, and graded what it had read.
    for (const exponent of ['1,5', '-17,5', '-17.0', '5e1', '10²', '⁻¹⁷', '-17x', '--17', '-+17']) {
      expect(gradeScientific({ mantissa: '8,3', exponent }, expected).outcome, exponent).toBe(
        'ogilt'
      );
    }
  });

  it('refuses empty, zero, negative and nonsense, as before', () => {
    for (const entry of [
      { mantissa: '', exponent: '-17' },
      { mantissa: '8,3', exponent: '' },
      { mantissa: '8,3', exponent: '-' },
      { mantissa: '0', exponent: '-17' },
      { mantissa: '0,0', exponent: '-17' },
      { mantissa: '-8,3', exponent: '-17' },
      { mantissa: 'abc', exponent: '-17' },
    ]) {
      expect(gradeScientific(entry, expected).outcome, JSON.stringify(entry)).toBe('ogilt');
    }
  });

  it('still reads every form the games put in these fields', () => {
    // Decimal comma or point, spaces from a paste, an explicit plus sign, a
    // mantissa not yet normalised, and every minus a field can hold: the
    // hyphen, what the ± buttons in leysnijafnvaegi and jafnvaegisfasti write,
    // U+2212 as the screens print it, and the en dash the textbook uses.
    const forms: [ScientificEntry, number][] = [
      [{ mantissa: '1,34', exponent: '-5' }, 1.342e-5],
      [{ mantissa: '1.34', exponent: '-5' }, 1.342e-5],
      [{ mantissa: ' 1,34 ', exponent: ' -5 ' }, 1.342e-5],
      [{ mantissa: '+1,34', exponent: '-5' }, 1.342e-5],
      [{ mantissa: '13,4', exponent: '-6' }, 1.342e-5],
      [{ mantissa: '0,134', exponent: '-4' }, 1.342e-5],
      [{ mantissa: ',5', exponent: '-3' }, 5e-4],
      [{ mantissa: '5,', exponent: '-4' }, 5e-4],
      [{ mantissa: '1,34', exponent: '\u22125' }, 1.342e-5],
      [{ mantissa: '1,34', exponent: '\u20135' }, 1.342e-5],
      [{ mantissa: '2,8', exponent: '3' }, 2.8e3],
      [{ mantissa: '2,8', exponent: '+3' }, 2.8e3],
      [{ mantissa: '1,35', exponent: '-1' }, 0.135],
      [{ mantissa: '4,5', exponent: '0' }, 4.5],
      [{ mantissa: '4,5', exponent: '-0' }, 4.5],
    ];
    for (const [entry, answer] of forms) {
      expect(gradeScientific(entry, answer).outcome, JSON.stringify(entry)).toBe('rett');
    }
  });

  it('grades back as rett whatever formatScientific prints', () => {
    // The molmassi defect as a property: the printing half and the reading
    // half have to agree, carried mantissas included.
    for (const value of GRID) {
      for (const figures of [3, 4]) {
        const printed = formatScientific(value, figures);
        expect(gradeScientific(asTyped(printed), value).outcome, printed).toBe('rett');
      }
    }
  });
});

describe('what the veldisvisir outcome can and cannot diagnose', () => {
  // A 1:2 salt: Ksp = 4s³, so s = ∛(Ksp / 4).
  const kspValues = GRID.filter((v) => v < 1e-4);

  const entryFor = (value: number) => asTyped(formatScientific(value, 3));

  it('a power of ten and nothing else lands on veldisvisir', () => {
    for (const ksp of kspValues) {
      const s = Math.cbrt(ksp / 4);
      // A mantissa normalised without moving the power: 13,4 × 10⁻⁶ → 1,34 × 10⁻⁶.
      expect(gradeScientific(entryFor(s / 10), s).outcome).toBe('veldisvisir');
      // A dropped minus sign on the power.
      const dropped = entryFor(s);
      dropped.exponent = dropped.exponent.replace('-', '');
      expect(gradeScientific(dropped, s).outcome).toBe('veldisvisir');
      // A unit slip of a thousand.
      expect(gradeScientific(entryFor(s * 1000), s).outcome).toBe('veldisvisir');
    }
  });

  it('forgetting the 4 in 4s³ never does — it changes the digits', () => {
    // scientific.ts once named this as the commonest cause of veldisvisir.
    for (const ksp of kspValues) {
      const s = Math.cbrt(ksp / 4);
      const forgot = Math.cbrt(ksp);
      expect(['tolustafir', 'baedi']).toContain(gradeScientific(entryFor(forgot), s).outcome);
    }
  });

  it('the wrong root does only by coincidence of Ksp', () => {
    // √Ksp against ∛(Ksp / 4) differs by Ksp^(1/6) · ∛4, which depends on Ksp,
    // so the comment may not say "never" of it, only "not as a rule".
    const coincidence = 6.25e-14;
    expect(
      gradeScientific(entryFor(Math.sqrt(coincidence)), Math.cbrt(coincidence / 4)).outcome
    ).toBe('veldisvisir');
    // Ag₂CrO₄, also Ksp = 4s³ and in leysnijafnvaegi's pool, lands on the digits.
    const agCrO4 = 1.2e-12;
    expect(['tolustafir', 'baedi']).toContain(
      gradeScientific(entryFor(Math.sqrt(agCrO4)), Math.cbrt(agCrO4 / 4)).outcome
    );
  });
});
