import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NaermyndScreen } from '../components/NaermyndScreen';
import { STEPS } from '../data/naermynd-steps';

const labels = () => screen.getAllByRole('img').map((el) => el.getAttribute('aria-label'));

describe('Hvarfhraði Nærmynd screen', () => {
  it('starts both flasks full', () => {
    render(<NaermyndScreen onBack={() => {}} />);
    expect(labels()).toEqual([
      'Fyrsta stig: H₂O₂: 32 af 32 ögnum eftir.',
      'Núllta stig (hugsað): 32 af 32 ögnum eftir.',
    ]);
  });

  it('agrees at one half-life and parts at two', () => {
    render(<NaermyndScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '2. Einn helmingunartími' }));
    expect(labels()).toEqual([
      'Fyrsta stig: H₂O₂: 16 af 32 ögnum eftir.',
      'Núllta stig (hugsað): 16 af 32 ögnum eftir.',
    ]);
    fireEvent.click(screen.getByRole('button', { name: '3. Tveir helmingunartímar' }));
    expect(labels()).toEqual([
      'Fyrsta stig: H₂O₂: 8 af 32 ögnum eftir.',
      'Núllta stig (hugsað): 0 af 32 ögnum eftir.',
    ]);
    expect(screen.getByText('Ekkert eftir')).toBeTruthy();
  });

  it('moves both flasks with the slider', () => {
    render(<NaermyndScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '5. Kannaðu sjálf/ur' }));
    fireEvent.change(screen.getByRole('slider'), { target: { value: '18' } });
    expect(labels()[0]).toBe('Fyrsta stig: H₂O₂: 4 af 32 ögnum eftir.');
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
