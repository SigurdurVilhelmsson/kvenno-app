import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AgnasynScreen, showQ } from '../components/AgnasynScreen';
import { T_MAX } from '../engine/agnasyn';

describe('AgnasynScreen', () => {
  it('opens at time zero with Q = 0 in one flask and ∞ in the other', () => {
    render(<AgnasynScreen onBack={() => {}} />);
    expect(screen.getByRole('heading', { name: /tvær leiðir að sama jafnvægi/ })).toBeTruthy();
    expect(screen.getByText('Q = 0')).toBeTruthy();
    expect(screen.getByText('Q = ∞')).toBeTruthy();
    expect(
      screen.getByRole('img', { name: /^Byrjað á hvarfefnum: 20 CO, 20 H₂O, 0 CO₂, 0 H₂\.$/ })
    ).toBeTruthy();
  });

  it('reads the ICE table off the particles once the slider reaches equilibrium', () => {
    render(<AgnasynScreen onBack={() => {}} />);
    fireEvent.change(screen.getByRole('slider', { name: 'Tími' }), {
      target: { value: String(T_MAX) },
    });
    expect(screen.getAllByText('Q = K')).toHaveLength(2);
    expect(screen.getAllByRole('rowheader', { name: 'Jafnvægi' })).toHaveLength(2);
    expect(
      screen.getByRole('img', { name: /^Byrjað á myndefnum: 11 CO, 11 H₂O, 9 CO₂, 9 H₂\.$/ })
    ).toBeTruthy();
    expect(screen.getByText(/Báðar flöskurnar enda í sömu blöndu/)).toBeTruthy();
  });

  it('prints Q with a decimal comma', () => {
    expect(showQ(0.64)).toBe('0,64');
    expect(showQ(2.2)).toBe('2,20');
    expect(showQ(0)).toBe('0');
  });
});
