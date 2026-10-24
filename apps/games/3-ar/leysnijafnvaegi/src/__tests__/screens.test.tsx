import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { AefaScreen } from '../components/AefaScreen';
import { BeitaScreen } from '../components/BeitaScreen';
import { KannaScreen } from '../components/KannaScreen';
import { FRACTIONAL_PROBLEMS, MIXING_PROBLEMS, SOLUBILITY_PROBLEMS } from '../data/problems';
import { SALTS, SALT_NOTES, saltBy } from '../data/salts';
import { gradeScientific, molarSolubility } from '../engine/ksp';

/**
 * Defects in what the screens show and do, found after the phone pass.
 *
 * Queries are scoped to each render's container: the repo runs vitest with
 * retries and no automatic cleanup, so a failed attempt can leave its DOM
 * behind, and a document-wide query would then report something confusing.
 */

clockPastNextGuard();

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

describe('Kanna draws a bar for every solubility it can show', () => {
  it('no salt at any slider step gets an empty bar', () => {
    const { container } = render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    const slider = within(container).getByRole('slider');
    const steps = Number(slider.getAttribute('max')) + 1;
    for (const salt of SALTS) {
      fireEvent.click(within(container).getByRole('button', { name: salt.formula }));
      for (let step = 0; step < steps; step++) {
        fireEvent.change(slider, { target: { value: String(step) } });
        const bars = [...container.querySelectorAll<HTMLElement>('[style*="width"]')];
        expect(bars).toHaveLength(2);
        for (const bar of bars) {
          const width = Number.parseFloat(bar.style.width);
          // An empty bar reads as "does not dissolve at all" — the belief the
          // phase exists to correct. AgI in 0,1 M iodide is 8,3 × 10⁻¹⁶ M.
          expect(width, `${salt.formula} at step ${step}`).toBeGreaterThan(1);
          expect(width, `${salt.formula} at step ${step}`).toBeLessThanOrEqual(100);
        }
      }
    }
  });
});

describe('Kanna says where the two books disagree', () => {
  // The four divergence notes in salts.ts were maintainer prose no screen rendered, though
  // BaSO₄'s says a student checking the Icelandic appendix finds a 14 times different molar
  // solubility, and Æfa asks for exactly that (mobile-pass decision 121, 2026-10-23).
  const LINE = 'Íslenska kennslubókin gefur annað gildi — hér er notað gildi Brown.';

  it('on every salt the books disagree about, BaSO₄ among them, and on no other', () => {
    const { container } = render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    const divergent = SALTS.filter((s) => SALT_NOTES.get(s.formula)?.divergenceNote);
    expect(divergent.map((s) => s.formula)).toContain('BaSO₄');
    for (const salt of SALTS) {
      fireEvent.click(within(container).getByRole('button', { name: salt.formula }));
      const shown = within(container).queryByText(LINE) !== null;
      expect(shown, salt.formula).toBe(divergent.includes(salt));
    }
  });
});

describe('Beita says in words whether the prediction was right', () => {
  it('on a mixing problem, both ways', () => {
    const { container } = render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    const first = MIXING_PROBLEMS[0];
    const guess = first.precipitates ? /Já, Q/ : /Nei, Q/;
    fireEvent.click(within(container).getByRole('button', { name: guess }));
    expect(within(container).getByText('Rétt.')).toBeTruthy();
    fireEvent.click(within(container).getByText('Næsta dæmi'));

    const second = MIXING_PROBLEMS[1];
    const wrongGuess = second.precipitates ? /Nei, Q/ : /Já, Q/;
    fireEvent.click(within(container).getByRole('button', { name: wrongGuess }));
    expect(within(container).getByText('Ekki rétt.')).toBeTruthy();
  });

  it('on a ranking problem', () => {
    const { container } = render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
    for (const p of MIXING_PROBLEMS) {
      fireEvent.click(
        within(container).getByRole('button', { name: p.precipitates ? /Já, Q/ : /Nei, Q/ })
      );
      fireEvent.click(within(container).getByText('Næsta dæmi'));
    }
    for (const o of FRACTIONAL_PROBLEMS[0].order) {
      fireEvent.click(within(container).getByRole('button', { name: o.formula }));
    }
    fireEvent.click(within(container).getByText('Athuga röðina'));
    expect(within(container).getByText('Rétt.')).toBeTruthy();
    expect(within(container).queryByText('Ekki rétt.')).toBeNull();
  });
});

describe('Æfa’s answer fields', () => {
  it('the example in the empty fields is not the answer to any problem', () => {
    const { container } = render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    const mantissa = within(container).getByLabelText('Tala').getAttribute('placeholder')!;
    const exponent = within(container).getByLabelText('Veldisvísir').getAttribute('placeholder')!;
    for (const p of SOLUBILITY_PROBLEMS) {
      // Neither the whole answer nor its digits alone.
      expect(gradeScientific({ mantissa, exponent }, p.answer).outcome, p.id).not.toBe('rett');
      expect(gradeScientific({ mantissa, exponent }, p.answer).outcome, p.id).not.toBe(
        'veldisvisir'
      );
    }
  });

  it('an empty check leaves the fields open and the answer hidden', () => {
    const { container } = render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(within(container).getByText('Athuga'));

    const alert = within(container).getByRole('alert');
    expect(alert.textContent).toMatch(/^Fylltu í báða reitina/);
    // The example the message offers is not an answer either.
    expect(alert.textContent).not.toMatch(/1,34/);
    expect(within(container).queryByText(/Svarið er/)).toBeNull();
    expect(within(container).getByLabelText('Tala').hasAttribute('disabled')).toBe(false);
    expect(within(container).getByLabelText('Veldisvísir').hasAttribute('disabled')).toBe(false);

    // And the student can then do what it asks.
    const first = [...SOLUBILITY_PROBLEMS].find((p) => p.difficulty === 'ledd')!;
    const power = Math.floor(Math.log10(first.answer));
    fireEvent.change(within(container).getByLabelText('Tala'), {
      target: { value: (first.answer / 10 ** power).toFixed(2).replace('.', ',') },
    });
    fireEvent.change(within(container).getByLabelText('Veldisvísir'), {
      target: { value: String(power) },
    });
    fireEvent.click(within(container).getByText('Athuga'));
    expect(within(container).getByText('Rétt.')).toBeTruthy();
    expect(within(container).queryByRole('alert')).toBeNull();
  });

  it('the "Svar" heading names the pair of fields', () => {
    const { container } = render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    const group = within(container).getByRole('group', { name: 'Svar (M)' });
    expect(within(group).getByLabelText('Tala')).toBeTruthy();
    expect(within(group).getByLabelText('Veldisvísir')).toBeTruthy();
    // No <label> left that labels nothing.
    for (const label of container.querySelectorAll('label')) {
      expect(label.control, label.textContent ?? '').not.toBeNull();
    }
  });
});

/** A value as the two fields would hold it, to three significant figures. */
function asEntry(value: number) {
  const power = Math.floor(Math.log10(value));
  return {
    mantissa: (value / 10 ** power).toFixed(2).replace('.', ','),
    exponent: String(power),
  };
}

describe('Æfa’s feedback names only mistakes it can see', () => {
  it('the right-digits-wrong-power message blames nothing that cannot produce it', () => {
    // The two mistakes the message used to name, worked for every problem.
    // Forgetting the stoichiometric factor: s = Ksp^(1/(x+y)) instead of
    // (Ksp / xˣyʸ)^(1/(x+y)), or Ksp = s^(x+y) instead of xˣyʸ·s^(x+y).
    // The square root: s = √Ksp, or Ksp = s², as if every salt were 1:1.
    const mistakes = [
      {
        named: /4s³|stuðl/,
        value: (p: (typeof SOLUBILITY_PROBLEMS)[number]) => {
          const salt = saltBy(p.formula);
          return p.direction === 'kspToS'
            ? salt.ksp ** (1 / (salt.x + salt.y))
            : molarSolubility(salt) ** (salt.x + salt.y);
        },
      },
      {
        named: /rót/,
        value: (p: (typeof SOLUBILITY_PROBLEMS)[number]) => {
          const salt = saltBy(p.formula);
          return p.direction === 'kspToS' ? Math.sqrt(salt.ksp) : molarSolubility(salt) ** 2;
        },
      },
    ];

    // Right digits, power out by one, on the first problem served.
    const { container } = render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    const first = [...SOLUBILITY_PROBLEMS].find((p) => p.difficulty === 'ledd')!;
    const entry = asEntry(first.answer);
    fireEvent.change(within(container).getByLabelText('Tala'), {
      target: { value: entry.mantissa },
    });
    fireEvent.change(within(container).getByLabelText('Veldisvísir'), {
      target: { value: String(Number(entry.exponent) + 1) },
    });
    fireEvent.click(within(container).getByText('Athuga'));
    const message = within(container).getByText(/^Tölustafirnir eru réttir/).textContent!;

    // A cause the message names has to be one that lands on this outcome
    // somewhere in the pool; otherwise the advice is false every time it shows.
    for (const mistake of mistakes) {
      if (!mistake.named.test(message)) continue;
      const lands = SOLUBILITY_PROBLEMS.some(
        (p) => gradeScientific(asEntry(mistake.value(p)), p.answer).outcome === 'veldisvisir'
      );
      expect(lands, `the message names ${mistake.named}, which never grades veldisvisir`).toBe(
        true
      );
    }
  });
});

describe('Æfa’s question reads as a sentence', () => {
  it('writes the salt’s name in lower case mid-sentence', () => {
    const { container } = render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    for (let i = 0; i < SOLUBILITY_PROBLEMS.length; i++) {
      const question = within(container).getByText(
        (_, el) =>
          el?.tagName === 'P' && /^(Hver er mólarleysni|Mólarleysni) /.test(el.textContent ?? '')
      );
      const text = question.textContent!.replace(/\s+/g, ' ');
      const salt = SALTS.find((s) => text.includes(`${s.formula} (`))!;
      expect(salt, text).toBeDefined();
      const lower = salt.name.charAt(0).toLocaleLowerCase('is') + salt.name.slice(1);
      expect(text, salt.formula).toContain(`(${lower})`);

      fireEvent.change(within(container).getByLabelText('Tala'), { target: { value: '9,9' } });
      fireEvent.change(within(container).getByLabelText('Veldisvísir'), {
        target: { value: '-30' },
      });
      fireEvent.click(within(container).getByText('Athuga'));
      fireEvent.click(within(container).getByRole('button', { name: /Næsta dæmi|Ljúka/ }));
    }
  });
});

describe('Æfa names the two slips it can diagnose', () => {
  // Until 2026-10-23 a √Ksp or a ∛Ksp entered for a 1:2 salt graded `tolustafir` or `baedi`,
  // whose messages say only that the numbers do not match. The entry now names the slip, as
  // the misconception (mobile-pass decision 120 (b)).
  const ORDER = { ledd: 0, mid: 1, thung: 2 } as const;
  const run = [...SOLUBILITY_PROBLEMS].sort((a, b) => ORDER[a.difficulty] - ORDER[b.difficulty]);

  function answer(container: HTMLElement, value: number) {
    const entry = asEntry(value);
    fireEvent.change(within(container).getByLabelText('Tala'), {
      target: { value: entry.mantissa },
    });
    fireEvent.change(within(container).getByLabelText('Veldisvísir'), {
      target: { value: entry.exponent },
    });
    fireEvent.click(within(container).getByText('Athuga'));
  }

  it('says which root a wrong answer for a 1:2 or 2:1 salt took, and nothing for a 1:1 salt', () => {
    const { container } = render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    let squareRoots = 0;
    let cubeRoots = 0;
    run.forEach((p, i) => {
      const salt = saltBy(p.formula);
      const twoToOne = p.direction === 'kspToS' && salt.x + salt.y === 3;
      // Alternate the two slips across the 1:2 salts, and give √Ksp everywhere else.
      const cube = twoToOne && i % 2 === 0;
      answer(container, cube ? Math.cbrt(salt.ksp) : Math.sqrt(salt.ksp));
      const slip = within(container).queryByText(/^Algeng villa:/)?.parentElement?.textContent;
      if (!twoToOne) {
        expect(slip, p.id).toBeUndefined();
      } else if (cube) {
        cubeRoots++;
        expect(slip, p.id).toMatch(/fjarkinn í Ksp = 4s³ gleymdist/);
      } else {
        squareRoots++;
        expect(slip, p.id).toMatch(/kvaðratrótin, sem á aðeins við þegar hlutfallið er 1:1/);
      }
      fireEvent.click(within(container).getByRole('button', { name: /Næsta dæmi|Ljúka/ }));
    });
    expect(squareRoots).toBeGreaterThan(0);
    expect(cubeRoots).toBeGreaterThan(0);
  });

  it('blames neither slip for an answer that is simply wrong', () => {
    const { container } = render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    run.forEach((p) => {
      answer(container, p.answer * 1.3);
      expect(within(container).queryByText(/^Algeng villa:/), p.id).toBeNull();
      fireEvent.click(within(container).getByRole('button', { name: /Næsta dæmi|Ljúka/ }));
    });
  });
});
