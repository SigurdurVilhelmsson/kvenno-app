import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// drei's Html portals into the three.js canvas; here it only has to pass its children through.
vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: ReactNode }) => <div data-testid="drei-html">{children}</div>,
  OrbitControls: () => null,
  Text: () => null,
}));
vi.mock('@react-three/fiber', () => ({
  Canvas: () => null,
  useFrame: () => {},
  useThree: () => ({}),
}));

import { LoadingFallback } from '../MoleculeViewer3D/MoleculeViewer3D';

describe('MoleculeViewer3D loading fallback', () => {
  it('keeps "Sæki þrívíddarsýn…" on one centred line inside drei’s zero-width Html box', () => {
    render(<LoadingFallback />);
    const text = screen.getByText('Sæki þrívíddarsýn…');
    expect(text.className).toContain('whitespace-nowrap');
    expect(text.className).toContain('text-center');
  });
});
