import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NaermyndScreen } from '../components/NaermyndScreen';
import { STEPS } from '../data/naermynd-steps';
import {
  CU_START,
  E_CELL,
  PER_MMOL,
  ZINC_ATOMS,
  amountsAt,
  blueness,
  countsAt,
} from '../engine/naermynd';

describe('Oxun og afoxun Nærmynd engine', () => {
  it('draws each amount on the fixed scale, rounded', () => {
    for (let xi = 0; xi <= CU_START; xi += 0.25) {
      const a = amountsAt(xi);
      const c = countsAt(xi);
      expect(c.Cu2).toBe(Math.round(a.Cu2 * PER_MMOL));
      expect(c.Zn2).toBe(Math.round(a.Zn2 * PER_MMOL));
      expect(c.SO4).toBe(Math.round(a.SO4 * PER_MMOL));
      expect(c.Cu).toBe(Math.round(a.Cu * PER_MMOL));
      // Every surface slot holds one atom, zinc or copper.
      expect(c.Zn + c.Cu).toBe(ZINC_ATOMS);
    }
  });

  it('keeps atoms, charge and the meðjón in balance', () => {
    for (let xi = 0; xi <= CU_START; xi += 0.5) {
      const a = amountsAt(xi);
      expect(a.Cu2 + a.Cu).toBeCloseTo(CU_START, 10);
      expect(2 * a.Cu2 + 2 * a.Zn2).toBeCloseTo(2 * a.SO4, 10);
      expect(a.SO4).toBe(CU_START);
      expect(a.electrons).toBeCloseTo(2 * a.Zn2, 10);
    }
  });

  it('fades the blue to nothing and runs by itself', () => {
    expect(blueness(0)).toBe(1);
    expect(blueness(CU_START)).toBe(0);
    expect(E_CELL).toBeCloseTo(1.0988, 4);
  });
});

describe('Oxun og afoxun Nærmynd screen', () => {
  it('opens on the blue solution with nothing reacted', () => {
    render(<NaermyndScreen onBack={() => {}} />);
    expect(screen.getByRole('heading', { name: '1. Sinkplata í koparsúlfatlausn' })).toBeTruthy();
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe(
      'Sinkplata í koparsúlfatlausn: 10 Cu²⁺, 0 Zn²⁺ og 10 SO₄²⁻ í lausn; 14 sinkatóm og 0 koparatóm á yfirborði plötunnar.'
    );
  });

  it('ends colourless at 1,10 V, with the sulfate ions untouched', () => {
    render(<NaermyndScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '4. Hvarfinu lýkur' }));
    expect(screen.getByRole('img').getAttribute('aria-label')).toMatch(
      /0 Cu²⁺, 10 Zn²⁺ og 10 SO₄²⁻ í lausn; 4 sinkatóm og 10 koparatóm/
    );
    expect(screen.getByTestId('solution').getAttribute('data-blueness')).toBe('0,00');
    expect(screen.getAllByText(/1,10 V/).length).toBeGreaterThan(0);
  });

  it('moves the flask with the slider', () => {
    render(<NaermyndScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '5. Kannaðu sjálf/ur' }));
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1.5' } });
    expect(screen.getByRole('img').getAttribute('aria-label')).toMatch(/7 Cu²⁺, 3 Zn²⁺/);
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
