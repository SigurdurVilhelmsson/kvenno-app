import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import { fontBoostFor } from '../AnimatedMolecule/AnimatedMolecule';
import { fitGraphSize, labelEvery } from '../InteractiveGraph/InteractiveGraph';
import { ParticleSimulation } from '../ParticleSimulation';

// The shared diagrams have to fit a 320–360 px phone without horizontal scroll and stay
// legible there, while drawing exactly as before on a desktop that has the room.

describe('InteractiveGraph sizing', () => {
  it('keeps the requested size whenever the container can hold it', () => {
    expect(fitGraphSize(500, 300, null)).toEqual({ width: 500, height: 300 });
    expect(fitGraphSize(500, 300, 762)).toEqual({ width: 500, height: 300 });
    // Exactly the requested width: unchanged, as the desktop titration curve is.
    expect(fitGraphSize(600, 300, 600)).toEqual({ width: 600, height: 300 });
  });

  it('shrinks into a phone-width container, border included, with a readable height', () => {
    const { width, height } = fitGraphSize(500, 300, 210);
    expect(width + 4).toBeLessThanOrEqual(210);
    // Scaling 300 by 206/500 would leave ~124 px; the floor keeps the axis usable.
    expect(height).toBe(260);
    // A graph requested shorter than the floor is never made taller than asked.
    expect(fitGraphSize(500, 200, 210).height).toBe(200);
  });

  it('thins tick labels only when neighbours would overlap', () => {
    // Desktop pH axis: 5 ticks across 410 px, labels ~14 px wide.
    expect(labelEvery(82, 22)).toBe(1);
    // Phone: 1200 K labels ~28 px wide, ticks 26 px apart -> every second label.
    expect(labelEvery(26, 36)).toBe(2);
    expect(labelEvery(0, 36)).toBe(1);
  });
});

describe('AnimatedMolecule label boost', () => {
  it('leaves a full-size drawing alone and compensates a shrunk one, capped', () => {
    expect(fontBoostFor(240, 240)).toBe(1);
    expect(fontBoostFor(0, 240)).toBe(1); // not yet measured
    expect(fontBoostFor(228, 240)).toBeCloseTo(240 / 228);
    expect(fontBoostFor(120, 240)).toBe(1.3);
  });
});

describe('ParticleSimulation', () => {
  const realGetContext = HTMLCanvasElement.prototype.getContext;
  afterEach(() => {
    cleanup();
    HTMLCanvasElement.prototype.getContext = realGetContext;
  });

  it('paints a paused simulation instead of leaving an empty box', () => {
    // jsdom has no canvas; record the drawing calls instead.
    const arcs: number[] = [];
    const ctx = new Proxy(
      {},
      {
        get: (_t, prop) => {
          if (prop === 'arc') return () => arcs.push(1);
          if (prop === 'createRadialGradient') return () => ({ addColorStop: () => {} });
          return () => {};
        },
        set: () => true,
      }
    );
    HTMLCanvasElement.prototype.getContext = (() => ctx) as never;

    render(
      <ParticleSimulation
        container={{ width: 150, height: 110 }}
        particleTypes={[{ id: 'gas', color: '#a78bfa' }]}
        particles={[{ typeId: 'gas', count: 12 }]}
        running={false}
      />
    );

    expect(arcs.length).toBeGreaterThanOrEqual(12);
  });

  it('scales down with its container while keeping its physics size', () => {
    HTMLCanvasElement.prototype.getContext = (() => null) as never;
    const { container } = render(
      <ParticleSimulation
        container={{ width: 300, height: 180 }}
        particleTypes={[{ id: 'gas', color: '#a78bfa' }]}
        particles={[{ typeId: 'gas', count: 1 }]}
        running={false}
      />
    );
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.style.width).toBe('300px');
    expect(canvas.style.maxWidth).toBe('100%');
    expect(canvas.style.height).toBe('auto');
  });
});
