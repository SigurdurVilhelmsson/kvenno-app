import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NaermyndScreen } from '../components/NaermyndScreen';
import { STEPS } from '../data/naermynd-steps';
import { LIQUIDS, WATER_AT_100_KPA } from '../data/vapour-pressure';
import { PER_KPA, vapourCount } from '../engine/naermynd';

describe('Millisameindakraftar Nærmynd data', () => {
  it('carries the book’s vapour pressures at 20 °C', () => {
    // ch10/m68768, the alcohol table; appendix m68863 for water (2333,135 Pa).
    expect(Object.fromEntries(LIQUIDS.map((l) => [l.id, l.kPa]))).toEqual({
      vatn: 2.333135,
      metanol: 11.9,
      etanol: 5.95,
      propanol: 2.67,
      butanol: 0.56,
    });
    expect(WATER_AT_100_KPA).toBeCloseTo(101.3, 1);
  });

  it('draws the vapour on one fixed scale, rounded', () => {
    for (const l of LIQUIDS) expect(vapourCount(l.id)).toBe(Math.round(l.kPa * PER_KPA));
    expect(LIQUIDS.map((l) => vapourCount(l.id))).toEqual([2, 12, 6, 3, 1]);
  });
});

describe('Millisameindakraftar Nærmynd screen', () => {
  const labels = () => screen.getAllByRole('img').map((el) => el.getAttribute('aria-label'));

  it('opens on water and its vapour', () => {
    render(<NaermyndScreen onBack={() => {}} />);
    expect(labels()).toEqual(['vatn við 20 °C: 2 sameindir í gufunni, 2,33 kPa.']);
  });

  it('orders the alcohols by their vapour', () => {
    render(<NaermyndScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '3. Alkóhólaröðin' }));
    expect(labels().map((l) => Number(l?.match(/: (\d+) sameind/)?.[1]))).toEqual([12, 6, 3, 1]);
  });

  it('boils water into bubbles of whole molecules', () => {
    render(<NaermyndScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '4. Vatn sýður' }));
    expect(labels()[0]).toMatch(/heilum H₂O-sameindum/);
  });

  it('lets the student choose a liquid beside water', () => {
    render(<NaermyndScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '5. Berðu saman sjálf/ur' }));
    fireEvent.click(screen.getByRole('button', { name: 'bútanól' }));
    expect(screen.getByRole('button', { name: 'bútanól' }).getAttribute('aria-pressed')).toBe(
      'true'
    );
    expect(labels()[1]).toMatch(/^bútanól við 20 °C: 1 sameind í/);
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
