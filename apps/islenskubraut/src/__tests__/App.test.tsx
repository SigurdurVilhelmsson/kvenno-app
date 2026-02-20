// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

import { App } from '../App';
import { categories, getCategoryById } from '../data';
import { Home } from '../pages/Home';

// Mock shared components to avoid pulling in heavy dependency chains (react-three/fiber)
vi.mock('@kvenno/shared/components', () => ({
  Header: ({ subtitle }: { variant?: string; title?: string; subtitle?: string }) => (
    <header data-testid="header">
      <span>Íslenskubraut</span>
      {subtitle && <span>{subtitle}</span>}
      <nav><a href="/">Allir flokkar</a><a href="/">Námsvefur Kvennó</a></nav>
    </header>
  ),
  Footer: ({ subtitle }: { variant?: string; subtitle?: string }) => (
    <footer data-testid="footer">
      <p>Íslenskubraut — Kvennaskólinn í Reykjavík</p>
      {subtitle && <p>{subtitle}</p>}
    </footer>
  ),
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>{children}</div>
  ),
}));

// Mock the DownloadButton to avoid fetch calls in tests
vi.mock('../components/DownloadButton', () => ({
  DownloadButton: ({ categoryId, level }: { categoryId: string; level: string }) => (
    <button data-testid="download-button">
      Hlaða niður PDF ({categoryId}, {level})
    </button>
  ),
}));

/**
 * Helper to render a component inside MemoryRouter at a given path.
 */
function renderWithRouter(ui: React.ReactElement, initialEntries: string[] = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Home page tests
// ---------------------------------------------------------------------------
describe('Islenskubraut Home page', () => {
  it('renders all 6 category cards', () => {
    renderWithRouter(<Home />);

    expect(categories).toHaveLength(6);
    for (const category of categories) {
      expect(screen.getByText(category.name)).toBeDefined();
    }
  });

  it('renders the Dyr category card', () => {
    renderWithRouter(<Home />);

    expect(screen.getByText('Dýr')).toBeDefined();
    expect(screen.getByText('Orðaforði um dýr — gæludýr, villt dýr og húsdýr')).toBeDefined();
  });

  it('renders the Matur og drykkur category card', () => {
    renderWithRouter(<Home />);

    expect(screen.getByText('Matur og drykkur')).toBeDefined();
  });

  it('renders the Farartaeki category card', () => {
    renderWithRouter(<Home />);

    expect(screen.getByText('Farartæki')).toBeDefined();
  });

  it('renders the Manneskja category card', () => {
    renderWithRouter(<Home />);

    expect(screen.getByText('Manneskja')).toBeDefined();
  });

  it('renders the Stadir og byggingar category card', () => {
    renderWithRouter(<Home />);

    expect(screen.getByText('Staðir og byggingar')).toBeDefined();
  });

  it('renders the Fot og klaednadur category card', () => {
    renderWithRouter(<Home />);

    expect(screen.getByText('Föt og klæðnaður')).toBeDefined();
  });

  it('renders the hero heading', () => {
    renderWithRouter(<Home />);

    expect(screen.getByText('Kennsluspjöld fyrir íslenskukennslu')).toBeDefined();
  });

  it('renders the how-it-works section', () => {
    renderWithRouter(<Home />);

    expect(screen.getByText('Veldu flokk')).toBeDefined();
    expect(screen.getByText('Veldu stig')).toBeDefined();
    expect(screen.getByText('Hladdu niður')).toBeDefined();
  });

  it('renders category icons', () => {
    renderWithRouter(<Home />);

    for (const category of categories) {
      expect(screen.getByText(category.icon)).toBeDefined();
    }
  });

  it('category cards link to correct spjald paths', () => {
    renderWithRouter(<Home />);

    for (const category of categories) {
      const link = screen.getByText(category.name).closest('a');
      expect(link).toBeDefined();
      expect(link?.getAttribute('href')).toBe(`/spjald/${category.id}`);
    }
  });

  it('renders "Skoda spjald" text on every category card', () => {
    renderWithRouter(<Home />);

    const viewLinks = screen.getAllByText('Skoða spjald');
    expect(viewLinks).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// Category data integrity tests
// ---------------------------------------------------------------------------
describe('Category data', () => {
  it('each category has a unique id', () => {
    const ids = categories.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each category has a non-empty name', () => {
    for (const category of categories) {
      expect(category.name.length).toBeGreaterThan(0);
    }
  });

  it('each category has a color string', () => {
    for (const category of categories) {
      expect(category.color).toBeDefined();
      expect(category.color.startsWith('#')).toBe(true);
    }
  });

  it('getCategoryById returns correct category', () => {
    const dyr = getCategoryById('dyr');
    expect(dyr).toBeDefined();
    expect(dyr?.name).toBe('Dýr');
  });

  it('getCategoryById returns undefined for unknown id', () => {
    const unknown = getCategoryById('nonexistent');
    expect(unknown).toBeUndefined();
  });

  it('each category has sentence frames for A1, A2, and B1', () => {
    for (const category of categories) {
      const levels = category.sentenceFrames.map((sf) => sf.level);
      expect(levels).toContain('A1');
      expect(levels).toContain('A2');
      expect(levels).toContain('B1');
    }
  });

  it('each category has guiding questions', () => {
    for (const category of categories) {
      expect(category.guidingQuestions.length).toBeGreaterThan(0);
    }
  });

  it('each category has sub-categories', () => {
    for (const category of categories) {
      expect(category.subCategories.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// SpjaldPage tests
// ---------------------------------------------------------------------------
describe('SpjaldPage', () => {
  it('renders not-found message for unknown category via App', () => {
    renderWithRouter(<App />, ['/spjald/nonexistent']);

    expect(screen.getByText('Flokkur fannst ekki')).toBeDefined();
  });

  it('renders Dyr category content via App', () => {
    renderWithRouter(<App />, ['/spjald/dyr']);

    // "Dýr" appears in the page header and in the SpurningaSpjald preview
    const matches = screen.getAllByText('Dýr');
    expect(matches.length).toBeGreaterThanOrEqual(1);
    // Level selector should be present
    expect(screen.getByText('Veldu erfiðleikastig')).toBeDefined();
    // Tabs should be present ("Spurningaspjald" appears in both the tab and the card heading)
    expect(screen.getAllByText('Spurningaspjald').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Orðaforði')).toBeDefined();
    expect(screen.getByText('Setningarammar')).toBeDefined();
  });

  it('renders Matur category content via App', () => {
    renderWithRouter(<App />, ['/spjald/matur']);

    // "Matur og drykkur" appears in both the page header and the card preview
    const matches = screen.getAllByText('Matur og drykkur');
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Veldu erfiðleikastig')).toBeDefined();
  });

  it('renders level selector buttons A1, A2, B1', () => {
    renderWithRouter(<App />, ['/spjald/dyr']);

    // Level indicators appear in both the LevelSelector and the SpurningaSpjald badge
    expect(screen.getAllByText('A1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('A2').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('B1').length).toBeGreaterThanOrEqual(1);
  });

  it('renders level descriptions', () => {
    renderWithRouter(<App />, ['/spjald/dyr']);

    expect(screen.getByText('Byrjandi')).toBeDefined();
    expect(screen.getByText('Grunnþekking')).toBeDefined();
    expect(screen.getByText('Miðstig')).toBeDefined();
  });

  it('renders breadcrumb link back to all categories', () => {
    renderWithRouter(<App />, ['/spjald/dyr']);

    // "Allir flokkar" appears in both the header nav and the SpjaldPage breadcrumb
    const matches = screen.getAllByText('Allir flokkar');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders download button', () => {
    renderWithRouter(<App />, ['/spjald/dyr']);

    expect(screen.getByTestId('download-button')).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// App-level integration tests
// ---------------------------------------------------------------------------
describe('Islenskubraut App routing', () => {
  it('renders Home page at root path', () => {
    renderWithRouter(<App />, ['/']);

    expect(screen.getByText('Kennsluspjöld fyrir íslenskukennslu')).toBeDefined();
  });

  it('renders the app header with title', () => {
    renderWithRouter(<App />, ['/']);

    expect(screen.getByText('Íslenskubraut')).toBeDefined();
    expect(screen.getByText('Kennsluspjöld')).toBeDefined();
  });

  it('renders the footer', () => {
    renderWithRouter(<App />, ['/']);

    expect(
      screen.getByText('Íslenskubraut — Kvennaskólinn í Reykjavík')
    ).toBeDefined();
  });

  it('renders navigation links', () => {
    renderWithRouter(<App />, ['/']);

    expect(screen.getByText('Allir flokkar')).toBeDefined();
    expect(screen.getByText('Námsvefur Kvennó')).toBeDefined();
  });

  it('renders SpjaldPage for each category', () => {
    for (const category of categories) {
      const { unmount } = renderWithRouter(<App />, [`/spjald/${category.id}`]);

      // Category name appears in both the page header and in the card preview
      const matches = screen.getAllByText(category.name);
      expect(matches.length).toBeGreaterThanOrEqual(1);
      unmount();
    }
  });
});
