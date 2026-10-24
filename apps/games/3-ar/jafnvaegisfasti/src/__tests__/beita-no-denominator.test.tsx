import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { activeProducts, activeReactants } from '@shared/engine/equilibrium';

import { clockPastNextGuard } from './next-guard-clock';
import { BeitaScreen } from '../components/BeitaScreen';
import { BEITA_PROBLEMS } from '../data/problems';

/**
 * NH₄Cl(s) ⇌ NH₃ + HCl has nothing on the left of Kp, so there is no denominator to drop x from.
 *
 * **Why this exists** (mobile-pass decision 97 (a), ruled 2026-10-23). Beita's last step asked
 * whether x could be dropped from the denominator. Here both gases start at 0 atm, the screen
 * reported `0,00 % af upphafsþrýstingnum`, and it marked `Nei — það verður að leysa nákvæmlega`
 * wrong, though x² = Kp is exact. The step is now skipped, with the reason given instead.
 */

clockPastNextGuard();

afterEach(cleanup);

const SENTENCE = 'Hér er enginn nefnari — x² = Kp er leyst nákvæmlega og engin nálgun þarf.';
const SALT = BEITA_PROBLEMS.findIndex((p) => p.reaction.id === 'ammoniumklorid');

/** Walk the screen to `index`, playing each earlier problem through to the end. */
function openProblem(index: number) {
  render(<BeitaScreen onComplete={() => {}} onBack={() => {}} />);
  for (let i = 0; i < index; i += 1) {
    fireEvent.click(screen.getByText('Áfram — myndefnin aukast'));
    fireEvent.click(screen.getByText('Athuga'));
    fireEvent.click(screen.getByText('Sýna svarið og halda áfram'));
    const rule = screen.queryByText(/nálgunin hefði dugað/i);
    if (rule) fireEvent.click(rule);
    fireEvent.click(screen.getByText(/Næsta dæmi|Ljúka/));
  }
}

describe('a Beita problem with no denominator', () => {
  it('is NH₄Cl, the only one, and the sentence fits it', () => {
    const none = BEITA_PROBLEMS.filter((p) => activeReactants(p.reaction).length === 0);
    expect(none.map((p) => p.reaction.id)).toEqual(['ammoniumklorid']);
    // The sentence says x² = Kp: two gases, each made once per reaction. Hold any future
    // problem of this kind to it, or to new wording.
    for (const p of none) {
      const gases = activeProducts(p.reaction);
      expect(gases.map((s) => s.coefficient)).toEqual([1, 1]);
      expect(p.unit).toBe('atm');
    }
  });

  it('skips the five per cent question and says why', () => {
    expect(SALT).toBeGreaterThan(0);
    openProblem(SALT);
    fireEvent.click(screen.getByText('Áfram — myndefnin aukast'));
    fireEvent.click(screen.getByText('Athuga'));
    fireEvent.click(screen.getByText('Sýna svarið og halda áfram'));
    expect(screen.queryByText(/nálgunin hefði dugað/i)).toBeNull();
    expect(screen.queryByText(/leysa nákvæmlega/)).toBeNull();
    expect(screen.queryByText('Ekki rétt.')).toBeNull();
    expect(screen.queryByText(/af upphafsþrýstingnum/)).toBeNull();
    expect(screen.getByText(SENTENCE)).toBeTruthy();
    expect(screen.getByText(/Næsta dæmi|Ljúka/)).toBeTruthy();
  });

  it('still asks it on the problem before', () => {
    openProblem(SALT - 1);
    fireEvent.click(screen.getByText('Áfram — myndefnin aukast'));
    fireEvent.click(screen.getByText('Athuga'));
    fireEvent.click(screen.getByText('Sýna svarið og halda áfram'));
    expect(screen.getByText(/nálgunin hefði dugað/i)).toBeTruthy();
  });
});
