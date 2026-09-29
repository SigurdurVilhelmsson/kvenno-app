import { fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clockPastNextGuard } from './next-guard-clock';
import { AefaScreen } from '../components/AefaScreen';
import { SOLUBILITY_RULES, type SolubilityRule } from '../data/ions';
import { DRILL_ITEMS } from '../data/problems';
import { decidingRules, type Salt } from '../engine/precipitation';

clockPastNextGuard();

/**
 * Æfa asks "Hvaða regla ræður því?" and graded exactly one rule right — the one
 * the engine checks first. For a group-1 salt that is the cation row, so a
 * student who read the anion of NaNO₃ and chose "Öll nítröt (NO₃⁻) eru
 * leysanleg." was told "Rétt svar, en það er önnur regla sem ræður því" — a
 * false statement, since that row settles NaNO₃ outright, with no exception.
 * The same held for KCl and the halide row, and NaF and the fluoride row.
 *
 * The fix accepts every row whose own statement settles the compound: it covers
 * one of the two ions and the other ion is not among its exceptions. The row the
 * engine cites is always accepted, including when an exception decides it
 * (BaSO₄ and the sulfate row) — that is unchanged.
 *
 * Deliberately **not** widened: an anion row that reaches the right verdict only
 * through its exception clause while the cation row settles it directly — the
 * carbonate row for Na₂CO₃, say. Whether that counts is a teaching call, and it
 * is reported rather than decided here.
 */

const covers = (rule: SolubilityRule, formula: string) =>
  rule.ion === formula || rule.alsoCovers.includes(formula);

/** Read off the table: rows whose own printed statement is true of this salt. */
function rowsStatingIt(salt: Salt): SolubilityRule[] {
  return SOLUBILITY_RULES.filter(
    (r) =>
      (covers(r, salt.cation.formula) && !r.exceptions.includes(salt.anion.formula)) ||
      (covers(r, salt.anion.formula) && !r.exceptions.includes(salt.cation.formula))
  );
}

describe('decidingRules', () => {
  it('always includes the rule the engine cites, first', () => {
    for (const item of DRILL_ITEMS) {
      expect(decidingRules(item.salt)[0].id, item.id).toBe(item.verdict.rule.id);
    }
  });

  it('includes every row whose own statement settles the compound', () => {
    for (const item of DRILL_ITEMS) {
      const ids = decidingRules(item.salt).map((r) => r.id);
      for (const r of rowsStatingIt(item.salt)) {
        expect(ids, `${item.salt.formula}: ${r.text}`).toContain(r.id);
      }
    }
  });

  it('never accepts a row that would give the wrong verdict', () => {
    for (const item of DRILL_ITEMS) {
      for (const r of decidingRules(item.salt)) {
        const byException =
          r.exceptions.includes(item.salt.cation.formula) ||
          r.exceptions.includes(item.salt.anion.formula);
        const says = byException ? !r.soluble : r.soluble;
        expect(says, `${item.salt.formula}: ${r.text}`).toBe(item.verdict.soluble);
      }
    }
  });

  it('accepts both rows for the three salts two rows settle outright', () => {
    const idsFor = (formula: string) =>
      decidingRules(DRILL_ITEMS.find((d) => d.salt.formula === formula)!.salt).map((r) => r.id);
    expect(idsFor('NaNO₃')).toEqual(['flokkur1', 'nitrot']);
    expect(idsFor('KCl')).toEqual(['flokkur1', 'halid']);
    expect(idsFor('NaF')).toEqual(['flokkur1', 'fluorid']);
    // Unchanged, and reported as a decision rather than taken here.
    expect(idsFor('Na₂CO₃')).toEqual(['flokkur1']);
  });
});

describe('Æfa grades every rule that settles the compound as right', () => {
  beforeEach(() => {
    window.scrollBy = vi.fn() as unknown as typeof window.scrollBy;
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('marks the other applicable rule "Rétt — bæði svarið og reglan."', () => {
    // A random() just under 1 makes every shuffle the identity, so the run is
    // the seven exceptions followed by the first three general items, which
    // include NaNO₃ and KCl. The test reads each compound off the screen rather
    // than trusting that order, and fails if no alternate rule was exercised.
    vi.spyOn(Math, 'random').mockReturnValue(0.999999);
    const { container, unmount } = render(<AefaScreen onComplete={() => {}} onBack={() => {}} />);
    const ui = within(container);
    let alternatesTried = 0;

    for (;;) {
      const formula = container.querySelector('p.text-3xl')!.textContent!;
      const item = DRILL_ITEMS.find((d) => d.salt.formula === formula)!;
      const alternate = rowsStatingIt(item.salt).find((r) => r.id !== item.verdict.rule.id);
      const rule = alternate ?? item.verdict.rule;
      if (alternate) alternatesTried++;

      fireEvent.click(
        ui.getByRole('button', { name: item.verdict.soluble ? 'Leysanlegt' : 'Óleysanlegt' })
      );
      fireEvent.click(ui.getByRole('button', { name: rule.text }));
      fireEvent.click(ui.getByRole('button', { name: 'Athuga' }));
      expect(
        ui.getByText(/^Rétt/).textContent,
        `${formula} with "${rule.text}" was marked as the wrong rule`
      ).toBe('Rétt — bæði svarið og reglan.');

      const next = ui.queryByRole('button', { name: 'Næsta' });
      if (!next) break;
      fireEvent.click(next);
    }

    expect(alternatesTried, 'the run exercised no second applicable rule').toBeGreaterThan(0);
    unmount();
  }, 30_000);
});
