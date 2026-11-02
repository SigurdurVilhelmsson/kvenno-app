// @vitest-environment jsdom
/**
 * Lab reports is paused until its rewrite (Siggi, 2026-11-02): both builds show only a page that
 * says so, with a way back to the year hub, and nothing that signs in or uploads.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Paused } from '../components/Paused';
import { LAB_REPORTS_PAUSED } from '../config/paused';

expect.extend(toHaveNoViolations);

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Lab reports while paused', () => {
  it('is paused', () => {
    expect(LAB_REPORTS_PAUSED).toBe(true);
  });

  it.each([
    ['/efnafraedi/2-ar/lab-reports/', '/efnafraedi/2-ar/'],
    ['/efnafraedi/3-ar/lab-reports/', '/efnafraedi/3-ar/'],
  ])('under %s says so and links back to %s', (basePath, back) => {
    vi.stubEnv('VITE_BASE_PATH', basePath);
    render(<Paused />);
    expect(screen.getByRole('heading', { level: 1, name: 'Tilraunarskýrslur' })).toBeDefined();
    expect(screen.getByText(/Verkfærið er í hléi/)).toBeDefined();
    expect(screen.getByRole('link', { name: 'Til baka' }).getAttribute('href')).toBe(back);
  });

  it('offers no sign-in and no upload', () => {
    vi.stubEnv('VITE_BASE_PATH', '/efnafraedi/2-ar/lab-reports/');
    const { container } = render(<Paused />);
    expect(container.querySelector('input, button[type="submit"]')).toBeNull();
    expect(screen.queryByText(/Skrá inn|Innskrá/i)).toBeNull();
  });

  it('has no accessibility violations', async () => {
    vi.stubEnv('VITE_BASE_PATH', '/efnafraedi/2-ar/lab-reports/');
    const { container } = render(<Paused />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('is what main.tsx renders, without starting sign-in', () => {
    const main = readFileSync(createRequire(import.meta.url).resolve('../main.tsx'), 'utf8');
    const pausedBranch = main.slice(
      main.indexOf('if (LAB_REPORTS_PAUSED)'),
      main.indexOf('} else {')
    );
    expect(pausedBranch).toContain('<Paused />');
    expect(pausedBranch).not.toMatch(/initializeMsal|MsalProvider/);
  });
});
