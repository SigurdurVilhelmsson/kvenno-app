import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { BottomNav } from '../BottomNav';

// The bar is `position: fixed`, so on a phone it sits over whatever is last on
// the page. Both apps render it after their footer, and until September 2026
// each padded its <main> instead — which left the footer under the bar.

describe('BottomNav', () => {
  it('reserves its own space, home-indicator inset included, before the bar', () => {
    const { container } = render(<BottomNav activeTab="efnafraedi" />);
    const spacer = screen.getByTestId('bottom-nav-spacer');
    const nav = screen.getByRole('navigation', { name: 'Aðalfletting' });

    expect(container.firstElementChild).toBe(spacer);
    expect(spacer.nextElementSibling).toBe(nav);
    expect(spacer.getAttribute('aria-hidden')).toBe('true');
    // Same height as the bar's row, and the same inset the bar pads itself with.
    expect(spacer.className).toContain('h-14');
    expect(spacer.className).toContain('box-content');
    expect(nav.querySelector('.h-14')).not.toBeNull();
    const inset = 'pb-[env(safe-area-inset-bottom,0px)]';
    expect(spacer.className).toContain(inset);
    expect(nav.className).toContain(inset);
  });

  it('hides the spacer wherever the bar is not fixed', () => {
    render(<BottomNav />);
    const spacer = screen.getByTestId('bottom-nav-spacer');
    const nav = screen.getByRole('navigation', { name: 'Aðalfletting' });

    // Wider screens have no bar at all.
    expect(spacer.className).toContain('md:hidden');
    expect(nav.className).toContain('md:hidden');
    // Short landscape screens: the bar drops into the flow, so no spacer.
    expect(nav.className).toContain('[@media(max-height:500px)]:static');
    expect(spacer.className).toContain('[@media(max-height:500px)]:hidden');
  });

  it('marks only the active tab as the current page', () => {
    render(<BottomNav activeTab="home" />);

    expect(screen.getByRole('link', { name: 'Heim' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Efnafræði' }).getAttribute('aria-current')).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Íslenskubraut' }).getAttribute('aria-current')
    ).toBeNull();
  });

  it('keeps its labels at 12px or larger', () => {
    render(<BottomNav />);

    for (const name of ['Heim', 'Efnafræði', 'Íslenskubraut']) {
      const label = screen.getByText(name);
      expect(label.className).toContain('text-xs');
      expect(label.className).not.toMatch(/text-\[(?:[0-9]|1[01])px\]/);
    }
  });
});
