import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Breadcrumbs, type BreadcrumbItem } from '../Breadcrumbs';

describe('Breadcrumbs', () => {
  it('renders all items', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Heim', href: '/' },
      { label: 'Efnafræði', href: '/efnafraedi/' },
      { label: '1. ár' },
    ];

    render(<Breadcrumbs items={items} />);

    expect(screen.getByText('Heim')).toBeDefined();
    expect(screen.getByText('Efnafræði')).toBeDefined();
    expect(screen.getByText('1. ár')).toBeDefined();
  });

  it('renders linked items as anchor elements', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Heim', href: '/' },
      { label: 'Efnafræði' },
    ];

    render(<Breadcrumbs items={items} />);

    const link = screen.getByRole('link', { name: 'Heim' });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/');
  });

  it('renders last item without href as non-link text', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Heim', href: '/' },
      { label: 'Núverandi síða' },
    ];

    render(<Breadcrumbs items={items} />);

    const currentPage = screen.getByText('Núverandi síða');
    expect(currentPage.tagName).toBe('SPAN');
    expect(currentPage.getAttribute('aria-current')).toBe('page');
  });

  it('has aria-label for navigation landmark', () => {
    const items: BreadcrumbItem[] = [{ label: 'Heim', href: '/' }];

    render(<Breadcrumbs items={items} />);

    const nav = screen.getByRole('navigation', { name: /Brauðmolar/i });
    expect(nav).toBeDefined();
  });

  it('renders chevron separators between items', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Heim', href: '/' },
      { label: 'Efnafræði', href: '/efnafraedi/' },
      { label: '1. ár' },
    ];

    const { container } = render(<Breadcrumbs items={items} />);

    // Lucide ChevronRight renders as SVG elements
    const svgs = container.querySelectorAll('svg');
    // Two separators for three items
    expect(svgs.length).toBe(2);
  });

  it('renders single item without separator', () => {
    const items: BreadcrumbItem[] = [{ label: 'Heim' }];

    const { container } = render(<Breadcrumbs items={items} />);

    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(0);
  });
});
