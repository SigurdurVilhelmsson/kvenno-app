import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MixtureView } from '../components/MixtureView';
import { CONSTANTS, STARTING_MIXTURES } from '../data/constants';
import { equilibria } from '../data/equilibria';
import { mixtureFrames } from '../engine/mixture';
import { applyStress, equilibrate } from '../engine/stress';

const haber = equilibria.find((eq) => eq.id === 11)!;
const stress = { type: 'add-reactant' as const, target: 'H₂' };
const before = equilibrate(haber, CONSTANTS[11].value, STARTING_MIXTURES[11])!;
const outcome = applyStress(haber, CONSTANTS[11], STARTING_MIXTURES[11], stress)!;
const mixture = mixtureFrames(haber, before, outcome, stress)!;

describe('MixtureView', () => {
  it('holds back the new equilibrium until the answer is in', () => {
    render(<MixtureView mixture={mixture} stress={stress.type} available={2} />);
    expect(screen.getByRole('button', { name: /Strax eftir álagið/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Nýtt jafnvægi/ })).toBeNull();
    const counts = mixture.frames[1].counts;
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe(
      `Strax eftir álagið: ${counts['N₂']} N₂, ${counts['H₂']} H₂, ${counts['NH₃']} NH₃.`
    );
  });

  it('steps between the frames and names each count', () => {
    render(<MixtureView mixture={mixture} stress={stress.type} available={3} />);
    const img = () => screen.getByRole('img').getAttribute('aria-label')!;
    expect(img()).toMatch(/^Nýtt jafnvægi:/);
    fireEvent.click(screen.getByRole('button', { name: /Í jafnvægi/ }));
    expect(img()).toBe(
      `Í jafnvægi: ${mixture.frames[0].counts['N₂']} N₂, ${mixture.frames[0].counts['H₂']} H₂, ${mixture.frames[0].counts['NH₃']} NH₃.`
    );
    expect(screen.queryByText(/Efninu er bætt við/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Strax eftir álagið/ }));
    expect(screen.getByText(/Efninu er bætt við/)).toBeTruthy();
  });

  it('prints the scale with a decimal comma', () => {
    render(<MixtureView mixture={mixture} stress={stress.type} available={1} />);
    expect(screen.getByText(/Ein ögn ≈/).textContent).not.toMatch(/\d\.\d/);
  });
});
