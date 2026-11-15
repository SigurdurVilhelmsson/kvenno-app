import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { challenges as level1 } from '../data/level1-questions';
import { challenges as level2 } from '../data/level2-questions';

/** Year-2 audit, 2026-11-15, Phase 0 item 5. */
describe('Hvarfhraði, year-2 audit fixes', () => {
  it('calls a chemical bond tengi, not tengsl', () => {
    const text = JSON.stringify(level1);
    expect(text).not.toMatch(/rjúfa tengsl/);
    expect(text).toMatch(/rjúfa tengi/);
  });

  it('says the bromate k includes [H⁺]², since the hint holds [H⁺] fixed', () => {
    const bromate = level2.find((c) => c.equation.startsWith('BrO₃⁻'))!;
    expect(bromate.explanation).toContain('[H⁺]²');
    expect(bromate.explanation).toMatch(/k\[H⁺\]², ekki k sjálfur/);
  });

  it('marks the chosen order with aria-pressed, not colour alone', () => {
    const src = readFileSync(resolve(__dirname, '../components/Level2.tsx'), 'utf8');
    expect(src).toContain('aria-pressed={orderA === order}');
    expect(src).toContain('aria-pressed={orderB === order}');
  });
});
