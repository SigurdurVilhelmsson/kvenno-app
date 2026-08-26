// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import { Level3 } from '../components/Level3';
import { gameTranslations } from '../i18n';

// Level 3 used to award 20 points for an unaided correct answer and 10 for one
// where the hint had been opened, and its button said so: "Sýna vísbendingu
// (-10 stig)". The label was honest, but the penalty itself contradicts the
// April 2026 restructure, whose rule is that hint use is never penalised —
// Levels 1 and 2 of this same game already award a flat 100 either way.
//
// Both halves are gone as of Aug 2026. This drives the real component rather
// than scanning source, so it fails if the branch comes back in any shape.

// The component takes `t` as a prop, so the stub keeps keys visible as text.
const t = (key: string, fallback?: string) => fallback ?? key;

// Challenge 1: CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l).
// ΔH = [(-393.5) + 2(-285.8)] − [(-74.8) + 2(0)] = -890.3 kJ/mol.
const CHALLENGE_1_ANSWER = '-890.3';

// Level 3 opens on a teaching intro; the challenges are behind its start button.
function startLevel() {
  render(<Level3 t={t} onComplete={() => {}} onBack={() => {}} />);
  fireEvent.click(screen.getByText(/Byrja æfingar/));
}

function answerFirstChallenge({ useHint }: { useHint: boolean }) {
  startLevel();

  if (useHint) {
    fireEvent.click(screen.getByText('level3.showHint'));
  }

  fireEvent.change(screen.getByPlaceholderText('level3.placeholder'), {
    target: { value: CHALLENGE_1_ANSWER },
  });
  fireEvent.click(screen.getByText('level3.check'));

  // The score sits in its own node as `{score} {t('progress.points')}`.
  return screen.getByText(/progress\.points/).textContent?.trim();
}

describe('hess-law level 3 hint cost', () => {
  afterEach(cleanup);

  it('scores a correct answer the same with and without a hint', () => {
    const unaided = answerFirstChallenge({ useHint: false });
    cleanup();
    const hinted = answerFirstChallenge({ useHint: true });

    expect(unaided).toBe('20 progress.points');
    expect(hinted).toBe(unaided);
  });

  it('offers the hint without advertising a price', () => {
    startLevel();
    const button = screen.getByText('level3.showHint');

    // `t` here returns the key, so this asserts the call site appends nothing.
    // The locale strings themselves are covered by the i18n check below.
    expect(button.textContent).toBe('level3.showHint');
  });

  it.each(['is', 'en', 'pl'])('the %s hint label quotes no price', (locale) => {
    const label = (gameTranslations as unknown as Record<string, { level3: { showHint: string } }>)[
      locale
    ].level3.showHint;

    // Covers the three wordings this game shipped: "(-10 stig)", "(-10 points)",
    // "(-10 punktów)". A digit next to a points/grade word is the shape to catch,
    // in any of the three languages.
    expect(label).not.toMatch(/\d/);
    expect(label).not.toMatch(/stig|punkt|point|einkunn/i);
  });
});
