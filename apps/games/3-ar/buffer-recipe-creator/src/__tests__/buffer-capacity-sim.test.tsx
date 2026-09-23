// @vitest-environment jsdom
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BufferCapacityVisualization } from '../components/BufferCapacityVisualization';

/**
 * The acid/base addition simulator and its buffer-versus-water comparison.
 *
 * **Why this exists.** Until 2026-09-23 the simulator got the chemistry it
 * exists to show wrong in three ways, and a student saw all three on the first
 * screen of Stig 1:
 * - Pure water given 0,01 M strong acid read pH 5,00, not 2,00: the amounts are
 *   in M, and the water pH divided them by 1000 as if they were mmol.
 * - The buffer's ΔpH in the comparison was measured from 7, not from where the
 *   buffer started, so an acetate buffer that moved 0,18 read 2,44 — a larger
 *   change than the water's, under a tip saying the buffer changes less.
 * - Adding base took the amount off the acid total as well as adding it to the
 *   base total, so 0,05 M acid then 0,01 M base counted as 0,03 M net acid, and
 *   "Bætt við" showed 0,040 for acid the student had added 0,05 of.
 * The comparison also stayed empty until something was added, under a toggle
 * that already read "Fela samanburð".
 */

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** A 0,05 M : 0,05 M acetate buffer, pKa 4,74 — Stig 1's opening mixture. */
function setup(acidConc = 0.05, baseConc = 0.05) {
  const { container } = render(
    <BufferCapacityVisualization
      pKa={4.74}
      acidConc={acidConc}
      baseConc={baseConc}
      totalConc={acidConc + baseConc}
    />
  );
  const tap = (name: string) => fireEvent.click(within(container).getByRole('button', { name }));
  /** The value printed under a small label, e.g. "Núverandi pH". */
  const readout = (label: string | RegExp) =>
    within(container).getByText(label).nextElementSibling?.textContent;
  const comparison = () =>
    within(container).queryByText(/Samanburður/)?.parentElement?.textContent ?? null;
  return { container, tap, readout, comparison };
}

describe('the addition simulator', () => {
  it('keeps a running total of each addition and neutralises them once', () => {
    const { container, tap, readout } = setup();
    tap('Bæta við 0,05 M sterkri sýru');
    tap('Bæta við 0,01 M sterkum basa');
    const added = within(container)
      .getAllByText(/Bætt við:/)
      .map((el) => el.textContent);
    expect(added).toEqual(['Bætt við: 0,050 M', 'Bætt við: 0,010 M']);
    // Net 0,04 M strong acid: HA 0,05 + 0,04, A⁻ 0,05 − 0,04.
    expect(readout('Núverandi pH')).toBe(
      (4.74 + Math.log10(0.01 / 0.09)).toFixed(2).replace('.', ',')
    );
  });

  it('starts with no change, even for a mixture missing one component', () => {
    const { readout } = setup(0.05, 0);
    expect(readout(/^Upphafs.pH$/)).toBe(readout('Núverandi pH'));
    expect(readout('ΔpH')).toBe('0,00');
  });
});

describe('the buffer-versus-water comparison', () => {
  it('opens when asked, before anything is added, and makes no claim yet', () => {
    const { tap, comparison } = setup();
    tap('▶ Sýna samanburð við vatn');
    const text = comparison();
    expect(text).toContain('pH 4,74');
    expect(text).toContain('pH 7,00');
    expect(text).not.toContain('Stuðpúðinn verndar pH');
  });

  it('shows 0,01 M strong acid taking water to pH 2 and the buffer barely moving', () => {
    const { tap, comparison } = setup();
    tap('Bæta við 0,01 M sterkri sýru');
    tap('▶ Sýna samanburð við vatn');
    const text = comparison() ?? '';
    // Buffer: 4,74 + log(0,04 / 0,06) = 4,56, a change of 0,18 from where it started.
    expect(text).toContain('pH 4,56');
    expect(text).toContain('ΔpH = 0,18');
    // Water: [H⁺] = 0,01 M.
    expect(text).toContain('pH 2,00');
    expect(text).toContain('ΔpH = 5,00');
    expect(text).toContain('Stuðpúðinn verndar pH');
  });

  it('makes no claim when the additions cancel and neither solution has moved', () => {
    // 0,01 M acid then 0,01 M base: water is back at 7,00 and the buffer at its start, so
    // "minni breyting en í vatni" would be false — both changes are 0,00.
    const { tap, comparison } = setup();
    tap('Bæta við 0,01 M sterkri sýru');
    tap('Bæta við 0,01 M sterkum basa');
    tap('▶ Sýna samanburð við vatn');
    const text = comparison() ?? '';
    expect(text).toContain('pH 7,00');
    expect(text.match(/ΔpH = 0,00/g)).toHaveLength(2);
    expect(text).not.toContain('Stuðpúðinn verndar pH');
  });
});

describe('the simulator heading', () => {
  it('is Icelandic only', () => {
    const { container } = setup();
    expect(container.querySelector('h3')?.textContent?.trim()).toMatch(/Stuðpúðageta$/);
  });
});
