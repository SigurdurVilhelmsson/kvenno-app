/**
 * Ethers, esters, amines, amides and cis/trans in Stig 3 (year-2 plan, Phase 4; Siggi,
 * 2026-11-15). The book teaches each in kafli 20 (m68846–m68849) and the platform named none of
 * them. These tests hold the new items to what the book says and to their own claims: where an
 * explanation says two compounds are isomers, their molecular formulas are counted here.
 */
import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LEVEL3_CHALLENGES, Level3 } from '../components/Level3';

/** Atoms in a condensed formula such as CH₃CH₂OCH₂CH₃ or (CH₃)₂NH; one level of brackets. */
function atoms(formula: string): Record<string, number> {
  const plain = formula.replace(/[₀-₉]/g, (d) => String(d.charCodeAt(0) - 0x2080));
  const count = (text: string, times: number, into: Record<string, number>) => {
    for (const [, el, n] of text.matchAll(/([A-Z][a-z]?)(\d*)/g)) {
      into[el] = (into[el] ?? 0) + (n ? Number(n) : 1) * times;
    }
  };
  const out: Record<string, number> = {};
  const rest = plain.replace(/\(([^)]*)\)(\d*)/g, (_, inner: string, n: string) => {
    count(inner, n ? Number(n) : 1, out);
    return '';
  });
  count(rest, 1, out);
  return out;
}

const byId = (id: number) => {
  const c = LEVEL3_CHALLENGES.find((x) => x.id === id);
  if (!c) throw new Error(`no challenge ${id}`);
  return c;
};

describe('the new items', () => {
  it('ask about each of the four groups and about cis and trans', () => {
    const answers = LEVEL3_CHALLENGES.map((c) => c.correctAnswer);
    expect(answers).toEqual(
      expect.arrayContaining([
        'Eter (C–O–C)',
        'Amíð (-CONH₂)',
        'etoxýetan',
        'metýletanóat',
        'dímetýlamín',
        'cis-2-búten',
        '2-penten',
      ])
    );
    expect(LEVEL3_CHALLENGES.filter((c) => c.type === 'isomer')).toHaveLength(3);
  });

  it('offer four different options, the answer among them', () => {
    for (const c of LEVEL3_CHALLENGES) {
      expect(new Set(c.options).size, `challenge ${c.id}`).toBe(4);
      expect(c.options, `challenge ${c.id}`).toContain(c.correctAnswer);
    }
  });

  it('name compounds that have the formula asked about', () => {
    // CH₃CH₂OCH₂CH₃ and 1-bútanól, CH₃CH₂CH₂CH₂OH, are both C₄H₁₀O, as challenge 13 says.
    expect(atoms(byId(13).formula!)).toEqual(atoms('CH₃CH₂CH₂CH₂OH'));
    expect(atoms(byId(13).formula!)).toEqual({ C: 4, H: 10, O: 1 });
    // Dímetýlamín and etýlamín, CH₃CH₂NH₂, are both C₂H₇N, as challenge 15 says.
    expect(atoms(byId(15).formula!)).toEqual(atoms('CH₃CH₂NH₂'));
    expect(atoms(byId(15).formula!)).toEqual({ C: 2, H: 7, N: 1 });
    // Metýletanóat and its reversed distractor, etýlmetanóat (HCOOCH₂CH₃), are isomers too:
    // the name, not the formula, says which way round the ester is.
    expect(atoms(byId(14).formula!)).toEqual(atoms('HCOOCH₂CH₃'));
  });

  it('say amide, not amine, where the nitrogen sits on a carbonyl carbon', () => {
    const amide = byId(12);
    expect(amide.formula).toMatch(/CONH₂$/);
    expect(amide.options).toContain('Amín (-NH₂)');
  });
});

describe('the cards', () => {
  it('teach the four new groups and then cis and trans before the challenges', () => {
    const { container } = render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(container);
    const seen: string[] = [];
    for (let guard = 0; guard < 20; guard++) {
      seen.push(container.querySelector('[data-item-start]')!.textContent!);
      if (ui.queryByRole('button', { name: /Byrja áskoranir/ })) break;
      fireEvent.click(ui.getByRole('button', { name: /^Næsta/ }));
    }
    expect(seen).toHaveLength(9);
    for (const [i, name] of ['Eter', 'Ester', 'Amín', 'Amíð'].entries()) {
      expect(seen[4 + i].startsWith(name), name).toBe(true);
    }
    expect(seen[4 + 0]).toContain('Forskeyti');
    const last = seen[8];
    expect(last).toContain('cis-2-búten');
    expect(last).toContain('trans-2-búten');
    expect(last).toMatch(/ekki um tvítengi/);
    expect(ui.getByRole('img', { name: /cis-2-búten.*trans-2-búten/ })).toBeTruthy();
  });

  it('spell karbónýl as the book does', () => {
    const { container } = render(<Level3 onComplete={vi.fn()} onBack={vi.fn()} />);
    const ui = within(container);
    let text = '';
    for (let guard = 0; guard < 20; guard++) {
      text += container.textContent;
      if (ui.queryByRole('button', { name: /Byrja áskoranir/ })) break;
      fireEvent.click(ui.getByRole('button', { name: /^Næsta/ }));
    }
    expect(text).toContain('Karbónýlhópur');
    expect(text).not.toMatch(/karbonýl/i);
  });
});
