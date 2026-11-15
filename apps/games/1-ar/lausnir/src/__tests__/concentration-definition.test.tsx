import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Level2 } from '../components/Level2';

/**
 * Year-1 audit, Phase 0 item 2 (2026-11-15).
 *
 * Stig 1 used to define concentration as particles over volume. The book's
 * definition is moles of solute per litre of solution (ch. 3, m68703); the
 * drawn particle is a scale, each one standing for 0,01 mól. And the particles
 * are eindir, not molecules: the level's solutions include NaCl, which has none.
 */

const level1 = readFileSync(join(__dirname, '..', 'components', 'Level1.tsx'), 'utf8');
const level2 = readFileSync(join(__dirname, '..', 'components', 'Level2.tsx'), 'utf8');

describe('Stig 1 defines concentration as the book does', () => {
  it('writes mólstyrkur = mól / L and never particles over volume', () => {
    expect(level1).toMatch(/Mólstyrkur = mól \/ L/);
    expect(level1).not.toMatch(/Styrkur = \(?s?a?meind/i);
  });

  it('says what one drawn particle stands for on the play screen', () => {
    expect(level1).toMatch(/hver eind = 0,01 mól/);
  });

  it('calls the drawn particles eindir, in Stig 1 and Stig 2', () => {
    expect(level1).not.toMatch(/s[a]meind/i);
    expect(level2).not.toMatch(/s[a]meind/i);
  });
});

describe('Stig 2 marks the chosen answer for a screen reader', () => {
  it('sets aria-pressed on the option chosen and only on it', () => {
    render(<Level2 onComplete={() => {}} onBack={() => {}} />);
    const options = screen.getAllByRole('button').filter((b) => b.hasAttribute('aria-pressed'));
    expect(options.length).toBeGreaterThanOrEqual(2);
    expect(options.every((b) => b.getAttribute('aria-pressed') === 'false')).toBe(true);
    fireEvent.click(options[1]);
    expect(options.map((b) => b.getAttribute('aria-pressed'))).toEqual(
      options.map((_, i) => String(i === 1))
    );
  });
});
