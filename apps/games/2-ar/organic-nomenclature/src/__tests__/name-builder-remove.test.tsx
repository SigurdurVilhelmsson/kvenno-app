// @vitest-environment jsdom
import { fireEvent, render, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { Level2 } from '../components/Level2';

/**
 * Stig 2's name builder mirrors the shared DragDropBuilder's zones in its own `zoneState`,
 * which is what the "Nafnið sem þú byggir" preview and the grader both read. It used to
 * update that mirror only on a drop, so a part taken back out — dragged or tapped back to
 * the pool — stayed in the built name: returning `-en` from prop- + -en still showed and
 * graded "propen". Phones made this the common case, because tap-to-place (tap the part, tap
 * the pool) is how a student undoes a choice there.
 *
 * The builder is driven with clicks, which is the tap-to-place path the shared component
 * gives every input method. Queries are scoped to the rendered container: the repo runs
 * vitest with retries and no RTL auto-cleanup.
 */

function openNameBuilder() {
  const rendered = render(<Level2 onComplete={vi.fn()} onBack={vi.fn()} />);
  const ui = within(rendered.container);
  fireEvent.click(ui.getByRole('button', { name: /Nefna sameindir/ }));

  const zone = (id: string) =>
    rendered.container.querySelector(`[data-zone-id="${id}"]`) as HTMLElement;
  const pool = rendered.container.querySelector('[data-drop-pool]') as HTMLElement;
  const place = (label: string, zoneId: string) => {
    fireEvent.click(within(pool).getByRole('button', { name: label }));
    fireEvent.click(zone(zoneId));
  };
  const builtName = () =>
    ui.getByText('Nafnið sem þú byggir:').nextElementSibling!.textContent!.trim();

  return { ui, zone, pool, place, builtName };
}

describe('Stig 2 name builder: a part taken back out leaves the built name', () => {
  it('drops a suffix returned to the pool from the preview', () => {
    const { zone, pool, place, builtName } = openNameBuilder();

    place('prop-', 'zone-prefix');
    place('-en', 'zone-suffix');
    expect(builtName()).toBe('propen');

    // Tap the placed part, then the pool: the tap-to-place way to take it back.
    fireEvent.click(within(zone('zone-suffix')).getByRole('button', { name: '-en' }));
    fireEvent.click(pool);

    expect(within(pool).getByRole('button', { name: '-en' })).toBeTruthy();
    expect(builtName()).toBe('prop');
  });

  it('grades what is on screen, not a part that was removed', () => {
    const { ui, zone, pool, place } = openNameBuilder();

    // Build a name, then take the prefix back out before checking.
    place('prop-', 'zone-prefix');
    place('-an', 'zone-suffix');
    fireEvent.click(within(zone('zone-prefix')).getByRole('button', { name: 'prop-' }));
    fireEvent.click(pool);

    fireEvent.click(ui.getByRole('button', { name: 'Athuga svar' }));

    expect(ui.getByText(/Þú skrifaðir "an"/)).toBeTruthy();
  });

  it('keeps the swapped-in part when a full zone is replaced', () => {
    const { zone, place, builtName } = openNameBuilder();

    place('prop-', 'zone-prefix');
    place('-en', 'zone-suffix');
    // Placing into a full single-part zone swaps: the old part returns to the pool
    // (onRemove) and the new one lands (onDrop) — the mirror must end on the new one.
    place('-an', 'zone-suffix');

    expect(within(zone('zone-suffix')).getByRole('button', { name: '-an' })).toBeTruthy();
    expect(builtName()).toBe('propan');
  });
});
