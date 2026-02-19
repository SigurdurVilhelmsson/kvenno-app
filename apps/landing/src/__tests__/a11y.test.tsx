// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

expect.extend(toHaveNoViolations);

// ---------------------------------------------------------------------------
// Mock shared components (same pattern as existing App.test.tsx)
// ---------------------------------------------------------------------------
vi.mock('@kvenno/shared/components', () => ({
  Header: () => (
    <header data-testid="header">
      <a href="/">Námsvefur Kvennó</a>
      <nav>
        <a href="/kennarar">Kennarar</a>
        <a href="/upplysingar">Upplýsingar</a>
      </nav>
    </header>
  ),
  Footer: () => (
    <footer data-testid="footer">
      <p>&copy; 2026 Kvennaskólinn</p>
    </footer>
  ),
  Breadcrumbs: ({ items }: { items: { label: string; href?: string }[] }) => (
    <nav aria-label="Brauðmolar" data-testid="breadcrumbs">
      <ol>
        {items.map((item, i) => (
          <li key={i}>
            {item.href ? <a href={item.href}>{item.label}</a> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  ),
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------
import { App } from '../App';
import { ChemistryHub } from '../pages/ChemistryHub';
import { Home } from '../pages/Home';
import { YearHub } from '../pages/YearHub';

function renderWithRouter(ui: React.ReactElement, initialEntries: string[] = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Landing page - track selector grid accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = renderWithRouter(<Home />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('track cards are interactive link elements', () => {
    renderWithRouter(<Home />);

    // Track cards render as <a> (Link) or <a> (external) — both are links
    const links = screen.getAllByRole('link');
    const trackLinks = links.filter(
      (a) =>
        a.textContent?.includes('Efnafræði') ||
        a.textContent?.includes('Íslenskubraut'),
    );

    expect(trackLinks.length).toBeGreaterThanOrEqual(2);

    // Each track link should have meaningful text content (accessible name)
    for (const link of trackLinks) {
      expect(link.textContent!.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('Landing page - Chemistry hub accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = renderWithRouter(<ChemistryHub />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Landing page - Year hub accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = renderWithRouter(<YearHub year="1-ar" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Landing page - landmark elements', () => {
  it('all pages use proper landmark elements (header, main, footer)', () => {
    const { container } = renderWithRouter(<App />, ['/']);

    // Shared Header renders <header>
    const header = container.querySelector('header');
    expect(header).not.toBeNull();

    // App wraps content in <main id="main-content">
    const main = container.querySelector('main');
    expect(main).not.toBeNull();

    // Shared Footer renders <footer>
    const footer = container.querySelector('footer');
    expect(footer).not.toBeNull();
  });
});
