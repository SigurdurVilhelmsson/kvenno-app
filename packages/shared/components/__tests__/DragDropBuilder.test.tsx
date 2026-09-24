import { render, screen, fireEvent, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, vi } from 'vitest';

import { DragDropBuilder, DropZone } from '../DragDropBuilder';
import type { DraggableItemData, DropZoneData } from '../DragDropBuilder';

// HTML5 drag-and-drop never fires on a phone, so every placement must also be reachable by
// tapping: tap an item to pick it up, tap a zone to put it there. These tests drive that path
// (and its keyboard twin) through the real component, plus the touch-tap detection itself.

const items: DraggableItemData[] = [
  { id: 'meth', content: 'meth-', category: 'prefix' },
  { id: 'eth', content: 'eth-', category: 'prefix' },
  { id: 'an', content: '-an', category: 'suffix' },
];

const zones: DropZoneData[] = [
  { id: 'prefix', label: 'Forskeyti', maxItems: 1, acceptedCategories: ['prefix'] },
  { id: 'suffix', label: 'Viðskeyti', maxItems: 1, acceptedCategories: ['suffix'] },
];

function setup(props: Partial<React.ComponentProps<typeof DragDropBuilder>> = {}) {
  const onDrop = vi.fn();
  const onRemove = vi.fn();
  const utils = render(
    <DragDropBuilder items={items} zones={zones} onDrop={onDrop} onRemove={onRemove} {...props} />
  );
  const zone = (id: string) =>
    utils.container.querySelector(`[data-zone-id="${id}"]`) as HTMLElement;
  const pool = utils.container.querySelector('[data-drop-pool]') as HTMLElement;
  const item = (text: string) => screen.getByRole('button', { name: text });
  return { ...utils, onDrop, onRemove, zone, pool, item };
}

expect.extend(toHaveNoViolations);

describe('DragDropBuilder tap-to-place', () => {
  it('has no axe violations, idle or with an item picked up', async () => {
    const { container, item } = setup();
    expect(await axe(container)).toHaveNoViolations();
    fireEvent.click(item('eth-'));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('places a tapped item in the tapped zone through the same onDrop as a drag', () => {
    const { item, zone, onDrop } = setup();

    fireEvent.click(item('eth-'));
    expect(item('eth-').getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(zone('prefix'));

    expect(onDrop).toHaveBeenCalledWith({
      itemId: 'eth',
      zoneId: 'prefix',
      fromZoneId: undefined,
      index: 0,
    });
    expect(within(zone('prefix')).getByRole('button', { name: 'eth-' })).toBeTruthy();
    expect(item('eth-').getAttribute('aria-pressed')).toBe('false');
  });

  it('only offers zones that accept the picked-up item', () => {
    const { item, zone, onDrop } = setup();

    fireEvent.click(item('-an'));
    // Accepting zones become focusable targets; the rest do not.
    expect(zone('suffix').getAttribute('tabindex')).toBe('0');
    expect(zone('prefix').getAttribute('tabindex')).toBeNull();

    fireEvent.click(zone('prefix'));
    expect(onDrop).not.toHaveBeenCalled();
    expect(item('-an').getAttribute('aria-pressed')).toBe('true');
  });

  it('swaps into a full single-item zone and returns the old item to the pool', () => {
    const { item, zone, pool, onDrop, onRemove } = setup();

    fireEvent.click(item('meth-'));
    fireEvent.click(zone('prefix'));
    fireEvent.click(item('eth-'));
    // Tapping the occupant is how a student taps a full zone.
    fireEvent.click(within(zone('prefix')).getByRole('button', { name: 'meth-' }));

    expect(onRemove).toHaveBeenCalledWith('meth', 'prefix');
    expect(onDrop).toHaveBeenLastCalledWith(
      expect.objectContaining({ itemId: 'eth', zoneId: 'prefix' })
    );
    expect(within(zone('prefix')).getByRole('button', { name: 'eth-' })).toBeTruthy();
    expect(within(pool).getByRole('button', { name: 'meth-' })).toBeTruthy();
  });

  it('takes a placed item back when it is picked up and the pool is tapped', () => {
    const { item, zone, pool, onRemove } = setup();

    fireEvent.click(item('-an'));
    fireEvent.click(zone('suffix'));
    fireEvent.click(within(zone('suffix')).getByRole('button', { name: '-an' }));
    expect(
      screen.getByText('Veldu annan reit, eða smelltu hér til að skila atriðinu')
    ).toBeTruthy();

    fireEvent.click(pool);

    expect(onRemove).toHaveBeenCalledWith('an', 'suffix');
    expect(within(pool).getByRole('button', { name: '-an' })).toBeTruthy();
  });

  it('works from the keyboard: Enter picks up, Enter on a zone places, Escape cancels', () => {
    const { item, zone, onDrop } = setup();

    fireEvent.keyDown(item('meth-'), { key: 'Enter' });
    expect(item('meth-').getAttribute('aria-pressed')).toBe('true');
    fireEvent.keyDown(item('meth-'), { key: 'Escape' });
    expect(item('meth-').getAttribute('aria-pressed')).toBe('false');

    fireEvent.keyDown(item('meth-'), { key: ' ' });
    fireEvent.keyDown(zone('prefix'), { key: 'Enter' });
    expect(onDrop).toHaveBeenCalledWith(expect.objectContaining({ itemId: 'meth' }));
  });

  it('treats a touch without movement as a tap, not a drag', () => {
    const { item } = setup();
    const el = item('eth-');

    fireEvent.touchStart(el, { touches: [{ clientX: 10, clientY: 10 }] });
    const notPrevented = fireEvent.touchEnd(el, { changedTouches: [{ clientX: 10, clientY: 10 }] });

    expect(el.getAttribute('aria-pressed')).toBe('true');
    // The emulated click that follows a tap is suppressed, or it would toggle straight back.
    expect(notPrevented).toBe(false);
  });

  it('reports an item dragged back to the pool with onRemove', () => {
    const { item, zone, pool, onRemove } = setup();

    fireEvent.click(item('-an'));
    fireEvent.click(zone('suffix'));
    fireEvent.drop(pool, { dataTransfer: { getData: () => 'an' } });

    expect(onRemove).toHaveBeenCalledWith('an', 'suffix');
  });

  it('does nothing when disabled', () => {
    const { item, zone, onDrop } = setup({ disabled: true });

    fireEvent.click(item('eth-'));
    fireEvent.click(zone('prefix'));

    expect(onDrop).not.toHaveBeenCalled();
    expect(item('eth-').getAttribute('aria-pressed')).toBe('false');
  });

  it('keeps placed items in place when disabled, even if dropped on the pool', () => {
    const { pool, onRemove } = setup({ disabled: true, initialState: { suffix: ['an'] } });

    fireEvent.drop(pool, { dataTransfer: { getData: () => 'an' } });

    expect(onRemove).not.toHaveBeenCalled();
    expect(within(pool).queryByRole('button', { name: '-an' })).toBeNull();
  });

  it('does not dim the zone holding the picked-up item', () => {
    const { item, zone } = setup();

    fireEvent.click(item('-an'));
    fireEvent.click(zone('suffix'));
    fireEvent.click(within(zone('suffix')).getByRole('button', { name: '-an' }));

    expect(zone('suffix').className).not.toContain('opacity-60');
    // A zone the item cannot go to is still dimmed.
    expect(zone('prefix').className).toContain('opacity-60');
  });
});

describe('DropZone drag-over feedback', () => {
  const zoneData: DropZoneData = { id: 'prefix', label: 'Forskeyti', maxItems: 1 };

  it('lights up a full single-item zone under a drag, since dropping there swaps', () => {
    const { container } = render(<DropZone zone={zoneData} items={[items[0]]} isOver canDrop />);
    const el = container.querySelector('[data-zone-id]') as HTMLElement;

    expect(el.className).toContain('border-blue-400');
    expect(el.className).not.toContain('border-amber-300');
  });

  it('still marks a full multi-item zone as full rather than as a target', () => {
    const { container } = render(
      <DropZone zone={{ ...zoneData, maxItems: 2 }} items={[items[0], items[1]]} isOver canDrop />
    );
    const el = container.querySelector('[data-zone-id]') as HTMLElement;

    expect(el.className).not.toContain('border-blue-400');
    expect(el.className).toContain('border-amber-300');
  });
});
