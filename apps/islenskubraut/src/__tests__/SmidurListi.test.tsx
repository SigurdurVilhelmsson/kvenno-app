// @vitest-environment jsdom
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { render, screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { categories } from '../data';
import { SmidurListi } from '../pages/SmidurListi';

expect.extend(toHaveNoViolations);

vi.mock('@kvenno/shared/components', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const withBuilder = categories.filter((c) => c.builder?.some((b) => b.level === 'A1'));

describe('the list of sentence builders', () => {
  it('opens every category’s builder, drafts included, and says which are drafts', async () => {
    const { container } = render(
      <MemoryRouter>
        <SmidurListi />
      </MemoryRouter>
    );
    expect(withBuilder.length).toBe(6);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(withBuilder.length);
    withBuilder.forEach((category, i) => {
      const item = within(items[i]);
      expect(item.getByRole('heading').textContent).toBe(category.name);
      expect(
        item.getByRole('link', { name: `Opna setningasmið: ${category.name}` }).getAttribute('href')
      ).toBe(`/smidur/${category.id}`);
      const confirmed = category.builder!.find((b) => b.level === 'A1')!.confirmed;
      expect(items[i].textContent).toContain(confirmed ? 'staðfest' : 'drög');
    });
    expect(await axe(container)).toHaveNoViolations();
  });

  // The list shows drafts a teacher has not checked, so no page a student can reach may link
  // to it. Only the route itself names the bare path.
  it('is linked from nowhere', () => {
    const src = resolve(__dirname, '..');
    const files = (readdirSync(src, { recursive: true }) as string[]).filter(
      (f) => /\.tsx?$/.test(f) && !f.includes('__tests__')
    );
    const linking = files.filter((f) =>
      /["'`]\/smidur\/?["'`]/.test(readFileSync(join(src, f), 'utf8'))
    );
    expect(linking).toEqual(['App.tsx']);
    expect(readFileSync(join(src, 'App.tsx'), 'utf8')).toMatch(/<Route path="\/smidur" /);
  });
});
