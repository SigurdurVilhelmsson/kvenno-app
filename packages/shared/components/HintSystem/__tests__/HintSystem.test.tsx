// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import { HINT_TIER_ICONS, HINT_TIER_LABELS } from '../../../types/hint.types';
import { FadePresence, Presence } from '../../Transition/Transition';
import { HintSystem } from '../HintSystem';
import { HintTier } from '../HintTier';

// HintSystem shows a running "Stig: <reduced> / <base>" indicator once a tier is
// revealed, derived from HINT_MULTIPLIERS (1.0 / 0.8 / 0.6 / 0.4 / 0.4).
//
// That indicator is only honest in a game that actually applies the multiplier it
// reports. Two consumers did not — `3-ar/ph-titration` L1 (fixed by dropping the
// multiplier, since a real penalty conflicts with the restructure) and
// `3-ar/equilibrium-shifter` (which passed `onPointsChange` to a write-only setter,
// so the indicator quoted a price nothing charged). Both now opt out via
// `showPointCost={false}`.
//
// The default must stay `true`: `2-ar/lewis-structures` L1 and
// `3-ar/buffer-recipe-creator` L1/L2/L3 do apply the multiplier, and flipping the
// default would silently stop telling their students what a hint costs.

const HINTS = {
  topic: 'Efnisvísbending',
  strategy: 'Aðferðarvísbending',
  method: 'Formúluvísbending',
  solution: 'Lausnarvísbending',
};

const COST_INDICATOR = /Stig: \d+ \/ \d+/;

function revealFirstTier() {
  fireEvent.click(screen.getByText(/^Vísbending \d\/4:/));
}

describe('HintSystem point-cost indicator', () => {
  afterEach(cleanup);

  it('shows the cost by default, for the games that apply the multiplier', () => {
    render(<HintSystem hints={HINTS} basePoints={100} />);
    expect(screen.queryByText(COST_INDICATOR)).toBeNull(); // nothing revealed yet

    revealFirstTier();

    // Tier 1 is the 0.8 multiplier.
    expect(screen.getByText(COST_INDICATOR).textContent).toBe('Stig: 80 / 100');
  });

  it('hides the cost when showPointCost is false', () => {
    render(<HintSystem hints={HINTS} basePoints={100} showPointCost={false} />);
    revealFirstTier();

    expect(screen.queryByText(COST_INDICATOR)).toBeNull();
  });

  it('still reveals the hint text when the cost is hidden', () => {
    render(<HintSystem hints={HINTS} basePoints={100} showPointCost={false} />);
    revealFirstTier();

    // Suppressing the price must not suppress the help.
    expect(screen.getByText(HINTS.topic)).toBeTruthy();
  });
});

// `disabled` is what every consumer passes once the question is answered. It
// used to make the whole component return null, so the tiers a student had just
// opened vanished at the moment the feedback appeared, and the feedback below
// jumped up by their height (lewis-structures L1 worked around it locally).
describe('HintSystem once disabled', () => {
  afterEach(cleanup);

  const HINT_BUTTON = /^Vísbending \d\/4:/;

  it('keeps the tiers already revealed, and offers no more', () => {
    const { rerender } = render(<HintSystem hints={HINTS} basePoints={100} />);
    revealFirstTier();
    revealFirstTier(); // tier 2

    rerender(<HintSystem hints={HINTS} basePoints={100} disabled />);

    expect(screen.getByText(HINTS.topic)).toBeTruthy();
    expect(screen.getByText(HINTS.strategy)).toBeTruthy();
    // Read-only: no button for tier 3, and nothing past what was opened.
    expect(screen.queryByText(HINT_BUTTON)).toBeNull();
    expect(screen.queryByText(HINTS.method)).toBeNull();
    // The running cost belongs to the controls, which are gone.
    expect(screen.queryByText(COST_INDICATOR)).toBeNull();
  });

  it('keeps the same tier elements, so their fade-in does not replay', () => {
    const { rerender } = render(<HintSystem hints={HINTS} basePoints={100} />);
    revealFirstTier();
    const before = screen.getByText(HINTS.topic);

    rerender(<HintSystem hints={HINTS} basePoints={100} disabled />);

    expect(screen.getByText(HINTS.topic)).toBe(before);
  });

  it('drops "Allar vísbendingar notaðar" when every tier was opened', () => {
    const { rerender } = render(<HintSystem hints={HINTS} basePoints={100} />);
    for (let i = 0; i < 4; i++) revealFirstTier();
    expect(screen.getByText('Allar vísbendingar notaðar')).toBeTruthy();

    rerender(<HintSystem hints={HINTS} basePoints={100} disabled />);

    expect(screen.getByText(HINTS.solution)).toBeTruthy();
    expect(screen.queryByText('Allar vísbendingar notaðar')).toBeNull();
  });

  it('still renders nothing when no tier was revealed', () => {
    const { container } = render(<HintSystem hints={HINTS} basePoints={100} disabled />);
    expect(container.innerHTML).toBe('');
  });

  it('comes back to life for the next question', () => {
    const { rerender } = render(<HintSystem hints={HINTS} basePoints={100} resetKey={0} />);
    revealFirstTier();
    rerender(<HintSystem hints={HINTS} basePoints={100} resetKey={0} disabled />);

    rerender(<HintSystem hints={HINTS} basePoints={100} resetKey={1} />);

    expect(screen.queryByText(HINTS.topic)).toBeNull();
    expect(screen.getByText(/^Vísbending 1\/4:/)).toBeTruthy();
  });
});

// ph-titration Stig 1 and equilibrium-shifter do not just disable the hints on
// answering: they also swap them out with a Presence, whose exit keeps them in
// the page for 250 ms above the feedback fading in below. Keeping the tiers for
// that fade showed nothing the student could keep reading, and at 360 px with
// two tiers open it dropped the feedback about 260 px low and then jumped it up
// when the fade ended. So inside a Presence that is leaving, the tiers go at
// once, as they always did; inside one that stays shown (buffer-recipe-creator's
// level screens) they stay.
describe('HintSystem inside a Presence', () => {
  afterEach(cleanup);

  describe.each([
    ['Presence', Presence],
    ['FadePresence', FadePresence],
  ] as const)('%s', (_name, Wrapper) => {
    function ui(answered: boolean, swappedOut: boolean) {
      return (
        <Wrapper show={!(answered && swappedOut)} exitDuration={250}>
          <HintSystem hints={HINTS} basePoints={100} disabled={answered} />
        </Wrapper>
      );
    }

    it('drops the revealed tiers at once when the Presence is swapping it out', () => {
      const { rerender, container } = render(ui(false, true));
      revealFirstTier();

      rerender(ui(true, true));

      // The Presence is still mid-exit (its wrapper is mounted, and inert)...
      expect(container.querySelector('[inert]')).not.toBeNull();
      // ...but the tiers are already gone, as they were before the fix.
      expect(screen.queryByText(HINTS.topic)).toBeNull();
    });

    it('keeps the revealed tiers when the Presence around it stays shown', () => {
      const { rerender } = render(ui(false, false));
      revealFirstTier();

      rerender(ui(true, false));

      expect(screen.getByText(HINTS.topic)).toBeTruthy();
      expect(screen.queryByText(/^Vísbending \d\/4:/)).toBeNull();
    });

    it('keeps working normally while fading out if the question was not answered', () => {
      // A screen swap mid-question: not disabled, so nothing changes during the fade.
      const { rerender } = render(
        <Wrapper show exitDuration={250}>
          <HintSystem hints={HINTS} basePoints={100} />
        </Wrapper>
      );
      revealFirstTier();

      rerender(
        <Wrapper show={false} exitDuration={250}>
          <HintSystem hints={HINTS} basePoints={100} />
        </Wrapper>
      );

      expect(screen.getByText(HINTS.topic)).toBeTruthy();
    });
  });
});

// At 320 px the icon column plus `p-3` left the hint text narrow enough that
// `overflow-wrap: break-word` split long Icelandic words mid-word
// (equilibrium-shifter). Below `sm` the text runs under the icon; every `sm:`
// class restores the desktop layout (checked pixel for pixel in Chromium).
describe('HintTier at phone width', () => {
  afterEach(cleanup);

  function classesOf(el: Element | null | undefined): string[] {
    return (el?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean);
  }

  it('pads less on a phone and exactly as before from sm up', () => {
    render(<HintTier tier="strategy" content={HINTS.strategy} />);
    const card = screen.getByText(HINTS.strategy).closest('.border-l-4');

    expect(classesOf(card)).toEqual(expect.arrayContaining(['p-2.5', 'sm:p-3']));
    expect(classesOf(card)).not.toContain('p-3');
  });

  it('runs the hint text under the icon on a phone', () => {
    render(<HintTier tier="strategy" content={HINTS.strategy} />);
    const icon = screen.getByRole('img', { name: HINT_TIER_LABELS.strategy });

    // Icon pinned to a 24 px column and the label's 24 px line on a phone...
    expect(classesOf(icon)).toEqual(
      expect.arrayContaining(['w-6', 'leading-6', 'sm:w-auto', 'sm:leading-7'])
    );
    // ...so -ml-8 (24 px + the 8 px gap) takes exactly that column back.
    expect(classesOf(screen.getByText(HINTS.strategy))).toEqual(
      expect.arrayContaining(['-ml-8', 'sm:ml-0'])
    );
    // The label stays beside the icon.
    expect(classesOf(screen.getByText(HINT_TIER_LABELS.strategy))).not.toContain('-ml-8');
  });

  it('draws the icon once', () => {
    const { container } = render(<HintTier tier="strategy" content={HINTS.strategy} />);

    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(container.textContent?.split(HINT_TIER_ICONS.strategy)).toHaveLength(2);
  });
});
