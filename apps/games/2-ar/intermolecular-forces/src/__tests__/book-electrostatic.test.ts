import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { challenges } from '../components/Level3';

/**
 * Year-2 audit, 2026-11-15 (Phase 0, item 1). The textbook (kafli 10) teaches every
 * intermolecular force as electrostatic: London forces are attractions between temporary
 * dipoles. Stig 3 marked "Rafstöðuaðdráttarkraftar" wrong for the gecko and "Rafstöðuafleiðsla"
 * wrong for the soap bubble with "Þetta er ekki rafstöðufyrirbæri", which contradicts the book.
 * It also taught that S-H forms (very weak) hydrogen bonds; the book says hydrogen bonds form
 * only when H is bonded to F, O or N.
 */
const allExplanations = challenges.flatMap((c) => [
  ...c.options.map((o) => o.explanation),
  c.conceptNote,
]);

describe('Stig 3 treats intermolecular forces as electrostatic', () => {
  it('never says a force is not electrostatic', () => {
    for (const text of allExplanations) {
      expect(text).not.toMatch(/ekki rafstöðu/i);
    }
  });

  it('offers no electrostatic distractor marked wrong', () => {
    for (const c of challenges) {
      for (const o of c.options) {
        if (!o.correct) expect(o.text).not.toMatch(/^Rafstöðu/);
      }
    }
  });
});

describe('Stig 3, water against H₂S', () => {
  const challenge = challenges.find((c) =>
    c.options.some((o) => o.text === 'Vatn myndar vetnistengi en H₂S ekki')
  )!;

  it('makes "H₂S forms no hydrogen bonds" the right answer', () => {
    const right = challenge.options.find((o) => o.correct)!;
    expect(right.text).toBe('Vatn myndar vetnistengi en H₂S ekki');
  });

  it('nowhere claims S-H forms hydrogen bonds, weak or otherwise', () => {
    for (const text of allExplanations) {
      expect(text).not.toMatch(/S-H\s+(mjög\s+)?veik/);
      expect(text).not.toMatch(/sterk H-tengi/);
    }
  });
});

describe('Stig 1 does not call the hydrogen bond the strongest force without qualification', () => {
  it('drops "Sterkasta IMF"', () => {
    const src = readFileSync(resolve(__dirname, '../components/Level1.tsx'), 'utf8');
    expect(src).not.toContain('Sterkasta IMF');
    expect(src).toMatch(/geta í stórum sameindum orðið sterkari/);
  });
});
