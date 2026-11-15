import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AgnasynScreen } from '../components/AgnasynScreen';

const readout = (v: string) => document.querySelector(`[data-readout="${v}"]`)?.textContent ?? '';

describe('Gaslögmál Agnasýn screen', () => {
  it('starts on Boyle with the starting state and marks what is fixed', () => {
    render(<AgnasynScreen onBack={() => {}} />);
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('1. Lögmál Boyles');
    expect(readout('P')).toMatch(/^1,00 atm/);
    expect(readout('T')).toContain('300 K (27 °C)');
    expect(readout('T')).toContain('fast');
    expect(readout('n')).toContain('fast');
    expect(readout('P')).not.toContain('fast');
  });

  it('doubles the pressure when the volume is halved', () => {
    render(<AgnasynScreen onBack={() => {}} />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '24' } });
    const p24 = readout('P');
    fireEvent.change(slider, { target: { value: '12' } });
    expect(p24).toMatch(/^1,03 atm/);
    expect(readout('P')).toMatch(/^2,05 atm/);
    expect(document.querySelector('[data-kinetic="push"]')?.textContent).toBe('× 1,00');
  });

  it('shows the line to absolute zero on the Charles scene only', () => {
    render(<AgnasynScreen onBack={() => {}} />);
    expect(screen.queryByText('Rúmmál á móti hitastigi í °C')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '2. Lögmál Charles' }));
    expect(screen.getByText('Rúmmál á móti hitastigi í °C')).toBeTruthy();
    expect(readout('P')).toContain('fast');
  });

  it('adds one circle per step of the mólfjöldi slider (Avogadro)', () => {
    render(<AgnasynScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '4. Lögmál Avogadros' }));
    const circles = () => document.querySelectorAll('svg[data-live] circle').length;
    const before = circles();
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1.05' } });
    expect(circles()).toBe(before + 1);
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toContain('21 agnir');
  });

  it('states the scale of the picture on screen', () => {
    render(<AgnasynScreen onBack={() => {}} />);
    expect(screen.getByText(/Hver hringur er 0,050 mól/)).toBeTruthy();
  });
});
