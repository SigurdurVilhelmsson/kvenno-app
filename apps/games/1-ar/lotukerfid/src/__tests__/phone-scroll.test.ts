import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  isPhoneLayout,
  revealOnPhone,
  revealScrollLeft,
  scrollTopOnPhone,
  type Span,
} from '../utils/phoneScroll';

/**
 * Below md the periodic table scrolls sideways inside its own box. When the
 * table points at cells — the highlighted elements, the correct answer — the
 * box scrolls them into view, because a desktop student sees them all at once.
 * `revealScrollLeft` decides where; these hold what it decides.
 */

/** A 46px cell in column `group` (1-based), 2px gaps, 6px box padding. */
function cell(group: number): Span {
  const left = 6 + (group - 1) * 48;
  return { left, right: left + 46 };
}

const VIEW = 316; // the box's visible width at a 360px phone
const MAX = 6 + 18 * 48 - 2 + 6 - VIEW; // content width minus the view

describe('revealScrollLeft', () => {
  it('leaves the box alone when every target is already visible', () => {
    expect(revealScrollLeft([cell(1), cell(2)], cell(1), VIEW, 0, MAX)).toBeNull();
  });

  it('does not undo the student’s own scrolling when the target is in view', () => {
    const scrolled = 300;
    expect(revealScrollLeft([cell(9)], cell(9), VIEW, scrolled, MAX)).toBeNull();
  });

  it('brings an off-screen target into view, centred', () => {
    const target = cell(10);
    const left = revealScrollLeft([target], target, VIEW, 0, MAX);
    expect(left).not.toBeNull();
    const mid = (target.left + target.right) / 2;
    expect(Math.abs(mid - (left! + VIEW / 2))).toBeLessThanOrEqual(1);
  });

  it('shows several targets together when they fit (a group down one column)', () => {
    const spans = [cell(17), cell(17), cell(17)];
    const left = revealScrollLeft(spans, spans[0], VIEW, 0, MAX)!;
    for (const s of spans) {
      expect(s.left).toBeGreaterThanOrEqual(left);
      expect(s.right).toBeLessThanOrEqual(left + VIEW);
    }
  });

  it('shows two targets in one period together when they fit', () => {
    const spans = [cell(13), cell(17)];
    const left = revealScrollLeft(spans, spans[0], VIEW, 0, MAX)!;
    expect(spans[0].left).toBeGreaterThanOrEqual(left);
    expect(spans[1].right).toBeLessThanOrEqual(left + VIEW);
  });

  it('keeps the primary target in view when the targets cannot all fit', () => {
    const primary = cell(18);
    const left = revealScrollLeft([cell(1), primary], primary, VIEW, 0, MAX)!;
    expect(primary.left).toBeGreaterThanOrEqual(left);
    expect(primary.right).toBeLessThanOrEqual(left + VIEW);
  });

  it('never scrolls outside the box', () => {
    expect(revealScrollLeft([cell(1)], cell(1), VIEW, 400, MAX)).toBe(0);
    expect(revealScrollLeft([cell(18)], cell(18), VIEW, 0, MAX)).toBe(MAX);
  });

  it('does nothing without targets or without a box', () => {
    expect(revealScrollLeft([], null, VIEW, 0, MAX)).toBeNull();
    expect(revealScrollLeft([cell(18)], cell(18), 0, 0, MAX)).toBeNull();
  });
});

describe('phone-only page scrolling', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function stubViewport(phone: boolean) {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query.includes('max-width') ? phone : false,
        media: query,
      }))
    );
  }

  it('scrolls on a phone layout', () => {
    stubViewport(true);
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const el = document.createElement('div');
    el.scrollIntoView = vi.fn();
    expect(isPhoneLayout()).toBe(true);
    scrollTopOnPhone();
    revealOnPhone(el);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0 });
    expect(el.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' });
  });

  it('leaves the desktop page exactly where it is', () => {
    stubViewport(false);
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const el = document.createElement('div');
    el.scrollIntoView = vi.fn();
    expect(isPhoneLayout()).toBe(false);
    scrollTopOnPhone();
    revealOnPhone(el);
    expect(scrollTo).not.toHaveBeenCalled();
    expect(el.scrollIntoView).not.toHaveBeenCalled();
  });
});
