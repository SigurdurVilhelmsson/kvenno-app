import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NaermyndScreen } from '../components/NaermyndScreen';
import { STEPS } from '../data/naermynd-steps';

describe('Leysnijafnvægi Nærmynd', () => {
  it('opens on the saturated solution and says the ions are exaggerated', () => {
    render(<NaermyndScreen onBack={() => {}} />);
    expect(screen.getByRole('heading', { name: '1. Mettuð lausn' })).toBeTruthy();
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe(
      'Mettuð lausn: 3 Ag⁺, 3 Cl⁻; botnfall, hvítt silfurklóríð.'
    );
    expect(screen.getByText(/Jónirnar eru ýktar/)).toBeTruthy();
  });

  it('tips the Q meter when the solutions are dilute enough', () => {
    render(<NaermyndScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '3. Tvær lausnir blandaðar' }));
    expect(screen.getByText(/Q > Ksp, silfurklóríð fellur út/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /× 10⁻⁵ M/ }));
    expect(screen.getByText(/Q < Ksp, ekkert botnfall/)).toBeTruthy();
    expect(screen.getByRole('img').getAttribute('aria-label')).toMatch(/ekkert botnfall\.$/);
  });

  it('turns the Mohr flask red only once the chloride is nearly gone', () => {
    render(<NaermyndScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '4. Mohr-títrun' }));
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '-6' } });
    expect(screen.getByText(/Hvítt silfurklóríð fellur út; ekkert rautt enn/)).toBeTruthy();
    fireEvent.change(slider, { target: { value: '-4.5' } });
    expect(screen.getByText(/Rautt silfurkrómat fellur út/)).toBeTruthy();
  });

  it('has four scenes, each with an equation', () => {
    expect(STEPS.map((s) => s.title)).toEqual([
      'Mettuð lausn',
      'Samjón bætt við',
      'Tvær lausnir blandaðar',
      'Mohr-títrun',
    ]);
    for (const s of STEPS) expect(s.equations.length).toBeGreaterThan(0);
  });
});
