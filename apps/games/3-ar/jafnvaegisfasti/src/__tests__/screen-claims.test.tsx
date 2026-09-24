import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { reactionQuotient } from '@shared/engine/equilibrium';

import { KannaScreen } from '../components/KannaScreen';
import { SkiljaScreen } from '../components/SkiljaScreen';
import { reactionBy } from '../data/reactions';

/**
 * What the screens say, held to what the game does.
 */

afterEach(cleanup);

describe("Skilja's first step", () => {
  it('says what doubling [H₂] really does to Q', () => {
    // Q = [NH₃]² / ([N₂][H₂]³). The coefficient 3 puts [H₂] cubed in the
    // DENOMINATOR, so doubling it divides Q by eight. The step used to say it
    // multiplied Q by eight — the opposite direction, on the one step whose
    // whole point is what a coefficient does.
    const ammoniak = reactionBy('ammoniak');
    const base = { 'N₂': 0.5, 'H₂': 0.5, 'NH₃': 0.5 };
    const ratio =
      reactionQuotient(ammoniak, { ...base, 'H₂': 1.0 }) / reactionQuotient(ammoniak, base);
    expect(ratio).toBeCloseTo(1 / 8, 12);

    render(<SkiljaScreen onComplete={() => {}} onBack={() => {}} />);
    const text = document.body.textContent ?? '';
    expect(text).toContain('tvöföldun á [H₂] deilir Q með átta');
    expect(text).not.toMatch(/áttfaldar Q/);
  });
});

describe("Kanna's counter", () => {
  it('counts the mixture already on screen', () => {
    // The first mixture opens selected, with its result showing. The counter
    // used to read 0/4 beside it, and a student who tried the other three was
    // held at 3/4 until they tapped the one already chosen.
    render(<KannaScreen onComplete={() => {}} onBack={() => {}} />);
    expect(screen.getByText(/Prófaðu allar fjórar blöndurnar \(1\/4\)/)).toBeTruthy();

    for (const preset of ['Bara myndefni', 'Mikið af myndefnum', 'Tífalt þynnra']) {
      fireEvent.click(screen.getByText(preset));
    }
    const done = screen.getByRole('button', { name: 'Áfram' }) as HTMLButtonElement;
    expect(done.disabled).toBe(false);
    expect(screen.getByText('Tókstu eftir þessu?')).toBeTruthy();
  });
});
