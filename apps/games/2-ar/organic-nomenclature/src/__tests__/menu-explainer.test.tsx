// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import App from '../App';

/**
 * The menu explains a name before Stig 1 does, and it used to explain it differently: three
 * cards called the bond type the `Stofn` and the suffix a functional group, where Stig 1 teaches
 * that the suffix is the bond type (`-an`, `-en`, `-ýn`) and never mentions a stem (decisions
 * item 90). The cards now name the two parts Stig 1 teaches, with Stig 1's meaning for each.
 */

afterEach(cleanup);

describe('the menu explainer', () => {
  it('matches Stig 1: forskeyti for the carbons, viðskeyti for the bonds, no stofn', () => {
    const { container } = render(<App />);
    const cards = [...container.querySelectorAll('[data-name-parts] > div')].map((card) =>
      [...card.children].map((c) => c.textContent)
    );
    expect(cards).toEqual([
      ['Forskeyti', 'Fjöldi kolefna'],
      ['Viðskeyti', 'Tegund tengja'],
    ]);
    expect(container.textContent).not.toMatch(/Stofn/);
  });
});
