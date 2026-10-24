import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { COMPOUNDS, type Compound } from '../data/compounds';
import { POLYATOMIC_IONS } from '../data/naming';

/**
 * Decision 38 (a). Level 3 printed `compound.info` under the formula before the
 * student built anything, and on a third of the pool it stated the charge or
 * the ion being asked for: `Kóbalt +2` over Co(NO₃)₂, `Ammóníum (NH₄⁺) +
 * Klóríð`, the whole answer, over NH₄Cl. The field is split, as `lausnir` split
 * its own: `observable` before the answer, `why` after. The four ions Levels
 * 1–2 never teach, for which the line was the only route, are now in the rules
 * panel, and Fe₃O₄ keeps `blanda Fe²⁺ og Fe³⁺` before the answer, as ruled.
 */

const pool = vi.hoisted(() => ({ current: [] as Compound[] }));

vi.mock('../utils/nameParts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/nameParts')>();
  return { ...actual, selectCompounds: () => pool.current };
});

const { Level3 } = await import('../components/Level3');

const t = (_key: string, fallback?: string) => fallback ?? '';

const byFormula = (formula: string) => COMPOUNDS.find((c) => c.formula === formula)!;

/** A charge, a Roman numeral, a formula fragment, or a polyatomic ion's name. */
function leaks(text: string): string | null {
  if (/[⁺⁻]|[+-]\s?\d/.test(text)) return 'a charge';
  if (/\([IV]+(,[IV]+)?\)/.test(text)) return 'a Roman numeral';
  if (/[₀-₉]/.test(text)) return 'a formula';
  const ion = POLYATOMIC_IONS.find((i) => text.toLowerCase().includes(i));
  return ion ? `the ion ${ion}` : null;
}

describe('the line under the formula, before the answer', () => {
  it.each(COMPOUNDS.filter((c) => c.formula !== 'Fe₃O₄').map((c) => [c.formula, c] as const))(
    '%s states no charge and names no ion',
    (_formula, compound) => {
      if (compound.observable === undefined) return;
      expect(leaks(compound.observable), compound.observable).toBeNull();
    }
  );

  it('keeps Fe₃O₄’s mixture of charges, the one route to its (II,III)', () => {
    expect(byFormula('Fe₃O₄').observable).toContain('blanda Fe²⁺ og Fe³⁺');
  });

  it('moved what it said on the items that leaked to after the answer', () => {
    expect(byFormula('Co(NO₃)₂').why).toBe('Kóbalt +2');
    expect(byFormula('NH₄Cl').why).toBe('Ammóníum (NH₄⁺) + Klóríð');
    expect(byFormula('Fe(NO₃)₃').why).toBe('Járn +3, þrjú nítrat');
    expect(byFormula('Co(NO₃)₂').observable).toBeUndefined();
    expect(byFormula('NH₄Cl').observable).toBeUndefined();
  });
});

function play(formula: string) {
  pool.current = [byFormula(formula)];
  const { container } = render(<Level3 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
  const view = within(container);
  const before = container.textContent ?? '';
  // Any one part is enough to check; whether it is right does not matter here.
  const tray = view.getByText('Tiltækir partar:').parentElement as HTMLElement;
  fireEvent.click(within(tray).getAllByRole('button')[0]);
  fireEvent.click(view.getByRole('button', { name: 'Athuga' }));
  return { view, before, after: container.textContent ?? '' };
}

describe('Level 3 on screen', () => {
  it('shows the charge behind Járn(III)nítrat only once the name is checked', () => {
    const { before, after } = play('Fe(NO₃)₃');
    expect(before).not.toContain('Járn +3');
    expect(after).toContain('Járn +3, þrjú nítrat');
  });

  it('shows what is observable before, and the reason after', () => {
    const { before, after } = play('NaOH');
    expect(before).toContain('Sterkur basi');
    expect(before).not.toContain('OH⁻');
    expect(after).toContain('Hýdroxíð (OH⁻)');
  });

  it('shows Fe₃O₄’s mixture of charges before the answer', () => {
    expect(play('Fe₃O₄').before).toContain('blanda Fe²⁺ og Fe³⁺');
  });

  it('teaches, in the rules panel, the four ions Levels 1–2 do not', () => {
    pool.current = [byFormula('NH₄Cl')];
    const { container } = render(<Level3 t={t} onComplete={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(within(container).getByRole('button', { name: /Nafnareglur/ }));
    const rules = container.querySelector('ul')!.textContent ?? '';
    for (const ion of ['ammóníum (NH₄⁺)', 'fosfat (PO₄³⁻)', 'vetniskarbónat (HCO₃⁻)']) {
      expect(rules).toContain(ion);
    }
    expect(rules).toContain('díkrómat (Cr₂O₇²⁻)');
  });
});
