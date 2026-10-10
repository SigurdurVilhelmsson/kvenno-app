// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

import { App } from '../App';
import { categories, getCategoryById } from '../data';
import { Home } from '../pages/Home';

// Mock shared components to avoid pulling in heavy dependency chains (react-three/fiber)
vi.mock('@kvenno/shared/components', () => ({
  Header: ({ title, activeTrack }: { title?: string; activeTrack?: string }) => (
    <header data-testid="header">
      <a href="/">{title || 'Námsvefur Kvennó'}</a>
      {activeTrack && <span data-testid="active-track">{activeTrack}</span>}
      <nav>
        <a href="/islenskubraut/">Allir flokkar</a>
      </nav>
    </header>
  ),
  Footer: ({ department, subtitle }: { department?: string; subtitle?: string }) => (
    <footer data-testid="footer">
      <p>
        {department ? `${department} — Kvennaskólinn í Reykjavík` : 'Kvennaskólinn í Reykjavík'}
      </p>
      {subtitle && <p>{subtitle}</p>}
    </footer>
  ),
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  BottomNav: () => <nav data-testid="bottom-nav" />,
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
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
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

  it('shows the example from the content on the card, and the teacher note beside it', () => {
    renderWithRouter(<App />, ['/spjald/klaednadur']);
    fireEvent.click(screen.getByRole('tab', { name: 'Setningarammar' }));

    const card = screen.getByTestId('spjald-bakhlid');
    expect(card.textContent).toContain('Þetta er úlpa. Hún er blá.');
    // The note is for the teacher, so it sits outside the card a student would print.
    const note = screen.getByText(/Fornafnið fer eftir kyni orðsins/);
    expect(card.contains(note)).toBe(false);
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
// Level and tab state: what a screen reader hears, and what the URL keeps
// ---------------------------------------------------------------------------
function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname + location.search}</output>;
}

function renderPage(entry: string) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <App />
      <LocationProbe />
    </MemoryRouter>
  );
}

// A level button's name is its label and its description, e.g. "A1 Byrjandi".
const levelButton = (level: string) =>
  within(screen.getByRole('group', { name: 'Veldu erfiðleikastig' })).getByRole('button', {
    name: new RegExp(`^${level}`),
  });

describe('SpjaldPage level and tabs', () => {
  it('marks the chosen level as pressed, and only that one', () => {
    renderPage('/spjald/dyr');
    expect(levelButton('A1').getAttribute('aria-pressed')).toBe('true');
    expect(levelButton('A2').getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(levelButton('B1'));
    expect(levelButton('B1').getAttribute('aria-pressed')).toBe('true');
    expect(levelButton('A1').getAttribute('aria-pressed')).toBe('false');
  });

  it('opens at the level the URL names, so a card can be bookmarked', () => {
    renderPage('/spjald/dyr?stig=B1');
    expect(levelButton('B1').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByTestId('download-button').textContent).toContain('dyr, B1');
  });

  it('writes the chosen level into the URL', () => {
    renderPage('/spjald/matur');
    fireEvent.click(levelButton('A2'));
    expect(screen.getByTestId('location').textContent).toBe('/spjald/matur?stig=A2');
  });

  it('falls back to A1 for a level that does not exist', () => {
    renderPage('/spjald/dyr?stig=C2');
    expect(levelButton('A1').getAttribute('aria-pressed')).toBe('true');
  });

  it('exposes the three views as tabs controlling one panel', () => {
    renderPage('/spjald/dyr');
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual([
      'Spurningaspjald',
      'Orðaforði',
      'Setningarammar',
    ]);
    expect(tabs.map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    // Only the selected tab is in the Tab order; the arrow keys reach the others.
    expect(tabs.map((t) => t.tabIndex)).toEqual([0, -1, -1]);
    const panel = screen.getByRole('tabpanel');
    expect(panel.getAttribute('aria-labelledby')).toBe(tabs[0].id);
    expect(tabs[0].getAttribute('aria-controls')).toBe(panel.id);
  });

  it('moves between tabs with the arrow keys, Home and End', () => {
    renderPage('/spjald/dyr');
    const tab = (name: string) => screen.getByRole('tab', { name });
    tab('Spurningaspjald').focus();
    fireEvent.keyDown(tab('Spurningaspjald'), { key: 'ArrowRight' });
    expect(tab('Orðaforði').getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tab('Orðaforði'));
    fireEvent.keyDown(tab('Orðaforði'), { key: 'End' });
    expect(tab('Setningarammar').getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(tab('Setningarammar'), { key: 'ArrowRight' });
    expect(tab('Spurningaspjald').getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(tab('Spurningaspjald'), { key: 'ArrowLeft' });
    expect(tab('Setningarammar').getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(tab('Setningarammar'), { key: 'Home' });
    expect(tab('Spurningaspjald').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe(
      tab('Spurningaspjald').id
    );
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

    expect(screen.getByText('Námsvefur Kvennó')).toBeDefined();
    expect(screen.getByTestId('active-track')).toBeDefined();
  });

  it('renders the footer', () => {
    renderWithRouter(<App />, ['/']);

    expect(screen.getByText('Íslenskubraut — Kvennaskólinn í Reykjavík')).toBeDefined();
  });

  it('renders navigation links', () => {
    renderWithRouter(<App />, ['/']);

    expect(screen.getByText('Allir flokkar')).toBeDefined();
    expect(screen.getByRole('link', { name: /Námsvefur Kvennó/i })).toBeDefined();
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
