import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// drei's Html renders through a React root of its own, and taking it down threw
// "removeChild … not a child of this node" on every first 3D view (2026-10-25). The loading
// text is ordinary page content now, so rendering Html at all fails this test.
vi.mock('@react-three/drei', () => ({
  Html: () => {
    throw new Error('the loading text must not use drei Html');
  },
  OrbitControls: () => null,
  Text: () => null,
}));
// The canvas stands in as an empty element: nothing inside it renders, so the scene never
// reports itself drawn and the viewer stays in its loading state.
vi.mock('@react-three/fiber', () => ({
  Canvas: () => <canvas data-testid="r3f-canvas" />,
  useFrame: () => {},
  useThree: () => ({}),
}));

import { MoleculeViewer3D } from '../MoleculeViewer3D/MoleculeViewer3D';

const molecule = { id: 'h2o', formula: 'H₂O', atoms: [{ id: 'o', symbol: 'O' }], bonds: [] };

describe('MoleculeViewer3D loading text', () => {
  it('lies over the canvas, not inside it, while the scene is loading', () => {
    const { container } = render(<MoleculeViewer3D molecule={molecule} />);
    const viewer = container.querySelector('.molecule-viewer-3d')!;
    const text = screen.getByText('Sæki þrívíddarsýn…');

    expect(viewer.getAttribute('aria-busy')).toBe('true');
    expect(viewer.contains(text)).toBe(true);
    expect(screen.getByTestId('r3f-canvas').contains(text)).toBe(false);
    // The overlay is positioned against the viewer and lets a drag through to the canvas.
    expect(viewer.className).toContain('relative');
    const overlay = text.parentElement!;
    expect(overlay.className).toContain('absolute');
    expect(overlay.className).toContain('pointer-events-none');
  });

  it('keeps "Sæki þrívíddarsýn…" on one centred line', () => {
    render(<MoleculeViewer3D molecule={molecule} />);
    const text = screen.getByText('Sæki þrívíddarsýn…');
    expect(text.className).toContain('whitespace-nowrap');
    expect(text.className).toContain('text-center');
  });
});
