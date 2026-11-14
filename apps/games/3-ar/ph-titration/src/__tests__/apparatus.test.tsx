// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { phCharacter } from '../components/BenchReadings';
import { TitrationApparatus } from '../components/TitrationApparatus';

/**
 * Stig 2's bench. Until 2026-11-14 the burette's scale read 60 at the top and
 * its liquid rose as titrant was delivered, and the flask stood beside it.
 */
afterEach(cleanup);

const draw = (volumeAdded: number) =>
  render(
    <TitrationApparatus
      volumeAdded={volumeAdded}
      volumeAnalyte={25}
      pH={3}
      selectedIndicator={null}
    />
  ).container;

const labelY = (svg: Element, text: string) =>
  Number([...svg.querySelectorAll('text')].find((t) => t.textContent === text)!.getAttribute('y'));

/** The top of the titrant column: the meniscus. */
const meniscusY = (svg: Element) =>
  Number(svg.querySelector('rect[fill="#bfdbfe"]')!.getAttribute('y'));

describe('the burette', () => {
  it('reads 0 mL at the top and 60 mL at the bottom', () => {
    const svg = draw(0);
    expect(labelY(svg, '0')).toBeLessThan(labelY(svg, '30'));
    expect(labelY(svg, '30')).toBeLessThan(labelY(svg, '60'));
  });

  it('drains as titrant is delivered, its meniscus on the reading', () => {
    const full = draw(0);
    const atZero = meniscusY(full);
    expect(Math.abs(atZero - (labelY(full, '0') - 5))).toBeLessThan(0.01);
    cleanup();
    const after = draw(30);
    expect(meniscusY(after)).toBeGreaterThan(atZero);
    expect(Math.abs(meniscusY(after) - (labelY(after, '30') - 5))).toBeLessThan(0.01);
  });

  it('stands above the flask, its tip in the neck', () => {
    const svg = draw(10);
    const flask = svg.querySelector('path[stroke-width="2"]')!.getAttribute('d')!;
    const neckTop = Number(flask.split(' ')[2]);
    const tip = svg.querySelector('path[fill="#bfdbfe"]')!.getAttribute('d')!;
    const tipEnd = Math.max(
      ...tip
        .match(/[\d.]+/g)!
        .map(Number)
        .filter((_, i) => i % 2 === 1)
    );
    expect(tipEnd).toBeGreaterThan(neckTop);
  });
});

describe('phCharacter', () => {
  it('agrees with the pH printed to two decimals', () => {
    expect(phCharacter(6.996)).toBe('Hlutlaus');
    expect(phCharacter(6.99)).toBe('Súr');
    expect(phCharacter(7.01)).toBe('Basísk');
    expect(phCharacter(6.6)).toBe('Súr');
  });
});
