// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

import { App } from '../App';
import { tracks } from '../config/tracks';
import { ChemistryHub } from '../pages/ChemistryHub';
import { Home } from '../pages/Home';
import { YearHub } from '../pages/YearHub';

// Mock the shared components to avoid complex dependency chains
vi.mock('@kvenno/shared/components', () => ({
  Header: () => <header data-testid="header">Námsvefur Kvennó</header>,
  Footer: () => <footer data-testid="footer">Footer</footer>,
  Breadcrumbs: ({ items }: { items: { label: string; href?: string }[] }) => (
    <nav data-testid="breadcrumbs">
      {items.map((item, i) => (
        <span key={i}>{item.label}</span>
      ))}
    </nav>
  ),
  Card: ({ children, className, ...props }: Record<string, unknown>) => (
    <div data-testid="card" className={className as string} {...props}>{children as React.ReactNode}</div>
  ),
  Button: ({ children, href, as, className, ...props }: Record<string, unknown>) => {
    const Tag = as === 'a' ? 'a' : 'button';
    return <Tag href={href as string} className={className as string} {...props}>{children as React.ReactNode}</Tag>;
  },
  Badge: ({ children }: { children: React.ReactNode }) => <span data-testid="badge">{children}</span>,
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>{children}</div>
  ),
  PageBackground: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="page-background" className={className}>{children}</div>
  ),
  SkipLink: () => <a href="#main-content" className="skip-link">Fara beint í efni</a>,
  BottomNav: () => <nav data-testid="bottom-nav" />,
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
describe('Home page', () => {
  it('renders track cards for all configured tracks', () => {
    renderWithRouter(<Home />);

    for (const track of tracks) {
      expect(screen.getByText(track.title)).toBeDefined();
    }
  });

  it('renders the Efnafraedi track card', () => {
    renderWithRouter(<Home />);

    expect(screen.getByText('Efnafræði')).toBeDefined();
    expect(screen.getByText('Gagnvirk verkfæri fyrir efnafræðikennslu')).toBeDefined();
  });

  it('renders the Islenskubraut track card', () => {
    renderWithRouter(<Home />);

    expect(screen.getByText('Íslenskubraut')).toBeDefined();
    expect(
      screen.getByText('Kennsluspjöld og verkfæri fyrir íslensku sem annað tungumál')
    ).toBeDefined();
  });

  it('renders the welcome heading', () => {
    renderWithRouter(<Home />);

    expect(screen.getByText('Velkomin á Námsvef Kvennó')).toBeDefined();
  });

  it('links Efnafraedi track to /efnafraedi via React Router Link', () => {
    renderWithRouter(<Home />);

    // Efnafraedi is not external, so it uses <Link> which renders as <a>
    const efnafraediLink = screen.getByText('Efnafræði').closest('a');
    expect(efnafraediLink).toBeDefined();
    expect(efnafraediLink?.getAttribute('href')).toBe('/efnafraedi');
  });

  it('links Islenskubraut track to /islenskubraut/ via external <a> tag', () => {
    renderWithRouter(<Home />);

    // Islenskubraut is external, so it renders as a plain <a> with href
    const islenskubrautLink = screen.getByText('Íslenskubraut').closest('a');
    expect(islenskubrautLink).toBeDefined();
    expect(islenskubrautLink?.getAttribute('href')).toBe('/islenskubraut/');
  });

  it('renders track icons', () => {
    renderWithRouter(<Home />);

    for (const track of tracks) {
      expect(screen.getByText(track.icon)).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// ChemistryHub tests
// ---------------------------------------------------------------------------
describe('ChemistryHub page', () => {
  it('renders the Efnafraedi heading', () => {
    renderWithRouter(<ChemistryHub />);

    // "Efnafræði" appears in the breadcrumb and the main heading
    const headings = screen.getAllByText('Efnafræði');
    expect(headings.length).toBeGreaterThanOrEqual(1);
    // Verify the h1 heading specifically
    const h1 = headings.find((el) => el.tagName === 'H1');
    expect(h1).toBeDefined();
  });

  it('renders year tiles for 1. ar, 2. ar, 3. ar', () => {
    renderWithRouter(<ChemistryHub />);

    expect(screen.getByText('1. ár')).toBeDefined();
    expect(screen.getByText('2. ár')).toBeDefined();
    expect(screen.getByText('3. ár')).toBeDefined();
  });

  it('renders Valgreinar and F-bekkir tiles', () => {
    renderWithRouter(<ChemistryHub />);

    expect(screen.getByText('Valgreinar')).toBeDefined();
    expect(screen.getByText('F-bekkir')).toBeDefined();
  });

  it('links year tiles to correct paths', () => {
    renderWithRouter(<ChemistryHub />);

    const year1Link = screen.getByText('1. ár').closest('a');
    expect(year1Link?.getAttribute('href')).toBe('/efnafraedi/1-ar');

    const year2Link = screen.getByText('2. ár').closest('a');
    expect(year2Link?.getAttribute('href')).toBe('/efnafraedi/2-ar');

    const year3Link = screen.getByText('3. ár').closest('a');
    expect(year3Link?.getAttribute('href')).toBe('/efnafraedi/3-ar');
  });

  it('links Valgreinar and F-bekkir to correct paths', () => {
    renderWithRouter(<ChemistryHub />);

    const valLink = screen.getByText('Valgreinar').closest('a');
    expect(valLink?.getAttribute('href')).toBe('/efnafraedi/val');

    const fBekkLink = screen.getByText('F-bekkir').closest('a');
    expect(fBekkLink?.getAttribute('href')).toBe('/efnafraedi/f-bekkir');
  });

  it('renders year descriptions', () => {
    renderWithRouter(<ChemistryHub />);

    expect(screen.getByText('Verkfæri fyrir fyrsta árs efnafræði')).toBeDefined();
    expect(screen.getByText('Verkfæri fyrir annað árs efnafræði')).toBeDefined();
    expect(screen.getByText('Verkfæri fyrir þriðja árs efnafræði')).toBeDefined();
  });

  it('renders the back link to homepage', () => {
    renderWithRouter(<ChemistryHub />);

    const backLink = screen.getByLabelText('Fara til baka á heimasíðu');
    expect(backLink).toBeDefined();
    expect(backLink.getAttribute('href')).toBe('/');
  });

  it('renders breadcrumbs with Heim and Efnafraedi', () => {
    renderWithRouter(<ChemistryHub />);

    const breadcrumbs = screen.getByTestId('breadcrumbs');
    expect(breadcrumbs.textContent).toContain('Heim');
    expect(breadcrumbs.textContent).toContain('Efnafræði');
  });
});

// ---------------------------------------------------------------------------
// YearHub tests
// ---------------------------------------------------------------------------
describe('YearHub page', () => {
  it('renders 1. ar year hub with correct title', () => {
    renderWithRouter(<YearHub year="1-ar" />);

    expect(screen.getByText('1. árs efnafræði')).toBeDefined();
  });

  it('renders 2. ar year hub with Tilraunaskyrslur tool card', () => {
    renderWithRouter(<YearHub year="2-ar" />);

    expect(screen.getByText('Tilraunaskýrslur')).toBeDefined();
  });

  it('renders 3. ar year hub with tool cards', () => {
    renderWithRouter(<YearHub year="3-ar" />);

    expect(screen.getByText('3. árs efnafræði')).toBeDefined();
    expect(screen.getByText('Tilraunaskýrslur')).toBeDefined();
  });

  it('renders empty state for val year', () => {
    renderWithRouter(<YearHub year="val" />);

    expect(screen.getByText('Valgreinar í efnafræði')).toBeDefined();
    expect(screen.getByText('Væntanlegt')).toBeDefined();
  });

  it('renders empty state for f-bekkir year', () => {
    renderWithRouter(<YearHub year="f-bekkir" />);

    expect(screen.getByText('Efnafræði fyrir félags- og hugvísindabraut')).toBeDefined();
    expect(screen.getByText('Væntanlegt')).toBeDefined();
  });

  it('renders coming soon tools with disabled styling', () => {
    renderWithRouter(<YearHub year="1-ar" />);

    // "Reiknitæki" is a coming-soon tool in year 1
    expect(screen.getByText('Reiknitæki')).toBeDefined();
    // The parent article should be aria-disabled
    const article = screen.getByText('Reiknitæki').closest('[role="article"]');
    expect(article?.getAttribute('aria-disabled')).toBe('true');
  });

  it('renders breadcrumbs with Heim, Efnafraedi, and year label', () => {
    renderWithRouter(<YearHub year="2-ar" />);

    const breadcrumbs = screen.getByTestId('breadcrumbs');
    expect(breadcrumbs.textContent).toContain('Heim');
    expect(breadcrumbs.textContent).toContain('Efnafræði');
    expect(breadcrumbs.textContent).toContain('2. ár');
  });

  it('renders back link to /efnafraedi', () => {
    renderWithRouter(<YearHub year="1-ar" />);

    const backLink = screen.getByLabelText('Fara til baka í efnafræði');
    expect(backLink).toBeDefined();
    expect(backLink.getAttribute('href')).toBe('/efnafraedi');
  });
});

// ---------------------------------------------------------------------------
// App router integration tests
// ---------------------------------------------------------------------------
describe('App routing', () => {
  it('renders Home page at root path', () => {
    renderWithRouter(<App />, ['/']);

    expect(screen.getByText('Velkomin á Námsvef Kvennó')).toBeDefined();
  });

  it('renders ChemistryHub at /efnafraedi', () => {
    renderWithRouter(<App />, ['/efnafraedi']);

    // "Efnafræði" appears in both the breadcrumb and the main heading
    const matches = screen.getAllByText('Efnafræði');
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText('Safn af gagnvirkum verkfærum fyrir efnafræðikennslu við Kvennaskólann í Reykjavík. Veldu áfanga hér að neðan til að skoða tiltæk verkfæri.')
    ).toBeDefined();
  });

  it('renders YearHub for 1-ar at /efnafraedi/1-ar', () => {
    renderWithRouter(<App />, ['/efnafraedi/1-ar']);

    expect(screen.getByText('1. árs efnafræði')).toBeDefined();
  });

  it('renders YearHub for 2-ar at /efnafraedi/2-ar', () => {
    renderWithRouter(<App />, ['/efnafraedi/2-ar']);

    expect(screen.getByText('2. árs efnafræði')).toBeDefined();
  });

  it('renders YearHub for 3-ar at /efnafraedi/3-ar', () => {
    renderWithRouter(<App />, ['/efnafraedi/3-ar']);

    expect(screen.getByText('3. árs efnafræði')).toBeDefined();
  });

  it('renders the shared Header and Footer on all routes', () => {
    renderWithRouter(<App />, ['/']);

    expect(screen.getByTestId('header')).toBeDefined();
    expect(screen.getByTestId('footer')).toBeDefined();
  });
});
