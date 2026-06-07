/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { useEscapeKey } from '../useEscapeKey';

function pressKey(key: string) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key }));
}

describe('useEscapeKey', () => {
  it('invokes the callback when Escape is pressed', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(onEscape));

    pressKey('Escape');

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('ignores other keys', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(onEscape));

    pressKey('Enter');
    pressKey('a');
    pressKey(' ');

    expect(onEscape).not.toHaveBeenCalled();
  });

  it('does not bind a listener when enabled is false', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(onEscape, false));

    pressKey('Escape');

    expect(onEscape).not.toHaveBeenCalled();
  });

  it('removes its listener on unmount', () => {
    const onEscape = vi.fn();
    const { unmount } = renderHook(() => useEscapeKey(onEscape));

    unmount();
    pressKey('Escape');

    expect(onEscape).not.toHaveBeenCalled();
  });

  it('rebinds when enabled toggles from false to true', () => {
    const onEscape = vi.fn();
    const { rerender } = renderHook(({ enabled }) => useEscapeKey(onEscape, enabled), {
      initialProps: { enabled: false },
    });

    pressKey('Escape');
    expect(onEscape).not.toHaveBeenCalled();

    rerender({ enabled: true });
    pressKey('Escape');
    expect(onEscape).toHaveBeenCalledTimes(1);
  });
});
