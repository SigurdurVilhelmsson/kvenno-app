// @vitest-environment jsdom
import { render, fireEvent, cleanup, within } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import { StatePathComparison } from '../components/StatePathComparison';

/**
 * The state-function panel under every Level 1 challenge printed its ΔH values with a
 * decimal point (`ΔH = -393.5 kJ`, "…er heildarorkubreytingin sú sama: -393.5 kJ") and
 * called enthalpy `Entalpí`, where the glossary's word is `vermi`.
 */

afterEach(cleanup);

describe('StatePathComparison text', () => {
  it.each(['Myndun CO₂', 'Myndun H₂O', 'Myndun NH₃'])('%s prints decimal commas', (title) => {
    const view = render(<StatePathComparison />);
    fireEvent.click(within(view.container).getByRole('button', { name: title }));
    const text = view.container.textContent ?? '';
    expect(text).not.toMatch(/\d\.\d/);
  });

  it('names enthalpy vermi', () => {
    const view = render(<StatePathComparison />);
    const text = view.container.textContent ?? '';
    expect(text).toContain('Vermi (kJ)');
    expect(text).toContain('Vermi (H) er ástandsfall');
    expect(text).toContain('ΔH = -393,5 kJ');
  });
});
