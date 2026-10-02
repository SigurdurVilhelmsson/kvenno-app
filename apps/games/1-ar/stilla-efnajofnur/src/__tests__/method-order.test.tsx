// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { LEVEL1_CONFIG } from '../components/levelConfigs';
import { REACTIONS } from '../data/reactions';

/**
 * The Stig 1 intro's method and the Stig 2 hints must not teach opposite orders.
 *
 * The intro listed a fixed order, metals, then other non-metals, then súrefni, then vetni,
 * while reaction 8's hint said `stilltu súrefni síðast`, as the book does (ch04/m68709:
 * "Stilltu súrefni síðast, þar sem það er til staðar í fleiri en einni sameind"). The intro
 * now teaches the book's principle instead (decisions item 48, option c): elements in one
 * substance per side first, those in several substances, usually súrefni and vetni, last.
 */

afterEach(cleanup);

function methodSteps(): string[] {
  const { container } = render(<>{LEVEL1_CONFIG.intro}</>);
  const heading = [...container.querySelectorAll('h3')].find(
    (h) => h.textContent === 'Aðferð til að stilla'
  );
  const list = heading?.parentElement?.querySelector('ol');
  return [...(list?.querySelectorAll('li') ?? [])].map((li) => li.textContent ?? '');
}

describe('the Stig 1 balancing method', () => {
  it('starts with elements found in one substance per side', () => {
    const steps = methodSteps();
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps[0]).toMatch(/aðeins einu efni/);
  });

  it('leaves súrefni for the end, never before vetni', () => {
    const steps = methodSteps();
    const oxygen = steps.findIndex((s) => /súrefni/.test(s));
    expect(oxygen).toBeGreaterThan(0);
    // No step teaches vetni after a step that already settled súrefni.
    const hydrogenOnly = steps.findIndex((s) => /vetni/.test(s) && !/súrefni/.test(s));
    expect(hydrogenOnly === -1 || hydrogenOnly < oxygen).toBe(true);
  });

  it('agrees with every hint that says when to balance súrefni', () => {
    const lastHints = REACTIONS.filter((r) => /súrefni síðast/.test(r.hint));
    expect(lastHints.length).toBeGreaterThan(0);
    expect(methodSteps().join(' ')).toMatch(/fleiri en einu efni[^.]*\. Oftast eru það súrefni/);
  });
});
