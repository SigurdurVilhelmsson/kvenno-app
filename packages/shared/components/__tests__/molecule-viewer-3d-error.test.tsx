import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// The probe only has to resolve; the viewer itself throws as Three.js does when the
// browser refuses a WebGL context (seen in Firefox on CI, docs/REVIEW-QUEUE.md D2).
vi.mock('three', () => ({}));
vi.mock('@react-three/fiber', () => ({}));
vi.mock('../MoleculeViewer3D/MoleculeViewer3D', () => ({
  MoleculeViewer3D: () => {
    throw new Error('Error creating WebGL context.');
  },
}));

import { ErrorBoundary } from '../ErrorBoundary';
import { MoleculeViewer3DLazy } from '../MoleculeViewer3D/MoleculeViewer3DLazy';

const molecule = { id: 'h2o', formula: 'H₂O', atoms: [{ id: 'o', symbol: 'O' }], bonds: [] };

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MoleculeViewer3DLazy when the browser cannot draw 3D', () => {
  it('shows the failure in its own panel and leaves the rest of the game standing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      // The game's own boundary, as every 3D game wraps its App.
      <ErrorBoundary>
        <p>Restin af leiknum</p>
        <MoleculeViewer3DLazy molecule={molecule} />
      </ErrorBoundary>
    );

    // findBy/getBy throw when the text is missing, so each line below is an assertion.
    await screen.findByText('Þrívíddarsýn er ekki tiltæk');
    screen.getByText('Þessi vafri getur ekki birt þrívíddarsýn á þessari tölvu.');
    screen.getByText('Restin af leiknum');
    expect(screen.queryByText(/Villa kom upp/)).toBeNull();
  });
});
