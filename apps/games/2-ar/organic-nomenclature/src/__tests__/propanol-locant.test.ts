import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Year-2 audit, 2026-11-15: Stig 3 asked for the formula of "PRÓPANÓL" with CH₃CH₂CH₂OH as the
 * answer, though the name fits 2-própanól too. The book writes the locant (kafli 20), and so does
 * Stig 2 for double bonds and branches.
 */
const src = readFileSync(resolve(__dirname, '../components/Level3.tsx'), 'utf8');
const hub = readFileSync(
  resolve(__dirname, '../../../../../landing/src/pages/GamesHub.tsx'),
  'utf8'
);

describe('Lífræn nafnagift names the alcohol with its locant', () => {
  it('never says própanól without a number', () => {
    expect(src).not.toMatch(/(?<![\d-])própanól/i);
    expect(src).toContain('1-PRÓPANÓL');
  });

  it('offers 2-própanól as the distractor the locant rules out', () => {
    expect(src).toContain("'CH₃CH(OH)CH₃'");
  });

  it('names functional groups on the hub card, as Stig 3 teaches them', () => {
    expect(hub).toMatch(/alkýna og virka hópa/);
  });
});
