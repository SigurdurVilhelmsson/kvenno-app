// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// ---------------------------------------------------------------------------
// Mock heavy sub-components used by SpjaldPage to keep tests focused on
// the structural a11y of the shell / layout.
// ---------------------------------------------------------------------------
vi.mock('../components/DownloadButton', () => ({
  DownloadButton: () => <button>Hala niður PDF</button>,
}));
vi.mock('../components/LevelSelector', () => ({
  LevelSelector: ({ selected, onChange }: { selected: string; onChange: (v: string) => void; color?: string }) => (
    <div role="radiogroup" aria-label="Erfiðleikastig">
      {['A1', 'A2', 'B1'].map((lvl) => (
        <button
          key={lvl}
          role="radio"
          aria-checked={selected === lvl}
          onClick={() => onChange(lvl)}
        >
          {lvl}
        </button>
      ))}
    </div>
  ),
}));
vi.mock('../components/SpjaldPreview', () => ({
  SpjaldPreview: () => <div data-testid="spjald-preview">Preview</div>,
}));
vi.mock('../components/SpurningaSpjald', () => ({
  SpurningaSpjald: () => <div data-testid="spurningaspjald">Spurningaspjald</div>,
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------
import { App } from '../App';
import { Home } from '../pages/Home';

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

describe('Islenskubraut - category grid accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = renderWithRouter(<Home />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('category cards have accessible names via link text', () => {
    renderWithRouter(<Home />);

    // Categories render as <Link> (anchor) elements wrapping card content.
    // Each should contain the category name as visible text.
    const links = screen.getAllByRole('link');
    const categoryLinks = links.filter((a) => a.getAttribute('href')?.startsWith('/spjald/'));

    expect(categoryLinks.length).toBeGreaterThan(0);

    for (const link of categoryLinks) {
      // The link must have an accessible name (text content)
      expect(link.textContent!.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('Islenskubraut - teaching card page accessibility', () => {
  it('has proper content structure (heading, navigation)', async () => {
    // Render SpjaldPage for the "dyr" category
    const { container } = renderWithRouter(<App />, ['/spjald/dyr']);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('Islenskubraut - ARIA landmarks', () => {
  it('uses proper header, main, and footer landmarks', () => {
    const { container } = renderWithRouter(<App />, ['/']);

    const header = container.querySelector('header');
    expect(header).not.toBeNull();

    const main = container.querySelector('main');
    expect(main).not.toBeNull();

    const footer = container.querySelector('footer');
    expect(footer).not.toBeNull();
  });
});
