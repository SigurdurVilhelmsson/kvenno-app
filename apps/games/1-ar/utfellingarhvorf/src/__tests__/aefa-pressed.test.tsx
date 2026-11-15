import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AefaScreen } from '../components/AefaScreen';
import { SOLUBILITY_RULES } from '../data/ions';

/**
 * Year-1 audit, Phase 0 item 6 (2026-11-15). Æfa is select-then-check, and
 * colour was the only cue to what was chosen before Athuga. Both groups now
 * say it with aria-pressed.
 */

describe('Æfa marks the chosen answers for a screen reader', () => {
  it('sets aria-pressed on the chosen verdict and the chosen rule, and on nothing else', () => {
    render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    const soluble = screen.getByRole('button', { name: 'Leysanlegt' });
    const insoluble = screen.getByRole('button', { name: 'Óleysanlegt' });
    expect([soluble, insoluble].map((b) => b.getAttribute('aria-pressed'))).toEqual([
      'false',
      'false',
    ]);
    fireEvent.click(insoluble);
    expect([soluble, insoluble].map((b) => b.getAttribute('aria-pressed'))).toEqual([
      'false',
      'true',
    ]);

    const rules = SOLUBILITY_RULES.map((r) => screen.getByRole('button', { name: r.text }));
    expect(rules.every((b) => b.getAttribute('aria-pressed') === 'false')).toBe(true);
    fireEvent.click(rules[1]);
    expect(rules.map((b) => b.getAttribute('aria-pressed'))).toEqual(
      rules.map((_, i) => String(i === 1))
    );
  });
});
