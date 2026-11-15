import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { APPENDIX_D1_ACIDS } from '@shared/data/appendix-d';

import { Level0Electrolytes } from '../components/Level0Electrolytes';
import { NaermyndElectrolytes } from '../components/NaermyndElectrolytes';
import { STEPS } from '../data/naermynd-steps';
import {
  ACETIC_FRACTION,
  CONCENTRATION_M,
  KA_ACETIC,
  UNITS,
  aceticIonised,
  beakerState,
} from '../utils/naermynd';

describe('Stig 0 Nærmynd engine', () => {
  it("takes acetic acid's Ka from the book's Appendix D", () => {
    expect(KA_ACETIC).toBe(APPENDIX_D1_ACIDS.acetic.ka[0]);
    const x = aceticIonised();
    expect((x * x) / (CONCENTRATION_M - x)).toBeCloseTo(KA_ACETIC, 12);
    expect(ACETIC_FRACTION).toBeGreaterThan(0.013);
    expect(ACETIC_FRACTION).toBeLessThan(0.014);
  });

  it('draws twenty units per beaker, and every count as the rounded amount', () => {
    expect(UNITS).toBe(20);
    const nacl = beakerState('nacl');
    expect([nacl.ionPairs, nacl.molecules, nacl.exaggerated]).toEqual([20, 0, false]);
    expect(nacl.bulb).toBe('bright');
    const glucose = beakerState('c6h12o6');
    expect([glucose.ionPairs, glucose.molecules, glucose.exaggerated]).toEqual([0, 20, false]);
    expect(glucose.bulb).toBe('off');
  });

  it("exaggerates acetic acid's one pair only because the true amount rounds to none", () => {
    const acetic = beakerState('ch3cooh');
    expect(Math.round(acetic.trueIonPairs)).toBe(0);
    expect(acetic.trueIonPairs).toBeCloseTo(UNITS * ACETIC_FRACTION, 12);
    expect([acetic.ionPairs, acetic.molecules, acetic.exaggerated]).toEqual([1, 19, true]);
    expect(acetic.bulb).toBe('dim');
  });
});

describe('Stig 0 Nærmynd screen', () => {
  it('opens from the teaching page and returns to it', () => {
    render(<Level0Electrolytes onComplete={() => {}} onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Nærmynd/ }));
    expect(screen.getByRole('heading', { name: 'Nærmynd: jónir í lausn' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Til baka' }));
    expect(screen.getByRole('button', { name: 'Byrja að flokka' })).toBeTruthy();
  });

  it('shows each beaker with its bulb, and marks the exaggerated pair', () => {
    render(<NaermyndElectrolytes onBack={() => {}} />);
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe(
      'Natríumklóríð: björt pera; 20 katjónir og 20 anjónir, engin heil eining.'
    );
    expect(screen.queryByTestId('exaggeration-note')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '2. Glúkósi' }));
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe(
      'Glúkósi: slökkt pera; 20 heilar sameindir, engar jónir.'
    );

    fireEvent.click(screen.getByRole('button', { name: '3. Ediksýra' }));
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe(
      'Ediksýra: dauf pera; 19 heilar sameindir og eitt jónapar, teiknað ýkt.'
    );
    expect(screen.getByTestId('exaggerated-pair')).toBeTruthy();
    expect(screen.getByTestId('exaggeration-note').textContent).toContain('0,27');
  });

  it('compares the three side by side', () => {
    render(<NaermyndElectrolytes onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '4. Allar þrjár saman' }));
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByTestId('bulb-nacl').getAttribute('data-bulb')).toBe('bright');
    expect(screen.getByTestId('bulb-ch3cooh').getAttribute('data-bulb')).toBe('dim');
    expect(screen.getByTestId('bulb-c6h12o6').getAttribute('data-bulb')).toBe('off');
  });

  it('prints every number with a decimal comma', () => {
    for (let i = 0; i < STEPS.length; i++) {
      const { container, unmount } = render(<NaermyndElectrolytes onBack={() => {}} />);
      fireEvent.click(screen.getByRole('button', { name: `${i + 1}. ${STEPS[i].title}` }));
      expect(container.textContent).not.toMatch(/\d\.\d/);
      unmount();
    }
  });
});
