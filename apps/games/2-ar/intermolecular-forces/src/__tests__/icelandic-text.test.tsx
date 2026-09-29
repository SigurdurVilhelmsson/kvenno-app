// @vitest-environment jsdom
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { ForceStrengthAnimation } from '../components/ForceStrengthAnimation';
import { Level1 } from '../components/Level1';
import { Level2 } from '../components/Level2';

/**
 * Text defects this game shipped, each fixed and held here.
 *
 * - Numbers a student reads printed with a decimal point: HCl's molar mass as 36.5 and the
 *   London energy range as 0.05 - 40. The platform prints the Icelandic decimal comma.
 * - English under the Icelandic: every force carried an English subtitle ('London Dispersion
 *   Forces', 'Dipole-Dipole Forces', 'Hydrogen Bonding').
 * - Words the glossary (packages/shared/i18n/ordabok.md) and the textbook settle otherwise:
 *   dipole is `tvískaut` (the book: 180 to 2; the game said `tvípól` throughout), a chemical
 *   bond is `tengi` not `tengsl`, hydrogen bond `vetnistengi`, polarizability
 *   `skautunarhæfni`, density `eðlismassi`, ionic compound `jónaefni`, and a solvent is the
 *   masculine `leysir`, so a polar one is `skautaður leysir`.
 * - Misspellings and broken agreement, among them `skauttaðra`, `rafneikvæmni`,
 *   `Vatnsameind`, `Ísobútan`, `Óeðlilegar eiginleikar` and `Flókin samanburður`, and later
 *   `kúlulag` for spherical and `báðar` over a neuter and a masculine noun.
 * - A title calling water an oil ('Hvaða olía er seigust?' over water, vegetable oil and
 *   petrol), and the undefined English acronym LDF.
 *
 * The source scan skips this folder, so the patterns below may name what they ban. Rendered
 * queries are scoped to their container because the repo runs vitest with `retry: 2` and no
 * RTL auto-cleanup.
 */

const SRC = join(__dirname, '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sourceFiles(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

const BANNED: [RegExp, string][] = [
  [/tvípól/i, 'dipole is tvískaut'],
  [/vetnistengsl/i, 'hydrogen bond is vetnistengi'],
  [/tengisl/i, 'not a word; a bond is tengi'],
  [/[A-Z][a-z]?[-=][A-Z][a-z]?\s+tengsl/, 'a chemical bond is tengi, not tengsl'],
  [/skautuð tengsl/i, 'a chemical bond is tengi, not tengsl'],
  [/dreifistuðul/i, 'polarizability is skautunarhæfni'],
  [/þéttleik/i, 'density is eðlismassi'],
  [/Jónabindingarefni/i, 'ionic compound is jónaefni'],
  [/(?:Skautað|Óskautað|lífræn) leysi\b/i, 'a solvent is the masculine leysir'],
  [/skautt/i, 'skautaður has one t'],
  [/rafneikvæmni/i, 'electronegativity is rafneikvæðni'],
  [/Vatnsameind/i, 'vatnssameind takes the genitive s'],
  [/Ísobútan/, 'Ísóbútan'],
  [/Glyceról/, 'Glýseról, and it is a name, not a formula'],
  [/Óeðlilegar eiginleikar/, 'eiginleiki is masculine: Óeðlilegir'],
  [/Flókin samanburður/, 'samanburður is masculine: Flókinn'],
  [/Heildar stig/, 'one word: Heildarstig'],
  [/skautaðrar sameindum/, 'dative plural: skautuðum sameindum'],
  [/krefst H bundið/, 'krefjast takes the genitive: krefst þess að H sé bundið'],
  [/Sama mólmassi/, 'mólmassi is masculine: Sami'],
  [/annarar\b/, 'annarrar'],
  [/\bgekki\b/i, 'the gecko is gekkó'],
  [/þess vegna flýtur olía/, 'oil floats because it is less dense, not because it is insoluble'],
  [/óskautuð tvíatóma sameindir/, 'sameindir is feminine plural: óskautaðar'],
  [/hafa báðar sömu/, 'etanól and dímetýleter differ in gender: bæði'],
  [/O-H myndast sterk/, 'the bond forms them: O-H myndar sterk vetnistengi'],
  [/kúlulag\b/i, 'spherical is kúlulaga'],
  [/Hvaða olía er seigust/, 'water is one of the three, and it is not an oil'],
  [/\bLDF\b/, 'an English acronym the game never defines'],
];

// Næsta ignores a press within 400 ms of appearing; these tests press it at once.
clockPastNextGuard();

describe('source text', () => {
  const files = sourceFiles(SRC);

  it('finds the source files', () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it.each(BANNED)('contains no %s', (pattern, why) => {
    const hits = files.flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .map((line, i) => ({ line, at: `${file.slice(SRC.length + 1)}:${i + 1}` }))
        .filter(({ line }) => pattern.test(line))
        .map(({ at, line }) => `${at}: ${line.trim()}`)
    );
    expect(hits, why).toEqual([]);
  });
});

/** Any number a student reads with a decimal point: a digit, a dot, a digit. */
const DECIMAL_POINT = /\d\.\d/;

/** What a student can read: the text, without the CSS inside the drawings' <style> blocks. */
function visibleText(container: HTMLElement): string {
  const copy = container.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('style').forEach((el) => el.remove());
  return copy.textContent ?? '';
}

describe('rendered text', () => {
  it('Stig 1 prints molar masses with a decimal comma and no English names', () => {
    const { container } = render(<Level1 onComplete={vi.fn()} onBack={vi.fn()} />);
    const view = within(container);
    expect(container.textContent).not.toMatch(/Forces|Dispersion|Dipole|Bonding|Hydrogen/);

    fireEvent.click(view.getByRole('button', { name: /Hefja æfingar/ }));
    // The third molecule is HCl, 36,5 g/mol.
    for (let i = 0; i < 2; i++) {
      fireEvent.click(view.getByRole('button', { name: /Veikastur$/ }));
      fireEvent.click(view.getByRole('button', { name: 'Athuga svar' }));
      fireEvent.click(view.getByRole('button', { name: 'Næsta sameind' }));
    }
    expect(container.querySelector('.text-4xl')!.textContent).toBe('HCl');
    expect(container.textContent).toContain('M = 36,5 g/mól');
    expect(visibleText(container)).not.toMatch(DECIMAL_POINT);
    expect(container.textContent).not.toMatch(/Forces|Dispersion|Dipole|Bonding|Hydrogen/);
  });

  it('Stig 2 prints molar masses with a decimal comma', () => {
    const { container } = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
    // Problem 1 includes HCl.
    expect(container.textContent).toContain('M = 36,5');
    expect(container.textContent).toContain('36,5 g/mól');
    expect(visibleText(container)).not.toMatch(DECIMAL_POINT);
  });

  it('the force panel prints its energy ranges with a decimal comma and in Icelandic', () => {
    const { container } = render(<ForceStrengthAnimation animate={false} />);
    const view = within(container);
    for (const force of ['London', 'Tvískauts-tvískauts', 'Vetnistengi']) {
      fireEvent.click(view.getByRole('button', { name: new RegExp(`${force}$`) }));
      if (force === 'London') expect(container.textContent).toContain('0,05 - 40 kJ/mól');
      expect(visibleText(container)).not.toMatch(DECIMAL_POINT);
      expect(container.textContent).not.toMatch(/Dispersion|Dipole|Hydrogen/);
    }
    fireEvent.click(view.getByRole('button', { name: 'Bera saman' }));
    expect(visibleText(container)).not.toMatch(DECIMAL_POINT);
  });
});
