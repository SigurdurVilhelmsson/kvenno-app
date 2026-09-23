import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ParticleEquilibrium } from '../components/ParticleEquilibrium';

/**
 * The shared ParticleSimulation draws a legend of its own ('R: 20 / P: 20').
 * It was light grey text, invisible here; once the shared component made it
 * legible, it sat directly above this game's Icelandic legend, repeating it
 * with English initials. The game keeps its own legend and turns that one off.
 */
describe('ParticleEquilibrium legend', () => {
  it('shows the Icelandic legend once, without the simulation’s R:/P: legend', () => {
    render(<ParticleEquilibrium reactantCount={20} productCount={20} />);
    expect(screen.queryByText(/^R:\s*\d/)).toBeNull();
    expect(screen.queryByText(/^P:\s*\d/)).toBeNull();
    expect(screen.getAllByText(/Hvarfefni/).length).toBeGreaterThan(0);
  });
});
