// @vitest-environment jsdom
import { useRef } from 'react';

import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { useRevealWhenShown } from '../hooks/useRevealWhenShown';

/**
 * After an answer, each level swaps its controls for the feedback in place. On a phone that
 * can leave the verdict off screen (Stig 2's drag mode collapses the pool above it; a short
 * landscape screen lets scroll anchoring push it up past the top), so the hook scrolls it
 * into view — and must leave the page alone when the verdict is already visible, which is
 * every desktop layout.
 */

function Probe({ shown, top }: { shown: boolean; top: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useRevealWhenShown(ref, shown);
  return (
    <div
      ref={(el) => {
        ref.current = el;
        if (el) {
          el.getBoundingClientRect = () => ({ top }) as DOMRect;
          el.scrollIntoView = scrollSpy;
        }
      }}
    />
  );
}

const scrollSpy = vi.fn();

describe('useRevealWhenShown', () => {
  it('scrolls a verdict that sits above the viewport into view', () => {
    scrollSpy.mockClear();
    render(<Probe shown top={-120} />);
    expect(scrollSpy).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' });
  });

  it('scrolls a verdict that would start at the very bottom of the screen', () => {
    scrollSpy.mockClear();
    render(<Probe shown top={window.innerHeight - 40} />);
    expect(scrollSpy).toHaveBeenCalledTimes(1);
  });

  it('leaves a verdict that is already on screen where it is', () => {
    scrollSpy.mockClear();
    render(<Probe shown top={200} />);
    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it('does nothing while the feedback is not shown', () => {
    scrollSpy.mockClear();
    render(<Probe shown={false} top={-500} />);
    expect(scrollSpy).not.toHaveBeenCalled();
  });
});
