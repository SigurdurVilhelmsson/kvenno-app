// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { MoleculeBuilder } from '../components/MoleculeBuilder';

/**
 * Stig 1's Sameindasmiður names whatever chain the student builds, so every name and formula
 * it prints is something the game teaches. It used to print, for the same chains:
 *
 * - the formula `C₋₄H₁₀`, with a subscript minus before every carbon count;
 * - `ethan` and `octan`, from the English roots, beside Stig 1's own `etan` and `oktan`;
 * - `3-buten` for a double bond between C3 and C4, against the rule Stig 2 states ("Númeraðu
 *   keðjuna svo tvítengi/þrítengi fái lægstu tölu") — it is 1-búten;
 * - `4-metýlpentan` for a branch on C4 of five, which is 2-metýlpentan;
 * - `3-metýl1-buten`, with no hyphen between the branch prefix and the locant;
 * - and a carbon with five or six bonds, since a click cycled any bond to a triple.
 *
 * Expected names are written out here from the textbook (efnafræði 2e, ch. 20), not derived
 * from the code under test. Queries are scoped to the rendered container: the repo runs
 * vitest with retries and no RTL auto-cleanup.
 */

function renderBuilder() {
  const rendered = render(<MoleculeBuilder compact={false} maxCarbons={8} initialCarbons={4} />);
  const ui = within(rendered.container);
  const text = (selector: string) =>
    rendered.container.querySelector(selector)!.textContent!.replace(/\s+/g, ' ').trim();
  return {
    ui,
    name: () => text('.text-2xl.text-center'),
    formula: () => text('span.font-mono'),
    detail: () => text('.mt-2.text-center.text-xs'),
    // Found by symbol or by name, so the naming tests do not depend on the labelling fix
    addCarbon: () => fireEvent.click(ui.getByRole('button', { name: /^(\+|Bæta við kolefni)$/ })),
    removeCarbon: () =>
      fireEvent.click(ui.getByRole('button', { name: /^(-|Fjarlægja kolefni)$/ })),
    bond: (from: number) => ui.getByRole('button', { name: new RegExp(`^Tenging ${from}–`) }),
    addBranch: (k: number) =>
      fireEvent.click(ui.getByRole('button', { name: `Bæta við grein á C${k}` })),
  };
}

describe('Sameindasmiður: formula', () => {
  it('writes the carbon count as a plain subscript', () => {
    const b = renderBuilder();
    expect(b.formula()).toBe('C₄H₁₀');
  });
});

describe('Sameindasmiður: names use the stems the game teaches', () => {
  it('names two, three and eight carbons etan, própan and oktan', () => {
    const b = renderBuilder();
    b.removeCarbon();
    expect(b.name()).toBe('própan');
    b.removeCarbon();
    expect(b.name()).toBe('etan');
    for (let i = 0; i < 6; i++) b.addCarbon();
    expect(b.name()).toBe('oktan');
  });

  it('spells the alkyne ending -ýn and the class labels as the textbook does', () => {
    const b = renderBuilder();
    b.removeCarbon();
    b.removeCarbon();
    fireEvent.click(b.bond(1));
    expect(b.name()).toBe('eten');
    expect(b.ui.getByText('Alken')).toBeTruthy();
    fireEvent.click(b.bond(1));
    expect(b.name()).toBe('etýn');
  });
});

describe('Sameindasmiður: numbering gives the lowest locants', () => {
  it('numbers a double bond from the nearer end, and says which end', () => {
    const b = renderBuilder();
    fireEvent.click(b.bond(3));
    expect(b.name()).toBe('1-búten');
    expect(b.detail()).toBe('Tvítengi á stað 1 (talið frá C4)');
  });

  it('leaves a symmetric chain numbered from C1', () => {
    const b = renderBuilder();
    fireEvent.click(b.bond(2));
    expect(b.name()).toBe('2-búten');
    expect(b.detail()).toBe('Tvítengi á stað 2');
  });

  it('gives a branch the lower of its two locants', () => {
    const b = renderBuilder();
    b.addCarbon();
    b.addBranch(4);
    expect(b.name()).toBe('2-metýlpentan');
  });

  it('numbers for the multiple bond first and sets the locant off with a hyphen', () => {
    const b = renderBuilder();
    // Double bond at C3=C4 and a branch on C2: counted from C4 the bond is 1 and the branch 3
    fireEvent.click(b.bond(3));
    b.addBranch(2);
    expect(b.name()).toBe('3-metýl-1-búten');
    expect(b.formula()).toBe('C₅H₁₀');
  });
});

describe('Sameindasmiður: no carbon gets a fifth bond', () => {
  it('skips a bond type that would overfill a carbon, and offers no branch there', () => {
    const b = renderBuilder();
    b.removeCarbon();
    fireEvent.click(b.bond(1));
    fireEvent.click(b.bond(1));
    // Matched with or without accents, so this test fails for the valence defect alone
    expect(b.name()).toMatch(/^pr[oó]p[yý]n$/);
    expect(b.formula()).toMatch(/^C₋?₃H₄$/);

    // C2 already has four bonds (three to C1, one to C3): C2–C3 can only stay single
    fireEvent.click(b.bond(2));
    expect(b.bond(2).getAttribute('aria-label')).toMatch(/einföld/);
    expect(b.formula()).toBe('C₃H₄');
    expect(b.ui.queryByRole('button', { name: 'Bæta við grein á C2' })).toBeNull();
  });

  it('still lets a double bond sit beside a single one and a branch', () => {
    const b = renderBuilder();
    b.addBranch(2);
    fireEvent.click(b.bond(1));
    expect(b.name()).toBe('2-metýl-1-búten');
    expect(b.formula()).toBe('C₅H₁₀');
    // A triple bond would give C2 five bonds, so the next click returns it to single
    fireEvent.click(b.bond(1));
    expect(b.name()).toBe('2-metýlbútan');
  });
});

describe('Sameindasmiður: the carbon-count buttons say what they do', () => {
  it('names the add and remove buttons', () => {
    const b = renderBuilder();
    expect(b.ui.getByRole('button', { name: 'Bæta við kolefni' })).toBeTruthy();
    expect(b.ui.getByRole('button', { name: 'Fjarlægja kolefni' })).toBeTruthy();
  });
});
