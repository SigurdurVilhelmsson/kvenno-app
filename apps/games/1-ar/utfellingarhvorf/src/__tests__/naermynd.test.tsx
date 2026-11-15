import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { molarMassOf } from '@shared/utils';

import { NaermyndScreen } from '../components/NaermyndScreen';
import { STEPS } from '../data/naermynd-steps';
import {
  IODIDE_EQUIVALENCE,
  IODIDE_MAX,
  IODIDE_PER_PRECIPITATE,
  LEAD_START,
  NITRATE_START,
  PER_MMOL,
  REACTION,
  SPECTATORS,
  amountsAt,
  countsAt,
  precipitateMass,
} from '../engine/naermynd';
import { renderEquation } from '../engine/precipitation';

describe('Útfellingarhvörf Nærmynd engine', () => {
  it("is the game's own pbno3-ki reaction, with its net ionic equation and meðjónir", () => {
    expect(renderEquation(REACTION.net)).toBe('Pb²⁺(aq) + 2I⁻(aq) → PbI₂(s)');
    expect([...SPECTATORS].sort()).toEqual(['K⁺', 'NO₃⁻'].sort());
    expect(IODIDE_PER_PRECIPITATE).toBe(2);
    expect(LEAD_START).toBeCloseTo(2.5, 10);
    expect(NITRATE_START).toBeCloseTo(5, 10);
    expect(IODIDE_EQUIVALENCE).toBeCloseTo(5, 10);
  });

  it('draws each amount on the fixed scale, rounded', () => {
    for (let n = 0; n <= IODIDE_MAX; n += 0.25) {
      const a = amountsAt(n);
      const c = countsAt(n);
      expect(c.Pb2).toBe(Math.round(a.Pb2 * PER_MMOL));
      expect(c.I).toBe(Math.round(a.I * PER_MMOL));
      expect(c.K).toBe(Math.round(a.K * PER_MMOL));
      expect(c.NO3).toBe(Math.round(a.NO3 * PER_MMOL));
      expect(c.PbI2).toBe(Math.round(a.PbI2 * PER_MMOL));
    }
  });

  it('conserves lead, iodide and charge, and never touches the meðjónir', () => {
    for (let n = 0; n <= IODIDE_MAX; n += 0.5) {
      const a = amountsAt(n);
      expect(a.Pb2 + a.PbI2).toBeCloseTo(LEAD_START, 10);
      expect(a.I + 2 * a.PbI2).toBeCloseTo(n, 10);
      expect(a.NO3).toBeCloseTo(NITRATE_START, 10);
      expect(a.K).toBeCloseTo(n, 10);
      // The solution stays neutral.
      expect(2 * a.Pb2 + a.K).toBeCloseTo(a.NO3 + a.I, 10);
    }
  });

  it('lets I⁻ stay in solution only once the lead is gone', () => {
    expect(amountsAt(IODIDE_EQUIVALENCE - 1).I).toBe(0);
    expect(amountsAt(IODIDE_EQUIVALENCE).Pb2).toBeCloseTo(0, 10);
    expect(amountsAt(IODIDE_MAX).I).toBeCloseTo(1, 10);
    expect(amountsAt(IODIDE_MAX).PbI2).toBeCloseTo(LEAD_START, 10);
  });

  it('weighs the precipitate with the platform molar mass', () => {
    expect(precipitateMass(IODIDE_EQUIVALENCE)).toBeCloseTo(
      (LEAD_START / 1000) * molarMassOf('PbI₂'),
      10
    );
    expect(precipitateMass(IODIDE_EQUIVALENCE)).toBeCloseTo(1.15, 2);
  });
});

describe('Útfellingarhvörf Nærmynd screen', () => {
  it('opens on the clear lead nitrate solution', () => {
    render(<NaermyndScreen onBack={() => {}} />);
    expect(screen.getByRole('heading', { name: '1. Tvær tærar lausnir' })).toBeTruthy();
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe(
      'Tvær tærar lausnir: 5 Pb²⁺, 0 I⁻, 0 K⁺ og 10 NO₃⁻ í lausn; 0 einingar af PbI₂ í botnfallinu.'
    );
  });

  it('strikes the meðjónir through in the complete ionic equation', () => {
    const { container } = render(<NaermyndScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '3. Meðjónirnar' }));
    const struck = [...container.querySelectorAll('s')].map((s) => s.textContent);
    expect(struck).toEqual(['2NO₃⁻(aq)', '2K⁺(aq)', '2K⁺(aq)', '2NO₃⁻(aq)']);
    expect(container.textContent).toContain('Pb²⁺(aq) + 2I⁻(aq) → PbI₂(s)');
  });

  it('ends with no lead in solution and 1,15 g of precipitate', () => {
    const { container } = render(<NaermyndScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '4. Allt blýið fallið út' }));
    expect(screen.getByRole('img').getAttribute('aria-label')).toMatch(
      /0 Pb²⁺, 0 I⁻, 10 K⁺ og 10 NO₃⁻ í lausn; 5 einingar af PbI₂/
    );
    expect(container.textContent).toContain('1,15 g');
    expect(container.textContent).toContain('KNO₃-lausn');
  });

  it('moves the beaker with the slider, past the point where the lead runs out', () => {
    render(<NaermyndScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '5. Kannaðu sjálf/ur' }));
    fireEvent.change(screen.getByRole('slider'), { target: { value: '6' } });
    expect(screen.getByRole('img').getAttribute('aria-label')).toMatch(/0 Pb²⁺, 2 I⁻, 12 K⁺/);
  });

  it('prints every number with a decimal comma', () => {
    for (let i = 0; i < STEPS.length; i++) {
      const { container, unmount } = render(<NaermyndScreen onBack={() => {}} />);
      fireEvent.click(screen.getByRole('button', { name: `${i + 1}. ${STEPS[i].title}` }));
      expect(container.textContent).not.toMatch(/\d\.\d/);
      unmount();
    }
  });
});
