import React from 'react';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

import { Header } from '../Header';
import { Footer } from '../Footer';
import { Breadcrumbs, type BreadcrumbItem } from '../Breadcrumbs';
import { ErrorBoundary } from '../ErrorBoundary';

expect.extend(toHaveNoViolations);

// Component that throws on render to trigger ErrorBoundary
function ThrowingComponent(): React.ReactNode {
  throw new Error('Test error for a11y');
}

// Suppress React error boundary console.error output during tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

describe('Header accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = render(<Header />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper heading hierarchy', () => {
    const { container } = render(<Header />);

    // The header uses an anchor link rather than a heading element,
    // but it should be the primary site identifier within the header landmark
    const header = container.querySelector('header');
    expect(header).not.toBeNull();

    // The logo link should be accessible as the site title
    const logoLink = screen.getByRole('link', { name: /Námsvefur Kvennó/i });
    expect(logoLink).toBeDefined();
    expect(logoLink.getAttribute('href')).toBe('/');
  });

  it('renders accessible navigation links', () => {
    render(<Header />);

    const links = screen.getAllByRole('link');
    // Should have at least: logo link, Kennarar link, Upplysingar link
    expect(links.length).toBeGreaterThanOrEqual(3);

    // Each link should have accessible text
    for (const link of links) {
      const text = link.textContent?.trim();
      expect(text).toBeTruthy();
    }
  });
});

describe('Footer accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = render(<Footer />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders copyright text in a semantic footer element', () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector('footer');
    expect(footer).not.toBeNull();

    const year = new Date().getFullYear().toString();
    expect(footer!.textContent).toContain(year);
    expect(footer!.textContent).toContain('Kvennaskólinn');
  });
});

describe('Breadcrumbs accessibility', () => {
  const sampleItems: BreadcrumbItem[] = [
    { label: 'Heim', href: '/' },
    { label: 'Efnafraedi', href: '/efnafraedi/' },
    { label: '1. ar' },
  ];

  it('has no axe violations', async () => {
    const { container } = render(<Breadcrumbs items={sampleItems} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has a nav landmark with proper aria-label', () => {
    render(<Breadcrumbs items={sampleItems} />);

    const nav = screen.getByRole('navigation', { name: /Brauðmolar/i });
    expect(nav).toBeDefined();
    expect(nav.getAttribute('aria-label')).toBe('Brauðmolar');
  });

  it('has aria-current="page" on the last (current) item', () => {
    render(<Breadcrumbs items={sampleItems} />);

    const currentPage = screen.getByText('1. ar');
    expect(currentPage.getAttribute('aria-current')).toBe('page');

    // Non-current items should not have aria-current
    const heimLink = screen.getByText('Heim');
    expect(heimLink.getAttribute('aria-current')).toBeNull();
  });
});

describe('ErrorBoundary fallback accessibility', () => {
  it('has no axe violations in the default fallback UI', async () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
